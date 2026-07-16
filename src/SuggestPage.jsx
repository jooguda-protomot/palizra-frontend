import React, { useState } from "react";

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
};

const UI = {
  sk: {
    subtitle: "PALIZRA ANALYZATOR · NAVRHNÚŤ OVERENIE",
    title: "Navrhnúť tvrdenie na overenie",
    desc: "Stretli ste sa s tvrdením alebo obrázkom, ktorý by mal byť overený? Pošlite nám ho. Každý návrh posúdime a ak spĺňa naše kritériá, zaradíme ho do fronty na overenie.",
    back: "← Späť na nástroj",
    claimLabel: "TVRDENIE *",
    claimPlaceholder: "Vložte text tvrdenia, ktoré chcete overiť...",
    urlLabel: "URL ZDROJA *",
    urlPlaceholder: "https://...",
    platformLabel: "PLATFORMA (voliteľné)",
    dateLabel: "DÁTUM ŠÍRENIA (voliteľné)",
    emailLabel: "VÁŠ EMAIL (voliteľné)",
    emailPlaceholder: "Ak chcete byť informovaní o výsledku...",
    commentLabel: "KOMENTÁR (voliteľné)",
    commentPlaceholder: "Prečo si myslíte, že toto tvrdenie je problematické?",
    submit: "ODOSLAŤ NÁVRH",
    submitting: "ODOSIELA SA…",
    sent: "✓ Ďakujeme za návrh. Posúdime ho a ak spĺňa naše kritériá, zaradíme ho do fronty na overenie.",
    error: "Odoslanie zlyhalo, skúste to znova.",
    required: "* Povinné polia",
    note: "Návrhy nie sú automaticky overované. Každý návrh posúdime manuálne.",
    imageLabel: "OBRÁZOK (voliteľné)",
    platforms: ["Facebook", "X / Twitter", "Telegram", "TikTok", "Instagram", "YouTube", "Článok / Web", "Iné"],
  },
  en: {
    subtitle: "PALIZRA ANALYZATOR · SUGGEST A CLAIM",
    title: "Suggest a claim for verification",
    desc: "Have you come across a claim or image that should be verified? Send it to us. We will review every submission and if it meets our criteria, we will add it to the verification queue.",
    back: "← Back to tool",
    claimLabel: "CLAIM *",
    claimPlaceholder: "Paste the text of the claim you want verified...",
    urlLabel: "SOURCE URL *",
    urlPlaceholder: "https://...",
    platformLabel: "PLATFORM (optional)",
    dateLabel: "DATE OF CIRCULATION (optional)",
    emailLabel: "YOUR EMAIL (optional)",
    emailPlaceholder: "If you want to be notified of the result...",
    commentLabel: "COMMENT (optional)",
    commentPlaceholder: "Why do you think this claim is problematic?",
    submit: "SUBMIT SUGGESTION",
    submitting: "SUBMITTING…",
    sent: "✓ Thank you for your suggestion. We will review it and if it meets our criteria, we will add it to the verification queue.",
    error: "Submission failed, please try again.",
    required: "* Required fields",
    note: "Suggestions are not automatically verified. Each submission is reviewed manually.",
    imageLabel: "IMAGE (optional)",
    platforms: ["Facebook", "X / Twitter", "Telegram", "TikTok", "Instagram", "YouTube", "Article / Web", "Other"],
  },
  ar: {
    subtitle: "محلل بالزرا · اقتراح للتحقق",
    title: "اقتراح ادعاء للتحقق منه",
    desc: "هل صادفت ادعاءً أو صورة تحتاج إلى التحقق؟ أرسلها إلينا. سنراجع كل اقتراح وإذا استوفى معاييرنا، سنضيفه إلى قائمة انتظار التحقق.",
    back: "← العودة إلى الأداة",
    claimLabel: "الادعاء *",
    claimPlaceholder: "الصق نص الادعاء الذي تريد التحقق منه...",
    urlLabel: "رابط المصدر *",
    urlPlaceholder: "https://...",
    platformLabel: "المنصة (اختياري)",
    dateLabel: "تاريخ التداول (اختياري)",
    emailLabel: "بريدك الإلكتروني (اختياري)",
    emailPlaceholder: "إذا كنت تريد أن يتم إخطارك بالنتيجة...",
    commentLabel: "تعليق (اختياري)",
    commentPlaceholder: "لماذا تعتقد أن هذا الادعاء إشكالي؟",
    submit: "إرسال الاقتراح",
    submitting: "جاري الإرسال…",
    sent: "✓ شكراً لاقتراحك. سنراجعه وإذا استوفى معاييرنا، سنضيفه إلى قائمة الانتظار.",
    error: "فشل الإرسال، يرجى المحاولة مرة أخرى.",
    required: "* حقول مطلوبة",
    note: "لا يتم التحقق من الاقتراحات تلقائياً. يتم مراجعة كل اقتراح يدوياً.",
    imageLabel: "صورة (اختياري)",
    platforms: ["فيسبوك", "X / تويتر", "تيليغرام", "تيك توك", "إنستغرام", "يوتيوب", "مقال / موقع", "أخرى"],
  },
  he: {
    subtitle: "פליזרה אנלייזר · הצע לבדיקה",
    title: "הצע טענה לאימות",
    desc: "נתקלת בטענה או תמונה שצריכה לעבור בדיקה? שלח לנו. נבחן כל הצעה ואם היא עומדת בקריטריונים שלנו, נוסיף אותה לתור הבדיקה.",
    back: "← חזרה לכלי",
    claimLabel: "טענה *",
    claimPlaceholder: "הדבק את טקסט הטענה שברצונך לאמת...",
    urlLabel: "קישור למקור *",
    urlPlaceholder: "https://...",
    platformLabel: "פלטפורמה (אופציונלי)",
    dateLabel: "תאריך הפצה (אופציונלי)",
    emailLabel: "האימייל שלך (אופציונלי)",
    emailPlaceholder: "אם ברצונך לקבל התראה על התוצאה...",
    commentLabel: "הערה (אופציונלי)",
    commentPlaceholder: "מדוע לדעתך טענה זו בעייתית?",
    submit: "שלח הצעה",
    submitting: "שולח…",
    sent: "✓ תודה על הצעתך. נבחן אותה ואם היא עומדת בקריטריונים שלנו, נוסיף אותה לתור.",
    error: "השליחה נכשלה, נסה שוב.",
    required: "* שדות חובה",
    note: "הצעות אינן מאומתות אוטומטית. כל הצעה נבחנת ידנית.",
    imageLabel: "תמונה (אופציונלי)",
    platforms: ["פייסבוק", "X / טוויטר", "טלגרם", "טיקטוק", "אינסטגרם", "יוטיוב", "כתבה / אתר", "אחר"],
  },
};

const inputStyle = {
  width: "100%",
  padding: "8px 12px",
  fontFamily: "monospace",
  fontSize: 13,
  border: `1px solid #C9BFA8`,
  borderRadius: 4,
  boxSizing: "border-box",
  background: "#fff",
  color: "#1F2A24",
};

const labelStyle = {
  fontSize: 11,
  fontFamily: "monospace",
  color: "#5A6B60",
  letterSpacing: "0.06em",
  display: "block",
  marginBottom: 4,
};

export default function SuggestPage() {
  const urlLang = new URLSearchParams(window.location.search).get("lang") || "en";
  const [lang, setLang] = useState(["sk","en","ar","he"].includes(urlLang) ? urlLang : "en");
  const u = UI[lang] || UI.en;
  const isRTL = lang === "ar" || lang === "he";

  const [claimText, setClaimText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState("");
  const [sourceDate, setSourceDate] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState("idle");

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!claimText.trim() || !sourceUrl.trim()) return;
    setStatus("submitting");
    try {
      const formData = new FormData();
      formData.append("claim_text", claimText);
      formData.append("source_url", sourceUrl);
      if (sourcePlatform) formData.append("source_platform", sourcePlatform);
      if (sourceDate) formData.append("source_date", sourceDate);
      if (email) formData.append("email", email);
      if (comment) formData.append("comment", comment);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${API_BASE_URL}/api/suggestions`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} lang={lang}
      style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px", fontFamily: "'Iowan Old Style', Georgia, serif", background: COLORS.paper, color: COLORS.ink, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace" }}>{u.subtitle}</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "6px 0 4px" }}>{u.title}</h1>
          <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: 0, lineHeight: 1.6 }}>{u.desc}</p>
          <a href={`/?lang=${lang}`} style={{ fontSize: 13, color: COLORS.inkSoft, display: "inline-block", marginTop: 6 }}>{u.back}</a>
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

      {status === "sent" ? (
        <div style={{ padding: "20px 24px", background: COLORS.consensusBg, border: `1px solid ${COLORS.consensus}`, borderRadius: 4, fontSize: 14, color: COLORS.consensus }}>
          {u.sent}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Tvrdenie */}
          <div>
            <label style={labelStyle}>{u.claimLabel}</label>
            <textarea
              value={claimText}
              onChange={e => setClaimText(e.target.value)}
              placeholder={u.claimPlaceholder}
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* URL zdroja */}
          <div>
            <label style={labelStyle}>{u.urlLabel}</label>
            <input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
              placeholder={u.urlPlaceholder} style={inputStyle} />
          </div>

          {/* Platforma + Dátum */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label style={labelStyle}>{u.platformLabel}</label>
              <select value={sourcePlatform} onChange={e => setSourcePlatform(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}>
                <option value="">—</option>
                {u.platforms.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={labelStyle}>{u.dateLabel}</label>
              <input type="date" value={sourceDate} onChange={e => setSourceDate(e.target.value)}
                style={inputStyle} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>{u.emailLabel}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={u.emailPlaceholder} style={inputStyle} />
          </div>

          {/* Obrázok */}
          <div>
            <label style={labelStyle}>{u.imageLabel}</label>
            <input type="file" accept="image/*" onChange={handleImageChange}
              style={{ fontSize: 13, fontFamily: "monospace" }} />
            {imagePreview && (
              <div style={{ marginTop: 8 }}>
                <img src={imagePreview} alt="preview"
                  style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 4, border: `1px solid ${COLORS.line}` }} />
                <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                  style={{ display: "block", marginTop: 4, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: COLORS.inkSoft }}>
                  ✕ {lang === "en" ? "Remove image" : lang === "ar" ? "إزالة الصورة" : lang === "he" ? "הסר תמונה" : "Odstrániť obrázok"}
                </button>
              </div>
            )}
          </div>

          {/* Komentár */}
          <div>
            <label style={labelStyle}>{u.commentLabel}</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder={u.commentPlaceholder}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Poznámka */}
          <div style={{ fontSize: 12, color: COLORS.inkSoft, fontFamily: "monospace" }}>
            {u.required} · {u.note}
          </div>

          {/* Tlačidlo */}
          <button
            onClick={handleSubmit}
            disabled={!claimText.trim() || !sourceUrl.trim() || status === "submitting"}
            style={{
              background: (!claimText.trim() || !sourceUrl.trim()) ? COLORS.inkSoft : COLORS.ink,
              color: COLORS.paper,
              border: "none",
              borderRadius: 4,
              padding: "10px 20px",
              fontFamily: "monospace",
              fontSize: 13,
              cursor: (!claimText.trim() || !sourceUrl.trim()) ? "not-allowed" : "pointer",
              letterSpacing: "0.06em",
            }}>
            {status === "submitting" ? u.submitting : u.submit}
          </button>

          {status === "error" && (
            <div style={{ fontSize: 13, color: COLORS.discrepancy }}>{u.error}</div>
          )}
        </div>
      )}

      <footer style={{ marginTop: 32, paddingTop: 14, borderTop: `1px solid ${COLORS.line}`, fontSize: 12, color: COLORS.inkSoft, textAlign: "center" }}>
        © {new Date().getFullYear()} Palizra Analyzator · <a href="/" style={{ color: COLORS.inkSoft }}>{u.back}</a>
      </footer>
    </div>
  );
}
