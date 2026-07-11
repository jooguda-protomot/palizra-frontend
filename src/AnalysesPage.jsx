import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://palizraanalyzator-production.up.railway.app";

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

const LOCATIONS = ["Všetky", "Gaza", "Libanon", "Sýria", "Izrael", "Západný breh", "Iné"];
const CATEGORIES = ["Všetky", "obete", "infraštruktúra", "diplomatické", "obrázok", "iné"];
const LANGS = ["Všetky", "sk", "en", "ar", "he"];

const CONFIDENCE_COLORS = {
  high: COLORS.consensus,
  medium: COLORS.framing,
  low: COLORS.discrepancy,
  vysoká: COLORS.consensus,
  stredná: COLORS.framing,
  nízka: COLORS.discrepancy,
};

export default function AnalysesPage() {
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
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filters.location) params.set("location", filters.location);
      if (filters.category) params.set("category", filters.category);
      if (filters.lang) params.set("lang", filters.lang);

      const res = await fetch(`${API_BASE_URL}/api/analyses?${params}`);
      const data = await res.json();
      setAnalyses(data.analyses || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError("Nedá sa načítať zoznam analýz.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDetail(id) {
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/analyses/${id}`);
      const data = await res.json();
      setDetail(data);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => { fetchAnalyses(); }, [page, filters]);

  function handleFilter(key, value) {
    setFilters(f => ({ ...f, [key]: value === "Všetky" ? "" : value }));
    setPage(1);
    setSelected(null);
    setDetail(null);
  }

  function handleSelect(analysis) {
    setSelected(analysis.id);
    fetchDetail(analysis.id);
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px", fontFamily: "'Iowan Old Style', Georgia, serif", background: COLORS.paper, color: COLORS.ink, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 16 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace" }}>
          PALIZRA ANALYZATOR · VEREJNÉ ANALÝZY
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "6px 0 4px" }}>Archív analýz</h1>
        <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: 0 }}>
          Overené tvrdenia a obrázky súvisiace s izraelsko-palestínskym konfliktom.
          <a href="/" style={{ marginLeft: 12, color: COLORS.inkSoft, fontSize: 13 }}>← Späť na nástroj</a>
        </p>
      </div>

      {/* Filtre */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Lokalita", key: "location", options: LOCATIONS },
          { label: "Kategória", key: "category", options: CATEGORIES },
          { label: "Jazyk", key: "lang", options: LANGS },
        ].map(({ label, key, options }) => (
          <div key={key}>
            <label style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, letterSpacing: "0.06em", display: "block", marginBottom: 4 }}>{label.toUpperCase()}</label>
            <select
              value={filters[key] || "Všetky"}
              onChange={e => handleFilter(key, e.target.value)}
              style={{ fontFamily: "monospace", fontSize: 13, padding: "4px 8px", border: `1px solid ${COLORS.line}`, borderRadius: 4, background: "#fff", color: COLORS.ink }}
            >
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Obsah */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1.4fr" : "1fr", gap: 20 }}>

        {/* Zoznam */}
        <div>
          {loading && <div style={{ color: COLORS.inkSoft, fontFamily: "monospace", fontSize: 13 }}>Načítavam…</div>}
          {error && <div style={{ color: COLORS.discrepancy, fontSize: 13 }}>{error}</div>}
          {!loading && analyses.length === 0 && (
            <div style={{ color: COLORS.inkSoft, fontSize: 14 }}>Žiadne verejné analýzy pre zvolené filtre.</div>
          )}
          {analyses.map(a => (
            <div
              key={a.id}
              onClick={() => handleSelect(a)}
              style={{
                padding: "12px 14px",
                marginBottom: 8,
                border: `1px solid ${selected === a.id ? COLORS.ink : COLORS.line}`,
                borderRadius: 4,
                cursor: "pointer",
                background: selected === a.id ? COLORS.ink : "#fff",
                color: selected === a.id ? COLORS.paper : COLORS.ink,
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 11, fontFamily: "monospace", color: selected === a.id ? COLORS.line : COLORS.inkSoft, marginBottom: 4 }}>
                {a.date} · {a.location} · {a.category} · {a.lang?.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.4 }}>
                {a.claim_text?.slice(0, 120)}{a.claim_text?.length > 120 ? "…" : ""}
              </div>
            </div>
          ))}

          {/* Stránkovanie */}
          {total > LIMIT && (
            <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 10px", border: `1px solid ${COLORS.line}`, borderRadius: 4, cursor: page === 1 ? "not-allowed" : "pointer", background: "transparent" }}
              >← Predchádzajúca</button>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.inkSoft }}>
                {page} / {Math.ceil(total / LIMIT)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / LIMIT)}
                style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 10px", border: `1px solid ${COLORS.line}`, borderRadius: 4, cursor: page >= Math.ceil(total / LIMIT) ? "not-allowed" : "pointer", background: "transparent" }}
              >Nasledujúca →</button>
            </div>
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 4, padding: 16, background: "#fff", fontSize: 13 }}>
            {detailLoading && <div style={{ color: COLORS.inkSoft, fontFamily: "monospace" }}>Načítavam detail…</div>}
            {detail && (
              <>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 8 }}>
                  {detail.date} · {detail.location} · {detail.lang?.toUpperCase()}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, lineHeight: 1.4 }}>
                  {detail.claim_text}
                </div>

                {detail.result?.comparison && (
                  <>
                    {/* Zhoda */}
                    {detail.result.comparison.consensus_points?.length > 0 && (
                      <div style={{ marginBottom: 12, padding: "10px 12px", background: COLORS.consensusBg, borderRadius: 4 }}>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.consensus, letterSpacing: "0.06em", marginBottom: 6 }}>ZHODA MEDZI ZDROJMI</div>
                        {detail.result.comparison.consensus_points.map((p, i) => (
                          <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>{p.point}</div>
                        ))}
                      </div>
                    )}

                    {/* Nezhody */}
                    {detail.result.comparison.discrepancies?.length > 0 && (
                      <div style={{ marginBottom: 12, padding: "10px 12px", background: COLORS.discrepancyBg, borderRadius: 4 }}>
                        <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.discrepancy, letterSpacing: "0.06em", marginBottom: 6 }}>NEZHODY</div>
                        {detail.result.comparison.discrepancies.map((d, i) => (
                          <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>{d.issue}</div>
                        ))}
                      </div>
                    )}

                    {/* Miera istoty */}
                    {detail.result.comparison.confidence_level && (
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${COLORS.line}`, fontSize: 13 }}>
                        <strong>Miera istoty: </strong>
                        <span style={{ color: CONFIDENCE_COLORS[detail.result.comparison.confidence_level] || COLORS.ink }}>
                          {detail.result.comparison.confidence_level}
                        </span>
                        {detail.result.comparison.summary_note && (
                          <span style={{ color: COLORS.inkSoft }}> – {detail.result.comparison.summary_note}</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
