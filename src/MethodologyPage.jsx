import React, { useState } from "react";

const COLORS = {
  paper: "#EFEAE0",
  ink: "#1F2A24",
  inkSoft: "#5A6B60",
  line: "#C9BFA8",
  consensus: "#2A6B3C",
  consensusBg: "#EAF5EC",
  discrepancy: "#C8392B",
  discrepancyBg: "#FDF0EE",
  framing: "#7B5EA7",
  framingBg: "#F5F0FC",
};

const UI = {
  sk: {
    subtitle: "PALIZRA ANALYZATOR · METODOLÓGIA",
    title: "Metodológia",
    desc: "Transparentný popis postupov, kritérií a testovania vyváženosti nástroja Palizra Analyzator v súlade so štandardmi IFCN.",
    back: "← Späť na nástroj",
    version: "Verzia metodológie: 1.0 · Júl 2026",
    toc: "Obsah",
    sections: [
      { id: "how", title: "Ako nástroj funguje" },
      { id: "sources", title: "Výber zdrojov" },
      { id: "confidence", title: "Kritériá miery istoty" },
      { id: "balance", title: "Testovanie vyváženosti" },
      { id: "corrections", title: "Opravy a aktualizácie" },
    ],
  },
  en: {
    subtitle: "PALIZRA ANALYZATOR · METHODOLOGY",
    title: "Methodology",
    desc: "A transparent description of the procedures, criteria and impartiality testing of Palizra Analyzator, in accordance with IFCN standards.",
    back: "← Back to tool",
    version: "Methodology version: 1.0 · July 2026",
    toc: "Contents",
    sections: [
      { id: "how", title: "How the tool works" },
      { id: "sources", title: "Source selection" },
      { id: "confidence", title: "Confidence level criteria" },
      { id: "balance", title: "Impartiality testing" },
      { id: "corrections", title: "Corrections and updates" },
    ],
  },
  ar: {
    subtitle: "محلل بالزرا · المنهجية",
    title: "المنهجية",
    desc: "وصف شفاف للإجراءات والمعايير واختبار الحياد لمحلل بالزرا، وفقاً لمعايير IFCN.",
    back: "← العودة إلى الأداة",
    version: "إصدار المنهجية: 1.0 · يوليو 2026",
    toc: "المحتويات",
    sections: [
      { id: "how", title: "كيف تعمل الأداة" },
      { id: "sources", title: "اختيار المصادر" },
      { id: "confidence", title: "معايير مستوى الثقة" },
      { id: "balance", title: "اختبار الحياد" },
      { id: "corrections", title: "التصحيحات والتحديثات" },
    ],
  },
  he: {
    subtitle: "פליזרה אנלייזר · מתודולוגיה",
    title: "מתודולוגיה",
    desc: "תיאור שקוף של הנהלים, הקריטריונים ובדיקת הנייטרליות של פליזרה אנלייזר, בהתאם לתקני IFCN.",
    back: "← חזרה לכלי",
    version: "גרסת מתודולוגיה: 1.0 · יולי 2026",
    toc: "תוכן עניינים",
    sections: [
      { id: "how", title: "כיצד הכלי עובד" },
      { id: "sources", title: "בחירת מקורות" },
      { id: "confidence", title: "קריטריוני רמת הביטחון" },
      { id: "balance", title: "בדיקת נייטרליות" },
      { id: "corrections", title: "תיקונים ועדכונים" },
    ],
  },
};

const CONTENT = {
  en: {
    how: {
      title: "How the tool works",
      body: `Palizra Analyzator is an AI-assisted fact-checking tool for claims and images related to the Israeli-Palestinian conflict. It does not issue simple true/false verdicts. Instead, it breaks down text into verifiable units and compares them across independent sources.

The analysis process consists of four steps:

1. Claim extraction — The tool breaks the input text into individual claims, categorising each as a verifiable fact, quote/statement, interpretation, or unverifiable claim.

2. Internal consistency check — The tool checks whether claims within the same text contradict each other in terms of dates, numbers, or logic.

3. Source comparison — For each verifiable fact, the tool searches across curated independent sources and compares what each source says, identifying consensus, discrepancies, and framing differences.

4. Confidence level assignment — Based on the evidence gathered, the tool assigns a confidence level (high, medium, or low) according to explicit criteria (see Section 3).

For images, the tool additionally performs reverse image search, geolocation assessment, EXIF metadata analysis, and AI-generation detection.`,
    },
    sources: {
      title: "Source selection",
      body: `Sources are selected according to the following criteria, applied consistently to all outlets regardless of which side of the conflict they are associated with:

1. Editorial independence — The source must be free from government or state control and must not be funded by a party to the conflict.

2. Fact-checking track record — The source must have a documented record of accuracy and corrections.

3. Geographic and linguistic coverage — The source list must include outlets covering both sides of the conflict.

4. Institutional credibility — For human rights data, the source must be a recognised international or regional organisation.

The curated source list is reviewed quarterly. The full list and audit documentation are available at palizra.org/analyses and in the Palizra Source Audit document.

Sources explicitly excluded: government-controlled or state-funded outlets, sources with documented systematic bias, and unverified social media accounts.`,
    },
    confidence: {
      title: "Confidence level criteria",
      body: `Confidence levels are assigned according to the following explicit criteria, applied consistently regardless of the origin of the claim:

HIGH: At least 2 curated independent sources confirm the core claim, and no curated source directly contradicts it.

MEDIUM: At least 1 curated independent source confirms or partially confirms the core claim, OR curated sources conflict with each other on key details.

LOW: No curated independent source confirms the core claim, OR the claim is confirmed only by partisan or state-affiliated sources, OR key details (numbers, location, perpetrator) remain unverified by any curated source.

These criteria reflect editorial balance, not mechanical balance. The confidence level is determined by the quality and quantity of available evidence, not by the origin of the claim.`,
    },
    balance: {
      title: "Impartiality testing",
      body: `To verify that the tool applies consistent standards regardless of which side of the conflict a claim originates from, quarterly impartiality tests are conducted.

Each test consists of matched pairs of claims — one from a Palestinian/Arab source and one structurally equivalent claim from an Israeli source — submitted to the tool independently. Results are compared across four categories: casualties, infrastructure, statistics, and diplomatic statements.

If an inconsistency is identified, the root cause is investigated and a correction is implemented. All test records are retained and results are published in the public Changelog at palizra.org.

The tool applies editorial balance, not mechanical (false) balance. This means that a claim from a Palestinian source and a claim from an Israeli source supported by the same quality of evidence will receive the same confidence level.

First quarterly test: Q3 2026.`,
    },
    corrections: {
      title: "Corrections and updates",
      body: `Palizra Analyzator is committed to transparent error correction in accordance with IFCN standards.

If an error is identified in a published analysis — whether by the author or reported by a reader — the following steps are taken:

1. The error is assessed and, if confirmed, corrected as soon as possible.
2. The published analysis is updated with a visible update notice stating the date of the correction and the nature of the change.
3. The correction is documented in the public corrections log at palizra.org/corrections.

Errors can be reported via the Report an issue button on each published analysis, or by email at palizra@proton.me.

Analyses are not deleted after publication. If an analysis requires a substantial update, the original version is retained and a link to the updated analysis is added.`,
    },
  },
};

// Jednoduché kopírovanie EN obsahu pre ostatné jazyky (v produkcii by boli preložené)
CONTENT.sk = CONTENT.en;
CONTENT.ar = CONTENT.en;
CONTENT.he = CONTENT.en;

export default function MethodologyPage() {
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  function detectBrowserLang() {
    const supported = ["sk", "en", "ar", "he"];
    const browserLangs = navigator.languages || [navigator.language || "en"];
    for (const bl of browserLangs) {
      const code = bl.split("-")[0].toLowerCase();
      if (supported.includes(code)) return code;
    }
    return "en";
  }
  const [lang, setLang] = useState(
    urlLang && ["sk","en","ar","he"].includes(urlLang) ? urlLang : detectBrowserLang()
  );
  const u = UI[lang] || UI.en;
  const c = CONTENT[lang] || CONTENT.en;
  const isRTL = lang === "ar" || lang === "he";

  const sectionStyle = {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: `1px solid ${COLORS.line}`,
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} lang={lang}
      style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "'Iowan Old Style', Georgia, serif", background: COLORS.paper, color: COLORS.ink, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace" }}>{u.subtitle}</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "6px 0 4px" }}>{u.title}</h1>
          <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: "0 0 4px", lineHeight: 1.6 }}>{u.desc}</p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href={`/?lang=${lang}`} style={{ fontSize: 13, color: COLORS.inkSoft }}>{u.back}</a>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.line }}>|</span>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.inkSoft }}>{u.version}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {["sk","en","ar","he"].map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ background: lang === l ? COLORS.ink : "transparent", color: lang === l ? COLORS.paper : COLORS.inkSoft, border: `1px solid ${lang === l ? COLORS.ink : COLORS.line}`, borderRadius: 4, padding: "4px 10px", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Obsah */}
      <div style={{ marginBottom: 28, padding: "12px 16px", background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4 }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 8, letterSpacing: "0.06em" }}>{u.toc.toUpperCase()}</div>
        {u.sections.map((s, i) => (
          <a key={s.id} href={`#${s.id}`}
            style={{ display: "block", fontSize: 14, color: COLORS.ink, marginBottom: 4, textDecoration: "none" }}>
            {i + 1}. {s.title}
          </a>
        ))}
      </div>

      {/* Sekcie */}
      {u.sections.map((s, i) => {
        const content = c[s.id];
        if (!content) return null;
        return (
          <div key={s.id} id={s.id} style={sectionStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              {i + 1}. {s.title}
            </h2>
            {content.body.split("\n\n").map((para, pi) => (
              <p key={pi} style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 10, color: COLORS.ink }}>
                {para}
              </p>
            ))}
          </div>
        );
      })}

      <footer style={{ marginTop: 32, paddingTop: 14, borderTop: `1px solid ${COLORS.line}`, fontSize: 12, color: COLORS.inkSoft, textAlign: "center" }}>
        © {new Date().getFullYear()} Palizra Analyzator ·{" "}
        <a href={`/?lang=${lang}`} style={{ color: COLORS.inkSoft }}>{u.back}</a> ·{" "}
        <a href={`/corrections?lang=${lang}`} style={{ color: COLORS.inkSoft }}>
          {lang === "ar" ? "التصحيحات" : lang === "he" ? "תיקונים" : lang === "en" ? "Corrections" : "Opravy"}
        </a>
      </footer>
    </div>
  );
}
