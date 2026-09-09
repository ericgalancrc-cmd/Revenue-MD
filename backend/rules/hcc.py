"""
HCC (Hierarchical Condition Category) flag — applies regardless of payer.

Does NOT track whether an HCC was already captured this calendar year —
RevenueMD has no visibility into the patient's claim history across time
or systems. This purely flags "this claim's diagnosis maps to an
HCC category" as a prompt for the biller/coder to go verify capture
status in the practice's own EHR/PM system (e.g. eClinicalWorks) before
assuming it's already been recaptured for the year. Most impactful for
Medicare Advantage / other risk-adjusted plans (MCS, MMM, Humana), but
shown regardless of payer since the underlying condition still matters
clinically and the plan type isn't always reliably known from the claim
alone.
"""
from __future__ import annotations
from typing import List
from models import Issue, Fix, ParsedClaim, Severity
from rules.hcc_map import find_hcc_matches


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    issues: List[Issue] = []
    fixes:  List[Fix]   = []

    matches = find_hcc_matches(claim.diagnoses)
    if not matches:
        return [], [], 0

    labels = [m["hcc_label"] for m in matches]
    issues.append(Issue(
        code="HCC-001", sev=Severity.info,
        tEn=f"HCC-relevant diagnosis: {labels[0]}" + (f" (+{len(labels)-1} more)" if len(labels) > 1 else ""),
        tEs=f"Diagnóstico relevante para HCC: {labels[0]}" + (f" (+{len(labels)-1} más)" if len(labels) > 1 else ""),
        dEn=(
            "This claim carries a diagnosis that maps to a CMS-HCC risk-adjustment "
            "category: " + "; ".join(labels) + ". RevenueMD doesn't track whether this "
            "was already captured for the current calendar year — verify in your "
            "EHR/PM system (e.g. eClinicalWorks) whether this HCC has been recaptured "
            "this year before assuming it's covered."
        ),
        dEs=(
            "Este reclamo tiene un diagnóstico que corresponde a una categoría de "
            "ajuste de riesgo CMS-HCC: " + "; ".join(labels) + ". RevenueMD no rastrea "
            "si esto ya fue capturado durante el año calendario actual — verifique en "
            "su sistema EHR/PM (p. ej. eClinicalWorks) si este HCC ha sido recapturado "
            "este año antes de asumir que está cubierto."
        ),
    ))
    fixes.append(Fix(
        tEn="Verify HCC recapture status in your EHR",
        tEs="Verificar estado de recaptura HCC en su EHR",
        wEn="Check the patient's chart history in your EHR/PM system to confirm whether this HCC-relevant diagnosis has already been coded for the current calendar year.",
        wEs="Revise el historial del paciente en su sistema EHR/PM para confirmar si este diagnóstico relevante para HCC ya ha sido codificado durante el año calendario actual.",
    ))
    # Informational only — no risk points added, this isn't a denial/compliance
    # risk, just a revenue-integrity reminder.
    return issues, fixes, 0
