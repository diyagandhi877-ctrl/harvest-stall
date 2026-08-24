/* ============================================================
   Harvest Stall — language support (English / Hindi / Marathi)
   Usage: add data-i18n="key" to any element's text, or
   data-i18n-placeholder="key" for input placeholders, then call
   I18n.apply() after changing I18n.current.
   ============================================================ */
const I18N_DICT = {
  en: {
    "nav.searchPlaceholder": "Search for mangoes, spinach, ginger…",
    "nav.login": "Login",
    "nav.cart": "Cart",
    "nav.addProduce": "+ Add produce",
    "nav.wishlist": "Wishlist",
    "nav.orders": "My Orders",
    "nav.profile": "Profile",
    "nav.logout": "Logout",
    "hero.eyebrow": "Fresh from the farm · priced by weight",
    "hero.title1": "Whatever's",
    "hero.title2": "in season, today.",
    "hero.sub": "Fresh fruit and vegetables from growers near you — nutrition you can see, prices you can trust, delivered by weight.",
    "hero.shopNow": "Shop today's stock",
    "hero.becomeFarmer": "Sell on Harvest Stall",
    "stock.title": "Today's stock",
    "pricing.title": "Pricing at a glance",
    "pricing.sub": "Every item, three weights, honest prices.",
    "contact.title": "Get in touch",
    "contact.sub": "Questions about an order, a delivery, or joining as a farmer — we're here.",
    "contact.formTitle": "Send us a message",
    "contact.name": "Your name",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.message": "Message",
    "contact.send": "Send message",
    "footer.about": "About",
    "footer.aboutText": "A marketplace connecting local farmers directly with your kitchen — fresh produce, fair prices, priced honestly by weight.",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms & Conditions",
    "footer.faq": "FAQ",
    "footer.rights": "All rights reserved."
  },
  hi: {
    "nav.searchPlaceholder": "आम, पालक, अदरक खोजें…",
    "nav.login": "लॉग इन करें",
    "nav.cart": "कार्ट",
    "nav.addProduce": "+ उत्पाद जोड़ें",
    "nav.wishlist": "इच्छा-सूची",
    "nav.orders": "मेरे ऑर्डर",
    "nav.profile": "प्रोफ़ाइल",
    "nav.logout": "लॉग आउट",
    "hero.eyebrow": "खेत से ताज़ा · वज़न के अनुसार कीमत",
    "hero.title1": "जो भी हो",
    "hero.title2": "मौसम में, आज।",
    "hero.sub": "आपके पास के किसानों से ताज़े फल और सब्ज़ियाँ — पोषण जो आप देख सकें, कीमतें जिन पर भरोसा हो, वज़न के अनुसार डिलीवर।",
    "hero.shopNow": "आज का स्टॉक देखें",
    "hero.becomeFarmer": "Harvest Stall पर बेचें",
    "stock.title": "आज का स्टॉक",
    "pricing.title": "एक नज़र में कीमतें",
    "pricing.sub": "हर उत्पाद, तीन वज़न, ईमानदार कीमतें।",
    "contact.title": "संपर्क करें",
    "contact.sub": "ऑर्डर, डिलीवरी या किसान के रूप में जुड़ने से जुड़े सवाल — हम यहाँ हैं।",
    "contact.formTitle": "हमें संदेश भेजें",
    "contact.name": "आपका नाम",
    "contact.email": "ईमेल",
    "contact.phone": "फ़ोन",
    "contact.message": "संदेश",
    "contact.send": "संदेश भेजें",
    "footer.about": "हमारे बारे में",
    "footer.aboutText": "स्थानीय किसानों को सीधे आपकी रसोई से जोड़ने वाला बाज़ार — ताज़ी उपज, उचित कीमतें, वज़न के अनुसार ईमानदार मूल्य।",
    "footer.company": "कंपनी",
    "footer.legal": "कानूनी",
    "footer.contact": "संपर्क",
    "footer.privacy": "गोपनीयता नीति",
    "footer.terms": "नियम व शर्तें",
    "footer.faq": "सामान्य प्रश्न",
    "footer.rights": "सर्वाधिकार सुरक्षित।"
  },
  mr: {
    "nav.searchPlaceholder": "आंबा, पालक, आले शोधा…",
    "nav.login": "लॉग इन करा",
    "nav.cart": "कार्ट",
    "nav.addProduce": "+ उत्पादन जोडा",
    "nav.wishlist": "इच्छा-यादी",
    "nav.orders": "माझ्या ऑर्डर",
    "nav.profile": "प्रोफाइल",
    "nav.logout": "लॉग आउट",
    "hero.eyebrow": "शेतातून ताजे · वजनानुसार किंमत",
    "hero.title1": "जे काही असेल",
    "hero.title2": "हंगामात, आज.",
    "hero.sub": "तुमच्या जवळच्या शेतकऱ्यांकडून ताजी फळे आणि भाज्या — पाहता येईल असे पोषण, विश्वास ठेवता येतील अशा किंमती, वजनानुसार वितरण.",
    "hero.shopNow": "आजचा साठा पहा",
    "hero.becomeFarmer": "Harvest Stall वर विका",
    "stock.title": "आजचा साठा",
    "pricing.title": "एका दृष्टीक्षेपात किंमती",
    "pricing.sub": "प्रत्येक वस्तू, तीन वजने, प्रामाणिक किंमती.",
    "contact.title": "संपर्क साधा",
    "contact.sub": "ऑर्डर, डिलिव्हरी किंवा शेतकरी म्हणून सामील होण्याबद्दल प्रश्न — आम्ही इथे आहोत.",
    "contact.formTitle": "आम्हाला संदेश पाठवा",
    "contact.name": "तुमचे नाव",
    "contact.email": "ईमेल",
    "contact.phone": "फोन",
    "contact.message": "संदेश",
    "contact.send": "संदेश पाठवा",
    "footer.about": "आमच्याबद्दल",
    "footer.aboutText": "स्थानिक शेतकऱ्यांना थेट तुमच्या स्वयंपाकघराशी जोडणारे बाजारपेठ — ताजा माल, योग्य किंमती, वजनानुसार प्रामाणिक दर.",
    "footer.company": "कंपनी",
    "footer.legal": "कायदेशीर",
    "footer.contact": "संपर्क",
    "footer.privacy": "गोपनीयता धोरण",
    "footer.terms": "अटी व शर्ती",
    "footer.faq": "वारंवार विचारले जाणारे प्रश्न",
    "footer.rights": "सर्व हक्क राखीव."
  }
};

const I18n = {
  current: localStorage.getItem("hs_lang") || "en",

  t(key){
    return (I18N_DICT[this.current] && I18N_DICT[this.current][key]) || I18N_DICT.en[key] || key;
  },

  setLang(lang){
    if (!I18N_DICT[lang]) return;
    this.current = lang;
    localStorage.setItem("hs_lang", lang);
    this.apply();
  },

  apply(){
    document.documentElement.setAttribute("lang", this.current);
    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = this.t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      el.setAttribute("placeholder", this.t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll(".lang-select").forEach(sel => { sel.value = this.current; });
  }
};

document.addEventListener("DOMContentLoaded", () => I18n.apply());
