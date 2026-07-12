import React, { useState, useEffect } from "react";

const API_BASE_URL = "https://palizraanalyzator-production.up.railway.app";

const COLORS = {
  bg: "#EFEAE0",
  ink: "#1F2A24",
  inkSoft: "#5A6B60",
  line: "#C9BFA8",
  success: "#2A6B3C",
  error: "#C8392B",
  successBg: "#EAF5EC",
  errorBg: "#FDF0EE",
};

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map(line => {
    // Jednoduchý CSV parser - rešpektuje úvodzovky
    const values = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"' || ch === '„' || ch === '“' || ch === '‘' || ch === '’') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    values.push(current.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
  }).filter(r => r.url);
}

function AnalysesManager({ adminKey, s, COLORS, API_BASE_URL }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState({});
  const [translateStatus, setTranslateStatus] = useState("idle");

  async function handleTranslateAll(force = false) {
    if (!adminKey) return;
    setTranslateStatus("loading");
    try {
      await fetch(`${API_BASE_URL}/api/admin/analyses/translate-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ force }),
      });
      setTranslateStatus("done");
    } catch {
      setTranslateStatus("error");
    }
  }

  async function loadAnalyses() {
    if (!adminKey) return;
    setLoading(true);
    try {
      // Admin vidí všetky analýzy – použijeme index endpoint s veľkým limitom
      const res = await fetch(`${API_BASE_URL}/api/admin/analyses`, {
        headers: { "x-admin-key": adminKey }
      });
      const data = await res.json();
      // Načítame aj nepublikované – zobrazíme všetky
      setAnalyses(data.analyses || []);
    } catch (err) {
      console.error("Chyba pri načítaní analýz:", err);
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(id, currentlyPublished) {
    setActionStatus(s => ({ ...s, [id]: "loading" }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analyses/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ published: !currentlyPublished }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setAnalyses(prev => prev.map(a => a.id === id ? { ...a, published: !currentlyPublished } : a));
        setActionStatus(s => ({ ...s, [id]: "done" }));
      }
    } catch {
      setActionStatus(s => ({ ...s, [id]: "error" }));
    }
  }

  return (
    <div style={{ marginTop: 40, borderTop: `2px solid ${COLORS.ink}`, paddingTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Správa analýz</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handleTranslateAll(false)} disabled={!adminKey || translateStatus === "loading"}
            style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 12px", background: "#5A6B60", color: "#EFEAE0", border: "none", borderRadius: 4, cursor: adminKey ? "pointer" : "not-allowed" }}>
            {translateStatus === "loading" ? "PREKLADÁM…" : translateStatus === "done" ? "✓ SPUSTENÉ" : "PRELOŽIŤ NOVÉ"}
          </button>
          <button onClick={() => handleTranslateAll(true)} disabled={!adminKey || translateStatus === "loading"}
            style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 12px", background: "#8B4513", color: "#EFEAE0", border: "none", borderRadius: 4, cursor: adminKey ? "pointer" : "not-allowed" }}>
            PRELOŽIŤ ZNOVA (VŠETKY)
          </button>
          <button onClick={loadAnalyses} disabled={!adminKey || loading}
            style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 12px", background: COLORS.ink, color: COLORS.paper || "#EFEAE0", border: "none", borderRadius: 4, cursor: adminKey ? "pointer" : "not-allowed" }}>
            {loading ? "NAČÍTAVAM…" : "NAČÍTAŤ ANALÝZY"}
          </button>
        </div>
      </div>

      {analyses.length === 0 && !loading && (
        <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
          {adminKey ? "Klikni na NAČÍTAŤ ANALÝZY." : "Najprv zadaj admin kľúč vyššie."}
        </div>
      )}

      {analyses.map(a => (
        <div key={a.id} style={{ padding: "10px 12px", marginBottom: 8, border: `1px solid ${COLORS.line}`, borderRadius: 4, background: a.published ? "#f0faf3" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 3 }}>
              {a.date} · {a.location} · {a.category} · {a.lang?.toUpperCase()}
              {a.published && <span style={{ marginLeft: 8, color: "#2A6B3C", fontWeight: 600 }}>✓ ZVEREJNENÉ</span>}
            </div>
            <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {a.claim_text?.slice(0, 100)}{a.claim_text?.length > 100 ? "…" : ""}
            </div>
          </div>
          <button
            onClick={() => togglePublish(a.id, a.published)}
            disabled={actionStatus[a.id] === "loading"}
            style={{
              fontFamily: "monospace", fontSize: 11, padding: "4px 10px", borderRadius: 3, border: "none", cursor: "pointer", flexShrink: 0,
              background: a.published ? COLORS.error : COLORS.success,
              color: "#fff",
            }}>
            {actionStatus[a.id] === "loading" ? "…" : a.published ? "STIAHNUŤ" : "ZVEREJNIŤ"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState("");
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setCsvText(text);
      setParsed(parseCSV(text));
    };
    reader.readAsText(file);
  }

  function handleTextChange(e) {
    setCsvText(e.target.value);
    setParsed(parseCSV(e.target.value));
  }

  async function handleImport() {
    if (!adminKey.trim()) { setStatus({ type: "error", msg: "Zadaj admin kľúč." }); return; }
    if (parsed.length === 0) { setStatus({ type: "error", msg: "Žiadne záznamy na import." }); return; }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/archive/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ entries: parsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", msg: data.error || `HTTP ${res.status}` });
      } else {
        setStatus({ type: "success", msg: `Importované: ${data.added} obrázkov. Preskočené: ${data.skipped}. Chyby: ${data.errors?.length || 0}.`, errors: data.errors });
      }
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  const s = (style) => style;

  return (
    <div style={s({ maxWidth: 720, margin: "40px auto", padding: "24px", fontFamily: "monospace", background: COLORS.bg, color: COLORS.ink, minHeight: "100vh" })}>
      <h1 style={s({ fontSize: 22, fontWeight: 700, marginBottom: 4 })}>Palizra Analyzator</h1>
      <div style={s({ fontSize: 12, color: COLORS.inkSoft, marginBottom: 28, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 14 })}>ADMIN PANEL · ARCHÍVNA DATABÁZA</div>

      <div style={s({ marginBottom: 20 })}>
        <label style={s({ fontSize: 11, letterSpacing: "0.08em", color: COLORS.inkSoft, display: "block", marginBottom: 6 })}>ADMIN KĽÚČ</label>
        <input
          type="password"
          value={adminKey}
          onChange={e => setAdminKey(e.target.value)}
          placeholder="Zadaj ADMIN_KEY z Railway Variables..."
          style={s({ width: "100%", padding: "8px 12px", fontFamily: "monospace", fontSize: 13, border: `1px solid ${COLORS.line}`, borderRadius: 4, boxSizing: "border-box", background: "#fff" })}
        />
      </div>

      <div style={s({ marginBottom: 8 })}>
        <label style={s({ fontSize: 11, letterSpacing: "0.08em", color: COLORS.inkSoft, display: "block", marginBottom: 6 })}>CSV SÚBOR</label>
        <input type="file" accept=".csv" onChange={handleFileUpload} style={s({ marginBottom: 8, fontSize: 13 })} />
      </div>

      <div style={s({ marginBottom: 8 })}>
        <label style={s({ fontSize: 11, letterSpacing: "0.08em", color: COLORS.inkSoft, display: "block", marginBottom: 6 })}>ALEBO VLOŽ CSV TEXT</label>
        <textarea
          value={csvText}
          onChange={handleTextChange}
          rows={6}
          placeholder={"url,context,date,source\nhttps://example.com/image.jpg,\"Popis obrázka\",2023-10-07,Bellingcat"}
          style={s({ width: "100%", fontFamily: "monospace", fontSize: 12, padding: "8px 12px", border: `1px solid ${COLORS.line}`, borderRadius: 4, boxSizing: "border-box", resize: "vertical", background: "#fff" })}
        />
      </div>

      {parsed.length > 0 && (
        <div style={s({ marginBottom: 16, padding: "10px 14px", background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, fontSize: 13 })}>
          <strong>{parsed.length} záznamov pripravených na import:</strong>
          <div style={s({ marginTop: 8, maxHeight: 200, overflowY: "auto" })}>
            {parsed.slice(0, 10).map((r, i) => (
              <div key={i} style={s({ fontSize: 11, color: COLORS.inkSoft, marginBottom: 2 })}>
                {i + 1}. {r.url?.slice(0, 60)}... {r.date ? `(${r.date})` : ""}
              </div>
            ))}
            {parsed.length > 10 && <div style={s({ fontSize: 11, color: COLORS.inkSoft })}>... a ďalších {parsed.length - 10}</div>}
          </div>
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={loading || parsed.length === 0 || !adminKey}
        style={s({
          background: loading || parsed.length === 0 || !adminKey ? COLORS.inkSoft : COLORS.ink,
          color: COLORS.bg,
          border: "none",
          borderRadius: 4,
          padding: "10px 20px",
          fontFamily: "monospace",
          fontSize: 13,
          cursor: loading || parsed.length === 0 || !adminKey ? "not-allowed" : "pointer",
          letterSpacing: "0.06em",
        })}
      >
        {loading ? "IMPORTUJEM…" : `IMPORTOVAŤ ${parsed.length > 0 ? `(${parsed.length})` : ""}`}
      </button>

      {status && (
        <div style={s({
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: 4,
          background: status.type === "success" ? COLORS.successBg : COLORS.errorBg,
          border: `1px solid ${status.type === "success" ? COLORS.success : COLORS.error}`,
          fontSize: 13,
          color: status.type === "success" ? COLORS.success : COLORS.error,
        })}>
          {status.msg}
          {status.errors?.length > 0 && (
            <div style={s({ marginTop: 8, fontSize: 11 })}>
              {status.errors.map((e, i) => <div key={i}>⚠ {e.url?.slice(0, 50)} – {e.error}</div>)}
            </div>
          )}
        </div>
      )}

      <div style={s({ marginTop: 40, fontSize: 11, color: COLORS.inkSoft, borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 })}>
        <strong>Formát CSV:</strong><br/>
        <code>url,context,date,source</code><br/>
        <code>https://example.com/img.jpg,"Popis kontextu",2023-10-07,Bellingcat</code><br/><br/>
        Stĺpce <code>context</code>, <code>date</code> a <code>source</code> sú voliteľné. Povinný je len <code>url</code>.
      </div>

      {/* Správa analýz */}
      <AnalysesManager adminKey={adminKey} s={s} COLORS={COLORS} API_BASE_URL={API_BASE_URL} />
    </div>
  );
}
