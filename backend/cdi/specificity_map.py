"""
Clinical Documentation Improvement (CDI) — specificity opportunity reference.

Maps commonly-overused "unspecified" ICD-10 codes to the more specific codes
that better-documented care would support, plus a template physician query
for each. This is standard AHIMA/ACDIS-style CDI reference knowledge, not
patient-specific data.

Queries are written to be COMPLIANT (non-leading) per AHIMA/ACDIS query
practice brief guidance: they present clinical indicators already in the
chart and ask the physician to clarify/specify, rather than suggesting a
single "correct" answer to pick.
"""
from __future__ import annotations
from typing import List, TypedDict


class Candidate(TypedDict):
    code: str
    desc: str


class Opportunity(TypedDict):
    id: str
    code_prefix: str          # ICD-10 prefix this opportunity matches against
    family: str
    candidates: List[Candidate]
    query_en: str
    query_es: str


SPECIFICITY_OPPORTUNITIES: List[Opportunity] = [
    {
        "id": "diabetes-unspecified",
        "code_prefix": "E11.9",
        "family": "Type 2 diabetes mellitus, unspecified",
        "candidates": [
            {"code": "E11.22", "desc": "...with diabetic chronic kidney disease"},
            {"code": "E11.40", "desc": "...with diabetic neuropathy, unspecified"},
            {"code": "E11.65", "desc": "...with hyperglycemia"},
            {"code": "E11.21", "desc": "...with diabetic nephropathy"},
        ],
        "query_en": (
            "The record documents Type 2 diabetes mellitus coded as unspecified (E11.9). "
            "If any of the following are also present and being managed, please "
            "document the specific relationship so the diagnosis can be coded to the "
            "highest specificity: diabetic kidney disease, diabetic neuropathy, "
            "hyperglycemia, or another documented diabetic complication. If none of "
            "these apply, please confirm the diagnosis is unspecified as coded."
        ),
        "query_es": (
            "El expediente documenta diabetes mellitus tipo 2 codificada como no "
            "especificada (E11.9). Si alguna de las siguientes condiciones también "
            "está presente y siendo tratada, por favor documente la relación específica "
            "para codificar con la mayor especificidad: enfermedad renal diabética, "
            "neuropatía diabética, hiperglucemia, u otra complicación diabética "
            "documentada. Si ninguna aplica, por favor confirme que el diagnóstico es "
            "no especificado según codificado."
        ),
    },
    {
        "id": "chf-unspecified",
        "code_prefix": "I50.9",
        "family": "Heart failure, unspecified",
        "candidates": [
            {"code": "I50.22", "desc": "Chronic systolic (congestive) heart failure"},
            {"code": "I50.32", "desc": "Chronic diastolic (congestive) heart failure"},
            {"code": "I50.42", "desc": "Chronic combined systolic and diastolic heart failure"},
        ],
        "query_en": (
            "Heart failure is documented but coded as unspecified (I50.9). If an "
            "echocardiogram or clinical documentation indicates the type (systolic/"
            "reduced ejection fraction, diastolic/preserved ejection fraction, or "
            "combined) and acuity (acute, chronic, or acute-on-chronic), please "
            "document this so the diagnosis can be coded to the highest specificity."
        ),
        "query_es": (
            "Se documenta insuficiencia cardíaca pero se codifica como no especificada "
            "(I50.9). Si un ecocardiograma o la documentación clínica indica el tipo "
            "(sistólica/fracción de eyección reducida, diastólica/fracción de eyección "
            "preservada, o combinada) y la agudeza (aguda, crónica, o aguda sobre "
            "crónica), por favor documente esto para codificar con la mayor "
            "especificidad."
        ),
    },
    {
        "id": "copd-unspecified",
        "code_prefix": "J44.9",
        "family": "COPD, unspecified",
        "candidates": [
            {"code": "J44.0", "desc": "...with acute lower respiratory infection"},
            {"code": "J44.1", "desc": "...with (acute) exacerbation"},
        ],
        "query_en": (
            "COPD is documented and coded as unspecified (J44.9). If the patient is "
            "being treated for an acute exacerbation or a concurrent acute lower "
            "respiratory infection, please document this so the diagnosis can be "
            "coded to the highest specificity."
        ),
        "query_es": (
            "Se documenta EPOC codificada como no especificada (J44.9). Si el "
            "paciente está siendo tratado por una exacerbación aguda o una infección "
            "respiratoria inferior aguda concurrente, por favor documente esto para "
            "codificar con la mayor especificidad."
        ),
    },
    {
        "id": "ckd-unspecified",
        "code_prefix": "N18.9",
        "family": "Chronic kidney disease, unspecified stage",
        "candidates": [
            {"code": "N18.3", "desc": "CKD, stage 3"},
            {"code": "N18.4", "desc": "CKD, stage 4"},
            {"code": "N18.5", "desc": "CKD, stage 5"},
            {"code": "N18.6", "desc": "End stage renal disease"},
        ],
        "query_en": (
            "Chronic kidney disease is documented but coded without a stage (N18.9). "
            "If a GFR value or documented stage is available in the record, please "
            "specify the CKD stage so the diagnosis can be coded to the highest "
            "specificity."
        ),
        "query_es": (
            "Se documenta enfermedad renal crónica pero se codifica sin etapa "
            "(N18.9). Si hay un valor de TFG o etapa documentada en el expediente, "
            "por favor especifique la etapa de ERC para codificar con la mayor "
            "especificidad."
        ),
    },
    {
        "id": "anemia-unspecified",
        "code_prefix": "D64.9",
        "family": "Anemia, unspecified",
        "candidates": [
            {"code": "D50.0", "desc": "Iron deficiency anemia secondary to blood loss (chronic)"},
            {"code": "D63.1", "desc": "Anemia in chronic kidney disease"},
        ],
        "query_en": (
            "Anemia is documented and coded as unspecified (D64.9). If the anemia is "
            "related to a documented cause — such as chronic blood loss, iron "
            "deficiency, or chronic kidney disease — please document that "
            "relationship so the diagnosis can be coded to the highest specificity."
        ),
        "query_es": (
            "Se documenta anemia codificada como no especificada (D64.9). Si la "
            "anemia está relacionada con una causa documentada — como pérdida "
            "crónica de sangre, deficiencia de hierro, o enfermedad renal crónica — "
            "por favor documente esa relación para codificar con la mayor "
            "especificidad."
        ),
    },
    {
        "id": "obesity-unspecified",
        "code_prefix": "E66.9",
        "family": "Obesity, unspecified",
        "candidates": [
            {"code": "E66.01", "desc": "Morbid (severe) obesity due to excess calories"},
            {"code": "E66.3", "desc": "Overweight"},
        ],
        "query_en": (
            "Obesity is documented and coded as unspecified (E66.9). If a BMI value "
            "is documented in the record, please confirm the corresponding BMI code "
            "(Z68.xx) is also captured, and specify whether morbid obesity applies, "
            "so the diagnosis can be coded to the highest specificity."
        ),
        "query_es": (
            "Se documenta obesidad codificada como no especificada (E66.9). Si hay un "
            "valor de IMC documentado en el expediente, por favor confirme que el "
            "código de IMC correspondiente (Z68.xx) también esté capturado, y "
            "especifique si aplica obesidad mórbida, para codificar con la mayor "
            "especificidad."
        ),
    },
    {
        "id": "pneumonia-organism-unspecified",
        "code_prefix": "J18.9",
        "family": "Pneumonia, organism unspecified",
        "candidates": [
            {"code": "J13", "desc": "Pneumonia due to Streptococcus pneumoniae"},
            {"code": "J15.x", "desc": "Bacterial pneumonia, organism-specific"},
            {"code": "J12.x", "desc": "Viral pneumonia, organism-specific"},
        ],
        "query_en": (
            "Pneumonia is documented and coded without a causative organism (J18.9). "
            "If culture results, sputum studies, or clinical judgment identify a "
            "specific organism, please document it so the diagnosis can be coded to "
            "the highest specificity."
        ),
        "query_es": (
            "Se documenta neumonía codificada sin organismo causante (J18.9). Si los "
            "resultados de cultivo, estudios de esputo, o el juicio clínico "
            "identifican un organismo específico, por favor documéntelo para "
            "codificar con la mayor especificidad."
        ),
    },
    {
        "id": "depression-unspecified",
        "code_prefix": "F32.9",
        "family": "Major depressive disorder, unspecified",
        "candidates": [
            {"code": "F32.0", "desc": "Mild"},
            {"code": "F32.1", "desc": "Moderate"},
            {"code": "F32.2", "desc": "Severe without psychotic features"},
            {"code": "F32.3", "desc": "Severe with psychotic features"},
        ],
        "query_en": (
            "Major depressive disorder, single episode, is documented and coded as "
            "unspecified (F32.9). If a severity level (mild, moderate, severe with/"
            "without psychotic features) is documented or clinically assessable, "
            "please specify it so the diagnosis can be coded to the highest "
            "specificity."
        ),
        "query_es": (
            "Se documenta trastorno depresivo mayor, episodio único, codificado como "
            "no especificado (F32.9). Si un nivel de severidad (leve, moderado, "
            "severo con/sin características psicóticas) está documentado o es "
            "clínicamente evaluable, por favor especifíquelo para codificar con la "
            "mayor especificidad."
        ),
    },
]


def find_opportunities(diagnoses: List[str]) -> List[Opportunity]:
    """Return the CDI opportunities whose code_prefix matches any of the
    given diagnosis codes (case-insensitive, prefix match on the ICD-10
    string as documented on the claim)."""
    normalized = [(d or "").strip().upper() for d in diagnoses if d]
    matches: List[Opportunity] = []
    for opp in SPECIFICITY_OPPORTUNITIES:
        prefix = opp["code_prefix"].upper()
        if any(d == prefix or d.startswith(prefix) for d in normalized):
            matches.append(opp)
    return matches
