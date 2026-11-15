"""Briefings must say the same thing as the facts file, and stay readable."""

import json
import re
from pathlib import Path

import pytest
from pptx import Presentation

import readability as rd

ROOT = Path(__file__).resolve().parent.parent
FACTS = {k: v for k, v in json.loads((ROOT / "data" / "briefing_facts.json").read_text()).items()
         if not k.startswith("_")}
F = {k: v["value"] for k, v in FACTS.items()}
SUMMARY = (ROOT / "briefings" / "executive_summary_2026-11.md").read_text(encoding="utf-8")
DECK = ROOT / "briefings" / "leadership_briefing_2026-11.pptx"
WORDS = {1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight",
         9: "nine", 12: "12", 15: "15"}

SOURCE_REPOS = ("risk-assessment-800-30/", "control-audit-evidence-kit/",
                "policy-and-poam-program/", "rmf-ato-package-templates/")


def deck_text():
    prs = Presentation(DECK)
    out = []
    for slide in prs.slides:
        for shape in slide.shapes:
            if shape.has_text_frame:
                out.append(shape.text_frame.text)
    return "\n".join(out)


def long_date(iso):
    y, m, d = (int(x) for x in iso.split("-"))
    months = ["January", "February", "March", "April", "May", "June", "July", "August",
              "September", "October", "November", "December"]
    return f"{months[m - 1]} {d}"


# --- The facts file ---------------------------------------------------------

def test_every_fact_names_its_source():
    for key, fact in FACTS.items():
        assert set(fact) == {"value", "source"}, key
        assert fact["source"].startswith(SOURCE_REPOS), f"{key}: {fact['source']}"


def test_facts_add_up():
    assert F["risks_high"] + F["risks_moderate"] + F["risks_low"] + F["risks_very_low"] == F["risks_total"]
    assert F["controls_passed"] + F["findings"] == F["controls_tested"]
    assert F["findings_fixed_during_audit"] < F["findings"]
    assert F["poam_overdue"] <= F["poam_active"]


# --- Executive summary -------------------------------------------------------

@pytest.mark.parametrize("phrase", [
    lambda: f"**{WORDS[F['risks_high']]} High risk**",
    lambda: f"**{F['employees']:,} employees**",
    lambda: f"**${F['mfa_cost_usd']}**",
    lambda: f"**{long_date(F['mfa_due'])}**",
    lambda: f"for the {F['hr_role_users']} HR staff",
    lambda: f"ordered by\n   {long_date(F['mfa_purchase_milestone'])}",
    lambda: f"We rated {F['risks_total']} ways",
    lambda: f"One is High, {WORDS[F['risks_moderate']]} are Moderate, and {WORDS[F['risks_low'] + F['risks_very_low']]}",
    lambda: f"tested {F['controls_tested']} key controls. {WORDS[F['controls_passed']].capitalize()} worked",
    lambda: f"{WORDS[F['findings']].capitalize()} fell short",
    lambda: f"{WORDS[F['dormant_accounts']].capitalize()} unused accounts",
    lambda: f"only {F['log_review_weeks_documented']} of {F['log_review_weeks_total']} weeks",
    lambda: f"tracking {F['poam_active']} open fixes",
    lambda: f"**One is {WORDS[F['poam_overdue_days']]} days late:**",
    lambda: f"it goes in on {long_date(F['poam_overdue_fix_date'])}",
    lambda: f"on {long_date(F['cp_tabletop'])}",
    lambda: f"on {long_date(F['cp_restore_test'])}",
], ids=lambda f: f().strip("*")[:40])
def test_summary_matches_facts(phrase):
    assert phrase() in SUMMARY


def test_summary_leads_with_bottom_line():
    headings = re.findall(r"^## (.+)$", SUMMARY, flags=re.M)
    assert headings[:2] == ["Bottom line", "Three decisions for you"]


def test_summary_has_no_control_ids_in_main_text():
    # Rule 4 of the translation guide: no control IDs or finding IDs for leadership.
    main = SUMMARY.split("## Where the details are")[0]
    assert not re.search(r"\b[A-Z]{2}-\d{1,2}(\(\d+\))?\b|AHR-\d{4}|POAM-\d{4}|\bR-\d{2}\b", main)


# --- Deck --------------------------------------------------------------------

def test_deck_has_seven_slides_with_notes():
    prs = Presentation(DECK)
    assert len(prs.slides) == 7
    for i, slide in enumerate(prs.slides, start=1):
        assert slide.has_notes_slide and slide.notes_slide.notes_text_frame.text.strip(), f"slide {i}"


@pytest.mark.parametrize("phrase", [
    lambda: f"${F['mfa_cost_usd']}",
    lambda: f"{F['employees']:,} employees",
    lambda: f"{F['risks_total']} risks rated",
    lambda: f"Audit: {F['controls_passed']} of {F['controls_tested']} controls worked",
    lambda: f"Fixes: {F['poam_active'] - F['poam_overdue']} of {F['poam_active']} on schedule",
    lambda: f"{F['log_review_weeks_documented']} of {F['log_review_weeks_total']} weeks",
    lambda: f"{F['poam_overdue_days']} days late",
    lambda: "Three decisions for you today",
], ids=lambda f: f()[:40])
def test_deck_matches_facts(phrase):
    assert phrase() in deck_text()


def test_deck_pdf_is_committed():
    assert (ROOT / "briefings" / "leadership_briefing_2026-11.pdf").stat().st_size > 10_000


# --- Readability -------------------------------------------------------------

def test_all_targets_within_grade_limits():
    rows = rd.check()
    assert len(rows) == 7
    for path, grade, limit in rows:
        assert grade <= limit, f"{path.name}: grade {grade} > {limit}"


def test_grade_orders_simple_below_complex():
    simple = "The cat sat on the mat. It was a good day."
    hard = ("Organizations should implement phishing-resistant multi-factor authentication for "
            "privileged accounts because adversary-in-the-middle techniques can relay credentials.")
    assert rd.grade(simple) < 2 < 14 < rd.grade(hard)


def test_wrapped_lines_are_one_sentence():
    assert rd.prose("One sentence that wraps\nonto a second line.") == "One sentence that wraps onto a second line."


def test_tables_headings_and_quotes_are_skipped():
    md = "# Title\n\n> note\n\n| a | b |\n|---|---|\n| c | d |\n\nReal text here."
    assert rd.prose(md) == "Real text here."


def test_list_items_are_separate_sentences():
    assert rd.prose("- first item\n- second item") == "first item. second item."


@pytest.mark.parametrize("word,expected", [
    ("cat", 1), ("table", 2), ("security", 4), ("authorization", 5), ("MFA", 3), ("1,200", 1), ("used", 1),
])
def test_syllables(word, expected):
    assert rd.syllables(word) == expected


def test_cli(capsys):
    assert rd.main(["readability.py"]) == 0
    assert "FAIL" not in capsys.readouterr().out
