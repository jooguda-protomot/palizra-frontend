import React, { useState } from "react";
import { Search, FileText, AlertTriangle, CheckCircle2, HelpCircle, Quote, Scale, Image as ImageIcon, Upload, Clock } from "lucide-react";

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
  factual_claim: { label: "Overiteľný fakt", icon: CheckCircle2, color: COLORS.consensus, bg: COLORS.consensusBg },
  quoted_statement: { label: "Citácia / výrok", icon: Quote, color: COLORS.framing, bg: COLORS.framingBg },
  interpretation: { label: "Interpretácia / rámcovanie", icon: Scale, color: COLORS.discrepancy, bg: COLORS.discrepancyBg },
  unverifiable: { label: "Nedá sa nezávisle overiť", icon: HelpCircle, color: COLORS.unverified, bg: COLORS.unverifiedBg },
};

const SAMPLE_TEXT =
  "Izraelská armáda uviedla, že v noci zasiahla teroristickú infrastruktúru v Gaze. " +
  "Podľa miestnych zdravotníckych úradov zomrelo pri útoku 15 ľudí, vrátane 6 detí. " +
  "Útok bol brutálny a neopodstatnený.";

async function describeImageViaBackend(file, claimedContext) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("claimedContext", claimedContext || "");

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


async function extractClaimsViaBackend(text) {
  const response = await fetch(`${API_BASE_URL}/api/claims/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Backend vrátil HTTP ${response.status}`);
  }

  return data; // { claims: [...] }
}

async function checkConsistencyViaBackend(claims) {
  const response = await fetch(`${API_BASE_URL}/api/claims/check-consistency`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claims }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Backend vrátil HTTP ${response.status}`);
  }

  return data; // { issues: [...] }
}

async function verifyClaimViaBackend(claim) {
  const response = await fetch(`${API_BASE_URL}/api/claims/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Backend vrátil HTTP ${response.status}`);
  }

  return data; // { claim, comparison } alebo { claim, status: "skipped", note }
}

export default function ClaimVerifierDemo() {
  const [activeTab, setActiveTab] = useState("text"); // "text" | "image"
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [claims, setClaims] = useState(null);
  const [consistencyIssues, setConsistencyIssues] = useState(null);
  const [consistencyLoading, setConsistencyLoading] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obrazové overenie
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [claimedContext, setClaimedContext] = useState("");
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);

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
    try {
      const result = await describeImageViaBackend(imageFile, claimedContext);
      setImageAnalysis(result);
    } catch (e) {
      setImageError(
        e.message?.includes("fetch")
          ? "Nedá sa pripojiť na backend. Beží server na " + API_BASE_URL + " ? (npm run dev v priečinku server/)"
          : e.message || "Analýza obrázka sa nepodarila."
      );
    } finally {
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
    try {
      const result = await extractClaimsViaBackend(inputText);
      const claimsList = result.claims || [];
      setClaims(claimsList);

      // Kontrola konzistentnosti beží na pozadí, neblokuje zobrazenie tvrdení
      if (claimsList.length >= 2) {
        setConsistencyLoading(true);
        checkConsistencyViaBackend(claimsList)
          .then((res) => setConsistencyIssues(res.issues || []))
          .catch(() => setConsistencyIssues(null))
          .finally(() => setConsistencyLoading(false));
      }
    } catch (e) {
      setError(
        e.message?.includes("fetch")
          ? "Nedá sa pripojiť na backend. Beží server na " + API_BASE_URL + " ? (npm run dev v priečinku server/)"
          : e.message || "Extrakcia sa nepodarila."
      );
    } finally {
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
      const result = await verifyClaimViaBackend(claim);
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
      style={{
        fontFamily: "'Iowan Old Style', 'Georgia', serif",
        background: COLORS.paper,
        color: COLORS.ink,
        minHeight: "100%",
        padding: "32px 24px",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .cv-grid { grid-template-columns: 1fr !important; }
        }
        .cv-btn:focus-visible, .cv-claim:focus-visible {
          outline: 2px solid ${COLORS.ink};
          outline-offset: 2px;
        }
      `}</style>

      <header style={{ marginBottom: 28, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace" }}>
          PROTOTYP · MODUL OVEROVANIA TVRDENÍ
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 600, margin: "6px 0 4px", letterSpacing: "-0.01em" }}>
          Zložka dôkazov
        </h1>
        <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: 0, maxWidth: 560, lineHeight: 1.5 }}>
          Vlož text. Nástroj rozdelí tvrdenia na fakty, citácie a interpretácie — a pri faktoch ukáže,
          kde sa nezávislé zdroje zhodujú a kde nie. Žiadny finálny verdikt, len rozklad.
        </p>
      </header>

      <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
        {[
          { id: "text", label: "Text / tvrdenie", icon: FileText },
          { id: "image", label: "Obrázok", icon: ImageIcon },
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
          placeholder="Vlož tvrdenie, citát z článku alebo komentár..."
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
          {loading ? "ANALYZUJEM…" : "ROZLOŽIŤ TVRDENIA"}
        </button>
        {error && (
          <div style={{ marginTop: 10, color: COLORS.discrepancy, fontSize: 13 }}>{error}</div>
        )}
      </div>

      {claims && claims.length > 0 && (
        <>
        {consistencyLoading && (
          <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 14, fontFamily: "monospace" }}>
            Kontrolujem vnútornú konzistentnosť tvrdení…
          </div>
        )}
        {!consistencyLoading && consistencyIssues && consistencyIssues.length > 0 && (
          <div style={{ marginBottom: 14, background: COLORS.discrepancyBg, border: `1px solid ${COLORS.discrepancy}55`, borderRadius: 4, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <AlertTriangle size={14} color={COLORS.discrepancy} />
              <span style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.discrepancy, letterSpacing: "0.04em" }}>
                NÁJDENÉ VNÚTORNÉ NEZROVNALOSTI ({consistencyIssues.length})
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
            ✓ Medzi extrahovanými tvrdeniami nebola nájdená žiadna vnútorná nezrovnalosť.
          </div>
        )}
        <div className="cv-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20 }}>
          {/* Ľavý panel: zoznam tvrdení */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace", marginBottom: 10 }}>
              Rozklad ({claims.length})
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
                        {meta.label.toUpperCase()}
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
              Porovnanie zdrojov
            </div>
            {!comparison && (
              <div style={{ fontSize: 14, color: COLORS.inkSoft, padding: 16, border: `1px dashed ${COLORS.line}`, borderRadius: 4 }}>
                Vyber vľavo tvrdenie typu „overiteľný fakt" alebo „nedá sa overiť" — pri citáciách
                a interpretáciách sa zdroje porovnávajú inak (overuje sa, či bol výrok vyslovený, nie či je „pravdivý").
              </div>
            )}
            {comparison?.loading && (
              <div style={{ fontSize: 14, color: COLORS.inkSoft, padding: 16 }}>Vyhľadávam zdroje…</div>
            )}
            {comparison?.error && (
              <div style={{ fontSize: 14, color: COLORS.discrepancy, padding: 16 }}>{comparison.error}</div>
            )}
            {comparison && !comparison.loading && !comparison.error && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section title="Zhoda medzi zdrojmi" color={COLORS.consensus} bg={COLORS.consensusBg}>
                  {(comparison.consensus_points || []).map((p, i) => (
                    <div key={i} style={{ fontSize: 14, marginBottom: 4 }}>
                      {p.point}
                      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 2, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {(p.supporting_sources || []).map((s, j) =>
                          typeof s === "string" ? (
                            <span key={j}>{s}</span>
                          ) : (
                            <SourceLink key={j} source={s.source} url={s.url} color={COLORS.consensus} />
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </Section>

                <Section title="Nezhody" color={COLORS.discrepancy} bg={COLORS.discrepancyBg} icon={AlertTriangle}>
                  {(comparison.discrepancies || []).map((d, i) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{d.issue}</div>
                      {(d.positions || []).map((pos, j) => (
                        <div key={j} style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 3, paddingLeft: 10, borderLeft: `2px solid ${COLORS.discrepancy}` }}>
                          <strong style={{ color: COLORS.ink }}>
                            <SourceLink source={pos.source} url={pos.url} color={COLORS.discrepancy} />:
                          </strong>{" "}
                          {pos.claims}
                        </div>
                      ))}
                    </div>
                  ))}
                </Section>

                <Section title="Rozdiely v rámcovaní" color={COLORS.framing} bg={COLORS.framingBg}>
                  {(comparison.framing_differences || []).map((f, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 4 }}>{f.point}</div>
                      {(f.examples || []).map((ex, j) => (
                        <div key={j} style={{ fontSize: 13 }}>
                          <strong>
                            <SourceLink source={ex.source} url={ex.url} color={COLORS.framing} />:
                          </strong>{" "}
                          {ex.framing}
                        </div>
                      ))}
                    </div>
                  ))}
                </Section>

                <Section title="Nepotvrdené nezávisle" color={COLORS.unverified} bg={COLORS.unverifiedBg}>
                  {(comparison.unsupported_by_independent_sources || []).map((u, i) => (
                    <div key={i} style={{ fontSize: 13 }}>{u}</div>
                  ))}
                </Section>

                <div style={{ borderTop: `1px solid ${COLORS.line}`, paddingTop: 10, fontSize: 13, color: COLORS.inkSoft }}>
                  <strong style={{ color: COLORS.ink }}>Miera istoty: {comparison.confidence_level}.</strong>{" "}
                  {comparison.summary_note}
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
                    KLIKNI A VYBER OBRÁZOK
                  </span>
                </>
              )}
            </label>
            <input id="cv-image-upload" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />

            <textarea
              value={claimedContext}
              onChange={(e) => setClaimedContext(e.target.value)}
              rows={3}
              placeholder="Tvrdený kontext (napr. 'Tento obrázok zachytáva útok v Gaze, 20.6.2026')..."
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
              {imageLoading ? "ANALYZUJEM…" : "OVERIŤ OBRÁZOK"}
            </button>
            {imageError && <div style={{ marginTop: 10, color: COLORS.discrepancy, fontSize: 13 }}>{imageError}</div>}
          </div>

          {/* Pravý panel: výsledky */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace", marginBottom: 10 }}>
              Výsledok overenia
            </div>
            {!imageAnalysis && (
              <div style={{ fontSize: 14, color: COLORS.inkSoft, padding: 16, border: `1px dashed ${COLORS.line}`, borderRadius: 4 }}>
                Vlož obrázok a tvrdený kontext vľavo, potom klikni „Overiť obrázok".
              </div>
            )}
            {imageAnalysis && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Section title="Vizuálny popis (reálna analýza)" color={COLORS.consensus} bg={COLORS.consensusBg}>
                  <div style={{ fontSize: 14, marginBottom: 6 }}>
                    {imageAnalysis.llmAnalysis?.visual_description || "Popis nedostupný."}
                  </div>
                  {imageAnalysis.llmAnalysis?.earliest_known_appearance && (
                    <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
                      <strong style={{ color: COLORS.ink }}>Najstarší známy výskyt:</strong>{" "}
                      {imageAnalysis.llmAnalysis.earliest_known_appearance}
                    </div>
                  )}
                  {(imageAnalysis.llmAnalysis?.context_consistency_issues || []).map((c, i) => (
                    <div key={i} style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>⚠ {c}</div>
                  ))}
                </Section>

                {imageAnalysis.llmAnalysis?.geolocation_assessment && (
                  <Section
                    title="Geolokalizácia"
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
                      Súlad s tvrdeným miestom:{" "}
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

                <Section title="Metadáta (EXIF)" color={COLORS.framing} bg={COLORS.framingBg} icon={Clock}>
                  <div style={{ fontSize: 13 }}>
                    {imageAnalysis.metadata?.present
                      ? `Dátum: ${imageAnalysis.metadata.captureDate || "neznámy"} · Zariadenie: ${imageAnalysis.metadata.cameraModel || "neznáme"}`
                      : imageAnalysis.metadata?.note || "Žiadne EXIF dáta."}
                  </div>
                </Section>

                <Section title="Reverse image search" color={COLORS.unverified} bg={COLORS.unverifiedBg}>
                  {(imageAnalysis.reverseResults || []).map((r, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 8 }}>
                      <strong>{r.engine}:</strong>{" "}
                      {r.error ? (
                        <span style={{ color: COLORS.inkSoft }}>{r.error}</span>
                      ) : (
                        <span>{r.matches?.length || 0} výsledkov</span>
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
                  title="Archívna kontrola"
                  color={imageAnalysis.archiveCheck?.matched_in_archive ? COLORS.discrepancy : COLORS.unverified}
                  bg={imageAnalysis.archiveCheck?.matched_in_archive ? COLORS.discrepancyBg : COLORS.unverifiedBg}
                  icon={imageAnalysis.archiveCheck?.matched_in_archive ? AlertTriangle : undefined}
                >
                  <div style={{ fontSize: 13, fontWeight: imageAnalysis.archiveCheck?.matched_in_archive ? 600 : 400 }}>
                    {imageAnalysis.archiveCheck?.matched_in_archive
                      ? `Zhoda s už overeným obrázkom (zo dňa ${imageAnalysis.archiveCheck.known_date}). Pôvodný kontext: "${imageAnalysis.archiveCheck.known_context}"`
                      : imageAnalysis.archiveCheck?.note || "Žiadna shoda."}
                  </div>
                  {imageAnalysis.archiveCheck?.note && imageAnalysis.archiveCheck?.matched_in_archive && (
                    <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 4 }}>
                      {imageAnalysis.archiveCheck.note}
                    </div>
                  )}
                </Section>

                <Section title="AI-detekcia" color={COLORS.discrepancy} bg={COLORS.discrepancyBg} icon={AlertTriangle}>
                  <div style={{ fontSize: 13 }}>
                    {imageAnalysis.aiDetection?.error || imageAnalysis.aiDetection?.note || "Bez výsledku."}
                  </div>
                </Section>

                {imageAnalysis.imageUrl && (
                  <div style={{ fontSize: 11, color: COLORS.inkSoft, wordBreak: "break-all" }}>
                    Nahraté na: {imageAnalysis.imageUrl}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <footer style={{ marginTop: 32, paddingTop: 14, borderTop: `1px solid ${COLORS.line}`, fontSize: 12, color: COLORS.inkSoft }}>
        Tento UI volá backend na {API_BASE_URL} (pozri priečinok server/). Bez bežiaceho backendu
        sa volania nepodaria — spusti <code>npm run dev</code> v priečinku server/ a doplň API kľúče do .env.
      </footer>
    </div>
  );
}

function SourceLink({ source, url, color }) {
  if (!url) {
    // Žiadny URL k dispozícii (model ho nenašiel v dodaných výsledkoch) -
    // zobrazí sa len meno zdroja, bez linku, aby sme nikdy nevymýšľali URL.
    return <span title="URL nebol k dispozícii">{source}</span>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color, textDecoration: "underline" }}
    >
      {source}
    </a>
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
