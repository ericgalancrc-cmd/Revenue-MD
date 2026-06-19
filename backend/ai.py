"""
RevenueMD AI enhancement layer — Anthropic Claude.

Runs after the deterministic rules engine to:
- Enrich issue descriptions with plain-language context
- Catch edge cases the rule modules don't cover
- Generate a natural, actionable summary in EN + ES
- Add a biller-facing note for complex situations

Falls back silently to the rules-engine result if:
- ANTHROPIC_API_KEY is not set
- The anthropic package is not installed
- The API call fails for any reason
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict

logger = logging.getLogger(__name__)

MODEL = "claude-haiku-4-5-20251001"

try:
    import anthropic as _anthropic_module
    _API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    _client = _anthropic_module.Anthropic(api_key=_API_KEY) if _API_KEY else None
except ImportError:
    _client = None


def is_available() -> bool:
    return _client is not None


def enhance(result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Takes a ScrubResult dict from the rules engine, calls Claude to enrich it.
    Returns a modified copy (or the original if AI is unavailable or call fails).
    """
    if not is_available():
        return result

    try:
        claim_info = {
            "id":        result.get("id"),
            "payer":     result.get("payer"),
            "codes":     result.get("codes"),
            "dos":       result.get("dos"),
            "billed":    result.get("billed"),
            "auth":      result.get("auth") or "None",
            "pos":       result.get("pos", "11"),
            "npi":       result.get("npi") or "Not provided",
            "diagnoses": result.get("diagnoses", []),
        }

        issues = result.get("issues", [])
        fixes  = result.get("fix", [])
        risk   = result.get("risk", 0)
        lane   = result.get("lane", "auto_clear")

        prompt = f"""You are a certified medical billing expert for Puerto Rico payers \
(ASES/Mi Salud, Plan Vital, Triple-S, MMM, MCS, Medicare/FCSO).

A claim was processed by a deterministic rules engine. Enhance the findings.

CLAIM:
{json.dumps(claim_info, indent=2)}

RULES ENGINE FINDINGS:
- Risk score: {risk}/100
- Triage lane: {lane}
- Issues: {json.dumps(issues, indent=2)}
- Suggested fixes: {json.dumps(fixes, indent=2)}

Your tasks:
1. Write a concise 2-3 sentence summary (sEn in English, sEs in Spanish) for the billing professional.
2. Review the issues list — improve descriptions, correct errors, add issues the engine missed \
(use code prefix "AI-" for new ones).
3. Review the fix list — improve instructions, add missing fixes, order by urgency.
4. If there is a compliance risk or nuance worth highlighting separately, write a brief ai_note \
(1-2 sentences max). Otherwise leave it an empty string.

Issue schema: {{"code":"string","sev":"error|warning|info","tEn":"Short EN","tEs":"Short ES","dEn":"Detail EN","dEs":"Detail ES"}}
Fix schema: {{"tEn":"Title EN","tEs":"Title ES","wEn":"What to do EN","wEs":"What to do ES"}}

Respond with ONLY valid JSON — no markdown fences, no prose outside the JSON object:
{{
  "sEn": "...",
  "sEs": "...",
  "issues": [...],
  "fix": [...],
  "ai_note": "..."
}}"""

        response = _client.messages.create(
            model=MODEL,
            max_tokens=1800,
            temperature=0,
            messages=[{"role": "user", "content": prompt}],
        )

        raw = response.content[0].text.strip()
        if raw.startswith("```"):
            parts = raw.split("```")
            raw = parts[1] if len(parts) > 1 else raw
            if raw.startswith("json"):
                raw = raw[4:].strip()

        ai = json.loads(raw)

        enhanced = result.copy()
        if ai.get("sEn"):
            enhanced["sEn"] = ai["sEn"]
        if ai.get("sEs"):
            enhanced["sEs"] = ai["sEs"]
        if ai.get("issues"):
            enhanced["issues"] = ai["issues"]
        if ai.get("fix"):
            enhanced["fix"] = ai["fix"]
        enhanced["ai_note"]     = ai.get("ai_note", "") or ""
        enhanced["ai_enhanced"] = True

        return enhanced

    except Exception as exc:
        logger.warning("AI enhancement failed — using rules-engine result: %s", exc)
        return result
