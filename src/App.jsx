import React, { useState } from "react";
import { Search, FileText, AlertTriangle, CheckCircle2, HelpCircle, Quote, Scale, Image as ImageIcon, Upload, Clock, Flag, X } from "lucide-react";
import { translations } from "./translations.js";

// ---------- Konfigurácia backendu ----------
// Produkčný backend nasadený na Railway.
const API_BASE_URL = "https://palizraanalyzator-production.up.railway.app";

// ---------- Tokeny dizajnu ----------
// Koncept: "vyšetrovacia zložka" - papierová, vecná, dôkazová estetika.
// Farby: atramentová modrá, papierová krémová, jediný akcent (pečiatka-červená)
// vyhradený len pre "nezhody" - aby pohľad okamžite ukázal, kde sa zdroje rozchádzajú.
const COLORS = {
  paper: "#EFEAE0",
  paperDark: "#E3DCCC",
  ink: "#1F2A24",
  inkSoft: "#4A5550",
  line: "#C9BFA8",
  consensus: "#2F6B4F",
  consensusBg: "#E4EEE6",
  discrepancy: "#9A3324",
  discrepancyBg: "#F3E4DE",
  framing: "#8A6A1E",
  framingBg: "#F1E8D2",
  unverified: "#5B5246",
  unverifiedBg: "#E9E3D6",
};

const TYPE_META = {
  factual_claim: { icon: CheckCircle2, color: COLORS.consensus, bg: COLORS.consensusBg },
  quoted_statement: { icon: Quote, color: COLORS.framing, bg: COLORS.framingBg },
  interpretation: { icon: Scale, color: COLORS.discrepancy, bg: COLORS.discrepancyBg },
  unverifiable: { icon: HelpCircle, color: COLORS.unverified, bg: COLORS.unverifiedBg },
};

async function describeImageViaBackend(file, claimedContext, lang) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("claimedContext", claimedContext || "");
  formData.append("lang", lang || "sk");

  const response = await fetch(`${API_BASE_URL}/api/image/verify`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Backend vrátil HTTP ${response.status}`);
  }

  return data; // { imageUrl, metadata, aiDetection, reverseResults, archiveCheck, llmAnalysis }
}


async function extractClaimsViaBackend(text, lang) {
  const response = await fetch(`${API_BASE_URL}/api/claims/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Backend vrátil HTTP ${response.status}`);
  }

  return data; // { claims: [...] }
}

async function checkConsistencyViaBackend(claims, lang) {
  const response = await fetch(`${API_BASE_URL}/api/claims/check-consistency`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claims, lang }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Backend vrátil HTTP ${response.status}`);
  }

  return data; // { issues: [...] }
}

async function verifyClaimViaBackend(claim, lang) {
  const response = await fetch(`${API_BASE_URL}/api/claims/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim, lang }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Backend vrátil HTTP ${response.status}`);
  }

  return data; // { claim, comparison } alebo { claim, status: "skipped", note }
}

export default function ClaimVerifierDemo() {
  const [lang, setLang] = useState("en");
  const t = (key) => {
    const val = translations[lang]?.[key] ?? translations["sk"]?.[key] ?? key;
    return typeof val === "string" ? val.replace("{year}", new Date().getFullYear()) : val;
  };
  const isRTL = lang === "ar" || lang === "he";

  const [activeTab, setActiveTab] = useState("text"); // "text" | "image"
  const [inputText, setInputText] = useState("");
  const [claims, setClaims] = useState(null);
  const [consistencyIssues, setConsistencyIssues] = useState(null);
  const [consistencyLoading, setConsistencyLoading] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState(null);

  // Obrazové overenie
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [claimedContext, setClaimedContext] = useState("");
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageLoadingMsg, setImageLoadingMsg] = useState("");
  const [imageError, setImageError] = useState(null);

  // Progresívne loading správy
  const TEXT_LOADING_MSGS = {
    sk: ["Rozkladám tvrdenia…", "Kontrolujem konzistentnosť…", "Vyhľadávam zdroje…", "Porovnávam zdroje…", "Dokončujem analýzu…"],
    en: ["Breaking down claims…", "Checking consistency…", "Searching sources…", "Comparing sources…", "Finishing analysis…"],
    ar: ["تحليل الادعاءات…", "فحص الاتساق…", "البحث في المصادر…", "مقارنة المصادر…", "إنهاء التحليل…"],
    he: ["מפרק טענות…", "בודק עקביות…", "מחפש מקורות…", "משווה מקורות…", "מסיים ניתוח…"],
  };
  const IMAGE_LOADING_MSGS = {
    sk: ["Nahrávam obrázok…", "Analyzujem vizuálny obsah…", "Hľadám podobné obrázky…", "Overujem geolokáciu…", "Dokončujem overenie…"],
    en: ["Uploading image…", "Analyzing visual content…", "Searching for similar images…", "Verifying geolocation…", "Finishing verification…"],
    ar: ["رفع الصورة…", "تحليل المحتوى المرئي…", "البحث عن صور مماثلة…", "التحقق من الموقع…", "إنهاء التحقق…"],
    he: ["מעלה תמונה…", "מנתח תוכן חזותי…", "מחפש תמונות דומות…", "מאמת מיקום…", "מסיים אימות…"],
  };

  function startProgressMsgs(msgs, setMsg, intervalRef) {
    let i = 0;
    setMsg(msgs[0]);
    intervalRef.current = setInterval(() => {
      i = Math.min(i + 1, msgs.length - 1);
      setMsg(msgs[i]);
    }, 4000);
  }

  const textProgressRef = React.useRef(null);
  const imageProgressRef = React.useRef(null);

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageAnalysis(null);
    setImageError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleAnalyzeImage() {
    if (!imageFile) return;
    setImageLoading(true);
    setImageError(null);
    startProgressMsgs(IMAGE_LOADING_MSGS[lang] || IMAGE_LOADING_MSGS.en, setImageLoadingMsg, imageProgressRef);
    try {
      const result = await describeImageViaBackend(imageFile, claimedContext, lang);
      setImageAnalysis(result);
    } catch (e) {
      setImageError(
        e.message?.includes("fetch")
          ? t("error_connect") + " " + API_BASE_URL
          : e.message || "Analýza obrázka sa nepodarila."
      );
    } finally {
      clearInterval(imageProgressRef.current);
      setImageLoadingMsg("");
      setImageLoading(false);
    }
  }

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setClaims(null);
    setComparison(null);
    setSelectedClaimId(null);
    setConsistencyIssues(null);
    setConsistencyLoading(false);
    startProgressMsgs(TEXT_LOADING_MSGS[lang] || TEXT_LOADING_MSGS.en, setLoadingMsg, textProgressRef);
    try {
      const result = await extractClaimsViaBackend(inputText, lang);
      const claimsList = result.claims || [];
      setClaims(claimsList);

      // Kontrola konzistentnosti beží na pozadí, neblokuje zobrazenie tvrdení
      if (claimsList.length >= 2) {
        setConsistencyLoading(true);
        checkConsistencyViaBackend(claimsList, lang)
          .then((res) => setConsistencyIssues(res.issues || []))
          .catch(() => setConsistencyIssues(null))
          .finally(() => setConsistencyLoading(false));
      }
    } catch (e) {
      setError(
        e.message?.includes("fetch")
          ? "Nedá sa pripojiť na backend. Beží server na " + API_BASE_URL + " ? (npm run dev v priečinku server/)"
          : e.message || t("error_extract")
      );
    } finally {
      clearInterval(textProgressRef.current);
      setLoadingMsg("");
      setLoading(false);
    }
  }

  async function handleSelectClaim(claim) {
    setSelectedClaimId(claim.id);
    if (claim.type !== "factual_claim" && claim.type !== "unverifiable") {
      setComparison(null);
      return;
    }
    setComparison({ loading: true });
    try {
      const result = await verifyClaimViaBackend(claim, lang);
      if (result.status === "skipped") {
        setComparison(null);
      } else {
        setComparison(result.comparison);
      }
    } catch (e) {
      setComparison({ error: e.message || "Porovnanie zdrojov sa nepodarilo." });
    }
  }

  return (
    <div
      className="cv-root"
      dir={isRTL ? "rtl" : "ltr"}
      lang={lang}
      style={{
        fontFamily: "'Iowan Old Style', 'Georgia', serif",
        background: COLORS.paper,
        color: COLORS.ink,
        minHeight: "100%",
        padding: "32px 24px",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @media (max-width: 640px) {
          .cv-grid { grid-template-columns: 1fr !important; }
          .cv-header { flex-direction: column !important; gap: 12px !important; }
          .cv-header-right { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .cv-lang-row { flex-wrap: wrap !important; }
          .cv-tabs { flex-wrap: wrap !important; gap: 4px !important; }
          .cv-root { padding: 16px 12px !important; }
          .cv-textarea { font-size: 16px !important; }
        }
        .cv-btn:focus-visible, .cv-claim:focus-visible {
          outline: 2px solid ${COLORS.ink};
          outline-offset: 2px;
        }
      `}</style>

      <header style={{ marginBottom: 28, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 16 }}>
        <div className="cv-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace" }}>
              {t("module_label")}
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: "6px 0 4px", letterSpacing: "-0.01em" }}>
              {t("app_title")}
            </h1>
            <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: 0, maxWidth: 560, lineHeight: 1.5 }}>
              {t("app_subtitle")}
            </p>
          </div>
          <div className="cv-header-right" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0, marginTop: 4 }}>
            <div className="cv-lang-row" style={{ display: "flex", gap: 4 }}>
            {["sk", "en", "ar", "he"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  background: lang === l ? COLORS.ink : "transparent",
                  color: lang === l ? COLORS.paper : COLORS.inkSoft,
                  border: `1px solid ${lang === l ? COLORS.ink : COLORS.line}`,
                  borderRadius: 4,
                  padding: "4px 10px",
                  fontSize: 12,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
            </div>
            <a
              href="/analyses"
              style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: COLORS.inkSoft,
                textDecoration: "none",
                letterSpacing: "0.06em",
                border: `1px solid ${COLORS.line}`,
                borderRadius: 3,
                padding: "3px 8px",
              }}
            >
              {lang === "ar" ? "أرشيف التحليلات" : lang === "he" ? "ארכיון ניתוחים" : lang === "en" ? "ANALYSES ARCHIVE" : "ARCHÍV ANALÝZ"} →
            </a>
            <a
              href="mailto:palizra@proton.me"
              style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: COLORS.inkSoft,
                textDecoration: "none",
                letterSpacing: "0.06em",
                border: `1px solid ${COLORS.line}`,
                borderRadius: 3,
                padding: "3px 8px",
              }}
            >
              {lang === "ar" ? "اتصل بنا" : lang === "he" ? "צור קשר" : lang === "en" ? "CONTACT" : "KONTAKT"}
            </a>
          </div>
        </div>
      </header>

      <div className="cv-tabs" style={{ display: "flex", gap: 6, marginBottom: 22 }}>
        {[
          { id: "text", label: t("tab_text"), icon: FileText },
          { id: "image", label: t("tab_image"), icon: ImageIcon },
          { id: "about", label: t("tab_about"), icon: HelpCircle },
          { id: "changelog", label: t("tab_changelog"), icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className="cv-btn"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: isActive ? COLORS.ink : "transparent",
                color: isActive ? COLORS.paper : COLORS.inkSoft,
                border: `1px solid ${isActive ? COLORS.ink : COLORS.line}`,
                borderRadius: 4,
                padding: "7px 14px",
                fontSize: 13,
                fontFamily: "monospace",
                letterSpacing: "0.03em",
                cursor: "pointer",
              }}
            >
              <Icon size={13} />
              {tab.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {activeTab === "text" && (
      <>
      <div style={{ marginBottom: 20 }}>
        <textarea
          className="cv-textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            background: "#fff",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 4,
            padding: 14,
            fontSize: 15,
            fontFamily: "inherit",
            color: COLORS.ink,
            resize: "vertical",
            boxSizing: "border-box",
          }}
          placeholder={t("text_placeholder")}
        />
        <button
          className="cv-btn"
          onClick={handleAnalyze}
          disabled={loading || !inputText.trim()}
          style={{
            marginTop: 10,
            background: COLORS.ink,
            color: COLORS.paper,
            border: "none",
            borderRadius: 4,
            padding: "10px 18px",
            fontSize: 14,
            fontFamily: "monospace",
            letterSpacing: "0.04em",
            cursor: loading ? "default" : "pointer",
            opacity: loading || !inputText.trim() ? 0.6 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Search size={14} />
          {loading ? t("btn_analyzing") : t("btn_analyze")}
        </button>
        {loading && loadingMsg && (
          <div style={{ marginTop: 10, fontSize: 12, color: COLORS.inkSoft, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.inkSoft, animation: "pulse 1.2s infinite" }} />
            {loadingMsg}
          </div>
        )}
        {error && (
          <div style={{ marginTop: 10, color: COLORS.discrepancy, fontSize: 13 }}>{error}</div>
        )}
      </div>

      {claims && claims.length > 0 && (
        <>
        {consistencyLoading && (
          <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 14, fontFamily: "monospace" }}>
            {t("consistency_loading")}
          </div>
        )}
        {!consistencyLoading && consistencyIssues && consistencyIssues.length > 0 && (
          <div style={{ marginBottom: 14, background: COLORS.discrepancyBg, border: `1px solid ${COLORS.discrepancy}55`, borderRadius: 4, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <AlertTriangle size={14} color={COLORS.discrepancy} />
              <span style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.discrepancy, letterSpacing: "0.04em" }}>
                {`${t("consistency_found")} (${consistencyIssues.length})`}
              </span>
            </div>
            {consistencyIssues.map((issue, i) => (
              <div key={i} style={{ fontSize: 13, marginBottom: 6 }}>
                <strong style={{ color: COLORS.ink }}>
                  [{({ casova_os: "Časová os", ciselna_nezrovnalost: "Číselná nezrovnalosť", logicky_rozpor: "Logický rozpor", nekonzistentne_pomenovanie: "Nekonzistentné pomenovanie" })[issue.type] || issue.type}]
                </strong>{" "}
                {issue.description}
                {issue.claim_ids?.length > 0 && (
                  <span style={{ color: COLORS.inkSoft }}> (tvrdenia č. {issue.claim_ids.join(", ")})</span>
                )}
              </div>
            ))}
          </div>
        )}
        {!consistencyLoading && consistencyIssues && consistencyIssues.length === 0 && (
          <div style={{ fontSize: 13, color: COLORS.consensus, marginBottom: 14 }}>
            {t("consistency_none")}
          </div>
        )}
        <div className="cv-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20 }}>
          {/* Ľavý panel: zoznam tvrdení */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace", marginBottom: 10 }}>
              {`${t("breakdown_label")} (${claims.length})`}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {claims.map((claim) => {
                const meta = TYPE_META[claim.type] || TYPE_META.unverifiable;
                const Icon = meta.icon;
                const isSelected = selectedClaimId === claim.id;
                return (
                  <button
                    key={claim.id}
                    className="cv-claim"
                    onClick={() => handleSelectClaim(claim)}
                    style={{
                      textAlign: "left",
                      background: isSelected ? meta.bg : "#fff",
                      border: `1px solid ${isSelected ? meta.color : COLORS.line}`,
                      borderRadius: 4,
                      padding: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <Icon size={14} color={meta.color} />
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: meta.color, letterSpacing: "0.03em" }}>
                        {t(`type_${claim.type}`).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.4, color: COLORS.ink }}>{claim.original_text}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pravý panel: porovnanie zdrojov */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace", marginBottom: 10 }}>
              {t("sources_label")}
            </div>
            {!comparison && (
              <div style={{ fontSize: 14, color: COLORS.inkSoft, padding: 16, border: `1px dashed ${COLORS.line}`, borderRadius: 4 }}>
                {t("sources_select_hint")}
              </div>
            )}
            {comparison?.loading && (
              <div style={{ fontSize: 14, color: COLORS.inkSoft, padding: 16 }}>{t("sources_loading")}</div>
            )}
            {comparison?.error && (
              <div style={{ fontSize: 14, color: COLORS.discrepancy, padding: 16 }}>{comparison.error}</div>
            )}
            {comparison && !comparison.loading && !comparison.error && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section title={t("section_consensus")} color={COLORS.consensus} bg={COLORS.consensusBg}>
                  {(comparison.consensus_points || []).map((p, i) => (
                    <div key={i} style={{ fontSize: 14, marginBottom: 4 }}>
                      {p.point}
                      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(p.supporting_sources || []).map((s, j) =>
                          typeof s === "string" ? (
                            <span key={j}>{s}</span>
                          ) : (
                            <SourceLink key={j} source={s.source} url={s.url} archivedUrl={s.archived_url} color={COLORS.consensus} t={t} />
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </Section>

                <Section title={t("section_discrepancy")} color={COLORS.discrepancy} bg={COLORS.discrepancyBg} icon={AlertTriangle}>
                  {(comparison.discrepancies || []).map((d, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{d.issue}</div>
                      {(d.positions || []).map((pos, j) => (
                        <div key={j} style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 3, paddingLeft: 10, borderLeft: `2px solid ${COLORS.discrepancy}` }}>
                          <strong style={{ color: COLORS.ink }}>
                            <SourceLink source={pos.source} url={pos.url} archivedUrl={pos.archived_url} color={COLORS.discrepancy} t={t} />:
                          </strong>{" "}
                          {pos.claims}
                        </div>
                      ))}
                    </div>
                  ))}
                </Section>

                <Section title={t("section_framing")} color={COLORS.framing} bg={COLORS.framingBg}>
                  {(comparison.framing_differences || []).map((f, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 4 }}>{f.point}</div>
                      {(f.examples || []).map((ex, j) => (
                        <div key={j} style={{ fontSize: 13 }}>
                          <strong>
                            <SourceLink source={ex.source} url={ex.url} archivedUrl={ex.archived_url} color={COLORS.framing} t={t} />:
                          </strong>{" "}
                          {ex.framing}
                        </div>
                      ))}
                    </div>
                  ))}
                </Section>

                <Section title={t("section_unverified")} color={COLORS.unverified} bg={COLORS.unverifiedBg}>
                  {(comparison.unsupported_by_independent_sources || []).map((u, i) => (
                    <div key={i} style={{ fontSize: 13 }}>{u}</div>
                  ))}
                </Section>

                <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 10, fontSize: 13, color: COLORS.inkSoft }}>
                  <strong style={{ color: COLORS.ink }}>{t("confidence_label")} {comparison.confidence_level}.</strong>{" "}
                  {comparison.summary_note}
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
                  <FeedbackButton
                    context="text_comparison"
                    subject={claims.find((c) => c.id === selectedClaimId)?.original_text || null}
                    relatedData={comparison}
                    t={t}
                  />
                  <SaveAnalysisButton
                    claimText={claims.find((c) => c.id === selectedClaimId)?.original_text || ""}
                    type="text"
                    lang={lang}
                    result={{ comparison }}
                    t={t}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        </>
      )}
      </>
      )}

      {activeTab === "image" && (
        <div className="cv-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20 }}>
          {/* Ľavý panel: upload + kontext */}
          <div>
            <label
              htmlFor="cv-image-upload"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: `1px dashed ${COLORS.line}`,
                borderRadius: 4,
                padding: 24,
                cursor: "pointer",
                background: "#fff",
                minHeight: 140,
              }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Náhľad" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 3 }} />
              ) : (
                <>
                  <Upload size={20} color={COLORS.inkSoft} />
                  <span style={{ fontSize: 13, color: COLORS.inkSoft, fontFamily: "monospace" }}>
                    {t("image_click_upload")}
                  </span>
                </>
              )}
            </label>
            <input id="cv-image-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />

            <textarea
              value={claimedContext}
              onChange={(e) => setClaimedContext(e.target.value)}
              rows={3}
              placeholder={t("image_context_placeholder")}
              style={{
                width: "100%",
                marginTop: 12,
                background: "#fff",
                border: `1px solid ${COLORS.line}`,
                borderRadius: 4,
                padding: 12,
                fontSize: 14,
                fontFamily: "inherit",
                color: COLORS.ink,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <button
              className="cv-btn"
              onClick={handleAnalyzeImage}
              disabled={imageLoading || !imageFile}
              style={{
                marginTop: 10,
                background: COLORS.ink,
                color: COLORS.paper,
                border: "none",
                borderRadius: 4,
                padding: "10px 18px",
                fontSize: 14,
                fontFamily: "monospace",
                letterSpacing: "0.04em",
                cursor: imageLoading ? "default" : "pointer",
                opacity: imageLoading || !imageFile ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Search size={14} />
              {imageLoading ? t("btn_verifying_image") : t("btn_verify_image")}
            </button>
            {imageLoading && imageLoadingMsg && (
              <div style={{ marginTop: 10, fontSize: 12, color: COLORS.inkSoft, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: COLORS.inkSoft, animation: "pulse 1.2s infinite" }} />
                {imageLoadingMsg}
              </div>
            )}
            {imageError && <div style={{ marginTop: 10, color: COLORS.discrepancy, fontSize: 13 }}>{imageError}</div>}
          </div>

          {/* Pravý panel: výsledky */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace", marginBottom: 10 }}>
              {t("image_result_title")}
            </div>
            {!imageAnalysis && (
              <div style={{ fontSize: 14, color: COLORS.inkSoft, padding: 16, border: `1px dashed ${COLORS.line}`, borderRadius: 4 }}>
                {t("image_select_hint")}
              </div>
            )}
            {imageAnalysis && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section title={t("section_visual")} color={COLORS.consensus} bg={COLORS.consensusBg}>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>
                    {imageAnalysis.llmAnalysis?.visual_description || "Popis nedostupný."}
                  </div>
                  {imageAnalysis.llmAnalysis?.earliest_known_appearance && (
                    <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
                      <strong style={{ color: COLORS.ink }}>{t("section_earliest")}</strong>{" "}
                      {imageAnalysis.llmAnalysis.earliest_known_appearance}
                    </div>
                  )}
                  {(imageAnalysis.llmAnalysis?.context_consistency_issues || []).map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>⚠ {c}</div>
                  ))}
                </Section>

                {imageAnalysis.llmAnalysis?.geolocation_assessment && (
                  <Section
                    title={t("section_geolocation")}
                    color={
                      imageAnalysis.llmAnalysis.geolocation_assessment.consistency_with_claimed_location === "nekonzistentné"
                        ? COLORS.discrepancy
                        : COLORS.framing
                    }
                    bg={
                      imageAnalysis.llmAnalysis.geolocation_assessment.consistency_with_claimed_location === "nekonzistentné"
                        ? COLORS.discrepancyBg
                        : COLORS.framingBg
                    }
                    icon={
                      imageAnalysis.llmAnalysis.geolocation_assessment.consistency_with_claimed_location === "nekonzistentné"
                        ? AlertTriangle
                        : undefined
                    }
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      {t("geo_consistency")}{" "}
                      {imageAnalysis.llmAnalysis.geolocation_assessment.consistency_with_claimed_location}
                    </div>
                    {(imageAnalysis.llmAnalysis.geolocation_assessment.visual_clues || []).length > 0 && (
                      <ul style={{ fontSize: 13, margin: "4px 0", paddingLeft: 18 }}>
                        {imageAnalysis.llmAnalysis.geolocation_assessment.visual_clues.map((clue, i) => (
                          <li key={i}>{clue}</li>
                        ))}
                      </ul>
                    )}
                    <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
                      {imageAnalysis.llmAnalysis.geolocation_assessment.explanation}
                    </div>
                  </Section>
                )}

                <Section title={t("section_metadata")} color={COLORS.framing} bg={COLORS.framingBg} icon={Clock}>
                  <div style={{ fontSize: 13 }}>
                    {imageAnalysis.metadata?.present
                      ? `${t("metadata_date")} ${imageAnalysis.metadata.captureDate || "?"} · ${t("metadata_device")} ${imageAnalysis.metadata.cameraModel || "?"}`
                      : imageAnalysis.metadata?.note === "NO_EXIF" ? t("metadata_none") : (imageAnalysis.metadata?.note || t("metadata_none"))}
                  </div>
                </Section>

                <Section title={t("section_reverse")} color={COLORS.unverified} bg={COLORS.unverifiedBg}>
                  {(imageAnalysis.reverseResults || []).map((r, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 8 }}>
                      <strong>{r.engine}:</strong>{" "}
                      {r.error ? (
                        <span style={{ color: COLORS.inkSoft }}>{r.error}</span>
                      ) : (
                        <span>{r.matches?.length || 0} {t("reverse_results")}</span>
                      )}
                      {!r.error && (r.matches || []).length > 0 && (
                        <div style={{ marginTop: 4, paddingLeft: 10, borderLeft: `2px solid ${COLORS.unverified}` }}>
                          {r.matches.slice(0, 5).map((m, j) => (
                            <div key={j} style={{ marginBottom: 3 }}>
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: COLORS.unverified, textDecoration: "underline", fontSize: 12 }}
                              >
                                {m.title || m.url}
                              </a>
                              {m.firstSeenDate && (
                                <span style={{ color: COLORS.inkSoft, fontSize: 11 }}> · {m.firstSeenDate}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </Section>

                <Section
                  title={t("section_archive")}
                  color={imageAnalysis.archiveCheck?.matched_in_archive ? COLORS.discrepancy : COLORS.unverified}
                  bg={imageAnalysis.archiveCheck?.matched_in_archive ? COLORS.discrepancyBg : COLORS.unverifiedBg}
                  icon={imageAnalysis.archiveCheck?.matched_in_archive ? AlertTriangle : undefined}
                >
                  <div style={{ fontSize: 13, fontWeight: imageAnalysis.archiveCheck?.matched_in_archive ? 600 : 400 }}>
                    {imageAnalysis.archiveCheck?.matched_in_archive
                      ? <span>{t("archive_match")} {imageAnalysis.archiveCheck.known_date}). {t("archive_context")} "{imageAnalysis.archiveCheck.known_context}" <span style={{fontSize: 11, color: COLORS.inkSoft, fontStyle: "italic"}}>({t("archive_context_lang_note")})</span></span>
                      : imageAnalysis.archiveCheck?.note || t("archive_none")}
                  </div>
                  {imageAnalysis.archiveCheck?.note && imageAnalysis.archiveCheck?.matched_in_archive && (
                    <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>
                      {t("archive_warning") || imageAnalysis.archiveCheck.note}
                    </div>
                  )}
                </Section>

                <Section title={t("section_ai")} color={COLORS.discrepancy} bg={COLORS.discrepancyBg} icon={AlertTriangle}>
                  <div style={{ fontSize: 13 }}>
                    {imageAnalysis.aiDetection?.note === "AI_DETECTION_DISCLAIMER"
                      ? t("ai_disclaimer")
                      : (imageAnalysis.aiDetection?.error || imageAnalysis.aiDetection?.note || t("ai_no_result"))}
                  </div>
                </Section>

                {imageAnalysis.imageUrl && (
                  <div style={{ fontSize: 11, color: COLORS.inkSoft, wordBreak: "break-all" }}>
                    {t("image_url_label")} {imageAnalysis.imageUrl}
                  </div>
                )}

                <FeedbackButton
                  context="image_verification"
                  subject={claimedContext || imageAnalysis.imageUrl || null}
                  relatedData={imageAnalysis}
                  t={t}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "about" && (
        <div style={{ maxWidth: 720, fontSize: 14, lineHeight: 1.6 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {t("tab_about")}
          </h2>
          <p style={{ color: COLORS.inkSoft, marginBottom: 20 }}>
            {t("about_updated")} {new Date().toLocaleDateString(lang === "sk" ? "sk-SK" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}.
          </p>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("about_h_what")}</h3>
          <p style={{ marginBottom: 16 }}>{t("about_what")}</p>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("about_h_how")}</h3>
          <ol style={{ marginBottom: 16, paddingLeft: 20 }}>
            <li>{t("about_how_1")}</li>
            <li>{t("about_how_2")}</li>
            <li>{t("about_how_3")}</li>
            <li>{t("about_how_4")}</li>
          </ol>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("about_h_source_criteria")}</h3>
          <p style={{ marginBottom: 8 }}>{t("about_source_criteria_intro")}</p>
          <ol style={{ marginBottom: 8, paddingLeft: 20 }}>
            <li>{t("about_source_criteria_1")}</li>
            <li>{t("about_source_criteria_2")}</li>
            <li>{t("about_source_criteria_3")}</li>
            <li>{t("about_source_criteria_4")}</li>
            <li>{t("about_source_criteria_5")}</li>
          </ol>
          <p style={{ marginBottom: 24, color: COLORS.inkSoft, fontSize: 13 }}>{t("about_source_criteria_doc")}</p>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("about_h_sources")}</h3>
          <p style={{ marginBottom: 8 }}>{t("about_sources_intro")}</p>
          <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
            <li><strong>{t("about_sources_wire")}</strong> Reuters, Associated Press, AFP</li>
            <li><strong>{t("about_sources_israeli")}</strong> Haaretz, Times of Israel, Jerusalem Post, Ynet</li>
            <li><strong>{t("about_sources_arabic")}</strong> Al Jazeera, WAFA, Al-Ahram, Middle East Eye</li>
            <li><strong>{t("about_sources_factcheck")}</strong> AFP Fact Check, Reuters Fact Check, Bellingcat</li>
            <li><strong>{t("about_sources_hr")}</strong> OCHA, B'Tselem, Human Rights Watch, Amnesty International</li>
            <li><strong>{t("about_sources_conflict")}</strong> ACLED, Institute for the Study of War</li>
          </ul>
          <p style={{ marginBottom: 16, color: COLORS.inkSoft, fontSize: 13 }}>
            {t("about_sources_other")}
          </p>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("about_h_tech")}</h3>
          <p style={{ marginBottom: 16 }}>{t("about_tech")}</p>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("about_h_limits")}</h3>
          <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
            <li>{t("about_limit_1")}</li>
            <li>{t("about_limit_2")}</li>
            <li>{t("about_limit_3")}</li>
            <li>{t("about_limit_4")}</li>
          </ul>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("about_h_balance")}</h3>
          <p style={{ marginBottom: 8 }}>{t("about_balance_1")}</p>
          <p style={{ marginBottom: 16, color: COLORS.inkSoft, fontSize: 13 }}>{t("about_balance_2")}</p>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("about_h_contact")}</h3>
          <p style={{ marginBottom: 16 }}>
            {t("about_contact")} <em>palizra@proton.me</em>.
          </p>

          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{t("about_h_independence")}</h3>
          <p style={{ marginBottom: 8 }}>{t("about_independence")}</p>
          <p style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 8 }}>{t("about_imprint")}</p>
          <p style={{ fontSize: 13, marginBottom: 8 }}>
            <strong>{t("about_methodology_version")}</strong>
            {" · "}
            <strong>{t("about_source_review_date")}</strong>
          </p>
          <p style={{ fontSize: 13, marginBottom: 16 }}>
            <a href="/corrections" style={{ color: COLORS.ink }}>→ {t("about_corrections_link")}</a>
          </p>
        </div>
      )}

      {activeTab === "changelog" && (
        <div style={{ maxWidth: 720, fontSize: 14, lineHeight: 1.6 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{t("tab_changelog")}</h2>
          <p style={{ color: COLORS.inkSoft, marginBottom: 24 }}>
            {lang === "en"
              ? "A public record of methodology changes, corrections, and new features. Maintained in accordance with IFCN transparency standards."
              : lang === "ar"
              ? "سجل عام لتغييرات المنهجية والتصحيحات والميزات الجديدة."
              : lang === "he"
              ? "רשומה ציבורית של שינויי מתודולוגיה, תיקונים ותכונות חדשות."
              : "Verejný záznam zmien metodológie, opráv a nových funkcií. Vedený v súlade so štandardmi transparentnosti IFCN."}
          </p>

          {[
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Pridaná podpora jazykov SK/EN/AR/HE vrátane RTL pre arabčinu a hebrejčinu.",
              en: "Added multilingual support SK/EN/AR/HE including RTL layout for Arabic and Hebrew.",
              ar: "تمت إضافة دعم متعدد اللغات SK/EN/AR/HE بما في ذلك تخطيط RTL للعربية والعبرية.",
              he: "נוספה תמיכה רב-לשונית SK/EN/AR/HE כולל פריסת RTL לערבית ועברית.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Implementovaný dvojjazyčný vyhľadávací dotaz – okrem angličtiny aj v arabčine/hebrejčine pre relevantnejšie výsledky.",
              en: "Implemented bilingual search queries – English plus Arabic/Hebrew for more relevant results from regional sources.",
              ar: "تم تطبيق استعلامات بحث ثنائية اللغة – الإنجليزية والعربية/العبرية للحصول على نتائج أكثر صلة.",
              he: "יושמו שאילתות חיפוש דו-לשוניות – אנגלית בתוספת ערבית/עברית לתוצאות רלוונטיות יותר.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Pridaná perzistentná archívna databáza recyklovaných obrázkov (perceptual hash, uložená v Cloudflare R2).",
              en: "Added persistent archive database of recycled images (perceptual hash, stored in Cloudflare R2).",
              ar: "تمت إضافة قاعدة بيانات أرشيف دائمة للصور المعاد تدويرها.",
              he: "נוספה מסד נתונים ארכיוני קבוע של תמונות ממוחזרות.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Pridaná archivácia citovaných zdrojov cez Wayback Machine – zdroje zostávajú overiteľné aj po zmene/zmazaní článku.",
              en: "Added automatic archiving of cited sources via Wayback Machine – sources remain verifiable even if the original article is changed or deleted.",
              ar: "تمت إضافة أرشفة تلقائية للمصادر المستشهد بها عبر Wayback Machine.",
              he: "נוספה ארכוב אוטומטי של מקורות מצוטטים דרך Wayback Machine.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "methodology",
              sk: "Metodológia testovaná na pároch tvrdení z oboch strán konfliktu. Výsledok: symetrické správanie – rovnaký štandard dôkazov pre obe strany.",
              en: "Methodology tested on pairs of claims from both sides of the conflict. Result: symmetric behavior – same evidentiary standard applied regardless of which side the claim concerns.",
              ar: "تم اختبار المنهجية على أزواج من الادعاءات من كلا الجانبين. النتيجة: سلوك متماثل.",
              he: "המתודולוגיה נבדקה על זוגות טענות משני הצדדים. תוצאה: התנהגות סימטרית.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Pridaná geolokalizácia obrázkov – analýza vegetácie, architektúry a nápisov pre posúdenie súladu s tvrdeným miestom.",
              en: "Added image geolocation – analysis of vegetation, architecture, and signage to assess consistency with the claimed location.",
              ar: "تمت إضافة تحديد الموقع الجغرافي للصور.",
              he: "נוספה גיאולוקציה של תמונות.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Pridaná kontrola vnútornej konzistentnosti tvrdení – detekcia časových, číselných a logických rozporov v rámci jedného textu.",
              en: "Added internal consistency checking – detection of timeline, numerical, and logical contradictions within a single article.",
              ar: "تمت إضافة فحص الاتساق الداخلي للادعاءات.",
              he: "נוספה בדיקת עקביות פנימית של טענות.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Pridaný mechanizmus nahlásenia chyby – používatelia môžu nahlásiť problém priamo pri každej analýze.",
              en: "Added error reporting mechanism – users can report issues directly within each analysis.",
              ar: "تمت إضافة آلية الإبلاغ عن الأخطاء.",
              he: "נוספה מנגנון דיווח על שגיאות.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Spustený verejný archív analýz na palizra.org/analyses – analýzy kategorizované podľa lokality, kategórie a jazyka.",
              en: "Launched public analyses archive at palizra.org/analyses – analyses categorised by location, category and language.",
              ar: "تم إطلاق أرشيف التحليلات العام على palizra.org/analyses.",
              he: "הושק ארכיון ניתוחים ציבורי בכתובת palizra.org/analyses.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Vlastná doména palizra.org – nástroj dostupný na profesionálnej doméne namiesto pôvodnej Vercel URL.",
              en: "Custom domain palizra.org – tool available at a professional domain instead of the original Vercel URL.",
              ar: "نطاق مخصص palizra.org.",
              he: "דומיין מותאם אישית palizra.org.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "methodology",
              sk: "Zavedený systém aktualizačných upozornení – zverejnené analýzy môžu byť označené upozornením ak sa nové informácie líšia od pôvodných, s odkazom na aktualizovanú analýzu.",
              en: "Introduced update notice system – published analyses can be flagged with a notice if new information differs from the original, with a link to the updated analysis.",
              ar: "تم إدخال نظام إشعارات التحديث للتحليلات المنشورة.",
              he: "הוצג מערכת הודעות עדכון לניתוחים שפורסמו.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "fix",
              sk: "Bezpečnostné vylepšenia: prísny rate limiting pre admin endpointy (5 req/15 min), validácia vstupného textu (max 5000 znakov, blokovanie škodlivého obsahu).",
              en: "Security improvements: strict rate limiting for admin endpoints (5 req/15 min), input text validation (max 5,000 characters, blocking malicious content).",
              ar: "تحسينات أمنية: تحديد معدل صارم لنقاط نهاية المسؤول، والتحقق من صحة نص الإدخال.",
              he: "שיפורי אבטחה: הגבלת קצב קפדנית לנקודות קצה של מנהל, אימות טקסט קלט.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "methodology",
              sk: "Pridaná stránka opráv palizra.org/corrections – verejný záznam opráv chýb v súlade s požiadavkami IFCN na corrections policy.",
              en: "Added corrections page palizra.org/corrections – a public record of error corrections in accordance with IFCN corrections policy requirements.",
              ar: "تمت إضافة صفحة التصحيحات palizra.org/corrections وفقاً لمتطلبات IFCN.",
              he: "נוספה דף תיקונים palizra.org/corrections בהתאם לדרישות IFCN.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "methodology",
              sk: "Zavedená verzia metodológie (v1.0) a dátum revízie zdrojov – viditeľné v sekcii O nástroji pre plnú transparentnosť.",
              en: "Introduced methodology version (v1.0) and source list review date – visible in the About section for full transparency.",
              ar: "تم تقديم إصدار المنهجية (v1.0) وتاريخ مراجعة المصادر.",
              he: "הוצגה גרסת מתודולוגיה (v1.0) ותאריך סקירת מקורות.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "methodology",
              sk: "Doplnený Imprint – meno autora, kontakt a krajina pôvodu viditeľné v sekcii O nástroji (požiadavka európskych mediálnych štandardov).",
              en: "Added Imprint – author name, contact and country of origin visible in the About section (requirement of European media standards).",
              ar: "تمت إضافة بيانات الناشر في قسم 'حول الأداة'.",
              he: "נוספה רשומת מוציא לאור בסעיף 'אודות הכלי'.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Mobilná optimalizácia – responzívny header, taby a textové pole; oprava automatického zoomu na iOS.",
              en: "Mobile optimisation – responsive header, tabs and textarea; fixed automatic zoom on iOS.",
              ar: "تحسين الجوال – رأس صفحة متجاوب، علامات تبويب وحقل نصي; إصلاح التكبير التلقائي على iOS.",
              he: "אופטימיזציה לנייד – כותרת, לשוניות ותיבת טקסט רספונסיבית; תיקון הגדלה אוטומטית ב-iOS.",
            },
            {
              date: {"sk": "Júl 2026", "en": "July 2026", "ar": "يوليو 2026", "he": "יולי 2026"},
              type: "feature",
              sk: "Pridané progresívne loading správy – počas analýzy sa každé 4 sekundy zobrazí aktuálna fáza spracovania namiesto statického 'ANALYZUJEM…'.",
              en: "Added progressive loading messages – during analysis, the current processing phase is shown every 4 seconds instead of a static 'ANALYZING…'.",
              ar: "تمت إضافة رسائل تحميل تدريجية أثناء التحليل.",
              he: "נוספו הודעות טעינה מתקדמות במהלך הניתוח.",
            },
          ].map((entry, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 18, paddingBottom: 18, borderBottom: `1px solid ${COLORS.line}` }}>
              <div style={{ minWidth: 90, fontSize: 12, color: COLORS.inkSoft, paddingTop: 2 }}>{typeof entry.date === "object" ? (entry.date[lang] || entry.date.sk) : entry.date}</div>
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  letterSpacing: "0.06em",
                  padding: "2px 7px",
                  borderRadius: 3,
                  marginRight: 8,
                  background: entry.type === "methodology" ? COLORS.framingBg : entry.type === "fix" ? COLORS.discrepancyBg : COLORS.consensusBg,
                  color: entry.type === "methodology" ? COLORS.framing : entry.type === "fix" ? COLORS.discrepancy : COLORS.consensus,
                }}>
                  {entry.type === "methodology"
                    ? (lang === "en" ? "METHODOLOGY" : lang === "ar" ? "منهجية" : lang === "he" ? "מתודולוגיה" : "METODOLÓGIA")
                    : entry.type === "fix"
                    ? (lang === "en" ? "FIX" : lang === "ar" ? "إصلاح" : lang === "he" ? "תיקון" : "OPRAVA")
                    : (lang === "en" ? "FEATURE" : lang === "ar" ? "ميزة" : lang === "he" ? "תכונה" : "FUNKCIA")}
                </span>
                <span style={{ fontSize: 13 }}>
                  {lang === "en" ? entry.en : lang === "ar" ? entry.ar : lang === "he" ? entry.he : entry.sk}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer style={{ marginTop: 32, paddingTop: 14, borderTop: `1px solid ${COLORS.line}`, fontSize: 12, color: COLORS.inkSoft }}>
        {t("footer")}
      </footer>
    </div>
  );
}

async function saveAnalysisViaBackend({ claimText, type, location, category, lang, result }) {
  const response = await fetch(`${API_BASE_URL}/api/analyses/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim_text: claimText, type, location, category, lang, result }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Uloženie zlyhalo.");
  return data;
}

const LOCATION_OPTIONS = [
  { value: "Gaza",          label: { sk: "Gaza",               en: "Gaza",              ar: "غزة",              he: "עזה" } },
  { value: "West Bank",     label: { sk: "Západný breh",       en: "West Bank",         ar: "الضفة الغربية",   he: "הגדה המערבית" } },
  { value: "Israel",        label: { sk: "Izrael",             en: "Israel",            ar: "إسرائيل",          he: "ישראל" } },
  { value: "Lebanon",       label: { sk: "Libanon",            en: "Lebanon",           ar: "لبنان",            he: "לבנון" } },
  { value: "Syria",         label: { sk: "Sýria",              en: "Syria",             ar: "سوريا",            he: "סוריה" } },
  { value: "Iran",          label: { sk: "Irán",               en: "Iran",              ar: "إيران",            he: "איראן" } },
  { value: "Yemen",         label: { sk: "Jemen",              en: "Yemen",             ar: "اليمن",            he: "תימן" } },
  { value: "Egypt",         label: { sk: "Egypt",              en: "Egypt",             ar: "مصر",              he: "מצרים" } },
  { value: "Jordan",        label: { sk: "Jordánsko",          en: "Jordan",            ar: "الأردن",           he: "ירדן" } },
  { value: "International", label: { sk: "OSN/Medzinarodne",   en: "UN/International",  ar: "دولي/الأمم المتحدة", he: "בינלאומי/האום" } },
  { value: "Other",         label: { sk: "Iné",                en: "Other",             ar: "أخرى",             he: "אחר" } },
];

const CATEGORY_OPTIONS = [
  { value: "casualties",     label: { sk: "Obete a straty",           en: "Casualties",              ar: "ضحايا وخسائر",        he: "נפגעים ואבידות" } },
  { value: "attacks",        label: { sk: "Útoky a operácie",         en: "Attacks & operations",    ar: "هجمات وعمليات",       he: "תקיפות ומבצעים" } },
  { value: "infrastructure", label: { sk: "Infraštruktúra a pomoc",   en: "Infrastructure & aid",    ar: "بنية تحتية ومساعدات", he: "תשתיות וסיוע" } },
  { value: "diplomatic",     label: { sk: "Diplomatické vyhlásenia",  en: "Diplomatic statements",   ar: "تصريحات دبلوماسية",   he: "הצהרות דיפלומטיות" } },
  { value: "military",       label: { sk: "Vojenské tvrdenia",        en: "Military claims",         ar: "ادعاءات عسكرية",      he: "טענות צבאיות" } },
  { value: "media",          label: { sk: "Médiá a dezinformácie",    en: "Media & disinformation",  ar: "إعلام ومعلومات مضللة", he: "מדיה ודיסאינפורמציה" } },
  { value: "image",          label: { sk: "Obrázok/Video",            en: "Image/Video",             ar: "صورة/فيديو",           he: "תמונה/וידאו" } },
  { value: "statistics",     label: { sk: "Čísla a štatistiky",       en: "Numbers & statistics",    ar: "أرقام وإحصاءات",      he: "מספרים וסטטיסטיקות" } },
  { value: "other",          label: { sk: "Iné",                      en: "Other",                   ar: "أخرى",                he: "אחר" } },
];

function SaveAnalysisButton({ claimText, type, lang, result, t }) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("Gaza");
  const [category, setCategory] = useState("casualties");
  const [status, setStatus] = useState("idle");

  async function handleSave() {
    setStatus("saving");
    try {
      await saveAnalysisViaBackend({ claimText, type, location, category, lang, result });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  if (status === "saved") {
    return <div style={{ fontSize: 12, color: COLORS.consensus }}>
      {lang === "ar" ? "✓ تم الحفظ في الأرشيف." : lang === "he" ? "✓ נשמר בארכיון." : lang === "en" ? "✓ Analysis saved to archive." : "✓ Analýza uložená do archívu."}
    </div>;
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ background: "none", border: `1px solid ${COLORS.line}`, color: COLORS.inkSoft, fontSize: 11, fontFamily: "monospace", cursor: "pointer", padding: "3px 8px", borderRadius: 3, letterSpacing: "0.04em" }}
        >
          {lang === "ar" ? "حفظ في الأرشيف" : lang === "he" ? "שמור בארכיון" : lang === "en" ? "SAVE TO ARCHIVE" : "ULOŽIŤ DO ARCHÍVU"}
        </button>
      ) : (
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 10, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select value={location} onChange={e => setLocation(e.target.value)}
            onClick={e => e.stopPropagation()}
            style={{ fontSize: 12, fontFamily: "monospace", padding: "3px 6px", border: `1px solid ${COLORS.line}`, borderRadius: 3 }}>
            {LOCATION_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label[lang] || l.label.en}</option>)}
          </select>
          <select value={category} onChange={e => setCategory(e.target.value)}
            onClick={e => e.stopPropagation()}
            style={{ fontSize: 12, fontFamily: "monospace", padding: "3px 6px", border: `1px solid ${COLORS.line}`, borderRadius: 3 }}>
            {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label[lang] || c.label.en}</option>)}
          </select>
          <button onClick={handleSave} disabled={status === "saving"}
            style={{ background: COLORS.ink, color: COLORS.paper, border: "none", borderRadius: 3, padding: "3px 10px", fontSize: 12, fontFamily: "monospace", cursor: "pointer" }}>
            {status === "saving"
              ? (lang === "ar" ? "جاري الحفظ…" : lang === "he" ? "שומר…" : lang === "en" ? "SAVING…" : "UKLADÁM…")
              : (lang === "ar" ? "حفظ" : lang === "he" ? "שמור" : lang === "en" ? "SAVE" : "ULOŽIŤ")}
          </button>
          {status === "error" && <span style={{ fontSize: 11, color: COLORS.discrepancy }}>
            {lang === "ar" ? "خطأ، حاول مجدداً." : lang === "he" ? "שגיאה, נסה שוב." : lang === "en" ? "Error, try again." : "Chyba, skús znova."}
          </span>}
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft, fontSize: 12 }}>✕</button>
        </div>
      )}
    </div>
  );
}

async function submitFeedbackViaBackend({ context, subject, description, relatedData }) {
  const response = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, subject, description, relatedData }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || `Backend vrátil HTTP ${response.status}`);
  }
  return data;
}

/**
 * Malé tlačidlo "Nahlásiť problém" - po kliknutí otvorí inline formulár
 * (nie modal, aby sa to dalo jednoducho vložiť kdekoľvek do layoutu).
 */
function FeedbackButton({ context, subject, relatedData, t }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function handleSubmit() {
    if (!description.trim()) return;
    setStatus("sending");
    try {
      await submitFeedbackViaBackend({ context, subject, description, relatedData });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div style={{ fontSize: 12, color: COLORS.consensus, marginTop: 6 }}>
        {t("feedback_sent")}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: COLORS.inkSoft,
            fontSize: 11,
            fontFamily: "monospace",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: 0,
          }}
        >
          <Flag size={11} /> {t("feedback_btn")}
        </button>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 10, maxWidth: 360 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft }}>{t("feedback_label")}</span>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <X size={13} color={COLORS.inkSoft} />
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("feedback_placeholder")}
            style={{
              width: "100%",
              fontSize: 13,
              fontFamily: "inherit",
              border: `1px solid ${COLORS.line}`,
              borderRadius: 4,
              padding: 8,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={status === "sending" || !description.trim()}
            style={{
              marginTop: 6,
              background: COLORS.ink,
              color: COLORS.paper,
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              fontSize: 12,
              fontFamily: "monospace",
              cursor: "pointer",
              opacity: status === "sending" || !description.trim() ? 0.6 : 1,
            }}
          >
            {status === "sending" ? t("feedback_sending") : t("feedback_send")}
          </button>
          {status === "error" && (
            <div style={{ fontSize: 12, color: COLORS.discrepancy, marginTop: 4 }}>
              {t("feedback_error")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SourceLink({ source, url, archivedUrl, color, t }) {
  if (!url) {
    // Žiadny URL k dispozícii (model ho nenašiel v dodaných výsledkoch) -
    // zobrazí sa len meno zdroja, bez linku, aby sme nikdy nevymýšľali URL.
    return <span title={t ? t("url_not_available") : "URL not available"}>{source}</span>;
  }
  return (
    <span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color, textDecoration: "underline" }}
      >
        {source}
      </a>
      {archivedUrl && (
        <a
          href={archivedUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`${t("archive_label")} - Wayback Machine`}
          style={{ color: color, opacity: 0.6, fontSize: 11, marginLeft: 4, textDecoration: "none" }}
        >
          {t("archive_label")}
        </a>
      )}
    </span>
  );
}

function Section({ title, color, bg, icon: Icon, children }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 4, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {Icon && <Icon size={13} color={color} />}
        <span style={{ fontSize: 11, fontFamily: "monospace", color, letterSpacing: "0.04em" }}>
          {title.toUpperCase()}
        </span>
      </div>
      {children}
    </div>
  );
}
