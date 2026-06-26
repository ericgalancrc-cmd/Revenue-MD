import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, ClipboardList, Brain, ReceiptText, BarChart3, Bell,
  Settings, LogOut, Search, Upload, ShieldCheck, Languages, AlertTriangle,
  FileWarning, Lightbulb, Clock, CheckCircle2, TrendingUp, TrendingDown,
  FileText, ChevronRight, Stethoscope, Send, Eye, Building2, Scale, Lock,
  FileScan, Loader2, Sparkles, ArrowRight, CircleAlert, BookOpen, FileSearch,
  Activity, ArrowUpRight, Zap, Briefcase, Target, Rocket, Award, Users, Globe,
  Download, Plug, FileInput, Network, Building, Layers, CheckSquare, Square, ListChecks,
  GraduationCap, BookMarked, ExternalLink, Hash, Info,
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
const FONT_DISPLAY = "'DM Serif Display', Georgia, serif";
const FONT_SANS = "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif";

const T = {
  en: {
    tagline: "Identify denials before they happen. Code with confidence. Get paid faster.",
    email: "Work email", password: "Password", role: "Your role", signIn: "Enter platform",
    demoNote: "Demo — any credentials work", coder: "Coder", biller: "Biller", manager: "Manager",
    nav_dash: "Overview", nav_intake: "Intake", nav_claims: "Claims", nav_analysis: "AI Analysis",
    nav_denials: "Denials", nav_revenue: "Revenue", nav_payers: "Payers", nav_compliance: "Compliance",
    nav_settings: "Settings", logout: "Sign out", nav_business: "Business", nav_batch: "Batch queue",
    nav_learn: "Learning Center",
    learnTitle: "Learning Center", learnSub: "ICD-10 codes, CPT/HCPCS, modifiers, and CMS guidelines — everything your team needs to code with confidence.",
    learnSearch: "Search codes, modifiers, or keywords…",
    learnTabCodes: "Code lookup", learnTabMods: "Modifiers", learnTabGuides: "Guidelines",
    learnCode: "Code", learnDesc: "Description", learnNotes: "Billing notes", learnUnits: "Units",
    learnMod: "Modifier", learnModDesc: "Description", learnModPayer: "Payer", learnModRule: "Rule",
    learnNoResults: "No codes found. Try a different keyword or code number.",
    learnCmsTitle: "CMS & Federal references", learnPrTitle: "Puerto Rico — payer & ASES resources",
    learnOpen: "Open", learnVerify: "Verify before production use",
    batchTitle: "Batch queue", batchSub: "Import one file, work many claims. We scrub and triage every claim so your attention goes where it matters.",
    batchDrop: "Import claim documents", batchDropSub: "PDF superbills, encounter forms, remittance advice, or CSV — we extract every code automatically", batchLoad: "Load sample batch", batchReading: "Reading document · extracting codes · scrubbing · triaging…",
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
    importSub: "Upload any claim document — PDF superbills, encounter forms, images, or CSV. RevenueMD extracts every code automatically using AI.",
    fileImport: "Document upload", fileImportD: "PDF, JPG, PNG, or CSV — superbills, encounter forms, remittance advice. No special export needed.",
    apiConnect: "Direct connection", apiConnectD: "Auto-sync via the vendor's API. Requires a data-sharing agreement.",
    available: "Available now", roadmap: "On the roadmap", connect: "Connect", importBtn: "Upload claim documents",
    importedOk: "Imported & ready to scrub", importedFrom: "from", viewImported: "Open in claim workspace",
    howWorks: "How it flows", flow1: "Scan or photograph any claim document", flow2: "RevenueMD reads and extracts every code automatically", flow3: "Rules engine scrubs for denials and compliance issues", flow4: "Review, approve, and send the clean claim to your clearinghouse",
    importNote: "RevenueMD sits before your clearinghouse (e.g. Inmediata) — it scrubs claims, it does not submit them.",
    drop: "Drop a record or click to browse", dropSub: "PDF · JPG · PNG — up to 25 MB", loadSample: "Try a sample record",
    scanning: "Reading codes…", extracted: "Extracted billing data", confidence: "OCR confidence", language: "Language",
    createClaim: "Create claim from this", reviewNote: "OCR is a starting point — confirm before creating a claim.",
    cpt: "CPT / HCPCS", icd: "ICD-10", mods: "Modifiers", units: "Units", dos: "Service date", npi: "Provider NPI", auth: "Authorization", none: "Not found",
    payersTitle: "Payer intelligence", payersSub: "Billing behavior and rules for every Puerto Rico payer you bill.",
    lob: "Lines of business", facts: "Key billing facts",
    compTitle: "Compliance center", compSub: "CMS, ASES, Medicare, PR Medicaid billing rules · HIPAA Privacy & Security Rule · PR Act 194 · cybersecurity & PHI safeguards — each with its regulatory source.",
    tab_billing: "Billing rules", tab_privacy: "HIPAA & Privacy", tab_security: "Cybersecurity & PHI",
    v_statutory: "Statutory", v_published: "Published", v_needs: "Verify first",
    verifyBanner: "rules need verification against current manuals before production use",
    disclaimerT: "Not legal advice", disclaimer: "Items marked 'verify first' are placeholders modeled on common patterns and must be confirmed against current ASES and payer manuals by a certified PR coder. Nothing here constitutes legal or compliance advice.",
  },
  es: {
    tagline: "Detecta denegaciones antes de que ocurran. Codifica con confianza. Cobra más rápido.",
    email: "Correo de trabajo", password: "Contraseña", role: "Tu rol", signIn: "Entrar a la plataforma",
    demoNote: "Demo — cualquier credencial funciona", coder: "Codificador", biller: "Facturador", manager: "Gerente",
    nav_dash: "Resumen", nav_intake: "Recepción", nav_claims: "Reclamos", nav_analysis: "Análisis IA",
    nav_denials: "Denegaciones", nav_revenue: "Ingresos", nav_payers: "Pagadores", nav_compliance: "Cumplimiento",
    nav_settings: "Ajustes", logout: "Salir", nav_business: "Negocio", nav_batch: "Cola por lote",
    nav_learn: "Centro de aprendizaje",
    learnTitle: "Centro de aprendizaje", learnSub: "Códigos ICD-10, CPT/HCPCS, modificadores y guías CMS — todo lo que tu equipo necesita para codificar con confianza.",
    learnSearch: "Buscar códigos, modificadores o palabras clave…",
    learnTabCodes: "Búsqueda de códigos", learnTabMods: "Modificadores", learnTabGuides: "Guías",
    learnCode: "Código", learnDesc: "Descripción", learnNotes: "Notas de facturación", learnUnits: "Unidades",
    learnMod: "Modificador", learnModDesc: "Descripción", learnModPayer: "Pagador", learnModRule: "Regla",
    learnNoResults: "No se encontraron códigos. Intente con otra palabra clave o número de código.",
    learnCmsTitle: "CMS y referencias federales", learnPrTitle: "Puerto Rico — recursos de pagadores y ASES",
    learnOpen: "Abrir", learnVerify: "Verificar antes de uso en producción",
    batchTitle: "Cola por lote", batchSub: "Importa un archivo, trabaja muchos reclamos. Revisamos y clasificamos cada uno para que tu atención vaya donde importa.",
    batchDrop: "Importar documentos de reclamos", batchDropSub: "PDF, superbills, formularios de encuentro, imágenes o CSV — extraemos cada código automáticamente", batchLoad: "Cargar lote de muestra", batchReading: "Leyendo documento · extrayendo códigos · revisando · clasificando…",
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
    importSub: "Sube cualquier documento de reclamo — superbills en PDF, formularios de encuentro, imágenes o CSV. RevenueMD extrae cada código automáticamente con IA.",
    fileImport: "Subir documento", fileImportD: "PDF, JPG, PNG o CSV — superbills, formularios de encuentro, aviso de pago. No necesitas exportar en formato especial.",
    apiConnect: "Conexión directa", apiConnectD: "Sincroniza vía la API del proveedor. Requiere acuerdo de datos.",
    available: "Disponible ahora", roadmap: "En el plan", connect: "Conectar", importBtn: "Subir documentos de reclamos",
    importedOk: "Importado y listo para revisar", importedFrom: "desde", viewImported: "Abrir en el área de reclamos",
    howWorks: "Cómo fluye", flow1: "Escanea o fotografía cualquier documento de reclamo", flow2: "RevenueMD lee y extrae cada código automáticamente", flow3: "El motor de reglas revisa por denegaciones y cumplimiento", flow4: "Revisa, aprueba y envía el reclamo limpio al clearinghouse",
    importNote: "RevenueMD va antes de tu clearinghouse (ej. Inmediata) — revisa los reclamos, no los somete.",
    scanRecord: "Escanear expediente",
    drop: "Suelta un expediente o haz clic", dropSub: "PDF · JPG · PNG — hasta 25 MB", loadSample: "Probar expediente de muestra",
    scanning: "Leyendo códigos…", extracted: "Datos de facturación extraídos", confidence: "Confianza OCR", language: "Idioma",
    createClaim: "Crear reclamo con esto", reviewNote: "El OCR es un punto de partida — confirma antes de crear un reclamo.",
    cpt: "CPT / HCPCS", icd: "ICD-10", mods: "Modificadores", units: "Unidades", dos: "Fecha de servicio", npi: "NPI proveedor", auth: "Autorización", none: "No encontrado",
    payersTitle: "Inteligencia de pagadores", payersSub: "Comportamiento y reglas de facturación de cada pagador de Puerto Rico.",
    lob: "Líneas de negocio", facts: "Datos clave",
    compTitle: "Centro de cumplimiento", compSub: "Reglas CMS, ASES, Medicare, Medicaid PR · HIPAA Privacidad y Seguridad · Ley 194 PR · ciberseguridad y PHI — cada una con su fuente regulatoria.",
    tab_billing: "Reglas de facturación", tab_privacy: "HIPAA y privacidad", tab_security: "Ciberseguridad y PHI",
    v_statutory: "Estatutario", v_published: "Publicado", v_needs: "Verificar",
    verifyBanner: "reglas necesitan verificación contra manuales vigentes antes de producción",
    disclaimerT: "No es asesoría legal", disclaimer: "Los elementos 'verificar' son marcadores basados en patrones comunes y deben confirmarse contra los manuales vigentes de ASES y pagadores por un codificador certificado de PR. Nada aquí constituye asesoría legal o de cumplimiento.",
  },
};

const CLAIMS = [
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
  { id: "PLANVITAL", name: "Plan Vital", sub: "ASES · Medicaid · GHP", color: C.teal, soft: C.tealSoft, lob: ["Medicaid", "GHP"],
    facts: [
      { lEn: "Government Health Plan (GHP) covering ~1.6M Puerto Rico residents — administered by ASES", lEs: "Plan de Salud del Gobierno (GHP) para ~1.6M residentes — administrado por ASES", v: "published" },
      { lEn: "Timely filing: 90 days from date of service (ASES Provider Manual 2024 §6.3)", lEs: "Presentación oportuna: 90 días desde la fecha de servicio (Manual ASES 2024 §6.3)", v: "published" },
      { lEn: "Electronic claims required when submitting ≥10 claims/month (ASES EDI Companion Guide)", lEs: "Reclamos electrónicos requeridos al someter ≥10 reclamos/mes", v: "published" },
      { lEn: "Rendering NPI + Group NPI both required on 837P", lEs: "NPI del proveedor y NPI del grupo requeridos en el 837P", v: "published" },
      { lEn: "H0004 daily unit cap: 8 units/day; prior auth required — verify current fee schedule", lEs: "Tope diario H0004: 8 unidades/día; autorización previa requerida — verificar", v: "needs" },
      { lEn: "Prior authorization required for behavioral health series >12 sessions/year (ASES BH Grid)", lEs: "Autorización previa para series de salud conductual >12 sesiones/año (Grid ASES)", v: "published" },
      { lEn: "Behavioral-health co-location rules and modifier requirements apply (GT for telehealth)", lEs: "Aplican reglas de co-localización y modificadores de salud conductual (GT para telesalud)", v: "published" },
      { lEn: "Member ID format: 2 alpha + 8 digits (e.g., PV90012345)", lEs: "Formato ID miembro: 2 letras + 8 dígitos (ej. PV90012345)", v: "published" },
    ]},
  { id: "TRIPLES", name: "Triple-S Salud", sub: "BCBS · GHP · Commercial", color: C.blue, soft: C.blueSoft, lob: ["Medicaid", "MA", "Commercial"],
    facts: [
      { lEn: "BCBS licensee for Puerto Rico & USVI — submit all BCBS Blue claims to Triple-S", lEs: "Licenciatario BCBS para PR y USVI — todos los reclamos Blue se someten a Triple-S", v: "published" },
      { lEn: "BlueCard claims: member ID must start with 3 uppercase alpha prefix (e.g., XYZ123456789)", lEs: "Reclamos BlueCard: ID debe comenzar con 3 letras mayúsculas (ej. XYZ123456789)", v: "published" },
      { lEn: "Commercial timely filing: 180 days; BlueCard out-of-state: up to 365 days", lEs: "Presentación comercial: 180 días; BlueCard fuera del estado: hasta 365 días", v: "published" },
      { lEn: "Non-par reconsideration must be filed within 60 days of EOB", lEs: "Reconsideración no-par debe presentarse en 60 días del EOB", v: "published" },
      { lEn: "GHP (Medicaid) product follows ASES timely filing rules (90 days)", lEs: "Producto GHP (Medicaid) sigue reglas ASES de presentación (90 días)", v: "published" },
      { lEn: "Coordination of benefits required when Medicare is primary payer", lEs: "Coordinación de beneficios requerida cuando Medicare es pagador primario", v: "published" },
      { lEn: "PA requirements for specialist referrals and high-cost imaging — verify by LOB", lEs: "Requisitos de PA para especialistas e imágenes de alto costo — verificar por LOB", v: "needs" },
    ]},
  { id: "MCS", name: "MCS / Humana", sub: "Medicare Advantage · Platino", color: C.purple, soft: C.purpleSoft, lob: ["MA", "Platino"],
    facts: [
      { lEn: "MCS Classicare is a Medicare Advantage plan — all Medicare rules (42 CFR Part 422) apply", lEs: "MCS Classicare es un plan Medicare Advantage — aplican reglas Medicare (42 CFR Parte 422)", v: "statutory" },
      { lEn: "MCS Platino: wrap-around benefit for dual-eligible (Medicare + Medicaid) members", lEs: "MCS Platino: beneficio adicional para miembros duales (Medicare + Medicaid)", v: "published" },
      { lEn: "MA timely filing: up to 12 months from date of service (42 CFR §424.44)", lEs: "Presentación MA: hasta 12 meses desde la fecha de servicio (42 CFR §424.44)", v: "statutory" },
      { lEn: "Rendering provider must have valid PTAN and Medicare enrollment for Puerto Rico", lEs: "Proveedor debe tener PTAN válido y matrícula Medicare para Puerto Rico", v: "statutory" },
      { lEn: "Medicare secondary payer (MSP) rules apply when another payer is primary", lEs: "Reglas MSP aplican cuando otro pagador es primario", v: "statutory" },
      { lEn: "Prior auth schedule may differ from FFS Medicare — verify with MCS provider portal", lEs: "Lista de autorizaciones previas puede diferir de Medicare FFS — verificar con portal MCS", v: "needs" },
    ]},
  { id: "HUMANA", name: "Humana PR", sub: "MA · Platino · Commercial", color: C.blue, soft: C.blueSoft, lob: ["MA", "Platino", "Commercial"],
    facts: [
      { lEn: "Humana Medicare Advantage: timely filing within 12 months of date of service", lEs: "Medicare Advantage Humana: presentación dentro de 12 meses desde la fecha de servicio", v: "published" },
      { lEn: "Commercial filing deadline per individual provider contract (typically 90–180 days)", lEs: "Presentación comercial según contrato del proveedor (usualmente 90–180 días)", v: "published" },
      { lEn: "PR Prompt Payment Law (Act 194-2000; 26 LPRA §3348a): insurer must pay clean claims within 30 days (electronic) or 45 days (paper)", lEs: "Ley de Pago Puntual PR (Ley 194-2000; 26 LPRA §3348a): pago en 30 días (electrónico) o 45 días (papel)", v: "statutory" },
      { lEn: "Platino dual-eligible members: Medicare Part A/B primary; ASES Medicaid secondary", lEs: "Miembros duales Platino: Medicare Parte A/B primario; Medicaid ASES secundario", v: "published" },
      { lEn: "FCSO (First Coast Service Options) processes underlying Medicare claims for PR", lEs: "FCSO (First Coast Service Options) procesa reclamos Medicare subyacentes en PR", v: "published" },
    ]},
  { id: "MMM", name: "MMM Healthcare", sub: "Medicaid · MA · Platino", color: C.purple, soft: C.purpleSoft, lob: ["Medicaid", "MA", "Platino"],
    facts: [
      { lEn: "MMM Multi Health: ASES-contracted Vital/Medicaid plan — ASES rules and 90-day timely filing apply", lEs: "MMM Multi Health: plan Vital/Medicaid contratado por ASES — aplican reglas ASES y 90 días", v: "published" },
      { lEn: "MMM Platino: Medicare Advantage plan covering dual-eligible members, including services outside PR", lEs: "MMM Platino: plan MA para miembros duales, incluye servicios fuera de PR", v: "published" },
      { lEn: "MA product: 42 CFR Part 422 applies; timely filing up to 12 months from DOS", lEs: "Producto MA: aplica 42 CFR Parte 422; presentación hasta 12 meses desde DOS", v: "statutory" },
      { lEn: "Behavioral health prior authorization required — verify current MMM auth grid", lEs: "Autorización previa para salud conductual — verificar grid de autorización MMM vigente", v: "needs" },
      { lEn: "Electronic claims (837P HIPAA 5010) required; NPI mandatory on all submissions", lEs: "Reclamos electrónicos (837P HIPAA 5010) requeridos; NPI obligatorio en todas las someter", v: "published" },
    ]},
  { id: "MENONITA", name: "Plan Menonita", sub: "GHP · Medicaid", color: C.teal, soft: C.tealSoft, lob: ["Medicaid"],
    facts: [
      { lEn: "Vital/Medicaid plan contracted by ASES — all ASES Provider Manual rules apply", lEs: "Plan Vital/Medicaid contratado por ASES — aplican todas las reglas del Manual de Proveedores ASES", v: "published" },
      { lEn: "Timely filing: 90 days from date of service (ASES contract requirement)", lEs: "Presentación oportuna: 90 días desde la fecha de servicio (contrato ASES)", v: "published" },
      { lEn: "Affiliated with the Mennonite health system — primarily serves central and western Puerto Rico", lEs: "Afiliado al sistema de salud Menonita — principalmente centro y oeste de Puerto Rico", v: "published" },
      { lEn: "Plan-specific coverage overlays may differ from base ASES policy — verify current Plan Menonita bulletin", lEs: "Coberturas específicas del plan pueden diferir de la política base ASES — verificar boletín vigente", v: "needs" },
    ]},
  { id: "MEDICARE", name: "Medicare (FCSO)", sub: "Part A · Part B · FCSO", color: C.amber, soft: C.amberSoft, lob: ["Medicare", "Part A", "Part B"],
    facts: [
      { lEn: "First Coast Service Options (FCSO) is the Medicare Administrative Contractor (MAC) for Puerto Rico — Jurisdiction N", lEs: "First Coast Service Options (FCSO) es el contratista MAC de Medicare para PR — Jurisdicción N", v: "published" },
      { lEn: "Timely filing: claims must be received within 12 months of date of service (42 CFR §424.44)", lEs: "Presentación oportuna: 12 meses desde la fecha de servicio (42 CFR §424.44)", v: "statutory" },
      { lEn: "ABN (Advance Beneficiary Notice) required before delivering non-covered services to Medicare beneficiaries", lEs: "ABN requerido antes de servicios no cubiertos a beneficiarios Medicare (42 CFR §411.408)", v: "statutory" },
      { lEn: "Telehealth: modifier GT (Medicare) required; services must be on the Medicare telehealth services list", lEs: "Telesalud: modificador GT (Medicare) requerido; servicio debe estar en la lista de telesalud Medicare", v: "statutory" },
      { lEn: "E/M documentation: 2021 AMA guidelines — total time or medical decision making (MDM) basis", lEs: "E/M: guías AMA 2021 — tiempo total o toma de decisiones médicas (MDM)", v: "statutory" },
      { lEn: "Medicare secondary payer (MSP): verify primary payer before submitting — MSP violations carry civil penalties", lEs: "MSP: verificar pagador primario antes de someter — violaciones MSP conllevan multas civiles", v: "statutory" },
    ]},
];

const BILLING_RULES = [
  // ASES / PR Medicaid
  { code: "ASES-001", sev: "error", v: "published", en: "Medical necessity required for all covered services — must be documented in the clinical note", es: "Necesidad medica requerida para todos los servicios — debe estar documentada en la nota clinica", src: "ASES Provider Manual 2024, §4.1" },
  { code: "ASES-002", sev: "error", v: "published", en: "Timely filing limit: 90 days from date of service for all ASES/Medicaid GHP products", es: "Limite de presentacion: 90 dias desde la fecha de servicio para todos los productos ASES/Medicaid GHP", src: "ASES Provider Manual 2024, §6.3" },
  { code: "ASES-003", sev: "error", v: "published", en: "Electronic claims (837P HIPAA 5010) required for providers submitting 10 or more claims/month", es: "Reclamos electronicos (837P HIPAA 5010) requeridos para proveedores con 10 o mas reclamos/mes", src: "ASES EDI Companion Guide 2024, §2.1" },
  { code: "ASES-004", sev: "error", v: "published", en: "Rendering provider NPI and billing group NPI both required on 837P loop 2310B / 2010BB", es: "NPI del proveedor y NPI del grupo requeridos en el 837P (loops 2310B / 2010BB)", src: "ASES EDI 837P Companion Guide 2024" },
  { code: "ASES-005", sev: "error", v: "published", en: "Prior authorization required for behavioral health series exceeding 12 sessions per benefit year", es: "Autorizacion previa para series de salud conductual que excedan 12 sesiones por ano de beneficio", src: "ASES BH Authorization Grid 2024" },
  { code: "ASES-006", sev: "error", v: "needs", en: "H0004 daily unit cap: 8 units/day under Plan Vital — verify current ASES fee schedule before billing", es: "Tope diario H0004: 8 unidades/dia bajo Plan Vital — verificar fee schedule ASES vigente", src: "Plan Vital BH Bulletin 2023 [verify against current schedule]" },
  { code: "ASES-007", sev: "warning", v: "published", en: "Coordination of benefits (COB) required when member holds dual Medicaid + commercial coverage", es: "Coordinacion de beneficios requerida cuando el miembro tiene cobertura doble Medicaid + comercial", src: "ASES COB Policy 2024" },
  { code: "ASES-008", sev: "warning", v: "published", en: "ICD-10 diagnosis must be coded to highest specificity — avoid unspecified when a specific code is available", es: "ICD-10 debe codificarse al nivel mas especifico — evitar no especificado cuando hay codigo especifico", src: "CMS ICD-10-CM Official Guidelines FY2024, §I.B.5" },
  { code: "ASES-009", sev: "warning", v: "published", en: "Place of service (POS) code must match the actual care setting; telehealth = POS 02 or 10 + modifier GT", es: "Codigo POS debe corresponder al lugar real; telesalud = POS 02 o 10 + modificador GT", src: "ASES Telehealth Policy 2023; CMS POS Code Set" },
  // Medicare / CMS
  { code: "CMS-001", sev: "error", v: "statutory", en: "Medicare timely filing: claims must be received within 12 months of date of service (42 CFR §424.44)", es: "Presentacion oportuna Medicare: 12 meses desde la fecha de servicio (42 CFR §424.44)", src: "42 CFR §424.44(a)" },
  { code: "CMS-002", sev: "error", v: "statutory", en: "Advance Beneficiary Notice (ABN) required before delivering non-covered services to Medicare beneficiaries", es: "ABN requerido antes de servicios no cubiertos a beneficiarios Medicare", src: "42 CFR §411.408; CMS Pub 100-04, Ch. 30, §50" },
  { code: "CMS-003", sev: "error", v: "published", en: "FCSO (First Coast Service Options) is the Medicare Administrative Contractor for Puerto Rico — Jurisdiction N", es: "FCSO es el contratista MAC de Medicare para PR (Jurisdiccion N)", src: "CMS MAC Jurisdictions; FCSO Provider Resources" },
  { code: "CMS-004", sev: "error", v: "statutory", en: "Telehealth claims require modifier GT (Medicare/ASES) or 95 (commercial) — confirm payer policy before billing", es: "Reclamos de telesalud requieren modificador GT (Medicare/ASES) o 95 (comercial)", src: "42 CFR §410.78; CMS MLN SE20011; ASES Telehealth Policy 2023" },
  { code: "CMS-005", sev: "warning", v: "statutory", en: "E/M documentation (2021 AMA guidelines): basis is total time on date of service or medical decision making (MDM)", es: "E/M (guias AMA 2021): base es tiempo total en la fecha de servicio o toma de decisiones medicas (MDM)", src: "CMS Transmittal 10901; AMA CPT Guidelines 2021" },
  { code: "CMS-006", sev: "error", v: "statutory", en: "Medicare secondary payer (MSP): verify primary payer before submitting to Medicare — MSP violations carry civil money penalties", es: "MSP: verificar pagador primario antes de someter a Medicare — violaciones MSP conllevan penalidades civiles", src: "42 CFR §489.20(g); CMS Pub 100-05" },
  // NCCI / Correct Coding
  { code: "NCCI-001", sev: "error", v: "statutory", en: "NCCI (National Correct Coding Initiative) edits apply to all Medicare and Medicaid claims nationwide", es: "Ediciones NCCI aplican a todos los reclamos Medicare y Medicaid", src: "CMS NCCI Policy Manual, Ch. 1, §A; 42 CFR §447.82" },
  { code: "NCCI-002", sev: "error", v: "statutory", en: "Mutually exclusive procedure code pairs cannot be billed on the same date of service for the same patient", es: "Pares de codigos mutuamente excluyentes no pueden facturarse el mismo dia para el mismo paciente", src: "CMS NCCI Policy Manual, Ch. 1, §D" },
  { code: "NCCI-003", sev: "warning", v: "statutory", en: "Add-on codes (90833, 90785, 99354 etc.) must appear with their required primary procedure code on the same claim", es: "Codigos adicionales (90833, 90785, 99354, etc.) deben acompanar al codigo primario en el mismo reclamo", src: "CMS NCCI Policy Manual, Ch. 1, §E; AMA CPT 2024" },
  // HIPAA Transactions
  { code: "HIPAA-TX-001", sev: "error", v: "statutory", en: "EDI 837P (HIPAA 5010, ASC X12 005010X222A1) is the only accepted format for electronic professional claims", es: "EDI 837P (HIPAA 5010) es el unico formato aceptado para reclamos profesionales electronicos", src: "45 CFR §162.1102; ASC X12 005010X222A1" },
  { code: "HIPAA-TX-002", sev: "error", v: "statutory", en: "National Provider Identifier (NPI) is mandatory on all HIPAA electronic transactions", es: "NPI es obligatorio en todas las transacciones electronicas HIPAA", src: "45 CFR §162.406; 45 CFR §162.1102(b)(6)" },
  { code: "HIPAA-TX-003", sev: "warning", v: "statutory", en: "835 ERA (Electronic Remittance Advice) is the HIPAA-mandated standard for payment posting", es: "835 ERA es el estandar HIPAA para registro de pagos", src: "45 CFR §162.1601; ASC X12 005010X221A1" },
  // PR Prompt Payment Law
  { code: "PR-PPL-001", sev: "warning", v: "statutory", en: "PR Prompt Payment Law (Act 194-2000): insurer must pay clean claims within 30 days (electronic) or 45 days (paper)", es: "Ley de Pago Puntual PR (Ley 194-2000): pago en 30 dias (electronico) o 45 dias (papel)", src: "PR Act 194-2000; 26 LPRA §3348a; OCS Circular Letter 2023-003" },
];
const PRIVACY_RULES = [
  { code: "PRIV-001", sev: "error", v: "statutory", en: "PHI may only be used/disclosed for Treatment, Payment, or Healthcare Operations (TPO) without explicit patient authorization", es: "La PHI solo puede usarse para Tratamiento, Pago u Operaciones de Salud (TPO) sin autorizacion explicita del paciente", src: "HIPAA 45 CFR §164.502(a)" },
  { code: "PRIV-002", sev: "error", v: "statutory", en: "Minimum Necessary Standard: limit PHI access and disclosure to the minimum reasonably necessary to accomplish the purpose", es: "Estandar de Minimo Necesario: limitar acceso y divulgacion de PHI al minimo razonablemente necesario", src: "HIPAA 45 CFR §164.502(b); §164.514(d)" },
  { code: "PRIV-003", sev: "error", v: "statutory", en: "Patient right to access and receive a copy of their PHI within 30 days of request (15-day extension available with notice)", es: "Derecho del paciente a acceder y recibir copia de su PHI en 30 dias (extension de 15 dias con aviso)", src: "HIPAA 45 CFR §164.524; HHS Final Rule 2024" },
  { code: "PRIV-004", sev: "error", v: "statutory", en: "Notice of Privacy Practices (NPP) must be provided at first service, posted in office/website, and made available on request", es: "Aviso de Practicas de Privacidad (NPP) requerido en el primer servicio y disponible a peticion", src: "HIPAA 45 CFR §164.520" },
  { code: "PRIV-005", sev: "error", v: "statutory", en: "Psychotherapy notes require explicit patient authorization and cannot be released under standard TPO purposes", es: "Notas de psicoterapia requieren autorizacion explicita del paciente y no pueden divulgarse bajo TPO", src: "HIPAA 45 CFR §164.508(a)(2)" },
  { code: "PRIV-006", sev: "error", v: "statutory", en: "Business Associate Agreement (BAA) required for every vendor, contractor, or software provider who creates, receives, or transmits PHI on your behalf", es: "Acuerdo de Asociado Comercial (BAA) requerido para todo proveedor o contratista que crea, recibe o transmite PHI", src: "HIPAA 45 CFR §164.504(e)" },
  { code: "PRIV-007", sev: "error", v: "statutory", en: "Breach Notification Rule: notify affected individuals and HHS within 60 days of discovery; media notice required if >500 individuals in a state/territory", es: "Notificacion de Brechas: notificar individuos y HHS en 60 dias; aviso en medios si mas de 500 personas", src: "HIPAA 45 CFR §164.404; §164.406; §164.408; HITECH §13402" },
  { code: "PRIV-008", sev: "warning", v: "statutory", en: "PHI records must be retained for a minimum of 6 years from date of creation or last effective date, whichever is later", es: "Expedientes PHI deben retenerse por minimo 6 anos desde la creacion o la ultima fecha efectiva", src: "HIPAA 45 CFR §164.530(j)" },
  { code: "PRIV-009", sev: "error", v: "statutory", en: "PR Act 194-2000 (24 LPRA §3049) governs confidentiality of medical records — applies the stricter of HIPAA or PR law", es: "Ley 194-2000 PR (24 LPRA §3049) rige la confidencialidad de expedientes medicos — aplica lo mas estricto", src: "PR Act 194-2000; 24 LPRA §3049; §3052" },
  { code: "PRIV-010", sev: "warning", v: "statutory", en: "PR law provides a private right of action for HIPAA and Act 194 violations — patients may sue for damages in PR courts", es: "La ley PR otorga accion privada por violaciones HIPAA y Ley 194 — pacientes pueden demandar en cortes de PR", src: "24 LPRA §3052; PR Supreme Court precedent" },
  { code: "PRIV-011", sev: "warning", v: "published", en: "HIV/AIDS information subject to heightened confidentiality under PR Act 56-1994 — requires separate written consent for disclosure", es: "Informacion de VIH/SIDA sujeta a confidencialidad reforzada bajo Ley 56-1994 PR — requiere consentimiento escrito separado", src: "PR Act 56-1994; 24 LPRA §§3101-3113" },
  { code: "PRIV-012", sev: "warning", v: "statutory", en: "Substance use disorder records (42 CFR Part 2) have stricter protections than HIPAA — do not re-disclose without patient consent", es: "Expedientes de trastornos por uso de sustancias (42 CFR Parte 2) tienen protecciones mas estrictas que HIPAA", src: "42 CFR Part 2; SAMHSA Guidance 2020" },
];
const SECURITY_RULES = [
  { code: "SEC-001", sev: "error", v: "statutory", en: "Annual security risk analysis required — identify and document all vulnerabilities to ePHI confidentiality, integrity, and availability", es: "Analisis de riesgos de seguridad anual requerido — identificar y documentar vulnerabilidades a la ePHI", src: "HIPAA 45 CFR §164.308(a)(1)(ii)(A); HHS Guidance 2022" },
  { code: "SEC-002", sev: "error", v: "statutory", en: "Unique user IDs required for all workforce members accessing ePHI — shared credentials are a HIPAA Security Rule violation", es: "IDs de usuario unicos requeridos para todo el personal con acceso a ePHI — credenciales compartidas son violacion HIPAA", src: "HIPAA 45 CFR §164.312(a)(2)(i)" },
  { code: "SEC-003", sev: "error", v: "statutory", en: "Automatic logoff required on workstations and applications after a defined period of inactivity when ePHI is accessible", es: "Cierre automatico de sesion requerido en estaciones de trabajo y apps con acceso a ePHI", src: "HIPAA 45 CFR §164.312(a)(2)(iii)" },
  { code: "SEC-004", sev: "error", v: "statutory", en: "Encryption required for ePHI transmitted over open networks — email, internet, and SMS containing ePHI must use TLS 1.2+ or equivalent", es: "Encriptacion requerida para ePHI en redes abiertas — correo, internet y SMS con ePHI deben usar TLS 1.2+", src: "HIPAA 45 CFR §164.312(e)(2)(ii); NIST SP 800-111; OCR Guidance 2022" },
  { code: "SEC-005", sev: "error", v: "statutory", en: "ePHI encryption at rest required on laptops, mobile devices, external drives, and portable media (AES-256 or equivalent)", es: "Encriptacion en reposo de ePHI requerida en laptops, moviles, unidades externas y medios portatiles (AES-256)", src: "HIPAA 45 CFR §164.312(a)(2)(iv); NIST SP 800-111" },
  { code: "SEC-006", sev: "error", v: "statutory", en: "Audit controls: implement hardware, software, and procedural mechanisms to record and examine ePHI system access and activity", es: "Controles de auditoria: implementar mecanismos para registrar y examinar el acceso y actividad en sistemas con ePHI", src: "HIPAA 45 CFR §164.312(b)" },
  { code: "SEC-007", sev: "error", v: "published", en: "Multi-factor authentication (MFA) required for remote access to any system containing ePHI — password alone is insufficient", es: "Autenticacion multifactor (MFA) requerida para acceso remoto a sistemas con ePHI", src: "HHS OCR Cybersecurity Newsletter 2023; NIST SP 800-63B §4.2" },
  { code: "SEC-008", sev: "error", v: "statutory", en: "Ransomware and malware attacks on ePHI are presumed HIPAA breaches and must be reported unless low probability of PHI compromise can be demonstrated", es: "Ataques de ransomware a ePHI se presumen brechas HIPAA y deben reportarse salvo que se demuestre baja probabilidad de compromiso", src: "HHS OCR Ransomware Guidance 2016; HIPAA 45 CFR §164.402" },
  { code: "SEC-009", sev: "warning", v: "statutory", en: "Business Continuity and Disaster Recovery plan required — include data backup, restore testing, and emergency access procedures for ePHI", es: "Plan de Continuidad de Negocio y Recuperacion de Desastres requerido — incluir copias de seguridad y acceso de emergencia", src: "HIPAA 45 CFR §164.308(a)(7); NIST SP 800-34" },
  { code: "SEC-010", sev: "warning", v: "statutory", en: "Physical access controls required for server rooms, workstations, and all locations where ePHI is stored or processed", es: "Controles de acceso fisico requeridos en cuartos de servidores y lugares donde se almacena o procesa ePHI", src: "HIPAA 45 CFR §164.310(a)(2)(ii); §164.310(b)" },
  { code: "SEC-011", sev: "warning", v: "statutory", en: "Security awareness training required at hire and at least annually — must cover phishing, password hygiene, and PHI handling", es: "Capacitacion en seguridad requerida al contratar y al menos anualmente — incluir phishing, contrasenas y manejo de PHI", src: "HIPAA 45 CFR §164.308(a)(5); HHS OCR Phase 2 Audit Protocol" },
  { code: "SEC-012", sev: "warning", v: "published", en: "Password policy: NIST SP 800-63B recommends minimum 8 characters, no mandatory periodic rotation, block known-compromised passwords", es: "Politica de contrasenas: NIST SP 800-63B recomienda minimo 8 caracteres, sin rotacion periodica obligatoria", src: "NIST SP 800-63B §5.1.1; HHS OCR Cybersecurity Newsletter 2023" },
  { code: "SEC-013", sev: "warning", v: "statutory", en: "Device and media disposal: ePHI must be permanently destroyed (DoD wipe, degaussing, or physical destruction) before discarding hardware", es: "Eliminacion de dispositivos: la ePHI debe destruirse permanentemente antes de desechar hardware", src: "HIPAA 45 CFR §164.310(d)(2)(i); NIST SP 800-88" },
  { code: "SEC-014", sev: "error", v: "published", en: "Workforce termination procedures: revoke all ePHI system access within 24 hours of employee separation — include cloud accounts and VPN", es: "Terminacion de empleados: revocar todo acceso a ePHI en 24 horas de la separacion — incluir cuentas en la nube y VPN", src: "HIPAA 45 CFR §164.308(a)(3)(ii)(C); NIST SP 800-53 AC-2" },
];

// ── API connection ────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || "";  // set in .env.local


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

// ── Learning Center data ─────────────────────────────────────────────────────
const LEARN_CODES = [
  // ICD-10 — Behavioral Health (F-codes)
  { type:"ICD-10", code:"F32.0", desc:"Major depressive disorder, single episode, mild", units:"—", notes:"" },
  { type:"ICD-10", code:"F32.1", desc:"Major depressive disorder, single episode, moderate", units:"—", notes:"" },
  { type:"ICD-10", code:"F32.2", desc:"Major depressive disorder, single episode, severe without psychotic features", units:"—", notes:"" },
  { type:"ICD-10", code:"F33.0", desc:"Major depressive disorder, recurrent, mild", units:"—", notes:"" },
  { type:"ICD-10", code:"F33.1", desc:"Major depressive disorder, recurrent, moderate", units:"—", notes:"" },
  { type:"ICD-10", code:"F41.0", desc:"Panic disorder without agoraphobia", units:"—", notes:"" },
  { type:"ICD-10", code:"F41.1", desc:"Generalized anxiety disorder", units:"—", notes:"" },
  { type:"ICD-10", code:"F41.9", desc:"Anxiety disorder, unspecified", units:"—", notes:"" },
  { type:"ICD-10", code:"F43.10", desc:"Post-traumatic stress disorder, unspecified", units:"—", notes:"" },
  { type:"ICD-10", code:"F43.11", desc:"Post-traumatic stress disorder, acute", units:"—", notes:"" },
  { type:"ICD-10", code:"F43.12", desc:"Post-traumatic stress disorder, chronic", units:"—", notes:"" },
  { type:"ICD-10", code:"F31.9", desc:"Bipolar disorder, unspecified", units:"—", notes:"" },
  { type:"ICD-10", code:"F20.9", desc:"Schizophrenia, unspecified", units:"—", notes:"" },
  { type:"ICD-10", code:"F84.0", desc:"Autistic disorder", units:"—", notes:"" },
  { type:"ICD-10", code:"F90.0", desc:"ADHD, predominantly inattentive type", units:"—", notes:"" },
  { type:"ICD-10", code:"F90.1", desc:"ADHD, predominantly hyperactive-impulsive type", units:"—", notes:"" },
  { type:"ICD-10", code:"F10.10", desc:"Alcohol abuse, uncomplicated", units:"—", notes:"" },
  { type:"ICD-10", code:"F11.10", desc:"Opioid abuse, uncomplicated", units:"—", notes:"" },
  { type:"ICD-10", code:"F50.00", desc:"Anorexia nervosa, unspecified", units:"—", notes:"" },
  { type:"ICD-10", code:"F60.3", desc:"Borderline personality disorder", units:"—", notes:"" },
  { type:"ICD-10", code:"Z63.0", desc:"Problems in relationship with spouse or partner", units:"—", notes:"" },
  { type:"ICD-10", code:"Z03.89", desc:"Encounter for observation, suspected condition ruled out", units:"—", notes:"" },
  // CPT — Psychotherapy
  { type:"CPT", code:"90832", desc:"Psychotherapy, 30 minutes (16–37 min)", units:"1/day", notes:"Plan Vital: treatment-plan date required in note. Modifier GT for telehealth." },
  { type:"CPT", code:"90834", desc:"Psychotherapy, 45 minutes (38–52 min)", units:"1/day", notes:"Plan Vital: treatment-plan date required in note. Modifier GT for telehealth." },
  { type:"CPT", code:"90837", desc:"Psychotherapy, 60 minutes (53+ min)", units:"1/day", notes:"Plan Vital: treatment-plan date required in note. Modifier GT for telehealth." },
  { type:"CPT", code:"90785", desc:"Interactive complexity — add-on", units:"1/day", notes:"Add-on only with 90832/90834/90837. Documents caregiver involvement or other complexity." },
  { type:"CPT", code:"90833", desc:"Psychotherapy add-on, 30 min (with E&M)", units:"1/day", notes:"Add-on to E&M (99202–99215). Use modifier 25 on the E&M." },
  { type:"CPT", code:"90839", desc:"Psychotherapy for crisis, first 60 minutes", units:"1/day", notes:"Crisis intervention. Not billable same day as 90832/90834/90837." },
  { type:"CPT", code:"90840", desc:"Psychotherapy for crisis, each add'l 30 min", units:"Add-on", notes:"Add-on to 90839 only." },
  { type:"CPT", code:"90791", desc:"Psychiatric diagnostic evaluation", units:"1", notes:"Initial evaluation, no medical services. One per year typical." },
  { type:"CPT", code:"90792", desc:"Psychiatric diagnostic evaluation with medical services", units:"1", notes:"Must be performed by an MD/DO/NP/PA." },
  { type:"CPT", code:"90853", desc:"Group psychotherapy", units:"1/session", notes:"Typically 45–90 minutes; document number of participants." },
  // HCPCS — Behavioral Health
  { type:"HCPCS", code:"H0004", desc:"Behavioral health counseling and therapy, per 15 minutes", units:"8/day max (Plan Vital)", notes:"Plan Vital caps at 8 units/day. Prior auth required for extended series. Modifier GT for telehealth." },
  { type:"HCPCS", code:"H0019", desc:"Behavioral health day treatment program, per hour", units:"Up to 24/day", notes:"Partial hospitalization / day treatment. Prior auth typically required." },
  { type:"HCPCS", code:"H2019", desc:"Therapeutic behavioral services, per 15 minutes", units:"Per auth", notes:"ABA-related; verify payer coverage." },
  // CPT — E&M
  { type:"CPT", code:"99202", desc:"Office visit, new patient, 15–29 min", units:"1", notes:"" },
  { type:"CPT", code:"99203", desc:"Office visit, new patient, 30–44 min", units:"1", notes:"" },
  { type:"CPT", code:"99204", desc:"Office visit, new patient, 45–59 min", units:"1", notes:"" },
  { type:"CPT", code:"99205", desc:"Office visit, new patient, 60–74 min", units:"1", notes:"" },
  { type:"CPT", code:"99212", desc:"Office visit, established patient, 10–19 min", units:"1", notes:"" },
  { type:"CPT", code:"99213", desc:"Office visit, established patient, 20–29 min", units:"1", notes:"" },
  { type:"CPT", code:"99214", desc:"Office visit, established patient, 30–39 min", units:"1", notes:"" },
  { type:"CPT", code:"99215", desc:"Office visit, established patient, 40–54 min", units:"1", notes:"" },
];

const LEARN_MODS = [
  { mod:"GT", desc:"Via interactive audio and video telecommunications", payer:"Plan Vital / ASES / Medicaid", rule:"Required for all ASES/Plan Vital telehealth services. Replaces POS 02 in many ASES contracts." },
  { mod:"95", desc:"Synchronous telemedicine via real-time audio and video", payer:"Commercial / Medicare", rule:"Use instead of GT for commercial payers and Medicare Advantage. Check individual payer policy." },
  { mod:"25", desc:"Significant, separately identifiable E&M service, same day as procedure", payer:"All", rule:"Required when billing E&M + add-on psychotherapy (90833) on the same date." },
  { mod:"59", desc:"Distinct procedural service", payer:"All", rule:"Indicates service is distinct from other procedures on the same date. Use to override CCI edits when clinically appropriate." },
  { mod:"HO", desc:"Master's degree level", payer:"Plan Vital / Medicaid", rule:"Identifies provider credential for ASES/Medicaid BH services. Required by many PR payers." },
  { mod:"HN", desc:"Bachelor's degree level", payer:"Plan Vital / Medicaid", rule:"Identifies provider credential. Reimbursement rate may differ from HO." },
  { mod:"HP", desc:"Doctoral level", payer:"Plan Vital / Medicaid", rule:"PhD, PsyD, or MD/DO. Highest BH credential tier." },
  { mod:"HQ", desc:"Group setting", payer:"Medicaid", rule:"Indicates service was provided in a group. Use with group therapy codes." },
  { mod:"U1", desc:"Medicaid level of care 1", payer:"Medicaid", rule:"Level-of-care indicator; required by some state Medicaid programs." },
  { mod:"TF", desc:"Intermediate level of care", payer:"Medicaid", rule:"Used for intermediate-level BH services (step-down from inpatient)." },
  { mod:"52", desc:"Reduced services", payer:"All", rule:"Service was partially reduced at the clinician's discretion. Bill a proportional charge." },
  { mod:"76", desc:"Repeat procedure by same physician on same day", payer:"All", rule:"Use when the same procedure is medically necessary more than once on the same date." },
  { mod:"GY", desc:"Item or service statutorily excluded from Medicare", payer:"Medicare", rule:"Use when billing non-covered services to generate a proper denial for secondary billing." },
  { mod:"KX", desc:"Requirements specified in the medical policy have been met", payer:"Medicare", rule:"Required for certain Medicare therapy services once the KX threshold is met." },
];

const LEARN_GUIDES = [
  { cat:"cms", title:"CMS ICD-10-CM Official Guidelines", desc:"Diagnosis coding guidelines updated annually by CMS and NCHS.", url:"https://www.cms.gov/medicare/coding-billing/icd-10-codes" },
  { cat:"cms", title:"CMS CPT / HCPCS Code Lookup", desc:"Search CPT and HCPCS codes with descriptions and fee schedule information.", url:"https://www.cms.gov/medicare/coding-billing/hcpcs-release-code-sets" },
  { cat:"cms", title:"NCCI (CCI) Policy Manual", desc:"Correct Coding Initiative edits — bundling rules applied to Medicare and Medicaid claims.", url:"https://www.cms.gov/medicare/coding-billing/national-correct-coding-initiative-edits" },
  { cat:"cms", title:"CMS Telehealth Services List", desc:"Official list of services eligible for telehealth billing under Medicare.", url:"https://www.cms.gov/medicare/coverage/telehealth" },
  { cat:"cms", title:"MLN Behavioral Health Integration", desc:"CMS guide for billing collaborative care and BH integration services.", url:"https://www.cms.gov/outreach-and-education/medicare-learning-network-mln/mlnproducts" },
  { cat:"cms", title:"AMA CPT Code Book (Annual)", desc:"Official CPT codes published by the American Medical Association. Required for clinical accuracy.", url:"https://www.ama-assn.org/practice-management/cpt" },
  { cat:"pr", title:"ASES — Puerto Rico Health Insurance Administration", desc:"Gobierno de PR. Portal de proveedores, manuales de Plan Vital, autorizaciones.", url:"https://www.ases.pr.gov" },
  { cat:"pr", title:"Plan Vital Provider Manual", desc:"Reglas de facturación, códigos cubiertos, topes de unidades y requisitos de autorización para el plan del gobierno de PR.", url:"https://www.ases.pr.gov" },
  { cat:"pr", title:"Triple-S Salud — Providers", desc:"Portal de proveedores de Triple-S (BCBS de PR). Políticas, formularios y verificación de elegibilidad.", url:"https://www.ssspr.com/en/providers" },
  { cat:"pr", title:"MMM Healthcare — Provider Resources", desc:"Manual del proveedor y recursos de facturación para MMM Medicaid y Medicare Advantage.", url:"https://www.mmmhealthcare.com" },
  { cat:"pr", title:"MCS Healthcare — Provider Portal", desc:"Guías de facturación, autorizaciones y formularios para MCS Classicare y MCS Salud.", url:"https://www.mcssalud.com/providers" },
  { cat:"pr", title:"Inmediata Health Group (Clearinghouse)", desc:"Cámara de compensación primaria de PR. EDI 837/835, verificación de elegibilidad, estado de reclamos.", url:"https://www.inmediatahealth.com" },
];

const fmt = (n) => "$" + n.toLocaleString("en-US");
const SEV = { error: { c: C.red, bg: C.redSoft, icon: AlertTriangle }, warning: { c: C.amber, bg: C.amberSoft, icon: FileWarning }, info: { c: C.blue, bg: C.blueSoft, icon: Lightbulb } };
const VB = { statutory: { c: C.teal, bg: C.tealSoft, icon: Scale }, published: { c: C.blue, bg: C.blueSoft, icon: BookOpen }, needs: { c: C.amber, bg: C.amberSoft, icon: CircleAlert } };
const rc = (r) => (r >= 60 ? C.red : r >= 30 ? C.amber : C.teal);
const rbg = (r) => (r >= 60 ? C.redSoft : r >= 30 ? C.amberSoft : C.tealSoft);
const SCAN = ["Reading document", "Detecting language", "Parsing codes"];

export default function App({ auth0 = null }) {
  const [lang, setLang] = useState(() => localStorage.getItem("rmd_lang") || "en");
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem("rmd_role") || "manager");
  const [tab, setTab] = useState("dash");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openClaim, setOpenClaim] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState({});
  const [reviewed, setReviewed] = useState(() => { try { return JSON.parse(localStorage.getItem("rmd_reviewed") || "[]"); } catch { return []; } });
  const [appeal, setAppeal] = useState(null);
  const [compTab, setCompTab] = useState("billing");
  const [files, setFiles] = useState([]);
  const [selFile, setSelFile] = useState(null);
  const [openPayer, setOpenPayer] = useState("PLANVITAL");
  const [intakeTab, setIntakeTab] = useState("import");
  const [importing, setImporting] = useState(null);
  const [imported, setImported] = useState(null);
  const [importError, setImportError] = useState(null);
  const [batchLoaded, setBatchLoaded] = useState(false);
  const [batchReading, setBatchReading] = useState(false);
  const [batchMeta, setBatchMeta] = useState(null);    // { total, auto_clear, needs_attention, at_risk }
  const batchFileRef = useRef(null);
  const intakeFileRef = useRef(null);
  const [batchQueue, setBatchQueue] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [learnTab, setLearnTab] = useState("codes");
  const [learnSearch, setLearnSearch] = useState("");
  const t = T[lang];

  useEffect(() => { setMounted(true); }, []);

  // Persist user preferences across sessions
  useEffect(() => { localStorage.setItem("rmd_lang", lang); }, [lang]);
  useEffect(() => { localStorage.setItem("rmd_role", role); }, [role]);
  useEffect(() => { localStorage.setItem("rmd_reviewed", JSON.stringify(reviewed)); }, [reviewed]);

  // applyBatchResults at component level so it can be called from the restore effect
  const applyBatchResults = useCallback((data, preserveState = false) => {
    setBatchMeta({ total: data.total, auto_clear: data.auto_clear, needs_attention: data.needs_attention, at_risk: data.at_risk });
    setBatchQueue(data.claims.map((c) => ({
      ...c,
      sel: c.lane === "auto_clear" && (!preserveState || c.st === "pending"),
      st: preserveState ? (c.st || "pending") : "pending",
    })));
    setBatchLoaded(true);
    if (data.id && API_URL) localStorage.setItem("rmd_last_batch_id", data.id);
  }, []);

  // Restore the last batch when the user logs in
  useEffect(() => {
    if (!authed || !API_URL) return;
    const lastId = localStorage.getItem("rmd_last_batch_id");
    if (!lastId) return;
    fetch(`${API_URL}/api/batches/${lastId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) applyBatchResults(data, true); })
      .catch(() => {});
  }, [authed, applyBatchResults]);

  // Auto-authenticate when Auth0 confirms the user is logged in
  useEffect(() => {
    if (auth0 && auth0.isAuthenticated && !authed) setAuthed(true);
  }, [auth0?.isAuthenticated]);

  const filtered = useMemo(() => CLAIMS.filter((c) => (filter === "all" || c.status === filter) && (!search || c.id.toLowerCase().includes(search.toLowerCase()) || c.codes.toLowerCase().includes(search.toLowerCase()))), [filter, search]);
  const needsCount = [...PAYERS.flatMap((p) => p.facts), ...BILLING_RULES, ...PRIVACY_RULES, ...SECURITY_RULES].filter((x) => x.v === "needs").length;

  const FONTS = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
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
    `}</style>
  );

  // ---------- LOGIN ----------
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: FONT_SANS, background: C.ink }}>
        {FONTS}
        {/* left brand panel */}
        <div style={{ flex: 1, background: `linear-gradient(155deg, ${C.ink} 0%, ${C.ink2} 100%)`, padding: "56px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,140,107,.18), transparent 70%)", top: -120, right: -160 }} />
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,75,.10), transparent 70%)", bottom: -80, left: -100 }} />
          <div className="rise" style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
            <div style={{ width: 68, height: 68, borderRadius: 18, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 32px -8px rgba(14,140,107,.65)" }}><Stethoscope size={36} color="#fff" /></div>
            <div style={{ color: "#fff", fontSize: 30, fontWeight: 400, fontFamily: FONT_DISPLAY, letterSpacing: ".5px" }}>Revenue<span style={{ color: C.teal }}>MD</span></div>
          </div>
          {/* stethoscope silhouette — login panel */}
          <div style={{ position: "absolute", bottom: -60, right: -60, opacity: .06, pointerEvents: "none", lineHeight: 0 }}><Stethoscope size={420} color="#fff" strokeWidth={1} /></div>
          <div className="rise" style={{ position: "relative", animationDelay: ".08s" }}>
            <div style={{ color: C.gold, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 18, fontWeight: 600 }}>Revenue Intelligence Software</div>
            <h1 style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 40, lineHeight: 1.15, fontWeight: 400, margin: 0, maxWidth: 440 }}>{t.tagline}</h1>
          </div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 40, padding: "10px 20px" }}>
              <ShieldCheck size={15} color={C.teal} />
              <span style={{ color: "rgba(255,255,255,.8)", fontSize: 13, fontWeight: 500, letterSpacing: ".2px" }}>{t.footer}</span>
            </div>
          </div>
        </div>
        {/* right form */}
        <div style={{ width: 460, background: C.paper2, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 52px" }}>
          <div className="rise" style={{ animationDelay: ".12s" }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 27, fontWeight: 500, margin: "0 0 6px", color: C.ink }}>{lang === "en" ? "Welcome back" : "Bienvenido"}</h2>
            <p style={{ color: C.txt2, fontSize: 14, margin: "0 0 30px" }}>{auth0 ? (lang === "en" ? "Sign in with your organization account" : "Inicia sesión con tu cuenta organizacional") : t.demoNote}</p>
            {!auth0 && <>
              <Lbl>{t.email}</Lbl><input defaultValue="demo@clinicapr.com" style={inp} />
              <Lbl mt>{t.password}</Lbl><input type="password" defaultValue="demo1234" style={inp} />
            </>}
            <Lbl mt>{t.role}</Lbl>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inp}>
              <option value="coder">{t.coder}</option><option value="biller">{t.biller}</option><option value="manager">{t.manager}</option>
            </select>
            <button className="btnp" onClick={() => auth0 ? auth0.loginWithRedirect() : setAuthed(true)} style={{ ...btnP, width: "100%", marginTop: 26, justifyContent: "center", padding: "13px", fontSize: 14.5 }}>{auth0 && auth0.isLoading ? <Loader2 size={17} className="spin" /> : <>{t.signIn} <ArrowRight size={17} /></>}</button>
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
    { id: "learn", icon: GraduationCap, label: t.nav_learn },
  ];

  const runAnalysis = (id) => { setAnalyzing(true); setTimeout(() => { setAnalyzing(false); setAnalyzed((p) => ({ ...p, [id]: true })); }, 1300); };
  const addSample = () => {
    const f = { id: Date.now() + "", name: "expediente_PV_4452.pdf", status: "scanning", stage: 0 };
    setFiles((p) => [f, ...p]);
    let st = 0;
    const tick = () => { st++; if (st < SCAN.length) { setFiles((p) => p.map((x) => x.id === f.id ? { ...x, stage: st } : x)); setTimeout(tick, 700); } else { setFiles((p) => p.map((x) => x.id === f.id ? { ...x, status: "done", ex: SAMPLE } : x)); setSelFile((s) => s ?? f.id); } };
    setTimeout(tick, 700);
  };
  const sel = files.find((f) => f.id === selFile && f.status === "done");
  const key = tab + (openClaim || "") + (sel ? "x" : "");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.paper, fontFamily: FONT_SANS, color: C.txt }}>
      {FONTS}
      {/* SIDEBAR */}
      <aside style={{ width: 236, background: C.ink, padding: "22px 14px", display: "flex", flexDirection: "column", flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 10px 22px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 18px -6px rgba(14,140,107,.7)" }}><Stethoscope size={19} color="#fff" /></div>
          <div><div style={{ color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: FONT_DISPLAY }}>Revenue<span style={{ color: C.teal }}>MD</span></div></div>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {nav.map((n, i) => {
            const a = tab === n.id;
            return <button key={n.id} className="navi rise" onClick={() => { setTab(n.id); setOpenClaim(null); }} style={{ animationDelay: `${i * 0.03}s`, display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13.5, textAlign: "left", width: "100%", background: a ? C.teal : "transparent", color: a ? "#fff" : "rgba(255,255,255,.62)", fontWeight: a ? 500 : 400, boxShadow: a ? "0 6px 16px -8px rgba(14,140,107,.8)" : "none" }}><n.icon size={17} /> {n.label}</button>;
          })}
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 12, marginTop: 12 }}>
          <button className="navi" onClick={() => setLang(lang === "en" ? "es" : "en")} style={sideBtn}><Languages size={15} /> {lang === "en" ? "Español" : "English"}</button>
          <button className="navi" onClick={() => { setAuthed(false); setTab("dash"); if (auth0?.logout) auth0.logout({ logoutParams: { returnTo: window.location.origin } }); }} style={sideBtn}><LogOut size={15} /> {t.logout}</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", overflow: "hidden" }}>
        {/* stethoscope silhouette — all app pages */}
        <div style={{ position: "absolute", bottom: -80, right: -80, opacity: .035, pointerEvents: "none", lineHeight: 0, zIndex: 0 }}><Stethoscope size={480} color={C.ink} strokeWidth={.9} /></div>
        <header style={{ background: C.paper2, borderBottom: `1px solid ${C.line}`, padding: "15px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 500, fontFamily: FONT_DISPLAY }}>{nav.find((n) => n.id === tab)?.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="pill" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.teal, background: C.tealSoft, padding: "5px 11px", borderRadius: 20, fontWeight: 500 }}><span className="pdot" style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal }} /> Live</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.txt2 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 11.5 }}>{role === "manager" ? "MG" : role === "biller" ? "BL" : "CD"}</div>
              {t[role]}
            </div>
          </div>
        </header>

        <div key={key} style={{ padding: 30, flex: 1, overflow: "auto", position: "relative", zIndex: 1 }}>
          {/* DASHBOARD */}
          {tab === "dash" && (
            <div>
              <div className="rise" style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 26, fontWeight: 500, margin: "0 0 4px", fontFamily: FONT_DISPLAY, color: C.ink }}>{t.greeting}, {t[role]}.</h2>
                <p style={{ color: C.txt2, fontSize: 15, margin: 0 }}>{t.today}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(195px,1fr))", gap: 14, marginBottom: 20 }}>
                <Metric i={0} label={t.m_revenue} value={fmt(18200)} sub={t.thisMonth} trend="+14%" up />
                <Metric i={1} label={t.m_denial} value="12.4%" sub={t.thisMonth} trend="-3.1%" up />
                <Metric i={2} label={t.m_approval} value="87.6%" sub={t.target} />
                <Metric i={3} label={t.m_under} value={fmt(4750)} sub={t.opportunity} accent={C.amber} />
              </div>
              <div className="rise" style={{ animationDelay: ".15s", background: `linear-gradient(120deg, ${C.ink} 0%, ${C.ink2} 100%)`, borderRadius: 18, padding: "20px 24px", display: "flex", gap: 16, alignItems: "center", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle,rgba(201,162,75,.14),transparent 70%)", right: -60, top: -90 }} />
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(201,162,75,.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Zap size={21} color={C.gold} /></div>
                <div style={{ flex: 1, position: "relative" }}><div style={{ fontWeight: 500, fontSize: 15, color: "#fff" }}>{t.priorityTitle}</div><div style={{ fontSize: 13.5, color: "rgba(255,255,255,.66)", marginTop: 3 }}>{t.priorityBody}</div></div>
                <button className="btnp" onClick={() => { setTab("claims"); setFilter("high"); }} style={{ ...btnP, flexShrink: 0, background: C.gold, color: C.ink }}>{t.reviewNow} <ArrowRight size={15} /></button>
              </div>
              <div className="rise" style={{ animationDelay: ".22s", background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, padding: 22 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><div style={{ fontSize: 15, fontWeight: 500, fontFamily: FONT_DISPLAY, display: "flex", alignItems: "center", gap: 8 }}><Activity size={17} color={C.teal} /> {t.recent}</div><button onClick={() => setTab("claims")} style={btnG}>{t.viewAll} <ChevronRight size={14} /></button></div>
                {CLAIMS.slice(0, 4).map((c, i) => (
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
                  {/* hidden file input for Intake — triggers real API if VITE_API_URL is set */}
                  <input ref={intakeFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.tif,.tiff,.txt,.csv,.edi,.837" style={{ display: "none" }} onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return;
                    const src = importing || "File";
                    setImportError(null);
                    if (API_URL) {
                      try {
                        const form = new FormData(); form.append("file", file);
                        const res = await fetch(`${API_URL}/api/batch`, { method: "POST", body: form });
                        if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
                        const data = await res.json();
                        setImporting(null); setImported(src);
                        applyBatchResults(data);
                      } catch (err) { setImporting(null); setImportError(err.message); }
                    } else {
                      setTimeout(() => { setImporting(null); setImported(src); }, 1300);
                    }
                  }} />
                  <p className="rise" style={{ color: C.txt2, fontSize: 13.5, margin: "0 0 16px", maxWidth: 600, lineHeight: 1.5 }}>{t.importSub}</p>
                  <div className="rise" style={{ fontSize: 12.5, fontWeight: 500, color: C.teal, display: "flex", alignItems: "center", gap: 7, marginBottom: 11, fontFamily: FONT_DISPLAY }}><CheckCircle2 size={15} /> {t.available} — {t.fileImport}</div>
                  {importError && <div className="rise" style={{ background: C.redSoft, border: `1px solid #f0c5c0`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.red, display: "flex", gap: 8 }}><AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />{importError}</div>}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 11, marginBottom: 18 }}>
                    {IMPORT_SOURCES.map((s, i) => (
                      <div key={s.id} className="rise lift" style={{ animationDelay: `${i * 0.05}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 13, padding: 15 }} onClick={() => { setImporting(s.name); setImported(null); setImportError(null); if (API_URL) { intakeFileRef.current?.click(); } else { setTimeout(() => { setImporting(null); setImported(s.name); }, 1300); } }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><s.icon size={17} color={C.teal} /></div>
                          <span style={{ fontSize: 9.5, fontWeight: 500, padding: "2px 7px", borderRadius: 10, background: C.tealSoft, color: C.tealDk }}>837 · CSV</span>
                        </div>
                        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.name}</div>
                        <div style={{ fontSize: 11.5, color: C.txt2, marginTop: 2 }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>

                  {importing && (
                    <div className="rise" style={{ marginBottom: 18, fontSize: 13, color: C.amber, display: "flex", alignItems: "center", gap: 7 }}><Loader2 size={14} className="spin" /> {lang === "en" ? `Reading EDI 837 from ${importing}…` : `Leyendo EDI 837 desde ${importing}…`}</div>
                  )}
                  {imported && (
                    <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden", marginBottom: 18 }}>
                      <div style={{ background: `linear-gradient(120deg,${C.tealDk},${C.teal})`, padding: "13px 18px", display: "flex", alignItems: "center", gap: 9 }}><CheckCircle2 size={16} color="#fff" /><span style={{ fontWeight: 500, fontSize: 13.5, color: "#fff", fontFamily: FONT_DISPLAY }}>{t.importedOk}</span><span style={{ marginLeft: "auto", fontSize: 11.5, color: "rgba(255,255,255,.85)" }}>{t.importedFrom} {imported}</span></div>
                      <div style={{ padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                          <div><div style={{ fontSize: 15, fontWeight: 500 }}>Claim #PV20240847</div><div style={{ fontSize: 12, color: C.txt2, marginTop: 2 }}>Plan Vital · NPI 1982736450 · Apr 22, 2024</div></div>
                          <span style={{ fontSize: 14, fontWeight: 500, fontFamily: FONT_DISPLAY }}>$245</span>
                        </div>
                        {[["90837", "1 unit · F32.1, F41.1", "$200"], ["90785", "1 unit · F32.1", "$45"]].map(([code, d, amt], i) => (
                          <div key={i} style={{ borderTop: `1px solid ${C.lineSoft}`, padding: "9px 0", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12.5 }}><span style={{ fontWeight: 500 }}>{code}</span> <span style={{ color: C.txt2 }}>· {d}</span></span><span style={{ fontSize: 12.5, fontWeight: 500 }}>{amt}</span></div>
                        ))}
                        <div style={{ borderTop: `1px solid ${C.lineSoft}`, padding: "9px 0", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12.5, color: C.txt2 }}>{t.auth}</span><span style={{ fontSize: 12.5, fontWeight: 500, color: C.teal }}>AUTH998877 ✓</span></div>
                        <button className="btnp" onClick={() => { setTab("claims"); setOpenClaim("PV-2024-0847"); }} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 13, marginTop: 14 }}>{t.viewImported} <ArrowRight size={16} /></button>
                      </div>
                    </div>
                  )}

                  <div className="rise" style={{ fontSize: 12.5, fontWeight: 500, color: C.txt3, display: "flex", alignItems: "center", gap: 7, marginBottom: 11, fontFamily: FONT_DISPLAY }}><Plug size={15} /> {t.roadmap} — {t.apiConnect}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 11, marginBottom: 18 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: sel ? "1fr 1fr" : "1fr", gap: 18, alignItems: "start" }}>
                <div className="rise">
                  <div onClick={addSample} style={{ border: `2px dashed ${C.tealMute}`, background: C.paper2, borderRadius: 18, padding: "44px 24px", textAlign: "center", cursor: "pointer", transition: "all .2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealSoft; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.tealMute; e.currentTarget.style.background = C.paper2; }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><FileScan size={30} color={C.teal} /></div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>{t.drop}</div>
                    <div style={{ fontSize: 13, color: C.txt2, marginTop: 5 }}>{t.dropSub}</div>
                    <button className="btnp" style={{ ...btnP, marginTop: 18 }}><Upload size={15} /> {t.loadSample}</button>
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
                {sel && (
                  <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden" }}>
                    <div style={{ background: `linear-gradient(120deg,${C.tealDk},${C.teal})`, padding: "15px 20px", display: "flex", alignItems: "center", gap: 10 }}><Sparkles size={18} color="#fff" /><div style={{ fontSize: 14, fontWeight: 500, color: "#fff", fontFamily: FONT_DISPLAY }}>{t.extracted}</div><span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,.8)" }}>{sel.ex.confidence}% {t.confidence}</span></div>
                    <div style={{ padding: 20 }}>
                      <Chips label={t.cpt} arr={sel.ex.cpt} c={C.blue} bg={C.blueSoft} />
                      <Chips label={t.icd} arr={sel.ex.icd} c={C.purple} bg={C.purpleSoft} />
                      <Chips label={t.mods} arr={sel.ex.mods} c={C.amber} bg={C.amberSoft} />
                      <KV label={t.units} value={sel.ex.units} /><KV label={t.dos} value={sel.ex.dos} /><KV label={t.npi} value={sel.ex.npi} /><KV label={t.auth} value={sel.ex.auth} missing t={t} />
                      <div style={{ background: C.amberSoft, borderRadius: 11, padding: "11px 13px", marginTop: 14, display: "flex", gap: 9 }}><CircleAlert size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} /><div style={{ fontSize: 12.5, color: "#7a4e10", lineHeight: 1.5 }}>{t.reviewNote}</div></div>
                      <button className="btnp" onClick={() => { setTab("claims"); setOpenClaim("PV-2024-0847"); }} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 13, marginTop: 14 }}>{t.createClaim} <ArrowRight size={16} /></button>
                    </div>
                  </div>
                )}
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
            const c = CLAIMS.find((x) => x.id === openClaim); const A = analyzed[c.id];
            return (
              <div>
                <button onClick={() => setOpenClaim(null)} style={{ ...btnG, marginBottom: 16 }}><ChevronRight size={15} style={{ transform: "rotate(180deg)" }} /> {t.back}</button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 18, alignItems: "start" }}>
                  <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                      <div><h2 style={{ fontSize: 21, fontWeight: 500, margin: 0, fontFamily: FONT_DISPLAY }}>#{c.id}</h2><div style={{ fontSize: 13, color: C.txt2, marginTop: 3 }}>{c.patient} · {c.provider}</div></div>
                      <RiskPill r={c.risk} big label />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20, padding: "14px 0", borderTop: `1px solid ${C.lineSoft}`, borderBottom: `1px solid ${C.lineSoft}` }}>
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
                        <button className="btnp" onClick={() => {
                          setReviewed((p) => [...new Set([...p, c.id])]);
                          setOpenClaim(null);
                          if (API_URL) fetch(`${API_URL}/api/claims/${c.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviewed: true, st: "approved" }) }).catch(() => {});
                        }} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 13, marginTop: 18 }}><CheckCircle2 size={16} /> {t.markReviewed}</button>
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
              {[...CLAIMS].sort((a, b) => b.risk - a.risk).map((c, i) => (
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 14, marginBottom: 22 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 14, marginBottom: 22 }}>
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
                {[["billing", t.tab_billing, Scale], ["privacy", t.tab_privacy, Lock], ["security", t.tab_security, ShieldCheck]].map(([k, l, Ic]) => <button key={k} className="chip" onClick={() => setCompTab(k)} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, padding: "9px 16px", borderRadius: 20, cursor: "pointer", border: `1px solid ${compTab === k ? C.ink : C.line}`, background: compTab === k ? C.ink : C.paper2, color: compTab === k ? "#fff" : C.txt2 }}><Ic size={15} /> {l}</button>)}
              </div>
              {(compTab === "billing" ? BILLING_RULES : compTab === "privacy" ? PRIVACY_RULES : SECURITY_RULES).map((r, i) => { const b = VB[r.v]; const s = SEV[r.sev]; return (
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
                  <div style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 500, lineHeight: 1.3, maxWidth: 560 }}>"{t.bizConcept}"</div>
                </div>
              </div>

              {/* revenue model */}
              <SectionLabel icon={Target} text={t.bizModelT} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12, marginBottom: 10 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 12, marginBottom: 22 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
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
            const bulkApprove = () => {
              const toApprove = batchQueue.filter((q) => q.sel && q.st === "pending").map((q) => q.id);
              setBatchQueue((p) => p.map((q) => q.sel && q.st === "pending" ? { ...q, st: "approved", sel: false } : q));
              if (API_URL && toApprove.length > 0) toApprove.forEach((id) => fetch(`${API_URL}/api/claims/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ st: "approved" }) }).catch(() => {}));
            };
            // ── Batch helpers ──────────────────────────────────────────────
            // applyBatchResults is defined at component level (also handles localStorage + session restore)
            const loadMockBatch = () => { setBatchReading(true); setTimeout(() => { setBatchReading(false); applyBatchResults({ id: "", total: 42, auto_clear: 31, needs_attention: 11, at_risk: 3400, claims: BATCH_SEED.map((x) => ({ ...x })) }); }, 1400); };
            const uploadBatchFile = async (file) => {
              if (!file) return;
              setBatchReading(true);
              if (API_URL) {
                try {
                  const form = new FormData(); form.append("file", file);
                  const res = await fetch(`${API_URL}/api/batch`, { method: "POST", body: form });
                  if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
                  applyBatchResults(await res.json());
                } catch (err) {
                  console.error("Batch API error:", err);
                  applyBatchResults({ total: 42, auto_clear: 31, needs_attention: 11, at_risk: 3400, claims: BATCH_SEED.map((x) => ({ ...x })) });
                } finally { setBatchReading(false); }
              } else { loadMockBatch(); }
            };
            const loadBatch = () => { if (API_URL) { batchFileRef.current?.click(); } else { loadMockBatch(); } };
            return (
              <div>
                <Head title={t.batchTitle} sub={t.batchSub} />
                {/* hidden file input — triggers when API_URL is set */}
                <input ref={batchFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.tif,.tiff,.txt,.csv,.edi,.837" style={{ display: "none" }} onChange={(e) => uploadBatchFile(e.target.files?.[0])} />
                {!batchLoaded ? (
                  <div className="rise">
                    {!batchReading ? (
                      <div onClick={loadBatch} style={{ border: `2px dashed ${C.tealMute}`, background: C.paper2, borderRadius: 18, padding: "44px 24px", textAlign: "center", cursor: "pointer", transition: "all .2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealSoft; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.tealMute; e.currentTarget.style.background = C.paper2; }}>
                        <div style={{ width: 60, height: 60, borderRadius: 16, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><Layers size={30} color={C.teal} /></div>
                        <div style={{ fontSize: 16, fontWeight: 500 }}>{API_URL ? (lang === "en" ? "Upload an EDI 837 batch file" : "Subir un archivo EDI 837 de lote") : t.batchDrop}</div>
                        <div style={{ fontSize: 13, color: C.txt2, marginTop: 5 }}>{t.batchDropSub}</div>
                        <button className="btnp" style={{ ...btnP, marginTop: 18 }}><Upload size={15} /> {API_URL ? (lang === "en" ? "Select 837 file" : "Seleccionar archivo 837") : t.batchLoad}</button>
                        {!API_URL && <div style={{ marginTop: 10, fontSize: 11.5, color: C.txt3 }}>{lang === "en" ? "No VITE_API_URL set — loading sample data" : "Sin VITE_API_URL — cargando datos de muestra"}</div>}
                      </div>
                    ) : (
                      <div style={{ border: `2px dashed ${C.amber}`, background: C.paper2, borderRadius: 18, padding: "44px 24px", textAlign: "center", color: C.amber, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 9 }}><Loader2 size={18} className="spin" /> {t.batchReading}</div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(125px,1fr))", gap: 11, marginBottom: 16 }}>
                      <Metric i={0} label={t.bImported} value={String(batchMeta?.total ?? 42)} /><Metric i={1} label={t.bAutoClear} value={String(batchMeta?.auto_clear ?? 31)} accent={C.teal} /><Metric i={2} label={t.bNeedAtt} value={String(batchMeta?.needs_attention ?? 11)} accent={C.red} /><Metric i={3} label={t.bAtRisk} value={`$${((batchMeta?.at_risk ?? 3400)/1000).toFixed(1)}K`} accent={C.amber} />
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

          {/* LEARNING CENTER */}
          {tab === "learn" && (() => {
            const q = learnSearch.toLowerCase();
            const filteredCodes = LEARN_CODES.filter(c =>
              !q || c.code.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
            );
            const filteredMods = LEARN_MODS.filter(m =>
              !q || m.mod.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q) || m.rule.toLowerCase().includes(q) || m.payer.toLowerCase().includes(q)
            );
            const typeColor = { "ICD-10": [C.purple, C.purpleSoft], "CPT": [C.blue, C.blueSoft], "HCPCS": [C.teal, C.tealSoft] };
            return (
              <div>
                <Head title={t.learnTitle} sub={t.learnSub} />

                {/* Search bar */}
                <div className="rise" style={{ position: "relative", marginBottom: 20 }}>
                  <Search size={16} color={C.txt3} style={{ position: "absolute", left: 14, top: 13 }} />
                  <input
                    value={learnSearch}
                    onChange={e => { setLearnSearch(e.target.value); setLearnTab(e.target.value ? (filteredMods.length > filteredCodes.length ? "mods" : "codes") : learnTab); }}
                    placeholder={t.learnSearch}
                    style={{ width: "100%", paddingLeft: 42, paddingRight: 16, paddingTop: 11, paddingBottom: 11, fontSize: 14, border: `1.5px solid ${C.line}`, borderRadius: 12, background: C.paper2, outline: "none", color: C.txt, fontFamily: FONT_SANS }}
                  />
                </div>

                {/* Tabs */}
                <div className="rise" style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                  {[["codes", t.learnTabCodes, Hash], ["mods", t.learnTabMods, BookMarked], ["guides", t.learnTabGuides, BookOpen]].map(([k, l, Ic]) => (
                    <button key={k} onClick={() => setLearnTab(k)} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, padding: "8px 16px", borderRadius: 20, cursor: "pointer", border: `1px solid ${learnTab === k ? C.ink : C.line}`, background: learnTab === k ? C.ink : C.paper2, color: learnTab === k ? "#fff" : C.txt2, fontFamily: FONT_SANS }}>
                      <Ic size={14} /> {l}
                    </button>
                  ))}
                </div>

                {/* CODE LOOKUP TAB */}
                {learnTab === "codes" && (
                  <div className="rise">
                    {filteredCodes.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: C.txt3, fontSize: 14 }}>{t.learnNoResults}</div>
                    ) : (
                      <div style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" }}>
                        {/* Table header */}
                        <div style={{ display: "grid", gridTemplateColumns: "100px 110px 1fr 100px", gap: 0, background: C.lineSoft, padding: "10px 18px", borderBottom: `1px solid ${C.line}` }}>
                          {[t.learnCode, "Type", t.learnDesc, t.learnUnits].map(h => (
                            <div key={h} style={{ fontSize: 11.5, fontWeight: 600, color: C.txt2, textTransform: "uppercase", letterSpacing: ".06em" }}>{h}</div>
                          ))}
                        </div>
                        {filteredCodes.map((c, i) => {
                          const [tc, tbg] = typeColor[c.type] || [C.txt2, C.lineSoft];
                          return (
                            <div key={c.code} style={{ display: "grid", gridTemplateColumns: "100px 110px 1fr 100px", gap: 0, padding: "13px 18px", borderBottom: i < filteredCodes.length - 1 ? `1px solid ${C.lineSoft}` : "none", alignItems: "start" }}>
                              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13.5, color: C.ink }}>{c.code}</div>
                              <div>
                                <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: tbg, color: tc }}>{c.type}</span>
                              </div>
                              <div>
                                <div style={{ fontSize: 13.5, color: C.txt, lineHeight: 1.45 }}>{c.desc}</div>
                                {c.notes && <div style={{ fontSize: 11.5, color: C.txt2, marginTop: 4, lineHeight: 1.4, display: "flex", alignItems: "flex-start", gap: 5 }}><Info size={11} color={C.amber} style={{ flexShrink: 0, marginTop: 2 }} />{c.notes}</div>}
                              </div>
                              <div style={{ fontSize: 12.5, color: C.txt2 }}>{c.units}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* MODIFIERS TAB */}
                {learnTab === "mods" && (
                  <div className="rise">
                    {filteredMods.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: C.txt3, fontSize: 14 }}>{t.learnNoResults}</div>
                    ) : (
                      <div style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 160px", gap: 0, background: C.lineSoft, padding: "10px 18px", borderBottom: `1px solid ${C.line}` }}>
                          {[t.learnMod, t.learnModDesc + " & " + t.learnModRule, t.learnModPayer].map(h => (
                            <div key={h} style={{ fontSize: 11.5, fontWeight: 600, color: C.txt2, textTransform: "uppercase", letterSpacing: ".06em" }}>{h}</div>
                          ))}
                        </div>
                        {filteredMods.map((m, i) => (
                          <div key={m.mod} style={{ display: "grid", gridTemplateColumns: "70px 1fr 160px", gap: 0, padding: "13px 18px", borderBottom: i < filteredMods.length - 1 ? `1px solid ${C.lineSoft}` : "none", alignItems: "start" }}>
                            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 16, color: C.tealDk }}>{m.mod}</div>
                            <div>
                              <div style={{ fontSize: 13.5, color: C.txt, lineHeight: 1.4 }}>{m.desc}</div>
                              {m.rule && <div style={{ fontSize: 12, color: C.txt2, marginTop: 5, lineHeight: 1.45, display: "flex", alignItems: "flex-start", gap: 5 }}><Info size={11} color={C.blue} style={{ flexShrink: 0, marginTop: 2 }} />{m.rule}</div>}
                            </div>
                            <div style={{ fontSize: 12, color: C.txt2, lineHeight: 1.4 }}>{m.payer}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* GUIDELINES TAB */}
                {learnTab === "guides" && (
                  <div className="rise">
                    {/* Verify banner */}
                    <div style={{ background: C.amberSoft, border: `1px solid #f0dcb0`, borderRadius: 12, padding: "11px 15px", display: "flex", gap: 9, alignItems: "center", marginBottom: 20 }}>
                      <CircleAlert size={15} color={C.amber} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: "#7a4e10", lineHeight: 1.5 }}>{t.learnVerify}</span>
                    </div>

                    {/* CMS resources */}
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.txt2, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <BookOpen size={14} color={C.blue} /> {t.learnCmsTitle}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 11, marginBottom: 24 }}>
                      {LEARN_GUIDES.filter(g => g.cat === "cms").map((g, i) => (
                        <div key={i} className="lift" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, lineHeight: 1.35 }}>{g.title}</div>
                            <a href={g.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.tealDk, textDecoration: "none", padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.tealMute}`, background: C.tealSoft }}>
                              {t.learnOpen} <ExternalLink size={11} />
                            </a>
                          </div>
                          <div style={{ fontSize: 12.5, color: C.txt2, lineHeight: 1.5 }}>{g.desc}</div>
                        </div>
                      ))}
                    </div>

                    {/* PR resources */}
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: C.txt2, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                      <Globe size={14} color={C.teal} /> {t.learnPrTitle}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 11 }}>
                      {LEARN_GUIDES.filter(g => g.cat === "pr").map((g, i) => (
                        <div key={i} className="lift" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, lineHeight: 1.35 }}>{g.title}</div>
                            <a href={g.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.tealDk, textDecoration: "none", padding: "4px 10px", borderRadius: 8, border: `1px solid ${C.tealMute}`, background: C.tealSoft }}>
                              {t.learnOpen} <ExternalLink size={11} />
                            </a>
                          </div>
                          <div style={{ fontSize: 12.5, color: C.txt2, lineHeight: 1.5 }}>{g.desc}</div>
                        </div>
                      ))}
                    </div>
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
