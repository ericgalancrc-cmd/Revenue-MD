"""
EDI X12 837P (Professional) parser.

Handles the standard X12 005010X222A1 transaction set used by all
PR clearinghouses (Inmediata, etc.) and billing systems (Assertus,
Practice Fusion, etc.).

Key loops extracted:
  NM1*PR  → payer name / payer ID
  NM1*IL  → subscriber / patient
  NM1*1P  → rendering provider / NPI
  CLM     → claim ID, total charge
  REF*D9  → prior authorization number
  DTP*472 → date of service
  HI      → ICD-10 diagnosis codes
  SV1     → service line (CPT, modifiers, units, charge)
"""

from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from models import ParsedClaim, ServiceLine


def parse_837(content: str) -> List[ParsedClaim]:
    """Return a list of ParsedClaim objects from an EDI 837 string."""
    content = content.strip()
    if not content:
        raise ValueError("Empty file.")

    if len(content) < 107:
        raise ValueError("File too short to be a valid EDI 837.")

    # elem_sep is always at position 3 (ISA*...)
    elem_sep = content[3]

    # Split the ISA segment on elem_sep to find ISA16 (component separator).
    # ISA has exactly 17 elements (ISA + ISA01..ISA16).
    isa_parts = content.split(elem_sep, 16)
    if len(isa_parts) < 17:
        raise ValueError("ISA segment malformed — fewer than 16 elements.")

    # ISA16 is a 1-char component separator followed immediately by the seg terminator.
    isa16_and_term = isa_parts[16]
    comp_sep = isa16_and_term[0] if isa16_and_term else ":"
    seg_term = isa16_and_term[1] if len(isa16_and_term) > 1 else "~"

    segments = [s.strip() for s in content.split(seg_term) if s.strip()]

    claims: List[ParsedClaim] = []

    # Running context — resets or persists across loops as appropriate.
    payer_name = ""
    payer_id = ""
    patient_name = ""
    patient_id = ""
    npi = ""
    provider_name = ""

    # Per-claim accumulators
    claim_buf: Optional[dict] = None
    icd_buf: List[str] = []
    lines_buf: List[ServiceLine] = []
    pending_line: Optional[ServiceLine] = None

    def flush_line():
        nonlocal pending_line
        if pending_line:
            lines_buf.append(pending_line)
            pending_line = None

    def flush_claim():
        nonlocal claim_buf, icd_buf, lines_buf
        if claim_buf is None:
            return
        flush_line()
        claim_buf["icd"] = list(icd_buf)
        claim_buf["service_lines"] = list(lines_buf)
        claims.append(_build(claim_buf))
        claim_buf = None
        icd_buf = []
        lines_buf = []

    for seg in segments:
        elems = seg.split(elem_sep)
        sid = elems[0]

        # ── NM1 – name segments ──────────────────────────────────────────────
        if sid == "NM1" and len(elems) > 1:
            qual = elems[1]

            if qual == "PR":                          # Payer
                payer_name = _e(elems, 3)
                payer_id   = _e(elems, 9)

            elif qual in ("IL", "QC"):                # Subscriber / patient
                last  = _e(elems, 3)
                first = _e(elems, 4)
                patient_name = f"{first} {last}".strip()
                patient_id   = _e(elems, 9)

            elif qual in ("1P", "82", "DN"):          # Rendering / attending
                last  = _e(elems, 3)
                first = _e(elems, 4)
                provider_name = f"Dr. {last}" + (f", {first}" if first else "")
                if _e(elems, 8) == "XX":
                    npi = _e(elems, 9)

        # ── CLM – claim header ───────────────────────────────────────────────
        elif sid == "CLM":
            flush_claim()
            claim_buf = {
                "id":            _e(elems, 1) or f"CLM-{len(claims)+1}",
                "payer":         payer_name,
                "payer_id":      payer_id,
                "patient_name":  patient_name,
                "patient_id":    patient_id,
                "npi":           npi,
                "provider_name": provider_name,
                "dos":           "",
                "auth":          None,
                "total_charge":  _float(elems, 2),
            }

        # ── REF – reference IDs ──────────────────────────────────────────────
        elif sid == "REF" and claim_buf is not None:
            if _e(elems, 1) == "D9":                  # Prior authorization
                claim_buf["auth"] = _e(elems, 2) or None

        # ── DTP – dates ──────────────────────────────────────────────────────
        elif sid == "DTP" and claim_buf is not None:
            if _e(elems, 1) == "472":                  # Date of service
                claim_buf["dos"] = _fmt_date(_e(elems, 3))

        # ── HI – diagnoses ───────────────────────────────────────────────────
        elif sid == "HI" and claim_buf is not None:
            for elem in elems[1:]:
                if not elem:
                    continue
                if comp_sep in elem:
                    parts = elem.split(comp_sep)
                    code = parts[1] if len(parts) > 1 else ""
                else:
                    code = elem
                if code:
                    icd_buf.append(code)

        # ── SV1 – service line ───────────────────────────────────────────────
        elif sid == "SV1" and claim_buf is not None:
            flush_line()
            composite = _e(elems, 1)          # e.g. "HC:90837:GT" or "HC:H0004"
            parts     = composite.split(comp_sep) if comp_sep in composite else [composite]
            cpt       = parts[1] if len(parts) > 1 else parts[0]
            mods      = [p for p in parts[2:] if p]
            pending_line = ServiceLine(
                cpt      = cpt,
                modifier = mods,
                charge   = _float(elems, 2),
                units    = int(_float(elems, 4) or 1),
            )

        # ── LQ / HCP – modifiers appended to current line ───────────────────
        elif sid == "LQ" and pending_line is not None:
            mod = _e(elems, 2)
            if mod and mod not in pending_line.modifier:
                pending_line.modifier.append(mod)

    flush_claim()
    return claims


# ── helpers ──────────────────────────────────────────────────────────────────

def _e(elems: list, idx: int) -> str:
    return elems[idx].strip() if idx < len(elems) else ""


def _float(elems: list, idx: int) -> float:
    try:
        return float(_e(elems, idx))
    except (ValueError, TypeError):
        return 0.0


def _fmt_date(s: str) -> str:
    for fmt in ("%Y%m%d", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).strftime("%b %d, %Y")
        except ValueError:
            continue
    return s


def _build(d: dict) -> ParsedClaim:
    return ParsedClaim(**d)
