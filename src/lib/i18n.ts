import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ko from "@/locales/ko.json";
import en from "@/locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: {
        translation: ko,
      },
      en: {
        translation: en,
      },
    },
    fallbackLng: "ko",
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "verbsync-language",
    },
  })
  .then(() => {
    // 초기화 완료 후 HTML lang 속성 및 메타 태그 업데이트
    updateHtmlLang(i18n.language);
  });

// HTML lang 속성 및 메타 태그 업데이트 함수
function updateHtmlLang(language: string) {
  // HTML lang 속성 업데이트
  document.documentElement.lang = language;

  // i18n이 초기화된 후에만 번역 키 사용 가능
  if (i18n.isInitialized) {
    // 메타 description 업데이트
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", i18n.t("common.metaDescription"));

    // 메타 title 업데이트
    const title = document.querySelector("title");
    if (title) {
      title.textContent = i18n.t("common.metaTitle");
    }
  }
}

// 언어 변경 시 업데이트
i18n.on("languageChanged", (language) => {
  updateHtmlLang(language);
});

export default i18n;

