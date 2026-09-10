"""
HCC (Hierarchical Condition Category) reference table.

Maps ICD-10 diagnosis prefixes to their CMS-HCC risk-adjustment category
so RevenueMD can flag "this diagnosis is HCC-relevant — go verify it's
been captured this year in your EHR."

IMPORTANT SCOPE NOTE — read before trusting this as exhaustive:
CMS's official CMS-HCC V28 crosswalk maps roughly 7,770 individual
ICD-10-CM codes to 115 payment HCC categories (published as a downloadable
file at cms.gov). This table is NOT that file. It's a curated set of the
major disease categories that reliably carry HCC weight — built from
well-established, stable clinical/coding knowledge, organized by body
system, covering far more ground than the platform's original 15-code
starter list. Treat it the same as the "verify first" payer rules
elsewhere in this app: a strong prompt to check, not a substitute for
your coding team's own reference to CMS's official published crosswalk
(https://www.cms.gov/medicare/payment/medicare-advantage-rates-statistics/risk-adjustment)
for full, audit-grade accuracy — especially since CMS revises the model
and its coefficients annually, and specific numeric HCC category IDs
(e.g. "HCC 85") change between model versions, which is why this table
deliberately uses descriptive labels instead of asserting specific HCC
numbers that could be wrong for the model year in force.
"""
from __future__ import annotations
from typing import List, TypedDict


class HCCCategory(TypedDict):
    code_prefix: str
    hcc_label: str
    note_en: str
    note_es: str


HCC_CATEGORIES: List[HCCCategory] = [
    # ── Diabetes with complications ────────────────────────────────────────
    {"code_prefix": "E11.2", "hcc_label": "Diabetes with chronic kidney complications",
     "note_en": "Diabetes with renal complications is HCC-relevant.",
     "note_es": "La diabetes con complicaciones renales es relevante para HCC."},
    {"code_prefix": "E11.3", "hcc_label": "Diabetes with ophthalmic complications",
     "note_en": "Diabetes with eye complications is HCC-relevant.",
     "note_es": "La diabetes con complicaciones oculares es relevante para HCC."},
    {"code_prefix": "E11.4", "hcc_label": "Diabetes with neurological complications",
     "note_en": "Diabetes with neurological complications is HCC-relevant.",
     "note_es": "La diabetes con complicaciones neurológicas es relevante para HCC."},
    {"code_prefix": "E11.5", "hcc_label": "Diabetes with circulatory complications",
     "note_en": "Diabetes with circulatory complications is HCC-relevant.",
     "note_es": "La diabetes con complicaciones circulatorias es relevante para HCC."},

    # ── Cardiovascular ──────────────────────────────────────────────────────
    {"code_prefix": "I50.", "hcc_label": "Heart failure",
     "note_en": "Heart failure is HCC-relevant.",
     "note_es": "La insuficiencia cardíaca es relevante para HCC."},
    {"code_prefix": "I42.", "hcc_label": "Cardiomyopathy",
     "note_en": "Cardiomyopathy is HCC-relevant.",
     "note_es": "La miocardiopatía es relevante para HCC."},
    {"code_prefix": "I27.0", "hcc_label": "Primary pulmonary hypertension",
     "note_en": "Pulmonary hypertension is HCC-relevant.",
     "note_es": "La hipertensión pulmonar es relevante para HCC."},
    {"code_prefix": "I27.2", "hcc_label": "Secondary pulmonary hypertension",
     "note_en": "Pulmonary hypertension is HCC-relevant.",
     "note_es": "La hipertensión pulmonar es relevante para HCC."},
    {"code_prefix": "I70.2", "hcc_label": "Peripheral vascular disease with gangrene",
     "note_en": "Peripheral vascular disease with gangrene is HCC-relevant.",
     "note_es": "La enfermedad vascular periférica con gangrena es relevante para HCC."},
    {"code_prefix": "I70.", "hcc_label": "Peripheral vascular disease",
     "note_en": "Peripheral vascular disease is HCC-relevant.",
     "note_es": "La enfermedad vascular periférica es relevante para HCC."},
    {"code_prefix": "I96", "hcc_label": "Gangrene",
     "note_en": "Gangrene is HCC-relevant.",
     "note_es": "La gangrena es relevante para HCC."},

    # ── Respiratory ─────────────────────────────────────────────────────────
    {"code_prefix": "J44.", "hcc_label": "Chronic obstructive pulmonary disease",
     "note_en": "COPD is HCC-relevant.",
     "note_es": "La EPOC es relevante para HCC."},
    {"code_prefix": "J43.", "hcc_label": "Emphysema",
     "note_en": "Emphysema is HCC-relevant.",
     "note_es": "El enfisema es relevante para HCC."},
    {"code_prefix": "J96.1", "hcc_label": "Chronic respiratory failure",
     "note_en": "Chronic respiratory failure is HCC-relevant.",
     "note_es": "La insuficiencia respiratoria crónica es relevante para HCC."},
    {"code_prefix": "E84.", "hcc_label": "Cystic fibrosis",
     "note_en": "Cystic fibrosis is HCC-relevant.",
     "note_es": "La fibrosis quística es relevante para HCC."},

    # ── Renal ────────────────────────────────────────────────────────────────
    {"code_prefix": "N18.4", "hcc_label": "Chronic kidney disease, stage 4",
     "note_en": "CKD stage 4+ is HCC-relevant.",
     "note_es": "La ERC etapa 4+ es relevante para HCC."},
    {"code_prefix": "N18.5", "hcc_label": "Chronic kidney disease, stage 5",
     "note_en": "CKD stage 4+ is HCC-relevant.",
     "note_es": "La ERC etapa 4+ es relevante para HCC."},
    {"code_prefix": "N18.6", "hcc_label": "End stage renal disease",
     "note_en": "ESRD is HCC-relevant.",
     "note_es": "La ERC terminal es relevante para HCC."},
    {"code_prefix": "Z99.2", "hcc_label": "Dependence on renal dialysis",
     "note_en": "Dialysis dependence is HCC-relevant.",
     "note_es": "La dependencia de diálisis es relevante para HCC."},

    # ── Behavioral health ────────────────────────────────────────────────────
    {"code_prefix": "F33.", "hcc_label": "Major depressive disorder, recurrent",
     "note_en": "Recurrent major depressive disorder is HCC-relevant.",
     "note_es": "El trastorno depresivo mayor recurrente es relevante para HCC."},
    {"code_prefix": "F20.", "hcc_label": "Schizophrenia",
     "note_en": "Schizophrenia is HCC-relevant.",
     "note_es": "La esquizofrenia es relevante para HCC."},
    {"code_prefix": "F31.", "hcc_label": "Bipolar disorder",
     "note_en": "Bipolar disorder is HCC-relevant.",
     "note_es": "El trastorno bipolar es relevante para HCC."},
    {"code_prefix": "F10.2", "hcc_label": "Alcohol dependence",
     "note_en": "Alcohol dependence is HCC-relevant.",
     "note_es": "La dependencia del alcohol es relevante para HCC."},
    {"code_prefix": "F11.2", "hcc_label": "Opioid dependence",
     "note_en": "Opioid dependence is HCC-relevant.",
     "note_es": "La dependencia de opioides es relevante para HCC."},
    {"code_prefix": "F12.2", "hcc_label": "Cannabis dependence",
     "note_en": "Substance dependence is HCC-relevant.",
     "note_es": "La dependencia de sustancias es relevante para HCC."},
    {"code_prefix": "F13.2", "hcc_label": "Sedative dependence",
     "note_en": "Substance dependence is HCC-relevant.",
     "note_es": "La dependencia de sustancias es relevante para HCC."},
    {"code_prefix": "F14.2", "hcc_label": "Cocaine dependence",
     "note_en": "Substance dependence is HCC-relevant.",
     "note_es": "La dependencia de sustancias es relevante para HCC."},
    {"code_prefix": "F19.2", "hcc_label": "Other psychoactive substance dependence",
     "note_en": "Substance dependence is HCC-relevant.",
     "note_es": "La dependencia de sustancias es relevante para HCC."},

    # ── Neurological ─────────────────────────────────────────────────────────
    {"code_prefix": "G81.", "hcc_label": "Hemiplegia/hemiparesis",
     "note_en": "Hemiplegia/hemiparesis is HCC-relevant.",
     "note_es": "La hemiplejía/hemiparesia es relevante para HCC."},
    {"code_prefix": "G82.", "hcc_label": "Paraplegia/quadriplegia",
     "note_en": "Paraplegia/quadriplegia is HCC-relevant.",
     "note_es": "La paraplejía/cuadriplejía es relevante para HCC."},
    {"code_prefix": "G83.", "hcc_label": "Other paralytic syndrome",
     "note_en": "Paralytic syndromes are HCC-relevant.",
     "note_es": "Los síndromes paralíticos son relevantes para HCC."},
    {"code_prefix": "G20", "hcc_label": "Parkinson's disease",
     "note_en": "Parkinson's disease is HCC-relevant.",
     "note_es": "La enfermedad de Parkinson es relevante para HCC."},
    {"code_prefix": "G35", "hcc_label": "Multiple sclerosis",
     "note_en": "Multiple sclerosis is HCC-relevant.",
     "note_es": "La esclerosis múltiple es relevante para HCC."},
    {"code_prefix": "G12.21", "hcc_label": "Amyotrophic lateral sclerosis (ALS)",
     "note_en": "ALS is HCC-relevant.",
     "note_es": "La ELA es relevante para HCC."},
    {"code_prefix": "G40.", "hcc_label": "Epilepsy/seizure disorder",
     "note_en": "Epilepsy is HCC-relevant.",
     "note_es": "La epilepsia es relevante para HCC."},
    {"code_prefix": "G80.", "hcc_label": "Cerebral palsy",
     "note_en": "Cerebral palsy is HCC-relevant.",
     "note_es": "La parálisis cerebral es relevante para HCC."},
    {"code_prefix": "G71.0", "hcc_label": "Muscular dystrophy",
     "note_en": "Muscular dystrophy is HCC-relevant.",
     "note_es": "La distrofia muscular es relevante para HCC."},

    # ── Oncology (active malignancy) ─────────────────────────────────────────
    {"code_prefix": "C34.", "hcc_label": "Lung cancer",
     "note_en": "Active lung cancer is HCC-relevant.",
     "note_es": "El cáncer de pulmón activo es relevante para HCC."},
    {"code_prefix": "C50.", "hcc_label": "Breast cancer",
     "note_en": "Active breast cancer is HCC-relevant.",
     "note_es": "El cáncer de mama activo es relevante para HCC."},
    {"code_prefix": "C18.", "hcc_label": "Colon cancer",
     "note_en": "Active colorectal cancer is HCC-relevant.",
     "note_es": "El cáncer colorrectal activo es relevante para HCC."},
    {"code_prefix": "C19.", "hcc_label": "Rectosigmoid cancer",
     "note_en": "Active colorectal cancer is HCC-relevant.",
     "note_es": "El cáncer colorrectal activo es relevante para HCC."},
    {"code_prefix": "C20", "hcc_label": "Rectal cancer",
     "note_en": "Active colorectal cancer is HCC-relevant.",
     "note_es": "El cáncer colorrectal activo es relevante para HCC."},
    {"code_prefix": "C61", "hcc_label": "Prostate cancer",
     "note_en": "Active prostate cancer is HCC-relevant.",
     "note_es": "El cáncer de próstata activo es relevante para HCC."},
    {"code_prefix": "C81.", "hcc_label": "Hodgkin lymphoma",
     "note_en": "Active lymphoma is HCC-relevant.",
     "note_es": "El linfoma activo es relevante para HCC."},
    {"code_prefix": "C82.", "hcc_label": "Non-Hodgkin lymphoma",
     "note_en": "Active lymphoma is HCC-relevant.",
     "note_es": "El linfoma activo es relevante para HCC."},
    {"code_prefix": "C91.", "hcc_label": "Lymphoid leukemia",
     "note_en": "Active leukemia is HCC-relevant.",
     "note_es": "La leucemia activa es relevante para HCC."},
    {"code_prefix": "C92.", "hcc_label": "Myeloid leukemia",
     "note_en": "Active leukemia is HCC-relevant.",
     "note_es": "La leucemia activa es relevante para HCC."},
    {"code_prefix": "C77.", "hcc_label": "Secondary/metastatic cancer (lymph nodes)",
     "note_en": "Metastatic cancer is HCC-relevant.",
     "note_es": "El cáncer metastásico es relevante para HCC."},
    {"code_prefix": "C78.", "hcc_label": "Secondary/metastatic cancer (organs)",
     "note_en": "Metastatic cancer is HCC-relevant.",
     "note_es": "El cáncer metastásico es relevante para HCC."},
    {"code_prefix": "C79.", "hcc_label": "Secondary/metastatic cancer (other sites)",
     "note_en": "Metastatic cancer is HCC-relevant.",
     "note_es": "El cáncer metastásico es relevante para HCC."},

    # ── Infectious disease / immune ──────────────────────────────────────────
    {"code_prefix": "B20", "hcc_label": "HIV/AIDS",
     "note_en": "HIV/AIDS is HCC-relevant.",
     "note_es": "El VIH/SIDA es relevante para HCC."},
    {"code_prefix": "D80.", "hcc_label": "Immunodeficiency disorder",
     "note_en": "Immunodeficiency is HCC-relevant.",
     "note_es": "La inmunodeficiencia es relevante para HCC."},
    {"code_prefix": "D81.", "hcc_label": "Combined immunodeficiency",
     "note_en": "Immunodeficiency is HCC-relevant.",
     "note_es": "La inmunodeficiencia es relevante para HCC."},
    {"code_prefix": "D84.", "hcc_label": "Other immunodeficiency",
     "note_en": "Immunodeficiency is HCC-relevant.",
     "note_es": "La inmunodeficiencia es relevante para HCC."},

    # ── Hematology ───────────────────────────────────────────────────────────
    {"code_prefix": "D57.0", "hcc_label": "Sickle cell disease with crisis",
     "note_en": "Sickle cell disease is HCC-relevant.",
     "note_es": "La enfermedad de células falciformes es relevante para HCC."},
    {"code_prefix": "D57.1", "hcc_label": "Sickle cell disease without crisis",
     "note_en": "Sickle cell disease is HCC-relevant.",
     "note_es": "La enfermedad de células falciformes es relevante para HCC."},
    {"code_prefix": "D61.", "hcc_label": "Aplastic anemia/bone marrow failure",
     "note_en": "Aplastic anemia is HCC-relevant.",
     "note_es": "La anemia aplásica es relevante para HCC."},
    {"code_prefix": "D65", "hcc_label": "Disseminated intravascular coagulation",
     "note_en": "Coagulation disorders are HCC-relevant.",
     "note_es": "Los trastornos de coagulación son relevantes para HCC."},
    {"code_prefix": "D66", "hcc_label": "Hereditary Factor VIII deficiency (Hemophilia A)",
     "note_en": "Hemophilia is HCC-relevant.",
     "note_es": "La hemofilia es relevante para HCC."},
    {"code_prefix": "D67", "hcc_label": "Hereditary Factor IX deficiency (Hemophilia B)",
     "note_en": "Hemophilia is HCC-relevant.",
     "note_es": "La hemofilia es relevante para HCC."},

    # ── Gastrointestinal / hepatic ───────────────────────────────────────────
    {"code_prefix": "K74.", "hcc_label": "Cirrhosis of liver",
     "note_en": "Cirrhosis is HCC-relevant.",
     "note_es": "La cirrosis es relevante para HCC."},
    {"code_prefix": "K70.3", "hcc_label": "Alcoholic cirrhosis of liver",
     "note_en": "Cirrhosis is HCC-relevant.",
     "note_es": "La cirrosis es relevante para HCC."},
    {"code_prefix": "K72.", "hcc_label": "Hepatic failure",
     "note_en": "Hepatic (liver) failure is HCC-relevant.",
     "note_es": "La insuficiencia hepática es relevante para HCC."},
    {"code_prefix": "K86.0", "hcc_label": "Alcohol-induced chronic pancreatitis",
     "note_en": "Chronic pancreatitis is HCC-relevant.",
     "note_es": "La pancreatitis crónica es relevante para HCC."},
    {"code_prefix": "K86.1", "hcc_label": "Other chronic pancreatitis",
     "note_en": "Chronic pancreatitis is HCC-relevant.",
     "note_es": "La pancreatitis crónica es relevante para HCC."},
    {"code_prefix": "K50.", "hcc_label": "Crohn's disease",
     "note_en": "Inflammatory bowel disease is HCC-relevant.",
     "note_es": "La enfermedad inflamatoria intestinal es relevante para HCC."},
    {"code_prefix": "K51.", "hcc_label": "Ulcerative colitis",
     "note_en": "Inflammatory bowel disease is HCC-relevant.",
     "note_es": "La enfermedad inflamatoria intestinal es relevante para HCC."},

    # ── Transplant / amputation / device-dependent status ───────────────────
    {"code_prefix": "Z94.0", "hcc_label": "Kidney transplant status",
     "note_en": "Transplant status is HCC-relevant.",
     "note_es": "El estado post-trasplante es relevante para HCC."},
    {"code_prefix": "Z94.1", "hcc_label": "Heart transplant status",
     "note_en": "Transplant status is HCC-relevant.",
     "note_es": "El estado post-trasplante es relevante para HCC."},
    {"code_prefix": "Z94.2", "hcc_label": "Lung transplant status",
     "note_en": "Transplant status is HCC-relevant.",
     "note_es": "El estado post-trasplante es relevante para HCC."},
    {"code_prefix": "Z94.4", "hcc_label": "Liver transplant status",
     "note_en": "Transplant status is HCC-relevant.",
     "note_es": "El estado post-trasplante es relevante para HCC."},
    {"code_prefix": "Z89.", "hcc_label": "Acquired absence of limb (amputation)",
     "note_en": "Amputation status is HCC-relevant.",
     "note_es": "El estado de amputación es relevante para HCC."},

    # ── Musculoskeletal / integumentary ──────────────────────────────────────
    {"code_prefix": "L89.3", "hcc_label": "Pressure ulcer, stage 3",
     "note_en": "Severe pressure ulcers are HCC-relevant.",
     "note_es": "Las úlceras por presión severas son relevantes para HCC."},
    {"code_prefix": "L89.4", "hcc_label": "Pressure ulcer, stage 4",
     "note_en": "Severe pressure ulcers are HCC-relevant.",
     "note_es": "Las úlceras por presión severas son relevantes para HCC."},

    # ── Congenital/developmental ─────────────────────────────────────────────
    {"code_prefix": "Q90", "hcc_label": "Down syndrome",
     "note_en": "Down syndrome is HCC-relevant.",
     "note_es": "El síndrome de Down es relevante para HCC."},

    # ── Obesity ──────────────────────────────────────────────────────────────
    {"code_prefix": "E66.01", "hcc_label": "Morbid obesity due to excess calories",
     "note_en": "Morbid obesity is HCC-relevant.",
     "note_es": "La obesidad mórbida es relevante para HCC."},
    {"code_prefix": "E66.2", "hcc_label": "Morbid obesity with alveolar hypoventilation",
     "note_en": "Morbid obesity is HCC-relevant.",
     "note_es": "La obesidad mórbida es relevante para HCC."},
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
