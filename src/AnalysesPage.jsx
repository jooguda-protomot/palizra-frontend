import React, { useState, useEffect } from "react";
import { translations } from "./translations.js";

const API_BASE_URL = "https://palizraanalyzator-production.up.railway.app";

// Mapovacie tabuľky - kódy → preklady
const LOCATION_MAP = {
  Gaza:          { sk: "Gaza",             en: "Gaza",             ar: "غزة",                  he: "עזה" },
  "West Bank":   { sk: "Západný breh",     en: "West Bank",        ar: "الضفة الغربية",       he: "הגדה המערבית" },
  "Západný breh":{ sk: "Západný breh",     en: "West Bank",        ar: "الضفة الغربية",       he: "הגדה המערבית" },
  Israel:        { sk: "Izrael",           en: "Israel",           ar: "إسرائيل",              he: "ישראל" },
  Izrael:        { sk: "Izrael",           en: "Israel",           ar: "إسرائيل",              he: "ישראל" },
  Lebanon:       { sk: "Libanon",          en: "Lebanon",          ar: "لبنان",                he: "לבנון" },
  Libanon:       { sk: "Libanon",          en: "Lebanon",          ar: "لبنان",                he: "לבנון" },
  Syria:         { sk: "Sýria",            en: "Syria",            ar: "سوريا",                he: "סוריה" },
  Sýria:         { sk: "Sýria",            en: "Syria",            ar: "سوريا",                he: "סוריה" },
  Iran:          { sk: "Irán",             en: "Iran",             ar: "إيران",                he: "איראן" },
  Yemen:         { sk: "Jemen",            en: "Yemen",            ar: "اليمن",                he: "תימן" },
  Egypt:         { sk: "Egypt",            en: "Egypt",            ar: "مصر",                  he: "מצרים" },
  Jordan:        { sk: "Jordánsko",        en: "Jordan",           ar: "الأردن",               he: "ירדן" },
  International: { sk: "OSN/Medzinárodné", en: "UN/International", ar: "دولي/الأمم المتحدة",  he: "בינלאומי/האום" },
  Other:         { sk: "Iné",              en: "Other",            ar: "أخرى",                 he: "אחר" },
  Iné:           { sk: "Iné",              en: "Other",            ar: "أخرى",                 he: "אחר" },
};

const CATEGORY_MAP = {
  casualties:     { sk: "Obete a straty",          en: "Casualties",             ar: "ضحايا وخسائر",         he: "נפגעים ואבידות" },
  attacks:        { sk: "Útoky a operácie",         en: "Attacks & operations",   ar: "هجمات وعمليات",        he: "תקיפות ומבצעים" },
  infrastructure: { sk: "Infraštruktúra a pomoc",   en: "Infrastructure & aid",   ar: "بنية تحتية ومساعدات",  he: "תשתיות וסיוע" },
  diplomatic:     { sk: "Diplomatické vyhlásenia",  en: "Diplomatic statements",  ar: "تصريحات دبلوماسية",    he: "הצהרות דיפלומטיות" },
  military:       { sk: "Vojenské tvrdenia",         en: "Military claims",        ar: "ادعاءات عسكرية",       he: "טענות צבאיות" },
  media:          { sk: "Médiá a dezinformácie",    en: "Media & disinformation", ar: "إعلام ومعلومات مضللة",  he: "מדיה ודיסאינפורמציה" },
  image:          { sk: "Obrázok/Video",             en: "Image/Video",            ar: "صورة/فيديو",            he: "תמונה/וידאו" },
  statistics:     { sk: "Čísla a štatistiky",       en: "Numbers & statistics",   ar: "أرقام وإحصاءات",       he: "מספרים וסטטיסטיקות" },
  other:          { sk: "Iné",                       en: "Other",                  ar: "أخرى",                  he: "אחר" },
  // Staré hodnoty pre spätnú kompatibilitu
  obete:          { sk: "Obete a straty",            en: "Casualties",             ar: "ضحايا وخسائر",         he: "נפגעים ואבידות" },
  "infraštruktúra":{ sk: "Infraštruktúra a pomoc",  en: "Infrastructure & aid",   ar: "بنية تحتية ومساعدات",  he: "תשתיות וסיוע" },
  diplomatické:   { sk: "Diplomatické vyhlásenia",   en: "Diplomatic statements",  ar: "تصريحات دبلوماسية",    he: "הצהרות דיפלומטיות" },
  obrázok:        { sk: "Obrázok/Video",             en: "Image/Video",            ar: "صورة/فيديو",            he: "תמונה/וידאו" },
  iné:            { sk: "Iné",                       en: "Other",                  ar: "أخرى",                  he: "אחר" },
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
    locations: ["Všetky", "Gaza", "Západný breh", "Izrael", "Libanon", "Sýria", "Irán", "Jemen", "Egypt", "Jordánsko", "OSN/Medzinárodné", "Iné"],
    categories: ["Všetky", "Obete a straty", "Útoky a operácie", "Infraštruktúra a pomoc", "Diplomatické vyhlásenia", "Vojenské tvrdenia", "Médiá a dezinformácie", "Obrázok/Video", "Čísla a štatistiky", "Iné"],
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
    locations: ["All", "Gaza", "West Bank", "Israel", "Lebanon", "Syria", "Iran", "Yemen", "Egypt", "Jordan", "UN/International", "Other"],
    categories: ["All", "Casualties", "Attacks & operations", "Infrastructure & aid", "Diplomatic statements", "Military claims", "Media & disinformation", "Image/Video", "Numbers & statistics", "Other"],
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
    locations: ["الكل", "غزة", "الضفة الغربية", "إسرائيل", "لبنان", "سوريا", "إيران", "اليمن", "مصر", "الأردن", "دولي/الأمم المتحدة", "أخرى"],
    categories: ["الكل", "ضحايا وخسائر", "هجمات وعمليات", "بنية تحتية ومساعدات", "تصريحات دبلوماسية", "ادعاءات عسكرية", "إعلام ومعلومات مضللة", "صورة/فيديو", "أرقام وإحصاءات", "أخرى"],
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
    locations: ["הכל", "עזה", "הגדה המערבית", "ישראל", "לבנון", "סוריה", "איראן", "תימן", "מצרים", "ירדן", "בינלאומי/האום", "אחר"],
    categories: ["הכל", "נפגעים ואבידות", "תקיפות ומבצעים", "תשתיות וסיוע", "הצהרות דיפלומטיות", "טענות צבאיות", "מדיה ודיסאינפורמציה", "תמונה/וידאו", "מספרים וסטטיסטיקות", "אחר"],
  },
};

const API_BASE_URL_FEEDBACK = "https://palizraanalyzator-production.up.railway.app";

function FeedbackButton({ analysisId, claimText, lang }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idle");

  const LABELS = {
    btn: { sk: "Nahlásiť problém", en: "Report an issue", ar: "الإبلاغ عن مشكلة", he: "דווח על בעיה" },
    placeholder: { sk: "Opíšte problém s touto analýzou...", en: "Describe the issue with this analysis...", ar: "صف المشكلة في هذا التحليل...", he: "תאר את הבעיה בניתוח זה..." },
    send: { sk: "Odoslať", en: "Send", ar: "إرسال", he: "שלח" },
    sending: { sk: "Odosiela sa…", en: "Sending…", ar: "جاري الإرسال…", he: "שולח…" },
    sent: { sk: "✓ Ďakujeme, problém bol nahlásený.", en: "✓ Thank you, issue reported.", ar: "✓ شكراً، تم الإبلاغ.", he: "✓ תודה, הבעיה דווחה." },
    error: { sk: "Chyba, skús znova.", en: "Error, try again.", ar: "خطأ، حاول مجدداً.", he: "שגיאה, נסה שוב." },
  };
  const t = key => LABELS[key][lang] || LABELS[key].en;

  async function handleSend() {
    if (!description.trim()) return;
    setStatus("sending");
    try {
      await fetch(`${API_BASE_URL_FEEDBACK}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context: "analyses_archive", subject: claimText, description, relatedData: { analysisId } }),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") return <div style={{ fontSize: 12, color: COLORS.consensus }}>{t("sent")}</div>;

  return (
    <div>
      {!open ? (
        <button onClick={() => setOpen(true)}
          style={{ background: "none", border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft, fontSize: 11, fontFamily: "monospace", cursor: "pointer", padding: "3px 8px", borderRadius: 3 }}>
          ⚑ {t("btn")}
        </button>
      ) : (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t("placeholder")}
            rows={3}
            style={{ fontFamily: "monospace", fontSize: 12, padding: "6px 8px", border: `1px solid ${COLORS.line}`, borderRadius: 3, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={handleSend} disabled={status === "sending" || !description.trim()}
              style={{ fontFamily: "monospace", fontSize: 11, padding: "3px 10px", background: COLORS.ink, color: COLORS.paper, border: "none", borderRadius: 3, cursor: "pointer" }}>
              {status === "sending" ? t("sending") : t("send")}
            </button>
            {status === "error" && <span style={{ fontSize: 11, color: COLORS.discrepancy }}>{t("error")}</span>}
            <button onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft, fontSize: 12 }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareButton({ id, lang }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/analyses?id=${id}&lang=${lang}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const label = copied
    ? (lang === "ar" ? "✓ تم النسخ" : lang === "he" ? "✓ הועתק" : lang === "en" ? "✓ Copied" : "✓ Skopírované")
    : (lang === "ar" ? "مشاركة" : lang === "he" ? "שתף" : lang === "en" ? "Share" : "Zdieľať");

  return (
    <button
      onClick={handleShare}
      style={{
        fontFamily: "monospace", fontSize: 11, padding: "3px 10px",
        background: copied ? COLORS.consensusBg : "transparent",
        color: copied ? COLORS.consensus : COLORS.inkSoft,
        border: `1px solid ${copied ? COLORS.consensus : COLORS.line}`,
        borderRadius: 3, cursor: "pointer", flexShrink: 0,
        transition: "all 0.2s",
      }}>
      {label}
    </button>
  );
}

export default function AnalysesPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("lang") || "en";
  const urlId = urlParams.get("id") || null;
  const [lang, setLang] = useState(["sk","en","ar","he"].includes(urlLang) ? urlLang : "en");
  const u = UI[lang] || UI.en;
  const isRTL = lang === "ar" || lang === "he";

  const [analyses, setAnalyses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ location: "", category: "", lang: "" });
  const [search, setSearch] = useState("");
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

  // Ak je v URL ?id=..., automaticky vyber tú analýzu
  useEffect(() => {
    if (urlId) {
      setSelected(urlId);
      fetchDetail(urlId);
    }
  }, [urlId]);

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

      {/* Vyhľadávanie */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setSelected(null); setDetail(null); }}
          placeholder={lang === "ar" ? "بحث في النصوص…" : lang === "he" ? "חפש בטקסטים…" : lang === "en" ? "Search in texts…" : "Hľadaj v textoch…"}
          style={{ width: "100%", padding: "8px 12px", fontFamily: "monospace", fontSize: 13, border: `1px solid ${COLORS.line}`, borderRadius: 4, boxSizing: "border-box", background: "#fff" }}
        />
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
          {analyses
            .filter(a => !search || a.claim_text?.toLowerCase().includes(search.toLowerCase()))
            .map(a => (
            <div key={a.id} onClick={() => { setSelected(a.id); fetchDetail(a.id); }}
              style={{ padding: "12px 14px", marginBottom: 8, border: `1px solid ${selected === a.id ? COLORS.ink : COLORS.line}`, borderRadius: 4, cursor: "pointer", background: selected === a.id ? COLORS.ink : "#fff", color: selected === a.id ? COLORS.paper : COLORS.ink }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: selected === a.id ? COLORS.line : COLORS.inkSoft, marginBottom: 4 }}>
                {new Date(a.date).toLocaleDateString(
                  lang === "sk" ? "sk-SK" : lang === "ar" ? "ar-SA" : lang === "he" ? "he-IL" : "en-GB",
                  { day: "numeric", month: "long", year: "numeric" }
                )} · {tLocation(a.location, lang)} · {tCategory(a.category, lang)} · {a.lang?.toUpperCase()}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft }}>
                    {new Date(detail.date).toLocaleDateString(
                      lang === "sk" ? "sk-SK" : lang === "ar" ? "ar-SA" : lang === "he" ? "he-IL" : "en-GB",
                      { day: "numeric", month: "long", year: "numeric" }
                    )} · {tLocation(detail.location, lang)} · {tCategory(detail.category, lang)} · {detail.lang?.toUpperCase()}
                  </div>
                  <ShareButton id={detail.id} lang={lang} />
                  <FeedbackButton analysisId={detail.id} claimText={detail.claim_text} lang={lang} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>{detail.claim_text}</div>

                {/* Zdroj tvrdenia */}
                {(detail.source_url || detail.source_platform) && (
                  <div style={{ fontSize: 12, fontFamily: "monospace", marginBottom: 14, padding: "8px 12px", background: "#f8f6f1", border: `1px solid ${COLORS.line}`, borderRadius: 4 }}>
                    <span style={{ color: COLORS.inkSoft, marginRight: 6 }}>
                      {lang === "ar" ? "المصدر:" : lang === "he" ? "מקור:" : lang === "en" ? "Source:" : "Zdroj:"}
                    </span>
                    {detail.source_platform && (
                      <span style={{ background: COLORS.ink, color: COLORS.paper, padding: "1px 6px", borderRadius: 2, fontSize: 10, marginRight: 8 }}>
                        {detail.source_platform.toUpperCase()}
                      </span>
                    )}
                    {detail.source_date && (
                      <span style={{ color: COLORS.inkSoft, marginRight: 8 }}>{detail.source_date}</span>
                    )}
                    {detail.source_url && (
                      <a href={detail.source_url} target="_blank" rel="noopener noreferrer"
                        style={{ color: COLORS.ink, wordBreak: "break-all" }}>
                        {detail.source_url.length > 60 ? detail.source_url.slice(0, 60) + "…" : detail.source_url}
                      </a>
                    )}
                  </div>
                )}

                {/* Update notice */}
                {detail.updateNotice && (
                  <div style={{ marginBottom: 16, padding: "10px 14px", background: "#F5F0FC", border: "1px solid #7B5EA7", borderRadius: 4 }}>
                    <div style={{ fontSize: 10, fontFamily: "monospace", color: "#7B5EA7", letterSpacing: "0.06em", marginBottom: 4 }}>
                      ⚠ {lang === "ar" ? "تحديث" : lang === "he" ? "עדכון" : lang === "en" ? "UPDATE" : "AKTUALIZÁCIA"} · {detail.updateNotice.date}
                    </div>
                    <div style={{ fontSize: 13, color: "#1F2A24" }}>
                      {detail.updateNotice.translations?.[lang] || detail.updateNotice.text}
                    </div>
                    {detail.updateNotice.relatedAnalysisId && (
                      <a href={`/analyses?id=${detail.updateNotice.relatedAnalysisId}`}
                        style={{ fontSize: 12, color: "#7B5EA7", marginTop: 4, display: "block" }}>
                        {lang === "ar" ? "← عرض التحليل المحدث" : lang === "he" ? "← צפה בניתוח המעודכן" : lang === "en" ? "← View updated analysis" : "← Zobraziť aktualizovanú analýzu"}
                      </a>
                    )}
                  </div>
                )}
                {(() => {
                  // Použi preloženú verziu ak existuje, inak pôvodnú
                  const comparison = detail.translations?.[lang]?.comparison || detail.result?.comparison;
                  const imageAnalysis = detail.result?.imageAnalysis;

                  // Obrazová analýza
                  if (imageAnalysis) return (
                    <>
                      {detail.result?.imageUrl && (
                        <div style={{ marginBottom: 12 }}>
                          <img src={detail.result.imageUrl} alt="verified"
                            style={{ maxWidth: "100%", borderRadius: 4, border: `1px solid ${COLORS.line}` }} />
                        </div>
                      )}

                      {/* Vizuálny popis */}
                      {imageAnalysis.llmAnalysis?.visual_description && (
                        <div style={{ marginBottom: 12, padding: "10px 12px", background: "#f8f6f1", borderRadius: 4 }}>
                          <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 6, letterSpacing: "0.06em" }}>
                            {lang === "ar" ? "الوصف البصري" : lang === "he" ? "תיאור חזותי" : lang === "en" ? "VISUAL DESCRIPTION" : "VIZUÁLNY POPIS"}
                          </div>
                          <div style={{ fontSize: 13 }}>{imageAnalysis.llmAnalysis.visual_description}</div>
                          {imageAnalysis.llmAnalysis.earliest_known_appearance && (
                            <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 6 }}>
                              <strong>{lang === "en" ? "Earliest known appearance: " : lang === "ar" ? "أقدم ظهور معروف: " : lang === "he" ? "הופעה ראשונה ידועה: " : "Najstarší známy výskyt: "}</strong>
                              {imageAnalysis.llmAnalysis.earliest_known_appearance}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Geolokácia */}
                      {imageAnalysis.llmAnalysis?.geolocation_assessment && (
                        <div style={{ marginBottom: 12, padding: "10px 12px", background: COLORS.consensusBg, borderRadius: 4 }}>
                          <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.consensus, marginBottom: 6, letterSpacing: "0.06em" }}>
                            {lang === "ar" ? "تحديد الموقع" : lang === "he" ? "גיאולוקציה" : lang === "en" ? "GEOLOCATION" : "GEOLOKÁCIA"}
                          </div>
                          {typeof imageAnalysis.llmAnalysis.geolocation_assessment === "string" ? (
                            <div style={{ fontSize: 13 }}>{imageAnalysis.llmAnalysis.geolocation_assessment}</div>
                          ) : (
                            <>
                              {imageAnalysis.llmAnalysis.geolocation_assessment.consistency_with_claimed_location && (
                                <div style={{ fontSize: 13, marginBottom: 4 }}>
                                  <strong>{lang === "en" ? "Consistency: " : lang === "ar" ? "التوافق: " : lang === "he" ? "עקביות: " : "Súlad: "}</strong>
                                  {imageAnalysis.llmAnalysis.geolocation_assessment.consistency_with_claimed_location}
                                </div>
                              )}
                              {imageAnalysis.llmAnalysis.geolocation_assessment.explanation && (
                                <div style={{ fontSize: 13 }}>{imageAnalysis.llmAnalysis.geolocation_assessment.explanation}</div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* EXIF Metadata */}
                      <div style={{ marginBottom: 12, padding: "10px 12px", background: "#f8f6f1", borderRadius: 4 }}>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 6, letterSpacing: "0.06em" }}>
                          {lang === "ar" ? "بيانات EXIF" : lang === "he" ? "מטאדאטה EXIF" : "METADATA (EXIF)"}
                        </div>
                        {imageAnalysis.exif?.date || imageAnalysis.exif?.device ? (
                          <>
                            {imageAnalysis.exif.date && <div style={{ fontSize: 13 }}>{lang === "en" ? "Date: " : "Dátum: "}{imageAnalysis.exif.date}</div>}
                            {imageAnalysis.exif.device && <div style={{ fontSize: 13 }}>{lang === "en" ? "Device: " : "Zariadenie: "}{imageAnalysis.exif.device}</div>}
                          </>
                        ) : (
                          <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
                            {lang === "ar" ? "لا توجد بيانات EXIF." : lang === "he" ? "אין נתוני EXIF." : lang === "en" ? "No EXIF data found." : "Žiadne EXIF dáta."}
                          </div>
                        )}
                      </div>

                      {/* Reverse Image Search */}
                      {imageAnalysis.reverseSearch && Object.keys(imageAnalysis.reverseSearch).length > 0 && (
                        <div style={{ marginBottom: 12, padding: "10px 12px", background: "#f8f6f1", borderRadius: 4 }}>
                          <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 6, letterSpacing: "0.06em" }}>
                            {lang === "ar" ? "بحث عكسي عن الصورة" : lang === "he" ? "חיפוש תמונה הפוך" : "REVERSE IMAGE SEARCH"}
                          </div>
                          {Object.entries(imageAnalysis.reverseSearch).map(([engine, results]) => (
                            Array.isArray(results) && results.length > 0 ? (
                              <div key={engine} style={{ marginBottom: 8 }}>
                                <div style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 4 }}>{engine.toUpperCase()} – {results.length} results</div>
                                {results.slice(0, 5).map((r, i) => (
                                  <div key={i} style={{ fontSize: 12, marginBottom: 2 }}>
                                    <a href={r.url || r.link} target="_blank" rel="noopener noreferrer"
                                      style={{ color: COLORS.ink }}>
                                      {(r.title || r.url || r.link || "").slice(0, 80)}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : null
                          ))}
                        </div>
                      )}

                      {/* Archívna kontrola */}
                      {imageAnalysis.archiveMatch && (
                        <div style={{ marginBottom: 12, padding: "10px 12px", background: COLORS.discrepancyBg, border: `1px solid ${COLORS.discrepancy}`, borderRadius: 4 }}>
                          <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.discrepancy, marginBottom: 6, letterSpacing: "0.06em" }}>
                            {lang === "en" ? "⚠ ARCHIVE MATCH" : lang === "ar" ? "⚠ تطابق الأرشيف" : lang === "he" ? "⚠ התאמת ארכיון" : "⚠ ZHODA V ARCHÍVE"}
                          </div>
                          <div style={{ fontSize: 13 }}>{imageAnalysis.archiveMatch.context}</div>
                          {imageAnalysis.archiveMatch.date && (
                            <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>
                              {lang === "en" ? "Original date: " : "Pôvodný dátum: "}{imageAnalysis.archiveMatch.date}
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Detekcia */}
                      {imageAnalysis.aiDetection?.ai_probability !== undefined && (
                        <div style={{ marginBottom: 12, padding: "10px 12px", background: imageAnalysis.aiDetection.ai_probability > 0.7 ? COLORS.discrepancyBg : COLORS.consensusBg, borderRadius: 4 }}>
                          <div style={{ fontSize: 10, fontFamily: "monospace", color: imageAnalysis.aiDetection.ai_probability > 0.7 ? COLORS.discrepancy : COLORS.consensus, marginBottom: 4, letterSpacing: "0.06em" }}>
                            {lang === "ar" ? "كشف الذكاء الاصطناعي" : lang === "he" ? "זיהוי בינה מלאכותית" : lang === "en" ? "AI DETECTION" : "AI DETEKCIA"}
                          </div>
                          <div style={{ fontSize: 13 }}>
                            {lang === "en" ? "AI probability: " : lang === "ar" ? "احتمالية الذكاء الاصطناعي: " : lang === "he" ? "הסתברות AI: " : "Pravdepodobnosť AI: "}
                            <strong>{(imageAnalysis.aiDetection.ai_probability * 100).toFixed(0)}%</strong>
                          </div>
                          <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>
                            {lang === "en" ? "AI detectors have high error rates for compressed images. Use as one signal only."
                              : lang === "ar" ? "كاشفات الذكاء الاصطناعي لها معدل خطأ عال للصور المضغوطة."
                              : lang === "he" ? "גלאי AI עלולים לטעות עבור תמונות דחוסות."
                              : "AI detektory majú vysokú chybovosť pri kompresovaných obrázkoch. Použiť len ako jeden signál."}
                          </div>
                        </div>
                      )}
                    </>
                  );

                  // Textová analýza
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
