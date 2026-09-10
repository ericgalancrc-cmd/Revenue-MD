"""
pytest test suite for the RevenueMD rules engine.

Run from the backend/ directory:
    pip install pytest
    pytest tests/test_rules.py -v

Each test targets a specific rule code and verifies:
- The rule fires when the bad condition is present
- The rule does NOT fire when the claim is clean
- The triage lane is correct
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from models import ParsedClaim, ServiceLine, Lane, Severity
from rules.engine import scrub
from parsers.csv_claims import parse_csv
from parser import parse_837


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_claim(**kwargs) -> ParsedClaim:
    """Build a minimal valid claim; override any field via kwargs."""
    defaults = dict(
        id="TEST-001",
        patient="Test Patient",
        codes="99213",
        payer="Plan Vital",
        provider="Dr. Test",
        npi="1234567890",
        dos="2026-05-20",
        billed=185.0,
        val=185.0,
        auth="AUTH-0001",
        pos="11",
        diagnosis="F32.1",
        service_lines=[ServiceLine(cpt="99213", mods=[], units=1, charge=185.0)],
    )
    defaults.update(kwargs)
    return ParsedClaim(**defaults)


def fired(result, code: str) -> bool:
    return any(i.code == code for i in result.issues)


def sev(result, code: str) -> str | None:
    for i in result.issues:
        if i.code == code:
            return i.sev.value
    return None


# ── ASES-001: Unit cap ────────────────────────────────────────────────────────

class TestASES001:
    def test_fires_when_over_cap(self):
        c = make_claim(
            codes="H0004 ×10",
            payer="Plan Vital",
            auth="",
            service_lines=[ServiceLine(cpt="H0004", units=10)],
        )
        r = scrub(c)
        assert fired(r, "ASES-001"), "ASES-001 should fire for H0004 × 10"
        assert sev(r, "ASES-001") == "error"
        assert r.lane == Lane.needs_work

    def test_fires_for_ases_mi_salud(self):
        c = make_claim(
            codes="H0004 ×9",
            payer="ASES Mi Salud",
            auth="",
            service_lines=[ServiceLine(cpt="H0004", units=9)],
        )
        r = scrub(c)
        assert fired(r, "ASES-001")

    def test_does_not_fire_at_cap(self):
        c = make_claim(
            codes="H0004 ×8",
            payer="Plan Vital",
            service_lines=[ServiceLine(cpt="H0004", units=8)],
        )
        r = scrub(c)
        assert not fired(r, "ASES-001"), "Exactly at cap should not fire"

    def test_does_not_fire_for_medicare(self):
        c = make_claim(
            codes="H0004 ×10",
            payer="Medicare",
            service_lines=[ServiceLine(cpt="H0004", units=10)],
        )
        r = scrub(c)
        assert not fired(r, "ASES-001"), "ASES cap rule should not apply to Medicare"


# ── ASES-002: Prior auth required ────────────────────────────────────────────

class TestASES002:
    def test_fires_when_auth_missing(self):
        c = make_claim(
            codes="H0004",
            payer="Plan Vital",
            auth="",
            service_lines=[ServiceLine(cpt="H0004", units=1)],
        )
        r = scrub(c)
        assert fired(r, "ASES-002")
        assert sev(r, "ASES-002") == "error"

    def test_does_not_fire_when_auth_present(self):
        c = make_claim(
            codes="H0004",
            payer="Plan Vital",
            auth="AUTH-1234",
            service_lines=[ServiceLine(cpt="H0004", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "ASES-002")

    def test_does_not_fire_for_mmm(self):
        """MMM has its own auth rule (MMM-001); ASES-002 should not double-fire."""
        c = make_claim(
            codes="H0004",
            payer="MMM",
            auth="",
            service_lines=[ServiceLine(cpt="H0004", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "ASES-002"), "ASES-002 should not fire for MMM payer"


# ── ASES-003: Telehealth modifier required ────────────────────────────────────

class TestASES003:
    def test_fires_when_no_telehealth_modifier(self):
        c = make_claim(
            codes="90834",
            pos="02",
            service_lines=[ServiceLine(cpt="90834", mods=[], units=1)],
        )
        r = scrub(c)
        assert fired(r, "ASES-003")
        assert sev(r, "ASES-003") == "error"

    def test_does_not_fire_with_gt_modifier(self):
        c = make_claim(
            codes="90834 GT",
            pos="02",
            service_lines=[ServiceLine(cpt="90834", mods=["GT"], units=1)],
        )
        r = scrub(c)
        assert not fired(r, "ASES-003")

    def test_does_not_fire_with_95_modifier(self):
        c = make_claim(
            codes="90834 95",
            pos="02",
            service_lines=[ServiceLine(cpt="90834", mods=["95"], units=1)],
        )
        r = scrub(c)
        assert not fired(r, "ASES-003")

    def test_does_not_fire_for_in_person(self):
        c = make_claim(
            codes="90834",
            pos="11",
            service_lines=[ServiceLine(cpt="90834", mods=[], units=1)],
        )
        r = scrub(c)
        assert not fired(r, "ASES-003")


# ── ASES-009: Treatment plan reference ───────────────────────────────────────

class TestASES009:
    def test_fires_for_bh_code_without_auth(self):
        """Use auth field as proxy for treatment-plan reference."""
        c = make_claim(
            codes="90837",
            payer="Plan Vital",
            auth="",
            service_lines=[ServiceLine(cpt="90837", units=1)],
        )
        r = scrub(c)
        assert fired(r, "ASES-009")
        assert sev(r, "ASES-009") == "warning"

    def test_does_not_fire_for_non_bh_code(self):
        c = make_claim(codes="99213", payer="Plan Vital", auth="",
                       service_lines=[ServiceLine(cpt="99213", units=1)])
        r = scrub(c)
        assert not fired(r, "ASES-009")

    def test_does_not_fire_for_medicare(self):
        c = make_claim(codes="90837", payer="Medicare", auth="",
                       service_lines=[ServiceLine(cpt="90837", units=1)])
        r = scrub(c)
        assert not fired(r, "ASES-009")


# ── NCCI-001: Add-on without primary ─────────────────────────────────────────

class TestNCCI001:
    def test_fires_when_addon_alone(self):
        c = make_claim(
            codes="90785",
            service_lines=[ServiceLine(cpt="90785", units=1)],
        )
        r = scrub(c)
        assert fired(r, "NCCI-001")
        assert sev(r, "NCCI-001") == "error"

    def test_does_not_fire_with_primary(self):
        c = make_claim(
            codes="90837 + 90785",
            service_lines=[
                ServiceLine(cpt="90837", units=1),
                ServiceLine(cpt="90785", units=1),
            ],
        )
        r = scrub(c)
        assert not fired(r, "NCCI-001")

    def test_90833_addon_without_em(self):
        c = make_claim(
            codes="90833",
            service_lines=[ServiceLine(cpt="90833", units=1)],
        )
        r = scrub(c)
        assert fired(r, "NCCI-001")

    def test_90833_with_em_code(self):
        c = make_claim(
            codes="99214 25 + 90833",
            service_lines=[
                ServiceLine(cpt="99214", mods=["25"], units=1),
                ServiceLine(cpt="90833", units=1),
            ],
        )
        r = scrub(c)
        assert not fired(r, "NCCI-001")


# ── NCCI-002: Mutually exclusive codes ───────────────────────────────────────

class TestNCCI002:
    def test_fires_for_90839_with_90834(self):
        c = make_claim(
            codes="90839 + 90834",
            service_lines=[
                ServiceLine(cpt="90839", units=1),
                ServiceLine(cpt="90834", units=1),
            ],
        )
        r = scrub(c)
        assert fired(r, "NCCI-002")
        assert sev(r, "NCCI-002") == "error"

    def test_does_not_fire_with_modifier_59(self):
        c = make_claim(
            codes="90839 + 90834 59",
            service_lines=[
                ServiceLine(cpt="90839", units=1),
                ServiceLine(cpt="90834", mods=["59"], units=1),
            ],
        )
        r = scrub(c)
        assert not fired(r, "NCCI-002")

    def test_does_not_fire_with_x_modifier(self):
        c = make_claim(
            codes="90839 + 90834 XE",
            service_lines=[
                ServiceLine(cpt="90839", units=1),
                ServiceLine(cpt="90834", mods=["XE"], units=1),
            ],
        )
        r = scrub(c)
        assert not fired(r, "NCCI-002")


# ── CMS-002: Modifier 25 on E&M with psychotherapy add-on ────────────────────

class TestCMS002:
    def test_fires_when_no_mod25(self):
        c = make_claim(
            codes="99214 + 90833",
            payer="Medicare",
            service_lines=[
                ServiceLine(cpt="99214", mods=[], units=1),
                ServiceLine(cpt="90833", units=1),
            ],
        )
        r = scrub(c)
        assert fired(r, "CMS-002")
        assert sev(r, "CMS-002") == "error"

    def test_does_not_fire_with_mod25(self):
        c = make_claim(
            codes="99214 25 + 90833",
            payer="Medicare",
            service_lines=[
                ServiceLine(cpt="99214", mods=["25"], units=1),
                ServiceLine(cpt="90833", units=1),
            ],
        )
        r = scrub(c)
        assert not fired(r, "CMS-002")

    def test_does_not_fire_without_addon(self):
        c = make_claim(
            codes="99214",
            service_lines=[ServiceLine(cpt="99214", mods=[], units=1)],
        )
        r = scrub(c)
        assert not fired(r, "CMS-002")


# ── CMS-006: Medicare MSP ─────────────────────────────────────────────────────

class TestCMS006:
    def test_fires_for_medicare_claims(self):
        c = make_claim(payer="Medicare")
        r = scrub(c)
        assert fired(r, "CMS-006")
        assert sev(r, "CMS-006") == "warning"

    def test_does_not_fire_for_plan_vital(self):
        c = make_claim(payer="Plan Vital")
        r = scrub(c)
        assert not fired(r, "CMS-006")


# ── DOC-001: Missing NPI ──────────────────────────────────────────────────────

class TestDOC001:
    def test_fires_when_npi_empty(self):
        c = make_claim(npi="")
        r = scrub(c)
        assert fired(r, "DOC-001")
        assert sev(r, "DOC-001") == "error"

    def test_fires_when_npi_too_short(self):
        c = make_claim(npi="12345")
        r = scrub(c)
        assert fired(r, "DOC-001")

    def test_fires_when_npi_has_letters(self):
        c = make_claim(npi="123456789X")
        r = scrub(c)
        assert fired(r, "DOC-001")

    def test_does_not_fire_with_valid_npi(self):
        c = make_claim(npi="1234567890")
        r = scrub(c)
        assert not fired(r, "DOC-001")


# ── DOC-002: Missing diagnosis ────────────────────────────────────────────────

class TestDOC002:
    def test_fires_when_diagnosis_empty(self):
        c = make_claim(diagnosis="")
        r = scrub(c)
        assert fired(r, "DOC-002")
        assert sev(r, "DOC-002") == "error"

    def test_fires_when_diagnosis_is_dash(self):
        c = make_claim(diagnosis="—")
        r = scrub(c)
        assert fired(r, "DOC-002")

    def test_does_not_fire_with_valid_diagnosis(self):
        c = make_claim(diagnosis="F32.1")
        r = scrub(c)
        assert not fired(r, "DOC-002")


# ── DOC-003: Unspecified diagnosis ───────────────────────────────────────────

class TestDOC003:
    def test_fires_for_unspecified_code(self):
        c = make_claim(diagnosis="F32.09", diagnoses=["F32.09"])
        r = scrub(c)
        assert fired(r, "DOC-003")
        assert sev(r, "DOC-003") == "warning"

    def test_does_not_fire_for_specific_code(self):
        c = make_claim(diagnosis="F32.1", diagnoses=["F32.1"])
        r = scrub(c)
        assert not fired(r, "DOC-003")

    def test_does_not_fire_for_z_codes(self):
        c = make_claim(diagnosis="Z03.89", diagnoses=["Z03.89"])
        r = scrub(c)
        assert not fired(r, "DOC-003")


# ── CMS-007: Future date of service ──────────────────────────────────────────

class TestCMS007:
    def test_fires_for_future_date(self):
        c = make_claim(dos="2099-01-01")
        r = scrub(c)
        assert fired(r, "CMS-007")
        assert sev(r, "CMS-007") == "error"

    def test_does_not_fire_for_past_date(self):
        c = make_claim(dos="2026-01-01")
        r = scrub(c)
        assert not fired(r, "CMS-007")

    def test_does_not_fire_for_missing_date(self):
        c = make_claim(dos="—")
        r = scrub(c)
        assert not fired(r, "CMS-007")


# ── PR-PPL-001: Timely filing ─────────────────────────────────────────────────

class TestPRPPL001:
    def test_fires_error_when_expired(self):
        c = make_claim(payer="ASES Mi Salud", dos="2024-01-01")  # >180 days old
        r = scrub(c)
        assert fired(r, "PR-PPL-001")
        assert sev(r, "PR-PPL-001") == "error"

    def test_fires_warning_when_approaching(self):
        from datetime import date, timedelta
        warn_dos = (date.today() - timedelta(days=160)).strftime("%Y-%m-%d")
        c = make_claim(payer="ASES Mi Salud", dos=warn_dos)
        r = scrub(c)
        assert fired(r, "PR-PPL-001")
        assert sev(r, "PR-PPL-001") == "warning"

    def test_does_not_fire_for_fresh_claim(self):
        c = make_claim(payer="ASES Mi Salud", dos="2026-05-20")
        r = scrub(c)
        assert not fired(r, "PR-PPL-001")

    def test_does_not_fire_for_medicare(self):
        c = make_claim(payer="Medicare", dos="2024-01-01")
        r = scrub(c)
        assert not fired(r, "PR-PPL-001")


# ── MMM-001: BH prior auth ────────────────────────────────────────────────────

class TestMMM001:
    def test_fires_when_bh_without_auth(self):
        c = make_claim(
            payer="MMM",
            codes="90837",
            auth="",
            service_lines=[ServiceLine(cpt="90837", units=1)],
        )
        r = scrub(c)
        assert fired(r, "MMM-001")
        assert sev(r, "MMM-001") == "error"

    def test_does_not_fire_when_auth_present(self):
        c = make_claim(
            payer="MMM",
            codes="90837",
            auth="AUTH-9912",
            service_lines=[ServiceLine(cpt="90837", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MMM-001")

    def test_does_not_fire_for_plan_vital(self):
        c = make_claim(
            payer="Plan Vital",
            codes="90837",
            auth="",
            service_lines=[ServiceLine(cpt="90837", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MMM-001")


# ── TS-001: BlueCard routing ──────────────────────────────────────────────────

class TestTS001:
    def test_fires_for_non_pr_member_id(self):
        c = make_claim(payer="Triple-S", member_id="XYZ-9988")
        r = scrub(c)
        assert fired(r, "TS-001")
        assert sev(r, "TS-001") == "warning"

    def test_does_not_fire_for_pr_prefix(self):
        c = make_claim(payer="Triple-S", member_id="R12345")
        r = scrub(c)
        assert not fired(r, "TS-001")

    def test_does_not_fire_when_no_member_id(self):
        c = make_claim(payer="Triple-S", member_id="")
        r = scrub(c)
        assert not fired(r, "TS-001")


# ── Lane assignment ───────────────────────────────────────────────────────────

class TestLaneAssignment:
    def test_clean_claim_is_auto_clear(self):
        c = make_claim(
            codes="90834 GT",
            payer="Plan Vital",
            auth="AUTH-4421",
            pos="02",
            service_lines=[ServiceLine(cpt="90834", mods=["GT"], units=1)],
        )
        r = scrub(c)
        assert r.lane == Lane.auto_clear
        assert r.risk <= 14
        assert not any(i.sev == Severity.error for i in r.issues)

    def test_error_forces_needs_work(self):
        c = make_claim(npi="")  # DOC-001 error
        r = scrub(c)
        assert r.lane == Lane.needs_work

    def test_warning_only_is_quick_review(self):
        c = make_claim(payer="Medicare")  # CMS-006 warning only
        r = scrub(c)
        assert r.lane == Lane.quick_review

    def test_risk_capped_at_100(self):
        c = make_claim(
            payer="Plan Vital",
            auth="",
            npi="",
            diagnosis="",
            codes="H0004 ×10 + 90839 + 90834",
            service_lines=[
                ServiceLine(cpt="H0004", units=10),
                ServiceLine(cpt="90839", units=1),
                ServiceLine(cpt="90834", units=1),
            ],
        )
        r = scrub(c)
        assert r.risk <= 100


# ── Payer normalization ───────────────────────────────────────────────────────

class TestPayerNormalization:
    def test_uppercase_plan_vital_normalizes(self):
        c = make_claim(
            payer="PLAN VITAL",
            codes="H0004 ×10",
            auth="",
            service_lines=[ServiceLine(cpt="H0004", units=10)],
        )
        r = scrub(c)
        assert r.payer == "Plan Vital"
        assert fired(r, "ASES-001"), "Rules should fire after normalization"

    def test_medicare_case_insensitive(self):
        c = make_claim(payer="medicare")
        r = scrub(c)
        assert r.payer == "Medicare"
        assert fired(r, "CMS-006")


# ── Service lines rebuilt from codes string ───────────────────────────────────

class TestServiceLinesFallback:
    def test_rules_fire_with_only_codes_string(self):
        """Frontend sends service_lines=[] but codes string — engine should rebuild."""
        c = ParsedClaim(
            id="FALLBACK-001",
            payer="Plan Vital",
            codes="H0004 ×10",
            service_lines=[],        # empty — as sent by frontend pre-analysis
            npi="1234567890",
            diagnosis="F32.1",
            dos="2026-05-20",
            auth="",
        )
        r = scrub(c)
        assert fired(r, "ASES-001"), "Unit cap should fire even with empty service_lines"
        assert len(r.service_lines) > 0, "Engine should populate service_lines"

    def test_ncci_fires_with_only_codes_string(self):
        c = ParsedClaim(
            id="FALLBACK-002",
            payer="ASES Mi Salud",
            codes="90839 + 90834",
            service_lines=[],
            npi="1234567890",
            diagnosis="F41.0",
            dos="2026-05-20",
        )
        r = scrub(c)
        assert fired(r, "NCCI-002"), "NCCI conflict should fire via codes-string fallback"


# ── CSV parser integration ────────────────────────────────────────────────────

class TestCSVParser:
    def test_clean_csv_parses_correctly(self):
        csv_text = (
            "id,patient,codes,payer,provider,npi,dos,billed,auth,pos,diagnosis\n"
            "TST-001,Juan Garcia,90834 GT,Plan Vital,Dr. Rivera,1234567890,2026-05-20,245.00,AUTH-4421,02,F32.1\n"
        )
        claims = parse_csv(csv_text)
        assert len(claims) == 1
        c = claims[0]
        assert c.id == "TST-001"
        assert c.npi == "1234567890"
        assert c.auth == "AUTH-4421"
        assert c.pos == "02"
        assert c.diagnosis == "F32.1"
        assert len(c.service_lines) == 1
        assert c.service_lines[0].cpt == "90834"
        assert "GT" in c.service_lines[0].mods

    def test_csv_scrub_end_to_end(self):
        csv_text = (
            "id,patient,codes,payer,provider,npi,dos,billed,auth,pos,diagnosis\n"
            "ERR-001,Rosa Martinez,H0004 ×10,Plan Vital,Dr. Rivera,1234567890,2026-05-20,640.00,,11,F32.1\n"
        )
        claims = parse_csv(csv_text)
        from rules.engine import scrub_many
        results = scrub_many(claims)
        assert results[0].lane == Lane.needs_work
        assert fired(results[0], "ASES-001")


# ── EDI 837 parser integration ────────────────────────────────────────────────

class TestEDIParser:
    EDI = (
        "ISA*00*          *00*          *ZZ*REVENUEMD       *ZZ*INMEDIATA      "
        "*260101*1200*^*00501*000000001*0*P*:~\n"
        "GS*HC*REVENUEMD*INMEDIATA*20260101*1200*1*X*005010X222A1~\n"
        "ST*837*0001*005010X222A1~\n"
        "NM1*85*2*CLINICA TEST*****XX*9876543210~\n"
        "HL*1**20*1~\n"
        "HL*2*1*22*1~\n"
        "NM1*IL*1*GARCIA*JUAN****MI*PV-12345~\n"
        "NM1*PR*2*PLAN VITAL*****PI*PLANVITAL~\n"
        "CLM*EDI-TEST-001*245***02:B:1*Y*A*Y*I~\n"
        "DTP*472*D8*20260120~\n"
        "REF*G1*AUTH-9999~\n"
        "HI*ABK:F32.1~\n"
        "LX*1~\n"
        "SV1*HC:90837:GT*245*UN*1***1~\n"
        "SE*14*0001~\n"
        "GE*1*1~\n"
        "IEA*1*000000001~\n"
    )

    def test_parses_one_claim(self):
        claims = parse_837(self.EDI)
        assert len(claims) == 1

    def test_correct_payer_extracted(self):
        claims = parse_837(self.EDI)
        assert claims[0].payer == "PLAN VITAL"

    def test_npi_extracted(self):
        claims = parse_837(self.EDI)
        assert claims[0].npi == "9876543210"

    def test_auth_extracted(self):
        claims = parse_837(self.EDI)
        assert claims[0].auth == "AUTH-9999"

    def test_diagnosis_extracted(self):
        claims = parse_837(self.EDI)
        assert claims[0].diagnosis == "F32.1"

    def test_service_line_extracted(self):
        claims = parse_837(self.EDI)
        assert len(claims[0].service_lines) == 1
        sl = claims[0].service_lines[0]
        assert sl.cpt == "90837"
        assert "GT" in sl.mods

    def test_telehealth_clean_with_gt(self):
        """GT modifier + POS 02 → should be auto-clear."""
        from rules.engine import scrub_many
        claims = parse_837(self.EDI)
        results = scrub_many(claims)
        assert not fired(results[0], "ASES-003"), "GT modifier present — no telehealth error"


# ── Bilingual output ──────────────────────────────────────────────────────────

class TestBilingualOutput:
    def test_issues_have_en_and_es(self):
        c = make_claim(npi="")
        r = scrub(c)
        for iss in r.issues:
            assert iss.tEn, f"{iss.code} missing tEn"
            assert iss.tEs, f"{iss.code} missing tEs"
            assert iss.dEn, f"{iss.code} missing dEn"
            assert iss.dEs, f"{iss.code} missing dEs"

    def test_fixes_have_en_and_es(self):
        c = make_claim(npi="")
        r = scrub(c)
        for fix in r.fix:
            assert fix.tEn, "fix missing tEn"
            assert fix.tEs, "fix missing tEs"
            assert fix.wEn, "fix missing wEn"
            assert fix.wEs, "fix missing wEs"

    def test_summary_strings_populated(self):
        c = make_claim(npi="")
        r = scrub(c)
        assert r.sEn and len(r.sEn) > 20
        assert r.sEs and len(r.sEs) > 20

    def test_ien_ies_populated_when_issues(self):
        c = make_claim(npi="")
        r = scrub(c)
        assert r.iEn, "iEn should be populated when there are issues"
        assert r.iEs, "iEs should be populated when there are issues"

    def test_ien_empty_for_clean_claim(self):
        c = make_claim(
            codes="90834 GT",
            payer="Plan Vital",
            auth="AUTH-4421",
            pos="02",
            service_lines=[ServiceLine(cpt="90834", mods=["GT"], units=1)],
        )
        r = scrub(c)
        assert r.iEn == ""
        assert r.iEs == ""


# ── MCS-001: NPI required for MA enrollment check ─────────────────────────────

class TestMCS001:
    def test_fires_when_npi_missing(self):
        c = make_claim(
            payer="MCS",
            npi="",
            service_lines=[ServiceLine(cpt="99213", units=1)],
        )
        r = scrub(c)
        assert fired(r, "MCS-001")
        assert sev(r, "MCS-001") == "error"

    def test_does_not_fire_when_npi_present(self):
        c = make_claim(
            payer="MCS",
            npi="1234567890",
            service_lines=[ServiceLine(cpt="99213", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MCS-001")

    def test_does_not_fire_for_other_payers(self):
        c = make_claim(payer="Plan Vital", npi="")
        r = scrub(c)
        assert not fired(r, "MCS-001")


# ── MCS-002: MSP verification always flagged ──────────────────────────────────

class TestMCS002:
    def test_always_fires_for_mcs(self):
        c = make_claim(payer="MCS")
        r = scrub(c)
        assert fired(r, "MCS-002")
        assert sev(r, "MCS-002") == "warning"

    def test_does_not_fire_for_other_payers(self):
        c = make_claim(payer="Plan Vital")
        r = scrub(c)
        assert not fired(r, "MCS-002")


# ── MCS-003: Specialist/high-cost imaging PA verification ────────────────────

class TestMCS003:
    def test_fires_for_flagged_cpt_without_auth(self):
        c = make_claim(
            payer="MCS",
            codes="70551",
            auth="",
            service_lines=[ServiceLine(cpt="70551", units=1)],
        )
        r = scrub(c)
        assert fired(r, "MCS-003")
        assert sev(r, "MCS-003") == "warning"

    def test_does_not_fire_when_auth_present(self):
        c = make_claim(
            payer="MCS",
            codes="70551",
            auth="AUTH-9001",
            service_lines=[ServiceLine(cpt="70551", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MCS-003")

    def test_does_not_fire_for_non_flagged_cpt(self):
        c = make_claim(
            payer="MCS",
            codes="99213",
            auth="",
            service_lines=[ServiceLine(cpt="99213", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MCS-003")


class TestMCSPayerNormalization:
    def test_mcs_classicare_routes_to_mcs_rules(self):
        c = make_claim(payer="MCS Classicare", npi="")
        r = scrub(c)
        assert fired(r, "MCS-001"), "payer aliases should normalize to MCS"

    def test_mcs_platino_routes_to_mcs_rules(self):
        c = make_claim(payer="MCS Platino", npi="")
        r = scrub(c)
        assert fired(r, "MCS-001"), "payer aliases should normalize to MCS"


# ── MOD-001: Duplicate CPT without distinguishing modifier ───────────────────

class TestMOD001:
    def test_fires_for_duplicate_cpt_no_modifier(self):
        c = make_claim(
            codes="99213, 99213",
            service_lines=[
                ServiceLine(cpt="99213", mods=[], units=1),
                ServiceLine(cpt="99213", mods=[], units=1),
            ],
        )
        r = scrub(c)
        assert fired(r, "MOD-001")
        assert sev(r, "MOD-001") == "warning"

    def test_does_not_fire_with_modifier_59(self):
        c = make_claim(
            service_lines=[
                ServiceLine(cpt="99213", mods=[], units=1),
                ServiceLine(cpt="99213", mods=["59"], units=1),
            ],
        )
        r = scrub(c)
        assert not fired(r, "MOD-001")

    def test_does_not_fire_with_laterality_modifier(self):
        c = make_claim(
            service_lines=[
                ServiceLine(cpt="99213", mods=["LT"], units=1),
                ServiceLine(cpt="99213", mods=["RT"], units=1),
            ],
        )
        r = scrub(c)
        assert not fired(r, "MOD-001")

    def test_does_not_fire_for_single_occurrence(self):
        c = make_claim(service_lines=[ServiceLine(cpt="99213", mods=[], units=1)])
        r = scrub(c)
        assert not fired(r, "MOD-001")


# ── MOD-002: E&M + separate procedure, no modifier 25 ─────────────────────────

class TestMOD002:
    def test_fires_for_em_plus_procedure_no_mod25(self):
        c = make_claim(
            codes="99214, 96127",
            service_lines=[
                ServiceLine(cpt="99214", mods=[], units=1),
                ServiceLine(cpt="96127", mods=[], units=1),
            ],
        )
        r = scrub(c)
        assert fired(r, "MOD-002")

    def test_does_not_fire_with_mod25_present(self):
        c = make_claim(
            service_lines=[
                ServiceLine(cpt="99214", mods=["25"], units=1),
                ServiceLine(cpt="96127", mods=[], units=1),
            ],
        )
        r = scrub(c)
        assert not fired(r, "MOD-002")

    def test_does_not_fire_for_em_alone(self):
        c = make_claim(service_lines=[ServiceLine(cpt="99214", mods=[], units=1)])
        r = scrub(c)
        assert not fired(r, "MOD-002")

    def test_skips_addon_case_handled_by_cms002(self):
        # 90833/90836 + E&M is CMS-002's job — MOD-002 should stay silent here
        # to avoid a redundant duplicate issue for the same scenario.
        c = make_claim(
            payer="MMM",  # avoid MMM-001 BH-auth noise by using an unrelated code below
            auth="AUTH-1",
            service_lines=[
                ServiceLine(cpt="99214", mods=[], units=1),
                ServiceLine(cpt="90833", mods=[], units=1),
            ],
        )
        r = scrub(c)
        assert not fired(r, "MOD-002")


# ── MOD-003: PC/TC split code in facility POS without modifier 26 ────────────

class TestMOD003:
    def test_fires_in_facility_pos_without_modifier(self):
        c = make_claim(
            pos="22",
            service_lines=[ServiceLine(cpt="93000", mods=[], units=1)],
        )
        r = scrub(c)
        assert fired(r, "MOD-003")

    def test_does_not_fire_with_modifier_26(self):
        c = make_claim(
            pos="22",
            service_lines=[ServiceLine(cpt="93000", mods=["26"], units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MOD-003")

    def test_does_not_fire_in_office_pos(self):
        c = make_claim(
            pos="11",
            service_lines=[ServiceLine(cpt="93000", mods=[], units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MOD-003")

    def test_does_not_fire_for_non_split_code(self):
        c = make_claim(
            pos="22",
            service_lines=[ServiceLine(cpt="99213", mods=[], units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MOD-003")


# ── CPT II Code Finder ────────────────────────────────────────────────────────

class TestCPT2Finder:
    def test_fires_hba1c_opportunity_for_diabetes(self):
        c = make_claim(diagnosis="E11.9", diagnoses=["E11.9"])
        r = scrub(c)
        assert any(i.code.startswith("CPT2-") for i in r.issues)

    def test_does_not_fire_when_hba1c_code_already_present(self):
        c = make_claim(
            diagnosis="E11.9", diagnoses=["E11.9"],
            codes="99213, 3044F",
            service_lines=[
                ServiceLine(cpt="99213", mods=[], units=1),
                ServiceLine(cpt="3044F", mods=[], units=1),
            ],
        )
        r = scrub(c)
        assert not any(i.code.startswith("CPT2-") for i in r.issues)

    def test_fires_bp_control_opportunity_for_hypertension(self):
        c = make_claim(diagnosis="I10", diagnoses=["I10"])
        r = scrub(c)
        assert any(i.code.startswith("CPT2-") for i in r.issues)

    def test_does_not_fire_for_unrelated_diagnosis(self):
        c = make_claim(diagnosis="Z00.00", diagnoses=["Z00.00"])
        r = scrub(c)
        assert not any(i.code.startswith("CPT2-") for i in r.issues)

    def test_is_informational_severity(self):
        c = make_claim(diagnosis="E11.9", diagnoses=["E11.9"])
        r = scrub(c)
        cpt2_issue = next(i for i in r.issues if i.code.startswith("CPT2-"))
        assert cpt2_issue.sev == Severity.info


# ── MUE-001: Medically Unlikely Edits ──────────────────────────────────────────

class TestMUE001:
    def test_fires_when_over_cap(self):
        c = make_claim(
            codes="90837",
            diagnosis="F32.1", diagnoses=["F32.1"],
            service_lines=[ServiceLine(cpt="90837", units=2)],
        )
        r = scrub(c)
        assert fired(r, "MUE-001")
        assert sev(r, "MUE-001") == "error"

    def test_does_not_fire_at_cap(self):
        c = make_claim(
            codes="90837",
            diagnosis="F32.1", diagnoses=["F32.1"],
            service_lines=[ServiceLine(cpt="90837", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MUE-001")

    def test_does_not_fire_for_uncapped_code(self):
        c = make_claim(
            codes="H0004",
            service_lines=[ServiceLine(cpt="H0004", units=6)],
        )
        r = scrub(c)
        assert not fired(r, "MUE-001")

    def test_does_not_overlap_with_ases001_for_h0004(self):
        # H0004 is governed by ASES-001 (payer-scoped), not MUE-001 —
        # confirm MUE-001 stays silent even when way over what would be
        # a plausible unit count, since it's simply not in MUE_CAPS.
        c = make_claim(
            payer="ASES Mi Salud", auth="",
            codes="H0004",
            service_lines=[ServiceLine(cpt="H0004", units=10)],
        )
        r = scrub(c)
        assert fired(r, "ASES-001")
        assert not fired(r, "MUE-001")


# ── MDX-001: Missing Diagnosis Support ────────────────────────────────────────

class TestMDX001:
    def test_fires_for_psychotherapy_with_unrelated_dx(self):
        c = make_claim(
            codes="90837",
            diagnosis="I50.9", diagnoses=["I50.9"],
            service_lines=[ServiceLine(cpt="90837", units=1)],
        )
        r = scrub(c)
        assert fired(r, "MDX-001")
        assert sev(r, "MDX-001") == "error"

    def test_fires_for_psychotherapy_with_no_diagnosis(self):
        c = make_claim(
            codes="90837", diagnosis="", diagnoses=[],
            service_lines=[ServiceLine(cpt="90837", units=1)],
        )
        r = scrub(c)
        assert fired(r, "MDX-001")

    def test_does_not_fire_with_behavioral_health_dx(self):
        c = make_claim(
            codes="90837",
            diagnosis="F32.1", diagnoses=["F32.1"],
            service_lines=[ServiceLine(cpt="90837", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MDX-001")

    def test_does_not_fire_for_general_em_code(self):
        # 99213 isn't in the DX_SUPPORT_MAP — any diagnosis is plausible for
        # a general office visit, so this should never fire for it.
        c = make_claim(
            codes="99213",
            diagnosis="I50.9", diagnoses=["I50.9"],
            service_lines=[ServiceLine(cpt="99213", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MDX-001")

    def test_checks_singular_diagnosis_field_too(self):
        # Some claim sources only populate `diagnosis`, not the `diagnoses`
        # list — confirm the check still passes correctly in that case.
        c = make_claim(
            codes="90837", diagnosis="F32.1", diagnoses=[],
            service_lines=[ServiceLine(cpt="90837", units=1)],
        )
        r = scrub(c)
        assert not fired(r, "MDX-001")


# ── HCC-001: HCC-relevant diagnosis flag ──────────────────────────────────────

class TestHCC001:
    def test_fires_for_chf(self):
        c = make_claim(diagnoses=["I50.9"])
        r = scrub(c)
        assert fired(r, "HCC-001")
        assert sev(r, "HCC-001") == "info"

    def test_fires_for_active_cancer(self):
        c = make_claim(diagnoses=["C50.911"])  # breast cancer
        r = scrub(c)
        assert fired(r, "HCC-001")

    def test_fires_for_hiv(self):
        c = make_claim(diagnoses=["B20"])
        r = scrub(c)
        assert fired(r, "HCC-001")

    def test_fires_for_substance_dependence(self):
        c = make_claim(diagnoses=["F11.20"])  # opioid dependence
        r = scrub(c)
        assert fired(r, "HCC-001")

    def test_fires_for_amputation_status(self):
        c = make_claim(diagnoses=["Z89.511"])
        r = scrub(c)
        assert fired(r, "HCC-001")

    def test_fires_for_transplant_status(self):
        c = make_claim(diagnoses=["Z94.0"])
        r = scrub(c)
        assert fired(r, "HCC-001")

    def test_fires_for_cirrhosis(self):
        c = make_claim(diagnoses=["K74.60"])
        r = scrub(c)
        assert fired(r, "HCC-001")

    def test_fires_for_diabetes_with_complication(self):
        c = make_claim(diagnoses=["E11.22"])
        r = scrub(c)
        assert fired(r, "HCC-001")

    def test_does_not_fire_for_plain_diabetes_unspecified(self):
        # E11.9 has no complication — not itself an HCC category prefix match
        c = make_claim(diagnoses=["E11.9"])
        r = scrub(c)
        assert not fired(r, "HCC-001")

    def test_does_not_fire_for_unrelated_diagnosis(self):
        c = make_claim(diagnoses=["Z00.00"])
        r = scrub(c)
        assert not fired(r, "HCC-001")

    def test_fires_regardless_of_payer(self):
        for payer in ("Plan Vital", "Medicare", "MCS", "Triple-S"):
            c = make_claim(payer=payer, diagnoses=["I50.9"])
            r = scrub(c)
            assert fired(r, "HCC-001"), f"HCC-001 should fire regardless of payer ({payer})"

    def test_does_not_force_needs_work_lane(self):
        # Informational-only — shouldn't push an otherwise-clean claim into needs_work.
        # Uses 99213 (not a behavioral-health code) so MDX-001 (Missing Dx Support)
        # doesn't also fire here — that's a separate, legitimate check that this
        # test isn't about.
        c = make_claim(
            codes="99213 GT", payer="Plan Vital", auth="AUTH-4421", pos="02",
            diagnosis="I50.9", diagnoses=["I50.9"],
            service_lines=[ServiceLine(cpt="99213", mods=["GT"], units=1)],
        )
        r = scrub(c)
        assert fired(r, "HCC-001")
        assert r.lane != Lane.needs_work

    def test_multiple_matches_mentions_count(self):
        c = make_claim(diagnoses=["I50.9", "J44.9", "F33.1"])
        r = scrub(c)
        assert fired(r, "HCC-001")
        issue = next(i for i in r.issues if i.code == "HCC-001")
        assert "+2 more" in issue.tEn


# ── Score calculations ────────────────────────────────────────────────────────

class TestScores:
    def test_compliance_deducted_for_errors(self):
        c = make_claim(npi="", diagnosis="")  # two errors
        r = scrub(c)
        assert r.comp < 100

    def test_doc_score_deducted_for_doc_issues(self):
        c = make_claim(npi="", diagnosis="")
        r = scrub(c)
        assert r.doc < 100

    def test_clean_claim_high_scores(self):
        c = make_claim(
            codes="90834 GT",
            payer="Plan Vital",
            auth="AUTH-4421",
            pos="02",
            service_lines=[ServiceLine(cpt="90834", mods=["GT"], units=1)],
        )
        r = scrub(c)
        assert r.comp == 100
        assert r.doc == 100
