"""
General billing rules — apply regardless of payer.
Covers: NCCI edits, add-on codes, documentation minimums, date validation.
"""
from __future__ import annotations
from datetime import date, datetime
from typing import List, Set
from models import Issue, Fix, ParsedClaim, Severity


# ── NCCI mutually exclusive pairs ────────────────────────────────────────────
# (col1, col2): col2 is bundled into col1 and cannot be billed separately
# without a distinguishing modifier (59 / XE / XS / XP / XU).
NCCI_PAIRS: List[tuple] = [
    ("90839", "90832"),
    ("90839", "90834"),
    ("90839", "90837"),
    ("90791", "90792"),
]

# ── Add-on codes → list of acceptable primary codes ──────────────────────────
ADD_ON: dict = {
    "90785": ["90832", "90834", "90837", "90838"],          # interactive complexity
    "90833": ["99202","99203","99204","99205",
              "99211","99212","99213","99214","99215"],      # psychotherapy w/ E&M
    "90836": ["99202","99203","99204","99205",
              "99211","99212","99213","99214","99215"],      # psychotherapy w/ E&M
    "90840": ["90839"],                                     # crisis add-on
}

# ── E&M codes ─────────────────────────────────────────────────────────────────
EM_CODES: Set[str] = {
    "99202","99203","99204","99205",
    "99211","99212","99213","99214","99215",
}

# ── Telehealth-eligible CPTs (most commonly billed via telehealth) ─────────────
TELEHEALTH_ELIGIBLE: Set[str] = {
    "90832","90834","90837","90838","90791","90792","90853",
    "H0004","H0019",
    "99202","99203","99204","99205",
    "99211","99212","99213","99214","99215",
    "90833","90785",
}


def check(claim: ParsedClaim) -> tuple[List[Issue], List[Fix], int]:
    """
    Run all general rules.
    Returns (issues, fixes, risk_delta).
    """
    issues: List[Issue] = []
    fixes:  List[Fix]   = []
    risk = 0

    slines = claim.service_lines
    cpt_set = {sl.cpt for sl in slines}

    # ── DOC-001: NPI missing or invalid ──────────────────────────────
    if not claim.npi or not claim.npi.isdigit() or len(claim.npi) != 10:
        issues.append(Issue(
            code="DOC-001", sev=Severity.error,
            tEn="NPI missing or invalid",
            tEs="NPI ausente o inválido",
            dEn="Rendering provider NPI is required on all claims. Must be a 10-digit NPPES-registered number.",
            dEs="El NPI del proveedor es requerido en todos los reclamos. Debe ser un número de 10 dígitos registrado en NPPES.",
        ))
        fixes.append(Fix(
            tEn="Add rendering provider NPI",
            tEs="Agregar NPI del proveedor",
            wEn="Enter the valid 10-digit NPI in the NM1*82 (rendering provider) segment.",
            wEs="Ingrese el NPI válido de 10 dígitos en el segmento NM1*82 (proveedor que rinde el servicio).",
        ))
        risk += 30

    # ── DOC-002: Missing ICD-10 diagnosis ────────────────────────────
    if not claim.diagnosis or claim.diagnosis == "—":
        issues.append(Issue(
            code="DOC-002", sev=Severity.error,
            tEn="Diagnosis code missing",
            tEs="Código de diagnóstico ausente",
            dEn="At least one ICD-10-CM diagnosis code is required. Claims without a diagnosis are rejected at the clearinghouse.",
            dEs="Se requiere al menos un código ICD-10-CM. Los reclamos sin diagnóstico son rechazados en el clearinghouse.",
        ))
        fixes.append(Fix(
            tEn="Add ICD-10 diagnosis code",
            tEs="Agregar código ICD-10",
            wEn="Add at least one valid ICD-10-CM code to the HI segment (qualifier ABK for principal diagnosis).",
            wEs="Agregue al menos un código ICD-10-CM válido al segmento HI (calificador ABK para diagnóstico principal).",
        ))
        risk += 30

    # ── DOC-003: Diagnosis specificity — unspecified codes ────────────
    # Only flag clearly "unspecified" codes (not codes where .9/.0 is standard usage).
    # Pattern: must have a parent category with more specific 4th–7th characters available.
    _UNSPEC_EXEMPT = {  # legitimately used at this specificity level
        "I10",    # Essential hypertension — no further spec in ICD-10
        "J06.9",  # Acute URTI unspecified — acceptable
        "R05",    # Cough
    }
    unspecified = [
        d for d in claim.diagnoses
        if d.endswith((".9", ".09", ".90", ".00"))
        and not d.startswith("Z")
        and d not in _UNSPEC_EXEMPT
        and len(d) >= 5  # only flag if there are likely more specific sub-codes
    ]
    if unspecified:
        issues.append(Issue(
            code="DOC-003", sev=Severity.warning,
            tEn=f"Unspecified diagnosis: {', '.join(unspecified[:2])}",
            tEs=f"Diagnóstico inespecífico: {', '.join(unspecified[:2])}",
            dEn="Unspecified ICD-10 codes are a common audit trigger. Use the most specific code available to support medical necessity.",
            dEs="Los códigos ICD-10 inespecíficos son causa común de auditoría. Use el código más específico disponible para respaldar la necesidad médica.",
        ))
        fixes.append(Fix(
            tEn="Use a more specific ICD-10 code",
            tEs="Usar código ICD-10 más específico",
            wEn=f"Replace {', '.join(unspecified[:2])} with a more specific ICD-10 code that captures the patient's condition in full detail.",
            wEs=f"Reemplace {', '.join(unspecified[:2])} con un código ICD-10 más específico que capture la condición del paciente en detalle.",
        ))
        risk += 12

    # ── CMS-007: Future date of service ──────────────────────────────
    dos = claim.dos
    if dos and dos != "—":
        try:
            fmt = "%Y%m%d" if len(dos.replace("-","")) == 8 and "-" not in dos else "%Y-%m-%d"
            d = datetime.strptime(dos, fmt).date()
            if d > date.today():
                issues.append(Issue(
                    code="CMS-007", sev=Severity.error,
                    tEn=f"Future date of service ({dos})",
                    tEs=f"Fecha de servicio futura ({dos})",
                    dEn=f"Date of service {dos} is in the future. Claims cannot be submitted before the service occurs.",
                    dEs=f"La fecha de servicio {dos} es futura. No se pueden someter reclamos antes de que ocurra el servicio.",
                ))
                fixes.append(Fix(
                    tEn="Correct the date of service",
                    tEs="Corregir la fecha de servicio",
                    wEn="Update the DTP*472 segment to reflect the actual date the service was rendered.",
                    wEs="Actualice el segmento DTP*472 para reflejar la fecha real en que se prestó el servicio.",
                ))
                risk += 35
        except ValueError:
            pass

    # ── NCCI-001: Add-on code without primary ─────────────────────────
    for addon, primaries in ADD_ON.items():
        if addon in cpt_set and not any(p in cpt_set for p in primaries):
            issues.append(Issue(
                code="NCCI-001", sev=Severity.error,
                tEn=f"{addon} billed without primary code",
                tEs=f"{addon} facturado sin código primario",
                dEn=f"{addon} is an add-on code and cannot be billed alone. Requires one of: {', '.join(primaries[:4])}.",
                dEs=f"{addon} es código de adición y no puede facturarse solo. Requiere uno de: {', '.join(primaries[:4])}.",
            ))
            fixes.append(Fix(
                tEn=f"Add primary code for {addon}",
                tEs=f"Agregar código primario para {addon}",
                wEn=f"Bill {addon} together with its required primary code ({', '.join(primaries[:3])}) or remove it.",
                wEs=f"Facture {addon} junto con su código primario requerido ({', '.join(primaries[:3])}) o elimínelo.",
            ))
            risk += 45

    # ── NCCI-002: Mutually exclusive code pairs ───────────────────────
    for col1, col2 in NCCI_PAIRS:
        if col1 in cpt_set and col2 in cpt_set:
            all_mods = {m for sl in slines if sl.cpt in (col1, col2) for m in sl.mods}
            if not all_mods & {"59","XE","XS","XP","XU"}:
                issues.append(Issue(
                    code="NCCI-002", sev=Severity.error,
                    tEn=f"NCCI conflict: {col1} + {col2}",
                    tEs=f"Conflicto NCCI: {col1} + {col2}",
                    dEn=f"NCCI edit: {col2} is bundled into {col1}. Requires modifier 59 or an X-modifier (XE/XS/XP/XU) documenting a separate, distinct service.",
                    dEs=f"Edición NCCI: {col2} está incluido en {col1}. Requiere modificador 59 o un modificador X (XE/XS/XP/XU) que documente un servicio separado y distinto.",
                ))
                fixes.append(Fix(
                    tEn=f"Add modifier 59 or X-modifier to {col2}",
                    tEs=f"Agregar modificador 59 o X a {col2}",
                    wEn=f"If the services were truly separate encounters, add modifier 59 (or XE/XS/XP/XU) to {col2} and document the clinical rationale.",
                    wEs=f"Si los servicios fueron en verdad encuentros separados, agregue el modificador 59 (o XE/XS/XP/XU) a {col2} y documente la justificación clínica.",
                ))
                risk += 40

    # ── CMS-002: Modifier 25 required on E&M when billed with psychotherapy add-on
    if ("90833" in cpt_set or "90836" in cpt_set):
        for sl in slines:
            if sl.cpt in EM_CODES and "25" not in sl.mods:
                issues.append(Issue(
                    code="CMS-002", sev=Severity.error,
                    tEn=f"Modifier 25 missing on {sl.cpt}",
                    tEs=f"Modificador 25 ausente en {sl.cpt}",
                    dEn=f"When billing {sl.cpt} on the same day as a psychotherapy add-on (90833/90836), modifier 25 is required on the E&M to document a separately identifiable service.",
                    dEs=f"Al facturar {sl.cpt} el mismo día que un complemento de psicoterapia (90833/90836), el modificador 25 es requerido en el E&M para documentar un servicio separado identificable.",
                ))
                fixes.append(Fix(
                    tEn=f"Add modifier 25 to {sl.cpt}",
                    tEs=f"Agregar modificador 25 a {sl.cpt}",
                    wEn=f"Append modifier 25 to {sl.cpt} and ensure the clinical note documents the E&M as a separate, distinct service beyond the psychotherapy session.",
                    wEs=f"Agregue el modificador 25 a {sl.cpt} y asegúrese de que la nota clínica documente el E&M como un servicio separado y distinto de la sesión de psicoterapia.",
                ))
                risk += 35

    # ── General telehealth modifier check (POS 02) ────────────────────
    pos = str(claim.pos or "11")
    if pos == "02":
        for sl in slines:
            if sl.cpt in TELEHEALTH_ELIGIBLE and not ({"GT","95"} & set(sl.mods)):
                issues.append(Issue(
                    code="ASES-003", sev=Severity.error,
                    tEn=f"Telehealth modifier missing on {sl.cpt}",
                    tEs=f"Modificador de telesalud ausente en {sl.cpt}",
                    dEn=f"{sl.cpt} is billed with POS 02 (telehealth) but lacks modifier GT or 95. Most PR payers require GT for synchronous telehealth.",
                    dEs=f"{sl.cpt} se factura con POS 02 (telesalud) pero le falta el modificador GT o 95. La mayoría de pagadores PR requieren GT para telesalud sincrónica.",
                ))
                fixes.append(Fix(
                    tEn=f"Add modifier GT to {sl.cpt}",
                    tEs=f"Agregar modificador GT a {sl.cpt}",
                    wEn=f"Append modifier GT (or 95 for audio/video telehealth) to {sl.cpt} in the SV1 segment.",
                    wEs=f"Agregue el modificador GT (o 95 para telesalud audio/video) a {sl.cpt} en el segmento SV1.",
                ))
                risk += 35

    return issues, fixes, risk
