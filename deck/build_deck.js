// Build the leadership briefing deck from data/briefing_facts.json.
//
//   cd deck && npm install && node build_deck.js
//
// Writes ../briefings/leadership_briefing_2026-11.pptx. FICTIONAL content.

const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "briefings", "leadership_briefing_2026-11.pptx");
const facts = Object.fromEntries(
  Object.entries(JSON.parse(fs.readFileSync(path.join(ROOT, "data", "briefing_facts.json"), "utf8")))
    .filter(([k]) => !k.startsWith("_"))
    .map(([k, v]) => [k, v.value])
);

const THEME = {
  name: "Acme Security Briefing",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B1B1B", lt1: "FFFFFF", dk2: "14213D", lt2: "EEF1F6",
    accent1: "FCA311", accent2: "C0392B", accent3: "6A994E", accent4: "A7C957",
    accent5: "2E86AB", accent6: "7F8C8D", hlink: "2E86AB", folHlink: "7F8C8D",
  },
};
const HEX = THEME.colors;
const RISK = { "Very High": "8B0000", High: HEX.accent2, Moderate: HEX.accent1, Low: HEX.accent3, "Very Low": HEX.accent4 };

const fmtDate = (iso) => {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

async function icon(Comp, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: String(size) }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// pptxgenjs writes directory entries into the ZIP. Some cloud viewers refuse those, so drop them.
async function dropFolderEntries(file) {
  const JSZip = require(require.resolve("jszip", { paths: [require.resolve("pptxgenjs")] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const clean = new JSZip();
  for (const [name, entry] of Object.entries(zip.files)) {
    if (!entry.dir) clean.file(name, await entry.async("nodebuffer"), { date: entry.date, createFolders: false });
  }
  fs.writeFileSync(file, await clean.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
}

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  pres.title = "HR Portal security review, November 2026 (fictional)";
  pres.author = "Peyton Seay";
  pres.company = "Acme Defense Fabrication (fictional)";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

  const FOOTER = "FICTIONAL  ·  Acme HR Portal annual security review  ·  November 2026";

  pres.defineSlideMaster({
    title: "TITLE_DARK",
    background: { color: HEX.dk2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 1.55, w: 5.6, h: 1.5, fontSize: 40, bold: true, color: HEX.lt1, valign: "bottom", align: "left", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.6, y: 3.2, w: 5.6, h: 1.0, fontSize: 16, color: HEX.accent1, valign: "top", margin: 0 }, text: "" } },
    ],
  });
  // The content and closing masters share a layout and differ only in colour.
  const contentMaster = (title, background, titleColor, footerColor) => pres.defineSlideMaster({
    title,
    background: { color: background },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.3, w: 9.0, h: 0.75, fontSize: 32, bold: true, color: titleColor, valign: "middle", margin: 0 }, text: "" } },
      { text: { text: FOOTER, options: { x: 0.5, y: 5.2, w: 7.5, h: 0.25, fontSize: 9, color: footerColor, margin: 0 } } },
    ],
    slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.25, fontSize: 9, color: footerColor, align: "right" },
  });
  contentMaster("CONTENT", HEX.lt1, HEX.dk2, HEX.accent6);
  contentMaster("CLOSING_DARK", HEX.dk2, HEX.lt1, HEX.lt2);

  // A plain text box: every one in the deck has no margin.
  const text = (slide, str, x, y, w, h, options) => slide.addText(str, { x, y, w, h, margin: 0, isTextBox: true, ...options });

  const card = (slide, x, y, w, h, color, name) =>
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color }, line: { color }, objectName: name });

  // Icon circles are the deck's visual motif.
  const iconCircle = async (slide, Comp, x, y, d, fill, fg, name) => {
    slide.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill }, objectName: name + " circle" });
    const pad = d * 0.24;
    slide.addImage({ data: await icon(Comp, fg), x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad, objectName: name + " icon" });
  };

  // A column of icon rows, each with a heading and a line of detail. rows: [icon, colour, heading, detail].
  const iconRows = async (slide, x, w, name, rows) => {
    for (const [i, [Ic, col, head, body]] of rows.entries()) {
      const y = 1.3 + i * 0.95;
      await iconCircle(slide, Ic, x, y, 0.6, col, HEX.lt1, `${name} ${i + 1}`);
      text(slide, head, x + 0.8, y, w, 0.3, { fontSize: 15, bold: true, color: HEX.dk2 });
      text(slide, body, x + 0.8, y + 0.3, w, 0.55, { fontSize: 12, color: HEX.accent6, valign: "top" });
    }
  };

  // ---- 1. Title -----------------------------------------------------------
  pres.addSection({ title: "Opening" });
  let s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Opening" });
  s.addText("HR Portal security review", { placeholder: "title" });
  s.addText("Annual review for the Authorizing Official\nNovember 16, 2026", { placeholder: "body" });
  text(s, "Sam Okafor, ISSO  ·  fictional example", 0.6, 4.6, 5.6, 0.3, { fontSize: 12, color: HEX.lt2 });
  await iconCircle(s, fa.FaShieldAlt, 6.9, 1.45, 2.4, HEX.accent1, HEX.dk2, "Shield");
  s.addNotes("Fifteen minutes. The goal is three decisions by November 20. Everything else is context for those decisions.");

  // ---- 2. Bottom line -----------------------------------------------------
  pres.addSection({ title: "Findings" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Findings" });
  s.addText("The bottom line", { placeholder: "title" });
  text(s, "The portal is safe to keep running. One risk needs a fast, cheap fix.", 0.5, 1.15, 9.0, 0.45, { fontSize: 18, italic: true, color: HEX.dk1 });
  const stats = [
    [String(facts.risks_high), "High risk", `Phished HR account could expose ${facts.employees.toLocaleString("en-US")} employees' records`, fa.FaExclamationTriangle, HEX.accent2],
    ["$" + facts.mfa_cost_usd, "to close it", `Security keys for ${facts.hr_role_users} HR staff, done by ${fmtDate(facts.mfa_due)}`, fa.FaKey, HEX.accent1],
    ["3", "decisions today", "Fund the keys, push the payroll vendor, schedule recovery tests", fa.FaGavel, HEX.dk2],
  ];
  for (const [i, [big, label, detail, Ic, col]] of stats.entries()) {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.85, 2.8, 3.05, HEX.lt2, `Stat card ${i + 1}`);
    await iconCircle(s, Ic, x + 0.25, 2.1, 0.6, col, HEX.lt1, `Stat ${i + 1}`);
    text(s, big, x + 0.25, 2.8, 2.3, 0.9, { fontSize: 54, bold: true, fontFace: THEME.headFontFace, color: HEX.dk2, objectName: `Stat ${i + 1} number` });
    text(s, label, x + 0.25, 3.7, 2.3, 0.35, { fontSize: 16, bold: true, color: HEX.dk1 });
    text(s, detail, x + 0.25, 4.05, 2.3, 0.75, { fontSize: 12, color: HEX.accent6, valign: "top" });
  }
  s.addNotes("If you remember one thing: the portal can keep running, and the biggest risk has a $750 fix.");

  // ---- 3. The High risk ---------------------------------------------------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Findings" });
  s.addText("Our one High risk", { placeholder: "title" });
  const steps = [
    [fa.FaEnvelope, "Phishing email", "Links to a fake sign-in page"],
    [fa.FaMask, "Fake page relays it", "Push approval goes through"],
    [fa.FaUserSecret, "Attacker is in", "Signed in as an HR specialist"],
    [fa.FaDownload, "Records taken", `${facts.employees.toLocaleString("en-US")} employees' pay and tax data`],
  ];
  for (const [i, [Ic, head, sub]] of steps.entries()) {
    const x = 0.5 + i * 2.3;
    await iconCircle(s, Ic, x + 0.55, 1.3, 0.9, i === 3 ? HEX.accent2 : HEX.dk2, HEX.lt1, `Step ${i + 1}`);
    text(s, head, x, 2.3, 2.0, 0.35, { fontSize: 15, bold: true, align: "center", color: HEX.dk2 });
    text(s, sub, x, 2.65, 2.0, 0.55, { fontSize: 12, align: "center", color: HEX.accent6, valign: "top" });
    if (i < steps.length - 1) {
      s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 1.75, y: 1.6, w: 0.5, h: 0.3, fill: { color: HEX.accent6 }, line: { color: HEX.accent6 }, objectName: `Arrow ${i + 1}` });
    }
  }
  card(s, 0.5, 3.45, 9.0, 1.5, HEX.lt2, "Fix panel");
  await iconCircle(s, fa.FaKey, 0.8, 3.75, 0.9, HEX.accent1, HEX.dk2, "Fix");
  text(s, [
    { text: "The fix: ", options: { bold: true, color: HEX.dk2 } },
    { text: `security keys for the ${facts.hr_role_users} HR staff, which ignore fake pages, plus an alert when anyone downloads records in bulk.`, options: { color: HEX.dk1, breakLine: true } },
    { text: `About $${facts.mfa_cost_usd}. Keys ordered by ${fmtDate(facts.mfa_purchase_milestone)}, in use by ${fmtDate(facts.mfa_due)}.`, options: { bold: true, color: HEX.dk2 } },
  ], 2.0, 3.6, 7.2, 1.2, { fontSize: 15, valign: "middle", paraSpaceAfter: 6 });
  s.addNotes("Push MFA stops most attacks, but phishing kits that relay the sign-in in real time get through. A security key checks the web address, so it won't answer a fake page. Risk R-01: likelihood High, impact High.");

  // ---- 4. Risk picture ----------------------------------------------------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Findings" });
  s.addText(`${facts.risks_total} risks rated, most of them low`, { placeholder: "title" });
  const levels = ["High", "Moderate", "Low", "Very Low"];
  const counts = [facts.risks_high, facts.risks_moderate, facts.risks_low, facts.risks_very_low];
  s.addChart(pres.charts.BAR, [{ name: "Risks", labels: levels, values: counts }], {
    x: 0.5, y: 1.2, w: 4.6, h: 3.8, barDir: "bar", objectName: "Risks by level chart",
    chartColors: levels.map((l) => RISK[l]),
    showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 14, dataLabelColor: HEX.dk1, dataLabelFontFace: "+mn-lt",
    catAxisLabelFontSize: 13, catAxisLabelColor: HEX.dk1, catAxisLabelFontFace: "+mn-lt", catAxisOrientation: "maxMin",
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, valAxisMaxVal: 10,
    showLegend: false, showTitle: true, title: "Risks by level", titleFontSize: 14, titleColor: HEX.dk2, titleFontFace: "+mn-lt",
  });
  await iconRows(s, 5.5, 3.2, "Risk row", [
    [fa.FaExclamationTriangle, HEX.accent2, "1 High", `Phishing of HR accounts. Fix by ${fmtDate(facts.mfa_due)}.`],
    [fa.FaTools, HEX.accent1, "4 Moderate, funded", "Old accounts, late updates, public storage risk, insider browsing."],
    [fa.FaHandshake, HEX.accent1, "1 Moderate, shared", "Payroll vendor breach. Handled through the contract."],
    [fa.FaCheckCircle, HEX.accent3, `${facts.risks_low + facts.risks_very_low} Low or Very Low`, "Watched, with no new spending needed."],
  ]);
  s.addNotes("Scored with the NIST SP 800-30 likelihood and impact tables. The full register, with a heat map, is in the risk-assessment-800-30 repo.");

  // ---- 5. Audit -----------------------------------------------------------
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Findings" });
  s.addText(`Audit: ${facts.controls_passed} of ${facts.controls_tested} controls worked`, { placeholder: "title" });
  const openFindings = facts.findings - facts.findings_fixed_during_audit;
  s.addChart(pres.charts.DOUGHNUT, [{
    name: "Controls", labels: ["Worked", "Fixed during audit", "Open finding"],
    values: [facts.controls_passed, facts.findings_fixed_during_audit, openFindings],
  }], {
    x: 0.4, y: 1.15, w: 3.9, h: 3.9, holeSize: 55, objectName: "Audit results chart",
    chartColors: [HEX.accent3, HEX.accent5, HEX.accent2],
    showValue: true, showPercent: false, dataLabelColor: HEX.lt1, dataLabelFontSize: 14, dataLabelFontFace: "+mn-lt",
    showLegend: true, legendPos: "b", legendFontSize: 11, legendColor: HEX.dk1, legendFontFace: "+mn-lt",
    showTitle: false,
  });
  await iconRows(s, 4.7, 4.0, "Finding", [
    [fa.FaUserClock, HEX.dk2, "Old accounts left on", `${facts.dormant_accounts} found. Turned off. Daily check due Nov 30.`],
    [fa.FaSyncAlt, HEX.dk2, "Two updates were late", "Installed Nov 10. A build check will block this."],
    [fa.FaClipboardList, HEX.dk2, "Log reviews not recorded", `${facts.log_review_weeks_documented} of ${facts.log_review_weeks_total} weeks. Weekly checklist now.`],
    [fa.FaLifeRing, HEX.dk2, "Recovery plan never tested", `Tests set for ${fmtDate(facts.cp_tabletop)} and ${fmtDate(facts.cp_restore_test)}.`],
  ]);
  s.addNotes("Internal Audit tested a representative 12 controls. The TLS setting was fixed during the audit, so it shows as fixed. The evidence and workpapers are in control-audit-evidence-kit.");

  // ---- 6. Fix progress ----------------------------------------------------
  pres.addSection({ title: "Progress" });
  s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Progress" });
  s.addText(`Fixes: ${facts.poam_active - facts.poam_overdue} of ${facts.poam_active} on schedule`, { placeholder: "title" });
  const chips = [
    [String(facts.poam_active), "open fixes", HEX.dk2],
    [String(facts.poam_overdue), "late", HEX.accent2],
    [String(facts.poam_closed), "closed", HEX.accent3],
    [String(facts.poam_risk_accepted), "risk accepted", HEX.accent6],
  ];
  for (const [i, [n, label, col]] of chips.entries()) {
    const x = 0.5 + i * 2.3;
    card(s, x, 1.2, 2.1, 1.05, HEX.lt2, `Chip ${i + 1}`);
    text(s, n, x + 0.2, 1.28, 0.55, 0.9, { fontSize: 40, bold: true, fontFace: THEME.headFontFace, color: col, valign: "middle" });
    text(s, label, x + 0.8, 1.28, 1.2, 0.9, { fontSize: 14, color: HEX.dk1, valign: "middle" });
  }
  // Timeline of the next milestones
  const events = [
    [facts.poam_overdue_fix_date, "Late patch installed", true],
    [facts.mfa_purchase_milestone, "Security keys ordered", false],
    ["2026-11-30", "Account check automated", false],
    [facts.mfa_due, "Keys in use for HR", false],
    ["2026-12-18", "Storage guardrail", false],
    [facts.cp_tabletop, "Recovery planning test", false],
    [facts.cp_restore_test, "Restore test", false],
  ];
  const tx0 = 1.15, tx1 = 8.85, ty = 3.35;
  s.addShape(pres.shapes.LINE, { x: tx0, y: ty, w: tx1 - tx0, h: 0, line: { color: HEX.accent6, width: 2 }, objectName: "Timeline" });
  const step = (tx1 - tx0) / (events.length - 1);
  events.forEach(([iso, label, late], i) => {
    const cx = tx0 + i * step;
    s.addShape(pres.shapes.OVAL, { x: cx - 0.12, y: ty - 0.12, w: 0.24, h: 0.24, fill: { color: late ? HEX.accent2 : HEX.accent1 }, line: { color: HEX.lt1, width: 2 }, objectName: `Milestone ${i + 1}` });
    text(s, fmtDate(iso), cx - 0.6, ty - 0.55, 1.2, 0.3, { fontSize: 12, bold: true, align: "center", color: late ? HEX.accent2 : HEX.dk2 });
    text(s, label, cx - 0.62, ty + 0.22, 1.24, 0.6, { fontSize: 11, align: "center", color: HEX.dk1, valign: "top" });
  });
  text(s, [
    { text: "Late item: ", options: { bold: true, color: HEX.accent2 } },
    { text: `a High-rated patch for the admin server is ${facts.poam_overdue_days} days late. The vendor's fix only came out Nov 9. It will be installed ${fmtDate(facts.poam_overdue_fix_date)}.`, options: { color: HEX.dk1 } },
  ], 0.5, 4.4, 9.0, 0.6, { fontSize: 14, valign: "middle" });
  s.addNotes(`${facts.poam_overdue_id} is the late item. The full monthly status report is in policy-and-poam-program/reports.`);

  // ---- 7. Decisions -------------------------------------------------------
  pres.addSection({ title: "Decisions" });
  s = pres.addSlide({ masterName: "CLOSING_DARK", sectionTitle: "Decisions" });
  s.addText("Three decisions for you today", { placeholder: "title" });
  const asks = [
    [fa.FaKey, `Approve $${facts.mfa_cost_usd} for security keys`, `${facts.hr_role_users} HR staff, plus 2 days of identity team time. Needed by ${fmtDate(facts.mfa_purchase_milestone)}.`],
    [fa.FaHandshake, "Push the payroll vendor", "Ask Procurement for their audit report and a 72-hour breach notice at renewal."],
    [fa.FaCalendarCheck, "Commit HR to recovery tests", `Planning test ${fmtDate(facts.cp_tabletop)}, restore test ${fmtDate(facts.cp_restore_test)}.`],
  ];
  for (const [i, [Ic, head, body]] of asks.entries()) {
    const x = 0.5 + i * 3.1;
    card(s, x, 1.5, 2.8, 3.0, HEX.lt1, `Decision ${i + 1} card`);
    text(s, String(i + 1), x + 0.25, 1.65, 0.8, 0.8, { fontSize: 44, bold: true, fontFace: THEME.headFontFace, color: HEX.accent1 });
    await iconCircle(s, Ic, x + 1.9, 1.7, 0.65, HEX.dk2, HEX.accent1, `Decision ${i + 1}`);
    text(s, head, x + 0.25, 2.6, 2.3, 0.8, { fontSize: 17, bold: true, color: HEX.dk2, valign: "top" });
    text(s, body, x + 0.25, 3.45, 2.3, 0.9, { fontSize: 13, color: HEX.dk1, valign: "top" });
  }
  s.addNotes("Ask for a yes or no on each. If the answer on the keys is no, the High risk stays open and needs a written risk acceptance from the CIO under ISP-CA 4.6.");

  await pres.writeFile({ fileName: OUT });
  await dropFolderEntries(OUT);
  console.log("wrote " + OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
