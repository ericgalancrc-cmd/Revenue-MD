"""
HCC (Hierarchical Condition Category) reference table.

Maps common ICD-10 diagnosis prefixes to their CMS-HCC risk-adjustment
category (V28 model, used by Medicare Advantage and other risk-adjusted
plans). This is standard CMS risk-adjustment reference knowledge, not
patient-specific data.

Scope, deliberately kept narrow: RevenueMD does not track a patient's
claim history across time, so this cannot tell you whether an HCC was
already captured this calendar year — only that a diagnosis on THIS
claim maps to an HCC category. The flag exists purely to prompt the
biller/coder to go verify capture status in the practice's own system
(EHR/PM) before assuming it's covered for the year.
"""
from __future__ import annotations
from typing import List, TypedDict


class HCCCategory(TypedDict):
    code_prefix: str
    hcc_label: str        # e.g. "HCC 38 — Diabetes with Chronic Complications"
    note_en: str
    note_es: str


# Not exhaustive — covers the conditions most likely to appear in a
# behavioral health / primary care claim mix. Extend as needed.
HCC_CATEGORIES: List[HCCCategory] = [
    {
        "code_prefix": "E11.2", "hcc_label": "Diabetes with chronic kidney complications",
        "note_en": "Diabetes with renal complications is HCC-relevant.",
        "note_es": "La diabetes con complicaciones renales es relevante para HCC.",
    },
    {
        "code_prefix": "E11.3", "hcc_label": "Diabetes with ophthalmic complications",
        "note_en": "Diabetes with eye complications is HCC-relevant.",
        "note_es": "La diabetes con complicaciones oculares es relevante para HCC.",
    },
    {
        "code_prefix": "E11.4", "hcc_label": "Diabetes with neurological complications",
        "note_en": "Diabetes with neurological complications is HCC-relevant.",
        "note_es": "La diabetes con complicaciones neurológicas es relevante para HCC.",
    },
    {
        "code_prefix": "E11.5", "hcc_label": "Diabetes with circulatory complications",
        "note_en": "Diabetes with circulatory complications is HCC-relevant.",
        "note_es": "La diabetes con complicaciones circulatorias es relevante para HCC.",
    },
    {
        "code_prefix": "I50.", "hcc_label": "Heart failure",
        "note_en": "Heart failure is HCC-relevant.",
        "note_es": "La insuficiencia cardíaca es relevante para HCC.",
    },
    {
        "code_prefix": "J44.", "hcc_label": "Chronic obstructive pulmonary disease",
        "note_en": "COPD is HCC-relevant.",
        "note_es": "La EPOC es relevante para HCC.",
    },
    {
        "code_prefix": "N18.4", "hcc_label": "Chronic kidney disease, stage 4",
        "note_en": "CKD stage 4+ is HCC-relevant.",
        "note_es": "La ERC etapa 4+ es relevante para HCC.",
    },
    {
        "code_prefix": "N18.5", "hcc_label": "Chronic kidney disease, stage 5",
        "note_en": "CKD stage 4+ is HCC-relevant.",
        "note_es": "La ERC etapa 4+ es relevante para HCC.",
    },
    {
        "code_prefix": "N18.6", "hcc_label": "End stage renal disease",
        "note_en": "ESRD is HCC-relevant.",
        "note_es": "La ERC terminal es relevante para HCC.",
    },
    {
        "code_prefix": "F33.", "hcc_label": "Major depressive disorder, recurrent",
        "note_en": "Recurrent major depressive disorder is HCC-relevant.",
        "note_es": "El trastorno depresivo mayor recurrente es relevante para HCC.",
    },
    {
        "code_prefix": "F20.", "hcc_label": "Schizophrenia",
        "note_en": "Schizophrenia is HCC-relevant.",
        "note_es": "La esquizofrenia es relevante para HCC.",
    },
    {
        "code_prefix": "F31.", "hcc_label": "Bipolar disorder",
        "note_en": "Bipolar disorder is HCC-relevant.",
        "note_es": "El trastorno bipolar es relevante para HCC.",
    },
    {
        "code_prefix": "E66.01", "hcc_label": "Morbid obesity",
        "note_en": "Morbid obesity is HCC-relevant.",
        "note_es": "La obesidad mórbida es relevante para HCC.",
    },
    {
        "code_prefix": "I70.", "hcc_label": "Peripheral vascular disease",
        "note_en": "Peripheral vascular disease is HCC-relevant.",
        "note_es": "La enfermedad vascular periférica es relevante para HCC.",
    },
    {
        "code_prefix": "G81.", "hcc_label": "Hemiplegia/hemiparesis",
        "note_en": "Hemiplegia/hemiparesis is HCC-relevant.",
        "note_es": "La hemiplejía/hemiparesia es relevante para HCC.",
    },
]


def find_hcc_matches(diagnoses: List[str]) -> List[HCCCategory]:
    """Return the HCC categories whose code_prefix matches any diagnosis
    on the claim (case-insensitive prefix match), deduplicated by label."""
    normalized = [(d or "").strip().upper() for d in diagnoses if d]
    seen_labels = set()
    matches: List[HCCCategory] = []
    for cat in HCC_CATEGORIES:
        prefix = cat["code_prefix"].upper()
        if any(d.startswith(prefix) for d in normalized):
            if cat["hcc_label"] not in seen_labels:
                matches.append(cat)
                seen_labels.add(cat["hcc_label"])
    return matches
