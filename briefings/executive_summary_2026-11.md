# HR Portal security: annual review summary

> **FICTIONAL.** Written as the system's security officer would write it for leadership.
> Every figure comes from [`data/briefing_facts.json`](../data/briefing_facts.json).

| | |
|---|---|
| **To** | Morgan Lee, CIO |
| **Copy** | Dana Ruiz, Director of HR Operations; Priya Natarajan, ISSM |
| **From** | Sam Okafor, ISSO |
| **Date** | 2026-11-16 |
| **Decision needed by** | 2026-11-20 |

## Bottom line

The HR Portal is safe to keep running. We found **one High risk**: a phishing email could let an
attacker sign in as an HR staff member and download records for all **1,200 employees**. A fix
costs about **$750** and can be in place by **December 11**. I am asking you to approve it this week.

## Three decisions for you

1. **Approve $750 for security keys for the 15 HR staff,** plus two days of the identity team's
   time. This closes our largest risk. To finish by December 11, the keys must be ordered by
   November 20.
2. **Ask Procurement to get our payroll vendor's latest security audit report,** and to add a
   72-hour breach notice to the contract when it renews. We can't fix the vendor's systems
   ourselves, so the contract is how we share this risk.
3. **Confirm HR will take part in two recovery tests:** a planning exercise on January 15 and a
   restore test on February 12. We have never tested whether we can bring the portal back after
   an outage.

## What we found

**Risks.** We rated 15 ways the portal could be harmed. One is High, five are Moderate, and nine
are Low or Very Low. Four of the five Moderate risks already have funded fixes. The fifth is the
payroll vendor (decision 2).

**Audit.** Internal Audit tested 12 key controls. Seven worked as designed. Five fell short, and
one of those was fixed during the audit itself. The other four:

- **Old accounts were left on.** Six unused accounts on the portal's servers were still active.
  We turned them off in October. A daily automatic check is due November 30.
- **Two software updates were late.** They went out on November 10. A build check will stop
  this from happening again.
- **Log reviews were not recorded.** Reviews were written down for only 5 of 12 weeks. We now
  use a weekly checklist ticket.
- **The recovery plan was never tested.** See decision 3.

## Fix progress

We are tracking 8 open fixes. Seven are on schedule. **One is four days late:** a High-rated patch
for the server administrators use to manage the portal. The vendor's fix came out November 9, and
it goes in on November 18. One minor item has been closed. You accepted one low risk on November
5 because the vendor's product can't change it.

## What is going well

- Every HR and administrator account uses MFA, and everyone finished security training this year.
- Weekly scans reached every server, every week.
- The security team reviewed and ticketed every alert. All but one were handled on time.

## Where the details are

- Risk assessment report and Excel risk register: `risk-assessment-800-30`
- Audit workpapers and evidence: `control-audit-evidence-kit`
- Fix tracker and monthly status report: `policy-and-poam-program`
