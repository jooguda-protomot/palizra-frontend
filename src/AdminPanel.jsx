import React, { useState } from "react";

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
      if (ch === '"') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    values.push(current.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
  }).filter(r => r.url);
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
    </div>
  );
}
