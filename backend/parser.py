"""
EDI X12 837P (Professional) parser for RevenueMD.

Handles standard 5010 837P files from PR clearinghouses (Inmediata, Assertus).
Extracts one ParsedClaim per CLM segment.
"""
from __future__ import annotations
import re
from typing import List, Dict, Any
from models import ParsedClaim, ServiceLine


# ── Helpers ─────────────────────────────────────────────────────────────────

def _edi_date(raw: str) -> str:
    """Convert YYYYMMDD or YYYYMMDD-YYYYMMDD to YYYY-MM-DD."""
    raw = raw.split("-")[0].strip()  # take start date for ranges
    if len(raw) == 8 and raw.isdigit():
        return f"{raw[:4]}-{raw[4:6]}-{raw[6:]}"
    return raw


def _seg(elements: List[str], idx: int, default: str = "") -> str:
    return elements[idx] if idx < len(elements) else default


# ── Main parser ──────────────────────────────────────────────────────────────

def parse_837(content: str) -> List[ParsedClaim]:
    """
    Parse an EDI 837P transaction set.
    Returns a list of ParsedClaim objects (one per CLM segment).
    """
    if not content.strip().upper().startswith("ISA"):
        return []

    # Detect element separator (always content[3] = char after 'ISA')
    element_sep = content[3]
    # Segment terminator: last char of ISA segment.
    # ISA has exactly 16 fields; the terminator follows ISA16 (the component separator).
    isa_fields = content.split(element_sep, 17)   # ['ISA','00','  ',...,ISA16, rest]
    if len(isa_fields) >= 17:
        # isa_fields[16] = "ISA16_value<segment_term>next_segment..."
        segment_term = isa_fields[16][1] if len(isa_fields[16]) > 1 else "~"
    else:
        segment_term = "~"

    # Normalize whitespace between segments (some senders add newlines)
    flat = re.sub(r"\s*" + re.escape(segment_term) + r"\s*", segment_term, content)
    segments = [s for s in flat.split(segment_term) if s.strip()]

    claims: List[ParsedClaim] = []

    # Running context across segments
    provider:   Dict[str, str] = {}
    payer:      Dict[str, str] = {}
    subscriber: Dict[str, str] = {}
    patient:    Dict[str, str] = {}

    cur_claim:    Dict[str, Any] = {}
    cur_svc_lines: List[ServiceLine] = []
    cur_diagnoses: List[str] = []
    in_claim = False

    def _flush_claim():
        nonlocal cur_claim, cur_svc_lines, cur_diagnoses, in_claim
        if not cur_claim:
            return
        # Build combined codes string from service lines
        code_parts = []
        total_val = 0.0
        for sl in cur_svc_lines:
            part = sl.cpt
            if sl.mods:
                part += " " + " ".join(sl.mods)
            if sl.units > 1:
                part += f" ×{sl.units}"
            code_parts.append(part)
            total_val += sl.charge

        billed = cur_claim.get("billed", total_val) or total_val
        pat_name = f"{patient.get('first','')} {patient.get('last','')}".strip() or \
                   f"{subscriber.get('first','')} {subscriber.get('last','')}".strip() or \
                   "Unknown"

        claims.append(ParsedClaim(
            id          = cur_claim.get("id", "UNKNOWN"),
            patient     = pat_name,
            codes       = " + ".join(code_parts) if code_parts else "—",
            payer       = payer.get("name", "Unknown"),
            prov        = provider.get("name", "Unknown"),
            provider    = provider.get("name", "Unknown"),
            npi         = provider.get("npi", ""),
            dos         = cur_claim.get("dos", "—"),
            billed      = billed,
            val         = billed,
            auth        = cur_claim.get("auth", ""),
            pos         = cur_claim.get("pos", "11"),
            diagnosis   = cur_diagnoses[0] if cur_diagnoses else "",
            diagnoses   = list(dict.fromkeys(cur_diagnoses)),  # dedup, preserve order
            member_id   = subscriber.get("member_id", ""),
            service_lines = list(cur_svc_lines),
            status      = "pending",
        ))
        cur_claim = {}
        cur_svc_lines = []
        cur_diagnoses = []
        in_claim = False

    for seg_raw in segments:
        el = seg_raw.split(element_sep)
        seg_id = el[0].upper()

        # ── HL: new subscriber loop — flush pending claim first, then reset ─
        if seg_id == "HL":
            if _seg(el, 3) == "22":   # subscriber-level HL
                _flush_claim()
                subscriber = {}
                patient    = {}
                payer      = {}

        # ── Name/ID segments ──────────────────────────────────────────
        elif seg_id == "NM1" and len(el) > 3:
            entity = _seg(el, 1)
            last   = _seg(el, 3)
            first  = _seg(el, 4)
            npi    = _seg(el, 9)
            name   = f"{first} {last}".strip() or last

            if entity == "85":    # Billing provider
                provider["name"] = name
                provider["npi"]  = npi
            elif entity == "87":  # Pay-to provider (secondary NPI sometimes here)
                if not provider.get("npi"):
                    provider["npi"] = npi
            elif entity in ("IL",):  # Insured/Subscriber
                subscriber["last"]      = last
                subscriber["first"]     = first
                subscriber["member_id"] = npi   # IL NM109 = member ID
            elif entity == "QC":  # Patient (when different from subscriber)
                patient["last"]  = last
                patient["first"] = first
            elif entity == "PR":  # Payer (Loop 2010BB)
                payer["name"] = last  # NM103 = payer org name
                payer["id"]   = npi
            elif entity == "40":  # Receiver — use as fallback payer if PR never appears
                if not payer.get("name"):
                    payer["name"] = last
                    payer["id"]   = npi

        # ── Claim header ──────────────────────────────────────────────
        elif seg_id == "CLM" and len(el) > 2:
            _flush_claim()
            in_claim = True

            clm05 = _seg(el, 5, "11:B:1")
            pos   = clm05.split(":")[0] if clm05 else "11"

            cur_claim = {
                "id":     _seg(el, 1),
                "billed": float(_seg(el, 2) or 0),
                "pos":    pos,
            }

        # ── Date of service ───────────────────────────────────────────
        elif seg_id == "DTP" and in_claim:
            if _seg(el, 1) == "472":  # Date of service
                cur_claim["dos"] = _edi_date(_seg(el, 3))

        # ── Reference numbers (auth, etc.) ────────────────────────────
        elif seg_id == "REF" and in_claim:
            qual = _seg(el, 1)
            val  = _seg(el, 2)
            if qual in ("G1", "F8"):   # G1=auth, F8=original ref
                cur_claim["auth"] = val
            elif qual == "D9":         # claim adjustment
                cur_claim["auth"] = val

        # ── Diagnosis codes ───────────────────────────────────────────
        elif seg_id == "HI" and in_claim:
            for i in range(1, min(len(el), 13)):
                parts = el[i].split(":")
                # ABK/BK = principal ICD-10; ABF/BF = additional; ABJ = admitting
                if len(parts) >= 2 and parts[0] in ("ABK", "BK", "ABF", "BF", "ABJ", "ABN"):
                    code = parts[1].strip()
                    if code:
                        cur_diagnoses.append(code)

        # ── Service line ──────────────────────────────────────────────
        elif seg_id == "SV1" and in_claim and len(el) > 4:
            # SV1*HC:90837:GT*245*UN*1***1
            code_parts = _seg(el, 1, "").split(":")
            cpt  = code_parts[1].upper() if len(code_parts) > 1 else code_parts[0].upper()
            mods = [m.upper() for m in code_parts[2:] if m]

            try:
                units = int(float(_seg(el, 4, "1") or 1))
            except ValueError:
                units = 1
            try:
                charge = float(_seg(el, 2, "0") or 0)
            except ValueError:
                charge = 0.0

            cur_svc_lines.append(ServiceLine(
                cpt=cpt, mods=mods, units=units, charge=charge
            ))

        # ── Transaction set trailer → flush last claim ─────────────────
        elif seg_id == "SE":
            _flush_claim()

    _flush_claim()  # safety flush if SE was missing
    return claims
