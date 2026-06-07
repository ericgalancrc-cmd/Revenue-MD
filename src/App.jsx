import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard, ClipboardList, Brain, ReceiptText, BarChart3, Bell,
  Settings, LogOut, Search, Upload, ShieldCheck, Languages, AlertTriangle,
  FileWarning, Lightbulb, Clock, CheckCircle2, TrendingUp, TrendingDown,
  FileText, ChevronRight, Stethoscope, Send, Eye, Building2, Scale, Lock,
  FileScan, Loader2, Sparkles, ArrowRight, CircleAlert, BookOpen, FileSearch,
  Activity, ArrowUpRight, Zap, Briefcase, Target, Rocket, Award, Users, Globe,
  Download, Plug, FileInput, Network, Building, Layers, CheckSquare, Square, ListChecks,
  GraduationCap, BookMarked, ExternalLink, Hash, Info, CreditCard, Star, BadgeCheck,
  Palette, UserRound, Sliders, Sun, Moon,
  Smartphone, Mail, QrCode, KeyRound, ShieldAlert, RefreshCw, Copy,
  Menu, X, ChevronDown,
} from "lucide-react";

// ============================================================================
// RevenueMD — Refined UI ("Clinical Precision" aesthetic)
// Deep ink + teal palette · serif display + clean sans · layered depth ·
// staggered reveals · polished micro-interactions. Bilingual EN/ES.
// ============================================================================

// Custom logo mark — EKG pulse line representing healthcare + revenue monitoring.
// Drop-in replacement for the generic stethoscope icon in all brand placements.
function LogoMark({ size = 24, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points="2,20 10,20 14,28 18,6 22,28 26,20 38,20"
        stroke={color} strokeWidth="3.2" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

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

// ── Color themes ──────────────────────────────────────────────────────────────
const THEMES = {
  teal:    { key:"teal",    hex:"#16B6C9", dk:"#0E8FA0", soft:"#E0F6F9", mute:"#BCEAF0", name:"Ocean",   nameEs:"Océano"    },
  emerald: { key:"emerald", hex:"#10B981", dk:"#059669", soft:"#D1FAE5", mute:"#A7F3D0", name:"Emerald", nameEs:"Esmeralda" },
  blue:    { key:"blue",    hex:"#2563EB", dk:"#1D4ED8", soft:"#DBEAFE", mute:"#BFDBFE", name:"Blue",    nameEs:"Azul"      },
  indigo:  { key:"indigo",  hex:"#4F46E5", dk:"#4338CA", soft:"#EEF2FF", mute:"#E0E7FF", name:"Indigo",  nameEs:"Índigo"    },
  violet:  { key:"violet",  hex:"#7C3AED", dk:"#6D28D9", soft:"#EDE9FE", mute:"#DDD6FE", name:"Violet",  nameEs:"Violeta"   },
  rose:    { key:"rose",    hex:"#E11D48", dk:"#BE123C", soft:"#FFE4E6", mute:"#FECDD3", name:"Rose",    nameEs:"Rosa"      },
  coral:   { key:"coral",   hex:"#EA580C", dk:"#C2410C", soft:"#FFEDD5", mute:"#FED7AA", name:"Coral",   nameEs:"Coral"     },
  amber:   { key:"amber",   hex:"#D97706", dk:"#B45309", soft:"#FEF3C7", mute:"#FDE68A", name:"Amber",   nameEs:"Ámbar"     },
};

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

const T = {
  en: {
    tagline: "Identify denials before they happen. Code with confidence. Get paid faster.",
    email: "Work email", password: "Password", role: "Your role", signIn: "Enter platform",
    demoNote: "Demo — any credentials work", coder: "Coder / Biller", manager: "Manager",
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
    learnTypeAll: "All", learnCopy: "Copy", learnCopied: "Copied!",
    learnProTipT: "Pro tip — codes on this claim", learnProTipSub: "Quick reference for the codes and modifiers you're working with right now.",
    learnCmsTitle: "CMS & Federal references", learnPrTitle: "Puerto Rico — payer & ASES resources",
    learnOpen: "Open", learnVerify: "Verify before production use",
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
    open: "Open", denialRisk: "Denial risk", compliance: "Payer rules", docQuality: "Documentation",
    riskLow: "Ready to submit", riskMid: "Review before sending", riskHigh: "Do not submit",
    compGood: "No action needed", compMid: "Verify rules", compLow: "Fix before sending",
    docGood: "No action needed", docMid: "Add missing notes", docLow: "Complete chart first",
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
    compTitle: "Compliance center", compSub: "CMS, ASES, Medicare, PR Medicaid billing rules · HIPAA Privacy & Security Rule · PR Act 194 · cybersecurity & PHI safeguards — each with its regulatory source.",
    tab_billing: "Billing rules", tab_privacy: "HIPAA & Privacy", tab_security: "Cybersecurity & PHI",
    v_statutory: "Statutory", v_published: "Published", v_needs: "Verify first",
    verifyBanner: "rules need verification against current manuals before production use",
    disclaimerT: "Not legal advice", disclaimer: "Items marked 'verify first' are placeholders modeled on common patterns and must be confirmed against current ASES and payer manuals by a certified PR coder. Nothing here constitutes legal or compliance advice.",
    helpBtn: "How to use", helpTitle: "How to use RevenueMD", helpSub: "Your complete guide — from importing claims to sending clean ones to your clearinghouse.", helpClose: "Close",
    helpStep1T: "Import your claims", helpStep1D: "Go to Intake → Import claims. Click your billing system card (Assertus, Inmediata, Practice Fusion, or Any EDI 837 file). Upload the 837 file you exported from that system.",
    helpStep2T: "Review the Batch Queue", helpStep2D: "All your claims land in the Batch Queue, sorted by risk level. Start with the red 'Needs work' lane — those have errors most likely to get a claim denied.",
    helpStep3T: "Fix, approve & export", helpStep3D: "Open any flagged claim, read the AI's suggested fixes, approve the clean ones, and export the scrubbed file back to your clearinghouse.",
    helpLanesT: "The three triage lanes",
    helpLaneNW: "Needs work", helpLaneNWD: "Has one or more errors that will very likely cause a denial. You must review and fix these before submitting.",
    helpLaneQR: "Quick review", helpLaneQRD: "Has warnings or minor issues worth a quick human check. Most are fine to submit after a fast review.",
    helpLaneAC: "Auto-clear", helpLaneACD: "No issues found. This claim is clean and ready to go to the clearinghouse right now.",
    helpModsT: "What each section does",
    helpM1T: "Overview", helpM1D: "Your daily dashboard — revenue recovered, denial rate, approval rate, and today's priority claims at a glance.",
    helpM2T: "Intake", helpM2D: "Bring claims in from any billing system or scan a paper record. Files are normalized and routed for scrubbing automatically.",
    helpM3T: "Batch Queue", helpM3D: "Your main workspace. Import one file with hundreds of claims; we sort every single one by risk level so you work the right ones first.",
    helpM4T: "Claims", helpM4D: "Drill into any single claim to see every code, modifier, diagnosis, authorization number, and the exact payer-specific issues flagged.",
    helpM5T: "AI Analysis", helpM5D: "Run a deeper AI review on any claim. The AI checks documentation gaps and suggests exact wording fixes you can apply in seconds.",
    helpM6T: "Payer Intelligence", helpM6D: "Every Puerto Rico payer's billing rules in one place — timely filing deadlines, prior auth, modifier requirements, MSP, and more.",
    helpM7T: "Compliance Center", helpM7D: "CMS, ASES, Medicare, and HIPAA rules — each linked to its exact regulatory source so you can verify before submission.",
    helpM8T: "Denials", helpM8D: "Track denied claims, see patterns over time, and build AI-assisted appeal letters for claims worth fighting.",
    helpM9T: "Revenue", helpM9D: "See your recovered revenue trend, denial rate over time, and where money is being left on the table.",
    helpM10T: "Learning Center", helpM10D: "Look up any ICD-10, CPT, or HCPCS code, check modifier rules, and open CMS guidelines without leaving RevenueMD.",
    helpNumsT: "Understanding the claim cards",
    helpN1T: "Denial Risk", helpN1Range: "",
    helpN1D: "How likely this claim is to be denied. Shown as a colored label on every claim row and as an action card inside the claim detail. 'Ready to submit' (teal): low risk, go ahead and send it. 'Review before sending' (amber): there are warnings worth checking before you transmit. 'Do not submit' (red): one or more errors that will almost certainly cause a denial — fix them first.",
    helpN2T: "Payer Rules", helpN2Range: "",
    helpN2D: "Checks whether the claim follows the specific rules of the payer — ASES, Medicare, Plan Vital, Triple-S, MMM. Shown as an action card inside the claim detail. 'No action needed': the claim passes all payer rules. 'Verify rules': there is at least one warning worth reviewing against the payer's manual. 'Fix before sending': a rule violation was found that this payer is known to deny.",
    helpN3T: "Documentation", helpN3Range: "",
    helpN3D: "Checks how complete the clinical documentation looks. Shown as an action card inside the claim detail. 'No action needed': the chart appears complete. 'Add missing notes': there are gaps — a missing treatment plan, clinical note, or time documentation. 'Complete chart first': significant documentation issues found — the claim is vulnerable in an audit even if the codes are correct.",
    helpN4T: "$ at risk", helpN4Range: "$",
    helpN4D: "The total dollar value of all claims sitting in the 'Needs work' lane right now. This is money that will very likely be denied if submitted today. Fix those claims and move them to Auto-clear to protect your practice's revenue.",
    helpN5T: "Revenue recovered", helpN5Range: "$ / mo",
    helpN5D: "Money your practice actually collected that would have been denied without catching the issue first. Shown monthly on the dashboard. This is your direct financial return from RevenueMD — the difference between a clean claim and a denial letter.",
    helpN6T: "Denial rate %", helpN6Range: "%",
    helpN6D: "What percentage of submitted claims got denied. Lower is always better. The Puerto Rico industry average runs 15–20%. RevenueMD's goal is to push yours below 10% by catching denials before the claim ever leaves your office.",
    helpN7T: "Approval rate %", helpN7Range: "%",
    helpN7D: "The percentage of claims approved on the very first submission — no corrections, no resubmissions, no follow-up calls. Target is 90% or higher. Every claim that clears on the first try saves your team days of rework and speeds up cash flow.",
    helpN8T: "Undercoding caught", helpN8Range: "$ recoverable",
    helpN8D: "Money left on the table by billing a code that doesn't reflect the full complexity of the service provided. RevenueMD flags when your documentation supports a higher-level code. Correcting undercoding is completely legal and ethical — it just means billing for what you actually did, at the right level.",
    helpRulesT: "Three things to always keep in mind",
    helpR1: "RevenueMD scrubs claims — it does NOT submit them. You send the clean file to your clearinghouse (e.g. Inmediata) after approving.",
    helpR2: "AI is decision support only. Every claim must be reviewed and approved by a human before it goes out.",
    helpR3: "All patient data is HIPAA-encrypted. RevenueMD is built for compliance from the ground up.",
    notifTitle: "Notifications", notifMarkAll: "Mark all read", notifEmpty: "All caught up.",
    privacyLink: "Privacy Policy", termsLink: "Terms of Use",
    nav_sub: "Subscription",
    subTitle: "Choose your plan", subSub: "Transparent, all-inclusive pricing. No per-claim overage surprises. Cancel or upgrade anytime.",
    subBilling: "Monthly", subBillingAnn: "Annual  (save 25%)",
    subCurrentPlan: "Current plan", subPopular: "Most popular", subGetStarted: "Subscribe now", subContact: "Contact sales",
    subPerMo: "/ mo", subPerMoAnn: "/ mo, billed annually",
    subAnnSave: "You save", subPerYear: "/ year",
    subFeatClaims: "claims / month", subFeatProviders: "providers", subFeatUnlimited: "Unlimited",
    subFeatRules: "Full PR rules engine (ASES, Plan Vital, Triple-S, MCS, MMM, Humana)", subFeatAI: "AI claim analysis & suggested fixes",
    subFeatAudit: "Audit log & batch history", subFeatEncrypt: "HIPAA PHI encryption at rest", subFeatSupport: "Priority support",
    subFeatDedicated: "Dedicated account manager + SLA", subFeatAPI: "API access & custom rules",
    subFeatBasicRules: "Core PR rules engine (ASES, Plan Vital)", subFeatEmailSupport: "Email support (2-business-day SLA)",
    subFeatStandardRules: "Full PR rules engine — all 7 payers", subFeatChatSupport: "Chat + email support",
    subModalTitle: "You're one step away", subModalSub: "This will complete your subscription via our secure payment processor. You will receive a confirmation email with your invoice.",
    subModalConfirm: "Confirm & subscribe", subModalCancel: "Cancel",
    subModalNote: "By subscribing you agree to our Terms of Use and authorize the charge shown above. Cancel anytime from this page.",
    subTrialBadge: "Demo mode — no active subscription",
    subWhyTitle: "Why RevenueMD pays for itself",
    subWhy1T: "Average denial rate in PR: 18%", subWhy1D: "RevenueMD customers target under 10%, recovering thousands per month.",
    subWhy2T: "First-submission approval rate", subWhy2D: "Every clean-pass claim saves your team days of rework and speeds up cash flow.",
    subWhy3T: "Undercoding recovery", subWhy3D: "AI flags when documentation supports a higher code — completely legal, fully compliant.",
    subGuarantee: "30-day money-back guarantee on annual plans.",
    settingsTitle: "Settings", settingsSub: "Manage your profile, appearance, and preferences.",
    stProfile: "My Profile", stAppearance: "Appearance", stNotifs: "Notifications", stSecurity: "Security", stTeam: "Team",
    stFirstName: "First name", stLastName: "Last name", stEmail: "Email", stRole: "Role", stSaveProfile: "Save changes", stSaved: "Saved!",
    stAvatarColor: "Avatar color",
    stThemeTitle: "Accent color", stThemeSub: "Choose the accent color used across the platform. Works with every section.",
    stDensity: "Display density", stDensityComfy: "Comfortable", stDensityCompact: "Compact",
    stNotifSub: "Choose which alerts you want to see.",
    stNotifSubscription: "Subscription reminders", stNotifSubscriptionD: "Renewal date and billing alerts (managers only)",
    stNotifClaims: "Claim alerts", stNotifClaimsD: "Batches that need attention or have high-risk claims",
    stNotifPayers: "Payer updates", stNotifPayersD: "Rule changes and bulletin updates for Puerto Rico payers",
    stNotifEmail: "Email digest", stNotifEmailD: "Daily summary sent to your work email",
    stSecuritySub: "Manage your password and authentication methods. Enable multiple methods for stronger HIPAA-compliant security.",
    stChangePassword: "Password", stCurrentPwd: "Current password", stNewPwd: "New password", stConfirmPwd: "Confirm new password", stUpdatePwd: "Update password",
    stPwdMethodD: "Your primary login credential. Use at least 12 characters with mixed case, numbers, and symbols (NIST SP 800-63B).",
    stPwdAlwaysOn: "Always active",
    stTotpMethod: "Authenticator app", stTotpMethodD: "Use Google Authenticator, Authy, or any TOTP app. A new 6-digit code is generated every 30 seconds.",
    stTotpSetup: "Set up", stTotpDisable: "Disable", stTotpEnabled: "Enabled",
    stTotpScanTitle: "Scan with your authenticator app", stTotpManual: "Or enter this key manually",
    stTotpEnterCode: "Enter the 6-digit code shown in your app to verify", stTotpVerify: "Verify & enable", stTotpCodePh: "000 000",
    stTotpCopied: "Copied!",
    stEmailMethod: "Email verification", stEmailMethodD: "A one-time code is sent to your email address each sign-in. Works without a smartphone.",
    stEmailSetup: "Set up", stEmailDisable: "Disable", stEmailEnabled: "Enabled",
    stEmailSendCode: "Send code to", stEmailSent: "Code sent —", stEmailEnterCode: "Enter the 6-digit code from your email",
    stEmailVerify: "Verify & enable",
    stAuthMethods: "Authentication methods", stAuthMethodsSub: "Enable additional methods for multi-factor authentication (MFA).",
    stAuthHipaa: "MFA is strongly recommended under HIPAA §164.308(a)(5) for any remote access to systems containing ePHI.",
    stAuthEnabled: "Active", stAuthDisabled: "Not enabled",
    stTeamSub: "Manage who has access to your organization's RevenueMD account.",
    stAddMember: "Add member", stMemberName: "Name", stMemberRole: "Role", stMemberStatus: "Status", stMemberActive: "Active",
    stInviteEmail: "Invite by email", stSendInvite: "Send invite",
    stLanguage: "Language", stLanguageSub: "Choose the platform language.",
    mobileManagerOnly: "This view is for managers only",
    mobileManagerOnlySub: "The coding & billing tools require a desktop browser. Please sign in from your computer to access claims, batch queues, and analysis.",
    mobileCoderDesk: "Sign in on desktop",
  },
  es: {
    tagline: "Detecta denegaciones antes de que ocurran. Codifica con confianza. Cobra más rápido.",
    email: "Correo de trabajo", password: "Contraseña", role: "Tu rol", signIn: "Entrar a la plataforma",
    demoNote: "Demo — cualquier credencial funciona", coder: "Codificador / Facturador", manager: "Gerente",
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
    learnTypeAll: "Todos", learnCopy: "Copiar", learnCopied: "¡Copiado!",
    learnProTipT: "Pro tip — códigos en este reclamo", learnProTipSub: "Referencia rápida para los códigos y modificadores que estás trabajando ahora mismo.",
    learnCmsTitle: "CMS y referencias federales", learnPrTitle: "Puerto Rico — recursos de pagadores y ASES",
    learnOpen: "Abrir", learnVerify: "Verificar antes de uso en producción",
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
    open: "Abrir", denialRisk: "Riesgo de denegación", compliance: "Reglas del pagador", docQuality: "Documentación",
    riskLow: "Listo para enviar", riskMid: "Revisar antes de enviar", riskHigh: "No enviar",
    compGood: "Sin acción requerida", compMid: "Verificar reglas", compLow: "Corregir antes de enviar",
    docGood: "Sin acción requerida", docMid: "Agregar notas faltantes", docLow: "Completar expediente",
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
    compTitle: "Centro de cumplimiento", compSub: "Reglas CMS, ASES, Medicare, Medicaid PR · HIPAA Privacidad y Seguridad · Ley 194 PR · ciberseguridad y PHI — cada una con su fuente regulatoria.",
    tab_billing: "Reglas de facturación", tab_privacy: "HIPAA y privacidad", tab_security: "Ciberseguridad y PHI",
    v_statutory: "Estatutario", v_published: "Publicado", v_needs: "Verificar",
    verifyBanner: "reglas necesitan verificación contra manuales vigentes antes de producción",
    disclaimerT: "No es asesoría legal", disclaimer: "Los elementos 'verificar' son marcadores basados en patrones comunes y deben confirmarse contra los manuales vigentes de ASES y pagadores por un codificador certificado de PR. Nada aquí constituye asesoría legal o de cumplimiento.",
    helpBtn: "Cómo usar", helpTitle: "Cómo usar RevenueMD", helpSub: "Tu guía completa — desde importar reclamos hasta enviar los limpios a tu clearinghouse.", helpClose: "Cerrar",
    helpStep1T: "Importa tus reclamos", helpStep1D: "Ve a Recepción → Importar reclamos. Haz clic en tu sistema de facturación (Assertus, Inmediata, Practice Fusion o Cualquier EDI 837). Sube el archivo 837 que exportaste de ese sistema.",
    helpStep2T: "Revisa la Cola por lote", helpStep2D: "Todos tus reclamos llegan a la Cola por lote, ordenados por riesgo. Comienza con el carril rojo 'Requiere trabajo' — esos tienen errores que pueden causar una denegación.",
    helpStep3T: "Corrige, aprueba y exporta", helpStep3D: "Abre cualquier reclamo marcado, revisa las correcciones de la IA, aprueba los limpios y exporta el archivo revisado a tu clearinghouse.",
    helpLanesT: "Los tres carriles de clasificación",
    helpLaneNW: "Requiere trabajo", helpLaneNWD: "Tiene uno o más errores que muy probablemente causarán una denegación. Debes revisar y corregir antes de someter.",
    helpLaneQR: "Revisión rápida", helpLaneQRD: "Tiene advertencias o problemas menores. Una revisión rápida es suficiente — la mayoría están bien para someter.",
    helpLaneAC: "Auto-aprobable", helpLaneACD: "Sin problemas detectados. Este reclamo está limpio y listo para ir al clearinghouse ahora mismo.",
    helpModsT: "Qué hace cada sección",
    helpM1T: "Resumen", helpM1D: "Tu tablero diario — ingresos recuperados, tasa de denegación, aprobación y los reclamos prioritarios de hoy.",
    helpM2T: "Recepción", helpM2D: "Importa reclamos de cualquier sistema de facturación o escanea un expediente. Los archivos se normalizan y clasifican automáticamente.",
    helpM3T: "Cola por lote", helpM3D: "Tu espacio de trabajo principal. Importa un archivo con cientos de reclamos; los clasificamos por nivel de riesgo para que trabajes los más urgentes primero.",
    helpM4T: "Reclamos", helpM4D: "Profundiza en cualquier reclamo — ve cada código, modificador, diagnóstico, autorización y el problema exacto marcado por el pagador.",
    helpM5T: "Análisis IA", helpM5D: "Ejecuta una revisión IA más profunda. La IA verifica brechas de documentación y sugiere correcciones exactas que puedes aplicar en segundos.",
    helpM6T: "Inteligencia de pagadores", helpM6D: "Las reglas de cada pagador de Puerto Rico en un lugar — plazos, autorizaciones previas, modificadores, MSP y más.",
    helpM7T: "Cumplimiento", helpM7D: "Reglas de CMS, ASES, Medicare e HIPAA — cada una con su fuente regulatoria exacta para que puedas verificar antes de someter.",
    helpM8T: "Denegaciones", helpM8D: "Rastrea reclamos denegados, identifica patrones a lo largo del tiempo y crea cartas de apelación asistidas por IA.",
    helpM9T: "Ingresos", helpM9D: "Ve la tendencia de ingresos recuperados, la tasa de denegación y dónde se pierde dinero mes a mes.",
    helpM10T: "Centro de aprendizaje", helpM10D: "Busca cualquier código ICD-10, CPT o HCPCS, revisa modificadores y abre guías CMS sin salir de RevenueMD.",
    helpNumsT: "Entendiendo las tarjetas del reclamo",
    helpN1T: "Riesgo de denegación", helpN1Range: "",
    helpN1D: "Qué tan probable es que este reclamo sea denegado. Aparece como etiqueta de color en cada fila de la lista y como tarjeta de acción dentro del detalle del reclamo. 'Listo para enviar' (verde): bajo riesgo, puedes someterlo. 'Revisar antes de enviar' (ámbar): hay advertencias que conviene revisar antes de enviar. 'No enviar' (rojo): hay uno o más errores que casi con certeza causarán una denegación — corrígelos primero.",
    helpN2T: "Reglas del pagador", helpN2Range: "",
    helpN2D: "Verifica si el reclamo cumple con las reglas específicas del pagador — ASES, Medicare, Plan Vital, Triple-S, MMM. Aparece como tarjeta de acción dentro del detalle del reclamo. 'Sin acción requerida': el reclamo pasa todas las reglas del pagador. 'Verificar reglas': hay al menos una advertencia que vale revisar en el manual del pagador. 'Corregir antes de enviar': se encontró una violación de regla que este pagador suele denegar.",
    helpN3T: "Documentación", helpN3Range: "",
    helpN3D: "Verifica qué tan completa parece la documentación clínica. Aparece como tarjeta de acción dentro del detalle del reclamo. 'Sin acción requerida': el expediente parece completo. 'Agregar notas faltantes': hay vacíos — un plan de tratamiento, nota clínica o documentación de tiempo que falta. 'Completar expediente': se encontraron problemas significativos de documentación — el reclamo es vulnerable en una auditoría aunque los códigos sean correctos.",
    helpN4T: "$ en riesgo", helpN4Range: "$",
    helpN4D: "El valor total en dólares de todos los reclamos en el carril 'Requiere trabajo' en este momento. Este es el dinero que muy probablemente será denegado si se somete hoy. Corrige esos reclamos y muévelos a Auto-aprobable para proteger los ingresos de tu práctica.",
    helpN5T: "Ingresos recuperados", helpN5Range: "$ / mes",
    helpN5D: "Dinero que tu práctica realmente cobró y que hubiera sido denegado sin detectar el problema primero. Se muestra mensualmente en el tablero. Este es tu retorno financiero directo de RevenueMD — la diferencia entre un reclamo limpio y una carta de denegación.",
    helpN6T: "Tasa de denegación %", helpN6Range: "%",
    helpN6D: "Qué porcentaje de los reclamos sometidos fueron denegados. Menos es siempre mejor. El promedio de la industria en Puerto Rico ronda el 15–20%. La meta de RevenueMD es llevarte por debajo del 10% capturando denegaciones antes de que el reclamo salga de tu clínica.",
    helpN7T: "Tasa de aprobación %", helpN7Range: "%",
    helpN7D: "El porcentaje de reclamos aprobados en el primer intento — sin correcciones, sin reenvíos, sin llamadas de seguimiento. La meta es 90% o más. Cada reclamo que pasa al primer intento le ahorra días de trabajo a tu equipo y acelera el flujo de caja.",
    helpN8T: "Subcodificación detectada", helpN8Range: "$ recuperable",
    helpN8D: "Dinero dejado sobre la mesa al facturar un código que no refleja la complejidad total del servicio. RevenueMD marca cuando tu documentación respalda un código de nivel más alto. Corregir la subcodificación es completamente legal y ético — simplemente significa facturar por lo que realmente hiciste, al nivel correcto.",
    helpRulesT: "Tres cosas que siempre debes recordar",
    helpR1: "RevenueMD revisa reclamos — NO los somete. Tú envías el archivo limpio a tu clearinghouse (ej. Inmediata) después de aprobar.",
    helpR2: "La IA solo apoya decisiones. Cada reclamo debe ser revisado y aprobado por un humano antes de salir.",
    helpR3: "Todos los datos del paciente están encriptados con HIPAA. RevenueMD está diseñado para cumplimiento desde la base.",
    notifTitle: "Notificaciones", notifMarkAll: "Marcar todas como leídas", notifEmpty: "Todo al día.",
    privacyLink: "Política de privacidad", termsLink: "Términos de uso",
    nav_sub: "Suscripción",
    subTitle: "Elige tu plan", subSub: "Precios transparentes e inclusivos. Sin sorpresas por reclamo. Cancela o cambia de plan en cualquier momento.",
    subBilling: "Mensual", subBillingAnn: "Anual  (ahorra 25%)",
    subCurrentPlan: "Plan actual", subPopular: "Más popular", subGetStarted: "Suscribirse ahora", subContact: "Contactar ventas",
    subPerMo: "/ mes", subPerMoAnn: "/ mes, facturado anualmente",
    subAnnSave: "Ahorras", subPerYear: "/ año",
    subFeatClaims: "reclamos / mes", subFeatProviders: "proveedores", subFeatUnlimited: "Ilimitados",
    subFeatRules: "Motor de reglas PR completo (ASES, Plan Vital, Triple-S, MCS, MMM, Humana)", subFeatAI: "Análisis IA y correcciones sugeridas",
    subFeatAudit: "Bitácora de auditoría e historial de lotes", subFeatEncrypt: "Cifrado HIPAA de PHI en reposo", subFeatSupport: "Soporte prioritario",
    subFeatDedicated: "Gerente de cuenta dedicado + SLA", subFeatAPI: "Acceso API y reglas personalizadas",
    subFeatBasicRules: "Motor de reglas PR principal (ASES, Plan Vital)", subFeatEmailSupport: "Soporte por email (SLA 2 días hábiles)",
    subFeatStandardRules: "Motor de reglas PR completo — 7 pagadores", subFeatChatSupport: "Soporte por chat + email",
    subModalTitle: "Estás a un paso", subModalSub: "Esto completará tu suscripción a través de nuestro procesador de pago seguro. Recibirás un email de confirmación con tu factura.",
    subModalConfirm: "Confirmar y suscribirse", subModalCancel: "Cancelar",
    subModalNote: "Al suscribirte aceptas nuestros Términos de uso y autorizas el cargo indicado arriba. Cancela en cualquier momento desde esta página.",
    subTrialBadge: "Modo demo — sin suscripción activa",
    subWhyTitle: "Por qué RevenueMD se paga solo",
    subWhy1T: "Tasa promedio de denegaciones en PR: 18%", subWhy1D: "Los clientes de RevenueMD apuntan a menos del 10%, recuperando miles al mes.",
    subWhy2T: "Tasa de aprobación en primer intento", subWhy2D: "Cada reclamo limpio ahorra días de trabajo a tu equipo y acelera el flujo de caja.",
    subWhy3T: "Recuperación por subcodificación", subWhy3D: "La IA marca cuando la documentación respalda un código más alto — completamente legal y en cumplimiento.",
    subGuarantee: "Garantía de devolución a 30 días en planes anuales.",
    settingsTitle: "Ajustes", settingsSub: "Administra tu perfil, apariencia y preferencias.",
    stProfile: "Mi perfil", stAppearance: "Apariencia", stNotifs: "Notificaciones", stSecurity: "Seguridad", stTeam: "Equipo",
    stFirstName: "Nombre", stLastName: "Apellido", stEmail: "Correo", stRole: "Rol", stSaveProfile: "Guardar cambios", stSaved: "¡Guardado!",
    stAvatarColor: "Color del avatar",
    stThemeTitle: "Color de acento", stThemeSub: "Elige el color de acento de la plataforma. Aplica a todas las secciones.",
    stDensity: "Densidad de visualización", stDensityComfy: "Confortable", stDensityCompact: "Compacto",
    stNotifSub: "Elige qué alertas quieres recibir.",
    stNotifSubscription: "Recordatorios de suscripción", stNotifSubscriptionD: "Fecha de renovación y alertas de facturación (solo gerentes)",
    stNotifClaims: "Alertas de reclamos", stNotifClaimsD: "Lotes que necesitan atención o tienen reclamos de alto riesgo",
    stNotifPayers: "Actualizaciones de pagadores", stNotifPayersD: "Cambios de reglas y boletines de pagadores de Puerto Rico",
    stNotifEmail: "Resumen por email", stNotifEmailD: "Resumen diario enviado a tu correo de trabajo",
    stSecuritySub: "Administra tu contraseña y métodos de autenticación. Habilita varios métodos para mayor seguridad según HIPAA.",
    stChangePassword: "Contraseña", stCurrentPwd: "Contraseña actual", stNewPwd: "Nueva contraseña", stConfirmPwd: "Confirmar nueva contraseña", stUpdatePwd: "Actualizar contraseña",
    stPwdMethodD: "Tu credencial principal de acceso. Usa al menos 12 caracteres con mayúsculas, números y símbolos (NIST SP 800-63B).",
    stPwdAlwaysOn: "Siempre activa",
    stTotpMethod: "App autenticadora", stTotpMethodD: "Usa Google Authenticator, Authy o cualquier app TOTP. Genera un código de 6 dígitos nuevo cada 30 segundos.",
    stTotpSetup: "Configurar", stTotpDisable: "Deshabilitar", stTotpEnabled: "Habilitada",
    stTotpScanTitle: "Escanea con tu app autenticadora", stTotpManual: "O ingresa esta clave manualmente",
    stTotpEnterCode: "Ingresa el código de 6 dígitos que muestra tu app para verificar", stTotpVerify: "Verificar y habilitar", stTotpCodePh: "000 000",
    stTotpCopied: "¡Copiado!",
    stEmailMethod: "Verificación por email", stEmailMethodD: "Se envía un código único a tu correo cada vez que inicias sesión. Funciona sin smartphone.",
    stEmailSetup: "Configurar", stEmailDisable: "Deshabilitar", stEmailEnabled: "Habilitada",
    stEmailSendCode: "Enviar código a", stEmailSent: "Código enviado —", stEmailEnterCode: "Ingresa el código de 6 dígitos de tu correo",
    stEmailVerify: "Verificar y habilitar",
    stAuthMethods: "Métodos de autenticación", stAuthMethodsSub: "Habilita métodos adicionales para autenticación multifactor (MFA).",
    stAuthHipaa: "El MFA es fuertemente recomendado bajo HIPAA §164.308(a)(5) para acceso remoto a sistemas con ePHI.",
    stAuthEnabled: "Activo", stAuthDisabled: "No habilitado",
    stTeamSub: "Gestiona quién tiene acceso a la cuenta de tu organización.",
    stAddMember: "Agregar miembro", stMemberName: "Nombre", stMemberRole: "Rol", stMemberStatus: "Estado", stMemberActive: "Activo",
    stInviteEmail: "Invitar por correo", stSendInvite: "Enviar invitación",
    stLanguage: "Idioma", stLanguageSub: "Elige el idioma de la plataforma.",
    mobileManagerOnly: "Esta vista es solo para gerentes",
    mobileManagerOnlySub: "Las herramientas de codificación y facturación requieren un navegador de escritorio. Inicia sesión desde tu computadora para acceder a reclamos, colas y análisis.",
    mobileCoderDesk: "Iniciar sesión en escritorio",
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
  { id: "PLANVITAL", name: "Plan Vital", sub: "ASES · Medicaid · GHP", color: C.teal, soft: C.tealSoft, lob: ["Medicaid", "GHP"],
    facts: [
      { lEn: "Government Health Plan (GHP) covering ~1.6M Puerto Rico residents — administered by ASES", lEs: "Plan de Salud del Gobierno (GHP) para ~1.6M residentes — administrado por ASES", v: "published" },
      { lEn: "Timely filing: 90 days from date of service (ASES Provider Manual 2024 §6.3)", lEs: "Presentación oportuna: 90 días desde la fecha de servicio (Manual ASES 2024 §6.3)", v: "published" },
      { lEn: "Electronic claims required when submitting ≥10 claims/month (ASES EDI Companion Guide)", lEs: "Reclamos electrónicos requeridos al someter ≥10 reclamos/mes", v: "published" },
      { lEn: "Rendering NPI + Group NPI both required on 837P", lEs: "NPI del proveedor y NPI del grupo requeridos en el 837P", v: "published" },
      { lEn: "H0004 daily unit cap: 8 units/day; prior auth required — verify current fee schedule", lEs: "Tope diario H0004: 8 unidades/día; autorización previa requerida — verificar", v: "needs" },
      { lEn: "Prior authorization required for behavioral health series >12 sessions/year (ASES BH Grid)", lEs: "Autorización previa para series de salud conductual >12 sesiones/año (Grid ASES)", v: "published" },
      { lEn: "Behavioral-health co-location rules and modifier requirements apply (GT for telehealth)", lEs: "Aplican reglas de co-localización y modificadores de salud conductual (GT para telesalud)", v: "published" },
      { lEn: "Member ID format: 2 alpha + 8 digits (e.g., PV90012345); ID must match ASES eligibility system exactly", lEs: "Formato ID miembro: 2 letras + 8 dígitos (ej. PV90012345); debe coincidir exactamente con el sistema ASES", v: "published" },
      { lEn: "Corrected claims: use CLM05-3 frequency code 7 (corrected) or 8 (void/rebill) within 365 days of remittance", lEs: "Reclamos corregidos: usar código frecuencia 7 (corregido) u 8 (anulado) dentro de 365 días del recibo", v: "published" },
      { lEn: "Mental health parity applies: behavioral health benefits cannot be more restrictive than medical/surgical (PR Law 408-2000; MHPAEA)", lEs: "Aplica paridad de salud mental: beneficios conductuales no pueden ser mas restrictivos que los médico-quirúrgicos (Ley 408-2000; MHPAEA)", v: "statutory" },
      { lEn: "Clean claim must include: member ID, rendering NPI, billing NPI, ICD-10 (highest specificity), CPT/HCPCS, POS, DOS, and charges", lEs: "Reclamo limpio debe incluir: ID miembro, NPI del proveedor, NPI de facturación, ICD-10, CPT/HCPCS, POS, DOS y cargos", v: "published" },
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
  { code: "PR-PPL-002", sev: "warning", v: "statutory", en: "Interest accrues at the federal rate on unpaid clean claims beyond the prompt payment window — providers may file OCS complaint for non-payment", es: "Se acumulan intereses sobre reclamos limpios no pagados fuera del plazo — proveedores pueden presentar queja ante la OCS", src: "PR Act 194-2000; 26 LPRA §3348a(b); OCS Regulation 93" },
  // ASES / Mi Salud — Additional Rules
  { code: "ASES-010", sev: "error", v: "published", en: "Mi Salud gatekeeper model: PCP referral required for specialist visits — obtain referral before service or claim will be denied as unauthorized", es: "Modelo Mi Salud: referido del medico primario requerido para especialistas — obtener antes del servicio o el reclamo sera denegado", src: "ASES Mi Salud Provider Manual 2024, §5.2; 42 CFR §438.206" },
  { code: "ASES-011", sev: "warning", v: "statutory", en: "Emergency services: EMTALA protections apply — no prior authorization required; stabilize patient first, notify plan within 24–48 hours of admission", es: "Servicios de emergencia: aplica EMTALA — no requiere autorizacion previa; estabilizar paciente primero, notificar al plan en 24–48 horas", src: "EMTALA 42 USC §1395dd; 42 CFR §489.24; ASES Mi Salud Emergency Policy" },
  { code: "ASES-012", sev: "error", v: "published", en: "Corrected and void/rebill claims must be submitted within 365 days of the original remittance date — use claim frequency type code 7 (corrected) or 8 (void)", es: "Reclamos corregidos deben someterse dentro de 365 dias del recibo original — usar codigo de frecuencia 7 (corregido) u 8 (anulado)", src: "ASES Provider Manual 2024, §6.4; EDI 837P Loop 2300 CLM05-3" },
  { code: "ASES-013", sev: "warning", v: "statutory", en: "EPSDT (Early Periodic Screening, Diagnosis, and Treatment): members under 21 are entitled to any medically necessary service — even if not in the adult benefit package", es: "EPSDT: miembros menores de 21 anos tienen derecho a cualquier servicio medicamente necesario — aunque no este en el paquete adulto", src: "Social Security Act §1905(r); 42 CFR §441.301; ASES EPSDT Policy" },
  { code: "ASES-014", sev: "error", v: "published", en: "Eligibility must be verified on the date of service — retroactive Medicaid terminations result in full claim denial even if member appeared eligible at time of service", es: "La elegibilidad debe verificarse en la fecha de servicio — terminaciones retroactivas de Medicaid resultan en denegacion total", src: "ASES Provider Manual 2024, §3.1; 42 CFR §431.201; ASES MMIS Eligibility Guide" },
  { code: "ASES-015", sev: "error", v: "published", en: "Home health services require prior authorization from the MCO — submit clinical documentation supporting medical necessity before first visit", es: "Servicios de salud en el hogar requieren autorizacion previa del MCO — someter documentacion clinica antes de la primera visita", src: "ASES Mi Salud Provider Manual 2024, §7.4; 42 CFR §440.70" },
  { code: "ASES-016", sev: "error", v: "published", en: "Physical therapy, occupational therapy, and speech-language pathology require prior auth after initial evaluation — include functional goals and expected duration", es: "Terapia fisica, ocupacional y del habla requieren autorizacion previa tras la evaluacion inicial — incluir objetivos funcionales y duracion esperada", src: "ASES Mi Salud Provider Manual 2024, §7.6; MCO-specific PA grids" },
  { code: "ASES-017", sev: "error", v: "statutory", en: "Mental health parity (PR Law 408-2000; federal MHPAEA): behavioral health benefits cannot have more restrictive limitations than medical/surgical benefits", es: "Paridad de salud mental (Ley 408-2000 PR; MHPAEA federal): beneficios de salud conductual no pueden tener limitaciones mas restrictivas que los medico-quirurgicos", src: "PR Law 408-2000 (24 LPRA §6152); MHPAEA 42 USC §300gg-26; 29 CFR §2590.712" },
  { code: "ASES-018", sev: "warning", v: "statutory", en: "FQHC and RHC billing: encounter-based payment model applies — bill one encounter per visit regardless of number of services provided during that visit", es: "Facturacion FQHC y RHC: aplica modelo de pago por encuentro — facturar un encuentro por visita independientemente del numero de servicios", src: "42 CFR §405.2462; §405.2468; ASES FQHC/RHC Policy" },
  { code: "ASES-019", sev: "error", v: "published", en: "DME (Durable Medical Equipment) requires prior authorization — include Certificate of Medical Necessity (CMN) and physician order; verify ASES DME fee schedule", es: "Equipo medico duradero (DME) requiere autorizacion previa — incluir Certificado de Necesidad Medica (CMN) y orden medica", src: "ASES Provider Manual 2024, §8.1; 42 CFR §440.70(b)" },
  // Medicare / CMS — Additional Rules
  { code: "CMS-007", sev: "warning", v: "statutory", en: "Puerto Rico has its own Geographic Practice Cost Indices (GPCI) — Medicare reimbursement rates in PR differ from continental US; check FCSO fee schedule annually", es: "Puerto Rico tiene sus propios GPCI — las tarifas Medicare en PR difieren del continente; verificar fee schedule FCSO anualmente", src: "42 CFR §414.20; CMS Medicare Physician Fee Schedule; FCSO Jurisdiction N Fee Schedule" },
  { code: "CMS-008", sev: "warning", v: "statutory", en: "Medicare preventive services: Initial Preventive Physical Exam (IPPE, G0402) and Annual Wellness Visit (AWV, G0438 first / G0439 subsequent) covered at 0% patient cost-sharing", es: "Servicios preventivos Medicare: IPPE (G0402) y Visita de Bienestar Anual (AWV, G0438 primera / G0439 subsecuente) cubiertos sin coseguro del paciente", src: "42 CFR §410.16; §410.15; SSA §1861(ww); CMS MLN MM8079" },
  { code: "CMS-009", sev: "error", v: "statutory", en: "Incident-to billing: services must be integral to physician's treatment plan, supervised in office/clinic (direct supervision), and billed under the physician's NPI — cannot use when physician is absent", es: "Facturacion incident-to: servicios deben ser parte del plan del medico, con supervision directa, bajo el NPI del medico — no aplica si el medico esta ausente", src: "CMS Pub 100-02, Ch. 15, §60; 42 CFR §410.26; CMS MLN SE0441" },
  { code: "CMS-010", sev: "warning", v: "statutory", en: "Medicare global surgery package: pre-operative (1 day for major, same-day for minor), intra-operative, and post-operative care are included — do not separately bill included services", es: "Paquete global de cirugia Medicare: cuidado pre-operatorio, intra-operatorio y post-operatorio estan incluidos — no facturar por separado los servicios incluidos", src: "CMS Pub 100-04, Ch. 12, §40; CMS Global Surgery Booklet" },
  { code: "CMS-011", sev: "error", v: "statutory", en: "Split/shared visit rule: for hospital/SNF E&M, physician and NPP may share the visit — bill under the clinician performing the substantive portion; document who performed each part", es: "Regla de visita compartida: para E&M hospitalaria, medico y NPP pueden compartir — facturar bajo quien realizo la parte sustancial; documentar quien hizo cada parte", src: "42 CFR §415.102; CMS Transmittal 11070; CMS MLN MM12523" },
  { code: "CMS-012", sev: "warning", v: "statutory", en: "Medicare Part B therapy (PT/OT/SLP): KX modifier required once the therapy threshold is met ($2,330 per discipline in 2025) to attest medical necessity is documented", es: "Terapia Parte B Medicare (PT/OT/SLP): modificador KX requerido al alcanzar el umbral de terapia (aprox. $2,330 por disciplina en 2025) para atestar documentacion de necesidad medica", src: "42 CFR §410.59; SSA §1833(g); CMS MLN SE1516; FCSO Therapy CAP FAQs" },
  { code: "CMS-013", sev: "warning", v: "statutory", en: "DMEPOS in Puerto Rico: suppliers must be accredited by a CMS-approved organization (e.g., ACHC, BOC, CHAP) and enrolled in Medicare as SADMEPOS before billing", es: "DMEPOS en Puerto Rico: los proveedores deben estar acreditados por una organizacion aprobada por CMS y matriculados como SADMEPOS antes de facturar", src: "42 CFR §424.57; SSA §1834(j); CMS DMEPOS Accreditation Requirements" },
  // NCCI / Correct Coding — Additional Rules
  { code: "NCCI-004", sev: "warning", v: "statutory", en: "X-modifiers (XE, XS, XP, XU) are the preferred alternative to Modifier 59 for Medicare — use the most specific X-modifier that applies to the clinical scenario", es: "Los modificadores X (XE, XS, XP, XU) son la alternativa preferida al Modificador 59 para Medicare — usar el modificador X mas especifico al escenario clinico", src: "CMS Transmittal 3064; CMS MLN MM8863; CMS NCCI Policy Manual Ch. 1, §F" },
  { code: "NCCI-005", sev: "error", v: "statutory", en: "Global surgery package: pre-operative visits (1 day major, same day minor), intraoperative services, and standard post-operative follow-up are bundled — separately billing these is improper", es: "Paquete global de cirugia: visitas preoperatorias, servicios intraoperatorios y seguimiento postoperatorio estan incluidos — facturarlos por separado es impropio", src: "CMS NCCI Policy Manual, Ch. 9; CMS Pub 100-04, Ch. 12, §40" },
  // Documentation & Medical Record Rules
  { code: "DOC-001", sev: "error", v: "published", en: "Medical record must support the billed service and level of care — diagnosis, treatment, and medical necessity must be clearly documented before the claim is submitted", es: "El expediente medico debe respaldar el servicio facturado — diagnostico, tratamiento y necesidad medica deben estar claramente documentados antes de someter", src: "CMS Pub 100-08, Ch. 3, §3.3.2; ASES Provider Manual 2024, §4.1; AMA CPT 2024 guidelines" },
  { code: "DOC-002", sev: "error", v: "published", en: "Co-signature required for services provided by supervised clinicians (students, residents, fellows) — attending physician must review, date, and sign the note", es: "Co-firma requerida para servicios de clinicos supervisados (estudiantes, residentes) — el medico supervisor debe revisar, fechar y firmar la nota", src: "CMS Pub 100-02, Ch. 15, §60; Joint Commission standards; ASES provider credentialing policy" },
  { code: "DOC-003", sev: "warning", v: "published", en: "Electronic signatures: must include the author's name, credential, date, and time — addenda must be labeled as such with original note intact; no alterations to signed records", es: "Firmas electronicas: deben incluir nombre, credencial, fecha y hora del autor — las addendas deben identificarse como tales con la nota original intacta", src: "45 CFR §164.312(c); CMS Pub 100-08, Ch. 3, §3.3.1; Joint Commission RC.01.02.01" },
  // Puerto Rico Specific — Additional Rules
  { code: "PR-ACT408", sev: "warning", v: "statutory", en: "ASSMCA (PR Law 408-2000): mental health and substance use disorder services in PR must comply with ASSMCA regulations in addition to ASES and HIPAA requirements", es: "ASSMCA (Ley 408-2000 PR): servicios de salud mental y uso de sustancias deben cumplir con reglamentos ASSMCA ademas de ASES e HIPAA", src: "PR Law 408-2000 (24 LPRA §6151 et seq.); ASSMCA Regulations; ASES BH Policy" },
  { code: "PR-OCS-001", sev: "warning", v: "statutory", en: "OCS (Office of the Insurance Commissioner of PR) regulates private health insurance — file complaints for prompt payment violations, wrongful denials, and unfair claim practices", es: "La OCS regula los seguros privados en PR — presentar quejas por pagos tardios, denegaciones improcedentes y practicas injustas de reclamos", src: "26 LPRA §2701 et seq.; OCS Regulation 93; OCS Circular Letters" },
  { code: "PR-COB-001", sev: "error", v: "published", en: "Coordination of Benefits (COB): when a member has two coverages, the primary payer EOB must accompany the secondary claim — submit COB segment (Loop 2320) on the 837P", es: "COB: cuando un miembro tiene dos coberturas, el EOB del pagador primario debe acompanar el reclamo secundario — someter segmento COB (Loop 2320) en el 837P", src: "ASES COB Policy 2024; HIPAA 837P COB Companion Guide; 45 CFR §162.1102" },
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
  { type:"CPT", code:"99202", desc:"Office visit, new patient, 15–29 min", units:"1", notes:"Level based on MDM (straightforward) or time. 2021 AMA guidelines apply." },
  { type:"CPT", code:"99203", desc:"Office visit, new patient, 30–44 min", units:"1", notes:"Level based on MDM (low complexity) or time." },
  { type:"CPT", code:"99204", desc:"Office visit, new patient, 45–59 min", units:"1", notes:"Level based on MDM (moderate complexity) or time." },
  { type:"CPT", code:"99205", desc:"Office visit, new patient, 60–74 min", units:"1", notes:"Level based on MDM (high complexity) or time." },
  { type:"CPT", code:"99212", desc:"Office visit, established patient, 10–19 min", units:"1", notes:"Level based on MDM (straightforward) or time." },
  { type:"CPT", code:"99213", desc:"Office visit, established patient, 20–29 min", units:"1", notes:"Level based on MDM (low complexity) or time." },
  { type:"CPT", code:"99214", desc:"Office visit, established patient, 30–39 min", units:"1", notes:"Level based on MDM (moderate complexity) or time. Most common level billed in PR primary care." },
  { type:"CPT", code:"99215", desc:"Office visit, established patient, 40–54 min", units:"1", notes:"Level based on MDM (high complexity) or time. Requires documentation supporting high MDM." },
  // CPT — Preventive / Wellness
  { type:"CPT", code:"99381", desc:"Preventive visit, new patient, infant (under 1 year)", units:"1", notes:"EPSDT-covered for Medicaid members under 21. ASES Mi Salud: no copay for preventive." },
  { type:"CPT", code:"99382", desc:"Preventive visit, new patient, 1–4 years", units:"1", notes:"EPSDT-covered under Medicaid. Include age-appropriate anticipatory guidance." },
  { type:"CPT", code:"99383", desc:"Preventive visit, new patient, 5–11 years", units:"1", notes:"EPSDT-covered. Document required EPSDT screenings performed." },
  { type:"CPT", code:"99384", desc:"Preventive visit, new patient, 12–17 years", units:"1", notes:"EPSDT-covered. Adolescent screening tools (PHQ-A, CRAFFT) recommended." },
  { type:"CPT", code:"99385", desc:"Preventive visit, new patient, 18–39 years", units:"1", notes:"Medicare does not cover; ASES Mi Salud covers preventive as no-copay benefit." },
  { type:"CPT", code:"99386", desc:"Preventive visit, new patient, 40–64 years", units:"1", notes:"Common in PR primary care. Medicare: use G0402 (IPPE) for initial, G0438/G0439 (AWV) for annual." },
  { type:"CPT", code:"99391", desc:"Preventive visit, established patient, infant (under 1 year)", units:"1", notes:"EPSDT-covered. Document vaccinations, developmental milestones, and screenings." },
  { type:"CPT", code:"99392", desc:"Preventive visit, established patient, 1–4 years", units:"1", notes:"EPSDT-covered." },
  { type:"CPT", code:"99393", desc:"Preventive visit, established patient, 5–11 years", units:"1", notes:"EPSDT-covered." },
  { type:"CPT", code:"99394", desc:"Preventive visit, established patient, 12–17 years", units:"1", notes:"EPSDT-covered. Includes depression, alcohol/substance use screening per USPSTF." },
  { type:"CPT", code:"99395", desc:"Preventive visit, established patient, 18–39 years", units:"1", notes:"Covered by ASES Mi Salud. Not a Medicare benefit — use AWV codes for Medicare." },
  { type:"CPT", code:"99396", desc:"Preventive visit, established patient, 40–64 years", units:"1", notes:"Covered by ASES and most commercial plans. For Medicare use G0438/G0439." },
  // HCPCS — Medicare Wellness & Preventive
  { type:"HCPCS", code:"G0402", desc:"Initial Preventive Physical Exam (IPPE / Welcome to Medicare)", units:"1 per lifetime", notes:"Medicare: covered at 0% coinsurance within 12 months of Part B enrollment. Do not bill with 99386." },
  { type:"HCPCS", code:"G0438", desc:"Annual Wellness Visit (AWV), first visit", units:"1/year", notes:"Medicare Part B: covered at 0% coinsurance. Cannot be billed within 12 months of IPPE (G0402)." },
  { type:"HCPCS", code:"G0439", desc:"Annual Wellness Visit (AWV), subsequent visit", units:"1/year", notes:"Medicare Part B: covered at 0% coinsurance. Bill after first AWV (G0438). Can bill same day as E&M with modifier 25." },
  { type:"HCPCS", code:"G0444", desc:"Annual depression screening, 15 minutes", units:"1/year", notes:"Medicare: covered when staff-assisted depression care supports are in place. PHQ-2 or PHQ-9 commonly used." },
  { type:"HCPCS", code:"G0442", desc:"Annual alcohol misuse screening, 15 minutes", units:"1/year", notes:"Medicare: AUDIT-C or single-question screen. Covered once per year for Medicare Part B." },
  { type:"HCPCS", code:"G0446", desc:"Intensive behavioral therapy for cardiovascular disease, individual, 15 min", units:"Up to 5 sessions/year", notes:"Medicare: for patients with hyperlipidemia, hypertension, or mixed dyslipidemia. Include risk factor documentation." },
  { type:"HCPCS", code:"G0447", desc:"Face-to-face behavioral counseling for obesity, 15 min", units:"Up to 22 sessions/year", notes:"Medicare: BMI ≥30; performed by primary care. Intensive counseling structure with documented weight-loss goals." },
  // CPT — Chronic Care Management & Remote Monitoring
  { type:"CPT", code:"99490", desc:"Chronic care management, first 20 min/month", units:"1/month", notes:"Medicare and ASES: for patients with 2+ chronic conditions expected to last 12 months. Requires written care plan and consent." },
  { type:"CPT", code:"99491", desc:"Chronic care management by physician, first 30 min/month", units:"1/month", notes:"Physician/NP/PA personally performs. Cannot bill same month as 99490." },
  { type:"CPT", code:"99453", desc:"Remote physiologic monitoring (RPM) — setup and patient education", units:"1 per device", notes:"Medicare and ASES: for blood pressure, glucose, weight, O2 saturation devices. Requires 16+ days of data/month." },
  { type:"CPT", code:"99454", desc:"RPM — device supply with daily recording/transmission, each 30 days", units:"1/month per device", notes:"Bill monthly with 99457/99458 for monitoring service. Patient must transmit data ≥16 days/month." },
  { type:"CPT", code:"99457", desc:"RPM — clinical staff time, first 20 min/month", units:"1/month", notes:"Medicare: interactive communication with patient required. Document clinical decision-making based on transmitted data." },
  { type:"CPT", code:"99458", desc:"RPM — clinical staff time, each additional 20 min/month", units:"Add-on", notes:"Add-on to 99457. Each unit = 20 additional minutes of clinical staff RPM management." },
  // CPT — Behavioral Health Integration & Collaborative Care
  { type:"CPT", code:"99492", desc:"Collaborative care management, first 70 min/month (initial month)", units:"1/month", notes:"CoCM model: requires behavioral health care manager, psychiatrist case review, and registry. Medicare: covered." },
  { type:"CPT", code:"99493", desc:"Collaborative care management, first 60 min/month (subsequent)", units:"1/month", notes:"Same CoCM requirements as 99492. Bill monthly after initial month." },
  { type:"CPT", code:"99494", desc:"Collaborative care management, each additional 30 min/month", units:"Add-on", notes:"Add-on to 99492 or 99493 for additional time beyond initial thresholds." },
  // CPT — Transitional Care Management
  { type:"CPT", code:"99495", desc:"Transitional care management, moderate complexity (14-day window)", units:"1 per discharge", notes:"Requires contact within 2 business days of discharge, face-to-face visit within 14 days. Medicare: covered." },
  { type:"CPT", code:"99496", desc:"Transitional care management, high complexity (7-day window)", units:"1 per discharge", notes:"Face-to-face within 7 calendar days of discharge. High-complexity MDM required. Frequently applicable in PR given chronic disease burden." },
  // CPT — Immunizations (Administration)
  { type:"CPT", code:"90471", desc:"Immunization administration, first injection", units:"1 per encounter", notes:"Bill in addition to vaccine product code. ASES Mi Salud: vaccines are EPSDT benefit for under 21." },
  { type:"CPT", code:"90472", desc:"Immunization administration, each additional injection", units:"Per additional vaccine", notes:"Add-on to 90471. Cannot be billed as stand-alone." },
  // CPT — Common Diagnostics
  { type:"CPT", code:"93000", desc:"Electrocardiogram, routine ECG with 12 leads", units:"1", notes:"High prevalence of cardiovascular disease in PR. Medicare: covered; ASES Mi Salud: covered as ordered diagnostic." },
  { type:"CPT", code:"94010", desc:"Spirometry — forced expiratory volume timed and forced vital capacity", units:"1", notes:"Relevant for COPD and asthma management (high prevalence in PR). Document pre/post bronchodilator if applicable." },
  // ICD-10 — Chronic Conditions (High Prevalence in Puerto Rico)
  { type:"ICD-10", code:"E11.9", desc:"Type 2 diabetes mellitus without complications", units:"—", notes:"Code to highest specificity — add complication codes (E11.21, E11.40, etc.) when present. Most common chronic code in PR." },
  { type:"ICD-10", code:"E11.65", desc:"Type 2 diabetes mellitus with hyperglycemia", units:"—", notes:"Use when blood glucose is above target without a specific complication documented." },
  { type:"ICD-10", code:"E11.21", desc:"Type 2 diabetes with diabetic nephropathy", units:"—", notes:"Add N18.x for CKD stage when documented. Common dual coding in PR nephrology." },
  { type:"ICD-10", code:"E11.40", desc:"Type 2 diabetes with diabetic neuropathy, unspecified", units:"—", notes:"Code specific neuropathy type (E11.41, E11.42, E11.43) when documented." },
  { type:"ICD-10", code:"E11.51", desc:"Type 2 diabetes with diabetic peripheral angiopathy without gangrene", units:"—", notes:"Add I70.xx (atherosclerosis) if present. Required for vascular surgery/wound care coding." },
  { type:"ICD-10", code:"I10", desc:"Essential (primary) hypertension", units:"—", notes:"Single code when no secondary cause. Add I11–I13 when heart or kidney involvement is documented. Extremely common in PR." },
  { type:"ICD-10", code:"I50.9", desc:"Heart failure, unspecified", units:"—", notes:"Code systolic vs diastolic when documented (I50.20, I50.30). Common cause of hospitalization in PR." },
  { type:"ICD-10", code:"I48.91", desc:"Unspecified atrial fibrillation", units:"—", notes:"Code persistent (I48.11) or long-standing persistent (I48.19) when documented." },
  { type:"ICD-10", code:"J44.1", desc:"Chronic obstructive pulmonary disease with acute exacerbation", units:"—", notes:"Add J96.00 for acute respiratory failure if present. Use J44.0 when infection is documented." },
  { type:"ICD-10", code:"J45.20", desc:"Mild intermittent asthma, uncomplicated", units:"—", notes:"Specify severity and whether complicated. Common in pediatric PR population." },
  { type:"ICD-10", code:"N18.3", desc:"Chronic kidney disease, stage 3 (moderate)", units:"—", notes:"Substage 3a (N18.31) or 3b (N18.32) when GFR is documented. Code with E11.21 when diabetic nephropathy is etiology." },
  { type:"ICD-10", code:"N18.4", desc:"Chronic kidney disease, stage 4 (severe)", units:"—", notes:"eGFR 15–29. High prevalence in PR due to diabetes and hypertension. Add Z99.2 when dialysis is ongoing." },
  { type:"ICD-10", code:"E66.9", desc:"Obesity, unspecified", units:"—", notes:"Use E66.01 for morbid obesity with BMI ≥40. Add BMI code (Z68.xx) for Medicare and ASES quality reporting." },
  { type:"ICD-10", code:"E78.5", desc:"Hyperlipidemia, unspecified", units:"—", notes:"Code mixed hyperlipidemia (E78.2) or pure hypercholesterolemia (E78.00) when specified. Common PR primary care code." },
  { type:"ICD-10", code:"M54.50", desc:"Low back pain, unspecified", units:"—", notes:"Code specific cause when known (M51.17 = lumbar disc degeneration). High-volume code in PR orthopedics and PM&R." },
  { type:"ICD-10", code:"Z00.00", desc:"Encounter for general adult medical examination without abnormal findings", units:"—", notes:"Use for preventive visits (99385, 99395, 99396). Add Z01.419 (vision), Z01.10 (hearing) for preventive screenings same day." },
  { type:"ICD-10", code:"Z00.01", desc:"Encounter for general adult medical examination with abnormal findings", units:"—", notes:"Use when the preventive visit identifies a new problem that is addressed and documented in the same note." },
  { type:"ICD-10", code:"Z23", desc:"Encounter for immunization", units:"—", notes:"Primary diagnosis for vaccine administration visits. Add the vaccine product CPT + administration code (90471)." },
  { type:"ICD-10", code:"Z12.11", desc:"Encounter for screening for malignant neoplasm of colon", units:"—", notes:"Use for colonoscopy screening. Medicare covers colonoscopy at 0% cost-sharing when Z12.11 is primary — do not use as secondary." },
  { type:"ICD-10", code:"F32.9", desc:"Major depressive disorder, single episode, unspecified", units:"—", notes:"High prevalence in PR. Code specified severity (F32.0–F32.2) when documented for more accurate risk stratification." },
  { type:"ICD-10", code:"F33.9", desc:"Major depressive disorder, recurrent, unspecified", units:"—", notes:"Code severity when documented. Add F33.4 for MDD in remission." },
  { type:"ICD-10", code:"F17.210", desc:"Nicotine dependence, cigarettes, uncomplicated", units:"—", notes:"Required for smoking cessation counseling billing (99406, 99407). Common in PR; document pack-years." },
  { type:"ICD-10", code:"Z87.891", desc:"Personal history of nicotine dependence", units:"—", notes:"Use for former smokers (quit >1 year) — relevant for preventive care documentation." },
  // CPT — Laboratory (High-volume in PR primary care)
  { type:"CPT", code:"80048", desc:"Basic metabolic panel", units:"1", notes:"Includes glucose, BUN, creatinine, electrolytes, CO2, calcium. Medicare and ASES: covered as ordered diagnostic. Common in DM and HTN follow-up." },
  { type:"CPT", code:"80053", desc:"Comprehensive metabolic panel", units:"1", notes:"BMP + liver function tests (albumin, total protein, ALT, AST, bilirubin, ALP). Bill 80053 OR 80048 — not both, CCI bundles them." },
  { type:"CPT", code:"85025", desc:"Complete blood count (CBC) with differential", units:"1", notes:"Includes WBC differential. Bill 85025 (with diff) or 85027 (without diff) — not both. Very high volume in PR primary care." },
  { type:"CPT", code:"83036", desc:"Hemoglobin A1c", units:"1", notes:"Required for HEDIS measure for diabetes management. ASES Mi Salud: covered for DM members. Document the diagnosis code (E11.x) on the claim." },
  { type:"CPT", code:"80061", desc:"Lipid panel", units:"1", notes:"Total cholesterol, HDL, LDL (calculated), triglycerides. Medicare: covered annually for cardiovascular risk screening. ASES: covered as ordered diagnostic." },
  { type:"CPT", code:"84443", desc:"Thyroid stimulating hormone (TSH)", units:"1", notes:"Primary screening test for thyroid disorders. High prevalence of thyroid disease in PR women. Document the clinical indication (e.g., R00.8, Z13.88)." },
  { type:"CPT", code:"82043", desc:"Urine microalbumin (quantitative)", units:"1", notes:"Annual screening for diabetic nephropathy. Pair with creatinine (82570) to calculate albumin/creatinine ratio. Required for HEDIS kidney health measure." },
  // CPT — Physical Therapy / Rehabilitation
  { type:"CPT", code:"97110", desc:"Therapeutic exercises — each 15 minutes", units:"1–8 per day", notes:"Strengthening, flexibility, endurance. Requires direct one-on-one contact. Document functional goal and time. Medicare: KX modifier required once therapy threshold met." },
  { type:"CPT", code:"97530", desc:"Therapeutic activities — each 15 minutes", units:"1–8 per day", notes:"Dynamic activities to improve functional performance. Must be one-on-one. Use when activities are task-specific (vs. rote exercise). Most frequently audited PT code." },
  { type:"CPT", code:"97140", desc:"Manual therapy techniques — each 15 minutes", units:"1–4 per day", notes:"Manipulation, mobilization, manual lymphatic drainage. One-on-one required. Cannot be billed same time unit as 97110. Most payers limit concurrent time-based units to total treatment time." },
  { type:"CPT", code:"97012", desc:"Mechanical traction — each 15 minutes", units:"1–2 per day", notes:"Mechanical spinal traction. Medicare: covered for disc disease with radiculopathy. ASES: verify prior auth for extended series. Document spinal level." },
  // ICD-10 — Pain
  { type:"ICD-10", code:"G89.29", desc:"Other chronic pain", units:"—", notes:"Use when chronic pain is not elsewhere classified. Code the underlying cause first when known. Cannot be used as primary diagnosis for most payers if an underlying etiology is documented." },
  { type:"ICD-10", code:"M54.4", desc:"Lumbago with sciatica, unspecified side", units:"—", notes:"Use M54.41 (right) or M54.42 (left) when documented. High-volume code in PR orthopedics and neurology. Often paired with M51.16/M51.17 for disc herniation." },
  { type:"ICD-10", code:"M25.511", desc:"Pain in right shoulder", units:"—", notes:"Use M25.512 for left shoulder. Document laterality. Common precursor to rotator cuff imaging (77040/77041). Supports PT referral documentation." },
  // ICD-10 — Women's Health / OB
  { type:"ICD-10", code:"Z34.00", desc:"Encounter for supervision of normal pregnancy, unspecified trimester", units:"—", notes:"Use Z34.01 (first), Z34.02 (second), Z34.03 (third) when trimester is documented. Primary diagnosis for routine OB visits. Do not use when a pregnancy complication is present." },
  { type:"ICD-10", code:"N39.0", desc:"Urinary tract infection, site not specified", units:"—", notes:"High-frequency code in PR primary care and OB. Always try to code the specific organism (B96.20 for E. coli) as secondary when culture results are available." },
  // ICD-10 — Behavioral Health (Additional)
  { type:"ICD-10", code:"F40.10", desc:"Social phobia, unspecified", units:"—", notes:"Code social anxiety disorder. Specify generalized (F40.11) when documented. Common comorbidity with MDD and PTSD in PR population." },
  { type:"ICD-10", code:"F42.2", desc:"Mixed obsessional thoughts and acts (OCD)", units:"—", notes:"Use F42.2 when both obsessions and compulsions are present (most common presentation). Pair with appropriate CPT BH code (90837 or 90834)." },
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
  { mod:"XE", desc:"Separate encounter, a service that is distinct because it occurred during a separate encounter", payer:"Medicare (preferred over 59)", rule:"Use when the procedure was performed at a different encounter on the same day. Preferred by Medicare over Modifier 59." },
  { mod:"XS", desc:"Separate structure, a service that is distinct because it was performed on a separate organ or structure", payer:"Medicare (preferred over 59)", rule:"Use when procedures are performed on anatomically distinct structures. More specific than Modifier 59." },
  { mod:"XP", desc:"Separate practitioner, a service that is distinct because it was performed by a different practitioner", payer:"Medicare (preferred over 59)", rule:"Use when a different clinician performed the additional service on the same day." },
  { mod:"XU", desc:"Unusual non-overlapping service, the use of a service that is distinct because it does not overlap usual components of the main service", payer:"Medicare (preferred over 59)", rule:"Use when the service does not overlap with the main procedure. Least commonly applicable of the X-modifiers." },
  { mod:"22", desc:"Increased procedural services", payer:"All", rule:"Use when the work required to provide service is substantially greater than usual. Must include documentation; expect review." },
  { mod:"24", desc:"Unrelated E&M service by same physician during post-operative period", payer:"All", rule:"Allows billing an E&M during the global period for an unrelated condition — document the unrelated diagnosis separately." },
  { mod:"26", desc:"Professional component", payer:"All", rule:"Bill the interpretation portion when the facility owns the equipment (e.g., reading an EKG or X-ray performed at a hospital)." },
  { mod:"TC", desc:"Technical component", payer:"All", rule:"Bill when the provider owns the equipment and performs the technical portion but not the interpretation. Paired with Modifier 26." },
  { mod:"57", desc:"Decision for surgery — E&M on day of or day before major surgery", payer:"All", rule:"Allows billing of E&M on the same day as a major procedure (90-day global) when the decision to operate was made at that visit." },
  { mod:"GN", desc:"Services delivered under an outpatient speech-language pathology plan of care", payer:"Medicare", rule:"Required on all Medicare Part B SLP claims. Plan of care must be on file and updated every 30 treatment days." },
  { mod:"GO", desc:"Services delivered under an outpatient occupational therapy plan of care", payer:"Medicare", rule:"Required on all Medicare Part B OT claims. Add KX once therapy threshold is met." },
  { mod:"GP", desc:"Services delivered under an outpatient physical therapy plan of care", payer:"Medicare", rule:"Required on all Medicare Part B PT claims. Add KX once therapy threshold is met." },
  { mod:"CR", desc:"Catastrophe/disaster related", payer:"Medicare", rule:"Use during declared public health emergencies (e.g., hurricane recovery, COVID-19 PHE). Required for certain flexibilities to apply." },
  { mod:"CS", desc:"Cost-sharing waived", payer:"Medicare", rule:"Waives cost-sharing for certain COVID-related services during PHE. Check CMS guidance for current applicability." },
  { mod:"CG", desc:"Policy criteria applied", payer:"Medicare", rule:"Used for Part B outpatient therapy to indicate clinical criteria for continued services have been assessed and met." },
  { mod:"NU", desc:"New equipment", payer:"Medicaid / HCPCS", rule:"Used with HCPCS DME codes to indicate new equipment is being provided. Required by ASES for DME claims." },
  { mod:"RR", desc:"Rental", payer:"Medicaid / HCPCS", rule:"Indicates DME is being rented rather than purchased. Monthly rental claims require this modifier on HCPCS equipment codes." },
  { mod:"97", desc:"Rehabilitative services", payer:"Medicare", rule:"Distinguishes rehabilitative therapy (goals aimed at improving function) from maintenance therapy. Required for certain Medicare therapy claims." },
  { mod:"LT", desc:"Left side", payer:"All", rule:"Identifies a procedure performed on the left side of the body. Must match the clinical documentation. Do NOT use with bilateral procedures billed under modifier 50." },
  { mod:"RT", desc:"Right side", payer:"All", rule:"Identifies a procedure performed on the right side of the body. Both LT and RT may appear on the same claim when bilateral work is billed as two line items." },
  { mod:"50", desc:"Bilateral procedure", payer:"All", rule:"Bill as a single line with modifier 50 when the same procedure is performed on both sides. Medicare reimburses at 150% of the single-side rate." },
  { mod:"51", desc:"Multiple procedures", payer:"All", rule:"Append to the second (and subsequent) procedures when multiple distinct procedures are performed at the same session. Some payers apply a reduction (e.g., 50%) to the lower-valued service." },
  { mod:"33", desc:"Preventive service", payer:"Medicare / ACA", rule:"Waives patient cost-sharing when a service that would otherwise carry cost-sharing is rendered as a preventive benefit under the ACA. Common with colonoscopy (G0121) and depression screening." },
  { mod:"AH", desc:"Clinical psychologist", payer:"Medicare / All", rule:"Identifies a licensed clinical psychologist rendering the service. Required by Medicare for psychologist-billed BH services. Higher reimbursement rate than AJ on most Medicare fee schedules." },
  { mod:"AJ", desc:"Clinical social worker", payer:"Medicare / All", rule:"Identifies a licensed clinical social worker. Required on Medicare BH claims. Reimbursed at 75% of the psychologist rate for most codes." },
  { mod:"SA", desc:"Nurse practitioner rendering service in collaboration with physician", payer:"Medicare / All", rule:"Use when an NP provides the service. Some payers require this to distinguish NP from MD billing. Check payer-specific requirements." },
  { mod:"GQ", desc:"Via asynchronous telecommunications system (store-and-forward)", payer:"Medicare", rule:"For telehealth services transmitted as stored data (e.g., dermatology photo review). Allowed only in federally designated telehealth demonstration programs." },
  { mod:"77", desc:"Repeat procedure by different physician on same day", payer:"All", rule:"Use when a different provider repeats the same procedure on the same date. Pair with supporting documentation." },
];

// Returns Learning Center entries that match the codes/modifiers on a given claim.
function getProTips(codesStr) {
  if (!codesStr || codesStr === "—") return { codes: [], mods: [] };
  const tokens = codesStr.toUpperCase().replace(/[×x·]/g, " ").split(/[\s,+]+/).filter(tok => /^[A-Z0-9.]+$/.test(tok));
  const codeTips = LEARN_CODES.filter(c => tokens.includes(c.code.toUpperCase()) && c.notes && c.notes.length > 3);
  const modTips = LEARN_MODS.filter(m => tokens.includes(m.mod.toUpperCase()));
  return { codes: codeTips, mods: modTips };
}

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
  { cat:"pr", title:"Inmediata Health Group (Clearinghouse)", desc:"Camara de compensacion primaria de PR. EDI 837/835, verificacion de elegibilidad, estado de reclamos.", url:"https://www.inmediatahealth.com" },
  { cat:"cms", title:"CMS Medicare Physician Fee Schedule (MPFS)", desc:"Annual fee schedule with RVUs and GPCI adjustments by locality — includes Puerto Rico (Locality 40).", url:"https://www.cms.gov/medicare/payment/fee-schedules/physician" },
  { cat:"cms", title:"CMS Local Coverage Determinations (LCD) Search", desc:"Search LCDs by MAC (FCSO Jurisdiction N for PR) to find coverage policies for specific procedures and diagnoses.", url:"https://www.cms.gov/medicare-coverage-database/search.aspx" },
  { cat:"cms", title:"CMS National Coverage Determinations (NCD)", desc:"Federal coverage policies that apply to all Medicare contractors including Puerto Rico.", url:"https://www.cms.gov/medicare-coverage-database/search.aspx" },
  { cat:"cms", title:"FCSO — First Coast Service Options (Jurisdiction N)", desc:"PR Medicare MAC. Provider education, claim status, LCD library, and enrollment information for Puerto Rico.", url:"https://www.fcso.com" },
  { cat:"cms", title:"CMS EPSDT / Medicaid for Children", desc:"Federal guidance on Early and Periodic Screening, Diagnostic, and Treatment benefit for Medicaid members under 21.", url:"https://www.medicaid.gov/medicaid/benefits/epsdt/index.html" },
  { cat:"cms", title:"CMS Managed Care (42 CFR Part 438)", desc:"Federal regulations governing Medicaid managed care organizations — the framework for ASES GHP/Mi Salud contracts.", url:"https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-C/part-438" },
  { cat:"cms", title:"CMS Telehealth Services — Medicare Fact Sheet", desc:"Current list of telehealth-eligible CPT/HCPCS codes, originating site rules, and modifier requirements under Medicare.", url:"https://www.cms.gov/medicare/coverage/telehealth" },
  { cat:"pr", title:"ASES — Mi Salud Provider Portal", desc:"Portal para proveedores de Mi Salud. Verificacion de elegibilidad, autorizaciones, manuales y fee schedule ASES.", url:"https://www.ases.pr.gov/proveedores" },
  { cat:"pr", title:"ASSMCA — Administracion de Servicios de Salud Mental", desc:"Ente rector de los servicios de salud mental y uso de sustancias en PR (Ley 408-2000). Reglamentos y formularios.", url:"https://www.assmca.pr.gov" },
  { cat:"pr", title:"OCS — Oficina del Comisionado de Seguros PR", desc:"Regula los seguros privados en PR. Quejas de pago puntual, denegaciones improcedentes y certificacion de planes.", url:"https://www.ocs.pr.gov" },
  { cat:"pr", title:"Molina Healthcare Puerto Rico", desc:"Molina exited Puerto Rico; for historical or network verification purposes, contact ASES to confirm current MCO roster.", url:"https://www.ases.pr.gov" },
  { cat:"pr", title:"Assertus Health — RCM y Facturacion", desc:"Plataforma de gestion del ciclo de ingresos (RCM) utilizada por practicas medicas en Puerto Rico.", url:"https://www.assertushealth.com" },
  { cat:"pr", title:"PR Medicaid MMIS — Eligibility Verification", desc:"Sistema de informacion de gestion de Medicaid de PR. Verificacion de elegibilidad en tiempo real para proveedores.", url:"https://www.medicaid.pr.gov" },
];

const TYPE_COLOR = { "ICD-10": ["#7C3AED", "#EDE9FE"], "CPT": ["#2563EB", "#DBEAFE"], "HCPCS": ["#0D9488", "#CCFBF1"] };

const fmt = (n) => "$" + n.toLocaleString("en-US");

// ── Notification panel ────────────────────────────────────────────────────────
const DAYS_TO_RENEW = 7; // demo: subscription renews in 7 days

function NotifPanel({ t, lang, role, onClose }) {
  const [readIds, setReadIds] = useState(new Set());
  const mark = (id) => setReadIds(p => new Set([...p, id]));
  const markAll = () => setReadIds(new Set(["sub", "claims", "update"]));
  const isEn = lang === "en";

  const notifs = [
    ...(role === "manager" ? [{
      id: "sub",
      icon: ReceiptText,
      color: DAYS_TO_RENEW <= 7 ? C.amber : C.teal,
      bg:    DAYS_TO_RENEW <= 7 ? C.amberSoft : C.tealSoft,
      title: isEn ? `Subscription renews in ${DAYS_TO_RENEW} days` : `Suscripción renueva en ${DAYS_TO_RENEW} días`,
      body:  isEn ? "RevenueMD Professional · $299/month. Verify your payment method is current before the renewal date." : "RevenueMD Professional · $299/mes. Verifica que tu método de pago esté vigente antes del vencimiento.",
      date:  isEn ? "Today" : "Hoy",
      cta:   isEn ? "Manage billing" : "Gestionar facturación",
    }] : []),
    {
      id: "claims",
      icon: ClipboardList,
      color: C.red, bg: C.redSoft,
      title: isEn ? "14 claims need attention" : "14 reclamos necesitan atención",
      body:  isEn ? "Today's batch has 14 claims in 'Needs work' — $8,200 at risk before timely-filing closes." : "El lote de hoy tiene 14 reclamos en 'Requiere trabajo' — $8,200 en riesgo.",
      date:  isEn ? "Today" : "Hoy",
      cta:   isEn ? "Review queue" : "Ver cola",
    },
    {
      id: "update",
      icon: Info,
      color: C.blue, bg: C.blueSoft,
      title: isEn ? "Plan Vital updated prior auth list" : "Plan Vital actualizó la lista de auth",
      body:  isEn ? "ASES updated prior authorization requirements effective June 1, 2026. Review Payer Intelligence." : "ASES actualizó requisitos de autorización previa desde el 1 de junio. Revisa el módulo de Pagadores.",
      date:  isEn ? "Yesterday" : "Ayer",
      cta:   isEn ? "View payers" : "Ver pagadores",
    },
  ];

  const unread = notifs.filter(n => !readIds.has(n.id));

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8000 }} />
      <div style={{ position: "fixed", top: 68, right: 28, width: 380, background: "#fff", borderRadius: 18, boxShadow: "0 20px 60px -12px rgba(16,36,92,.22), 0 0 0 1px rgba(16,36,92,.08)", zIndex: 8001, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px 13px", borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bell size={15} color={C.ink} />
            <span style={{ fontWeight: 600, fontSize: 14, color: C.ink, fontFamily: FONT_SANS }}>{t.notifTitle}</span>
            {unread.length > 0 && <span style={{ background: C.teal, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "2px 7px" }}>{unread.length}</span>}
          </div>
          <button onClick={markAll} style={{ fontSize: 12, color: C.teal, background: "none", border: "none", cursor: "pointer", fontFamily: FONT_SANS }}>{t.notifMarkAll}</button>
        </div>
        <div style={{ maxHeight: 420, overflow: "auto" }}>
          {notifs.map(n => {
            const read = readIds.has(n.id);
            return (
              <div key={n.id} onClick={() => mark(n.id)} style={{ padding: "14px 20px", borderBottom: `1px solid ${C.lineSoft}`, background: read ? "#fff" : C.paper, cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <n.icon size={16} color={n.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: read ? 500 : 700, fontSize: 13, color: C.ink, lineHeight: 1.3 }}>{n.title}</span>
                      {!read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal, flexShrink: 0, marginTop: 4 }} />}
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: 12.5, color: C.txt2, lineHeight: 1.55 }}>{n.body}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11.5, color: C.txt3 }}>{n.date}</span>
                      <button style={{ fontSize: 12, color: C.teal, background: "none", border: "none", cursor: "pointer", fontFamily: FONT_SANS, fontWeight: 500 }}>{n.cta} →</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Legal modal (Privacy Policy / Terms of Use) ───────────────────────────────
function LegalModal({ type, lang, onClose }) {
  const isEn = lang === "en";
  const docs = {
    privacy: {
      en: {
        title: "Privacy Policy", updated: "Last updated: May 28, 2026",
        sections: [
          { h: "1. Overview", p: "RevenueMD is a pre-submission medical claim scrubbing platform for healthcare providers in Puerto Rico. We take the privacy of protected health information (PHI) and personally identifiable information (PII) seriously. This policy explains what we collect, how we use it, and how we protect it." },
          { h: "2. Information We Collect", p: "We collect: (a) Account information you provide at registration — name, email, organization. (b) PHI contained in EDI 837 files you upload — patient names, dates of service, diagnosis codes, provider identifiers. (c) Usage data such as log timestamps and feature interactions, which never include raw PHI." },
          { h: "3. How We Use Your Information", p: "PHI is used exclusively to perform claim scrubbing and compliance analysis, and to display results to authorized users in your organization. We do not sell, share, or use PHI for marketing, analytics, or any purpose beyond the services you contracted." },
          { h: "4. HIPAA Business Associate Agreement (BAA)", p: "RevenueMD operates as a HIPAA Business Associate. Before processing real patient data, your organization must execute a signed BAA with RevenueMD. Operating without a BAA is a HIPAA violation. Contact legal@revenuemdpr.com to request a BAA." },
          { h: "5. Data Security", p: "DEMO MODE: The current version of RevenueMD runs as a browser-based demonstration. No PHI is transmitted to or stored on any server in this mode — all data exists only in your browser's memory and is discarded when you close the tab. In a production deployment connected to RevenueMD's backend, all PHI fields are encrypted at rest (AES-256), data in transit is protected by TLS 1.2 or higher, access is controlled by server-enforced role-based authentication with MFA, and tamper-evident audit logs are maintained for all PHI access events. A signed Business Associate Agreement (BAA) is required before any real patient data may be processed." },
          { h: "6. Data Retention", p: "Processed claim records are retained for a minimum of 6 years per HIPAA requirements (45 CFR §164.530(j)). You may request deletion of your account data at any time; PHI will be purged within 30 days of termination, except where law requires otherwise." },
          { h: "7. Your Rights", p: "Under HIPAA and PR Act 194-2000, patients have rights to access and amend their PHI. As the covered entity, your organization is responsible for fulfilling patient rights requests. RevenueMD will cooperate to the extent technically feasible." },
          { h: "8. Contact", p: "Questions? Contact our Privacy Officer at privacy@revenuemdpr.com or write to RevenueMD, 100 Gran Bulevar Paseos, Suite 112, San Juan, PR 00926." },
        ],
      },
      es: {
        title: "Política de Privacidad", updated: "Última actualización: 28 de mayo de 2026",
        sections: [
          { h: "1. Visión general", p: "RevenueMD es una plataforma de revisión previa de reclamos médicos para proveedores de salud en Puerto Rico. Nos tomamos en serio la privacidad de la información de salud protegida (PHI) y la información personalmente identificable (PII). Esta política explica qué recopilamos, cómo lo usamos y cómo lo protegemos." },
          { h: "2. Información que recopilamos", p: "Recopilamos: (a) Información de cuenta al registrarse — nombre, correo, organización. (b) PHI en archivos EDI 837 que cargue — nombres de pacientes, fechas de servicio, códigos de diagnóstico, identificadores de proveedores. (c) Datos de uso como marcas de tiempo, que nunca incluyen PHI directa." },
          { h: "3. Cómo usamos su información", p: "La PHI se usa exclusivamente para realizar la revisión de reclamos y análisis de cumplimiento, y para mostrar resultados a usuarios autorizados. No vendemos, compartimos ni usamos PHI para mercadeo, analítica ni ningún propósito más allá de los servicios contratados." },
          { h: "4. Acuerdo de Asociado de Negocio HIPAA (BAA)", p: "RevenueMD opera como Asociado de Negocio bajo HIPAA. Antes de procesar datos reales de pacientes, su organización debe firmar un BAA con RevenueMD. Operar sin BAA es una violación de HIPAA. Contacte legal@revenuemdpr.com para solicitar un BAA." },
          { h: "5. Seguridad de datos", p: "MODO DEMO: La versión actual de RevenueMD funciona como una demostración en el navegador. Ningún PHI se transmite ni almacena en ningún servidor en este modo — todos los datos existen solo en la memoria de su navegador y se descartan al cerrar la pestaña. En un despliegue de producción conectado al backend de RevenueMD, todos los campos de PHI están encriptados en reposo (AES-256), los datos en tránsito están protegidos por TLS 1.2 o superior, el acceso está controlado por autenticación basada en roles con MFA aplicada por el servidor, y se mantienen registros de auditoría a prueba de manipulaciones para todos los eventos de acceso a PHI. Se requiere un Acuerdo de Asociado de Negocio (BAA) firmado antes de que se pueda procesar cualquier dato real de pacientes." },
          { h: "6. Retención de datos", p: "Los registros de reclamos se retienen por un mínimo de 6 años según HIPAA (45 CFR §164.530(j)). Puede solicitar la eliminación de sus datos en cualquier momento; la PHI será eliminada en 30 días de la terminación, excepto donde la ley lo requiera." },
          { h: "7. Sus derechos", p: "Bajo HIPAA y la Ley 194-2000 de PR, los pacientes tienen derechos de acceso y enmienda de su PHI. Su organización es responsable de atender dichas solicitudes. RevenueMD cooperará en la medida técnicamente factible." },
          { h: "8. Contacto", p: "¿Preguntas? Contacte a nuestro Oficial de Privacidad en privacy@revenuemdpr.com o escriba a RevenueMD, 100 Gran Bulevar Paseos, Suite 112, San Juan, PR 00926." },
        ],
      },
    },
    terms: {
      en: {
        title: "Terms of Use", updated: "Last updated: May 28, 2026",
        sections: [
          { h: "1. Acceptance of Terms", p: "By accessing or using RevenueMD, you agree to these Terms of Use and our Privacy Policy. If you do not agree, do not use the Service. These terms apply to all users — coders/billers and managers — at subscribing organizations." },
          { h: "2. Service Description", p: "RevenueMD analyzes EDI 837 claim files for payer-specific rule violations, documentation gaps, and coding errors before claims are sent to a clearinghouse. RevenueMD does NOT submit claims to payers or clearinghouses — that remains your organization's responsibility." },
          { h: "3. Authorized Use Only", p: "The Service is licensed to healthcare provider organizations in Puerto Rico. You must be an authorized representative or employee of a subscribing organization. Sharing credentials, reverse engineering, or reselling the Service is prohibited." },
          { h: "4. HIPAA Compliance Obligations", p: "You agree to execute a BAA with RevenueMD before uploading real patient data. You are responsible for ensuring your use complies with HIPAA, HITECH, PR Act 194-2000, and all applicable federal and Puerto Rico healthcare regulations." },
          { h: "5. AI & Rules Engine Disclaimer", p: "RevenueMD's AI and rules engine provide decision support only. All claims must be reviewed and approved by a licensed human professional before submission. RevenueMD is not responsible for denied claims or audit findings arising from reliance on automated outputs without human review." },
          { h: "6. Subscription & Billing", p: "Subscriptions are billed monthly or annually in advance. Failure to pay within 10 days of the renewal date may result in suspension of access. Refunds are not provided for partial months. Prices may change with 30 days' written notice." },
          { h: "7. Limitation of Liability", p: "To the maximum extent permitted by law, RevenueMD's total liability for any claim shall not exceed fees paid in the 3 months preceding the claim. RevenueMD is not liable for indirect, incidental, or consequential damages, including lost revenue from denied claims." },
          { h: "8. Governing Law", p: "These Terms are governed by the laws of the Commonwealth of Puerto Rico and applicable federal law. Disputes shall be resolved in the courts of San Juan, Puerto Rico." },
        ],
      },
      es: {
        title: "Términos de Uso", updated: "Última actualización: 28 de mayo de 2026",
        sections: [
          { h: "1. Aceptación de términos", p: "Al acceder o usar RevenueMD, usted acepta estos Términos de Uso y nuestra Política de Privacidad. Si no está de acuerdo, no use el Servicio. Estos términos aplican a todos los usuarios — codificadores, facturadores y gerentes." },
          { h: "2. Descripción del servicio", p: "RevenueMD analiza archivos EDI 837 en busca de violaciones de reglas del pagador, brechas de documentación y errores de codificación antes de enviar al clearinghouse. RevenueMD NO somete reclamos a pagadores ni clearinghouses — esa responsabilidad permanece en su organización." },
          { h: "3. Uso autorizado únicamente", p: "El Servicio está licenciado a organizaciones proveedoras de salud en Puerto Rico. Debe ser representante o empleado autorizado de una organización suscriptora. Compartir credenciales, realizar ingeniería inversa o revender el Servicio está prohibido." },
          { h: "4. Obligaciones de cumplimiento HIPAA", p: "Usted acepta firmar un BAA con RevenueMD antes de cargar datos reales de pacientes. Es responsable de garantizar que su uso cumpla con HIPAA, HITECH, la Ley 194-2000 de PR y todas las regulaciones aplicables." },
          { h: "5. Descargo sobre IA y motor de reglas", p: "La IA y el motor de reglas de RevenueMD son herramientas de apoyo a decisiones únicamente. Todos los reclamos deben ser revisados y aprobados por un profesional humano con licencia antes de someterlos. RevenueMD no es responsable por reclamos denegados o hallazgos de auditoría derivados de confiar en salidas automatizadas sin revisión humana." },
          { h: "6. Suscripción y facturación", p: "Las suscripciones se facturan mensual o anualmente por adelantado. El incumplimiento de pago dentro de 10 días de la fecha de renovación puede resultar en suspensión de acceso. No se ofrecen reembolsos por meses parciales. Los precios pueden cambiar con 30 días de aviso escrito." },
          { h: "7. Limitación de responsabilidad", p: "En la máxima medida permitida por la ley, la responsabilidad total de RevenueMD no superará los honorarios pagados en los 3 meses anteriores. RevenueMD no es responsable por daños indirectos o consecuentes, incluyendo ingresos perdidos por reclamos denegados." },
          { h: "8. Ley aplicable", p: "Estos Términos se rigen por las leyes del Estado Libre Asociado de Puerto Rico y la ley federal aplicable. Las disputas se resolverán en los tribunales de San Juan, Puerto Rico." },
        ],
      },
    },
  };
  const doc = docs[type][isEn ? "en" : "es"];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(16,36,92,.68)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 700, maxHeight: "90vh", overflow: "auto", boxShadow: "0 40px 100px -20px rgba(16,36,92,.32)" }}>
        <div style={{ background: `linear-gradient(140deg, ${C.ink} 0%, ${C.ink2} 100%)`, borderRadius: "22px 22px 0 0", padding: "24px 32px 20px", position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ color: "#fff", fontSize: 19, fontFamily: FONT_DISPLAY, fontWeight: 500 }}>Revenue<span style={{ color: C.teal }}>MD</span> — {doc.title}</div>
              <div style={{ color: "rgba(255,255,255,.55)", fontSize: 12, marginTop: 3 }}>{doc.updated}</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, padding: "7px 15px", color: "rgba(255,255,255,.85)", fontSize: 13, cursor: "pointer", fontFamily: FONT_SANS }}>{isEn ? "Close" : "Cerrar"} ✕</button>
          </div>
        </div>
        <div style={{ padding: "28px 32px 40px" }}>
          {doc.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink, marginBottom: 5 }}>{s.h}</div>
              <p style={{ margin: 0, fontSize: 13.5, color: C.txt, lineHeight: 1.72 }}>{s.p}</p>
            </div>
          ))}
          <div style={{ marginTop: 28, padding: "15px 20px", background: C.paper, borderRadius: 12, border: `1px solid ${C.line}` }}>
            <p style={{ margin: 0, fontSize: 12.5, color: C.txt2, lineHeight: 1.6 }}>{isEn ? "This document is provided for informational purposes and does not constitute legal advice. For compliance questions, consult a qualified healthcare attorney familiar with Puerto Rico and federal law." : "Este documento se proporciona con fines informativos y no constituye asesoría legal. Para preguntas de cumplimiento, consulte a un abogado especializado en salud familiar con el derecho de Puerto Rico y federal."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Help modal ────────────────────────────────────────────────────────────────
function HelpModal({ t, lang, onClose }) {
  const steps = [
    { n: 1, icon: Upload, title: t.helpStep1T, desc: t.helpStep1D },
    { n: 2, icon: Layers, title: t.helpStep2T, desc: t.helpStep2D },
    { n: 3, icon: Send,   title: t.helpStep3T, desc: t.helpStep3D },
  ];
  const lanes = [
    { color: C.red,   bg: C.redSoft,   label: t.helpLaneNW, desc: t.helpLaneNWD },
    { color: C.amber, bg: C.amberSoft, label: t.helpLaneQR, desc: t.helpLaneQRD },
    { color: C.teal,  bg: C.tealSoft,  label: t.helpLaneAC, desc: t.helpLaneACD },
  ];
  const metrics = [
    { range: "",      rangeColor: C.red,   icon: AlertTriangle, title: t.helpN1T, desc: t.helpN1D },
    { range: "",      rangeColor: C.teal,  icon: ShieldCheck,   title: t.helpN2T, desc: t.helpN2D },
    { range: "",      rangeColor: C.blue,  icon: FileText,      title: t.helpN3T, desc: t.helpN3D },
    { range: "$",     rangeColor: C.red,   icon: AlertTriangle, title: t.helpN4T, desc: t.helpN4D },
    { range: "$/mo",  rangeColor: C.teal,  icon: TrendingUp,    title: t.helpN5T, desc: t.helpN5D },
    { range: "%",     rangeColor: C.amber, icon: TrendingDown,  title: t.helpN6T, desc: t.helpN6D },
    { range: "%",     rangeColor: C.teal,  icon: CheckCircle2,  title: t.helpN7T, desc: t.helpN7D },
    { range: "$",     rangeColor: C.amber, icon: Lightbulb,     title: t.helpN8T, desc: t.helpN8D },
  ];
  const modules = [
    { icon: LayoutDashboard, color: C.ink,    title: t.helpM1T,  desc: t.helpM1D  },
    { icon: FileScan,        color: C.teal,   title: t.helpM2T,  desc: t.helpM2D  },
    { icon: Layers,          color: C.teal,   title: t.helpM3T,  desc: t.helpM3D  },
    { icon: ClipboardList,   color: C.blue,   title: t.helpM4T,  desc: t.helpM4D  },
    { icon: Brain,           color: C.purple, title: t.helpM5T,  desc: t.helpM5D  },
    { icon: Building2,       color: C.ink2,   title: t.helpM6T,  desc: t.helpM6D  },
    { icon: ShieldCheck,     color: C.teal,   title: t.helpM7T,  desc: t.helpM7D  },
    { icon: ReceiptText,     color: C.red,    title: t.helpM8T,  desc: t.helpM8D  },
    { icon: BarChart3,       color: C.amber,  title: t.helpM9T,  desc: t.helpM9D  },
    { icon: GraduationCap,   color: C.blue,   title: t.helpM10T, desc: t.helpM10D },
  ];
  const rules = [
    { icon: Send,        text: t.helpR1 },
    { icon: Brain,       text: t.helpR2 },
    { icon: ShieldCheck, text: t.helpR3 },
  ];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(16,36,92,.68)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", backdropFilter: "blur(4px)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 22, width: "100%", maxWidth: 800, maxHeight: "90vh", overflow: "auto", boxShadow: "0 40px 100px -20px rgba(16,36,92,.32)" }}>
        {/* sticky header */}
        <div style={{ background: `linear-gradient(140deg, ${C.ink} 0%, ${C.ink2} 100%)`, borderRadius: "22px 22px 0 0", padding: "26px 32px 22px", position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px -6px rgba(22,182,201,.6)", flexShrink: 0 }}><LogoMark size={22} color="#fff" /></div>
              <div>
                <div style={{ color: "#fff", fontSize: 19, fontFamily: FONT_DISPLAY, fontWeight: 500, lineHeight: 1.2 }}>Revenue<span style={{ color: C.teal }}>MD</span> <span style={{ fontWeight: 300, opacity: .75 }}>— {t.helpTitle}</span></div>
                <div style={{ color: "rgba(255,255,255,.58)", fontSize: 12.5, marginTop: 3 }}>{t.helpSub}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ flexShrink: 0, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 10, padding: "7px 15px", color: "rgba(255,255,255,.85)", fontSize: 13, cursor: "pointer", fontFamily: FONT_SANS, display: "flex", alignItems: "center", gap: 6 }}>{t.helpClose} <span style={{ opacity: .7 }}>✕</span></button>
          </div>
        </div>
        <div style={{ padding: "30px 32px 40px" }}>
          {/* ── Quick start ── */}
          <div style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <Zap size={17} color={C.teal} />
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.ink, margin: 0, fontWeight: 500 }}>{lang === "en" ? "Get started in 3 steps" : "Empieza en 3 pasos"}</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ background: C.paper, border: `1.5px solid ${C.line}`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.teal, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                    <s.icon size={15} color={C.teal} />
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: C.ink }}>{s.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: C.txt2, lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* ── Triage lanes ── */}
          <div style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <Target size={17} color={C.ink} />
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.ink, margin: 0, fontWeight: 500 }}>{t.helpLanesT}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {lanes.map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: l.bg, border: `1.5px solid ${l.color}30`, borderRadius: 12, padding: "13px 18px" }}>
                  <div style={{ width: 11, height: 11, borderRadius: "50%", background: l.color, flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: l.color }}>{l.label} — </span>
                    <span style={{ fontSize: 13.5, color: C.txt, lineHeight: 1.6 }}>{l.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ── Numbers & metrics ── */}
          <div style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <BarChart3 size={17} color={C.ink} />
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.ink, margin: 0, fontWeight: 500 }}>{t.helpNumsT}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {metrics.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: C.paper2, border: `1.5px solid ${C.line}`, borderRadius: 13, padding: "15px 18px" }}>
                  {/* score badge */}
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 46 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: m.rangeColor + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <m.icon size={17} color={m.rangeColor} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: m.rangeColor, letterSpacing: ".3px", textAlign: "center", lineHeight: 1.2 }}>{m.range}</span>
                  </div>
                  {/* text */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.ink, marginBottom: 5 }}>{m.title}</div>
                    <p style={{ margin: 0, fontSize: 13, color: C.txt2, lineHeight: 1.65 }}>{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ── Module cards ── */}
          <div style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <LayoutDashboard size={17} color={C.ink} />
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.ink, margin: 0, fontWeight: 500 }}>{t.helpModsT}</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(218px,1fr))", gap: 11 }}>
              {modules.map((m, i) => (
                <div key={i} style={{ background: C.paper2, border: `1.5px solid ${C.line}`, borderRadius: 13, padding: "15px 17px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: m.color + "1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><m.icon size={15} color={m.color} /></div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: C.ink }}>{m.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, color: C.txt2, lineHeight: 1.62 }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* ── Key rules ── */}
          <div style={{ background: `linear-gradient(135deg, ${C.tealSoft} 0%, ${C.paper} 100%)`, border: `1.5px solid ${C.tealMute}`, borderRadius: 16, padding: "22px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <ShieldCheck size={17} color={C.teal} />
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: C.ink, margin: 0, fontWeight: 500 }}>{t.helpRulesT}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {rules.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: C.teal + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><r.icon size={14} color={C.tealDk} /></div>
                  <p style={{ margin: 0, fontSize: 13.5, color: C.txt, lineHeight: 1.65, paddingTop: 4 }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const SEV = { error: { c: C.red, bg: C.redSoft, icon: AlertTriangle }, warning: { c: C.amber, bg: C.amberSoft, icon: FileWarning }, info: { c: C.blue, bg: C.blueSoft, icon: Lightbulb } };
const VB = { statutory: { c: C.teal, bg: C.tealSoft, icon: Scale }, published: { c: C.blue, bg: C.blueSoft, icon: BookOpen }, needs: { c: C.amber, bg: C.amberSoft, icon: CircleAlert } };
const rc = (r) => (r >= 60 ? C.red : r >= 30 ? C.amber : C.teal);
const rbg = (r) => (r >= 60 ? C.redSoft : r >= 30 ? C.amberSoft : C.tealSoft);
const SCAN = ["Reading document", "Detecting language", "Parsing codes"];

export default function App({ auth0 = null }) {
  const winW = useWindowWidth();
  const isMobile = winW < 768;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [authed, setAuthed] = useState(false);
  const [accessToken, setAccessToken] = useState("");
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
  const [importError, setImportError] = useState(null);
  const [batchLoaded, setBatchLoaded] = useState(false);
  const [batchReading, setBatchReading] = useState(false);
  const [batchMeta, setBatchMeta] = useState(null);    // { total, auto_clear, needs_attention, at_risk }
  const batchFileRef = useRef(null);
  const intakeFileRef = useRef(null);
  const uploadBatchFileRef = useRef(null);
  const [batchQueue, setBatchQueue] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [claims, setClaims] = useState(CLAIMS_DEMO);
  const [csvDrag, setCsvDrag] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvResult, setCsvResult] = useState(null);
  const [learnTab, setLearnTab] = useState("codes");
  const [learnSearch, setLearnSearch] = useState("");
  const [learnTypeFilter, setLearnTypeFilter] = useState("all");
  const [learnExpanded, setLearnExpanded] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifSeen, setNotifSeen] = useState(false);
  const [legalModal, setLegalModal] = useState(null); // null | "privacy" | "terms"
  const [subscribeModal, setSubscribeModal] = useState(null); // null | plan object
  const [subBillingAnn, setSubBillingAnn] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);
  const [accentKey, setAccentKey] = useState("teal");
  const [userProfile, setUserProfile] = useState({ firstName: "Demo", lastName: "User", email: "demo@clinicapr.com", avatarColor: "teal" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [notifPrefs, setNotifPrefs] = useState({ subscription: true, claims: true, payers: true, email: false });
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaved, setPwdSaved] = useState(false);
  const [totpStep, setTotpStep] = useState("idle"); // idle | setup | enabled
  const [totpCode, setTotpCode] = useState("");
  const [totpCopied, setTotpCopied] = useState(false);
  const [emailAuthStep, setEmailAuthStep] = useState("idle"); // idle | sent | enabled
  const [emailAuthCode, setEmailAuthCode] = useState("");
  const [baaConfirmed, setBaaConfirmed] = useState(false);
  const [baaModalFile, setBaaModalFile] = useState(null); // { file, target: "csv"|"batch" }
  const [TOTP_SECRET] = useState(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * 32)]).join("");
  });
  const acc = THEMES[accentKey] || THEMES.teal;
  const notifBadge = notifSeen ? 0 : role === "manager" ? 2 : 1;
  const t = T[lang];

  useEffect(() => { setMounted(true); }, []);

  // Auto-authenticate when Auth0 confirms the user is logged in, then grab an access token
  useEffect(() => {
    if (!auth0?.isAuthenticated) return;
    if (!authed) setAuthed(true);
    if (auth0.getAccessTokenSilently) {
      const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
      auth0.getAccessTokenSilently(audience ? { authorizationParams: { audience } } : {})
        .then(setAccessToken)
        .catch(() => {});
    }
  }, [auth0?.isAuthenticated]);

  // Helper: returns Authorization header when a token is available
  const authHeaders = () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {});

  // After login: check BAA status, then reload the most recent batch
  useEffect(() => {
    if (!authed || !API_URL || batchLoaded) return;
    if (auth0?.isAuthenticated && !accessToken) return; // wait for token
    // Check BAA acceptance (only meaningful when auth is enabled)
    if (accessToken) {
      fetch(`${API_URL}/api/baa/status`, { headers: authHeaders() })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data && !data.accepted) setBaaModalFile({ file: null, target: "login" });
          else if (data && data.accepted) setBaaConfirmed(true);
        })
        .catch(() => {});
    }
    fetch(`${API_URL}/api/batches`, { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((batches) => {
        if (!batches || !batches.length) return;
        const latest = batches[0];
        return fetch(`${API_URL}/api/batches/${latest.id}`, { headers: authHeaders() }).then((r) => r.ok ? r.json() : null);
      })
      .then((data) => {
        if (!data || !data.claims || !data.claims.length) return;
        setBatchQueue(data.claims.map((c) => ({ ...c, sel: false })));
        setBatchMeta({ total: data.total, auto_clear: data.auto_clear, needs_attention: data.needs_attention, at_risk: data.at_risk });
        setBatchLoaded(true);
      })
      .catch(() => { /* no API — demo mode, batch stays seeded locally */ });
  }, [authed, accessToken]);

  // Parse a codes string like "90837 GT + H0004 ×8" into service_lines array
  // so the backend rules engine can inspect individual CPT codes and modifiers.
  const buildServiceLines = (codesStr) => {
    if (!codesStr || codesStr === "—") return [];
    return codesStr.split(/[,+]/).map((part) => {
      part = part.trim();
      if (!part) return null;
      let units = 1;
      const um = part.match(/[×xX*](\d+)/);
      if (um) { units = parseInt(um[1]); part = part.slice(0, um.index).trim(); }
      const tokens = part.split(/\s+/);
      const cpt = (tokens[0] || "").toUpperCase();
      const mods = tokens.slice(1).filter((t) => /^[A-Z0-9]{2}$/.test(t.toUpperCase())).map((t) => t.toUpperCase());
      return cpt ? { cpt, mods, units, charge: 0 } : null;
    }).filter(Boolean);
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    return lines.slice(1).map((line, i) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
      const codes = row.codes || row.cpt || row.procedure_code || "—";
      return {
        id: row.id || `CSV-${Date.now()}-${i}`,
        patient: row.patient || row.patient_name || `Patient #${1000 + i}`,
        codes,
        payer: row.payer || row.insurance || "Unknown",
        provider: row.provider || row.rendering_provider || "—",
        npi: row.npi || row.rendering_npi || "",
        dos: row.dos || row.date_of_service || row.service_date || "—",
        auth: row.auth || row.authorization || "",
        pos: row.pos || row.place_of_service || "11",
        diagnosis: row.diagnosis || row.icd10 || row.dx || "",
        member_id: row.member_id || row.subscriber_id || "",
        risk: parseInt(row.risk) || 50,
        status: row.status || "pending",
        billed: parseFloat(row.billed || row.billed_amount || 0),
        val: parseFloat(row.billed || row.billed_amount || 0),
        comp: parseInt(row.compliance) || 70,
        doc: parseInt(row.documentation) || 70,
        service_lines: buildServiceLines(codes),
        sEn: "Imported claim — run AI analysis for a full risk assessment.",
        sEs: "Reclamo importado — ejecuta el análisis IA para una evaluación completa.",
        issues: [], fix: [],
      };
    }).filter((c) => c.id);
  };

  const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
  const handleCSVFile = (file) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) { setCsvResult({ error: true, name: file.name, sizeErr: true }); return; }
    if (!baaConfirmed) { setBaaModalFile({ file, target: "csv" }); return; }
    setCsvImporting(true); setCsvResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        const parsed = parseCSV(e.target.result);
        if (parsed.length) { setClaims((prev) => [...parsed, ...prev]); setCsvResult({ count: parsed.length, name: file.name }); }
        else { setCsvResult({ error: true, name: file.name }); }
        setCsvImporting(false);
      }, 900);
    };
    reader.readAsText(file);
  };

  const filtered = useMemo(() => claims.filter((c) => (filter === "all" || (filter === "high" ? c.risk >= 60 : c.status === filter)) && (!search || c.id.toLowerCase().includes(search.toLowerCase()) || c.codes.toLowerCase().includes(search.toLowerCase()))), [filter, search, claims]);
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
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row", fontFamily: FONT_SANS, background: C.ink }}>
        {FONTS}
        {/* left brand panel — hidden on mobile */}
        <div style={{ flex: 1, background: `linear-gradient(155deg, ${C.ink} 0%, ${C.ink2} 100%)`, padding: isMobile ? "32px 28px 24px" : "56px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", ...(isMobile ? { minHeight: 180 } : {}) }}>
          <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,140,107,.18), transparent 70%)", top: -120, right: -160 }} />
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,75,.10), transparent 70%)", bottom: -80, left: -100 }} />
          <div className="rise" style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
            <div style={{ width: 68, height: 68, borderRadius: 18, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 32px -8px rgba(14,140,107,.65)" }}><LogoMark size={36} color="#fff" /></div>
            <div style={{ color: "#fff", fontSize: 30, fontWeight: 400, fontFamily: FONT_DISPLAY, letterSpacing: ".5px" }}>Revenue<span style={{ color: C.teal }}>MD</span></div>
          </div>
          {/* stethoscope silhouette — login panel */}
          <div style={{ position: "absolute", bottom: -60, right: -60, opacity: .06, pointerEvents: "none", lineHeight: 0 }}><LogoMark size={420} color="#fff" /></div>
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
        <div style={{ width: isMobile ? "100%" : 460, background: C.paper2, display: "flex", flexDirection: "column", justifyContent: "center", padding: isMobile ? "32px 24px 40px" : "0 52px" }}>
          <div className="rise" style={{ animationDelay: ".12s" }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 27, fontWeight: 500, margin: "0 0 6px", color: C.ink }}>{lang === "en" ? "Welcome back" : "Bienvenido"}</h2>
            <p style={{ color: C.txt2, fontSize: 14, margin: "0 0 30px" }}>{auth0 ? (lang === "en" ? "Sign in with your organization account" : "Inicia sesión con tu cuenta organizacional") : t.demoNote}</p>
            {!auth0 && <>
              <Lbl>{t.email}</Lbl><input defaultValue="demo@clinicapr.com" style={inp} />
              <Lbl mt>{t.password}</Lbl><input type="password" defaultValue="demo1234" style={inp} />
            </>}
            <Lbl mt>{t.role}</Lbl>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={inp}>
              <option value="coder">{t.coder}</option><option value="manager">{t.manager}</option>
            </select>
            <button className="btnp" onClick={() => auth0 ? auth0.loginWithRedirect() : setAuthed(true)} style={{ ...btnP, width: "100%", marginTop: 26, justifyContent: "center", padding: "13px", fontSize: 14.5 }}>{auth0 && auth0.isLoading ? <Loader2 size={17} className="spin" /> : <>{t.signIn} <ArrowRight size={17} /></>}</button>
            <button onClick={() => setLang(lang === "en" ? "es" : "en")} style={{ ...btnG, margin: "20px auto 0", display: "flex" }}><Languages size={15} /> {lang === "en" ? "Español" : "English"}</button>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 18 }}>
              <button onClick={() => setLegalModal("privacy")} style={{ fontSize: 12, color: C.txt3, background: "none", border: "none", cursor: "pointer", fontFamily: FONT_SANS }}>{t.privacyLink}</button>
              <span style={{ color: C.txt3, fontSize: 12 }}>·</span>
              <button onClick={() => setLegalModal("terms")} style={{ fontSize: 12, color: C.txt3, background: "none", border: "none", cursor: "pointer", fontFamily: FONT_SANS }}>{t.termsLink}</button>
            </div>
          </div>
        </div>
        {legalModal && <LegalModal type={legalModal} lang={lang} onClose={() => setLegalModal(null)} />}
      </div>
    );
  }

  const nav = [
    { id: "dash",       icon: LayoutDashboard, label: t.nav_dash },       // 1 — daily health check
    { id: "batch",      icon: Layers,          label: t.nav_batch },      // 2 — primary daily workspace
    { id: "intake",     icon: FileScan,        label: t.nav_intake },     // 3 — import new claims
    { id: "claims",     icon: ClipboardList,   label: t.nav_claims },     // 4 — individual claim work

    { id: "denials",    icon: ReceiptText,     label: t.nav_denials },    // 6 — denial tracking & appeals
    { id: "payers",     icon: Building2,       label: t.nav_payers },     // 7 — payer rules reference
    { id: "learn",      icon: GraduationCap,   label: t.nav_learn },      // 8 — code lookup reference
    { id: "compliance", icon: ShieldCheck,     label: t.nav_compliance }, // 9 — regulatory reference
    ...(role === "manager" ? [
      { id: "revenue",      icon: BarChart3,  label: t.nav_revenue },
      { id: "business",     icon: Briefcase,  label: t.nav_business },
      { id: "subscription", icon: CreditCard, label: t.nav_sub },
    ] : []),
    { id: "settings", icon: Settings, label: t.nav_settings },
  ];

  // Mobile: only managers see the platform; only business sections shown
  const MOBILE_TABS = new Set(["dash", "revenue", "business", "subscription", "settings"]);
  const visibleNav = isMobile ? nav.filter(n => MOBILE_TABS.has(n.id)) : nav;

  // Coder/Biller on mobile → desktop-only screen
  if (isMobile && role !== "manager") {
    return (
      <div style={{ minHeight: "100vh", background: C.ink, fontFamily: FONT_SANS, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center" }}>
        {FONTS}
        <div style={{ width: 72, height: 72, borderRadius: 22, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, boxShadow: `0 12px 36px -8px ${C.teal}88` }}>
          <LogoMark size={36} color="#fff" />
        </div>
        <div style={{ color: "#fff", fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 400, marginBottom: 12 }}>Revenue<span style={{ color: C.teal }}>MD</span></div>
        <div style={{ color: "rgba(255,255,255,.92)", fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{t.mobileManagerOnly}</div>
        <div style={{ color: "rgba(255,255,255,.6)", fontSize: 14, lineHeight: 1.65, maxWidth: 320, marginBottom: 32 }}>{t.mobileManagerOnlySub}</div>
        <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 16, padding: "16px 20px", marginBottom: 28, maxWidth: 320, width: "100%" }}>
          <div style={{ color: "rgba(255,255,255,.5)", fontSize: 12, marginBottom: 4 }}>{lang === "en" ? "Currently signed in as" : "Sesión iniciada como"}</div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{t[role]}</div>
        </div>
        <button onClick={() => { setAuthed(false); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, border: "none", background: C.teal, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: FONT_SANS, marginBottom: 12 }}>
          <LogOut size={16} /> {t.mobileCoderDesk}
        </button>
        <button onClick={() => setLang(lang === "en" ? "es" : "en")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: "transparent", color: "rgba(255,255,255,.5)", fontSize: 13, cursor: "pointer", fontFamily: FONT_SANS }}>
          <Languages size={15} /> {lang === "en" ? "Español" : "English"}
        </button>
      </div>
    );
  }

  const runAnalysis = async (id) => {
    setAnalyzing(true);
    if (API_URL) {
      try {
        const claim = claims.find((x) => x.id === id);
        if (claim) {
          const res = await fetch(`${API_URL}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(claim),
          });
          if (res.ok) {
            const result = await res.json();
            setClaims((prev) => prev.map((x) => x.id === id ? { ...x, ...result } : x));
          }
        }
      } catch (e) {
        console.error("Analysis error:", e);
      }
    } else {
      await new Promise((r) => setTimeout(r, 1300)); // demo delay
    }
    setAnalyzing(false);
    setAnalyzed((p) => ({ ...p, [id]: true }));
  };
  const addSample = () => {
    const f = { id: Date.now() + "", name: "expediente_PV_4452.pdf", status: "scanning", stage: 0, preview: null, isReal: false };
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
      {helpOpen && <HelpModal t={t} lang={lang} onClose={() => setHelpOpen(false)} />}
      {legalModal && <LegalModal type={legalModal} lang={lang} onClose={() => setLegalModal(null)} />}
      {notifOpen && <NotifPanel t={t} lang={lang} role={role} onClose={() => setNotifOpen(false)} />}
      {/* BAA warning modal — fires before any PHI file upload */}
      {baaModalFile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(16,36,92,.65)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, backdropFilter: "blur(3px)" }}>
          <div className="rise" style={{ background: C.paper2, borderRadius: 22, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 32px 80px -16px rgba(16,36,92,.4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF3CD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><ShieldCheck size={24} color="#B45309" /></div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, color: C.ink, fontWeight: 600 }}>
                {lang === "en" ? "HIPAA BAA Required" : "Se requiere BAA HIPAA"}
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.txt2, lineHeight: 1.65, marginBottom: 20 }}>
              {lang === "en"
                ? "You are about to upload a file that may contain Protected Health Information (PHI). Under HIPAA, a signed Business Associate Agreement (BAA) with RevenueMD must be in place before processing real patient data."
                : "Está a punto de subir un archivo que puede contener Información de Salud Protegida (PHI). Bajo HIPAA, debe existir un Acuerdo de Asociado de Negocio (BAA) firmado con RevenueMD antes de procesar datos reales de pacientes."}
            </p>
            <div style={{ background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: 10, padding: "12px 16px", marginBottom: 22, fontSize: 13, color: "#92400E" }}>
              {lang === "en"
                ? "⚠️ This is a DEMO environment. Do NOT upload real patient data unless your organization has executed a BAA with RevenueMD (legal@revenuemdpr.com)."
                : "⚠️ Este es un entorno DEMO. NO suba datos reales de pacientes a menos que su organización haya ejecutado un BAA con RevenueMD (legal@revenuemdpr.com)."}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => {
                setBaaModalFile(null);
                if (baaModalFile?.target === "login") {
                  setAuthed(false);
                  if (auth0?.logout) auth0.logout({ logoutParams: { returnTo: window.location.origin } });
                }
              }} style={{ padding: "10px 22px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", color: C.txt2, fontSize: 14, cursor: "pointer", fontFamily: FONT_SANS }}>
                {lang === "en" ? "Cancel" : "Cancelar"}
              </button>
              <button onClick={() => {
                const pending = baaModalFile;
                setBaaConfirmed(true);
                setBaaModalFile(null);
                if (pending.target === "login") {
                  // Record acceptance in the backend
                  if (API_URL && accessToken) {
                    fetch(`${API_URL}/api/baa/accept`, { method: "POST", headers: authHeaders() }).catch(() => {});
                  }
                } else if (pending.target === "csv") {
                  handleCSVFile(pending.file);
                } else if (pending.target === "batch" && uploadBatchFileRef.current) {
                  uploadBatchFileRef.current(pending.file);
                }
              }} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "#B45309", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT_SANS }}>
                {lang === "en" ? "I confirm — proceed" : "Confirmo — continuar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(16,36,92,.45)", zIndex: 900, backdropFilter: "blur(2px)" }} />}
      {subscribeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(16,36,92,.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setSubscribeModal(null)}>
          <div onClick={e => e.stopPropagation()} className="rise" style={{ background: C.paper2, borderRadius: 22, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 32px 80px -16px rgba(16,36,92,.35)" }}>
            {subSuccess ? (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><BadgeCheck size={30} color={C.tealDk} /></div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 500, color: C.ink, marginBottom: 8 }}>{lang === "en" ? "You're subscribed!" : "¡Suscripción activa!"}</div>
                <div style={{ fontSize: 14, color: C.txt2, lineHeight: 1.6, marginBottom: 24 }}>{lang === "en" ? `Welcome to RevenueMD ${subscribeModal.name}. A confirmation email is on its way.` : `Bienvenido a RevenueMD ${subscribeModal.name}. Un email de confirmación está en camino.`}</div>
                <button onClick={() => setSubscribeModal(null)} style={{ ...btnP, margin: "0 auto", padding: "10px 28px" }}>{lang === "en" ? "Close" : "Cerrar"}</button>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: subscribeModal.popular ? C.tealSoft : C.blueSoft, display: "flex", alignItems: "center", justifyContent: "center" }}><CreditCard size={20} color={subscribeModal.popular ? C.tealDk : C.blue} /></div>
                  <div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 500, color: C.ink }}>{t.subModalTitle}</div>
                    <div style={{ fontSize: 13, color: C.txt2 }}>RevenueMD {subscribeModal.name}</div>
                  </div>
                </div>
                <div style={{ background: subscribeModal.billingAnn ? C.tealSoft : C.blueSoft, border: `1px solid ${subscribeModal.billingAnn ? C.tealMute : C.line}`, borderRadius: 14, padding: 16, marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink }}>RevenueMD {subscribeModal.name}</div>
                      <div style={{ fontSize: 12, color: C.txt2, marginTop: 2 }}>{subscribeModal.billingAnn ? t.subBillingAnn : t.subBilling}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, color: C.ink }}>${subscribeModal.billingAnn ? subscribeModal.priceAnnual * 12 : subscribeModal.priceMonthly}<span style={{ fontSize: 13, fontWeight: 400, color: C.txt2 }}>{subscribeModal.billingAnn ? t.subPerYear : t.subPerMo}</span></div>
                      {subscribeModal.billingAnn && <div style={{ fontSize: 12, color: C.tealDk, fontWeight: 500 }}>${subscribeModal.priceMonthly - subscribeModal.priceAnnual * 12 / 12 > 0 ? t.subAnnSave : ""} ${((subscribeModal.priceMonthly - subscribeModal.priceAnnual) * 12).toLocaleString()}/yr</div>}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: C.txt2, lineHeight: 1.6, marginBottom: 20 }}>{t.subModalSub}</div>
                <button onClick={() => setSubSuccess(true)} style={{ ...btnP, width: "100%", justifyContent: "center", marginBottom: 10 }}><CreditCard size={15} /> {t.subModalConfirm}</button>
                <button onClick={() => setSubscribeModal(null)} style={{ ...btnG, width: "100%", justifyContent: "center" }}>{t.subModalCancel}</button>
                <div style={{ fontSize: 11.5, color: C.txt3, marginTop: 14, lineHeight: 1.5 }}>{t.subModalNote}</div>
              </>
            )}
          </div>
        </div>
      )}
      {/* SIDEBAR */}
      <aside style={{ width: 236, background: C.ink, padding: "22px 14px", display: "flex", flexDirection: "column", flexShrink: 0, ...(isMobile ? { position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 950, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform .26s cubic-bezier(.2,.8,.2,1)", boxShadow: sidebarOpen ? "6px 0 32px rgba(16,36,92,.35)" : "none" } : { position: "relative" }) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 10px 22px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: acc.hex, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px -6px ${acc.hex}99` }}><LogoMark size={19} color="#fff" /></div>
          <div><div style={{ color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: FONT_DISPLAY }}>Revenue<span style={{ color: C.teal }}>MD</span></div></div>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          {visibleNav.map((n, i) => {
            const a = tab === n.id;
            return <button key={n.id} className="navi rise" onClick={() => { setTab(n.id); setOpenClaim(null); if (isMobile) setSidebarOpen(false); }} style={{ animationDelay: `${i * 0.03}s`, display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13.5, textAlign: "left", width: "100%", background: a ? acc.hex : "transparent", color: a ? "#fff" : "rgba(255,255,255,.62)", fontWeight: a ? 500 : 400, boxShadow: a ? `0 6px 16px -8px ${acc.hex}cc` : "none" }}><n.icon size={17} /> {n.label}</button>;
          })}
        </nav>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 12, marginTop: 12 }}>
          <button className="navi" onClick={() => setLang(lang === "en" ? "es" : "en")} style={sideBtn}><Languages size={15} /> {lang === "en" ? "Español" : "English"}</button>
          <button className="navi" onClick={() => { setAuthed(false); setTab("dash"); if (auth0?.logout) auth0.logout({ logoutParams: { returnTo: window.location.origin } }); }} style={sideBtn}><LogOut size={15} /> {t.logout}</button>
          <div style={{ display: "flex", gap: 10, paddingTop: 10, justifyContent: "center" }}>
            <button onClick={() => setLegalModal("privacy")} style={{ fontSize: 11, color: "rgba(255,255,255,.35)", background: "none", border: "none", cursor: "pointer", fontFamily: FONT_SANS, padding: 0 }}>{t.privacyLink}</button>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)" }}>·</span>
            <button onClick={() => setLegalModal("terms")} style={{ fontSize: 11, color: "rgba(255,255,255,.35)", background: "none", border: "none", cursor: "pointer", fontFamily: FONT_SANS, padding: 0 }}>{t.termsLink}</button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", overflow: "hidden" }}>
        {/* stethoscope silhouette — all app pages */}
        <div style={{ position: "absolute", bottom: -80, right: -80, opacity: .035, pointerEvents: "none", lineHeight: 0, zIndex: 0 }}><LogoMark size={480} color={C.ink} /></div>
        <header style={{ background: C.paper2, borderBottom: `1px solid ${C.line}`, padding: isMobile ? "12px 16px" : "15px 30px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(p => !p)} style={{ width: 36, height: 36, borderRadius: 10, background: C.ink, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {sidebarOpen ? <X size={18} color="#fff" /> : <Menu size={18} color="#fff" />}
              </button>
            )}
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 500, fontFamily: FONT_DISPLAY }}>{nav.find((n) => n.id === tab)?.label}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10 }}>
            {!isMobile && <div className="pill" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: acc.hex, background: acc.soft, padding: "5px 11px", borderRadius: 20, fontWeight: 500 }}><span className="pdot" style={{ width: 7, height: 7, borderRadius: "50%", background: acc.hex }} /> Live</div>}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setNotifOpen(p => !p); setNotifSeen(true); }} style={{ width: 34, height: 34, borderRadius: "50%", background: notifOpen ? C.ink : C.paper, border: `1px solid ${C.line}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <Bell size={15} color={notifOpen ? "#fff" : C.ink} />
                {notifBadge > 0 && <div style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: acc.hex, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{notifBadge}</div>}
              </button>
            </div>
            <button onClick={() => setHelpOpen(true)} className="btnp" style={{ display: "flex", alignItems: "center", gap: 7, background: C.ink, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px 6px 10px", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: FONT_SANS, boxShadow: "0 4px 12px -4px rgba(16,36,92,.35)" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: acc.hex, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>?</div>
              {!isMobile && t.helpBtn}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.txt2 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: (THEMES[userProfile.avatarColor] || acc).hex, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 11.5 }}>{role === "manager" ? "MG" : "CB"}</div>
              {!isMobile && t[role]}
            </div>
          </div>
        </header>

        <div key={key} style={{ padding: isMobile ? 16 : 30, flex: 1, overflow: "auto", position: "relative", zIndex: 1 }}>
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><div style={{ fontSize: 15, fontWeight: 500, fontFamily: FONT_DISPLAY, display: "flex", alignItems: "center", gap: 8 }}><Activity size={17} color={C.teal} /> {t.recent}</div></div>
                {claims.slice(0, 4).map((c, i) => (
                  <div key={c.id} className="lift" onClick={() => { setTab("claims"); setOpenClaim(c.id); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 12, cursor: "pointer", border: "1px solid transparent", marginBottom: i < 3 ? 4 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: rbg(c.risk), display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={16} color={rc(c.risk)} /></div>
                      <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>#{c.id}</div><div style={{ fontSize: 12, color: C.txt2 }}>{c.codes} · {c.payer}</div></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}><RiskPill r={c.risk} t={t} /><ChevronRight size={16} color={C.txt3} /></div>
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
                  {/* Real CSV drag & drop upload */}
                  <div
                    className="rise"
                    onDragOver={(e) => { e.preventDefault(); setCsvDrag(true); }}
                    onDragLeave={() => setCsvDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setCsvDrag(false); const f = e.dataTransfer.files[0]; if (f) handleCSVFile(f); }}
                    onClick={() => document.getElementById("csv-input").click()}
                    style={{ border: `2px dashed ${csvDrag ? C.teal : C.tealMute}`, background: csvDrag ? C.tealSoft : C.paper2, borderRadius: 18, padding: "32px 24px", textAlign: "center", cursor: "pointer", transition: "all .2s", marginBottom: 16 }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.background = C.tealSoft; }}
                    onMouseLeave={(e) => { if (!csvDrag) { e.currentTarget.style.borderColor = C.tealMute; e.currentTarget.style.background = C.paper2; } }}
                  >
                    <input id="csv-input" type="file" accept=".csv,.txt,.edi,.837" style={{ display: "none" }} onChange={(e) => handleCSVFile(e.target.files[0])} />
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: C.tealSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}><Upload size={24} color={C.teal} /></div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{lang === "en" ? "Drop your claims file here" : "Suelta tu archivo de reclamos aquí"}</div>
                    <div style={{ fontSize: 12.5, color: C.txt2, marginTop: 4 }}>{lang === "en" ? "CSV · EDI 837 — columns: id, patient, codes, payer, provider, dos, billed, status, risk" : "CSV · EDI 837 — columnas: id, patient, codes, payer, provider, dos, billed, status, risk"}</div>
                    <button className="btnp" style={{ ...btnP, marginTop: 14 }} onClick={(e) => { e.stopPropagation(); document.getElementById("csv-input").click(); }}><Upload size={15} /> {lang === "en" ? "Browse file" : "Buscar archivo"}</button>
                  </div>

                  {csvImporting && <div className="rise" style={{ marginBottom: 14, fontSize: 13, color: C.amber, display: "flex", alignItems: "center", gap: 7 }}><Loader2 size={14} className="spin" /> {lang === "en" ? "Reading and parsing claims…" : "Leyendo y procesando reclamos…"}</div>}
                  {csvResult && !csvResult.error && (
                    <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
                      <div style={{ background: `linear-gradient(120deg,${C.tealDk},${C.teal})`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 9 }}><CheckCircle2 size={16} color="#fff" /><span style={{ fontWeight: 500, fontSize: 13.5, color: "#fff" }}>{lang === "en" ? `${csvResult.count} claims imported` : `${csvResult.count} reclamos importados`}</span><span style={{ marginLeft: "auto", fontSize: 11.5, color: "rgba(255,255,255,.85)" }}>{csvResult.name}</span></div>
                      <div style={{ padding: "12px 16px", display: "flex", gap: 10 }}>
                        <button className="btnp" onClick={() => { setTab("claims"); setCsvResult(null); }} style={{ ...btnP, flex: 1, justifyContent: "center" }}>{lang === "en" ? "View in Claims" : "Ver en Reclamos"} <ArrowRight size={15} /></button>
                        <button onClick={() => setCsvResult(null)} style={btnG}>{t.dismiss}</button>
                      </div>
                    </div>
                  )}
                  {csvResult?.error && <div className="rise" style={{ background: C.redSoft, border: `1px solid #f0c5c0`, borderRadius: 12, padding: "11px 14px", marginBottom: 14, fontSize: 12.5, color: C.red, display: "flex", gap: 8, alignItems: "center" }}><AlertTriangle size={15} />{csvResult.sizeErr ? (lang === "en" ? `"${csvResult.name}" exceeds the 25 MB limit. Split the file and re-upload.` : `"${csvResult.name}" supera el límite de 25 MB. Divida el archivo y vuelva a subir.`) : (lang === "en" ? `Could not parse "${csvResult.name}". Check it has a header row.` : `No se pudo leer "${csvResult.name}". Verifica que tenga encabezado.`)}</div>}

                  {/* CSV format hint */}
                  <div className="rise" style={{ background: C.ink, borderRadius: 13, padding: "13px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11.5, color: C.gold, fontWeight: 500, marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}><FileText size={13} /> {lang === "en" ? "Expected CSV format" : "Formato CSV esperado"}</div>
                    <code style={{ fontSize: 10.5, color: "rgba(255,255,255,.72)", lineHeight: 1.7, display: "block", whiteSpace: "pre-wrap", fontFamily: "ui-monospace,monospace" }}>{`id,patient,codes,payer,provider,dos,billed,status,risk\nPV-2024-0901,Patient #5001,90837,Plan Vital,Dr. Rodriguez,May 15,195,pending,50`}</code>
                  </div>

                  <div className="rise" style={{ fontSize: 12.5, fontWeight: 500, color: C.txt3, display: "flex", alignItems: "center", gap: 7, marginBottom: 11, fontFamily: FONT_DISPLAY }}><Plug size={15} /> {t.roadmap} — {t.apiConnect}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 11, marginBottom: 16 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: sel && !isMobile ? "1fr 1fr" : "1fr", gap: 18, alignItems: "start" }}>
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
                        <div style={{ fontSize: 12, color: C.txt3, marginTop: 2 }}>{f.status === "scanning" ? <span style={{ color: C.amber, display: "flex", alignItems: "center", gap: 5 }}><Loader2 size={12} className="spin" /> {SCAN[f.stage]}…</span> : <span style={{ color: C.teal, display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12} /> {f.isReal ? (lang === "en" ? "Ready to review" : "Listo para revisar") : `${t.confidence} ${f.ex.confidence}%`}</span>}</div>
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
                    <RiskPill r={c.risk} big t={t} />
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
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 290px", gap: 18, alignItems: "start" }}>
                  <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                      <div><h2 style={{ fontSize: 21, fontWeight: 500, margin: 0, fontFamily: FONT_DISPLAY }}>#{c.id}</h2><div style={{ fontSize: 13, color: C.txt2, marginTop: 3 }}>{c.patient} · {c.provider}</div></div>
                      <RiskPill r={c.risk} big t={t} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20, padding: "14px 0", borderTop: `1px solid ${C.lineSoft}`, borderBottom: `1px solid ${C.lineSoft}` }}>
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
                        {(() => { const tips = getProTips(c.codes); return (tips.codes.length + tips.mods.length > 0) ? (
                          <div className="rise" style={{ marginTop: 18, background: "#F3EFFD", border: "1.5px solid #9B7CF0", borderRadius: 14, padding: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#5B21B6", marginBottom: 10, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: ".07em" }}><Lightbulb size={14} /> {t.learnProTipT}</div>
                            <div style={{ fontSize: 12, color: "#6D28D9", marginBottom: 12, lineHeight: 1.5 }}>{t.learnProTipSub}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {tips.codes.map((tip, i) => (
                                <div key={i} style={{ background: "#fff", border: "1px solid #C4B5FD", borderRadius: 10, padding: "10px 13px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 8, background: (TYPE_COLOR[tip.type] || [C.txt2, C.lineSoft])[1], color: (TYPE_COLOR[tip.type] || [C.txt2, C.lineSoft])[0] }}>{tip.type}</span>
                                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13, color: C.ink }}>{tip.code}</span>
                                    <span style={{ fontSize: 12.5, color: C.txt2 }}>— {tip.desc}</span>
                                  </div>
                                  {tip.notes && <div style={{ fontSize: 12.5, color: "#4C1D95", lineHeight: 1.55 }}>{tip.notes}</div>}
                                </div>
                              ))}
                              {tips.mods.map((tip, i) => (
                                <div key={i} style={{ background: "#fff", border: "1px solid #C4B5FD", borderRadius: 10, padding: "10px 13px" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 8, background: "#EDE9FE", color: "#7C3AED" }}>MOD</span>
                                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13, color: C.ink }}>{tip.mod}</span>
                                    <span style={{ fontSize: 12.5, color: C.txt2 }}>— {tip.desc}</span>
                                  </div>
                                  <div style={{ fontSize: 12.5, color: "#4C1D95", lineHeight: 1.55 }}>{tip.rule}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null; })()}
                        <button className="btnp" onClick={() => { setReviewed((p) => [...new Set([...p, c.id])]); setOpenClaim(null); }} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 13, marginTop: 18 }}><CheckCircle2 size={16} /> {t.markReviewed}</button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Score label={t.denialRisk} value={c.risk} invert type="risk" delay={0} t={t} /><Score label={t.compliance} value={c.comp} type="comp" delay={0.08} t={t} /><Score label={t.docQuality} value={c.doc} type="doc" delay={0.16} t={t} />
                  </div>
                </div>
              </div>
            );
          })()}


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

          {/* SUBSCRIPTION */}
          {tab === "subscription" && role === "manager" && (() => {
            const isEn = lang === "en";
            const plans = [
              {
                id: "starter",
                name: isEn ? "Starter" : "Inicial",
                priceMonthly: 299,
                priceAnnual: 224,
                claims: 500,
                providers: 2,
                color: C.blue, soft: C.blueSoft,
                features: [
                  t.subFeatBasicRules,
                  `500 ${t.subFeatClaims}`,
                  `2 ${t.subFeatProviders}`,
                  t.subFeatEmailSupport,
                  t.subFeatAudit,
                  t.subFeatEncrypt,
                ],
                cta: t.subGetStarted,
                popular: false,
              },
              {
                id: "professional",
                name: isEn ? "Professional" : "Profesional",
                priceMonthly: 699,
                priceAnnual: 524,
                claims: 2500,
                providers: 8,
                color: C.teal, soft: C.tealSoft,
                features: [
                  t.subFeatRules,
                  `2,500 ${t.subFeatClaims}`,
                  `8 ${t.subFeatProviders}`,
                  t.subFeatAI,
                  t.subFeatChatSupport,
                  t.subFeatAudit,
                  t.subFeatEncrypt,
                ],
                cta: t.subGetStarted,
                popular: true,
              },
              {
                id: "enterprise",
                name: "Enterprise",
                priceMonthly: 1299,
                priceAnnual: 974,
                claims: null,
                providers: null,
                color: C.ink, soft: C.lineSoft,
                features: [
                  t.subFeatRules,
                  `${t.subFeatUnlimited} ${t.subFeatClaims}`,
                  `${t.subFeatUnlimited} ${t.subFeatProviders}`,
                  t.subFeatAI,
                  t.subFeatDedicated,
                  t.subFeatAPI,
                  t.subFeatAudit,
                  t.subFeatEncrypt,
                ],
                cta: t.subContact,
                popular: false,
              },
            ];
            const price = (p) => subBillingAnn ? p.priceAnnual : p.priceMonthly;
            const annualTotal = (p) => p.priceAnnual * 12;
            const savings = (p) => (p.priceMonthly - p.priceAnnual) * 12;

            return (
              <div>
                <Head title={t.subTitle} sub={t.subSub} />

                {/* trial badge */}
                <div className="rise" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.amberSoft, border: `1px solid ${C.amber}`, borderRadius: 24, padding: "7px 16px", marginBottom: 24, fontSize: 13, color: C.amber, fontWeight: 500 }}>
                  <CreditCard size={14} /> {t.subTrialBadge}
                </div>

                {/* billing toggle */}
                <div className="rise" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                  <span style={{ fontSize: 14, fontWeight: subBillingAnn ? 400 : 600, color: subBillingAnn ? C.txt3 : C.ink }}>{t.subBilling}</span>
                  <div onClick={() => setSubBillingAnn(p => !p)} style={{ width: 44, height: 24, borderRadius: 12, background: subBillingAnn ? C.teal : C.line, cursor: "pointer", position: "relative", transition: "background .2s" }}>
                    <div style={{ position: "absolute", top: 3, left: subBillingAnn ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.18)", transition: "left .2s" }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: subBillingAnn ? 600 : 400, color: subBillingAnn ? C.ink : C.txt3 }}>{t.subBillingAnn}</span>
                  {subBillingAnn && <span style={{ fontSize: 11.5, fontWeight: 600, background: C.tealSoft, color: C.tealDk, borderRadius: 20, padding: "3px 10px" }}>25% OFF</span>}
                </div>

                {/* pricing cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 32 }}>
                  {plans.map((p, i) => (
                    <div key={p.id} className="rise lift" style={{ animationDelay: `${i * 0.07}s`, background: p.popular ? `linear-gradient(155deg,${C.ink},${C.ink2})` : C.paper2, border: p.popular ? "none" : `1px solid ${C.line}`, borderRadius: 20, padding: 24, position: "relative", display: "flex", flexDirection: "column" }}>
                      {p.popular && (
                        <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: C.teal, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                          <Star size={10} fill="#fff" /> {t.subPopular}
                        </div>
                      )}
                      <div style={{ fontSize: 16, fontWeight: 600, color: p.popular ? "#fff" : C.ink, fontFamily: FONT_DISPLAY, marginBottom: 6 }}>{p.name}</div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 38, fontWeight: 600, fontFamily: FONT_DISPLAY, color: p.popular ? "#fff" : C.ink, lineHeight: 1 }}>${price(p)}</span>
                        <span style={{ fontSize: 13, color: p.popular ? "rgba(255,255,255,.7)" : C.txt3, paddingBottom: 6 }}>{subBillingAnn ? t.subPerMoAnn : t.subPerMo}</span>
                      </div>
                      {subBillingAnn && (
                        <div style={{ fontSize: 12.5, color: p.popular ? C.teal : C.tealDk, fontWeight: 500, marginBottom: 4 }}>
                          {t.subAnnSave} ${savings(p).toLocaleString()}{t.subPerYear}
                        </div>
                      )}
                      <div style={{ borderTop: `1px solid ${p.popular ? "rgba(255,255,255,.12)" : C.lineSoft}`, margin: "16px 0" }} />
                      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                        {p.features.map((f, fi) => (
                          <li key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: p.popular ? "rgba(255,255,255,.88)" : C.txt, lineHeight: 1.4 }}>
                            <BadgeCheck size={15} color={p.popular ? C.teal : C.tealDk} style={{ flexShrink: 0, marginTop: 1 }} />{f}
                          </li>
                        ))}
                      </ul>
                      <button className="btnp" onClick={() => { setSubscribeModal({ ...p, billingAnn: subBillingAnn }); setSubSuccess(false); }} style={{ width: "100%", justifyContent: "center", padding: "11px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: 600, fontFamily: FONT_SANS, background: p.popular ? C.teal : C.ink, color: "#fff", display: "flex", alignItems: "center", gap: 7 }}>
                        <CreditCard size={15} /> {p.cta}
                      </button>
                    </div>
                  ))}
                </div>

                {/* why it pays off */}
                <SectionLabel icon={TrendingUp} text={t.subWhyTitle} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12, marginBottom: 20 }}>
                  {[[Zap, t.subWhy1T, t.subWhy1D, C.teal, C.tealSoft], [Award, t.subWhy2T, t.subWhy2D, C.blue, C.blueSoft], [Sparkles, t.subWhy3T, t.subWhy3D, C.amber, C.amberSoft]].map(([Ic, ti, d, c, bg], i) => (
                    <div key={i} className="rise lift" style={{ animationDelay: `${i * 0.06}s`, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 14, padding: 18 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}><Ic size={17} color={c} /></div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>{ti}</div>
                      <div style={{ fontSize: 12.5, color: C.txt2, lineHeight: 1.5 }}>{d}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12.5, color: C.txt3, fontStyle: "italic" }}>{t.subGuarantee}</div>
              </div>
            );
          })()}

          {/* BATCH QUEUE */}
          {tab === "batch" && (() => {
            const selCount = batchQueue.filter((q) => q.sel && q.st === "pending").length;
            const allSel = batchQueue.length > 0 && batchQueue.every((q) => q.sel || q.st !== "pending");
            const toggle = (id) => setBatchQueue((p) => p.map((q) => q.id === id && q.st === "pending" ? { ...q, sel: !q.sel } : q));
            const toggleAll = () => setBatchQueue((p) => p.map((q) => q.st === "pending" ? { ...q, sel: !allSel } : q));
            const selectLane = (k) => setBatchQueue((p) => p.map((q) => q.lane === k && q.st === "pending" ? { ...q, sel: true } : q));
            const bulkApprove = () => { const n = selCount; setBatchQueue((p) => p.map((q) => q.sel && q.st === "pending" ? { ...q, st: "approved", sel: false } : q)); };
            // ── Batch helpers ──────────────────────────────────────────────
            const applyBatchResults = (data) => {
              setBatchMeta({ total: data.total, auto_clear: data.auto_clear, needs_attention: data.needs_attention, at_risk: data.at_risk });
              setBatchQueue(data.claims.map((c) => ({ ...c, sel: c.lane === "auto_clear", st: "pending" })));
              // Merge real scrub results into the claims workspace so each claim
              // can be opened, inspected, and fixed in the claims detail view.
              if (data.claims?.length) {
                const workspaceClaims = data.claims.map((c) => ({
                  id:       c.id,
                  patient:  c.patient || "Unknown",
                  codes:    c.codes || "—",
                  payer:    c.payer || "Unknown",
                  provider: c.provider || c.prov || "—",
                  dos:      c.dos || "—",
                  billed:   c.billed || c.val || 0,
                  status:   c.lane === "auto_clear" ? "clear" : c.lane === "quick_review" ? "pending" : "denied",
                  risk:     c.risk ?? 50,
                  comp:     c.comp ?? 70,
                  doc:      c.doc ?? 70,
                  sEn:      c.sEn || "Scrubbed via batch upload.",
                  sEs:      c.sEs || "Revisado mediante carga de lote.",
                  issues:   c.issues || [],
                  fix:      c.fix || [],
                  service_lines: c.service_lines || [],
                  npi:      c.npi || "",
                  diagnosis: c.diagnosis || "",
                }));
                setClaims((prev) => {
                  const existingIds = new Set(prev.map((x) => x.id));
                  const fresh = workspaceClaims.filter((c) => !existingIds.has(c.id));
                  return [...fresh, ...prev];
                });
              }
              setBatchLoaded(true);
            };
            const loadMockBatch = () => { setBatchReading(true); setTimeout(() => { setBatchReading(false); setBatchMeta({ total: 42, auto_clear: 31, needs_attention: 11, at_risk: 3400 }); setBatchLoaded(true); setBatchQueue(BATCH_SEED.map((x) => ({ ...x }))); }, 1400); };
            const uploadBatchFile = async (file) => {
              if (!file) return;
              if (file.size > MAX_UPLOAD_BYTES) { alert(lang === "en" ? `File exceeds 25 MB limit (${(file.size/1024/1024).toFixed(1)} MB). Please split the batch and re-upload.` : `El archivo supera el límite de 25 MB (${(file.size/1024/1024).toFixed(1)} MB). Divida el lote y vuelva a subir.`); return; }
              if (!baaConfirmed) { setBaaModalFile({ file, target: "batch" }); return; }
              setBatchReading(true);
              if (API_URL) {
                try {
                  const form = new FormData(); form.append("file", file);
                  const res = await fetch(`${API_URL}/api/batch`, { method: "POST", body: form, headers: authHeaders() });
                  if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
                  applyBatchResults(await res.json());
                } catch (err) {
                  console.error("Batch API error:", err);
                  applyBatchResults({ total: 42, auto_clear: 31, needs_attention: 11, at_risk: 3400, claims: BATCH_SEED.map((x) => ({ ...x })) });
                } finally { setBatchReading(false); }
              } else { loadMockBatch(); }
            };
            uploadBatchFileRef.current = uploadBatchFile;
            const loadBatch = () => { if (API_URL) { batchFileRef.current?.click(); } else { loadMockBatch(); } };
            return (
              <div>
                <Head title={t.batchTitle} sub={t.batchSub} />
                {/* hidden file input — triggers when API_URL is set */}
                <input ref={batchFileRef} type="file" accept=".edi,.837,.txt,.csv" style={{ display: "none" }} onChange={(e) => uploadBatchFile(e.target.files?.[0])} />
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
                          <RiskPill r={q.risk} t={t} />
                          <button
                            title={lang === "en" ? "Open in workspace" : "Abrir en espacio de trabajo"}
                            onClick={() => { setTab("claims"); setOpenClaim(q.id); setAnalyzed((p) => ({ ...p, [q.id]: true })); }}
                            style={{ flexShrink: 0, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 9px", cursor: "pointer", fontSize: 11, color: C.txt2, display: "flex", alignItems: "center", gap: 4 }}
                          ><ClipboardList size={12} /> {lang === "en" ? "Open" : "Abrir"}</button>
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
              (learnTypeFilter === "all" || c.type === learnTypeFilter) &&
              (!q || c.code.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
            );
            const filteredMods = LEARN_MODS.filter(m =>
              !q || m.mod.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q) || m.rule.toLowerCase().includes(q) || m.payer.toLowerCase().includes(q)
            );
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
                    {/* Type filter chips */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                      {[["all", t.learnTypeAll, C.ink], ["ICD-10", "ICD-10", C.purple], ["CPT", "CPT", C.blue], ["HCPCS", "HCPCS", C.teal]].map(([k, label, color]) => (
                        <button key={k} onClick={() => setLearnTypeFilter(k)} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 16, cursor: "pointer", border: `1px solid ${learnTypeFilter === k ? color : C.line}`, background: learnTypeFilter === k ? color + "18" : C.paper2, color: learnTypeFilter === k ? color : C.txt2, fontFamily: FONT_SANS, fontWeight: learnTypeFilter === k ? 600 : 400 }}>
                          {label} {learnTypeFilter === k && filteredCodes.length > 0 && <span style={{ fontSize: 10, opacity: 0.7 }}>({filteredCodes.length})</span>}
                        </button>
                      ))}
                    </div>
                    {filteredCodes.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "40px 20px", color: C.txt3, fontSize: 14 }}>{t.learnNoResults}</div>
                    ) : (
                      <div style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" }}>
                        <div style={{ overflowX: "auto" }}>
                        {/* Table header */}
                        <div style={{ display: "grid", gridTemplateColumns: "110px 110px 1fr 100px 36px", minWidth: 420, gap: 0, background: C.lineSoft, padding: "10px 18px", borderBottom: `1px solid ${C.line}` }}>
                          {[t.learnCode, "Type", t.learnNotes, t.learnUnits, ""].map(h => (
                            <div key={h} style={{ fontSize: 11.5, fontWeight: 600, color: C.txt2, textTransform: "uppercase", letterSpacing: ".06em" }}>{h}</div>
                          ))}
                        </div>
                        {filteredCodes.map((c, i) => {
                          const [tc, tbg] = TYPE_COLOR[c.type] || [C.txt2, C.lineSoft];
                          const isExp = !!learnExpanded[c.code];
                          return (
                            <div key={c.code} style={{ minWidth: 420, borderBottom: i < filteredCodes.length - 1 ? `1px solid ${C.lineSoft}` : "none" }}>
                              <div onClick={() => setLearnExpanded(p => ({ ...p, [c.code]: !p[c.code] }))} style={{ display: "grid", gridTemplateColumns: "110px 110px 1fr 100px 36px", gap: 0, padding: "13px 18px", alignItems: "start", cursor: "pointer", background: isExp ? C.tealSoft : "transparent" }}>
                                <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 13.5, color: C.ink }}>{c.code}</div>
                                <div><span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: tbg, color: tc }}>{c.type}</span></div>
                                <div style={{ fontSize: 13, color: C.txt2, lineHeight: 1.45 }}>{c.desc}</div>
                                <div style={{ fontSize: 12.5, color: C.txt2 }}>{c.units}</div>
                                <div><ChevronDown size={14} color={C.txt3} style={{ transform: isExp ? "rotate(180deg)" : "none", transition: "transform .2s" }} /></div>
                              </div>
                              {isExp && (
                                <div className="rise" style={{ padding: "12px 18px 16px", background: C.tealSoft, borderTop: `1px solid ${C.tealMute}` }}>
                                  {c.notes ? (
                                    <div style={{ fontSize: 13, color: "#0a5c47", lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                                      <Info size={14} color={C.tealDk} style={{ flexShrink: 0, marginTop: 2 }} />
                                      <span>{c.notes}</span>
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: 13, color: C.txt3, fontStyle: "italic" }}>{lang === "en" ? "See AMA CPT manual for full guidelines." : "Ver manual AMA CPT para guías completas."}</div>
                                  )}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(c.code); setCopiedCode(c.code); setTimeout(() => setCopiedCode(null), 1800); }}
                                    style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, padding: "4px 12px", borderRadius: 10, border: `1px solid ${C.tealMute}`, background: "#fff", color: C.tealDk, cursor: "pointer", fontFamily: FONT_SANS }}
                                  >
                                    <Copy size={11} /> {copiedCode === c.code ? t.learnCopied : `${t.learnCopy} ${c.code}`}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        </div>
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
          {/* SETTINGS */}
          {tab === "settings" && (() => {
            const stTabs = [
              { id: "profile",    icon: UserRound,  label: t.stProfile },
              { id: "appearance", icon: Palette,    label: t.stAppearance },
              { id: "notifs",     icon: Bell,       label: t.stNotifs },
              { id: "security",   icon: Lock,       label: t.stSecurity },
              ...(role === "manager" ? [{ id: "team", icon: Users, label: t.stTeam }] : []),
            ];
            const avatarBg = (THEMES[userProfile.avatarColor] || acc).hex;
            const initials = (userProfile.firstName[0] || "D") + (userProfile.lastName[0] || "U");
            const demoTeam = [
              { name: "Dr. Rivera, LCSW", email: "rivera@clinicapr.com",  role: t.coder,   color: THEMES.teal.hex },
              { name: "Dr. Colón, PhD",   email: "colon@clinicapr.com",   role: t.coder,   color: THEMES.emerald.hex },
              { name: "Dr. Méndez, MD",   email: "mendez@clinicapr.com",  role: t.manager, color: THEMES.indigo.hex },
            ];
            return (
              <div>
                <Head title={t.settingsTitle} sub={t.settingsSub} />
                <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexDirection: isMobile ? "column" : "row" }}>
                  {/* sidebar tabs — horizontal strip on mobile */}
                  {isMobile ? (
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, width: "100%" }}>
                      {stTabs.map(s => {
                        const active = settingsTab === s.id;
                        return (
                          <button key={s.id} onClick={() => setSettingsTab(s.id)} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 20, border: `1px solid ${active ? acc.hex : C.line}`, cursor: "pointer", fontSize: 13, whiteSpace: "nowrap", background: active ? acc.soft : C.paper2, color: active ? acc.dk : C.txt2, fontWeight: active ? 600 : 400, fontFamily: FONT_SANS, flexShrink: 0 }}>
                            <s.icon size={14} color={active ? acc.hex : C.txt3} /> {s.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                  <div style={{ width: 190, flexShrink: 0, background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 16, padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                    {stTabs.map(s => {
                      const active = settingsTab === s.id;
                      return (
                        <button key={s.id} onClick={() => setSettingsTab(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13.5, textAlign: "left", width: "100%", background: active ? acc.soft : "transparent", color: active ? acc.dk : C.txt2, fontWeight: active ? 600 : 400, fontFamily: FONT_SANS }}>
                          <s.icon size={16} color={active ? acc.hex : C.txt3} /> {s.label}
                        </button>
                      );
                    })}
                  </div>
                  )}

                  {/* content panel */}
                  <div style={{ flex: 1, minWidth: 0 }}>

                    {/* ── PROFILE ───────────────────────────── */}
                    {settingsTab === "profile" && (
                      <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 28 }}>
                        {/* avatar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.lineSoft}` }}>
                          <div style={{ width: 68, height: 68, borderRadius: "50%", background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", fontFamily: FONT_DISPLAY, flexShrink: 0 }}>{initials}</div>
                          <div>
                            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 500, color: C.ink }}>{userProfile.firstName} {userProfile.lastName}</div>
                            <div style={{ fontSize: 13, color: C.txt2, marginTop: 3 }}>{userProfile.email}</div>
                            <span style={{ fontSize: 11.5, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: acc.soft, color: acc.dk, marginTop: 6, display: "inline-block" }}>{t[role]}</span>
                          </div>
                        </div>

                        {/* form */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                          <div>
                            <label style={{ fontSize: 12.5, fontWeight: 500, color: C.txt2, display: "block", marginBottom: 6 }}>{t.stFirstName}</label>
                            <input value={userProfile.firstName} onChange={e => setUserProfile(p => ({ ...p, firstName: e.target.value }))} style={inp} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12.5, fontWeight: 500, color: C.txt2, display: "block", marginBottom: 6 }}>{t.stLastName}</label>
                            <input value={userProfile.lastName} onChange={e => setUserProfile(p => ({ ...p, lastName: e.target.value }))} style={inp} />
                          </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <label style={{ fontSize: 12.5, fontWeight: 500, color: C.txt2, display: "block", marginBottom: 6 }}>{t.stEmail}</label>
                          <input value={userProfile.email} readOnly style={{ ...inp, background: C.paper, color: C.txt3 }} />
                        </div>
                        <div style={{ marginBottom: 22 }}>
                          <label style={{ fontSize: 12.5, fontWeight: 500, color: C.txt2, display: "block", marginBottom: 10 }}>{t.stAvatarColor}</label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {Object.values(THEMES).map(th => (
                              <button key={th.key} onClick={() => setUserProfile(p => ({ ...p, avatarColor: th.key }))} title={lang === "en" ? th.name : th.nameEs} style={{ width: 32, height: 32, borderRadius: "50%", background: th.hex, border: userProfile.avatarColor === th.key ? `3px solid ${C.ink}` : "3px solid transparent", cursor: "pointer", outline: userProfile.avatarColor === th.key ? `2px solid ${th.hex}` : "none", outlineOffset: 2, transition: "all .15s" }} />
                            ))}
                          </div>
                        </div>
                        <button onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2000); }} style={{ ...btnP, background: acc.hex }}>
                          {profileSaved ? <><BadgeCheck size={15} /> {t.stSaved}</> : t.stSaveProfile}
                        </button>
                      </div>
                    )}

                    {/* ── APPEARANCE ────────────────────────── */}
                    {settingsTab === "appearance" && (
                      <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 28 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 4, fontFamily: FONT_DISPLAY }}>{t.stThemeTitle}</div>
                        <div style={{ fontSize: 13, color: C.txt2, marginBottom: 20, lineHeight: 1.6 }}>{t.stThemeSub}</div>

                        {/* color swatches */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10, marginBottom: 28 }}>
                          {Object.values(THEMES).map(th => {
                            const active = accentKey === th.key;
                            return (
                              <button key={th.key} onClick={() => setAccentKey(th.key)} style={{ padding: "14px 12px", borderRadius: 14, border: `2px solid ${active ? th.hex : C.line}`, background: active ? th.soft : C.paper, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all .15s", boxShadow: active ? `0 4px 14px -4px ${th.hex}55` : "none" }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: th.hex, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {active && <BadgeCheck size={16} color="#fff" />}
                                </div>
                                <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 400, color: active ? th.dk : C.txt2 }}>{lang === "en" ? th.name : th.nameEs}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* live preview strip */}
                        <div style={{ borderTop: `1px solid ${C.lineSoft}`, paddingTop: 20, marginBottom: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: C.txt2, marginBottom: 12 }}>{lang === "en" ? "Preview" : "Vista previa"}</div>
                          <div style={{ background: C.ink, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: acc.hex, display: "flex", alignItems: "center", justifyContent: "center" }}><LogoMark size={15} color="#fff" /></div>
                            <span style={{ color: "#fff", fontSize: 14, fontFamily: FONT_DISPLAY }}>Revenue<span style={{ color: acc.hex }}>MD</span></span>
                            <div style={{ flex: 1 }} />
                            <div style={{ background: acc.soft, color: acc.hex, fontSize: 11.5, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>● Live</div>
                            <div style={{ background: acc.hex, color: "#fff", fontSize: 12, fontWeight: 500, padding: "6px 14px", borderRadius: 10 }}>{lang === "en" ? "Action" : "Acción"}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── NOTIFICATIONS ─────────────────────── */}
                    {settingsTab === "notifs" && (
                      <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 28 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 4, fontFamily: FONT_DISPLAY }}>{t.stNotifs}</div>
                        <div style={{ fontSize: 13, color: C.txt2, marginBottom: 22, lineHeight: 1.6 }}>{t.stNotifSub}</div>
                        {[
                          ...(role === "manager" ? [{ key: "subscription", title: t.stNotifSubscription, desc: t.stNotifSubscriptionD }] : []),
                          { key: "claims",       title: t.stNotifClaims,        desc: t.stNotifClaimsD },
                          { key: "payers",       title: t.stNotifPayers,        desc: t.stNotifPayersD },
                          { key: "email",        title: t.stNotifEmail,         desc: t.stNotifEmailD },
                        ].map((n, i, arr) => (
                          <div key={n.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.lineSoft}` : "none" }}>
                            <div>
                              <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink }}>{n.title}</div>
                              <div style={{ fontSize: 12.5, color: C.txt2, marginTop: 2 }}>{n.desc}</div>
                            </div>
                            <div onClick={() => setNotifPrefs(p => ({ ...p, [n.key]: !p[n.key] }))} style={{ width: 44, height: 24, borderRadius: 12, background: notifPrefs[n.key] ? acc.hex : C.line, cursor: "pointer", position: "relative", flexShrink: 0, marginLeft: 16, transition: "background .2s" }}>
                              <div style={{ position: "absolute", top: 3, left: notifPrefs[n.key] ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.18)", transition: "left .2s" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── SECURITY ──────────────────────────── */}
                    {settingsTab === "security" && (
                      <div className="rise" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                        {/* HIPAA note */}
                        <div style={{ background: C.blueSoft, border: `1px solid ${C.blue}22`, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <ShieldAlert size={16} color={C.blue} style={{ flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: 12.5, color: C.blue, lineHeight: 1.55 }}>{t.stAuthHipaa}</span>
                        </div>

                        {/* ── METHOD 1: PASSWORD ── */}
                        <div style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: `1px solid ${C.lineSoft}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 10, background: acc.soft, display: "flex", alignItems: "center", justifyContent: "center" }}><KeyRound size={18} color={acc.hex} /></div>
                              <div>
                                <div style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, fontFamily: FONT_DISPLAY }}>{t.stChangePassword}</div>
                                <div style={{ fontSize: 12.5, color: C.txt2, marginTop: 2 }}>{t.stPwdMethodD}</div>
                              </div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: C.tealSoft, color: C.tealDk }}>{t.stPwdAlwaysOn}</span>
                          </div>
                          <div style={{ padding: "20px 24px" }}>
                            {[[t.stCurrentPwd, "current"], [t.stNewPwd, "next"], [t.stConfirmPwd, "confirm"]].map(([label, key]) => (
                              <div key={key} style={{ marginBottom: 14 }}>
                                <label style={{ fontSize: 12.5, fontWeight: 500, color: C.txt2, display: "block", marginBottom: 6 }}>{label}</label>
                                <input type="password" value={pwdForm[key]} onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))} style={inp} />
                              </div>
                            ))}
                            <button onClick={() => { setPwdSaved(true); setPwdForm({ current: "", next: "", confirm: "" }); setTimeout(() => setPwdSaved(false), 2500); }} style={{ ...btnP, background: acc.hex }}>
                              {pwdSaved ? <><BadgeCheck size={15} /> {t.stSaved}</> : t.stUpdatePwd}
                            </button>
                          </div>
                        </div>

                        {/* ── METHOD 2: AUTHENTICATOR APP (TOTP) ── */}
                        <div style={{ background: C.paper2, border: `1px solid ${totpStep === "enabled" ? acc.hex : C.line}`, borderRadius: 18, overflow: "hidden", transition: "border-color .2s" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: totpStep !== "idle" ? `1px solid ${C.lineSoft}` : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 10, background: totpStep === "enabled" ? acc.soft : C.lineSoft, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}><Smartphone size={18} color={totpStep === "enabled" ? acc.hex : C.txt3} /></div>
                              <div>
                                <div style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, fontFamily: FONT_DISPLAY }}>{t.stTotpMethod}</div>
                                <div style={{ fontSize: 12.5, color: C.txt2, marginTop: 2 }}>{t.stTotpMethodD}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {totpStep === "enabled" && <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: acc.soft, color: acc.dk }}>{t.stTotpEnabled}</span>}
                              <button onClick={() => { if (totpStep === "enabled") { setTotpStep("idle"); setTotpCode(""); } else { setTotpStep(totpStep === "idle" ? "setup" : "idle"); setTotpCode(""); } }}
                                style={{ ...btnP, background: totpStep === "enabled" ? C.redSoft : totpStep === "setup" ? C.lineSoft : acc.hex, color: totpStep === "enabled" ? C.red : totpStep === "setup" ? C.txt2 : "#fff", fontSize: 12.5 }}>
                                {totpStep === "enabled" ? t.stTotpDisable : totpStep === "setup" ? (lang === "en" ? "Cancel" : "Cancelar") : t.stTotpSetup}
                              </button>
                            </div>
                          </div>
                          {totpStep === "setup" && (
                            <div className="rise" style={{ padding: "22px 24px" }}>
                              <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, marginBottom: 16 }}>{t.stTotpScanTitle}</div>
                              {/* Simulated QR code */}
                              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap" }}>
                                <div style={{ background: "#fff", border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, flexShrink: 0 }}>
                                  <svg width={140} height={140} viewBox="0 0 14 14" style={{ display: "block", imageRendering: "pixelated" }}>
                                    {/* QR corner markers */}
                                    {[[0,0],[8,0],[0,8]].map(([ox,oy],i) => (
                                      <g key={i}>
                                        <rect x={ox} y={oy} width={6} height={6} fill={C.ink} rx=".4"/>
                                        <rect x={ox+1} y={oy+1} width={4} height={4} fill="#fff" rx=".2"/>
                                        <rect x={ox+2} y={oy+2} width={2} height={2} fill={C.ink} rx=".1"/>
                                      </g>
                                    ))}
                                    {/* data dots */}
                                    {[[7,7],[7,8],[8,7],[6,8],[7,9],[8,8],[6,9],[9,7],[10,7],[11,7],[7,10],[9,8],[10,9],[11,8],[6,10],[8,10],[10,10],[11,10],[9,11],[11,11],[6,11],[8,11],[7,11],[10,11]].map(([x,y],i) => (
                                      <rect key={i} x={x} y={y} width={1} height={1} fill={C.ink} />
                                    ))}
                                  </svg>
                                </div>
                                <div style={{ flex: 1, minWidth: 180 }}>
                                  <div style={{ fontSize: 12.5, color: C.txt2, marginBottom: 10, lineHeight: 1.6 }}>
                                    {lang === "en" ? "1. Open your authenticator app (Google Authenticator, Authy, etc.)" : "1. Abre tu app autenticadora (Google Authenticator, Authy, etc.)"}
                                  </div>
                                  <div style={{ fontSize: 12.5, color: C.txt2, marginBottom: 16, lineHeight: 1.6 }}>
                                    {lang === "en" ? "2. Tap the + button and scan this QR code, or enter the key below." : "2. Presiona el botón + y escanea este código, o ingresa la clave abajo."}
                                  </div>
                                  <div style={{ fontSize: 12, color: C.txt2, marginBottom: 6 }}>{t.stTotpManual}</div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <code style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 8, padding: "7px 12px", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.12em", color: C.ink, flex: 1 }}>{TOTP_SECRET}</code>
                                    <button onClick={() => { navigator.clipboard?.writeText(TOTP_SECRET); setTotpCopied(true); setTimeout(() => setTotpCopied(false), 2000); }} style={{ ...btnP, background: totpCopied ? C.tealSoft : C.ink, color: totpCopied ? C.tealDk : "#fff", padding: "8px 12px", fontSize: 12, flexShrink: 0 }}>
                                      {totpCopied ? <><BadgeCheck size={13} /> {t.stTotpCopied}</> : <><Copy size={13} /> {lang === "en" ? "Copy" : "Copiar"}</>}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div style={{ borderTop: `1px solid ${C.lineSoft}`, paddingTop: 18 }}>
                                <label style={{ fontSize: 12.5, fontWeight: 500, color: C.txt2, display: "block", marginBottom: 8 }}>{t.stTotpEnterCode}</label>
                                <div style={{ display: "flex", gap: 10 }}>
                                  <input value={totpCode} onChange={e => setTotpCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder={t.stTotpCodePh} maxLength={6} style={{ ...inp, flex: 1, fontSize: 22, fontFamily: "monospace", letterSpacing: "0.3em", textAlign: "center" }} />
                                  <button onClick={() => { if (totpCode.length === 6) setTotpStep("enabled"); }} style={{ ...btnP, background: totpCode.length === 6 ? acc.hex : C.line, color: totpCode.length === 6 ? "#fff" : C.txt3, flexShrink: 0, cursor: totpCode.length === 6 ? "pointer" : "not-allowed" }}>
                                    <BadgeCheck size={15} /> {t.stTotpVerify}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                          {totpStep === "enabled" && (
                            <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                              <BadgeCheck size={16} color={acc.hex} />
                              <span style={{ fontSize: 13, color: acc.dk, fontWeight: 500 }}>{lang === "en" ? "Authenticator app is active. A 6-digit code is required at each sign-in." : "App autenticadora activa. Se requerirá un código de 6 dígitos en cada inicio de sesión."}</span>
                            </div>
                          )}
                        </div>

                        {/* ── METHOD 3: EMAIL VERIFICATION ── */}
                        <div style={{ background: C.paper2, border: `1px solid ${emailAuthStep === "enabled" ? acc.hex : C.line}`, borderRadius: 18, overflow: "hidden", transition: "border-color .2s" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: emailAuthStep !== "idle" ? `1px solid ${C.lineSoft}` : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 10, background: emailAuthStep === "enabled" ? acc.soft : C.lineSoft, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s" }}><Mail size={18} color={emailAuthStep === "enabled" ? acc.hex : C.txt3} /></div>
                              <div>
                                <div style={{ fontSize: 14.5, fontWeight: 600, color: C.ink, fontFamily: FONT_DISPLAY }}>{t.stEmailMethod}</div>
                                <div style={{ fontSize: 12.5, color: C.txt2, marginTop: 2 }}>{t.stEmailMethodD}</div>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {emailAuthStep === "enabled" && <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: acc.soft, color: acc.dk }}>{t.stEmailEnabled}</span>}
                              <button onClick={() => { if (emailAuthStep === "enabled") { setEmailAuthStep("idle"); setEmailAuthCode(""); } else { setEmailAuthStep(emailAuthStep === "idle" ? "sent" : "idle"); setEmailAuthCode(""); } }}
                                style={{ ...btnP, background: emailAuthStep === "enabled" ? C.redSoft : emailAuthStep === "sent" ? C.lineSoft : acc.hex, color: emailAuthStep === "enabled" ? C.red : emailAuthStep === "sent" ? C.txt2 : "#fff", fontSize: 12.5 }}>
                                {emailAuthStep === "enabled" ? t.stEmailDisable : emailAuthStep === "sent" ? (lang === "en" ? "Cancel" : "Cancelar") : t.stEmailSetup}
                              </button>
                            </div>
                          </div>
                          {emailAuthStep === "sent" && (
                            <div className="rise" style={{ padding: "22px 24px" }}>
                              <div style={{ background: C.tealSoft, border: `1px solid ${C.tealMute}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <Mail size={15} color={C.tealDk} />
                                <span style={{ fontSize: 13, color: C.tealDk }}>{t.stEmailSent} <strong>{userProfile.email}</strong></span>
                              </div>
                              <label style={{ fontSize: 12.5, fontWeight: 500, color: C.txt2, display: "block", marginBottom: 8 }}>{t.stEmailEnterCode}</label>
                              <div style={{ display: "flex", gap: 10 }}>
                                <input value={emailAuthCode} onChange={e => setEmailAuthCode(e.target.value.replace(/\D/g,"").slice(0,6))} placeholder={t.stTotpCodePh} maxLength={6} style={{ ...inp, flex: 1, fontSize: 22, fontFamily: "monospace", letterSpacing: "0.3em", textAlign: "center" }} />
                                <button onClick={() => { if (emailAuthCode.length === 6) setEmailAuthStep("enabled"); }} style={{ ...btnP, background: emailAuthCode.length === 6 ? acc.hex : C.line, color: emailAuthCode.length === 6 ? "#fff" : C.txt3, flexShrink: 0, cursor: emailAuthCode.length === 6 ? "pointer" : "not-allowed" }}>
                                  <BadgeCheck size={15} /> {t.stEmailVerify}
                                </button>
                              </div>
                              <div style={{ fontSize: 12, color: C.txt3, marginTop: 10 }}>
                                {lang === "en" ? "Didn't receive the code? " : "¿No recibiste el código? "}
                                <button onClick={() => {}} style={{ fontSize: 12, color: acc.hex, background: "none", border: "none", cursor: "pointer", fontFamily: FONT_SANS, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  <RefreshCw size={11} /> {lang === "en" ? "Resend" : "Reenviar"}
                                </button>
                              </div>
                            </div>
                          )}
                          {emailAuthStep === "enabled" && (
                            <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                              <BadgeCheck size={16} color={acc.hex} />
                              <span style={{ fontSize: 13, color: acc.dk, fontWeight: 500 }}>{lang === "en" ? `Email verification is active. A code will be sent to ${userProfile.email} at each sign-in.` : `Verificación por email activa. Se enviará un código a ${userProfile.email} en cada inicio de sesión.`}</span>
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* ── TEAM (manager only) ───────────────── */}
                    {settingsTab === "team" && role === "manager" && (
                      <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, padding: 28 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: FONT_DISPLAY }}>{t.stTeam}</div>
                        </div>
                        <div style={{ fontSize: 13, color: C.txt2, marginBottom: 22 }}>{t.stTeamSub}</div>
                        <div style={{ marginBottom: 20 }}>
                          {demoTeam.map((m, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 0", borderBottom: i < demoTeam.length - 1 ? `1px solid ${C.lineSoft}` : "none" }}>
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{m.name[3]}{m.name.split(" ")[1]?.[0]}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink }}>{m.name}</div>
                                <div style={{ fontSize: 12, color: C.txt3, marginTop: 1 }}>{m.email}</div>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 500, padding: "4px 12px", borderRadius: 20, background: acc.soft, color: acc.dk }}>{m.role}</span>
                              <span style={{ fontSize: 11.5, color: C.teal }}>{t.stMemberActive}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: `1px solid ${C.lineSoft}`, paddingTop: 20 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: C.ink, marginBottom: 10 }}>{t.stInviteEmail}</div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <input placeholder="colleague@clinicapr.com" style={{ ...inp, flex: 1 }} />
                            <button style={{ ...btnP, background: acc.hex, flexShrink: 0 }}>{t.stSendInvite}</button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
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
    setClaims((p) => [{ id, patient: form.patient || "Unknown", codes: form.codes || "—", payer: form.payer || "—", provider: form.provider || "—", dos: form.dos || "—", billed: parseFloat(form.billed) || 0, status: form.status || "pending", risk: 50, comp: 70, doc: 70, sEn: "Imported from scan — run AI analysis for a full risk assessment.", sEs: "Importado desde escaneo — ejecuta análisis IA para evaluación completa.", issues: [], fix: [] }, ...p]);
    setSaved(id);
  };
  return (
    <div className="rise" style={{ background: C.paper2, border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden" }}>
      <div style={{ background: `linear-gradient(120deg,${C.tealDk},${C.teal})`, padding: "15px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <Sparkles size={18} color="#fff" />
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#fff", fontFamily: FONT_DISPLAY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sel.name}</div>
        {!isReal && <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,.8)", flexShrink: 0 }}>{sel.ex.confidence}% {t.confidence}</span>}
      </div>
      <div style={{ padding: 20 }}>
        {sel.preview && <img src={sel.preview} alt="record" style={{ width: "100%", borderRadius: 10, marginBottom: 16, maxHeight: 240, objectFit: "contain", background: C.lineSoft }} />}
        {sel.preview === null && isReal && <div style={{ background: C.lineSoft, borderRadius: 10, padding: "20px", textAlign: "center", marginBottom: 16, color: C.txt3, fontSize: 13 }}><FileText size={26} color={C.txt3} style={{ marginBottom: 6 }} /><br />{lang === "en" ? "PDF uploaded — enter billing data below" : "PDF cargado — ingresa los datos de facturación"}</div>}
        {!isReal && <><Chips label={t.cpt} arr={sel.ex.cpt} c={C.blue} bg={C.blueSoft} /><Chips label={t.icd} arr={sel.ex.icd} c={C.purple} bg={C.purpleSoft} /><Chips label={t.mods} arr={sel.ex.mods} c={C.amber} bg={C.amberSoft} /><KV label={t.units} value={sel.ex.units} /><KV label={t.dos} value={sel.ex.dos} /><KV label={t.npi} value={sel.ex.npi} /><KV label={t.auth} value={sel.ex.auth} missing t={t} /></>}
        {isReal && !saved && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: C.ink }}>{lang === "en" ? "Enter billing data" : "Ingresa datos de facturación"}</div>
            {[["id","Claim ID","PV-2024-0901"],["patient",lang==="en"?"Patient":"Paciente","Patient #5001"],["codes","CPT / HCPCS","90837"],["payer",lang==="en"?"Payer":"Pagador","Plan Vital"],["provider",lang==="en"?"Provider":"Proveedor","Dr. Rivera"],["dos",lang==="en"?"Date of service":"Fecha de servicio","May 15, 2024"],["billed",lang==="en"?"Billed ($)":"Facturado ($)","195"]].map(([k,label,ph])=>(
              <div key={k} style={{ marginBottom: 9 }}><label style={{ fontSize: 11.5, color: C.txt2, display: "block", marginBottom: 3 }}>{label}</label><input value={form[k]} onChange={(e) => fld(k, e.target.value)} placeholder={ph} style={{ ...inp, fontSize: 13, padding: "8px 11px" }} /></div>
            ))}
            <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11.5, color: C.txt2, display: "block", marginBottom: 3 }}>{lang==="en"?"Status":"Estado"}</label><select value={form.status} onChange={(e) => fld("status", e.target.value)} style={{ ...inp, fontSize: 13, padding: "8px 11px" }}><option value="pending">{t.pending}</option><option value="high">{t.highRisk}</option><option value="denied">{t.denied}</option></select></div>
          </div>
        )}
        <div style={{ background: C.amberSoft, borderRadius: 11, padding: "10px 13px", marginTop: 4, display: "flex", gap: 9 }}><CircleAlert size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} /><div style={{ fontSize: 12.5, color: "#7a4e10", lineHeight: 1.5 }}>{t.reviewNote}</div></div>
        {saved ? (
          <button className="btnp" onClick={() => { setTab("claims"); setOpenClaim(saved); }} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 13, marginTop: 14 }}><CheckCircle2 size={16} /> {lang==="en"?"Claim created — open it":"Reclamo creado — abrirlo"} <ArrowRight size={16} /></button>
        ) : (
          <button className="btnp" onClick={isReal ? createClaim : () => { setTab("claims"); setOpenClaim("PV-2024-0847"); }} style={{ ...btnP, width: "100%", justifyContent: "center", padding: 13, marginTop: 14 }}>{t.createClaim} <ArrowRight size={16} /></button>
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
function RiskPill({ r, big, t: tProp }) {
  const t = tProp || T.en;
  const txt = r >= 60 ? t.riskHigh : r >= 30 ? t.riskMid : t.riskLow;
  return <span style={{ fontSize: big ? 13 : 12, fontWeight: 500, padding: big ? "5px 13px" : "4px 11px", borderRadius: 20, background: rbg(r), color: rc(r), display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: rc(r) }} />{txt}</span>;
}
function Score({ label, value, invert, delay, type, t }) {
  const good = invert ? value < 30 : value >= 70;
  const mid  = invert ? value < 60 : value >= 50;
  const color   = good ? C.teal  : mid ? C.amber  : C.red;
  const bgColor = good ? C.tealSoft : mid ? C.amberSoft : C.redSoft;
  const border  = good ? C.tealMute : mid ? "#F0C97A" : "#EAA49F";

  const statusText = type === "risk"
    ? (good ? t.riskLow  : mid ? t.riskMid  : t.riskHigh)
    : type === "comp"
    ? (good ? t.compGood : mid ? t.compMid  : t.compLow)
    : (good ? t.docGood  : mid ? t.docMid   : t.docLow);

  const Icon = good ? CheckCircle2 : mid ? AlertTriangle : CircleAlert;

  return (
    <div className="rise" style={{ animationDelay: `${delay}s`, background: bgColor, border: `1.5px solid ${border}`, borderRadius: 16, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <Icon size={22} color={color} strokeWidth={2.5} flexShrink={0} />
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.txt }}>{statusText}</div>
      </div>
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
