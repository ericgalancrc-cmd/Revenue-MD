import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, ClipboardList, Brain, ReceiptText, BarChart3, Bell,
  Settings, LogOut, Search, Upload, ShieldCheck, Languages, AlertTriangle,
  FileWarning, Lightbulb, Clock, CheckCircle2, TrendingUp, TrendingDown,
  FileText, ChevronRight, Stethoscope, Send, Eye, Building2, Scale, Lock,
  FileScan, Loader2, Sparkles, ArrowRight, CircleAlert, BookOpen, FileSearch,
  Activity, ArrowUpRight, Zap, Briefcase, Target, Rocket, Award, Users, Globe,
  Download, Plug, FileInput, Network, Building, Layers, CheckSquare, Square, ListChecks,
  Menu, X,
} from "lucide-react";

// ============================================================================
// RevenueMD — Refined UI ("Clinical Precision" aesthetic)
// Deep ink + teal palette · serif display + clean sans · layered depth ·
// staggered reveals · polished micro-interactions. Bilingual EN/ES.
// ============================================================================

// ---- Design tokens (RevenueMD — navy + teal, matched to logo) ----
const C = {
  ink: "#10245C", ink2: "#1A357F", paper: "#F4F6FB", paper2: "#FBFCFE",
  line: "#DCE3F0", lineSoft: "#E8EDF7",
  teal: "#16B6C9", tealDk: "#0E8FA0", tealSoft: "#E0F6F9", tealMute: "#BCEAF0",
  amber: "#C77D1A", amberSoft: "#FBF0DC", red: "#C0392F", redSoft: "#FBEAE7",
  blue: "#2C5FB5", blueSoft: "#E8EFF9", purple: "#6B5BC4", purpleSoft: "#ECE9F8",
  txt: "#16244D", txt2: "#54618A", txt3: "#9AA4C0",
  gold: "#16B6C9",
};
const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const FONT_SANS = "'Outfit', ui-sans-serif, system-ui, sans-serif";

const T = {
  en: {
    tagline: "Catch denials before they happen. Code with confidence. Get paid faster.",
    email: "Work email", password: "Password", role: "Your role", signIn: "Enter platform",
    demoNote: "Demo — any credentials work", coder: "Coder", biller: "Biller", manager: "Manager",
    nav_dash: "Overview", nav_intake: "Intake", nav_claims: "Claims", nav_analysis: "AI Analysis",
    nav_denials: "Denials", nav_revenue: "Revenue", nav_payers: "Payers", nav_compliance: "Compliance",
    nav_settings: "Settings", logout: "Sign out", nav_business: "Business", nav_batch: "Batch queue",
    batchTitle: "Batch queue", batchSub: "Import one file, work many claims. We scrub and triage every claim so your attention goes where it matters.",
    batchDrop: "Import a batch file", batchDropSub: "EDI 837 (hundreds of claims) or CSV — try a sample of 42", batchLoad: "Load sample batch", batchReading: "Reading 837 · scrubbing 42 claims · triaging…",
    bImported: "Imported", bAutoClear: "Auto-clear", bNeedAtt: "Need attention", bAtRisk: "$ at risk",
    bSelected: "selected", bApprove: "Approve selected", bAssign: "Assign", bExport: "Export",
    bLaneHint: "Tap a lane to select all in it", bNeedsWork: "Needs work", bQuickReview: "Quick review",
    bShowing: "Showing 8 of 42 · sorted by attention needed", bMore: "+ 34 more auto-clear claims below", bTuneNote: "Triage thresholds are sensible defaults — tune against real denial data before production.",
    bizTitle: "Business overview", bizSub: "The model, the market position, and the projected path. Figures are illustrative projections, not guarantees.",
    bizConcept: "Find issues before submission, fix them instantly, and get paid more — faster.",
    bizModelT: "Revenue model", bizMargT: "Margins & milestones", bizMoatT: "Why we win in Puerto Rico", bizGrowthT: "5-year growth (illustrative)", bizRaiseT: "The raise", bizExitT: "Exit potential",
    bizSubRev: "SaaS subscriptions", bizSubRevD: "Monthly / annual — the primary, recurring revenue.",
    bizUsage: "Usage-based", bizUsageD: "Per-claim pricing that scales with volume.",
    bizEnt: "Enterprise licensing", bizEntD: "For large provider systems.",
    bizPerf: "Performance upside", bizPerfD: "Optional fees tied to revenue improvement.",
    bizArpu: "Avg. revenue / provider", bizArpuV: "$10K–$18K / yr",
    bizGross: "Gross margin", bizGrossV: "~50% → ~75%", bizGrossD: "expands with scale",
    bizBreak: "Break-even", bizBreakV: "Year 3", bizEbitda: "EBITDA positive", bizEbitdaV: "Years 4–5",
    bizRaiseV: "$750K – $1.2M", bizRaiseD: "24–30 months runway · allocated to revenue acceleration, not speculative research.",
    bizExitV: "$22M – $45M", bizExitD: "implied at ~$4.5M Year-5 ARR (healthcare SaaS trades at 5–10× ARR), excluding expansion beyond PR.",
    bizUse1: "AI model development & training", bizUse2: "Platform engineering & security", bizUse3: "Pilot deployments & integrations", bizUse4: "Early sales & onboarding",
    moat1: "First-mover in PR", moat1D: "No PR company offers this end-to-end. The closest, Vesta AI, focuses on post-submission appeals — not pre-submission denial prevention.",
    moat2: "Proprietary ASES / Plan Vital rules engine", moat2D: "Payer-specific logic that catches denials before claims are sent — the core defensible asset.",
    moat3: "Bilingual clinical interpretation", moat3D: "English/Spanish note reading built for Puerto Rico, not bolted on.",
    moat4: "Compliance by design", moat4D: "HIPAA-aware workflows and PR-specific rules baked into every step.",
    yr: "Year", providers: "Providers", revenue: "Revenue", ebitda: "EBITDA",
    projNote: "Illustrative projections — actual results will vary.",
    greeting: "Good morning", today: "Four claims need your eyes before the Plan Vital deadline.",
    m_revenue: "Revenue recovered", m_denial: "Denial rate", m_approval: "Approval rate", m_under: "Undercoding caught",
    thisMonth: "this month", target: "toward 90% target", opportunity: "recoverable",
    priorityTitle: "Needs review now", priorityBody: "7 high-risk claims · $9,400 at risk before timely-filing closes",
    reviewNow: "Review queue", recent: "Live activity", viewAll: "View all",
    search: "Search claims, codes, payers…", upload: "Upload record", all: "All", highRisk: "High-risk", pending: "Pending", denied: "Denied",
    open: "Open", denialRisk: "Denial risk", compliance: "Compliance", docQuality: "Documentation",
    runAnalysis: "Run AI analysis", analyzing: "Analyzing…", issues: "What we found", sugg: "Suggested fixes",
    aiSummary: "AI assessment", markReviewed: "Approve & mark reviewed", apply: "Apply fix", dismiss: "Dismiss", back: "Back to claims",
    lostRevenue: "Lost", toAppeal: "left to appeal", aiStrategy: "AI appeal strategy", buildAppeal: "Build appeal", reviewed: "Reviewed",
    footer: "HIPAA-aware · AI is decision support only · a human approves every claim",
    intakeTitle: "Bring in claims & records", intakeSub: "Import claims from your billing system, or scan a medical record. Everything gets scrubbed before submission.",
    tabImport: "Import claims", tabScan: "Scan record",
    importSub: "Pull claims from any billing company — we read the standard EDI 837 file every system exports, plus CSV.",
    fileImport: "File import", fileImportD: "Upload an EDI 837 or CSV export. Works with every vendor today.",
    apiConnect: "Direct connection", apiConnectD: "Auto-sync via the vendor's API. Requires a data-sharing agreement.",
    available: "Available now", roadmap: "On the roadmap", connect: "Connect", importBtn: "Import a claim file",
    importedOk: "Imported & ready to scrub", importedFrom: "from", viewImported: "Open in claim workspace",
    howWorks: "How it flows", flow1: "Export an 837/CSV from your billing system", flow2: "RevenueMD reads & normalizes the claim", flow3: "Rules engine + AI scrub it for denials", flow4: "Send the clean claim on to your clearinghouse",
    importNote: "RevenueMD sits before your clearinghouse (e.g. Inmediata) — it scrubs claims, it does not submit them.",
    drop: "Drop a record or click to browse", dropSub: "PDF · JPG · PNG — up to 25 MB", loadSample: "Try a sample record",
    scanning: "Reading codes…", extracted: "Extracted billing data", confidence: "OCR confidence", language: "Language",
    createClaim: "Create claim from this", reviewNote: "OCR is a starting point — confirm before creating a claim.",
    cpt: "CPT / HCPCS", icd: "ICD-10", mods: "Modifiers", units: "Units", dos: "Service date", npi: "Provider NPI", auth: "Authorization", none: "Not found",
    payersTitle: "Payer intelligence", payersSub: "Billing behavior and rules for every Puerto Rico payer you bill.",
    lob: "Lines of business", facts: "Key billing facts",
    compTitle: "Compliance center", compSub: "PR Medicaid billing + HIPAA privacy rules, each with its source.",
    tab_billing: "Billing rules", tab_privacy: "Privacy & HIPAA",
    v_statutory: "Statutory", v_published: "Published", v_needs: "Verify first",
    verifyBanner: "rules need verification against current manuals before production use",
    disclaimerT: "Not legal advice", disclaimer: "Items marked “verify first” are placeholders modeled on common patterns and must be confirmed against current ASES and payer manuals by a certified PR coder.",
  },
  es: {
    tagline: "Detecta denegaciones antes de que ocurran. Codifica con confianza. Cobra más rápido.",
    email: "Correo de trabajo", password: "Contraseña", role: "Tu rol", signIn: "Entrar a la plataforma",
    demoNote: "Demo — cualquier credencial funciona", coder: "Codificador", biller: "Facturador", manager: "Gerente",
    nav_dash: "Resumen", nav_intake: "Recepción", nav_claims: "Reclamos", nav_analysis: "Análisis IA",
    nav_denials: "Denegaciones", nav_revenue: "Ingresos", nav_payers: "Pagadores", nav_compliance: "Cumplimiento",
    nav_settings: "Ajustes", logout: "Salir", nav_business: "Negocio", nav_batch: "Cola por lote",
    batchTitle: "Cola por lote", batchSub: "Importa un archivo, trabaja muchos reclamos. Revisamos y clasificamos cada uno para que tu atención vaya donde importa.",
    batchDrop: "Importar un archivo de lote", batchDropSub: "EDI 837 (cientos de reclamos) o CSV — prueba una muestra de 42", batchLoad: "Cargar lote de muestra", batchReading: "Leyendo 837 · revisando 42 reclamos · clasificando…",
    bImported: "Importados", bAutoClear: "Auto-aprobables", bNeedAtt: "Requieren atención", bAtRisk: "$ en riesgo",
    bSelected: "seleccionados", bApprove: "Aprobar selección", bAssign: "Asignar", bExport: "Exportar",
    bLaneHint: "Toca un carril para seleccionar todo", bNeedsWork: "Requiere trabajo", bQuickReview: "Revisión rápida",
    bShowing: "Mostrando 8 de 42 · ordenados por atención", bMore: "+ 34 reclamos auto-aprobables más", bTuneNote: "Los umbrales de clasificación son valores predeterminados — ajústalos con datos reales antes de producción.",
    bizTitle: "Resumen del negocio", bizSub: "El modelo, la posición de mercado y la trayectoria proyectada. Las cifras son proyecciones ilustrativas, no garantías.",
    bizConcept: "Detecta problemas antes de someter, corrígelos al instante, y cobra más — más rápido.",
    bizModelT: "Modelo de ingresos", bizMargT: "Márgenes e hitos", bizMoatT: "Por qué ganamos en Puerto Rico", bizGrowthT: "Crecimiento a 5 años (ilustrativo)", bizRaiseT: "La ronda", bizExitT: "Potencial de salida",
    bizSubRev: "Suscripciones SaaS", bizSubRevD: "Mensual / anual — el ingreso principal y recurrente.",
    bizUsage: "Por uso", bizUsageD: "Precio por reclamo que escala con el volumen.",
    bizEnt: "Licencias empresariales", bizEntD: "Para grandes sistemas de proveedores.",
    bizPerf: "Ingreso por desempeño", bizPerfD: "Tarifas opcionales ligadas a la mejora de ingresos.",
    bizArpu: "Ingreso prom. / proveedor", bizArpuV: "$10K–$18K / año",
    bizGross: "Margen bruto", bizGrossV: "~50% → ~75%", bizGrossD: "se expande con escala",
    bizBreak: "Punto de equilibrio", bizBreakV: "Año 3", bizEbitda: "EBITDA positivo", bizEbitdaV: "Años 4–5",
    bizRaiseV: "$750K – $1.2M", bizRaiseD: "24–30 meses de margen · asignado a aceleración de ingresos, no a investigación especulativa.",
    bizExitV: "$22M – $45M", bizExitD: "implícito con ~$4.5M de ARR en Año 5 (SaaS de salud cotiza a 5–10× ARR), excluyendo expansión fuera de PR.",
    bizUse1: "Desarrollo y entrenamiento del modelo IA", bizUse2: "Ingeniería de plataforma y seguridad", bizUse3: "Despliegues piloto e integraciones", bizUse4: "Ventas iniciales y onboarding",
    moat1: "Primer jugador en PR", moat1D: "Ninguna empresa de PR ofrece esto de extremo a extremo. La más cercana, Vesta AI, se enfoca en apelaciones post-envío — no en prevención antes de someter.",
    moat2: "Motor de reglas ASES / Plan Vital propietario", moat2D: "Lógica específica del pagador que detecta denegaciones antes de enviar — el activo defensible central.",
    moat3: "Interpretación clínica bilingüe", moat3D: "Lectura de notas en inglés/español hecha para Puerto Rico, no añadida después.",
    moat4: "Cumplimiento por diseño", moat4D: "Flujos compatibles con HIPAA y reglas específicas de PR en cada paso.",
    yr: "Año", providers: "Proveedores", revenue: "Ingresos", ebitda: "EBITDA",
    projNote: "Proyecciones ilustrativas — los resultados reales variarán.",
    greeting: "Buenos días", today: "Cuatro reclamos necesitan tu revisión antes del límite de Plan Vital.",
    m_revenue: "Ingresos recuperados", m_denial: "Tasa de denegación", m_approval: "Tasa de aprobación", m_under: "Subcodificación detectada",
    thisMonth: "este mes", target: "hacia la meta de 90%", opportunity: "recuperable",
    priorityTitle: "Requiere revisión ahora", priorityBody: "7 reclamos de alto riesgo · $9,400 en riesgo antes del cierre",
    reviewNow: "Ver cola", recent: "Actividad en vivo", viewAll: "Ver todo",
    search: "Buscar reclamos, códigos, pagadores…", upload: "Cargar expediente", all: "Todos", highRisk: "Alto riesgo", pending: "Pendiente", denied: "Denegado",
    open: "Abrir", denialRisk: "Riesgo de denegación", compliance: "Cumplimiento", docQuality: "Documentación",
    runAnalysis: "Ejecutar análisis IA", analyzing: "Analizando…", issues: "Lo que encontramos", sugg: "Correcciones sugeridas",
    aiSummary: "Evaluación IA", markReviewed: "Aprobar y marcar revisado", apply: "Aplicar", dismiss: "Descartar", back: "Volver a reclamos",
    lostRevenue: "Perdido", toAppeal: "para apelar", aiStrategy: "Estrategia de apelación IA", buildAppeal: "Crear apelación", reviewed: "Revisado",
    footer: "Compatible con HIPAA · IA solo apoya decisiones · un humano aprueba cada reclamo",
    intakeTitle: "Trae reclamos y expedientes", intakeSub: "Importa reclamos desde tu sistema de facturación, o escanea un expediente. Todo se revisa antes de someter.",
    tabImport: "Importar reclamos", tabScan: "Escanear expediente",
    importSub: "Importa reclamos de cualquier compañía de facturación — leemos el archivo estándar EDI 837 que todo sistema exporta, además de CSV.",
    fileImport: "Importar archivo", fileImportD: "Sube un EDI 837 o CSV. Funciona con todos los proveedores hoy.",
    apiConnect: "Conexión directa", apiConnectD: "Sincroniza vía la API del proveedor. Requiere acuerdo de datos.",
    available: "Disponible ahora", roadmap: "En el plan", connect: "Conectar", importBtn: "Importar un archivo de reclamos",
    importedOk: "Importado y listo para revisar", importedFrom: "desde", viewImported: "Abrir en el área de reclamos",
    howWorks: "Cómo fluye", flow1: "Exporta un 837/CSV de tu sistema", flow2: "RevenueMD lee y normaliza el reclamo", flow3: "El motor de reglas + IA lo revisan", flow4: "Envía el reclamo limpio a tu clearinghouse",
    importNote: "RevenueMD va antes de tu clearinghouse (ej. Inmediata) — revisa los reclamos, no los somete.",
    scanRecord: "Escanear expediente",
    drop: "Suelta un expediente o haz clic", dropSub: "PDF · JPG · PNG — hasta 25 MB", loadSample: "Probar expediente de muestra",
    scanning: "Leyendo códigos…", extracted: "Datos de facturación extraídos", confidence: "Confianza OCR", language: "Idioma",
    createClaim: "Crear reclamo con esto", reviewNote: "El OCR es un punto de partida — confirma antes de crear un reclamo.",
    cpt: "CPT / HCPCS", icd: "ICD-10", mods: "Modificadores", units: "Unidades", dos: "Fecha de servicio", npi: "NPI proveedor", auth: "Autorización", none: "No encontrado",
    payersTitle: "Inteligencia de pagadores", payersSub: "Comportamiento y reglas de facturación de cada pagador de Puerto Rico.",
    lob: "Líneas de negocio", facts: "Datos clave",
    compTitle: "Centro de cumplimiento", compSub: "Reglas de facturación Medicaid PR + privacidad HIPAA, cada una con su fuente.",
    tab_billing: "Reglas de facturación", tab_privacy: "Privacidad y HIPAA",
    v_statutory: "Estatutario", v_published: "Publicado", v_needs: "Verificar",
    verifyBanner: "reglas necesitan verificación contra manuales vigentes antes de producción",
    disclaimerT: "No es asesoría legal", disclaimer: "Los elementos “verificar” son marcadores basados en patrones comunes y deben confirmarse contra los manuales vigentes de ASES y pagadores por un codificador certificado de PR.",
  },
};

const CLAIMS_DEMO = [
  { id: "PV-2024-0851", patient: "Patient #4471", codes: "H0004 ×10", payer: "Plan Vital", provider: "Dr. Rivera, LCSW", dos: "Apr 21", risk: 78, status: "high", billed: 1850,
    sEn: "High denial risk. Billed 10 units of H0004 — Plan Vital caps this at 8/day. Missing prior authorization for the extended counseling series.",
    sEs: "Alto riesgo. Se facturaron 10 unidades de H0004 — Plan Vital limita a 8/día. Falta autorización previa para la serie extendida.",
    comp: 41, doc: 55,
    issues: [
      { sev: "error", tEn: "Unit limit exceeded", tEs: "Límite de unidades excedido", dEn: "H0004 billed at 10 units; Plan Vital max is 8/day.", dEs: "H0004 a 10 unidades; máximo Plan Vital es 8/día." },
      { sev: "error", tEn: "Authorization required", tEs: "Autorización requerida", dEn: "Extended series needs prior auth — none on claim.", dEs: "Serie extendida requiere autorización — no hay en el reclamo." },
      { sev: "warning", tEn: "Diagnosis unsupported", tEs: "Diagnóstico no respaldado", dEn: "ICD-10 present but not documented in the note.", dEs: "ICD-10 presente pero no documentado en la nota." },
    ],
    fix: [{ tEn: "Reduce H0004 to 8 units", tEs: "Reducir H0004 a 8 unidades", wEn: "Brings the claim within the Plan Vital daily cap.", wEs: "Ajusta al tope diario de Plan Vital." }] },
  { id: "PV-2024-0847", patient: "Patient #4452", codes: "90837 + 90785", payer: "Plan Vital", provider: "Dr. Colón, PhD", dos: "Apr 22", risk: 34, status: "pending", billed: 245,
    sEn: "Moderate risk. The 60-minute session with interactive complexity is well coded, but the treatment-plan reference is missing and an auth number may be required.",
    sEs: "Riesgo moderado. La sesión de 60 min con complejidad interactiva está bien codificada, pero falta la referencia al plan de tratamiento y puede requerir autorización.",
    comp: 72, doc: 68,
    issues: [
      { sev: "warning", tEn: "Treatment plan reference missing", tEs: "Falta referencia al plan de tratamiento", dEn: "90837 needs a treatment-plan reference in the note.", dEs: "90837 requiere referencia al plan en la nota." },
      { sev: "info", tEn: "Interactive complexity supported", tEs: "Complejidad interactiva respaldada", dEn: "Caregiver involvement documented — 90785 is appropriate.", dEs: "Participación del cuidador documentada — 90785 apropiado." },
    ],
    fix: [{ tEn: "Add treatment-plan date to the note", tEs: "Añadir fecha del plan a la nota", wEn: "Satisfies the Plan Vital documentation rule for 90837.", wEs: "Cumple la regla de documentación de Plan Vital para 90837." }] },
  { id: "TS-2024-0610", patient: "Patient #5120", codes: "99214 + 90833", payer: "Triple-S", provider: "Dr. Méndez, MD", dos: "Apr 19", risk: 48, status: "high", billed: 320,
    sEn: "Elevated risk. E&M with a psychotherapy add-on for a Triple-S commercial member — verify the add-on is separately documented and the BlueCard prefix routes correctly.",
    sEs: "Riesgo elevado. E&M con complemento de psicoterapia para miembro comercial Triple-S — verifica documentación separada y el prefijo BlueCard.",
    comp: 60, doc: 64,
    issues: [
      { sev: "warning", tEn: "Verify BlueCard prefix", tEs: "Verifica prefijo BlueCard", dEn: "The 3-character prefix routes the claim — confirm it.", dEs: "El prefijo de 3 caracteres enruta el reclamo — confírmalo." },
      { sev: "info", tEn: "Add-on documentation", tEs: "Documentación del complemento", dEn: "90833 must be documented apart from the E&M.", dEs: "90833 debe documentarse aparte del E&M." },
    ],
    fix: [{ tEn: "Confirm member prefix on the ID card", tEs: "Confirma el prefijo en la tarjeta", wEn: "Ensures correct BlueCard routing, avoiding a routing denial.", wEs: "Asegura el enrutamiento BlueCard correcto." }] },
  { id: "PV-2024-0853", patient: "Patient #4488", codes: "90834 GT", payer: "Plan Vital", provider: "Dr. Colón, PhD", dos: "Apr 23", risk: 12, status: "pending", billed: 195,
    sEn: "Low risk. Telehealth psychotherapy is well documented — platform noted, modifier correct. A clean claim, ready to go.",
    sEs: "Bajo riesgo. Psicoterapia por telesalud bien documentada — plataforma indicada, modificador correcto. Reclamo limpio, listo.",
    comp: 94, doc: 91,
    issues: [{ sev: "info", tEn: "Clean claim", tEs: "Reclamo limpio", dEn: "All Plan Vital telehealth requirements met.", dEs: "Todos los requisitos de telesalud cumplidos." }],
    fix: [] },
];

const DENIALS = [
  { id: "PV-2024-0792", rEn: "Missing prior authorization", rEs: "Falta autorización previa", lost: 680, days: 18 },
  { id: "PV-2024-0788", rEn: "Unit limit exceeded (H0004)", rEs: "Límite de unidades excedido (H0004)", lost: 420, days: 24 },
  { id: "TS-2024-0590", rEn: "Incorrect BlueCard prefix", rEs: "Prefijo BlueCard incorrecto", lost: 310, days: 31 },
];

const PAYERS = [
  { id: "PLANVITAL", name: "Plan Vital", sub: "ASES · Medicaid", color: C.teal, soft: C.tealSoft, lob: ["Medicaid"],
    facts: [{ lEn: "Government Health Plan for ~1.6M residents", lEs: "Plan de Salud del Gobierno para ~1.6M", v: "published" },
            { lEn: "Behavioral-health co-location rules apply", lEs: "Aplican reglas de co-localización de salud conductual", v: "published" },
            { lEn: "Exact unit caps & auth thresholds — verify", lEs: "Topes y umbrales exactos — verificar", v: "needs" }] },
  { id: "TRIPLES", name: "Triple-S Salud", sub: "BCBS · GHP · commercial", color: C.blue, soft: C.blueSoft, lob: ["Medicaid", "MA", "Commercial"],
    facts: [{ lEn: "BCBS licensee for PR & USVI — submit Blue claims to Triple-S", lEs: "Licenciatario BCBS para PR y USVI", v: "published" },
            { lEn: "3-character prefix routes BlueCard claims", lEs: "Prefijo de 3 caracteres enruta reclamos BlueCard", v: "published" },
            { lEn: "Non-par reconsideration within 60 days", lEs: "Reconsideración no-par en 60 días", v: "published" }] },
  { id: "MCS", name: "MCS", sub: "Medicare Advantage", color: C.purple, soft: C.purpleSoft, lob: ["MA", "Platino"],
    facts: [{ lEn: "MCS Classicare — Medicare rules apply", lEs: "MCS Classicare — aplican reglas Medicare", v: "published" },
            { lEn: "Platino wrap-around for dual-eligibles", lEs: "Platino para duales", v: "published" },
            { lEn: "MA filing often 90–180 days — verify", lEs: "Presentación MA usualmente 90–180 días — verificar", v: "needs" }] },
  { id: "HUMANA", name: "Humana PR", sub: "MA · Platino · commercial", color: C.blue, soft: C.blueSoft, lob: ["MA", "Platino", "Commercial"],
    facts: [{ lEn: "MA claims within 1 year of date of service", lEs: "Reclamos MA dentro de 1 año de la fecha", v: "published" },
            { lEn: "Commercial filing per provider contract", lEs: "Presentación comercial por contrato", v: "published" },
            { lEn: "PR Prompt Payment Law protections", lEs: "Protecciones de la Ley de Pago Puntual PR", v: "statutory" }] },
  { id: "MMM", name: "MMM", sub: "Medicaid · MA · Platino", color: C.purple, soft: C.purpleSoft, lob: ["Medicaid", "MA", "Platino"],
    facts: [{ lEn: "MMM Multi Health is a Vital/Medicaid plan", lEs: "MMM Multi Health es plan Vital/Medicaid", v: "published" },
            { lEn: "Platino pays claims including outside PR", lEs: "Platino paga reclamos incluso fuera de PR", v: "published" },
            { lEn: "MA filing often 90–180 days — verify", lEs: "Presentación MA usualmente 90–180 días — verificar", v: "needs" }] },
  { id: "MENONITA", name: "Plan Menonita", sub: "GHP · Medicaid", color: C.teal, soft: C.tealSoft, lob: ["Medicaid"],
    facts: [{ lEn: "Vital/Medicaid plan — ASES rules apply", lEs: "Plan Vital/Medicaid — aplican reglas ASES", v: "published" },
            { lEn: "Affiliated with the Mennonite health system", lEs: "Afiliado al sistema de salud Menonita", v: "published" },
            { lEn: "Plan-specific overlays — verify", lEs: "Reglas específicas del plan — verificar", v: "needs" }] },
];

const BILLING_RULES = [
  { code: "PR-MED-001", sev: "error", v: "published", en: "Medical necessity required for all covered services", es: "Necesidad médica requerida para servicios cubiertos", src: "ASES Plan Vital Provider Guideline 2024" },
  { code: "PR-MED-011", sev: "error", v: "needs", en: "Daily unit caps on HCPCS behavioral-health services", es: "Topes diarios de unidades HCPCS de salud conductual", src: "Placeholder — current ASES fee schedule" },
  { code: "PR-MED-012", sev: "error", v: "needs", en: "Prior authorization for extended BH series", es: "Autorización previa para series extendidas", src: "Placeholder — ASES authorization grid" },
  { code: "PR-MED-014", sev: "warning", v: "published", en: "CCI / bundling edits apply to same-day services", es: "Ediciones CCI / agrupación aplican el mismo día", src: "CMS NCCI Policy Manual" },
];
const PRIVACY_RULES = [
  { code: "PR-PRIV-001", sev: "error", v: "statutory", en: "Stricter standard controls (HIPAA + PR Act 194)", es: "Controla el estándar más estricto (HIPAA + Ley 194)", src: "HIPAA + PR Act 194, 24 LPRA §3049" },
  { code: "PR-PRIV-002", sev: "error", v: "statutory", en: "Confidentiality of medical records (Act 194 §3049)", es: "Confidencialidad de expedientes (Ley 194 §3049)", src: "24 LPRA §3049" },
  { code: "PR-PRIV-005", sev: "error", v: "statutory", en: "Psychotherapy notes need explicit authorization", es: "Notas de psicoterapia requieren autorización explícita", src: "HIPAA 45 CFR §164.508(a)(2)" },
  { code: "PR-PRIV-009", sev: "error", v: "statutory", en: "Business Associate Agreements required for vendors", es: "Acuerdos de Asociado Comercial requeridos", src: "HIPAA 45 CFR §164.504(e)" },
];

const SAMPLE = { lang: "es", confidence: 94, cpt: ["90837", "90785"], icd: ["F32.1", "F41.1"], mods: ["GT"], units: "90837·1  90785·1", dos: "Apr 22, 2024", npi: "1457382910", auth: null };

const GROWTH = [
  { yr: "1", prov: 15, rev: 150000, ebitda: -375000 },
  { yr: "2", prov: 40, rev: 480000, ebitda: -292000 },
  { yr: "3", prov: 90, rev: 1350000, ebitda: 77500 },
  { yr: "4", prov: 160, rev: 2720000, ebitda: 854000 },
  { yr: "5", prov: 250, rev: 4500000, ebitda: 2025000 },
];
const fmtK = (n) => { const a = Math.abs(n); const s = n < 0 ? "-$" : "$"; return a >= 1e6 ? s + (a / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M" : s + Math.round(a / 1000) + "K"; };

const IMPORT_SOURCES = [
  { id: "inmediata", name: "Inmediata", sub: "PR clearinghouse", icon: Building2 },
  { id: "assertus", name: "Assertus", sub: "PR billing / RCM", icon: Building },
  { id: "practice_fusion", name: "Practice Fusion", sub: "EHR / PM", icon: Stethoscope },
  { id: "edi837", name: "Any EDI 837 file", sub: "National standard", icon: FileText },
];
const API_SOURCES = [
  { name: "Inmediata API" }, { name: "Assertus API" }, { name: "Practice Fusion API" },
];

const BATCH_LANES = { needs_work: ["Needs work", "#C0392F", "#FBEAE7"], quick_review: ["Quick review", "#C77D1A", "#FBF0DC"], auto_clear: ["Auto-clear", "#0E8C6B", "#E2F3EC"] };
const BATCH_SEED = [
  { id: "PV-2024-0851", payer: "Plan Vital", codes: "H0004×10", prov: "Dr. Rivera", risk: 88, lane: "needs_work", val: 1850, sel: false, st: "pending", iEn: "Over 8-unit cap · no auth", iEs: "Sobre tope de 8 · sin autorización" },
  { id: "TS-2024-0610", payer: "Triple-S", codes: "99214 + 90833", prov: "Dr. Méndez", risk: 48, lane: "needs_work", val: 320, sel: false, st: "pending", iEn: "Verify BlueCard prefix", iEs: "Verifica prefijo BlueCard" },
  { id: "PV-2024-0847", payer: "Plan Vital", codes: "90837 + 90785", prov: "Dr. Colón", risk: 34, lane: "quick_review", val: 245, sel: false, st: "pending", iEn: "Treatment-plan ref missing", iEs: "Falta ref. al plan" },
  { id: "PV-2024-0853", payer: "Plan Vital", codes: "90834 GT", prov: "Dr. Colón", risk: 12, lane: "auto_clear", val: 195, sel: true, st: "pending", iEn: "", iEs: "" },
  { id: "PV-2024-0860", payer: "Plan Vital", codes: "90834", prov: "Dr. Rivera", risk: 9, lane: "auto_clear", val: 210, sel: true, st: "pending", iEn: "", iEs: "" },
  { id: "PV-2024-0861", payer: "Plan Vital", codes: "90791", prov: "Dr. Colón", risk: 11, lane: "auto_clear", val: 280, sel: true, st: "pending", iEn: "", iEs: "" },
  { id: "MMM-2024-0204", payer: "MMM", codes: "90832", prov: "Dr. Méndez", risk: 14, lane: "auto_clear", val: 160, sel: true, st: "pending", iEn: "", iEs: "" },
  { id: "PV-2024-0862", payer: "Plan Vital", codes: "90834 GT", prov: "Dr. Colón", risk: 13, lane: "auto_clear", val: 195, sel: true, st: "pending", iEn: "", iEs: "" },
];

const fmt = (n) => "$" + n.toLocaleString("en-US");
const SEV = { error: { c: C.red, bg: C.redSoft, icon: AlertTriangle }, warning: { c: C.amber, bg: C.amberSoft, icon: FileWarning }, info: { c: C.blue, bg: C.blueSoft, icon: Lightbulb } };
const VB = { statutory: { c: C.teal, bg: C.tealSoft, icon: Scale }, published: { c: C.blue, bg: C.blueSoft, icon: BookOpen }, needs: { c: C.amber, bg: C.amberSoft, icon: CircleAlert } };
const rc = (r) => (r >= 60 ? C.red : r >= 30 ? C.amber : C.teal);
const rbg = (r) => (r >= 60 ? C.redSoft : r >= 30 ? C.amberSoft : C.tealSoft);
const SCAN = ["Reading document", "Detecting language", "Parsing codes"];

export default function App() {
  const [lang, setLang] = useState("en");
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState("manager");
  const [tab, setTab] = useState("dash");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openClaim, setOpenClaim] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState({});
  const [reviewed, setReviewed] = useState([]);
  const [appeal, setAppeal] = useState(null);
  const [compTab, setCompTab] = useState("billing");
  const [files, setFiles] = useState([]);
  const [selFile, setSelFile] = useState(null);
  const [openPayer, setOpenPayer] = useState("PLANVITAL");
  const [intakeTab, setIntakeTab] = useState("import");
  const [importing, setImporting] = useState(null);
  const [imported, setImported] = useState(null);
  const [batchLoaded, setBatchLoaded] = useState(false);
  const [batchReading, setBatchReading] = useState(false);
  const [batchQueue, setBatchQueue] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [claims, setClaims] = useState(CLAIMS_DEMO);
  const [csvDrag, setCsvDrag] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState(null);
  const t = T[lang];

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    return lines.slice(1).map((line, i) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
      return {
        id: row.id || `CSV-${Date.now()}-${i}`,
        patient: row.patient || row.patient_name || `Patient #${1000 + i}`,
        codes: row.codes || row.cpt || row.procedure_code || "—",
        payer: row.payer || row.insurance || "Unknown",
        provider: row.provider || row.rendering_provider || "—",
        dos: row.dos || row.date_of_service || row.service_date || "—",
        risk: parseInt(row.risk) || 50,
        status: row.status || "pending",
        billed: parseFloat(row.billed || row.billed_amount || 0),
        comp: parseInt(row.compliance) || 70,
        doc: parseInt(row.documentation) || 70,
        sEn: "Imported claim — run AI analysis for a full risk assessment.",
        sEs: "Reclamo importado — ejecuta el análisis IA para una evaluación completa.",
        issues: [],
        fix: [],
      };
    }).filter((c) => c.id);
  };

  const handleCSVFile = (file) => {
    if (!file) return;
    setCsvImporting(true);
    setCsvResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        const parsed = parseCSV(e.target.result);
        if (parsed.length) {
          setClaims((prev) => [...parsed, ...prev]);
          setCsvResult({ count: parsed.length, name: file.name });
        } else {
          setCsvResult({ error: true, name: file.name });
        }
        setCsvImporting(false);
      }, 900);
    };
    reader.readAsText(file);
  };

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const filtered = useMemo(() => claims.filter((c) => (filter === "all" || c.status === filter) && (!search || c.id.toLowerCase().includes(search.toLowerCase()) || c.codes.toLowerCase().includes(search.toLowerCase()))), [filter, search, claims]);
  const needsCount = [...PAYERS.flatMap((p) => p.facts), ...BILLING_RULES, ...PRIVACY_RULES].filter((x) => x.v === "needs").length;

  const FONTS = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Outfit:wght@300;400;500;600&display=swap');
      * { box-sizing: border-box; }
      ::-webkit-scrollbar { width: 10px; height: 10px; }
      ::-webkit-scrollbar-thumb { background: #C9D2CE; border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
      @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
      .rise { animation: rise .5s cubic-bezier(.2,.7,.3,1) both; }
      .spin { animation: spin 1s linear infinite; }
      .pdot { animation: pulse 1.6s ease-in-out infinite; }
      .navi { transition: all .18s ease; }
      .navi:hover { background: rgba(255,255,255,.06) !important; }
      .lift { transition: transform .2s cubic-bezier(.2,.7,.3,1), box-shadow .2s ease, border-color .2s ease; }
      .lift:hover { transform: translateY(-2px); box-shadow: 0 12px 30px -12px rgba(11,31,42,.18); border-color: ${C.tealMute} !important; }
      .btnp { transition: all .16s ease; }
      .btnp:hover { background: ${C.tealDk} !important; transform: translateY(-1px); }
      .btnp:active { transform: translateY(0); }
      .pill { transition: all .15s ease; }
      .chip { transition: all .15s ease; }
      .chip:hover { transform: translateY(-1px); }
      input::placeholder { color: ${C.txt3}; }
      .app-sidebar { transition: transform .25s ease; }
      .mob-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 199; cursor: pointer; }
      .mob-ham { display: none; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; background: transparent; cursor: pointer; border-radius: 8px; padding: 0; color: ${C.txt}; }
      @media (max-width: 767px) {
        .login-left { display: none !important; }
        .login-right { width: 100% !important; padding: 32px 24px !important; min-height: 100vh !important; justify-content: center !important; }
        .app-sidebar { position: fixed !important; top: 0 !important; left: 0 !important; height: 100vh !important; z-index: 200 !important; transform: translateX(-100%) !important; }
        .app-sidebar.open { transform: translateX(0) !important; }
        .mob-overlay { display: block !important; }
        .mob-ham { display: flex !important; }
        .content-pad { padding: 16px !important; }
        .grid-auto-2 { grid-template-columns: repeat(2, 1fr) !important; }
        .grid-auto-1 { grid-template-columns: 1fr !important; }
        .grid-4col { grid-template-columns: repeat(2, 1fr) !important; }
        .grid-claim-detail { grid-template-columns: 1fr !important; }
        .header-role { display: none !important; }
        .mob-full-btn { width: 100% !important; justify-content: center !important; }
      }
    `}</style>
  );

  // ---------- LOGIN ----------
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT_SANS, background: C.ink }}>
        {FONTS}
        {/* left brand panel */}
        <div className="login-left" style={{ flex: 1, background: `linear-gradient(155deg, ${C.ink} 0%, ${C.ink2} 100%)`, padding: "56px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,140,107,.18), transparent 70%)", top: -120, right: -160 }} />
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,75,.10), transparent 70%)", bottom: -80, left: -100 }} />
          <div className="rise" style={{ display: "flex", alignItems: "center", gap: 13, position: "relative" }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px -8px rgba(14,140,107,.6)" }}><Stethoscope size={24} color="#fff" /></div>
            <div style={{ color: "#fff", fontSize: 21, fontWeight: 600, fontFamily: FONT_DISPLAY }}>Revenue<span style={{ color: C.teal }}>MD</span></div>
          </div>
          <div className="rise" style={{ position: "relative", animationDelay: ".08s" }}>
            <div style={{ color: C.gold, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 18, fontWeight: 500 }}>Revenue Intelligence Software</div>
            <h1 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 40, lineHeight: 1.15, fontWeight: 500, margin: 0, maxWidth: 440 }}>{t.tagline}</h1>
            <div style={{ display: "flex", gap: 26, marginTop: 36 }}>
              {[["$18.2K", t.m_revenue], ["12.4%", t.m_denial], ["6 payers", "Puerto Rico"]].map(([n, l], i) => (
                <div key={i}><div style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 500 }}>{n}</div><div style={{ color: "rgba(255,255,255,.5)", fontSize: 12.5 }}>{l}</div></div>
              ))}
            </div>
          </div>
          <div style={{ color: "rgba(255,255,255,.4)", fontSize: 12, position: "relative", display: "flex", alignItems: "center", gap: 7 }}><ShieldCheck size={14} /> {t.footer}</div>
        </div>
        {/* right form */}
        <div className="login-right" style={{ width: 460, background: C.paper2, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 52px" }}>
          <div className="rise" style={{ animationDelay: ".12s" }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 27, fontWeight: 500, margin: "0 0 6px", color: C.ink }}>{lang === "en" ? "Welcome back" : "Bienvenido"}</h2>
            <p style={{ color: C.txt2, fontSize: 14, margin: "0 0 30px" }}>{t.demoNote}</p>
            <Lbl>{t.email}</Lbl><input defaultValue="demo@clinicapr.com" style={inp} />
            <Lbl mt>{t.password}</Lbl><input type="password" defaultValue="demo1234" style={inp} />
            <Lbl mt>{t.role}</Lbl>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inp}>
              <option value="coder">{t.coder}</option><option value="biller">{t.biller}</option><option value="manager">{t.manager}</option>
            </select>
            <button className="btnp" onClick={() => setAuthed(true)} style={{ ...btnP, width: "100%", marginTop: 26, justifyContent: "center", padding: "13px", fontSize: 14.5 }}>{t.signIn} <ArrowRight size={17} /></button>
            <button onClick={() => setLang(lang === "en" ? "es" : "en")} style={{ ...btnG, margin: "20px auto 0", display: "flex" }}><Languages size={15} /> {lang === "en" ? "Español" : "English"}</button>
          </div>
        </div>
      </div>
    );
  }

  const nav = [
    { id: "dash", icon: LayoutDashboard, label: t.nav_dash },
    { id: "intake", icon: FileScan, label: t.nav_intake },
    { id: "claims", icon: ClipboardList, label: t.nav_claims },
    { id: "analysis", icon: Brain, label: t.nav_analysis },
    { id: "denials", icon: ReceiptText, label: t.nav_denials },
    { id: "revenue", icon: BarChart3, label: t.nav_revenue },
    { id: "payers", icon: Building2, label: t.nav_payers },
    { id: "compliance", icon: ShieldCheck, label: t.nav_compliance },
    { id: "business", icon: Briefcase, label: t.nav_business },
    { id: "batch", icon: Layers, label: t.nav_batch },
  ];

  const runAnalysis = (id) => { setAnalyzing(true); setTimeout(() => { setAnalyzing(false); setAnalyzed((p) => ({ ...p, [id]: true })); }, 1300); };
  const addSample = () => {
    const f = { id: Date.now() + "", name: "expediente_PV_4452.pdf", status: "scanning", stage: 0, preview: null };
    setFiles((p) => [f, ...p]);
    let st = 0;
    const tick = () => { st++; if (st < SCAN.length) { setFiles((p) => p.map((x) => x.id === f.id ? { ...x, stage: st } : x)); setTimeout(tick, 700); } else { setFiles((p) => p.map((x) => x.id === f.id ? { ...x, status: "done", ex: SAMPLE } : x)); setSelFile((s) => s ?? f.id); } };
    setTimeout(tick, 700);
  };

  const addRealFile = (file) => {
    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : null;
    const f = { id: Date.now() + "", name: file.name, status: "scanning", stage: 0, preview: previewUrl, isReal: true };
    setFiles((p) => [f, ...p]);
    let st = 0;
    const tick = () => { st++; if (st < SCAN.length) { setFiles((p) => p.map((x) => x.id === f.id ? { ...x, stage: st } : x)); setTimeout(tick, 700); } else { setFiles((p) => p.map((x) => x.id === f.id ? { ...x, status: "done", ex: { ...SAMPLE, confidence: 0, cpt: [], icd: [], mods: [], units: "", dos: "", npi: "", auth: null } } : x)); setSelFile((s) => s ?? f.id); } };
    setTimeout(tick, 700);
  };
  const sel = files.find((f) => f.id === selFile && f.status === "done");
  const key = tab + (openClaim || "") + (sel ? "x" : "");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.paper, fontFamily: FONT_SANS, color: C.txt }}>
      {FONTS}
      {/* mobile overlay */}
      <div className="mob-overlay" onClick={() => setSideOpen(false)} />
      {/* SIDEBAR */}
      <aside className={`app-sidebar${sideOpen ? " open" : ""}`} style={{ width: 236, background: C.ink, padding: "22px 14px", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 10px 22px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px -6px rgba(14,140,107,.7)" }}><Stethoscope size={19} color="#fff" /></div>
          <div style={{ flex: 1 }}><div style={{ color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: FONT_DISPLAY }}>Revenue<span style={{ color: C.teal }}>MD</span></div></div>
          <button className="mob-ham" onClick={() => setSideOpen(false)} style={{ color: "rgba(255,255,255,.6)", marginLeft: "auto" }}><X size={20} /></button>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {nav.map((n, i) => {
            const a = tab === n.id;
            return <button key={n.id} className="navi rise" onClick={() => { setTab(n.id); setOpenClaim(null); setSideOpen(false); }} style={{ animationDelay: `${i * 0.03}s`, display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13.5, textAlign: "left", width: "100%", background: a ? C.teal : "transparent", color: a ? "#fff" : "rgba(255,255,255,.62)", fontWeight: a ? 500 : 400, boxShadow: a ? "0 6px 16px -8px rgba(14,140,107,.8)" : "none" }}><n.icon size={17} /> {n.label}</button>;
          })}
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 12, marginTop: 12 }}>
          <button className="navi" onClick={() => setLang(lang === "en" ? "es" : "en")} style={sideBtn}><Languages size={15} /> {lang === "en" ? "Español" : "English"}</button>
          <button className="navi" onClick={() => { setAuthed(false); setTab("dash"); }} style={sideBtn}><LogOut size={15} /> {t.logout}</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ background: C.paper2, borderBottom: `1px solid ${C.line}`, padding: "13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button className="mob-ham" onClick={() => setSideOpen(true)}><Menu size={20} /></button>
            <div style={{ fontSize: 16, fontWeight: 500, fontFamily: FONT_DISPLAY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nav.find((n) => n.id === tab)?.label}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div className="pill" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.teal, background: C.tealSoft, padding: "5px 11px", borderRadius: 20, fontWeight: 500 }}><span className="pdot" style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal }} /> Live</div>
            <div className="header-role" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.txt2 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 11.5 }}>{role === "manager" ? "MG" : role === "biller" ? "BL" : "CD"}</div>
              {t[role]}
            </div>
          </div>
        </header>

        <div key={key} className="content-pad" style={{ padding: 30, flex: 1, overflow: "auto" }}>
          {/* DASHBOARD */}
          {tab === "dash" && (
            <div>
              <div className="rise" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 26, fontWeight: 500, margin: "0 0 4px", fontFamily: FONT_DISPLAY, color: C.ink }}>{t.greeting}, {t[role]}.</h2>
                <p style={{ color: C.txt2, fontSize: 15, margin: 0 }}>{t.today}</p>
              </div>
              <div className="grid-auto-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(195px,1fr))", gap: 14, marginBottom: 20 }}>
                <Metric i={0} label={t.m_revenue} value={fmt(18200)} sub={t.thisMonth} trend="+14%" up />
                <Metric i={1} label={t.m_denial} value="12.4%" sub={t.thisMonth} trend="-3.1%" up />
                <Metric i={2} label={t.m_approval} value="87.6%" sub={t.target} />
                <Metric i={3} label={t.m_under} value={fmt(4750)} sub={t.opportunity} accent={C.amber} />
              </div>
              <div className="rise" style={{ animationDelay: ".15s", background: `linear-gradient(120deg, ${C.ink} 0%, ${C.ink2} 100%)`, borderRadius: 18, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center", marginBottom: 20, position: "relative", overflow: "hidden", flexWrap: "wrap" }}>
                <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,162,75,.14),transparent 70%)", right: -60, top: -90 }} />
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(201,162,75,.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Zap size={21} color={C.gold} /></div>
                <div style={{ flex: 1, position: "relative" }}><div style={{ fontWeight: 500, fontSize: 15, color: "#fff" }}>{t.priorityTitle}</div><div style={{ fontSize: 13.5, color: "rgba(255,255,255,.66)", marginTop: 3 }}>{t.priorityBody}</div></div>
                <button className="btnp mob-full-btn" onClick={() => { setTab("claims"); setFilter("high"); }} style={{ ...btnP, flexShrink: 0, background: C.gold, color: C.ink }}>{t.reviewNow} <ArrowRight size={15} /></button>
              </div>
              <div className="rise" style={{ animationDelay: ".22s", background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><div style={{ fontSize: 15, fontWeight: 500, fontFamily: FONT_DISPLAY, display: "flex", alignItems: "center", gap: 8 }}><Activity size={17} color={C.teal} /> {t.recent}</div><button onClick={() => setTab("claims")} style={btnG}>{t.viewAll} <ChevronRight size={14} /></button></div>
                {claims.slice(0, 4).map((c, i) => (
                  <div key={c.id} className="lift" onClick={() => { setTab("claims"); setOpenClaim(c.id); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, cursor: "pointer", border: "1px solid transparent", marginBottom: i < 3 ? 4 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: rbg(c.risk), display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={16} color={rc(c.risk)} /></div>
                      <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>#{c.id}</div><div style={{ fontSize: 12, color: C.txt2 }}>{c.codes} · {c.payer}</div></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}><RiskPill r={c.risk} /><ChevronRight size={16} color={C.txt3} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTAKE */}
          {tab === "intake" && (
            <div>
              <Head title={t.intakeTitle} sub={t.intakeSub} />
              <div className="rise" style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                {[["import", t.tabImport, FileInput], ["scan", t.tabScan, FileScan]].map(([k, l, Ic]) => (
                  <button key={k} className="chip" onClick={() => setIntakeTab(k)} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, padding: "9px 16px", borderRadius: 20, cursor: "pointer", border: `1px solid ${intakeTab === k ? C.ink : C.line}`, background: intakeTab === k ? C.ink : C.paper2, color: intakeTab === k ? "#fff" : C.txt2 }}><Ic size={15} /> {l}</button>
                ))}
              </div>

              {intakeTab === "import" && (
                <div>
                  {/* Real file upload drop zone */}
                  <div
                    className="rise"
                    onDragOver={(e) => { e.preventDefault(); setCsvDrag(true); }}
                    onDragLeave={() => setCsvDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setCsvDrag(false); const f = e.dataTransfer.files[0]; if (f) handleCSVFile(f); }}
                    onClick={() => document.getElementById("csv-input").click()}
                    style={{ border: `2px dashed ${csvDrag ? C.teal : C.tealMute}`, background: csvDrag ? C.tealSoft : C.paper2, borderRadius: 18, padding: "36px 24px", textAlign: "center", cursor: "pointer", transition: "all .2s", marginBottom: 16 }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealSoft; }}
                    onMouseLeave={(e) => { if (!csvDrag) { e.currentTarget.style.borderColor = C.tealMute; e.currentTarget.style.background = C.paper2; } }}
                  >
                    <input id="csv-input" type="file" accept=".csv,.txt" style={{ display: "none" }} onChange={(e) => handleCSVFile(e.target.files[0])} />
                    <div style={{ width: 56, height: 56, borderRadius: 15, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><Upload size={26} color={C.teal} /></div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{lang === "en" ? "Drop your claims file here" : "Suelta tu archivo de reclamos aquí"}</div>
                    <div style={{ fontSize: 13, color: C.txt2, marginTop: 5 }}>{lang === "en" ? "CSV with columns: id, patient, codes, payer, provider, dos, billed, status, risk" : "CSV con columnas: id, patient, codes, payer, provider, dos, billed, status, risk"}</div>
                    <button className="btnp" style={{ ...btnP, marginTop: 16 }} onClick={(e) => { e.stopPropagation(); document.getElementById("csv-input").click(); }}><Upload size={15} /> {lang === "en" ? "Browse file" : "Buscar archivo"}</button>
                  </div>

                  {csvImporting && (
                    <div className="rise" style={{ marginBottom: 16, fontSize: 13, color: C.amber, display: "flex", alignItems: "center", gap: 7 }}><Loader2 size={14} className="spin" /> {lang === "en" ? "Reading and parsing claims…" : "Leyendo y procesando reclamos…"}</div>
                  )}
                  {csvResult && !csvResult.error && (
                    <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
                      <div style={{ background: `linear-gradient(120deg,${C.tealDk},${C.teal})`, padding: "13px 18px", display: "flex", alignItems: "center", gap: 9 }}>
                        <CheckCircle2 size={16} color="#fff" />
                        <span style={{ fontWeight: 500, fontSize: 13.5, color: "#fff", fontFamily: FONT_DISPLAY }}>{lang === "en" ? `${csvResult.count} claims imported` : `${csvResult.count} reclamos importados`}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "rgba(255,255,255,.85)" }}>{csvResult.name}</span>
                      </div>
                      <div style={{ padding: "14px 18px", display: "flex", gap: 10 }}>
                        <button className="btnp" onClick={() => { setTab("claims"); setCsvResult(null); }} style={{ ...btnP, flex: 1, justifyContent: "center" }}>{lang === "en" ? "View in Claims" : "Ver en Reclamos"} <ArrowRight size={15} /></button>
                        <button onClick={() => setCsvResult(null)} style={{ ...btnG }}>{t.dismiss}</button>
                      </div>
                    </div>
                  )}
                  {csvResult?.error && (
                    <div className="rise" style={{ background: C.redSoft, border: `1px solid #f0c5c0`, borderRadius: 12, padding: "12px 15px", marginBottom: 16, display: "flex", gap: 9, alignItems: "center" }}>
                      <AlertTriangle size={15} color={C.red} />
                      <span style={{ fontSize: 12.5, color: C.red }}>{lang === "en" ? `Could not parse "${csvResult.name}". Check it has a header row with: id, patient, codes, payer, dos, billed` : `No se pudo leer "${csvResult.name}". Verifica que tenga una fila de encabezado.`}</span>
                    </div>
                  )}

                  {/* CSV format helper */}
                  <div className="rise" style={{ background: C.ink, borderRadius: 14, padding: "14px 18px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11.5, color: C.gold, fontWeight: 500, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><FileText size={13} /> {lang === "en" ? "Expected CSV format" : "Formato CSV esperado"}</div>
                    <code style={{ fontSize: 11, color: "rgba(255,255,255,.75)", lineHeight: 1.7, display: "block", whiteSpace: "pre-wrap", fontFamily: "ui-monospace,monospace" }}>{`id,patient,codes,payer,provider,dos,billed,status,risk\nPV-2024-0901,Patient #5001,90837,Plan Vital,Dr. Rodriguez,May 15,195,pending,50\nTS-2024-0610,Patient #5002,99214,Triple-S,Dr. Méndez,May 16,320,high,72`}</code>
                  </div>

                  <div className="rise" style={{ fontSize: 12.5, fontWeight: 500, color: C.txt3, display: "flex", alignItems: "center", gap: 7, marginBottom: 11, fontFamily: FONT_DISPLAY }}><Plug size={15} /> {t.roadmap} — {t.apiConnect}</div>
                  <div className="grid-auto-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 11, marginBottom: 18 }}>
                    {API_SOURCES.map((s, i) => (
                      <div key={i} style={{ background: C.paper2, border: `1px dashed ${C.line}`, borderRadius: 13, padding: 13, display: "flex", alignItems: "center", gap: 10, opacity: 0.85 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.lineSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><Network size={15} color={C.txt3} /></div>
                        <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{s.name}</div><div style={{ fontSize: 10, color: C.txt3 }}>{lang === "en" ? "needs agreement" : "requiere acuerdo"}</div></div>
                      </div>
                    ))}
                  </div>
                  <div className="rise" style={{ background: C.blueSoft, border: `1px solid #cbe0f5`, borderRadius: 12, padding: "12px 15px", display: "flex", gap: 9, alignItems: "center" }}><CircleAlert size={16} color={C.blue} style={{ flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: "#1d5a96", lineHeight: 1.5 }}>{t.importNote}</span></div>
                </div>
              )}

              {intakeTab === "scan" && (
              <div className="grid-auto-1" style={{ display: "grid", gridTemplateColumns: sel ? "1fr 1fr" : "1fr", gap: 18, alignItems: "start" }}>
                <div className="rise">
                  <div
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealSoft; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = C.tealMute; e.currentTarget.style.background = C.paper2; }}
                    onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = C.tealMute; e.currentTarget.style.background = C.paper2; const file = e.dataTransfer.files[0]; if (file) addRealFile(file); }}
                    onClick={() => document.getElementById("scan-input").click()}
                    style={{ border: `2px dashed ${C.tealMute}`, background: C.paper2, borderRadius: 18, padding: "44px 24px", textAlign: "center", cursor: "pointer", transition: "all .2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealSoft; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.tealMute; e.currentTarget.style.background = C.paper2; }}
                  >
                    <input id="scan-input" type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) addRealFile(e.target.files[0]); }} />
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><FileScan size={30} color={C.teal} /></div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{t.drop}</div>
                    <div style={{ fontSize: 13, color: C.txt2, marginTop: 5 }}>{t.dropSub}</div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
                      <button className="btnp" style={btnP} onClick={(e) => { e.stopPropagation(); document.getElementById("scan-input").click(); }}><Upload size={15} /> {lang === "en" ? "Upload record" : "Subir expediente"}</button>
                      <button style={btnS} onClick={(e) => { e.stopPropagation(); addSample(); }}>{lang === "en" ? "Try sample" : "Ver muestra"}</button>
                    </div>
                  </div>
                  {files.map((f) => (
                    <div key={f.id} onClick={() => f.status === "done" && setSelFile(f.id)} className="lift" style={{ background: C.paper2, border: `1px solid ${selFile === f.id ? C.teal : C.line}`, borderRadius: 14, padding: "13px 15px", marginTop: 11, display: "flex", alignItems: "center", gap: 12, cursor: f.status === "done" ? "pointer" : "default" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: f.status === "done" ? C.tealSoft : C.lineSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>{f.status === "done" ? <CheckCircle2 size={18} color={C.teal} /> : <FileText size={18} color={C.txt3} />}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: C.txt3, marginTop: 2 }}>{f.status === "scanning" ? <span style={{ color: C.amber, display: "flex", alignItems: "center", gap: 5 }}><Loader2 size={12} className="spin" /> {SCAN[f.stage]}…</span> : <span style={{ color: C.teal, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12} /> {t.confidence} {f.ex.confidence}%</span>}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {sel && <ScanResult sel={sel} t={t} lang={lang} claims={claims} setClaims={setClaims} setTab={setTab} setOpenClaim={setOpenClaim} />}
              </div>
              )}
            </div>
          )}

          {/* CLAIMS LIST */}
          {tab === "claims" && !openClaim && (
            <div>
              <div className="rise" style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 220 }}><Search size={16} color={C.txt3} style={{ position: "absolute", left: 14, top: 13 }} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.search} style={{ ...inp, paddingLeft: 40, marginBottom: 0 }} /></div>
                <button className="btnp" onClick={() => setTab("intake")} style={btnP}><Upload size={15} /> {t.upload}</button>
              </div>
              <div className="rise" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", animationDelay: ".05s" }}>
                {[["all", t.all], ["high", t.highRisk], ["pending", t.pending], ["denied", t.denied]].map(([k, l]) => <button key={k} className="chip" onClick={() => setFilter(k)} style={{ fontSize: 12.5, padding: "7px 15px", borderRadius: 20, cursor: "pointer", border: `1px solid ${filter === k ? C.ink : C.line}`, background: filter === k ? C.ink : C.paper2, color: filter === k ? "#fff" : C.txt2, fontWeight: filter === k ? 500 : 400 }}>{l}</button>)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((c, i) => (
                  <div key={c.id} className="lift rise" style={{ animationDelay: `${i * 0.05}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 14, padding: "15px 18px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }} onClick={() => setOpenClaim(c.id)}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: rbg(c.risk), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileText size={19} color={rc(c.risk)} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}><span style={{ fontSize: 14, fontWeight: 500 }}>#{c.id}</span>{reviewed.includes(c.id) && <span style={{ fontSize: 11, color: C.teal, display: "flex", alignItems: "center", gap: 3 }}><CheckCircle2 size={13} /> {t.reviewed}</span>}<span style={{ fontSize: 11, color: C.txt2, padding: "2px 9px", background: C.lineSoft, borderRadius: 12 }}>{c.payer}</span></div>
                      <div style={{ fontSize: 12.5, color: C.txt2, marginTop: 3 }}>{c.codes} · {c.provider} · {c.dos}</div>
                    </div>
                    <RiskPill r={c.risk} big />
                    <ChevronRight size={18} color={C.txt3} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLAIM DETAIL */}
          {tab === "claims" && openClaim && (() => {
            const c = claims.find((x) => x.id === openClaim); const A = analyzed[c.id];
            return (
              <div>
                <button onClick={() => setOpenClaim(null)} style={{ ...btnG, marginBottom: 16 }}><ChevronRight size={15} style={{ transform: "rotate(180deg)" }} /> {t.back}</button>
                <div className="grid-claim-detail" style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 18, alignItems: "start" }}>
                  <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                      <div><h2 style={{ fontSize: 21, fontWeight: 500, margin: 0, fontFamily: FONT_DISPLAY }}>#{c.id}</h2><div style={{ fontSize: 13, color: C.txt2, marginTop: 3 }}>{c.patient} · {c.provider}</div></div>
                      <RiskPill r={c.risk} big label />
                    </div>
                    <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20, padding: "14px 0", borderTop: `1px solid ${C.lineSoft}`, borderBottom: `1px solid ${C.lineSoft}` }}>
                      <Field label={t.cpt} value={c.codes} /><Field label="Payer" value={c.payer} /><Field label={t.dos} value={c.dos} /><Field label="Billed" value={fmt(c.billed)} />
                    </div>
                    {!A ? (
                      <button className="btnp" onClick={() => runAnalysis(c.id)} disabled={analyzing} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 14, opacity: analyzing ? 0.7 : 1, fontSize: 14.5 }}>{analyzing ? <Loader2 size={17} className="spin" /> : <Brain size={17} />} {analyzing ? t.analyzing : t.runAnalysis}</button>
                    ) : (
                      <div className="rise">
                        <div style={{ background: `linear-gradient(120deg,${C.ink},${C.ink2})`, borderRadius: 14, padding: 16, marginBottom: 18 }}><div style={{ fontSize: 12, fontWeight: 500, color: C.gold, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, letterSpacing: 1, textTransform: "uppercase" }}><Brain size={13} /> {t.aiSummary}</div><div style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,.92)" }}>{lang === "en" ? c.sEn : c.sEs}</div></div>
                        <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 10, fontFamily: FONT_DISPLAY }}>{t.issues}</div>
                        {c.issues.map((iss, i) => { const s = SEV[iss.sev]; return <div key={i} className="rise" style={{ animationDelay: `${i * 0.06}s`, display: "flex", gap: 11, padding: 13, borderRadius: 12, background: s.bg, marginBottom: 8 }}><s.icon size={17} color={s.c} style={{ flexShrink: 0, marginTop: 1 }} /><div><div style={{ fontSize: 13, fontWeight: 500, color: s.c }}>{lang === "en" ? iss.tEn : iss.tEs}</div><div style={{ fontSize: 12.5, color: s.c, opacity: 0.82, marginTop: 2, lineHeight: 1.5 }}>{lang === "en" ? iss.dEn : iss.dEs}</div></div></div>; })}
                        {c.fix.length > 0 && <><div style={{ fontSize: 13.5, fontWeight: 500, margin: "18px 0 10px", fontFamily: FONT_DISPLAY }}>{t.sugg}</div>{c.fix.map((f, i) => <div key={i} style={{ border: `1px solid ${C.tealMute}`, background: C.tealSoft, borderRadius: 12, padding: 13 }}><div style={{ fontSize: 13, fontWeight: 500, color: C.tealDk }}>{lang === "en" ? f.tEn : f.tEs}</div><div style={{ fontSize: 12.5, color: "#0a5c47", marginTop: 3, lineHeight: 1.5 }}>{lang === "en" ? f.wEn : f.wEs}</div><div style={{ display: "flex", gap: 8, marginTop: 11 }}><button className="btnp" style={{ ...btnP, padding: "7px 15px", fontSize: 12.5 }}>{t.apply}</button><button style={{ ...btnG, fontSize: 12.5 }}>{t.dismiss}</button></div></div>)}</>}
                        <button className="btnp" onClick={() => { setReviewed((p) => [...new Set([...p, c.id])]); setOpenClaim(null); }} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 13, marginTop: 18 }}><CheckCircle2 size={16} /> {t.markReviewed}</button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Score label={t.denialRisk} value={c.risk} invert delay={0} /><Score label={t.compliance} value={c.comp} delay={0.08} /><Score label={t.docQuality} value={c.doc} delay={0.16} />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* AI ANALYSIS */}
          {tab === "analysis" && (
            <div>
              <Head title={t.nav_analysis} sub={lang === "en" ? "Every claim, ranked by AI-assessed denial risk." : "Cada reclamo, ordenado por riesgo de denegación evaluado por IA."} />
              {[...claims].sort((a, b) => b.risk - a.risk).map((c, i) => (
                <div key={c.id} className="lift rise" style={{ animationDelay: `${i * 0.05}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, marginBottom: 12, cursor: "pointer" }} onClick={() => { setTab("claims"); setOpenClaim(c.id); if (!analyzed[c.id]) runAnalysis(c.id); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div><span style={{ fontSize: 14.5, fontWeight: 500 }}>#{c.id}</span><span style={{ fontSize: 12.5, color: C.txt2, marginLeft: 10 }}>{c.codes} · {c.payer}</span></div><RiskPill r={c.risk} big label /></div>
                  <div style={{ fontSize: 13.5, color: C.txt2, lineHeight: 1.6 }}>{lang === "en" ? c.sEn : c.sEs}</div>
                </div>
              ))}
            </div>
          )}

          {/* DENIALS */}
          {tab === "denials" && (
            <div>
              <div className="grid-auto-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 14, marginBottom: 22 }}>
                <Metric i={0} label={lang === "en" ? "Open denials" : "Denegaciones abiertas"} value="3" />
                <Metric i={1} label={t.lostRevenue} value={fmt(1410)} accent={C.red} />
                <Metric i={2} label={lang === "en" ? "Recovered YTD" : "Recuperado año"} value={fmt(6820)} accent={C.teal} />
              </div>
              {DENIALS.map((d, i) => (
                <div key={d.id} className="rise" style={{ animationDelay: `${i * 0.06}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div><div style={{ fontSize: 14.5, fontWeight: 500 }}>#{d.id}</div><div style={{ fontSize: 13, color: C.txt2, marginTop: 4 }}>{lang === "en" ? d.rEn : d.rEs}</div><div style={{ fontSize: 12, color: C.amber, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}><Clock size={13} /> {d.days} {lang === "en" ? "days" : "días"} {t.toAppeal}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 11.5, color: C.txt3 }}>{t.lostRevenue}</div><div style={{ fontSize: 20, fontWeight: 500, color: C.red, fontFamily: FONT_DISPLAY }}>{fmt(d.lost)}</div></div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button className="btnp" onClick={() => setAppeal(appeal === d.id ? null : d.id)} style={{ ...btnP, fontSize: 12.5 }}><Send size={14} /> {t.aiStrategy}</button><button style={{ ...btnS, fontSize: 12.5 }}>{t.buildAppeal}</button></div>
                  {appeal === d.id && <div className="rise" style={{ marginTop: 14, background: C.blueSoft, border: `1px solid #cbe0f5`, borderRadius: 12, padding: 14 }}><div style={{ fontSize: 12, fontWeight: 500, color: C.blue, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, letterSpacing: .5, textTransform: "uppercase" }}><Brain size={13} /> {t.aiStrategy}</div><div style={{ fontSize: 13, color: "#1d5a96", lineHeight: 1.6 }}>{lang === "en" ? "File a first-level appeal before the deadline. Attach the prior-authorization confirmation and the clinical note documenting medical necessity. Estimated recovery: 60–75%." : "Presenta una apelación de primer nivel antes del límite. Adjunta la confirmación de autorización y la nota clínica de necesidad médica. Recuperación estimada: 60–75%."}</div></div>}
                </div>
              ))}
            </div>
          )}

          {/* REVENUE */}
          {tab === "revenue" && (
            <div>
              <div className="grid-auto-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 14, marginBottom: 22 }}>
                <Metric i={0} label={t.m_revenue} value={fmt(18200)} sub={t.thisMonth} trend="+14%" up />
                <Metric i={1} label={lang === "en" ? "Denials prevented" : "Denegaciones evitadas"} value="34" sub={t.thisMonth} />
                <Metric i={2} label={lang === "en" ? "Coding accuracy" : "Precisión"} value="91%" trend="+6%" up />
              </div>
              <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 22, fontFamily: FONT_DISPLAY }}>{lang === "en" ? "Revenue recovered" : "Ingresos recuperados"}</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 200 }}>
                  {[{ m: "Jan", v: 8200 }, { m: "Feb", v: 11400 }, { m: "Mar", v: 14100 }, { m: "Apr", v: 18200 }, { m: "May", v: 21600 }].map((r, i) => (
                    <div key={r.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 500, color: C.tealDk }}>{fmt(r.v)}</div>
                      <div className="rise" style={{ animationDelay: `${i * 0.08}s`, width: "100%", maxWidth: 54, height: (r.v / 22000) * 155, background: i === 4 ? `linear-gradient(${C.teal},${C.tealDk})` : C.tealMute, borderRadius: "8px 8px 0 0" }} />
                      <div style={{ fontSize: 12, color: C.txt2 }}>{r.m}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAYERS */}
          {tab === "payers" && (
            <div>
              <Head title={t.payersTitle} sub={t.payersSub} />
              <div className="rise" style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                {PAYERS.map((p) => <button key={p.id} className="chip" onClick={() => setOpenPayer(p.id)} style={{ fontSize: 12.5, padding: "7px 15px", borderRadius: 20, cursor: "pointer", border: `1px solid ${openPayer === p.id ? C.ink : C.line}`, background: openPayer === p.id ? C.ink : C.paper2, color: openPayer === p.id ? "#fff" : C.txt2, fontWeight: openPayer === p.id ? 500 : 400 }}>{p.name}</button>)}
              </div>
              {(() => { const p = PAYERS.find((x) => x.id === openPayer); return (
                <div key={p.id} className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 13, background: p.soft, display: "flex", alignItems: "center", justifyContent: "center" }}><Building2 size={24} color={p.color} /></div>
                    <div><div style={{ fontSize: 19, fontWeight: 500, fontFamily: FONT_DISPLAY }}>{p.name}</div><div style={{ fontSize: 12.5, color: C.txt2, marginTop: 2 }}>{p.sub}</div></div>
                    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>{p.lob.map((l) => <span key={l} style={{ fontSize: 11, fontWeight: 500, padding: "4px 10px", borderRadius: 14, background: p.soft, color: p.color }}>{l}</span>)}</div>
                  </div>
                  {p.facts.map((f, i) => { const b = VB[f.v]; return (
                    <div key={i} style={{ borderTop: `1px solid ${C.lineSoft}`, padding: "13px 0", display: "flex", alignItems: "center", gap: 12 }}>
                      <CheckCircle2 size={16} color={C.teal} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 13.5 }}>{lang === "en" ? f.lEn : f.lEs}</div>
                      <span style={{ fontSize: 10.5, fontWeight: 500, padding: "3px 9px", borderRadius: 12, background: b.bg, color: b.c, display: "inline-flex", alignItems: "center", gap: 4 }}><b.icon size={11} /> {t["v_" + f.v]}</span>
                    </div>
                  ); })}
                </div>
              ); })()}
            </div>
          )}

          {/* COMPLIANCE */}
          {tab === "compliance" && (
            <div>
              <Head title={t.compTitle} sub={t.compSub} />
              <div className="rise" style={{ background: C.amberSoft, border: `1px solid #f0dcb0`, borderRadius: 14, padding: "13px 16px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}><CircleAlert size={18} color={C.amber} /><div style={{ fontSize: 13, color: "#7a4e10" }}><strong>{needsCount}</strong> {t.verifyBanner}</div></div>
              <div className="rise" style={{ display: "flex", gap: 6, marginBottom: 16, animationDelay: ".05s" }}>
                {[["billing", t.tab_billing, Scale], ["privacy", t.tab_privacy, Lock]].map(([k, l, Ic]) => <button key={k} className="chip" onClick={() => setCompTab(k)} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, padding: "9px 16px", borderRadius: 20, cursor: "pointer", border: `1px solid ${compTab === k ? C.ink : C.line}`, background: compTab === k ? C.ink : C.paper2, color: compTab === k ? "#fff" : C.txt2 }}><Ic size={15} /> {l}</button>)}
              </div>
              {(compTab === "billing" ? BILLING_RULES : PRIVACY_RULES).map((r, i) => { const b = VB[r.v]; const s = SEV[r.sev]; return (
                <div key={r.code} className="lift rise" style={{ animationDelay: `${i * 0.05}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 14, padding: "15px 17px", marginBottom: 10, display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><s.icon size={17} color={s.c} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}><span style={{ fontSize: 11, fontWeight: 500, color: C.txt3, fontFamily: "ui-monospace,monospace" }}>{r.code}</span><span style={{ fontSize: 10.5, fontWeight: 500, padding: "2px 9px", borderRadius: 12, background: b.bg, color: b.c, display: "inline-flex", alignItems: "center", gap: 4 }}><b.icon size={10} /> {t["v_" + r.v]}</span></div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 5 }}>{lang === "en" ? r.en : r.es}</div>
                    <div style={{ fontSize: 11.5, color: C.txt3, marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}><FileSearch size={12} /> {r.src}</div>
                  </div>
                </div>
              ); })}
              <div className="rise" style={{ marginTop: 18, background: C.redSoft, border: `1px solid #f0c5c0`, borderRadius: 14, padding: "16px 18px", display: "flex", gap: 12 }}><AlertTriangle size={19} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} /><div><div style={{ fontSize: 13.5, fontWeight: 500, color: C.red }}>{t.disclaimerT}</div><div style={{ fontSize: 13, color: "#8a3530", lineHeight: 1.55, marginTop: 4 }}>{t.disclaimer}</div></div></div>
            </div>
          )}

          {/* BUSINESS */}
          {tab === "business" && (
            <div>
              <Head title={t.bizTitle} sub={t.bizSub} />
              {/* concept banner */}
              <div className="rise" style={{ background: `linear-gradient(120deg,${C.ink},${C.ink2})`, borderRadius: 18, padding: "26px 28px", marginBottom: 18, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,162,75,.14),transparent 70%)", right: -70, top: -110 }} />
                <div style={{ position: "relative" }}>
                  <div style={{ color: C.gold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", fontWeight: 500, marginBottom: 10 }}>The concept</div>
                  <div style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, lineHeight: 1.3, maxWidth: 560 }}>“{t.bizConcept}”</div>
                </div>
              </div>

              {/* revenue model */}
              <SectionLabel icon={Target} text={t.bizModelT} />
              <div className="grid-auto-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12, marginBottom: 10 }}>
                {[[t.bizSubRev, t.bizSubRevD, C.teal, C.tealSoft], [t.bizUsage, t.bizUsageD, C.blue, C.blueSoft], [t.bizEnt, t.bizEntD, C.purple, C.purpleSoft], [t.bizPerf, t.bizPerfD, C.amber, C.amberSoft]].map(([ti, d, c, bg], i) => (
                  <div key={i} className="rise lift" style={{ animationDelay: `${i * 0.05}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c, marginBottom: 10 }} />
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{ti}</div>
                    <div style={{ fontSize: 12.5, color: C.txt2, marginTop: 4, lineHeight: 1.5 }}>{d}</div>
                  </div>
                ))}
              </div>
              <div className="rise" style={{ background: C.tealSoft, border: `1px solid ${C.tealMute}`, borderRadius: 12, padding: "12px 16px", marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
                <Users size={16} color={C.tealDk} /><span style={{ fontSize: 13, color: C.tealDk }}>{t.bizArpu}: <strong style={{ fontWeight: 500 }}>{t.bizArpuV}</strong></span>
              </div>

              {/* moat */}
              <SectionLabel icon={Award} text={t.bizMoatT} />
              <div className="grid-auto-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12, marginBottom: 22 }}>
                {[[Rocket, t.moat1, t.moat1D], [ShieldCheck, t.moat2, t.moat2D], [Globe, t.moat3, t.moat3D], [Lock, t.moat4, t.moat4D]].map(([Ic, ti, d], i) => (
                  <div key={i} className="rise lift" style={{ animationDelay: `${i * 0.05}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 17, display: "flex", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic size={18} color={C.teal} /></div>
                    <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>{ti}</div><div style={{ fontSize: 12.5, color: C.txt2, marginTop: 3, lineHeight: 1.5 }}>{d}</div></div>
                  </div>
                ))}
              </div>

              {/* growth chart */}
              <SectionLabel icon={TrendingUp} text={t.bizGrowthT} />
              <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200 }}>
                  {GROWTH.map((r, i) => (
                    <div key={r.yr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.tealDk, fontFamily: FONT_DISPLAY }}>{fmtK(r.rev)}</div>
                      <div className="rise" style={{ animationDelay: `${i * 0.08}s`, width: "100%", maxWidth: 56, height: (r.rev / 4500000) * 150 + 6, background: i === 4 ? `linear-gradient(${C.teal},${C.tealDk})` : C.tealMute, borderRadius: "8px 8px 0 0" }} />
                      <div style={{ fontSize: 11.5, color: C.txt2, textAlign: "center" }}>{t.yr} {r.yr}</div>
                      <div style={{ fontSize: 10.5, color: C.txt3 }}>{r.prov} {t.providers.toLowerCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: C.txt3, fontStyle: "italic", marginBottom: 22 }}>{t.projNote}</div>

              {/* margins + raise + exit */}
              <div className="grid-auto-1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                <div className="rise lift" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 12, color: C.txt2, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><BarChart3 size={14} color={C.teal} /> {t.bizMargT}</div>
                  <Row k={t.bizGross} v={t.bizGrossV} />
                  <Row k={t.bizBreak} v={t.bizBreakV} />
                  <Row k={t.bizEbitda} v={t.bizEbitdaV} last />
                </div>
                <div className="rise lift" style={{ background: `linear-gradient(135deg,${C.tealDk},${C.teal})`, borderRadius: 16, padding: 20, color: "#fff" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.8)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Rocket size={14} /> {t.bizRaiseT}</div>
                  <div style={{ fontSize: 26, fontWeight: 500, fontFamily: FONT_DISPLAY }}>{t.bizRaiseV}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.82)", marginTop: 6, lineHeight: 1.5 }}>{t.bizRaiseD}</div>
                </div>
                <div className="rise lift" style={{ background: C.ink, borderRadius: 16, padding: 20, color: "#fff" }}>
                  <div style={{ fontSize: 12, color: C.gold, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><ArrowUpRight size={14} /> {t.bizExitT}</div>
                  <div style={{ fontSize: 26, fontWeight: 500, fontFamily: FONT_DISPLAY }}>{t.bizExitV}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)", marginTop: 6, lineHeight: 1.5 }}>{t.bizExitD}</div>
                </div>
              </div>

              {/* use of funds */}
              <div className="rise" style={{ marginTop: 22 }}>
                <SectionLabel icon={Target} text={lang === "en" ? "Use of funds" : "Uso de fondos"} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {[t.bizUse1, t.bizUse2, t.bizUse3, t.bizUse4].map((u, i) => (
                    <span key={i} style={{ fontSize: 12.5, padding: "8px 14px", borderRadius: 20, background: C.paper2, border: `1px solid ${C.line}`, color: C.txt }}>{u}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BATCH QUEUE */}
          {tab === "batch" && (() => {
            const selCount = batchQueue.filter((q) => q.sel && q.st === "pending").length;
            const allSel = batchQueue.length > 0 && batchQueue.every((q) => q.sel || q.st !== "pending");
            const toggle = (id) => setBatchQueue((p) => p.map((q) => q.id === id && q.st === "pending" ? { ...q, sel: !q.sel } : q));
            const toggleAll = () => setBatchQueue((p) => p.map((q) => q.st === "pending" ? { ...q, sel: !allSel } : q));
            const selectLane = (k) => setBatchQueue((p) => p.map((q) => q.lane === k && q.st === "pending" ? { ...q, sel: true } : q));
            const bulkApprove = () => { const n = selCount; setBatchQueue((p) => p.map((q) => q.sel && q.st === "pending" ? { ...q, st: "approved", sel: false } : q)); };
            const loadBatch = () => { setBatchReading(true); setTimeout(() => { setBatchReading(false); setBatchLoaded(true); setBatchQueue(BATCH_SEED.map((x) => ({ ...x }))); }, 1400); };
            return (
              <div>
                <Head title={t.batchTitle} sub={t.batchSub} />
                {!batchLoaded ? (
                  <div className="rise">
                    {!batchReading ? (
                      <div onClick={loadBatch} style={{ border: `2px dashed ${C.tealMute}`, background: C.paper2, borderRadius: 18, padding: "44px 24px", textAlign: "center", cursor: "pointer", transition: "all .2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealSoft; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.tealMute; e.currentTarget.style.background = C.paper2; }}>
                        <div style={{ width: 60, height: 60, borderRadius: 16, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Layers size={30} color={C.teal} /></div>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{t.batchDrop}</div>
                        <div style={{ fontSize: 13, color: C.txt2, marginTop: 5 }}>{t.batchDropSub}</div>
                        <button className="btnp" style={{ ...btnP, marginTop: 18 }}><Upload size={15} /> {t.batchLoad}</button>
                      </div>
                    ) : (
                      <div style={{ border: `2px dashed ${C.amber}`, background: C.paper2, borderRadius: 18, padding: "44px 24px", textAlign: "center", color: C.amber, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}><Loader2 size={18} className="spin" /> {t.batchReading}</div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="grid-auto-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(125px,1fr))", gap: 11, marginBottom: 16 }}>
                      <Metric i={0} label={t.bImported} value="42" /><Metric i={1} label={t.bAutoClear} value="31" accent={C.teal} /><Metric i={2} label={t.bNeedAtt} value="11" accent={C.red} /><Metric i={3} label={t.bAtRisk} value="$3.4K" accent={C.amber} />
                    </div>
                    <div className="rise" style={{ background: selCount ? C.ink : C.paper2, border: `1px solid ${selCount ? C.ink : C.line}`, borderRadius: 13, padding: "11px 15px", display: "flex", alignItems: "center", gap: 12, marginBottom: 16, transition: "all .2s", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: selCount ? "#fff" : C.txt2 }}>{selCount} {t.bSelected}</span>
                      <div style={{ flex: 1 }} />
                      <button onClick={bulkApprove} disabled={!selCount} style={{ background: selCount ? C.teal : C.lineSoft, color: selCount ? "#fff" : C.txt3, border: "none", borderRadius: 9, padding: "8px 15px", fontSize: 12.5, fontWeight: 500, cursor: selCount ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}><CheckCircle2 size={14} /> {t.bApprove}</button>
                      <button disabled={!selCount} style={{ background: "transparent", color: selCount ? "#fff" : C.txt3, border: `1px solid ${selCount ? "rgba(255,255,255,.3)" : C.lineSoft}`, borderRadius: 9, padding: "8px 13px", fontSize: 12.5, fontWeight: 500, cursor: selCount ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}><Users size={14} /> {t.bAssign}</button>
                      <button disabled={!selCount} style={{ background: "transparent", color: selCount ? "#fff" : C.txt3, border: `1px solid ${selCount ? "rgba(255,255,255,.3)" : C.lineSoft}`, borderRadius: 9, padding: "8px 13px", fontSize: 12.5, fontWeight: 500, cursor: selCount ? "pointer" : "default", display: "flex", alignItems: "center", gap: 6 }}><Download size={14} /> {t.bExport}</button>
                    </div>
                    <div className="rise" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
                      {Object.entries(BATCH_LANES).map(([k, v]) => (
                        <button key={k} className="chip" onClick={() => selectLane(k)} style={{ display: "flex", alignItems: "center", gap: 8, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 11, padding: "8px 13px", cursor: "pointer" }}>
                          <span style={{ width: 9, height: 9, borderRadius: "50%", background: v[1] }} />
                          <span style={{ fontSize: 12.5, fontWeight: 500 }}>{k === "needs_work" ? t.bNeedsWork : k === "quick_review" ? t.bQuickReview : t.bAutoClear}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: v[1], background: v[2], padding: "2px 8px", borderRadius: 10 }}>{k === "auto_clear" ? 31 : k === "needs_work" ? 11 : 0}</span>
                        </button>
                      ))}
                      <span style={{ fontSize: 11.5, color: C.txt3, marginLeft: "auto" }}>{t.bLaneHint}</span>
                    </div>
                    <div style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 15, overflow: "hidden" }}>
                      <div style={{ padding: "11px 15px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 13 }}>
                        <Chk on={allSel} onClick={toggleAll} /><span style={{ fontSize: 11.5, fontWeight: 600, color: C.txt2, textTransform: "uppercase", letterSpacing: 0.5 }}>{t.bShowing}</span>
                      </div>
                      {batchQueue.map((q) => { const done = q.st !== "pending"; const lane = BATCH_LANES[q.lane]; const iss = lang === "en" ? q.iEn : q.iEs; return (
                        <div key={q.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 15px", borderBottom: `1px solid ${C.lineSoft}`, opacity: done ? 0.55 : 1, background: q.sel && !done ? "#F0F8F4" : "transparent" }}>
                          <Chk on={q.sel && !done} onClick={() => toggle(q.id)} />
                          <div style={{ width: 7, height: 34, borderRadius: 4, background: lane[1], flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>#{q.id}{done && <span style={{ fontSize: 10.5, fontWeight: 600, color: C.tealDk, background: C.tealSoft, padding: "2px 8px", borderRadius: 10, display: "flex", alignItems: "center", gap: 3 }}><CheckCircle2 size={11} /> {q.st === "approved" ? (lang === "en" ? "approved" : "aprobado") : q.st}</span>}</div>
                            <div style={{ fontSize: 11.5, color: C.txt2, marginTop: 2 }}>{q.codes} · {q.payer} · {q.prov}{iss ? <> · <span style={{ color: lane[1] }}>{iss}</span></> : ""}</div>
                          </div>
                          <span style={{ fontSize: 11.5, color: C.txt3 }}>${q.val}</span>
                          <RiskPill r={q.risk} />
                        </div>
                      ); })}
                      <div style={{ textAlign: "center", padding: 14, fontSize: 12, color: C.txt3 }}>{t.bMore}</div>
                    </div>
                    <div style={{ marginTop: 14, background: C.amberSoft, border: `1px solid #f0dcb0`, borderRadius: 12, padding: "11px 15px", display: "flex", gap: 9, alignItems: "center" }}><CircleAlert size={15} color={C.amber} style={{ flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: "#7a4e10", lineHeight: 1.5 }}>{t.bTuneNote}</span></div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <footer style={{ borderTop: `1px solid ${C.line}`, padding: "12px 30px", fontSize: 11.5, color: C.txt3, display: "flex", alignItems: "center", gap: 7, background: C.paper2 }}><ShieldCheck size={14} /> {t.footer}</footer>
      </main>
    </div>
  );
}

function ScanResult({ sel, t, lang, claims, setClaims, setTab, setOpenClaim }) {
  const isReal = sel.isReal;
  const [form, setForm] = useState({ id: "", patient: "", codes: "", payer: "", provider: "", dos: "", billed: "", status: "pending" });
  const [saved, setSaved] = useState(null);
  const fld = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const createClaim = () => {
    const id = form.id || `SCAN-${Date.now()}`;
    const newClaim = {
      id, patient: form.patient || "Unknown patient",
      codes: form.codes || "—", payer: form.payer || "—",
      provider: form.provider || "—", dos: form.dos || "—",
      billed: parseFloat(form.billed) || 0, status: form.status || "pending",
      risk: 50, comp: 70, doc: 70,
      sEn: "Imported from scan — run AI analysis for a full risk assessment.",
      sEs: "Importado desde escaneo — ejecuta análisis IA para evaluación completa.",
      issues: [], fix: [],
    };
    setClaims((p) => [newClaim, ...p]);
    setSaved(id);
  };

  return (
    <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(120deg,${C.tealDk},${C.teal})`, padding: "15px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <Sparkles size={18} color="#fff" />
        <div style={{ fontSize: 14, fontWeight: 500, color: "#fff", fontFamily: FONT_DISPLAY }}>{sel.name}</div>
        {!isReal && <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,.8)" }}>{sel.ex.confidence}% {t.confidence}</span>}
      </div>
      <div style={{ padding: 20 }}>
        {/* image preview for real uploads */}
        {sel.preview && (
          <img src={sel.preview} alt="record" style={{ width: "100%", borderRadius: 10, marginBottom: 16, maxHeight: 260, objectFit: "contain", background: C.lineSoft }} />
        )}
        {sel.preview === null && isReal && (
          <div style={{ background: C.lineSoft, borderRadius: 10, padding: "24px", textAlign: "center", marginBottom: 16, color: C.txt3, fontSize: 13 }}>
            <FileText size={28} color={C.txt3} style={{ marginBottom: 8 }} /><br />{lang === "en" ? "PDF uploaded — enter billing data below" : "PDF cargado — ingresa los datos de facturación"}
          </div>
        )}
        {/* for sample: show extracted data */}
        {!isReal && (
          <>
            <Chips label={t.cpt} arr={sel.ex.cpt} c={C.blue} bg={C.blueSoft} />
            <Chips label={t.icd} arr={sel.ex.icd} c={C.purple} bg={C.purpleSoft} />
            <Chips label={t.mods} arr={sel.ex.mods} c={C.amber} bg={C.amberSoft} />
            <KV label={t.units} value={sel.ex.units} /><KV label={t.dos} value={sel.ex.dos} /><KV label={t.npi} value={sel.ex.npi} /><KV label={t.auth} value={sel.ex.auth} missing t={t} />
          </>
        )}
        {/* manual entry form for real uploads */}
        {isReal && !saved && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, fontFamily: FONT_DISPLAY, color: C.ink }}>{lang === "en" ? "Enter billing data" : "Ingresa datos de facturación"}</div>
            {[
              ["id", lang === "en" ? "Claim ID" : "ID del reclamo", "PV-2024-0901"],
              ["patient", lang === "en" ? "Patient" : "Paciente", "Patient #5001"],
              ["codes", lang === "en" ? "CPT / HCPCS codes" : "Códigos CPT / HCPCS", "90837"],
              ["payer", lang === "en" ? "Payer" : "Pagador", "Plan Vital"],
              ["provider", lang === "en" ? "Provider" : "Proveedor", "Dr. Rivera"],
              ["dos", lang === "en" ? "Date of service" : "Fecha de servicio", "May 15, 2024"],
              ["billed", lang === "en" ? "Billed amount ($)" : "Monto facturado ($)", "195"],
            ].map(([k, label, ph]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11.5, color: C.txt2, display: "block", marginBottom: 4 }}>{label}</label>
                <input value={form[k]} onChange={(e) => fld(k, e.target.value)} placeholder={ph} style={{ ...inp, fontSize: 13, padding: "9px 12px" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11.5, color: C.txt2, display: "block", marginBottom: 4 }}>{lang === "en" ? "Status" : "Estado"}</label>
              <select value={form.status} onChange={(e) => fld("status", e.target.value)} style={{ ...inp, fontSize: 13, padding: "9px 12px" }}>
                <option value="pending">{t.pending}</option>
                <option value="high">{t.highRisk}</option>
                <option value="denied">{t.denied}</option>
              </select>
            </div>
          </div>
        )}
        <div style={{ background: C.amberSoft, borderRadius: 11, padding: "11px 13px", marginTop: 4, display: "flex", gap: 9 }}><CircleAlert size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} /><div style={{ fontSize: 12.5, color: "#7a4e10", lineHeight: 1.5 }}>{t.reviewNote}</div></div>
        {saved ? (
          <button className="btnp" onClick={() => { setTab("claims"); setOpenClaim(saved); }} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 13, marginTop: 14 }}>
            <CheckCircle2 size={16} /> {lang === "en" ? "Claim created — open it" : "Reclamo creado — abrirlo"} <ArrowRight size={16} />
          </button>
        ) : (
          <button className="btnp" onClick={isReal ? createClaim : () => { setTab("claims"); setOpenClaim("PV-2024-0847"); }} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 13, marginTop: 14 }}>
            {t.createClaim} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function Lbl({ children, mt }) { return <label style={{ fontSize: 13, fontWeight: 500, color: C.txt, display: "block", margin: mt ? "16px 0 7px" : "0 0 7px" }}>{children}</label>; }
function Chk({ on, onClick }) { return <div onClick={onClick} style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${on ? C.teal : "#C3CCC8"}`, background: on ? C.teal : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>{on && <CheckCircle2 size={12} color="#fff" strokeWidth={3} />}</div>; }
function Head({ title, sub }) { return <div className="rise" style={{ marginBottom: 22 }}><h2 style={{ fontSize: 24, fontWeight: 500, margin: "0 0 4px", fontFamily: FONT_DISPLAY, color: C.ink }}>{title}</h2><p style={{ color: C.txt2, fontSize: 14.5, margin: 0, maxWidth: 620 }}>{sub}</p></div>; }
function SectionLabel({ icon: Ic, text }) { return <div className="rise" style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 12px" }}><Ic size={16} color={C.teal} /><span style={{ fontSize: 13, fontWeight: 500, color: C.ink, fontFamily: FONT_DISPLAY }}>{text}</span></div>; }
function Row({ k, v, last }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: last ? "none" : `1px solid ${C.lineSoft}` }}><span style={{ fontSize: 12.5, color: C.txt2 }}>{k}</span><span style={{ fontSize: 13.5, fontWeight: 500, fontFamily: FONT_DISPLAY }}>{v}</span></div>; }
function Metric({ label, value, sub, trend, up, accent, i = 0 }) {
  return (
    <div className="rise lift" style={{ animationDelay: `${i * 0.06}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, padding: "17px 19px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12.5, color: C.txt2 }}>{label}</div>
        {trend && <span style={{ fontSize: 11, fontWeight: 500, color: up ? C.teal : C.red, background: up ? C.tealSoft : C.redSoft, padding: "2px 7px", borderRadius: 10, display: "flex", alignItems: "center", gap: 2 }}>{up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{trend}</span>}
      </div>
      <div style={{ fontSize: 27, fontWeight: 500, color: accent || C.ink, marginTop: 8, fontFamily: FONT_DISPLAY }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.txt3, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
function Field({ label, value }) { return <div><div style={{ fontSize: 11, color: C.txt3, marginBottom: 3 }}>{label}</div><div style={{ fontSize: 13.5, fontWeight: 500 }}>{value}</div></div>; }
function RiskPill({ r, big, label }) {
  const t = T.en;
  return <span style={{ fontSize: big ? 13 : 12, fontWeight: 500, padding: big ? "5px 13px" : "4px 11px", borderRadius: 20, background: rbg(r), color: rc(r), display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: rc(r) }} />{r}%{label ? " " + t.denialRisk : ""}</span>;
}
function Score({ label, value, invert, delay }) {
  const good = invert ? value < 30 : value >= 70; const mid = invert ? value < 60 : value >= 50;
  const color = good ? C.teal : mid ? C.amber : C.red;
  return (
    <div className="rise" style={{ animationDelay: `${delay}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, padding: 17 }}>
      <div style={{ fontSize: 12.5, color: C.txt2, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}><div style={{ fontSize: 25, fontWeight: 500, color, fontFamily: FONT_DISPLAY }}>{value}</div><div style={{ fontSize: 14, color, fontWeight: 500 }}>%</div></div>
      <div style={{ height: 7, background: C.lineSoft, borderRadius: 4, marginTop: 9, overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 4, transition: "width .8s cubic-bezier(.2,.7,.3,1)" }} /></div>
    </div>
  );
}
function Chips({ label, arr, c, bg }) { return <div style={{ marginBottom: 13 }}><div style={{ fontSize: 11.5, color: C.txt3, marginBottom: 7 }}>{label}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{arr.length ? arr.map((x) => <span key={x} className="chip" style={{ fontSize: 12.5, fontWeight: 500, padding: "5px 12px", borderRadius: 8, background: bg, color: c }}>{x}</span>) : <span style={{ color: C.txt3 }}>—</span>}</div></div>; }
function KV({ label, value, missing, t }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${C.lineSoft}` }}><span style={{ fontSize: 12.5, color: C.txt2 }}>{label}</span>{missing && !value ? <span style={{ fontSize: 12.5, fontWeight: 500, color: C.red, display: "flex", alignItems: "center", gap: 5 }}><CircleAlert size={13} /> {t.none}</span> : <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>}</div>; }

const inp = { width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.line}`, fontSize: 14, boxSizing: "border-box", outline: "none", background: "#fff", color: C.txt, fontFamily: FONT_SANS, transition: "border-color .15s, box-shadow .15s" };
const btnP = { display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 17px", borderRadius: 11, border: "none", background: C.teal, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT_SANS };
const btnS = { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 15px", borderRadius: 11, border: `1px solid ${C.line}`, background: C.paper2, color: C.txt, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: FONT_SANS };
const btnG = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 10, border: "none", background: "transparent", color: C.txt2, fontSize: 13, cursor: "pointer", fontFamily: FONT_SANS };
const sideBtn = { display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 10, border: "none", background: "transparent", color: "rgba(255,255,255,.62)", fontSize: 13, cursor: "pointer", width: "100%", textAlign: "left", fontFamily: FONT_SANS };
