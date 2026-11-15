# security-risk-briefings

[![tests](https://github.com/CauseSpark/security-risk-briefings/actions/workflows/tests.yml/badge.svg)](https://github.com/CauseSpark/security-risk-briefings/actions/workflows/tests.yml)

Explaining security risk to people who aren't security people. This repo turns the technical
results from my risk assessment, audit, and POA&M repos into:

- a **one-page executive summary** that leads with three decisions,
- a **7-slide leadership briefing** with speaker notes ([PDF](briefings/leadership_briefing_2026-11.pdf) · [PowerPoint](briefings/leadership_briefing_2026-11.pptx)),
- **five plain-language explainers** for staff,
- a **translation guide** that shows the same finding written for an assessor and for an executive,
- **templates** for status emails and decision memos.

Tests make sure every number in every briefing matches the source data, and a readability
check holds the writing to a reading-grade limit.

> **Personal study material.** The briefings are written as the fictional ISSO of the fictional
> Acme HR Portal would write them. All names, figures, and decisions are invented.

## Purpose

In a GRC job, the work only pays off if someone acts on it. A leader with ten minutes doesn't
need control IDs. They need to know what could happen, how likely it is, what fixing it costs,
and what to decide today. This repo practices that translation and makes it checkable.

## Quick start

```bash
git clone https://github.com/CauseSpark/security-risk-briefings.git
cd security-risk-briefings
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt

python src/readability.py     # reading grade for every briefing and explainer
pytest

# Rebuild the deck (Node 20.9+)
cd deck && npm install && node build_deck.js
```

## The leadership briefing

| # | Slide | What it shows |
|---|---|---|
| 1 | HR Portal security review | Title |
| 2 | The bottom line | Three stat cards: 1 High risk, $750 to close it, 3 decisions |
| 3 | Our one High risk | The phishing attack as a four-step story, then the fix and its cost |
| 4 | 15 risks rated, most of them low | Native bar chart by risk level, plus what happens to each group |
| 5 | Audit: 7 of 12 controls worked | Doughnut chart, plus the four open findings in plain words |
| 6 | Fixes: 7 of 8 on schedule | Status cards and a timeline of the next seven milestones |
| 7 | Three decisions for you today | One card per decision, with cost and date |

The deck is built by `deck/build_deck.js` from `data/briefing_facts.json`, so changing a number in
the facts file changes it everywhere. Charts are native PowerPoint charts, not pictures, so they
stay editable.

## The executive summary

[`briefings/executive_summary_2026-11.md`](briefings/executive_summary_2026-11.md) is one page,
in this order:

1. **Bottom line:** the portal is safe to run, one High risk, and a $750 fix by December 11
2. **Three decisions:** each one with a cost and a date
3. **What we found:** risks and audit results, with no control IDs
4. **Fix progress:** including the one late item, by name, with the reason
5. **What's going well:** so the report isn't only bad news
6. **Where the details are:** links to the technical repos

## Explainers

| Explainer | For | Grade |
|---|---|---|
| [What is a POA&M?](explainers/what_is_a_poam.md) | Anyone | 2.8 |
| [Why HR is getting security keys](explainers/why_phishing_resistant_mfa.md) | HR staff | 3.0 |
| [How we rate security risk](explainers/how_we_rate_risk.md) | Managers | 3.6 |
| [Why old accounts are a problem](explainers/why_old_accounts_matter.md) | IT and HR | 4.0 |
| [What an "ATO" means](explainers/what_an_ato_means.md) | System owners | 5.0 |

Grades are Flesch-Kincaid, measured by `src/readability.py`. Explainers must stay at grade 6 or
below, the executive summary at 8 or below, and the status email template at 6 or below.

## What the tests check

| Check | Example |
|---|---|
| Every fact names the repo and file it came from | `"poam_overdue": {"value": 1, "source": "policy-and-poam-program/reports/..."}` |
| Facts agree with each other | High + Moderate + Low + Very Low = 15 risks |
| The summary matches the facts | "tested 12 key controls. Seven worked", "only 5 of 12 weeks" |
| The summary has no control IDs | No `AC-2(3)`, `AHR-2026-001`, or `POAM-0008` above the appendix |
| The deck matches the facts | Slide titles and stat cards, read with python-pptx |
| Every slide has speaker notes | 7 of 7 |
| Reading grade stays under each limit | 7 documents |

## What's in the repo

| Path | What it is |
|---|---|
| `briefings/` | Executive summary, and the deck as .pptx and .pdf |
| `explainers/` | Five plain-language explainers |
| `translation_guide.md` | Six writing rules and eight before-and-after examples |
| `templates/` | Monthly status email and decision memo |
| `data/briefing_facts.json` | 27 facts, each with its source |
| `deck/` | The deck builder (pptxgenjs) |
| `src/readability.py` | Flesch-Kincaid grade checker that understands markdown |
| `tests/` | 44 pytest cases |

## What this demonstrates

- **Communication:** bottom line first, a clear ask with cost and date, plain language, and balance
- **Translation:** the same finding written for an assessor and for an executive, side by side
- **Accuracy under simplification:** simpler words, but the same numbers as the source, checked by tests
- **Presentation design:** native charts, one message per slide, and speaker notes for live delivery

## Related repos

Part 4 of a four-repo series on the same fictional system:

1. [risk-assessment-800-30](https://github.com/CauseSpark/risk-assessment-800-30): what could go wrong and how bad it is
2. [control-audit-evidence-kit](https://github.com/CauseSpark/control-audit-evidence-kit): how the controls were tested and what evidence backs each result
3. [policy-and-poam-program](https://github.com/CauseSpark/policy-and-poam-program): the policies and the POA&M tracker that drives the fixes
4. **security-risk-briefings** (this repo): how it's explained to leadership

## Disclaimer

This repository is personal study material created for learning and portfolio purposes:

- It is **not** affiliated with or endorsed by NIST, the DoD, or any employer or client.
- All names, figures, costs, and decisions are fictional.

## License

[MIT](LICENSE) © 2026 Peyton Seay
