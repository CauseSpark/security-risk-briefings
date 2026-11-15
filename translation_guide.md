# Translation guide: from finding to business language

How I turn assessment language into something a leader can act on in under a minute. Each row
is a real finding or risk from this series, written two ways.

## The rules I follow

1. **Lead with the decision or the bottom line.** Put background after it.
2. **Say what could happen, to whom, and how many.** "1,200 employees' records," not "PII exposure."
3. **Give the cost and the date.** A leader can approve "$750 by November 20." A leader can't approve "implement IA-2(1)."
4. **Drop control IDs and acronyms from the main text.** Keep them in an appendix for the people who need to trace them.
5. **Say what's going well too.** A report that is only bad news reads as alarm, and people start to tune it out.
6. **Don't soften a rating or inflate it.** If it's High, say High and say why. Overstating risk spends trust you'll need later.

## Before and after

| Technical version | Leadership version |
|---|---|
| R-01: Adversarial threat event (AiTM phishing) against HR roles; likelihood High (G-5: VH initiation × M adverse impact), impact High; risk **High**. Recommend IA-2(1) phishing-resistant authenticators and SI-4 exfiltration analytics. | A phishing email could let an attacker sign in as an HR staff member and download records for all 1,200 employees. Security keys for the 15 HR staff cost about $750 and close this by December 11. |
| AHR-2026-001: AC-2(3) other than satisfied. 6 local/service accounts exceeded the 35-day inactivity ODP (41–97 days). | Six unused accounts on the portal's servers were still turned on. We've turned them off, and a daily automatic check will catch the next ones. |
| AHR-2026-002: SI-2 other than satisfied. Two Moderate dependency CVEs at 78 and 85 days against a 60-day SLA. | Two software updates were weeks late. They're installed now, and a check in the build process will block late updates in the future. |
| AHR-2026-004: AU-6 other than satisfied. Documented review evidence for 5/12 weeks. | Log reviews were written down for only 5 of 12 weeks. We now use a weekly checklist ticket, so every review leaves a record. |
| AHR-2026-003: CP-4 other than satisfied. No contingency plan test performed. | We have never tested whether we can bring the portal back after an outage. We need HR's time on January 15 and February 12 to test it. |
| R-06: Third-party risk; response **Share** via SA-9 contractual requirements and SR-6 supplier assessment. | We can't fix our payroll vendor's systems, but we can require their audit report and a 72-hour breach notice in the contract. |
| POAM-0008: SI-2 High, 34 days open, 4 days past the 30-day window; vendor patch available 2026-11-09. | One urgent patch is four days late because the vendor's fix only came out November 9. It goes in November 18. |
| POAM-0010: CM-6 Low; deviation (operational requirement) accepted by AO through 2027-11-05. | You accepted one minor risk for a year, because the vendor's product can't change it. We'll look at it again next November. |

## Words I replace

| Instead of | I write |
|---|---|
| PII | personal data, or the specific data: "pay, tax, and benefits records" |
| Other than satisfied | fell short, didn't work as designed |
| Remediate | fix |
| ODP, parameter | our rule says |
| Threat actor, adversary | attacker |
| Exfiltration | download, take, copy out |
| Compensating control | backup safeguard |
| POA&M | fix list (in the main text); POA&M in the appendix |
