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
    subtitle: "PALIZRA ANALYZATOR · OCHRANA OSOBNÝCH ÚDAJOV",
    title: "Ochrana osobných údajov",
    desc: "Transparentný popis toho, aké osobné údaje Palizra Analyzator spracúva, na aký účel a aké máte práva, v súlade s GDPR.",
    back: "← Späť na nástroj",
    version: "Verzia: 1.0 · August 2026",
    toc: "Obsah",
    sections: [
      { id: "controller", title: "Prevádzkovateľ" },
      { id: "data_collected", title: "Aké údaje spracúvame" },
      { id: "purposes", title: "Účel a právny základ" },
      { id: "third_parties", title: "Tretie strany a príjemcovia" },
      { id: "retention", title: "Uchovávanie údajov" },
      { id: "rights", title: "Vaše práva" },
      { id: "security", title: "Zabezpečenie" },
      { id: "contact", title: "Kontakt" },
    ],
  },
  en: {
    subtitle: "PALIZRA ANALYZATOR · PRIVACY POLICY",
    title: "Privacy Policy",
    desc: "A transparent description of what personal data Palizra Analyzator processes, for what purpose, and what rights you have, in accordance with the GDPR.",
    back: "← Back to tool",
    version: "Version: 1.0 · August 2026",
    toc: "Contents",
    sections: [
      { id: "controller", title: "Data controller" },
      { id: "data_collected", title: "What data we process" },
      { id: "purposes", title: "Purpose and legal basis" },
      { id: "third_parties", title: "Third parties and recipients" },
      { id: "retention", title: "Data retention" },
      { id: "rights", title: "Your rights" },
      { id: "security", title: "Security" },
      { id: "contact", title: "Contact" },
    ],
  },
  ar: {
    subtitle: "محلل بالزرا · سياسة الخصوصية",
    title: "سياسة الخصوصية",
    desc: "وصف شفاف للبيانات الشخصية التي يعالجها محلل بالزرا، والغرض منها، وحقوقك، وفقاً للائحة العامة لحماية البيانات (GDPR).",
    back: "← العودة إلى الأداة",
    version: "الإصدار: 1.0 · أغسطس 2026",
    toc: "المحتويات",
    sections: [
      { id: "controller", title: "المتحكم بالبيانات" },
      { id: "data_collected", title: "ما هي البيانات التي نعالجها" },
      { id: "purposes", title: "الغرض والأساس القانوني" },
      { id: "third_parties", title: "الأطراف الثالثة والمستلمون" },
      { id: "retention", title: "الاحتفاظ بالبيانات" },
      { id: "rights", title: "حقوقك" },
      { id: "security", title: "الأمان" },
      { id: "contact", title: "اتصل بنا" },
    ],
  },
  he: {
    subtitle: "פליזרה אנלייזר · מדיניות פרטיות",
    title: "מדיניות פרטיות",
    desc: "תיאור שקוף של הנתונים האישיים שפליזרה אנלייזר מעבד, למטרה מה, ואילו זכויות יש לך, בהתאם לתקנה הכללית להגנת נתונים (GDPR).",
    back: "← חזרה לכלי",
    version: "גרסה: 1.0 · אוגוסט 2026",
    toc: "תוכן עניינים",
    sections: [
      { id: "controller", title: "מבקר הנתונים" },
      { id: "data_collected", title: "אילו נתונים אנו מעבדים" },
      { id: "purposes", title: "מטרה ובסיס משפטי" },
      { id: "third_parties", title: "צדדים שלישיים ומקבלים" },
      { id: "retention", title: "שמירת נתונים" },
      { id: "rights", title: "הזכויות שלך" },
      { id: "security", title: "אבטחה" },
      { id: "contact", title: "צור קשר" },
    ],
  },
};

const CONTENT = {
  en: {
    controller: {
      title: "Data controller",
      body: `The data controller for this website and tool is Peter Šrámka, an individual based in Slovakia, operating Palizra Analyzator as a personal project without institutional affiliation (see the Organizational Status section of the Palizra Source Audit document for details).

Contact: palizra@proton.me`,
    },
    data_collected: {
      title: "What data we process",
      body: `Palizra Analyzator processes the following categories of personal data:

Claim text and images submitted for analysis — the text or image you submit for fact-checking is sent to Anthropic's Claude API and to search providers to generate an analysis. This content is not linked to your identity unless you choose to include personal information within it.

Suggestion form data (/suggest) — if you submit a suggestion for a claim to be verified, we collect the claim text, an optional source URL, an optional image, and an optional email address. The email address, if provided, is used only to notify you when the status of your suggestion changes.

Technical and log data — like most websites, our server temporarily processes IP addresses for rate limiting (to prevent abuse) and for error monitoring. This data is not used for tracking or profiling individuals.

We do not use cookies for analytics or advertising, and we do not currently use any website analytics tool (such as Google Analytics or similar).`,
    },
    purposes: {
      title: "Purpose and legal basis",
      body: `We process personal data for the following purposes, relying on the legal bases available under the EU General Data Protection Regulation (GDPR):

Providing the fact-checking analysis you request — legitimate interest (Art. 6(1)(f) GDPR) in operating a public-interest fact-checking tool.

Sending status notifications about a submitted suggestion, where an email address was provided — consent (Art. 6(1)(a) GDPR), given voluntarily by providing the email address; the email field is optional and this processing does not occur if it is left blank.

Preventing abuse and securing the service, through rate limiting and error monitoring — legitimate interest (Art. 6(1)(f) GDPR) in the security and integrity of the service.`,
    },
    third_parties: {
      title: "Third parties and recipients",
      body: `To provide the service, submitted content and limited technical data are shared with the following processors:

Anthropic (Claude API) — processes claim text and images to generate the analysis.

Search providers (e.g. SerpAPI) — process search queries derived from submitted claims to locate relevant sources.

Resend — processes your email address, where provided, to deliver suggestion status notification emails.

Sentry — processes technical error data (such as browser type and error messages) to help identify and fix bugs. Sensitive request headers (such as administrative access keys) are explicitly excluded from what is sent to Sentry.

Vercel, Railway, and Cloudflare — provide hosting, content delivery, and DNS services for the website and backend.

Some of these providers are based outside the European Economic Area, in particular the United States. Where this is the case, we rely on the safeguards each provider has in place (such as Standard Contractual Clauses) to ensure an adequate level of data protection. As an individually operated project, Palizra Analyzator relies on each provider's own published compliance documentation rather than conducting independent audits.

We do not sell or rent personal data to any third party, and we do not use it for advertising purposes.`,
    },
    retention: {
      title: "Data retention",
      body: `Suggestion data, including any email address provided, is retained for up to 12 months after submission, after which it is deleted unless retaining it longer is necessary to resolve an ongoing correction or dispute.

Technical log data used for rate limiting is retained only briefly (typically minutes to hours) and is not stored long-term.

Error monitoring data held by Sentry is retained according to Sentry's own default retention settings.`,
    },
    rights: {
      title: "Your rights",
      body: `If you are located in the European Economic Area, you have the following rights under the GDPR regarding your personal data:

Right of access — to obtain confirmation of, and access to, the personal data we hold about you.

Right to rectification — to have inaccurate personal data corrected.

Right to erasure — to request deletion of your personal data, subject to certain exceptions.

Right to restriction of processing — to request that we limit how your data is used in certain circumstances.

Right to object — to object to processing based on legitimate interest.

Right to withdraw consent — where processing is based on consent (such as an email address provided for notifications), you may withdraw it at any time without affecting the lawfulness of processing before withdrawal.

Right to lodge a complaint — with the Slovak Office for Personal Data Protection (Úrad na ochranu osobných údajov SR, dataprotection.gov.sk), or with the data protection authority in your own country of residence.

To exercise any of these rights, contact palizra@proton.me.`,
    },
    security: {
      title: "Security",
      body: `Palizra Analyzator applies reasonable technical measures to protect the data it processes, including encrypted connections (HTTPS), rate limiting on all endpoints, restricted administrative access, and exclusion of sensitive data from error monitoring logs.

As an individually operated project without dedicated security staff, these measures reflect what is reasonably achievable at this stage of the project. They are reviewed and improved on an ongoing basis; see the Security Testing section of the Palizra Source Audit document for details of testing conducted.`,
    },
    contact: {
      title: "Contact",
      body: `Questions about this Privacy Policy, or requests relating to your personal data, can be sent to: palizra@proton.me

This policy was last updated in August 2026 and may be revised as the project develops. Any changes will be documented in the public Changelog at palizra.org.`,
    },
  },
};

CONTENT.sk = {
  controller: {
    title: "Prevádzkovateľ",
    body: `Prevádzkovateľom tejto webovej stránky a nástroja je Peter Šrámka, fyzická osoba so sídlom na Slovensku, ktorá prevádzkuje Palizra Analyzator ako osobný projekt bez inštitucionálneho zastrešenia (podrobnosti nájdete v sekcii Organizačný status v dokumente Palizra Source Audit).

Kontakt: palizra@proton.me`,
  },
  data_collected: {
    title: "Aké údaje spracúvame",
    body: `Palizra Analyzator spracúva tieto kategórie osobných údajov:

Text tvrdení a obrázky odoslané na analýzu — text alebo obrázok, ktorý odošlete na overenie, sa posiela do Claude API od Anthropic a do vyhľadávacích poskytovateľov na vygenerovanie analýzy. Tento obsah nie je spojený s vašou identitou, pokiaľ doňho sami nezahrniete osobné údaje.

Údaje z formulára návrhov (/suggest) — ak odošlete návrh na overenie tvrdenia, zbierame text tvrdenia, nepovinnú URL adresu zdroja, nepovinný obrázok a nepovinnú emailovú adresu. Emailová adresa, ak je uvedená, sa používa výlučne na upozornenie o zmene stavu vášho návrhu.

Technické a logovacie údaje — podobne ako väčšina webových stránok, náš server dočasne spracúva IP adresy na účely rate limitingu (ochrana pred zneužitím) a monitorovania chýb. Tieto údaje sa nepoužívajú na sledovanie ani profilovanie osôb.

Nepoužívame cookies na analytické ani reklamné účely a momentálne nepoužívame žiadny analytický nástroj (napr. Google Analytics ani podobný).`,
  },
  purposes: {
    title: "Účel a právny základ",
    body: `Osobné údaje spracúvame na tieto účely, s oporou o právne základy podľa Všeobecného nariadenia o ochrane osobných údajov (GDPR):

Poskytnutie fact-checkingovej analýzy, o ktorú požiadate — oprávnený záujem (čl. 6 ods. 1 písm. f) GDPR) na prevádzkovaní fact-checkingového nástroja vo verejnom záujme.

Zasielanie upozornení o stave odoslaného návrhu, ak bola uvedená emailová adresa — súhlas (čl. 6 ods. 1 písm. a) GDPR), udelený dobrovoľne uvedením emailovej adresy; pole emailu je nepovinné a toto spracúvanie sa neuskutočňuje, ak zostane prázdne.

Predchádzanie zneužitiu a zabezpečenie služby prostredníctvom rate limitingu a monitorovania chýb — oprávnený záujem (čl. 6 ods. 1 písm. f) GDPR) na bezpečnosti a integrite služby.`,
  },
  third_parties: {
    title: "Tretie strany a príjemcovia",
    body: `Na poskytnutie služby sa odoslaný obsah a obmedzené technické údaje zdieľajú s týmito spracovateľmi:

Anthropic (Claude API) — spracúva text tvrdení a obrázky na vygenerovanie analýzy.

Vyhľadávací poskytovatelia (napr. SerpAPI) — spracúvajú vyhľadávacie dotazy odvodené z odoslaných tvrdení na nájdenie relevantných zdrojov.

Resend — spracúva vašu emailovú adresu, ak je uvedená, na doručenie emailov s upozornením na stav návrhu.

Sentry — spracúva technické údaje o chybách (napr. typ prehliadača, chybové hlásenia) na pomoc pri identifikácii a oprave chýb. Citlivé hlavičky requestov (napr. administrátorské prístupové kľúče) sú z dát odosielaných do Sentry výslovne vylúčené.

Vercel, Railway a Cloudflare — poskytujú hosting, distribúciu obsahu a DNS služby pre webovú stránku a backend.

Niektorí z týchto poskytovateľov sídlia mimo Európskeho hospodárskeho priestoru, najmä v USA. V takom prípade sa spoliehame na záruky, ktoré má daný poskytovateľ zavedené (napr. štandardné zmluvné doložky), na zabezpečenie primeranej úrovne ochrany údajov. Ako projekt jednej osoby sa Palizra Analyzator spolieha na vlastnú zverejnenú dokumentáciu súladu jednotlivých poskytovateľov, nie na nezávislé audity.

Osobné údaje nepredávame ani neprenajímame žiadnej tretej strane a nepoužívame ich na reklamné účely.`,
  },
  retention: {
    title: "Uchovávanie údajov",
    body: `Údaje z návrhov, vrátane prípadnej emailovej adresy, uchovávame maximálne 12 mesiacov od odoslania, po uplynutí ktorých sa vymažú, pokiaľ ich dlhšie uchovávanie nie je potrebné na vyriešenie prebiehajúcej opravy alebo sporu.

Technické logovacie údaje používané na rate limiting sa uchovávajú len krátko (spravidla minúty až hodiny) a neukladajú sa dlhodobo.

Údaje o chybách v Sentry sa uchovávajú podľa predvolených nastavení uchovávania Sentry.`,
  },
  rights: {
    title: "Vaše práva",
    body: `Ak sa nachádzate v Európskom hospodárskom priestore, máte podľa GDPR ohľadom svojich osobných údajov tieto práva:

Právo na prístup — získať potvrdenie o tom, či spracúvame vaše osobné údaje, a prístup k nim.

Právo na opravu — na opravu nepresných osobných údajov.

Právo na vymazanie — požiadať o vymazanie svojich osobných údajov, s výnimkou určitých prípadov.

Právo na obmedzenie spracúvania — požiadať o obmedzenie spôsobu, akým vaše údaje používame, za určitých okolností.

Právo namietať — namietať proti spracúvaniu založenému na oprávnenom záujme.

Právo odvolať súhlas — ak je spracúvanie založené na súhlase (napr. emailová adresa uvedená pre upozornenia), môžete ho kedykoľvek odvolať bez toho, aby to malo vplyv na zákonnosť spracúvania pred jeho odvolaním.

Právo podať sťažnosť — na Úrad na ochranu osobných údajov Slovenskej republiky (dataprotection.gov.sk), alebo na úrad na ochranu osobných údajov vo vašej krajine pobytu.

Na uplatnenie ktoréhokoľvek z týchto práv nás kontaktujte na palizra@proton.me.`,
  },
  security: {
    title: "Zabezpečenie",
    body: `Palizra Analyzator uplatňuje primerané technické opatrenia na ochranu spracúvaných údajov, vrátane šifrovaného spojenia (HTTPS), rate limitingu na všetkých endpointoch, obmedzeného administrátorského prístupu a vylúčenia citlivých údajov z logov monitorovania chýb.

Keďže ide o projekt jednej osoby bez vyhradeného bezpečnostného tímu, tieto opatrenia odrážajú to, čo je v tejto fáze projektu reálne dosiahnuteľné. Priebežne sa revidujú a zlepšujú — podrobnosti o vykonanom testovaní nájdete v sekcii Security Testing v dokumente Palizra Source Audit.`,
  },
  contact: {
    title: "Kontakt",
    body: `Otázky týkajúce sa tejto politiky ochrany osobných údajov, alebo žiadosti súvisiace s vašimi osobnými údajmi, môžete zasielať na: palizra@proton.me

Táto politika bola naposledy aktualizovaná v auguste 2026 a môže sa meniť s vývojom projektu. Akékoľvek zmeny budú zdokumentované vo verejnom Changelogu na palizra.org.`,
  },
};

CONTENT.ar = {
  controller: {
    title: "المتحكم بالبيانات",
    body: `المتحكم بالبيانات لهذا الموقع والأداة هو بيتر شرامكا، شخص طبيعي مقيم في سلوفاكيا، يدير محلل بالزرا كمشروع شخصي دون انتماء مؤسسي (راجع قسم الوضع التنظيمي في وثيقة تدقيق مصادر بالزرا للتفاصيل).

للتواصل: palizra@proton.me`,
  },
  data_collected: {
    title: "ما هي البيانات التي نعالجها",
    body: `يعالج محلل بالزرا الفئات التالية من البيانات الشخصية:

نص التصريحات والصور المُرسلة للتحليل — يُرسل النص أو الصورة التي تقدمها للتحقق إلى واجهة برمجة تطبيقات Claude من Anthropic وإلى مزودي البحث لإنشاء التحليل. لا يرتبط هذا المحتوى بهويتك ما لم تُدرج بنفسك معلومات شخصية ضمنه.

بيانات نموذج الاقتراحات (/suggest) — إذا قدمت اقتراحاً للتحقق من تصريح، فإننا نجمع نص التصريح، ورابط مصدر اختياري، وصورة اختيارية، وعنوان بريد إلكتروني اختياري. يُستخدم عنوان البريد الإلكتروني، إن وُجد، فقط لإخطارك عند تغيير حالة اقتراحك.

البيانات التقنية والسجلات — كمعظم المواقع الإلكترونية، يعالج خادمنا مؤقتاً عناوين IP لأغراض تحديد معدل الطلبات (لمنع إساءة الاستخدام) ومراقبة الأخطاء. لا تُستخدم هذه البيانات لتتبع الأفراد أو تنميطهم.

لا نستخدم ملفات تعريف الارتباط (cookies) لأغراض تحليلية أو إعلانية، ولا نستخدم حالياً أي أداة تحليلات للموقع (مثل Google Analytics أو ما شابه).`,
  },
  purposes: {
    title: "الغرض والأساس القانوني",
    body: `نعالج البيانات الشخصية للأغراض التالية، استناداً إلى الأسس القانونية المتاحة بموجب اللائحة العامة لحماية البيانات في الاتحاد الأوروبي (GDPR):

تقديم تحليل التحقق من الحقائق الذي تطلبه — المصلحة المشروعة (المادة 6(1)(و) من GDPR) في تشغيل أداة تحقق من الحقائق للمصلحة العامة.

إرسال إشعارات حول حالة اقتراح مُقدَّم، عند تقديم عنوان بريد إلكتروني — الموافقة (المادة 6(1)(أ) من GDPR)، الممنوحة طوعاً بتقديم عنوان البريد الإلكتروني؛ حقل البريد الإلكتروني اختياري ولا تتم هذه المعالجة إذا تُرك فارغاً.

منع إساءة الاستخدام وتأمين الخدمة، من خلال تحديد معدل الطلبات ومراقبة الأخطاء — المصلحة المشروعة (المادة 6(1)(و) من GDPR) في أمن الخدمة وسلامتها.`,
  },
  third_parties: {
    title: "الأطراف الثالثة والمستلمون",
    body: `لتقديم الخدمة، تتم مشاركة المحتوى المُرسل وبيانات تقنية محدودة مع الجهات المعالجة التالية:

Anthropic (واجهة برمجة تطبيقات Claude) — تعالج نص التصريحات والصور لإنشاء التحليل.

مزودو البحث (مثل SerpAPI) — يعالجون استعلامات البحث المُستمدة من التصريحات المُقدَّمة للعثور على مصادر ذات صلة.

Resend — تعالج عنوان بريدك الإلكتروني، إن وُجد، لتوصيل رسائل إشعار حالة الاقتراح.

Sentry — تعالج بيانات الأخطاء التقنية (مثل نوع المتصفح ورسائل الخطأ) للمساعدة في تحديد الأخطاء وإصلاحها. تُستبعد صراحةً رؤوس الطلبات الحساسة (مثل مفاتيح الوصول الإدارية) مما يُرسل إلى Sentry.

Vercel وRailway وCloudflare — تقدم خدمات الاستضافة وتوصيل المحتوى وDNS للموقع والخادم الخلفي.

يقع بعض هؤلاء المزودين خارج المنطقة الاقتصادية الأوروبية، وخاصة في الولايات المتحدة. في هذه الحالة، نعتمد على الضمانات التي يطبقها كل مزود (مثل البنود التعاقدية القياسية) لضمان مستوى كافٍ من حماية البيانات. بصفته مشروعاً يديره شخص واحد، يعتمد محلل بالزرا على وثائق الامتثال المنشورة الخاصة بكل مزود، بدلاً من إجراء تدقيقات مستقلة.

لا نبيع أو نؤجر البيانات الشخصية لأي طرف ثالث، ولا نستخدمها لأغراض إعلانية.`,
  },
  retention: {
    title: "الاحتفاظ بالبيانات",
    body: `يُحتفظ ببيانات الاقتراحات، بما في ذلك أي عنوان بريد إلكتروني مُقدَّم، لمدة تصل إلى 12 شهراً بعد التقديم، وبعدها تُحذف ما لم يكن الاحتفاظ بها لفترة أطول ضرورياً لحل تصحيح أو نزاع جارٍ.

تُحتفظ بيانات السجلات التقنية المستخدمة لتحديد معدل الطلبات لفترة وجيزة فقط (عادةً دقائق إلى ساعات) ولا تُخزَّن على المدى الطويل.

تُحتفظ بيانات مراقبة الأخطاء لدى Sentry وفقاً لإعدادات الاحتفاظ الافتراضية الخاصة بـ Sentry.`,
  },
  rights: {
    title: "حقوقك",
    body: `إذا كنت مقيماً في المنطقة الاقتصادية الأوروبية، فلديك الحقوق التالية بموجب GDPR فيما يتعلق ببياناتك الشخصية:

حق الوصول — الحصول على تأكيد بشأن البيانات الشخصية التي نحتفظ بها عنك والوصول إليها.

حق التصحيح — تصحيح البيانات الشخصية غير الدقيقة.

حق المحو — طلب حذف بياناتك الشخصية، مع مراعاة استثناءات معينة.

حق تقييد المعالجة — طلب تقييد كيفية استخدامنا لبياناتك في ظروف معينة.

حق الاعتراض — الاعتراض على المعالجة القائمة على المصلحة المشروعة.

حق سحب الموافقة — عندما تستند المعالجة إلى الموافقة (مثل عنوان بريد إلكتروني مُقدَّم للإشعارات)، يمكنك سحبها في أي وقت دون التأثير على مشروعية المعالجة قبل السحب.

حق تقديم شكوى — لدى المكتب السلوفاكي لحماية البيانات الشخصية (Úrad na ochranu osobných údajov SR، dataprotection.gov.sk)، أو لدى هيئة حماية البيانات في بلد إقامتك.

لممارسة أي من هذه الحقوق، تواصل معنا على palizra@proton.me.`,
  },
  security: {
    title: "الأمان",
    body: `يطبق محلل بالزرا تدابير تقنية معقولة لحماية البيانات التي يعالجها، بما في ذلك الاتصالات المشفرة (HTTPS)، وتحديد معدل الطلبات على جميع نقاط النهاية، والوصول الإداري المقيد، واستبعاد البيانات الحساسة من سجلات مراقبة الأخطاء.

بصفته مشروعاً يديره شخص واحد دون فريق أمني مخصص، تعكس هذه التدابير ما يمكن تحقيقه بشكل معقول في هذه المرحلة من المشروع. تُراجَع وتُحسَّن باستمرار؛ راجع قسم اختبار الأمان في وثيقة تدقيق مصادر بالزرا لتفاصيل الاختبارات المُجراة.`,
  },
  contact: {
    title: "اتصل بنا",
    body: `يمكن إرسال الأسئلة حول سياسة الخصوصية هذه، أو الطلبات المتعلقة ببياناتك الشخصية، إلى: palizra@proton.me

تم تحديث هذه السياسة آخر مرة في أغسطس 2026 وقد تُراجَع مع تطور المشروع. سيتم توثيق أي تغييرات في سجل التغييرات العام على palizra.org.`,
  },
};

CONTENT.he = {
  controller: {
    title: "מבקר הנתונים",
    body: `מבקר הנתונים עבור אתר וכלי זה הוא פיטר שראמקא, יחיד המתגורר בסלובקיה, המפעיל את פליזרה אנלייזר כפרויקט אישי ללא זיקה מוסדית (לפרטים ראו את סעיף הסטטוס הארגוני במסמך ביקורת המקורות של פליזרה).

ליצירת קשר: palizra@proton.me`,
  },
  data_collected: {
    title: "אילו נתונים אנו מעבדים",
    body: `פליזרה אנלייזר מעבד את קטגוריות הנתונים האישיים הבאות:

טקסט טענות ותמונות שנשלחו לניתוח — הטקסט או התמונה שאתה שולח לבדיקת עובדות נשלחים ל-Claude API של Anthropic ולספקי חיפוש כדי ליצור ניתוח. תוכן זה אינו מקושר לזהותך אלא אם בחרת לכלול בו מידע אישי.

נתוני טופס הצעות (/suggest) — אם אתה שולח הצעה לאימות טענה, אנו אוספים את טקסט הטענה, קישור מקור אופציונלי, תמונה אופציונלית, וכתובת דוא"ל אופציונלית. כתובת הדוא"ל, אם סופקה, משמשת רק להודיע לך כאשר סטטוס ההצעה שלך משתנה.

נתונים טכניים ויומני מערכת — כמו רוב האתרים, השרת שלנו מעבד באופן זמני כתובות IP לצורך הגבלת קצב (למניעת שימוש לרעה) וניטור שגיאות. נתונים אלה אינם משמשים למעקב או פרופיל של אנשים.

איננו משתמשים בעוגיות (cookies) למטרות אנליטיות או פרסומיות, ואיננו משתמשים כרגע בכל כלי אנליטיקה לאתר (כגון Google Analytics או דומה).`,
  },
  purposes: {
    title: "מטרה ובסיס משפטי",
    body: `אנו מעבדים נתונים אישיים למטרות הבאות, בהתבסס על הבסיסים המשפטיים הזמינים תחת התקנה הכללית להגנת נתונים של האיחוד האירופי (GDPR):

מתן ניתוח בדיקת העובדות שביקשת — אינטרס לגיטימי (סעיף 6(1)(f) ל-GDPR) בהפעלת כלי בדיקת עובדות לטובת הציבור.

שליחת התראות סטטוס בנוגע להצעה שנשלחה, כאשר סופקה כתובת דוא"ל — הסכמה (סעיף 6(1)(a) ל-GDPR), הניתנת מרצון על ידי מתן כתובת הדוא"ל; שדה הדוא"ל אופציונלי ועיבוד זה אינו מתבצע אם הוא נשאר ריק.

מניעת שימוש לרעה ואבטחת השירות, באמצעות הגבלת קצב וניטור שגיאות — אינטרס לגיטימי (סעיף 6(1)(f) ל-GDPR) באבטחת השירות ושלמותו.`,
  },
  third_parties: {
    title: "צדדים שלישיים ומקבלים",
    body: `כדי לספק את השירות, תוכן שנשלח ונתונים טכניים מוגבלים משותפים עם המעבדים הבאים:

Anthropic (Claude API) — מעבדת טקסט טענות ותמונות כדי ליצור את הניתוח.

ספקי חיפוש (כגון SerpAPI) — מעבדים שאילתות חיפוש הנגזרות מטענות שנשלחו כדי לאתר מקורות רלוונטיים.

Resend — מעבדת את כתובת הדוא"ל שלך, אם סופקה, כדי לספק הודעות התראת סטטוס הצעה.

Sentry — מעבדת נתוני שגיאות טכניים (כגון סוג דפדפן והודעות שגיאה) כדי לסייע בזיהוי ותיקון באגים. כותרות בקשה רגישות (כגון מפתחות גישה ניהוליים) מוחרגות במפורש ממה שנשלח ל-Sentry.

Vercel, Railway ו-Cloudflare — מספקים שירותי אחסון, הפצת תוכן ו-DNS עבור האתר והשרת האחורי.

חלק מהספקים הללו ממוקמים מחוץ לאזור הכלכלי האירופי, בפרט בארצות הברית. במקרה זה, אנו מסתמכים על ההגנות שכל ספק מיישם (כגון סעיפים חוזיים סטנדרטיים) כדי להבטיח רמת הגנת נתונים נאותה. כפרויקט המופעל על ידי יחיד, פליזרה אנלייזר מסתמך על תיעוד הציות המפורסם של כל ספק ולא על ביצוע ביקורות עצמאיות.

איננו מוכרים או משכירים נתונים אישיים לכל צד שלישי, ואיננו משתמשים בהם למטרות פרסומיות.`,
  },
  retention: {
    title: "שמירת נתונים",
    body: `נתוני הצעות, כולל כל כתובת דוא"ל שסופקה, נשמרים עד 12 חודשים לאחר השליחה, ולאחר מכן הם נמחקים אלא אם כן שמירתם לתקופה ארוכה יותר נחוצה לפתרון תיקון או מחלוקת מתמשכים.

נתוני יומן טכניים המשמשים להגבלת קצב נשמרים רק לזמן קצר (בדרך כלל דקות עד שעות) ואינם מאוחסנים לטווח ארוך.

נתוני ניטור שגיאות המוחזקים ב-Sentry נשמרים בהתאם להגדרות השמירה המוגדרות כברירת מחדל של Sentry.`,
  },
  rights: {
    title: "הזכויות שלך",
    body: `אם אתה נמצא באזור הכלכלי האירופי, יש לך את הזכויות הבאות תחת ה-GDPR בנוגע לנתונים האישיים שלך:

זכות גישה — לקבל אישור לגבי, וגישה אל, הנתונים האישיים שאנו מחזיקים עליך.

זכות לתיקון — לתקן נתונים אישיים לא מדויקים.

זכות למחיקה — לבקש מחיקת הנתונים האישיים שלך, בכפוף לחריגים מסוימים.

זכות להגבלת עיבוד — לבקש שנגביל כיצד אנו משתמשים בנתונים שלך בנסיבות מסוימות.

זכות להתנגד — להתנגד לעיבוד המבוסס על אינטרס לגיטימי.

זכות לבטל הסכמה — כאשר העיבוד מבוסס על הסכמה (כגון כתובת דוא"ל שסופקה להתראות), תוכל לבטל אותה בכל עת מבלי להשפיע על חוקיות העיבוד לפני הביטול.

זכות להגיש תלונה — לרשות הסלובקית להגנת נתונים אישיים (Úrad na ochranu osobných údajov SR, dataprotection.gov.sk), או לרשות הגנת הנתונים במדינת מגוריך.

כדי לממש כל אחת מהזכויות הללו, צור קשר ב-palizra@proton.me.`,
  },
  security: {
    title: "אבטחה",
    body: `פליזרה אנלייזר מיישם אמצעים טכניים סבירים להגנה על הנתונים שהוא מעבד, כולל חיבורים מוצפנים (HTTPS), הגבלת קצב בכל נקודות הקצה, גישה ניהולית מוגבלת, והחרגת נתונים רגישים מיומני ניטור שגיאות.

כפרויקט המופעל על ידי יחיד ללא צוות אבטחה ייעודי, אמצעים אלה משקפים את מה שניתן להשיג באופן סביר בשלב זה של הפרויקט. הם נבדקים ומשופרים באופן שוטף; ראה את סעיף בדיקות האבטחה במסמך ביקורת המקורות של פליזרה לפרטי הבדיקות שבוצעו.`,
  },
  contact: {
    title: "צור קשר",
    body: `שאלות בנוגע למדיניות פרטיות זו, או בקשות הקשורות לנתונים האישיים שלך, ניתן לשלוח אל: palizra@proton.me

מדיניות זו עודכנה לאחרונה באוגוסט 2026 ועשויה להתעדכן ככל שהפרויקט מתפתח. כל שינוי יתועד ביומן השינויים הציבורי ב-palizra.org.`,
  },
};

export default function PrivacyPage() {
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
        </a> ·{" "}
        <a href={`/methodology?lang=${lang}`} style={{ color: COLORS.inkSoft }}>
          {lang === "ar" ? "المنهجية" : lang === "he" ? "מתודולוגיה" : lang === "en" ? "Methodology" : "Metodológia"}
        </a>
      </footer>
    </div>
  );
}
