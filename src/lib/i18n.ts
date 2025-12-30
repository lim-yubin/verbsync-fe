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
  });

export default i18n;

