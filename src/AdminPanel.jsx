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
    const values = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"' || ch === '\u201e' || ch === '\u201c' || ch === '\u2018' || ch === '\u2019') { inQuotes = !inQuotes; }
      else if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += ch; }
    }
    values.push(current.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
  }).filter(r => r.url);
}

function AnalysesManager({ adminKey, COLORS, API_BASE_URL }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState({});
  const [translateStatus, setTranslateStatus] = useState("idle");
  const [noticeForm, setNoticeForm] = useState({});
  const [sourceForm, setSourceForm] = useState({});

  async function handleUpdateSource(id) {
    const form = sourceForm[id];
    setActionStatus(s => ({ ...s, [`source_${id}`]: "loading" }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analyses/${id}/update-source`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          source_url: form?.url || null,
          source_platform: form?.platform || null,
          source_date: form?.date || null,
        }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setActionStatus(s => ({ ...s, [`source_${id}`]: "done" }));
        setSourceForm(f => ({ ...f, [id]: { ...f[id], open: false } }));
        setTimeout(() => setActionStatus(s => ({ ...s, [`source_${id}`]: null })), 2000);
      }
    } catch {
      setActionStatus(s => ({ ...s, [`source_${id}`]: "error" }));
    }
  }

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
      const res = await fetch(`${API_BASE_URL}/api/admin/analyses`, {
        headers: { "x-admin-key": adminKey }
      });
      const data = await res.json();
      setAnalyses(data.analyses || []);
    } catch (err) {
      console.error("Chyba pri nacitani analyzz:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveNotice(id) {
    setActionStatus(s => ({ ...s, [`notice_rm_${id}`]: "loading" }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analyses/${id}/update-notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ remove: true }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setAnalyses(prev => prev.map(a => a.id === id ? { ...a, hasUpdateNotice: false } : a));
        setActionStatus(s => ({ ...s, [`notice_rm_${id}`]: null }));
        setNoticeForm(f => ({ ...f, [id]: { ...f[id], open: false } }));
      }
    } catch {
      setActionStatus(s => ({ ...s, [`notice_rm_${id}`]: "error" }));
    }
  }

  async function handleUpdateNotice(id) {
    const form = noticeForm[id];
    if (!form?.notice) return;
    setActionStatus(s => ({ ...s, [`notice_${id}`]: "loading" }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analyses/${id}/update-notice`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ notice: form.notice, relatedAnalysisId: form.relatedId || null, lang: form.lang || "sk" }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setAnalyses(prev => prev.map(a => a.id === id ? { ...a, hasUpdateNotice: true } : a));
        setActionStatus(s => ({ ...s, [`notice_${id}`]: "done" }));
setTimeout(() => setActionStatus(s => ({ ...s, [`notice_${id}`]: null })), 2000);
        setNoticeForm(f => ({ ...f, [id]: { ...f[id], open: false } }));
      }
    } catch {
      setActionStatus(s => ({ ...s, [`notice_${id}`]: "error" }));
    }
  }

  async function toggleDelete(id, currentlyDeleted) {
    setActionStatus(s => ({ ...s, [`del_${id}`]: "loading" }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analyses/${id}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ deleted: !currentlyDeleted }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setAnalyses(prev => prev.map(a => a.id === id
          ? { ...a, deleted: !currentlyDeleted, published: !currentlyDeleted ? false : a.published }
          : a
        ));
        setActionStatus(s => ({ ...s, [`del_${id}`]: "done" }));
      }
    } catch {
      setActionStatus(s => ({ ...s, [`del_${id}`]: "error" }));
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
        <div style={{ fontSize: 14, fontWeight: 600 }}>Sprava analyzz</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => handleTranslateAll(false)} disabled={!adminKey || translateStatus === "loading"}
            style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 12px", background: "#5A6B60", color: "#EFEAE0", border: "none", borderRadius: 4, cursor: adminKey ? "pointer" : "not-allowed" }}>
            {translateStatus === "loading" ? "PREKLADAM..." : translateStatus === "done" ? "SPUSTENE" : "PRELOZIT NOVE"}
          </button>
          <button onClick={() => handleTranslateAll(true)} disabled={!adminKey || translateStatus === "loading"}
            style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 12px", background: "#8B4513", color: "#EFEAE0", border: "none", borderRadius: 4, cursor: adminKey ? "pointer" : "not-allowed" }}>
            PRELOZIT ZNOVA (VSETKY)
          </button>
          <button onClick={loadAnalyses} disabled={!adminKey || loading}
            style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 12px", background: COLORS.ink, color: COLORS.bg, border: "none", borderRadius: 4, cursor: adminKey ? "pointer" : "not-allowed" }}>
            {loading ? "NACITAVAM..." : "NACITAT ANALYZY"}
          </button>
        </div>
      </div>

      {analyses.length === 0 && !loading && (
        <div style={{ fontSize: 13, color: COLORS.inkSoft }}>
          {adminKey ? "Klikni na NACITAT ANALYZY." : "Najprv zadaj admin kluc vysie."}
        </div>
      )}

      {analyses.map(a => (
        <div key={a.id} style={{ padding: "10px 12px", marginBottom: 8, border: `1px solid ${COLORS.line}`, borderRadius: 4, background: a.deleted ? "#fff0f0" : a.published ? "#f0faf3" : "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 3 }}>
                {a.date} · {a.location} · {a.category} · {a.lang?.toUpperCase()}
                {a.published && <span style={{ marginLeft: 8, color: "#2A6B3C", fontWeight: 600 }}>ZVEREJNENE</span>}
                {a.deleted && <span style={{ marginLeft: 8, color: "#8B0000", fontWeight: 600 }}>ZMAZANE</span>}
                {a.hasUpdateNotice && <span style={{ marginLeft: 8, color: "#7B5EA7", fontWeight: 600 }}>AKTUALIZOVANE</span>}
              </div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: COLORS.line, marginBottom: 3 }}>
                ID: <span style={{ userSelect: "all" }}>{a.id}</span>
              </div>
              <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.claim_text?.slice(0, 100)}{a.claim_text?.length > 100 ? "..." : ""}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button
                onClick={() => togglePublish(a.id, a.published)}
                disabled={a.deleted || actionStatus[a.id] === "loading"}
                style={{ fontFamily: "monospace", fontSize: 11, padding: "4px 10px", borderRadius: 3, border: "none", cursor: a.deleted ? "not-allowed" : "pointer", background: a.published ? COLORS.error : COLORS.success, color: "#fff", opacity: a.deleted ? 0.4 : 1 }}>
                {actionStatus[a.id] === "loading" ? "..." : a.published ? "STIAHNÚT" : "ZVEREJNIT"}
              </button>
              <button
                onClick={() => setNoticeForm(f => ({ ...f, [a.id]: { ...f[a.id], open: !f[a.id]?.open } }))}
                style={{ fontFamily: "monospace", fontSize: 11, padding: "4px 10px", borderRadius: 3, border: "none", cursor: "pointer", background: "#7B5EA7", color: "#fff" }}>
                AKTUALIZOVAT
              </button>
              <button
                onClick={() => setSourceForm(f => ({ ...f, [a.id]: { ...f[a.id], open: !f[a.id]?.open } }))}
                style={{ fontFamily: "monospace", fontSize: 11, padding: "4px 10px", borderRadius: 3, border: "none", cursor: "pointer", background: "#2A6B3C", color: "#fff" }}>
                {actionStatus[`source_${a.id}`] === "done" ? "✓ ULOZENE" : "ZDROJ"}
              </button>
              <button
                onClick={() => toggleDelete(a.id, a.deleted)}
                disabled={actionStatus[`del_${a.id}`] === "loading"}
                style={{ fontFamily: "monospace", fontSize: 11, padding: "4px 10px", borderRadius: 3, border: "none", cursor: "pointer", background: a.deleted ? "#5A6B60" : "#8B0000", color: "#fff" }}>
                {actionStatus[`del_${a.id}`] === "loading" ? "..." : a.deleted ? "OBNOVIT" : "ZMAZAT"}
              </button>
            </div>
          </div>

          {noticeForm[a.id]?.open && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              <textarea
                placeholder="Text upozornenia (napr. Aktualizacia 13.7.: BBC uviedla nove cisla...)"
                value={noticeForm[a.id]?.notice || ""}
                onChange={e => setNoticeForm(f => ({ ...f, [a.id]: { ...f[a.id], notice: e.target.value } }))}
                rows={2}
                style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 8px", border: `1px solid ${COLORS.line}`, borderRadius: 3, resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft }}>Jazyk textu:</label>
                <select
                  value={noticeForm[a.id]?.lang || "sk"}
                  onChange={e => setNoticeForm(f => ({ ...f, [a.id]: { ...f[a.id], lang: e.target.value } }))}
                  style={{ fontFamily: "monospace", fontSize: 12, padding: "3px 6px", border: `1px solid ${COLORS.line}`, borderRadius: 3 }}>
                  <option value="sk">SK</option>
                  <option value="en">EN</option>
                  <option value="ar">AR</option>
                  <option value="he">HE</option>
                </select>
              </div>
              <input
                placeholder="ID suvisiacej analyzy (volitelne)"
                value={noticeForm[a.id]?.relatedId || ""}
                onChange={e => setNoticeForm(f => ({ ...f, [a.id]: { ...f[a.id], relatedId: e.target.value } }))}
                style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 8px", border: `1px solid ${COLORS.line}`, borderRadius: 3 }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handleUpdateNotice(a.id)}
                  disabled={!noticeForm[a.id]?.notice || actionStatus[`notice_${a.id}`] === "loading" || actionStatus[`notice_${a.id}`] === "done"}
                  style={{ fontFamily: "monospace", fontSize: 11, padding: "3px 10px", background: "#7B5EA7", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer" }}>
                  {actionStatus[`notice_${a.id}`] === "loading" ? "..." : actionStatus[`notice_${a.id}`] === "done" ? "ULOZENE" : "ULOZIT UPOZORNENIE"}
                </button>
                {a.hasUpdateNotice && (
                  <button onClick={() => handleRemoveNotice(a.id)}
                    disabled={actionStatus[`notice_rm_${a.id}`] === "loading"}
                    style={{ fontFamily: "monospace", fontSize: 11, padding: "3px 10px", background: "#8B0000", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer" }}>
                    {actionStatus[`notice_rm_${a.id}`] === "loading" ? "..." : "ODSTRANIT"}
                  </button>
                )}
                <button onClick={() => setNoticeForm(f => ({ ...f, [a.id]: { ...f[a.id], open: false } }))}
                  style={{ fontFamily: "monospace", fontSize: 11, padding: "3px 8px", background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 3, cursor: "pointer" }}>
                  ZRUSIT
                </button>
              </div>
            </div>
          )}

          {sourceForm[a.id]?.open && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "#f0faf3", border: `1px solid ${COLORS.line}`, borderRadius: 4 }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 2 }}>ZDROJ TVRDENIA</div>
              <input
                type="url"
                placeholder="URL pôvodného zdroja (napr. https://x.com/...)"
                value={sourceForm[a.id]?.url || ""}
                onChange={e => setSourceForm(f => ({ ...f, [a.id]: { ...f[a.id], url: e.target.value } }))}
                style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 8px", border: `1px solid ${COLORS.line}`, borderRadius: 3 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={sourceForm[a.id]?.platform || "other"}
                  onChange={e => setSourceForm(f => ({ ...f, [a.id]: { ...f[a.id], platform: e.target.value } }))}
                  style={{ fontFamily: "monospace", fontSize: 12, padding: "3px 6px", border: `1px solid ${COLORS.line}`, borderRadius: 3 }}>
                  <option value="facebook">Facebook</option>
                  <option value="x">X / Twitter</option>
                  <option value="telegram">Telegram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="article">Článok / Web</option>
                  <option value="other">Iné</option>
                </select>
                <input
                  type="date"
                  value={sourceForm[a.id]?.date || ""}
                  onChange={e => setSourceForm(f => ({ ...f, [a.id]: { ...f[a.id], date: e.target.value } }))}
                  style={{ fontFamily: "monospace", fontSize: 12, padding: "3px 6px", border: `1px solid ${COLORS.line}`, borderRadius: 3 }}
                />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => handleUpdateSource(a.id)}
                  disabled={actionStatus[`source_${a.id}`] === "loading"}
                  style={{ fontFamily: "monospace", fontSize: 11, padding: "3px 10px", background: "#2A6B3C", color: "#fff", border: "none", borderRadius: 3, cursor: "pointer" }}>
                  {actionStatus[`source_${a.id}`] === "loading" ? "..." : "ULOZIT ZDROJ"}
                </button>
                <button onClick={() => setSourceForm(f => ({ ...f, [a.id]: { ...f[a.id], open: false } }))}
                  style={{ fontFamily: "monospace", fontSize: 11, padding: "3px 8px", background: "transparent", border: `1px solid ${COLORS.line}`, borderRadius: 3, cursor: "pointer" }}>
                  ZRUSIT
                </button>
              </div>
            </div>
          )}
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
    if (!adminKey.trim()) { setStatus({ type: "error", msg: "Zadaj admin kluc." }); return; }
    if (parsed.length === 0) { setStatus({ type: "error", msg: "Ziadne zaznamy na import." }); return; }
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
        setStatus({ type: "success", msg: `Importovane: ${data.added} obrazkov. Preskocene: ${data.skipped}. Chyby: ${data.errors?.length || 0}.`, errors: data.errors });
      }
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: "24px", fontFamily: "monospace", background: COLORS.bg, color: COLORS.ink, minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Palizra Analyzator</h1>
      <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 28, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 14 }}>ADMIN PANEL</div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, letterSpacing: "0.08em", color: COLORS.inkSoft, display: "block", marginBottom: 6 }}>ADMIN KLUC</label>
        <input
          type="password"
          value={adminKey}
          onChange={e => setAdminKey(e.target.value)}
          placeholder="Zadaj ADMIN_KEY z Railway Variables..."
          style={{ width: "100%", padding: "8px 12px", fontFamily: "monospace", fontSize: 13, border: `1px solid ${COLORS.line}`, borderRadius: 4, boxSizing: "border-box", background: "#fff" }}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 11, letterSpacing: "0.08em", color: COLORS.inkSoft, display: "block", marginBottom: 6 }}>CSV SUBOR</label>
        <input type="file" accept=".csv" onChange={handleFileUpload} style={{ marginBottom: 8, fontSize: 13 }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ fontSize: 11, letterSpacing: "0.08em", color: COLORS.inkSoft, display: "block", marginBottom: 6 }}>ALEBO VLOZ CSV TEXT</label>
        <textarea
          value={csvText}
          onChange={handleTextChange}
          rows={6}
          placeholder={"url,context,date,source\nhttps://example.com/image.jpg,\"Popis obrazka\",2023-10-07,Bellingcat"}
          style={{ width: "100%", fontFamily: "monospace", fontSize: 12, padding: "8px 12px", border: `1px solid ${COLORS.line}`, borderRadius: 4, boxSizing: "border-box", resize: "vertical", background: "#fff" }}
        />
      </div>

      {parsed.length > 0 && (
        <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4, fontSize: 13 }}>
          <strong>{parsed.length} zaznamov pripravených na import:</strong>
          <div style={{ marginTop: 8, maxHeight: 200, overflowY: "auto" }}>
            {parsed.slice(0, 10).map((r, i) => (
              <div key={i} style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 2 }}>
                {i + 1}. {r.url?.slice(0, 60)}... {r.date ? `(${r.date})` : ""}
              </div>
            ))}
            {parsed.length > 10 && <div style={{ fontSize: 11, color: COLORS.inkSoft }}>... a dalsich {parsed.length - 10}</div>}
          </div>
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={loading || parsed.length === 0 || !adminKey}
        style={{
          background: loading || parsed.length === 0 || !adminKey ? COLORS.inkSoft : COLORS.ink,
          color: COLORS.bg,
          border: "none",
          borderRadius: 4,
          padding: "10px 20px",
          fontFamily: "monospace",
          fontSize: 13,
          cursor: loading || parsed.length === 0 || !adminKey ? "not-allowed" : "pointer",
          letterSpacing: "0.06em",
        }}
      >
        {loading ? "IMPORTUJEM..." : `IMPORTOVAT ${parsed.length > 0 ? `(${parsed.length})` : ""}`}
      </button>

      {status && (
        <div style={{
          marginTop: 16,
          padding: "12px 16px",
          borderRadius: 4,
          background: status.type === "success" ? COLORS.successBg : COLORS.errorBg,
          border: `1px solid ${status.type === "success" ? COLORS.success : COLORS.error}`,
          fontSize: 13,
          color: status.type === "success" ? COLORS.success : COLORS.error,
        }}>
          {status.msg}
          {status.errors?.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 11 }}>
              {status.errors.map((e, i) => <div key={i}>{e.url?.slice(0, 50)} - {e.error}</div>)}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 40, fontSize: 11, color: COLORS.inkSoft, borderTop: `1px solid ${COLORS.line}`, paddingTop: 14 }}>
        <strong>Format CSV:</strong><br/>
        <code>url,context,date,source</code><br/>
        <code>https://example.com/img.jpg,"Popis kontextu",2023-10-07,Bellingcat</code>
      </div>

      <AnalysesManager adminKey={adminKey} COLORS={COLORS} API_BASE_URL={API_BASE_URL} />
    </div>
  );
}
