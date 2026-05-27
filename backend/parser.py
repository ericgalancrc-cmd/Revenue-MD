"""
EDI X12 837P (Professional) parser — v2.

Handles the standard X12 005010X222A1 transaction set used by all
PR clearinghouses (Inmediata, etc.) and billing systems (Assertus,
Practice Fusion, etc.).

Real-world robustness improvements over v1:
  - NM1 segments appearing *after* CLM (per 2310 loop spec) update the
    active claim_buf directly — the most common bug with real vendor files.
  - NM1*85 (billing provider) used as NPI fallback when rendering NPI absent.
  - Additional REF auth qualifiers: D9, G1, OB, F8, BP.
  - SV1 modifiers captured from both composite (HC:cpt:mod) and separate
    element positions (SV1-03 to SV1-06).
  - DTP*472 date ranges (YYYYMMDD-YYYYMMDD) extract the start date.
  - Multi-GS envelopes in one ISA file parse correctly.
  - HI codes with any qualifier prefix (ABK, ABF, BK, BF, …) extracted.
  - Duplicate ICD codes deduplicated within a claim.
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

    # ISA has exactly 16 fields — split to find ISA16 (component separator)
    isa_parts = content.split(elem_sep, 16)
    if len(isa_parts) < 17:
        raise ValueError("ISA segment malformed — fewer than 16 elements.")

    isa16_and_term = isa_parts[16]
    comp_sep = isa16_and_term[0] if isa16_and_term else ":"
    seg_term = isa16_and_term[1] if len(isa16_and_term) > 1 else "~"

    segments = [s.strip() for s in content.split(seg_term) if s.strip()]

    claims: List[ParsedClaim] = []

    # Running context — carries across loops until explicitly reset
    payer_name    = ""
    payer_id      = ""
    patient_name  = ""
    patient_id    = ""
    npi           = ""
    billing_npi   = ""
    provider_name = ""

    # Per-claim accumulators
    claim_buf:    Optional[dict]        = None
    icd_buf:      List[str]             = []
    lines_buf:    List[ServiceLine]     = []
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
        claim_buf["icd"]           = list(icd_buf)
        claim_buf["service_lines"] = list(lines_buf)
        claims.append(_build(claim_buf))
        claim_buf = None
        icd_buf   = []
        lines_buf = []

    for seg in segments:
        elems = seg.split(elem_sep)
        sid   = elems[0]

        # ── NM1 — name segments ───────────────────────────────────────────────
        if sid == "NM1" and len(elems) > 1:
            qual = elems[1]

            if qual == "PR":                              # Payer
                payer_name = _e(elems, 3)
                payer_id   = _e(elems, 9)
                if claim_buf is not None:                 # NM1*PR inside a claim (2310D)
                    claim_buf["payer"]    = payer_name
                    claim_buf["payer_id"] = payer_id

            elif qual in ("IL", "QC"):                    # Subscriber / patient
                last  = _e(elems, 3)
                first = _e(elems, 4)
                patient_name = f"{first} {last}".strip()
                patient_id   = _e(elems, 9)
                if claim_buf is not None:                 # NM1*IL inside a claim (2310C)
                    claim_buf["patient_name"] = patient_name
                    claim_buf["patient_id"]   = patient_id

            elif qual in ("1P", "82", "DN", "P3"):        # Rendering / attending provider
                last  = _e(elems, 3)
                first = _e(elems, 4)
                provider_name = ("Dr. " if last else "") + last + (f", {first}" if first else "")
                if _e(elems, 8) == "XX":
                    npi = _e(elems, 9)
                if claim_buf is not None:                 # NM1*1P inside a claim (2310B)
                    claim_buf["provider_name"] = provider_name
                    if npi:
                        claim_buf["npi"] = npi

            elif qual == "85":                            # Billing provider — NPI fallback
                if _e(elems, 8) == "XX":
                    billing_npi = _e(elems, 9)
                if not provider_name:
                    last  = _e(elems, 3)
                    first = _e(elems, 4)
                    provider_name = last + (f", {first}" if first else "")
                if claim_buf is not None and not claim_buf.get("npi") and billing_npi:
                    claim_buf["npi"] = billing_npi

        # ── CLM — claim header ────────────────────────────────────────────────
        elif sid == "CLM":
            flush_claim()
            effective_npi = npi or billing_npi
            claim_buf = {
                "id":            _e(elems, 1) or f"CLM-{len(claims) + 1}",
                "payer":         payer_name,
                "payer_id":      payer_id,
                "patient_name":  patient_name,
                "patient_id":    patient_id,
                "npi":           effective_npi,
                "provider_name": provider_name,
                "dos":           "",
                "auth":          None,
                "total_charge":  _float(elems, 2),
            }

        # ── REF — reference IDs ───────────────────────────────────────────────
        elif sid == "REF" and claim_buf is not None:
            qual = _e(elems, 1)
            # D9 = prior auth; G1 = predetermination; OB = referral; F8/BP = also seen in PR files
            if qual in ("D9", "G1", "OB", "F8", "BP"):
                val = _e(elems, 2)
                if val and not claim_buf["auth"]:         # keep first auth found
                    claim_buf["auth"] = val

        # ── DTP — dates ───────────────────────────────────────────────────────
        elif sid == "DTP" and claim_buf is not None:
            if _e(elems, 1) == "472":                     # Date of service
                raw = _e(elems, 3)
                # Handle date range "YYYYMMDD-YYYYMMDD" — take start date
                claim_buf["dos"] = _fmt_date(raw.split("-")[0] if "-" in raw else raw)

        # ── HI — diagnoses ────────────────────────────────────────────────────
        elif sid == "HI" and claim_buf is not None:
            for elem in elems[1:]:
                if not elem:
                    continue
                if comp_sep in elem:
                    parts = elem.split(comp_sep)
                    # parts[0] = qualifier (ABK, ABF, BK, BF, …); parts[1] = ICD code
                    code = parts[1] if len(parts) > 1 else ""
                else:
                    code = elem
                if code and code not in icd_buf:
                    icd_buf.append(code)

        # ── SV1 — service line ────────────────────────────────────────────────
        elif sid == "SV1" and claim_buf is not None:
            flush_line()
            composite = _e(elems, 1)          # "HC:90837:GT" or "HC:H0004"
            parts     = composite.split(comp_sep) if comp_sep in composite else [composite]
            # parts[0] = qualifier (HC/WK/…), parts[1] = CPT, parts[2+] = composite modifiers
            cpt       = parts[1] if len(parts) > 1 else parts[0]
            mods: List[str] = [p for p in parts[2:] if p]
            # Also capture modifiers in separate element positions SV1-03 through SV1-06
            for extra_idx in (3, 4, 5, 6):
                m = _e(elems, extra_idx)
                if m and m not in mods:
                    mods.append(m)
            pending_line = ServiceLine(
                cpt      = cpt,
                modifier = mods,
                charge   = _float(elems, 2),
                units    = int(_float(elems, 4) or 1),
            )

        # ── LQ — additional modifier appended to current service line ─────────
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
