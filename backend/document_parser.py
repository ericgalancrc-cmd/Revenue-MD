"""
Document-based claim extractor — RevenueMD

Accepts PDF, image (JPEG/PNG/WEBP/TIFF), or plain-text/CSV documents
and uses the Claude API to extract structured billing claim data.

Returns the same List[ParsedClaim] that parse_837() returns so the
entire downstream pipeline (rules engine, DB persistence) is unchanged.

Requires env var: ANTHROPIC_API_KEY
"""
from __future__ import annotations
import base64
import json
import logging
import os
from typing import List

import anthropic

from models import ParsedClaim, ServiceLine

log = logging.getLogger("revenuemd.docparser")

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not key:
            raise ValueError("ANTHROPIC_API_KEY is not set.")
        _client = anthropic.Anthropic(api_key=key)
    return _client


_EXTRACT_PROMPT = """\
You are a medical billing expert specializing in Puerto Rico payers \
(Plan Vital, Triple-S, MCS, MMM, Medicare/FCSO).

Extract ALL billing claim information from the document above and return it \
as a JSON array of claim objects. Each object must have exactly these fields:

{
  "id": "claim control number or patient account number \
(if absent use CLM-1, CLM-2, …)",
  "payer": "insurance company name",
  "payer_id": "payer plan ID if visible, else empty string",
  "patient_name": "patient full name",
  "patient_id": "member ID or patient ID",
  "npi": "rendering provider NPI (10-digit number)",
  "provider_name": "rendering provider full name",
  "dos": "date of service formatted as Mon DD, YYYY (e.g. Apr 22, 2024)",
  "auth": "prior authorization number if present, else null",
  "total_charge": total billed amount as a number (e.g. 245.00),
  "icd": ["ICD-10 codes only — no descriptions"],
  "service_lines": [
    {
      "cpt": "CPT or HCPCS procedure code only — no descriptions",
      "modifier": ["2-character modifier codes, e.g. GT, 25, 59"],
      "units": integer number of units,
      "charge": line charge as a number
    }
  ]
}

Rules:
- One claim object per patient encounter or claim form visible in the document.
- If a field is not found use "" or null (for auth) or [] (for arrays).
- ICD codes: exact codes only e.g. F32.1, Z23 — never include descriptions.
- CPT/HCPCS codes: exact codes only e.g. 90837, H0004, 99214.
- Return ONLY the JSON array — no markdown fences, no explanation text.\
"""


def _mime_from_filename(filename: str) -> str:
    ext = (filename.lower().rsplit(".", 1)[-1]) if "." in filename else ""
    return {
        "pdf":  "application/pdf",
        "jpg":  "image/jpeg",
        "jpeg": "image/jpeg",
        "png":  "image/png",
        "webp": "image/webp",
        "gif":  "image/gif",
        "tiff": "image/tiff",
        "tif":  "image/tiff",
    }.get(ext, "text/plain")


def _build_content(file_bytes: bytes, mime: str) -> list:
    b64 = base64.standard_b64encode(file_bytes).decode()
    if mime == "application/pdf":
        return [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": b64,
                },
            },
            {"type": "text", "text": _EXTRACT_PROMPT},
        ]
    if mime.startswith("image/"):
        return [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": mime,
                    "data": b64,
                },
            },
            {"type": "text", "text": _EXTRACT_PROMPT},
        ]
    # Plain text / CSV / unknown
    text = file_bytes.decode("utf-8", errors="replace")
    return [{"type": "text", "text": f"Document contents:\n\n{text}\n\n{_EXTRACT_PROMPT}"}]


def _strip_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        end = -1 if lines[-1].strip() == "```" else len(lines)
        text = "\n".join(lines[1:end])
    return text


def _build_claim(raw: dict, idx: int) -> ParsedClaim:
    lines = [
        ServiceLine(
            cpt      = str(sl.get("cpt") or ""),
            modifier = [str(m) for m in (sl.get("modifier") or [])],
            units    = int(sl.get("units") or 1),
            charge   = float(sl.get("charge") or 0.0),
        )
        for sl in (raw.get("service_lines") or [])
    ]
    return ParsedClaim(
        id           = str(raw.get("id") or f"CLM-{idx + 1}"),
        payer        = str(raw.get("payer") or ""),
        payer_id     = str(raw.get("payer_id") or ""),
        patient_name = str(raw.get("patient_name") or ""),
        patient_id   = str(raw.get("patient_id") or ""),
        npi          = str(raw.get("npi") or ""),
        provider_name= str(raw.get("provider_name") or ""),
        dos          = str(raw.get("dos") or ""),
        auth         = raw.get("auth") or None,
        total_charge = float(raw.get("total_charge") or 0.0),
        icd          = [str(c) for c in (raw.get("icd") or [])],
        service_lines= lines,
    )


def extract_claims(file_bytes: bytes, filename: str) -> List[ParsedClaim]:
    """
    Extract billing claims from any document (PDF, image, text).
    Returns the same List[ParsedClaim] interface as parse_837().
    """
    mime = _mime_from_filename(filename)
    log.info("doc-extract: file=%s mime=%s size=%d", filename, mime, len(file_bytes))

    content = _build_content(file_bytes, mime)
    response = _get_client().messages.create(
        model      = "claude-sonnet-4-6",
        max_tokens = 4096,
        messages   = [{"role": "user", "content": content}],
    )
    raw_text = response.content[0].text
    log.debug("extract response (first 500): %s", raw_text[:500])

    try:
        raw_list = json.loads(_strip_fences(raw_text))
    except json.JSONDecodeError as e:
        raise ValueError(f"Could not parse extraction response as JSON: {e}") from e

    if not isinstance(raw_list, list):
        raise ValueError("Extraction model returned unexpected format (expected JSON array).")

    claims = [_build_claim(r, i) for i, r in enumerate(raw_list)]
    log.info("extracted %d claim(s)", len(claims))
    return claims
