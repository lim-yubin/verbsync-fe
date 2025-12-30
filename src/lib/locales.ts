// ISO 639-1 언어 코드 및 이름 목록
export const SUPPORTED_LOCALES = [
  { code: "en", nameKo: "영어", nameEn: "English" },
  { code: "ko", nameKo: "한국어", nameEn: "Korean" },
  { code: "ja", nameKo: "일본어", nameEn: "Japanese" },
  { code: "zh", nameKo: "중국어", nameEn: "Chinese" },
  { code: "es", nameKo: "스페인어", nameEn: "Spanish" },
  { code: "fr", nameKo: "프랑스어", nameEn: "French" },
  { code: "de", nameKo: "독일어", nameEn: "German" },
  { code: "pt", nameKo: "포르투갈어", nameEn: "Portuguese" },
  { code: "ru", nameKo: "러시아어", nameEn: "Russian" },
  { code: "it", nameKo: "이탈리아어", nameEn: "Italian" },
  { code: "ar", nameKo: "아랍어", nameEn: "Arabic" },
  { code: "hi", nameKo: "힌디어", nameEn: "Hindi" },
  { code: "th", nameKo: "태국어", nameEn: "Thai" },
  { code: "vi", nameKo: "베트남어", nameEn: "Vietnamese" },
  { code: "id", nameKo: "인도네시아어", nameEn: "Indonesian" },
  { code: "tr", nameKo: "터키어", nameEn: "Turkish" },
  { code: "pl", nameKo: "폴란드어", nameEn: "Polish" },
  { code: "nl", nameKo: "네덜란드어", nameEn: "Dutch" },
  { code: "sv", nameKo: "스웨덴어", nameEn: "Swedish" },
  { code: "da", nameKo: "덴마크어", nameEn: "Danish" },
] as const;

/**
 * 현재 언어에 따라 언어 이름을 반환합니다.
 * @param locale - 언어 객체
 * @param currentLang - 현재 언어 코드 ("ko" | "en")
 * @returns 언어 이름
 */
export function getLocaleName(
  locale: (typeof SUPPORTED_LOCALES)[number],
  currentLang: string
): string {
  return currentLang === "ko" ? locale.nameKo : locale.nameEn;
}

/**
 * 언어 코드로 SUPPORTED_LOCALES에서 언어를 찾아 현재 언어에 맞는 이름을 반환합니다.
 * @param code - 언어 코드
 * @param currentLang - 현재 언어 코드 ("ko" | "en")
 * @returns 언어 이름 (찾지 못한 경우 code 반환)
 */
export function getLocaleNameByCode(code: string, currentLang: string): string {
  const locale = SUPPORTED_LOCALES.find((l) => l.code === code);
  if (!locale) return code;
  return getLocaleName(locale, currentLang);
}
