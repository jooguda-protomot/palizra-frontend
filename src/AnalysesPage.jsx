import React, { useState, useEffect } from "react";
import { translations } from "./translations.js";

const API_BASE_URL = "https://palizraanalyzator-production.up.railway.app";

// Mapovacie tabuľky - kódy → preklady
const LOCATION_MAP = {
  Gaza:        { sk: "Gaza",          en: "Gaza",        ar: "غزة",              he: "עזה" },
  Libanon:     { sk: "Libanon",       en: "Lebanon",     ar: "لبنان",            he: "לבנון" },
  Lebanon:     { sk: "Libanon",       en: "Lebanon",     ar: "لبنان",            he: "לבנון" },
  Sýria:       { sk: "Sýria",         en: "Syria",       ar: "سوريا",            he: "סוריה" },
  Syria:       { sk: "Sýria",         en: "Syria",       ar: "سوريا",            he: "סוריה" },
  Izrael:      { sk: "Izrael",        en: "Israel",      ar: "إسرائيل",          he: "ישראל" },
  Israel:      { sk: "Izrael",        en: "Israel",      ar: "إسرائيل",          he: "ישראל" },
  "Západný breh": { sk: "Západný breh", en: "West Bank", ar: "الضفة الغربية",  he: "הגדה המערבית" },
  "West Bank":    { sk: "Západný breh", en: "West Bank", ar: "الضفة الغربية",  he: "הגדה המערבית" },
  Iné:         { sk: "Iné",           en: "Other",       ar: "أخرى",             he: "אחר" },
  Other:       { sk: "Iné",           en: "Other",       ar: "أخرى",             he: "אחר" },
};

const CATEGORY_MAP = {
  obete:           { sk: "obete",          en: "casualties",    ar: "ضحايا",          he: "נפגעים" },
  casualties:      { sk: "obete",          en: "casualties",    ar: "ضحايا",          he: "נפגעים" },
  "infraštruktúra":{ sk: "infraštruktúra", en: "infrastructure",ar: "بنية تحتية",    he: "תשתיות" },
  infrastructure:  { sk: "infraštruktúra", en: "infrastructure",ar: "بنية تحتية",    he: "תשתיות" },
  diplomatické:    { sk: "diplomatické",   en: "diplomatic",    ar: "دبلوماسي",       he: "דיפלומטי" },
  diplomatic:      { sk: "diplomatické",   en: "diplomatic",    ar: "دبلوماسي",       he: "דיפלומטי" },
  obrázok:         { sk: "obrázok",        en: "image",         ar: "صورة",            he: "תמונה" },
  image:           { sk: "obrázok",        en: "image",         ar: "صورة",            he: "תמונה" },
  iné:             { sk: "iné",            en: "other",         ar: "أخرى",            he: "אחר" },
  other:           { sk: "iné",            en: "other",         ar: "أخرى",            he: "אחר" },
};

function tLocation(val, lang) { return LOCATION_MAP[val]?.[lang] || val; }
function tCategory(val, lang) { return CATEGORY_MAP[val]?.[lang] || val; }



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

const CONFIDENCE_COLORS = {
  high: COLORS.consensus, medium: COLORS.framing, low: COLORS.discrepancy,
  vysoká: COLORS.consensus, stredná: COLORS.framing, nízka: COLORS.discrepancy,
};

const UI = {
  sk: {
    subtitle: "PALIZRA ANALYZATOR · VEREJNÉ ANALÝZY",
    title: "Archív analýz",
    desc: "Overené tvrdenia a obrázky súvisiace s izraelsko-palestínskym konfliktom.",
    back: "← Späť na nástroj",
    location: "Lokalita", category: "Kategória", lang: "Jazyk",
    all: "Všetky",
    loading: "Načítavam…", loadingDetail: "Načítavam detail…",
    error: "Nedá sa načítať zoznam analýz.",
    empty: "Žiadne verejné analýzy pre zvolené filtre.",
    prev: "← Predchádzajúca", next: "Nasledujúca →",
    consensus: "ZHODA MEDZI ZDROJMI", discrepancy: "NEZHODY",
    confidence: "Miera istoty:",
    locations: ["Všetky", "Gaza", "Libanon", "Sýria", "Izrael", "Západný breh", "Iné"],
    categories: ["Všetky", "obete", "infraštruktúra", "diplomatické", "obrázok", "iné"],
  },
  en: {
    subtitle: "PALIZRA ANALYZATOR · PUBLIC ANALYSES",
    title: "Analyses Archive",
    desc: "Verified claims and images related to the Israeli-Palestinian conflict.",
    back: "← Back to tool",
    location: "Location", category: "Category", lang: "Language",
    all: "All",
    loading: "Loading…", loadingDetail: "Loading detail…",
    error: "Cannot load analyses.",
    empty: "No public analyses for selected filters.",
    prev: "← Previous", next: "Next →",
    consensus: "CONSENSUS ACROSS SOURCES", discrepancy: "DISCREPANCIES",
    confidence: "Confidence level:",
    locations: ["All", "Gaza", "Lebanon", "Syria", "Israel", "West Bank", "Other"],
    categories: ["All", "casualties", "infrastructure", "diplomatic", "image", "other"],
  },
  ar: {
    subtitle: "محلل بالزرا · التحليلات العامة",
    title: "أرشيف التحليلات",
    desc: "ادعاءات وصور موثقة تتعلق بالصراع الإسرائيلي الفلسطيني.",
    back: "← العودة إلى الأداة",
    location: "الموقع", category: "الفئة", lang: "اللغة",
    all: "الكل",
    loading: "جار التحميل…", loadingDetail: "جار تحميل التفاصيل…",
    error: "لا يمكن تحميل التحليلات.",
    empty: "لا توجد تحليلات عامة للفلاتر المحددة.",
    prev: "← السابق", next: "التالي →",
    consensus: "توافق بين المصادر", discrepancy: "تناقضات",
    confidence: "مستوى الثقة:",
    locations: ["الكل", "غزة", "لبنان", "سوريا", "إسرائيل", "الضفة الغربية", "أخرى"],
    categories: ["الكل", "ضحايا", "بنية تحتية", "دبلوماسي", "صورة", "أخرى"],
  },
  he: {
    subtitle: "פליזרה אנלייזר · ניתוחים ציבוריים",
    title: "ארכיון ניתוחים",
    desc: "טענות ותמונות מאומתות הקשורות לסכסוך הישראלי-פלסטיני.",
    back: "← חזרה לכלי",
    location: "מיקום", category: "קטגוריה", lang: "שפה",
    all: "הכל",
    loading: "טוען…", loadingDetail: "טוען פרטים…",
    error: "לא ניתן לטעון ניתוחים.",
    empty: "אין ניתוחים ציבוריים לפילטרים שנבחרו.",
    prev: "← הקודם", next: "הבא →",
    consensus: "הסכמה בין מקורות", discrepancy: "סתירות",
    confidence: "רמת ביטחון:",
    locations: ["הכל", "עזה", "לבנון", "סוריה", "ישראל", "הגדה המערבית", "אחר"],
    categories: ["הכל", "נפגעים", "תשתיות", "דיפלומטי", "תמונה", "אחר"],
  },
};

export default function AnalysesPage() {
  // Jazyk z URL query stringu, napr. /analyses?lang=en
  const urlLang = new URLSearchParams(window.location.search).get("lang") || "en";
  const [lang, setLang] = useState(["sk","en","ar","he"].includes(urlLang) ? urlLang : "en");
  const u = UI[lang] || UI.en;
  const isRTL = lang === "ar" || lang === "he";

  const [analyses, setAnalyses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ location: "", category: "", lang: "" });
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const LIMIT = 20;

  async function fetchAnalyses() {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filters.location) params.set("location", filters.location);
      if (filters.category) params.set("category", filters.category);
      if (filters.lang) params.set("lang", filters.lang);
      const res = await fetch(`${API_BASE_URL}/api/analyses?${params}`);
      const data = await res.json();
      setAnalyses(data.analyses || []);
      setTotal(data.total || 0);
    } catch { setError(u.error); }
    finally { setLoading(false); }
  }

  async function fetchDetail(id) {
    setDetailLoading(true); setDetail(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/analyses/${id}`);
      setDetail(await res.json());
    } catch { setDetail(null); }
    finally { setDetailLoading(false); }
  }

  useEffect(() => { fetchAnalyses(); }, [page, filters]);

  function handleFilter(key, value) {
    const allLabel = u.all;
    setFilters(f => ({ ...f, [key]: value === allLabel ? "" : value }));
    setPage(1); setSelected(null); setDetail(null);
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} lang={lang}
      style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px", fontFamily: "'Iowan Old Style', Georgia, serif", background: COLORS.paper, color: COLORS.ink, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace" }}>{u.subtitle}</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "6px 0 4px" }}>{u.title}</h1>
          <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: 0 }}>
            {u.desc}
            <a href={`/?lang=${lang}`} style={{ marginLeft: 12, color: COLORS.inkSoft, fontSize: 13 }}>{u.back}</a>
          </p>
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

      {/* Filtre */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: u.location, key: "location", options: u.locations },
          { label: u.category, key: "category", options: u.categories },
          { label: u.lang, key: "lang", options: [u.all, "sk","en","ar","he"] },
        ].map(({ label, key, options }) => (
          <div key={key}>
            <label style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>{label.toUpperCase()}</label>
            <select
              value={filters[key] ? filters[key] : u.all}
              onChange={e => handleFilter(key, e.target.value)}
              style={{ fontFamily: "monospace", fontSize: 13, padding: "4px 8px", border: `1px solid ${COLORS.line}`, borderRadius: 4, background: "#fff", color: COLORS.ink }}>
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Obsah */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.4fr" : "1fr", gap: 20 }}>
        <div>
          {loading && <div style={{ color: COLORS.inkSoft, fontFamily: "monospace", fontSize: 13 }}>{u.loading}</div>}
          {error && <div style={{ color: COLORS.discrepancy, fontSize: 13 }}>{error}</div>}
          {!loading && analyses.length === 0 && <div style={{ color: COLORS.inkSoft, fontSize: 14 }}>{u.empty}</div>}
          {analyses.map(a => (
            <div key={a.id} onClick={() => { setSelected(a.id); fetchDetail(a.id); }}
              style={{ padding: "12px 14px", marginBottom: 8, border: `1px solid ${selected === a.id ? COLORS.ink : COLORS.line}`, borderRadius: 4, cursor: "pointer", background: selected === a.id ? COLORS.ink : "#fff", color: selected === a.id ? COLORS.paper : COLORS.ink }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: selected === a.id ? COLORS.line : COLORS.inkSoft, marginBottom: 4 }}>
                {a.date} · {tLocation(a.location, lang)} · {tCategory(a.category, lang)} · {a.lang?.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.4 }}>
                {a.claim_text?.slice(0, 120)}{a.claim_text?.length > 120 ? "…" : ""}
              </div>
            </div>
          ))}

          {total > LIMIT && (
            <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 10px", border: `1px solid ${COLORS.line}`, borderRadius: 4, cursor: page === 1 ? "not-allowed" : "pointer", background: "transparent" }}>
                {u.prev}
              </button>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.inkSoft }}>{page} / {Math.ceil(total/LIMIT)}</span>
              <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/LIMIT)}
                style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 10px", border: `1px solid ${COLORS.line}`, borderRadius: 4, cursor: page >= Math.ceil(total/LIMIT) ? "not-allowed" : "pointer", background: "transparent" }}>
                {u.next}
              </button>
            </div>
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 16, background: "#fff", fontSize: 13 }}>
            {detailLoading && <div style={{ color: COLORS.inkSoft, fontFamily: "monospace" }}>{u.loadingDetail}</div>}
            {detail && (
              <>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 8 }}>
                  {detail.date} · {tLocation(detail.location, lang)} · {tCategory(detail.category, lang)} · {detail.lang?.toUpperCase()}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.4 }}>{detail.claim_text}</div>
                {(() => {
                  // Použi preloženú verziu ak existuje, inak pôvodnú
                  const comparison = detail.translations?.[lang]?.comparison || detail.result?.comparison;
                  return comparison && (<>
                    {comparison.consensus_points?.length > 0 && (
                      <div style={{ marginBottom: 12, padding: "10px 12px", background: COLORS.consensusBg, borderRadius: 4 }}>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.consensus, letterSpacing: "0.06em", marginBottom: 6 }}>{u.consensus}</div>
                        {comparison.consensus_points.map((p,i) => (
                          <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>{p.point}</div>
                        ))}
                      </div>
                    )}
                    {comparison.discrepancies?.length > 0 && (
                      <div style={{ marginBottom: 12, padding: "10px 12px", background: COLORS.discrepancyBg, borderRadius: 4 }}>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.discrepancy, letterSpacing: "0.06em", marginBottom: 6 }}>{u.discrepancy}</div>
                        {comparison.discrepancies.map((d,i) => (
                          <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>{d.issue}</div>
                        ))}
                      </div>
                    )}
                    {comparison.confidence_level && (
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.line}`, fontSize: 13 }}>
                        <strong>{u.confidence} </strong>
                        <span style={{ color: CONFIDENCE_COLORS[comparison.confidence_level] || COLORS.ink }}>
                          {comparison.confidence_level}
                        </span>
                        {comparison.summary_note && (
                          <span style={{ color: COLORS.inkSoft }}> – {comparison.summary_note}</span>
                        )}
                      </div>
                    )}
                  </>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>

      <footer style={{ marginTop: 32, paddingTop: 14, borderTop: `1px solid ${COLORS.line}`, fontSize: 12, color: COLORS.inkSoft, textAlign: "center" }}>
        © {new Date().getFullYear()} Palizra Analyzator · <a href="/" style={{ color: COLORS.inkSoft }}>{u.back}</a>
      </footer>
    </div>
  );
}
