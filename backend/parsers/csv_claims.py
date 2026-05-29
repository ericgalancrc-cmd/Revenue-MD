"""
CSV claim file parser.

Accepts any CSV with a header row.  Column names are matched flexibly
(case-insensitive, spaces→underscores).

Minimum required columns: id (or will auto-generate), codes (or cpt / procedure_code).
Optional enrichment: payer, provider, npi, dos, billed, auth, pos, diagnosis, member_id.
"""
from __future__ import annotations
import csv
import io
from typing import List
from models import ParsedClaim, ServiceLine


_ALIASES = {
    # id
    "claim_id": "id", "claim_number": "id", "control_number": "id",
    # patient
    "patient_name": "patient", "member_name": "patient",
    # codes
    "cpt": "codes", "procedure_code": "codes", "cpt_codes": "codes",
    # payer
    "insurance": "payer", "insurance_company": "payer", "plan": "payer",
    # provider
    "rendering_provider": "provider", "physician": "provider", "clinician": "provider",
    # npi
    "rendering_npi": "npi", "provider_npi": "npi",
    # date of service
    "date_of_service": "dos", "service_date": "dos", "dos_date": "dos",
    # billed
    "billed_amount": "billed", "charge": "billed", "total_charge": "billed",
    # auth
    "authorization": "auth", "auth_number": "auth", "prior_auth": "auth",
    # place of service
    "place_of_service": "pos",
    # diagnosis
    "icd10": "diagnosis", "dx": "diagnosis", "dx_code": "diagnosis", "icd_10": "diagnosis",
    # member
    "subscriber_id": "member_id", "member": "member_id",
}


def _normalize_headers(headers: List[str]) -> List[str]:
    out = []
    for h in headers:
        key = h.strip().lower().replace(" ", "_").replace("-", "_")
        out.append(_ALIASES.get(key, key))
    return out


def parse_csv(content: str) -> List[ParsedClaim]:
    reader = csv.DictReader(io.StringIO(content.strip()))
    if not reader.fieldnames:
        return []

    # Remap header names
    original = list(reader.fieldnames)
    normalized = _normalize_headers(original)
    header_map = dict(zip(original, normalized))

    claims: List[ParsedClaim] = []
    for i, raw_row in enumerate(reader):
        row = {header_map.get(k, k): (v or "").strip() for k, v in raw_row.items() if k}

        claim_id = row.get("id") or f"CSV-{i+1:04d}"

        try:
            billed = float(row.get("billed", 0) or 0)
        except ValueError:
            billed = 0.0

        codes = row.get("codes", "").strip() or "—"

        # Build a minimal ServiceLine list from the codes string so the
        # rules engine can inspect individual CPT codes and modifiers.
        service_lines = _codes_to_service_lines(codes)

        npi = row.get("npi", "").strip()
        diagnoses = [d.strip() for d in row.get("diagnosis", "").split(",") if d.strip()]

        claims.append(ParsedClaim(
            id           = claim_id,
            patient      = row.get("patient", f"Patient {i+1}"),
            codes        = codes,
            payer        = row.get("payer", "Unknown"),
            prov         = row.get("provider", "Unknown"),
            provider     = row.get("provider", "Unknown"),
            npi          = npi,
            dos          = row.get("dos", "—"),
            billed       = billed,
            val          = billed,
            auth         = row.get("auth", ""),
            pos          = row.get("pos", "11"),
            diagnosis    = diagnoses[0] if diagnoses else "",
            diagnoses    = diagnoses,
            member_id    = row.get("member_id", ""),
            service_lines= service_lines,
            status       = row.get("status", "pending"),
        ))

    return [c for c in claims if c.id]


def _codes_to_service_lines(codes_str: str) -> List[ServiceLine]:
    """Parse '90837 GT + H0004 ×8' into ServiceLine objects."""
    import re
    lines = []
    for part in re.split(r"[,+]", codes_str):
        part = part.strip()
        if not part or part == "—":
            continue
        units = 1
        m = re.search(r"[×xX\*](\d+)", part)
        if m:
            units = int(m.group(1))
            part = part[:m.start()].strip()
        tokens = part.split()
        if not tokens:
            continue
        cpt  = tokens[0].upper()
        mods = [t.upper() for t in tokens[1:] if re.match(r"^[A-Z0-9]{2}$", t)]
        lines.append(ServiceLine(cpt=cpt, mods=mods, units=units))
    return lines
