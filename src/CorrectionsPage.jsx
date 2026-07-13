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
    subtitle: "PALIZRA ANALYZATOR · OPRAVY A AKTUALIZÁCIE",
    title: "Opravy a aktualizácie",
    desc: "Verejný záznam opráv chýb a aktualizácií metodológie v súlade so štandardmi IFCN.",
    back: "← Späť na nástroj",
    policy: "Politika opráv",
    policyText: "Palizra Analyzator sa zaväzuje k transparentnému opravovaniu chýb. Ak zistíme alebo dostaneme hlásenie o chybe v analýze, opravíme ju čo najskôr a zdokumentujeme opravu v tomto zázname. Opravené analýzy sú označené upozornením priamo v archíve.",
    reportTitle: "Nahlásiť chybu",
    reportText: "Ak ste zaznamenali chybu v analýze alebo metodológii, kontaktujte nás na:",
    corrections: "Zoznam opráv",
    noCorrections: "Zatiaľ žiadne zdokumentované opravy.",
    type_correction: "OPRAVA",
    type_update: "AKTUALIZÁCIA",
    type_methodology: "METODOLÓGIA",
  },
  en: {
    subtitle: "PALIZRA ANALYZATOR · CORRECTIONS & UPDATES",
    title: "Corrections & Updates",
    desc: "A public record of error corrections and methodology updates in accordance with IFCN standards.",
    back: "← Back to tool",
    policy: "Corrections Policy",
    policyText: "Palizra Analyzator is committed to transparent error correction. If we identify or receive a report of an error in an analysis, we will correct it as soon as possible and document the correction in this record. Corrected analyses are flagged with a notice directly in the archive.",
    reportTitle: "Report an Error",
    reportText: "If you have identified an error in an analysis or in our methodology, please contact us at:",
    corrections: "Corrections Log",
    noCorrections: "No corrections documented yet.",
    type_correction: "CORRECTION",
    type_update: "UPDATE",
    type_methodology: "METHODOLOGY",
  },
  ar: {
    subtitle: "محلل بالزرا · التصحيحات والتحديثات",
    title: "التصحيحات والتحديثات",
    desc: "سجل عام لتصحيحات الأخطاء وتحديثات المنهجية وفقاً لمعايير IFCN.",
    back: "← العودة إلى الأداة",
    policy: "سياسة التصحيح",
    policyText: "يلتزم محلل بالزرا بتصحيح الأخطاء بشفافية. إذا اكتشفنا أو تلقينا تقريراً عن خطأ في تحليل ما، سنقوم بتصحيحه في أقرب وقت ممكن وتوثيق التصحيح في هذا السجل.",
    reportTitle: "الإبلاغ عن خطأ",
    reportText: "إذا اكتشفت خطأً في تحليل أو في منهجيتنا، يرجى الاتصال بنا على:",
    corrections: "سجل التصحيحات",
    noCorrections: "لا توجد تصحيحات موثقة حتى الآن.",
    type_correction: "تصحيح",
    type_update: "تحديث",
    type_methodology: "منهجية",
  },
  he: {
    subtitle: "פליזרה אנלייזר · תיקונים ועדכונים",
    title: "תיקונים ועדכונים",
    desc: "רשומה ציבורית של תיקוני שגיאות ועדכוני מתודולוגיה בהתאם לתקני IFCN.",
    back: "← חזרה לכלי",
    policy: "מדיניות תיקונים",
    policyText: "פליזרה אנלייזר מחויב לתיקון שגיאות בשקיפות. אם נזהה או נקבל דיווח על שגיאה בניתוח, נתקן אותה בהקדם האפשרי ונתעד את התיקון ברשומה זו.",
    reportTitle: "דיווח על שגיאה",
    reportText: "אם זיהית שגיאה בניתוח או במתודולוגיה שלנו, אנא צור קשר:",
    corrections: "יומן תיקונים",
    noCorrections: "אין תיקונים מתועדים עדיין.",
    type_correction: "תיקון",
    type_update: "עדכון",
    type_methodology: "מתודולוגיה",
  },
};

// Hardcoded zoznam opráv - aktualizuj manuálne pri každej oprave
const CORRECTIONS = [
  // Príklad:
  // {
  //   date: "2026-07-15",
  //   type: "correction",
  //   sk: "Oprava chybného počtu obetí v analýze z 12. júla 2026.",
  //   en: "Corrected erroneous casualty count in the July 12, 2026 analysis.",
  //   ar: "تصحيح عدد الضحايا الخاطئ في تحليل 12 يوليو 2026.",
  //   he: "תוקן מספר נפגעים שגוי בניתוח מ-12 ביולי 2026.",
  //   analysisId: "d9d343eb-2e4e-476b-aa00-5beda54bbc76",
  // },
];

export default function CorrectionsPage() {
  const urlLang = new URLSearchParams(window.location.search).get("lang") || "en";
  const [lang, setLang] = useState(["sk","en","ar","he"].includes(urlLang) ? urlLang : "en");
  const u = UI[lang] || UI.en;
  const isRTL = lang === "ar" || lang === "he";

  const TYPE_COLORS = {
    correction: COLORS.discrepancy,
    update: COLORS.framing,
    methodology: COLORS.consensus,
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} lang={lang}
      style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "'Iowan Old Style', Georgia, serif", background: COLORS.paper, color: COLORS.ink, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace" }}>{u.subtitle}</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "6px 0 4px" }}>{u.title}</h1>
          <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: "0 0 6px" }}>{u.desc}</p>
          <a href={`/?lang=${lang}`} style={{ fontSize: 13, color: COLORS.inkSoft }}>{u.back}</a>
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

      {/* Politika opráv */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{u.policy}</h2>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: COLORS.ink, marginBottom: 12 }}>{u.policyText}</p>

        <div style={{ padding: "12px 16px", background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, fontSize: 13 }}>
          <strong>{u.reportTitle}:</strong> {u.reportText}{" "}
          <a href="mailto:palizra@proton.me" style={{ color: COLORS.ink }}>palizra@proton.me</a>
        </div>
      </div>

      {/* Zoznam opráv */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{u.corrections}</h2>

        {CORRECTIONS.length === 0 ? (
          <p style={{ fontSize: 14, color: COLORS.inkSoft }}>{u.noCorrections}</p>
        ) : (
          CORRECTIONS.map((c, i) => (
            <div key={i} style={{ marginBottom: 16, padding: "12px 16px", background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#fff", background: TYPE_COLORS[c.type] || COLORS.ink, padding: "2px 7px", borderRadius: 3 }}>
                  {u[`type_${c.type}`] || c.type.toUpperCase()}
                </span>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.inkSoft }}>{c.date}</span>
              </div>
              <p style={{ fontSize: 14, margin: "0 0 6px" }}>{c[lang] || c.en}</p>
              {c.analysisId && (
                <a href={`/analyses?id=${c.analysisId}&lang=${lang}`} style={{ fontSize: 12, color: COLORS.inkSoft }}>
                  → {lang === "ar" ? "عرض التحليل" : lang === "he" ? "צפה בניתוח" : lang === "en" ? "View analysis" : "Zobraziť analýzu"}
                </a>
              )}
            </div>
          ))
        )}
      </div>

      <footer style={{ marginTop: 32, paddingTop: 14, borderTop: `1px solid ${COLORS.line}`, fontSize: 12, color: COLORS.inkSoft, textAlign: "center" }}>
        © {new Date().getFullYear()} Palizra Analyzator · <a href="/" style={{ color: COLORS.inkSoft }}>{u.back}</a>
      </footer>
    </div>
  );
}
