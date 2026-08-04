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
    subtitle: "PALIZRA ANALYZATOR · METODOLÓGIA",
    title: "Metodológia",
    desc: "Transparentný popis postupov, kritérií a testovania vyváženosti nástroja Palizra Analyzator v súlade so štandardmi IFCN.",
    back: "← Späť na nástroj",
    version: "Verzia metodológie: 1.0 · August 2026",
    toc: "Obsah",
    sections: [
      { id: "how", title: "Ako nástroj funguje" },
      { id: "sources", title: "Výber zdrojov" },
      { id: "confidence", title: "Kritériá miery istoty" },
      { id: "balance", title: "Testovanie vyváženosti" },
      { id: "corrections", title: "Opravy a aktualizácie" },
    ],
  },
  en: {
    subtitle: "PALIZRA ANALYZATOR · METHODOLOGY",
    title: "Methodology",
    desc: "A transparent description of the procedures, criteria and impartiality testing of Palizra Analyzator, in accordance with IFCN standards.",
    back: "← Back to tool",
    version: "Methodology version: 1.0 · August 2026",
    toc: "Contents",
    sections: [
      { id: "how", title: "How the tool works" },
      { id: "sources", title: "Source selection" },
      { id: "confidence", title: "Confidence level criteria" },
      { id: "balance", title: "Impartiality testing" },
      { id: "corrections", title: "Corrections and updates" },
    ],
  },
  ar: {
    subtitle: "محلل بالزرا · المنهجية",
    title: "المنهجية",
    desc: "وصف شفاف للإجراءات والمعايير واختبار الحياد لمحلل بالزرا، وفقاً لمعايير IFCN.",
    back: "← العودة إلى الأداة",
    version: "إصدار المنهجية: 1.0 · أغسطس 2026",
    toc: "المحتويات",
    sections: [
      { id: "how", title: "كيف تعمل الأداة" },
      { id: "sources", title: "اختيار المصادر" },
      { id: "confidence", title: "معايير مستوى الثقة" },
      { id: "balance", title: "اختبار الحياد" },
      { id: "corrections", title: "التصحيحات والتحديثات" },
    ],
  },
  he: {
    subtitle: "פליזרה אנלייזר · מתודולוגיה",
    title: "מתודולוגיה",
    desc: "תיאור שקוף של הנהלים, הקריטריונים ובדיקת הנייטרליות של פליזרה אנלייזר, בהתאם לתקני IFCN.",
    back: "← חזרה לכלי",
    version: "גרסת מתודולוגיה: 1.0 · אוגוסט 2026",
    toc: "תוכן עניינים",
    sections: [
      { id: "how", title: "כיצד הכלי עובד" },
      { id: "sources", title: "בחירת מקורות" },
      { id: "confidence", title: "קריטריוני רמת הביטחון" },
      { id: "balance", title: "בדיקת נייטרליות" },
      { id: "corrections", title: "תיקונים ועדכונים" },
    ],
  },
};

const CONTENT = {
  en: {
    how: {
      title: "How the tool works",
      body: `Palizra Analyzator is an AI-assisted fact-checking tool for claims and images related to the Israeli-Palestinian conflict. It does not issue simple true/false verdicts. Instead, it breaks down text into verifiable units and compares them across independent sources.

The analysis process consists of four steps:

1. Claim extraction — The tool breaks the input text into individual claims, categorising each as a verifiable fact, quote/statement, interpretation, or unverifiable claim.

2. Internal consistency check — The tool checks whether claims within the same text contradict each other in terms of dates, numbers, or logic.

3. Source comparison — For each verifiable fact, the tool searches across curated independent sources and compares what each source says, identifying consensus, discrepancies, and framing differences.

4. Confidence level assignment — Based on the evidence gathered, the tool assigns a confidence level (high, medium, or low) according to explicit criteria (see Section 3).

For images, the tool additionally performs reverse image search, geolocation assessment, EXIF metadata analysis, and AI-generation detection.`,
    },
    sources: {
      title: "Source selection",
      body: `Sources are selected according to the following criteria, applied consistently to all outlets regardless of which side of the conflict they are associated with:

1. Editorial independence — The source must be free from government or state control and must not be funded by a party to the conflict.

2. Fact-checking track record — The source must have a documented record of accuracy and corrections.

3. Geographic and linguistic coverage — The source list must include outlets covering both sides of the conflict.

4. Institutional credibility — For human rights data, the source must be a recognised international or regional organisation.

The curated source list is reviewed quarterly. The full list and audit documentation are available at palizra.org/analyses and in the Palizra Source Audit document.

Sources explicitly excluded: government-controlled or state-funded outlets, sources with documented systematic bias, and unverified social media accounts.`,
    },
    confidence: {
      title: "Confidence level criteria",
      body: `Confidence levels are assigned according to the following explicit criteria, applied consistently regardless of the origin of the claim:

HIGH: At least 2 curated independent sources confirm the core claim, and no curated source directly contradicts it.

MEDIUM: At least 1 curated independent source confirms or partially confirms the core claim, OR curated sources conflict with each other on key details.

LOW: No curated independent source confirms the core claim, OR the claim is confirmed only by partisan or state-affiliated sources, OR key details (numbers, location, perpetrator) remain unverified by any curated source.

These criteria reflect editorial balance, not mechanical balance. The confidence level is determined by the quality and quantity of available evidence, not by the origin of the claim.`,
    },
    balance: {
      title: "Impartiality testing",
      body: `To verify that the tool applies consistent standards regardless of which side of the conflict a claim originates from, quarterly impartiality tests are conducted.

Each test consists of matched pairs of claims — one from a Palestinian/Arab source and one structurally equivalent claim from an Israeli source — submitted to the tool independently. Results are compared across four categories: casualties, infrastructure, statistics, and diplomatic statements.

If an inconsistency is identified, the root cause is investigated and a correction is implemented. All test records are retained and results are published in the public Changelog at palizra.org.

The tool applies editorial balance, not mechanical (false) balance. This means that a claim from a Palestinian source and a claim from an Israeli source supported by the same quality of evidence will receive the same confidence level.

First quarterly test: Q3 2026.`,
    },
    corrections: {
      title: "Corrections and updates",
      body: `Palizra Analyzator is committed to transparent error correction in accordance with IFCN standards.

If an error is identified in a published analysis — whether by the author or reported by a reader — the following steps are taken:

1. The error is assessed and, if confirmed, corrected as soon as possible.
2. The published analysis is updated with a visible update notice stating the date of the correction and the nature of the change.
3. The correction is documented in the public corrections log at palizra.org/corrections.

Errors can be reported via the Report an issue button on each published analysis, or by email at palizra@proton.me.

Analyses are not deleted after publication. If an analysis requires a substantial update, the original version is retained and a link to the updated analysis is added.`,
    },
  },
};

// Jednoduché kopírovanie EN obsahu pre ostatné jazyky (v produkcii by boli preložené)
CONTENT.sk = {
  how: {
    title: "Ako nástroj funguje",
    body: `Palizra Analyzator je AI-asistovaný nástroj na overovanie tvrdení a obrázkov súvisiacich s izraelsko-palestínskym konfliktom. Nevydáva jednoduché verdikty pravda/nepravda. Namiesto toho rozkladá text na overiteľné jednotky a porovnáva ich naprieč nezávislými zdrojmi.

Proces analýzy pozostáva zo štyroch krokov:

1. Extrakcia tvrdení — Nástroj rozloží vstupný text na jednotlivé tvrdenia, pričom každé klasifikuje ako overiteľný fakt, citáciu/výrok, interpretáciu alebo neoveriteľné tvrdenie.

2. Kontrola vnútornej konzistentnosti — Nástroj skontroluje, či si tvrdenia v rámci toho istého textu neodporujú z hľadiska dátumov, čísel alebo logiky.

3. Porovnanie zdrojov — Pre každý overiteľný fakt nástroj vyhľadá kurátorované nezávislé zdroje a porovná, čo každý zdroj hovorí, pričom identifikuje zhodu, nezhody a rozdiely v rámcovaní.

4. Priradenie miery istoty — Na základe zhromaždených dôkazov nástroj priraďuje mieru istoty (vysoká, stredná, nízka) podľa explicitných kritérií (pozri sekciu 3).

Pri obrázkoch nástroj navyše vykonáva spätné vyhľadávanie obrázkov, geolokačné hodnotenie, analýzu metadát EXIF a detekciu AI generovania.`,
  },
  sources: {
    title: "Výber zdrojov",
    body: `Zdroje sú vyberané podľa nasledujúcich kritérií, uplatňovaných konzistentne pre všetky médiá bez ohľadu na to, ktorej strane konfliktu sú priradené:

1. Editorská nezávislosť — Zdroj musí byť slobodný od vládnej alebo štátnej kontroly a nesmie byť financovaný stranou konfliktu.

2. História overovania — Zdroj musí mať zdokumentovanú históriu presnosti a opráv.

3. Geografické a jazykové pokrytie — Zoznam zdrojov musí zahŕňať médiá pokrývajúce obe strany konfliktu.

4. Inštitucionálna dôveryhodnosť — Pre údaje o ľudských právach musí byť zdroj uznávanou medzinárodnou alebo regionálnou organizáciou.

Kurátorovaný zoznam zdrojov sa reviduje kvartálne. Úplný zoznam a dokumentácia auditu sú dostupné na palizra.org/analyses a v dokumente Palizra Source Audit.

Explicitne vylúčené zdroje: vládou kontrolované alebo štátom financované médiá, zdroje so zdokumentovanou systematickou zaujatosťou a neoverené účty na sociálnych sieťach.`,
  },
  confidence: {
    title: "Kritériá miery istoty",
    body: `Miera istoty sa priraďuje podľa nasledujúcich explicitných kritérií, uplatňovaných konzistentne bez ohľadu na pôvod tvrdenia:

VYSOKÁ: Aspoň 2 kurátorované nezávislé zdroje potvrdzujú jadro tvrdenia a žiadny kurátorovaný zdroj ho priamo nepopiera.

STREDNÁ: Aspoň 1 kurátorovaný nezávislý zdroj potvrdzuje alebo čiastočne potvrdzuje jadro tvrdenia, ALEBO si kurátorované zdroje v kľúčových detailoch odporujú.

NÍZKA: Žiadny kurátorovaný nezávislý zdroj tvrdenie nepotvrdil, ALEBO ho potvrdzujú len stranícke či štátom napojené zdroje, ALEBO kľúčové detaily (čísla, miesto, pôvodca) zostávajú neoverené žiadnym kurátorovaným zdrojom.

Tieto kritériá odrážajú redakčnú vyváženosť, nie mechanickú vyváženosť. Miera istoty sa určuje na základe kvality a množstva dostupných dôkazov, nie na základe pôvodu tvrdenia.`,
  },
  balance: {
    title: "Testovanie vyváženosti",
    body: `Na overenie, že nástroj uplatňuje konzistentné štandardy bez ohľadu na to, z ktorej strany konfliktu tvrdenie pochádza, sa vykonávajú kvartálne testy vyváženosti.

Každý test pozostáva zo spárovaných dvojíc tvrdení — jedno z palestínskeho/arabského zdroja a jedno štruktúrne ekvivalentné tvrdenie z izraelského zdroja — ktoré sa do nástroja zadávajú nezávisle. Výsledky sa porovnávajú v štyroch kategóriách: obete, infraštruktúra, štatistiky a diplomatické vyhlásenia.

Ak sa zistí nekonzistentnosť, preskúma sa jej príčina a implementuje sa oprava. Všetky záznamy z testov sa uchovávajú a výsledky sa zverejňujú v Changelogu na palizra.org.

Nástroj uplatňuje redakčnú vyváženosť, nie mechanickú (falošnú) vyváženosť. To znamená, že tvrdenie z palestínskeho zdroja a tvrdenie z izraelského zdroja, ktoré sú podložené rovnakou kvalitou dôkazov, dostanú rovnakú mieru istoty.

Prvý kvartálny test: Q3 2026.`,
  },
  corrections: {
    title: "Opravy a aktualizácie",
    body: `Palizra Analyzator sa zaväzuje k transparentnému opravovaniu chýb v súlade so štandardmi IFCN.

Ak sa v zverejnenej analýze zistí chyba — či už autorom alebo nahlásená čitateľom — podniknú sa nasledujúce kroky:

1. Chyba sa posúdi a ak sa potvrdí, čo najskôr sa opraví.
2. Zverejnená analýza sa aktualizuje viditeľným upozornením o aktualizácii s dátumom opravy a popisom zmeny.
3. Oprava sa zdokumentuje vo verejnom zozname opráv na palizra.org/corrections.

Chyby možno nahlásiť prostredníctvom tlačidla Nahlásiť problém pri každej zverejnenej analýze alebo e-mailom na adresu palizra@proton.me.

Analýzy sa po zverejnení neodstraňujú. Ak analýza vyžaduje podstatnú aktualizáciu, pôvodná verzia zostane zachovaná a pridá sa odkaz na aktualizovanú analýzu.`,
  },
};

CONTENT.ar = {
  how: {
    title: "كيف تعمل الأداة",
    body: `محلل بالزرا هو أداة للتحقق من الحقائق بمساعدة الذكاء الاصطناعي للادعاءات والصور المتعلقة بالصراع الإسرائيلي الفلسطيني. لا تصدر أحكاماً بسيطة بالصواب أو الخطأ. بدلاً من ذلك، تقسّم النص إلى وحدات قابلة للتحقق وتقارنها عبر مصادر مستقلة.

تتكون عملية التحليل من أربع خطوات:

1. استخراج الادعاءات — تقسم الأداة النص إلى ادعاءات فردية، وتصنف كل منها كحقيقة قابلة للتحقق، أو اقتباس/بيان، أو تفسير، أو ادعاء غير قابل للتحقق.

2. فحص الاتساق الداخلي — تتحقق الأداة مما إذا كانت الادعاءات داخل النص الواحد تتعارض من حيث التواريخ أو الأرقام أو المنطق.

3. مقارنة المصادر — لكل حقيقة قابلة للتحقق، تبحث الأداة في المصادر المستقلة المنتقاة وتقارن ما تقوله كل مصدر، محددةً نقاط التوافق والتناقضات وفروق الإطار.

4. تعيين مستوى الثقة — بناءً على الأدلة المجمعة، تعين الأداة مستوى ثقة (عالٍ أو متوسط أو منخفض) وفق معايير صريحة (انظر القسم 3).

للصور، تجري الأداة أيضاً بحثاً عكسياً عن الصور وتقييم الموقع الجغرافي وتحليل بيانات EXIF الوصفية والكشف عن توليد الذكاء الاصطناعي.`,
  },
  sources: {
    title: "اختيار المصادر",
    body: `تُختار المصادر وفق المعايير التالية، المطبقة باتساق على جميع المنافذ بصرف النظر عن الجانب الذي ترتبط به:

1. الاستقلالية التحريرية — يجب أن يكون المصدر حراً من السيطرة الحكومية أو الدولة وألا يكون ممولاً من طرف في الصراع.

2. سجل التحقق — يجب أن يكون للمصدر سجل موثق من الدقة والتصحيحات.

3. التغطية الجغرافية واللغوية — يجب أن تشمل قائمة المصادر منافذ تغطي جانبي الصراع.

4. المصداقية المؤسسية — لبيانات حقوق الإنسان، يجب أن يكون المصدر منظمة دولية أو إقليمية معترفاً بها.

تُراجع قائمة المصادر المنتقاة كل ثلاثة أشهر. القائمة الكاملة ووثائق التدقيق متاحة على palizra.org/analyses.

المصادر المستبعدة صراحةً: المنافذ التي تسيطر عليها الحكومة أو تموّلها الدولة، والمصادر ذات التحيز المنهجي الموثق.`,
  },
  confidence: {
    title: "معايير مستوى الثقة",
    body: `تُعيَّن مستويات الثقة وفق المعايير الصريحة التالية، المطبقة باتساق بصرف النظر عن مصدر الادعاء:

عالٍ: مصدران مستقلان منتقيان على الأقل يؤكدان الادعاء الأساسي، ولا يتعارض معه أي مصدر منتقى بشكل مباشر.

متوسط: مصدر منتقى مستقل واحد على الأقل يؤكد أو يؤكد جزئياً الادعاء الأساسي، أو تتعارض المصادر المنتقاة في التفاصيل الرئيسية.

منخفض: لا يؤكد أي مصدر منتقى مستقل الادعاء، أو يؤكده فقط مصادر حزبية أو تابعة للدولة، أو تظل التفاصيل الرئيسية غير مؤكدة.

تعكس هذه المعايير التوازن التحريري لا التوازن الميكانيكي. يُحدَّد مستوى الثقة بناءً على جودة الأدلة المتاحة وكميتها، لا بناءً على مصدر الادعاء.`,
  },
  balance: {
    title: "اختبار الحياد",
    body: `للتحقق من أن الأداة تطبق معايير متسقة بصرف النظر عن الجانب الذي يأتي منه الادعاء، تُجرى اختبارات حياد ربع سنوية.

يتكون كل اختبار من أزواج متطابقة من الادعاءات — أحدها من مصدر فلسطيني/عربي وآخر مكافئ هيكلياً من مصدر إسرائيلي — تُرسل إلى الأداة بشكل مستقل. تُقارن النتائج عبر أربع فئات: الضحايا والبنية التحتية والإحصاءات والبيانات الدبلوماسية.

إذا تم تحديد تناقض، يُحقق في السبب الجذري ويُنفَّذ تصحيح. تُحتفظ بجميع سجلات الاختبارات وتُنشر النتائج في سجل التغييرات على palizra.org.

الاختبار الأول: الربع الثالث من 2026.`,
  },
  corrections: {
    title: "التصحيحات والتحديثات",
    body: `يلتزم محلل بالزرا بتصحيح الأخطاء بشفافية وفقاً لمعايير IFCN.

إذا تم تحديد خطأ في تحليل منشور، سواء من قِبل المؤلف أو بلّغ عنه قارئ، تُتخذ الخطوات التالية:

1. يُقيَّم الخطأ وإذا تأكد يُصحَّح في أقرب وقت ممكن.
2. يُحدَّث التحليل المنشور بإشعار تحديث مرئي يذكر تاريخ التصحيح وطبيعة التغيير.
3. يُوثَّق التصحيح في سجل التصحيحات العام على palizra.org/corrections.

يمكن الإبلاغ عن الأخطاء عبر زر "الإبلاغ عن مشكلة" في كل تحليل منشور، أو عبر البريد الإلكتروني على palizra@proton.me.`,
  },
};

CONTENT.he = {
  how: {
    title: "כיצד הכלי עובד",
    body: `פליזרה אנלייזר הוא כלי לבדיקת עובדות בסיוע בינה מלאכותית עבור טענות ותמונות הקשורות לסכסוך הישראלי-פלסטיני. הוא אינו מוציא פסקי דין פשוטים של נכון/לא נכון. במקום זאת, הוא מפרק טקסט ליחידות ברות אימות ומשווה אותן על פני מקורות עצמאיים.

תהליך הניתוח מורכב מארבעה שלבים:

1. חילוץ טענות — הכלי מפרק את הטקסט לטענות בודדות, ומסווג כל אחת כעובדה ברת אימות, ציטוט/הצהרה, פרשנות, או טענה שלא ניתן לאמת.

2. בדיקת עקביות פנימית — הכלי בודק האם טענות בתוך אותו טקסט סותרות זו את זו מבחינת תאריכים, מספרים או היגיון.

3. השוואת מקורות — עבור כל עובדה ברת אימות, הכלי מחפש במקורות עצמאיים מאוצרים ומשווה מה כל מקור אומר, תוך זיהוי הסכמה, סתירות והבדלי מסגור.

4. הקצאת רמת ביטחון — בהתבסס על הראיות שנאספו, הכלי מקצה רמת ביטחון (גבוהה, בינונית או נמוכה) לפי קריטריונים מפורשים (ראה סעיף 3).

לתמונות, הכלי מבצע בנוסף חיפוש תמונה הפוך, הערכת גיאולוקציה, ניתוח מטאדאטה EXIF וזיהוי יצירה על ידי בינה מלאכותית.`,
  },
  sources: {
    title: "בחירת מקורות",
    body: `מקורות נבחרים לפי הקריטריונים הבאים, המיושמים באופן עקבי על כל הגופים ללא קשר לצד הסכסוך שהם קשורים אליו:

1. עצמאות עיתונאית — המקור חייב להיות חופשי מבקרת ממשלתית או מדינתית ואסור שיממומן על ידי צד בסכסוך.

2. שיא בדיקת עובדות — למקור חייב להיות שיא מתועד של דיוק ותיקונים.

3. כיסוי גיאוגרפי ולשוני — רשימת המקורות חייבת לכלול גופים המכסים את שני צדי הסכסוך.

4. אמינות מוסדית — לנתוני זכויות אדם, המקור חייב להיות ארגון בינלאומי או אזורי מוכר.

רשימת המקורות המאוצרת נסקרת מדי רבעון. הרשימה המלאה ותיעוד הביקורת זמינים בכתובת palizra.org/analyses.

מקורות המוחרגים במפורש: גופים הנשלטים על ידי ממשלה או ממומנים על ידי המדינה, מקורות עם הטיה שיטתית מתועדת.`,
  },
  confidence: {
    title: "קריטריוני רמת הביטחון",
    body: `רמות הביטחון מוקצות לפי הקריטריונים המפורשים הבאים, המיושמים באופן עקבי ללא קשר למקור הטענה:

גבוהה: לפחות 2 מקורות עצמאיים מאוצרים מאשרים את הטענה המרכזית, ואף מקור מאוצר אינו סותר אותה ישירות.

בינונית: לפחות מקור עצמאי מאוצר אחד מאשר או מאשר חלקית את הטענה המרכזית, או שמקורות מאוצרים מתנגשים בפרטים מרכזיים.

נמוכה: אף מקור עצמאי מאוצר אינו מאשר את הטענה, או שהיא מאושרת רק על ידי מקורות מפלגתיים או הקשורים למדינה, או שפרטים מרכזיים נותרים לא מאומתים.

קריטריונים אלה משקפים איזון עיתונאי, לא איזון מכאני. רמת הביטחון נקבעת על פי איכות וכמות הראיות הזמינות, לא על פי מקור הטענה.`,
  },
  balance: {
    title: "בדיקת נייטרליות",
    body: `כדי לוודא שהכלי מיישם סטנדרטים עקביים ללא קשר לצד שממנו מגיעה הטענה, מתבצעות בדיקות נייטרליות רבעוניות.

כל בדיקה מורכבת מזוגות מותאמים של טענות — אחת ממקור פלסטיני/ערבי ואחת שוות ערך מבנית ממקור ישראלי — המוגשות לכלי באופן עצמאי. התוצאות מושוות על פני ארבע קטגוריות: נפגעים, תשתיות, סטטיסטיקות והצהרות דיפלומטיות.

אם מזוהה אי-עקביות, מחקרת הסיבה ומיושם תיקון. כל רשומות הבדיקות נשמרות והתוצאות מתפרסמות בסגל השינויים ב-palizra.org.

בדיקה ראשונה: רבעון שלישי 2026.`,
  },
  corrections: {
    title: "תיקונים ועדכונים",
    body: `פליזרה אנלייזר מחויב לתיקון שגיאות בשקיפות בהתאם לתקני IFCN.

אם מזוהה שגיאה בניתוח מפורסם — בין אם על ידי המחבר או שדווח עליה על ידי קורא — ננקטים הצעדים הבאים:

1. השגיאה מוערכת ואם מאושרת, מתוקנת בהקדם האפשרי.
2. הניתוח המפורסם מעודכן עם הודעת עדכון גלויה המציינת את תאריך התיקון ואת אופי השינוי.
3. התיקון מתועד ביומן התיקונים הציבורי ב-palizra.org/corrections.

ניתן לדווח על שגיאות דרך כפתור "דווח על בעיה" בכל ניתוח מפורסם, או בדואר אלקטרוני בכתובת palizra@proton.me.`,
  },
};

export default function MethodologyPage() {
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  function detectBrowserLang() {
    const supported = ["sk", "en", "ar", "he"];
    const browserLangs = navigator.languages || [navigator.language || "en"];
    for (const bl of browserLangs) {
      const code = bl.split("-")[0].toLowerCase();
      if (supported.includes(code)) return code;
    }
    return "en";
  }
  const [lang, setLang] = useState(
    urlLang && ["sk","en","ar","he"].includes(urlLang) ? urlLang : detectBrowserLang()
  );
  const u = UI[lang] || UI.en;
  const c = CONTENT[lang] || CONTENT.en;
  const isRTL = lang === "ar" || lang === "he";

  const sectionStyle = {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: `1px solid ${COLORS.line}`,
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} lang={lang}
      style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: "'Iowan Old Style', Georgia, serif", background: COLORS.paper, color: COLORS.ink, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: 24, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.inkSoft, fontFamily: "monospace" }}>{u.subtitle}</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: "6px 0 4px" }}>{u.title}</h1>
          <p style={{ fontSize: 14, color: COLORS.inkSoft, margin: "0 0 4px", lineHeight: 1.6 }}>{u.desc}</p>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href={`/?lang=${lang}`} style={{ fontSize: 13, color: COLORS.inkSoft }}>{u.back}</a>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.line }}>|</span>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.inkSoft }}>{u.version}</span>
          </div>
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

      {/* Obsah */}
      <div style={{ marginBottom: 28, padding: "12px 16px", background: "#fff", border: `1px solid ${COLORS.line}`, borderRadius: 4 }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.inkSoft, marginBottom: 8, letterSpacing: "0.06em" }}>{u.toc.toUpperCase()}</div>
        {u.sections.map((s, i) => (
          <a key={s.id} href={`#${s.id}`}
            style={{ display: "block", fontSize: 14, color: COLORS.ink, marginBottom: 4, textDecoration: "none" }}>
            {i + 1}. {s.title}
          </a>
        ))}
      </div>

      {/* Sekcie */}
      {u.sections.map((s, i) => {
        const content = c[s.id];
        if (!content) return null;
        return (
          <div key={s.id} id={s.id} style={sectionStyle}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
              {i + 1}. {s.title}
            </h2>
            {content.body.split("\n\n").map((para, pi) => (
              <p key={pi} style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 10, color: COLORS.ink }}>
                {para}
              </p>
            ))}
          </div>
        );
      })}

      <footer style={{ marginTop: 32, paddingTop: 14, borderTop: `1px solid ${COLORS.line}`, fontSize: 12, color: COLORS.inkSoft, textAlign: "center" }}>
        © {new Date().getFullYear()} Palizra Analyzator ·{" "}
        <a href={`/?lang=${lang}`} style={{ color: COLORS.inkSoft }}>{u.back}</a> ·{" "}
        <a href={`/corrections?lang=${lang}`} style={{ color: COLORS.inkSoft }}>
          {lang === "ar" ? "التصحيحات" : lang === "he" ? "תיקונים" : lang === "en" ? "Corrections" : "Opravy"}
        </a>
      </footer>
    </div>
  );
}
