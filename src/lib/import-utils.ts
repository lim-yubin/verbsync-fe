import * as XLSX from "xlsx";
import Papa from "papaparse";
import JSZip from "jszip";
import type { TranslationUpdateItem } from "@/types/api";

export interface ParsedImportData {
  keys: Array<{
    name: string;
    description: string | null;
  }>;
  translations: TranslationUpdateItem[];
  locales: string[]; // 파일에서 발견된 언어 코드 목록
}

export interface LocaleMapping {
  code: string;
  name: string;
}

/**
 * 언어 헤더에서 언어 코드 추출
 * "한국어 (ko)" -> "ko"
 * "English (en)" -> "en"
 * "한국어" -> 기존 언어 목록에서 매칭 시도
 */
function extractLocaleCode(
  header: string,
  existingLocales: LocaleMapping[] = []
): string | null {
  const trimmed = header.trim();
  if (!trimmed) return null;

  // 1. "(코드)" 형식에서 코드 추출 시도
  const codeMatch = trimmed.match(/\(([a-z]{2})\)/i);
  if (codeMatch) {
    return codeMatch[1].toLowerCase();
  }

  // 2. 기존 언어 목록에서 이름으로 매칭
  const matched = existingLocales.find(
    (locale) => locale.name === trimmed || locale.code === trimmed.toLowerCase()
  );
  if (matched) {
    return matched.code;
  }

  // 3. 헤더가 이미 코드인 경우 (소문자 2글자)
  if (/^[a-z]{2}$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return null;
}

/**
 * Excel 파일 파싱
 */
export async function parseExcelFile(
  file: File,
  existingLocales: LocaleMapping[] = []
): Promise<ParsedImportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // 첫 번째 시트 사용
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // JSON으로 변환
        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
          header: 1,
          defval: "",
        });

        if (jsonData.length < 2) {
          reject(new Error("파일 형식이 올바르지 않습니다. 최소 2행(헤더 + 데이터)이 필요합니다."));
          return;
        }

        // 첫 번째 행이 헤더
        const headers = jsonData[0];
        if (headers.length < 3) {
          reject(new Error("파일 형식이 올바르지 않습니다. Key, Description, 그리고 최소 1개의 언어 열이 필요합니다."));
          return;
        }

        // 헤더 검증: 첫 번째 열은 Key, 두 번째 열은 Description
        if (headers[0].toLowerCase() !== "key") {
          reject(new Error("첫 번째 열은 'Key'여야 합니다."));
          return;
        }

        // 언어 열 추출 (3번째 열부터)
        const locales: string[] = [];

        // 데이터 행 처리
        const keys: Array<{ name: string; description: string | null }> = [];
        const translations: TranslationUpdateItem[] = [];

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;

          const keyName = String(row[0] || "").trim();
          if (!keyName) continue; // 빈 키는 건너뛰기

          const description = String(row[1] || "").trim() || null;
          keys.push({ name: keyName, description });

          // 각 언어별 번역 값 처리
          for (let j = 2; j < headers.length; j++) {
            const localeHeader = String(headers[j] || "").trim();
            if (!localeHeader) continue;

            // 언어 코드 추출
            const localeCode = extractLocaleCode(localeHeader, existingLocales);
            if (!localeCode) {
              // 언어 코드를 찾을 수 없으면 건너뛰기
              continue;
            }

            if (!locales.includes(localeCode)) {
              locales.push(localeCode);
            }

            const value = String(row[j] || "").trim();
            if (value) {
              translations.push({
                key: keyName,
                locale: localeCode,
                value,
              });
            }
          }
        }

        resolve({ keys, translations, locales });
      } catch (error) {
        reject(error instanceof Error ? error : new Error("파일 파싱 중 오류가 발생했습니다."));
      }
    };

    reader.onerror = () => {
      reject(new Error("파일 읽기 중 오류가 발생했습니다."));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * CSV 파일 파싱
 */
export async function parseCSVFile(
  file: File,
  existingLocales: LocaleMapping[] = []
): Promise<ParsedImportData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as string[][];

          if (data.length < 2) {
            reject(new Error("파일 형식이 올바르지 않습니다. 최소 2행(헤더 + 데이터)이 필요합니다."));
            return;
          }

          // 첫 번째 행이 헤더
          const headers = data[0];
          if (headers.length < 3) {
            reject(new Error("파일 형식이 올바르지 않습니다. Key, Description, 그리고 최소 1개의 언어 열이 필요합니다."));
            return;
          }

          // 헤더 검증
          if (headers[0].toLowerCase() !== "key") {
            reject(new Error("첫 번째 열은 'Key'여야 합니다."));
            return;
          }

          // 언어 열 추출
          const locales: string[] = [];

          // 데이터 행 처리
          const keys: Array<{ name: string; description: string | null }> = [];
          const translations: TranslationUpdateItem[] = [];

          for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            const keyName = String(row[0] || "").trim();
            if (!keyName) continue;

            const description = String(row[1] || "").trim() || null;
            keys.push({ name: keyName, description });

            // 각 언어별 번역 값 처리
            for (let j = 2; j < headers.length; j++) {
              const localeHeader = String(headers[j] || "").trim();
              if (!localeHeader) continue;

              // 언어 코드 추출
              const localeCode = extractLocaleCode(localeHeader, existingLocales);
              if (!localeCode) {
                // 언어 코드를 찾을 수 없으면 건너뛰기
                continue;
              }

              if (!locales.includes(localeCode)) {
                locales.push(localeCode);
              }

              const value = String(row[j] || "").trim();
              if (value) {
                translations.push({
                  key: keyName,
                  locale: localeCode,
                  value,
                });
              }
            }
          }

          resolve({ keys, translations, locales });
        } catch (error) {
          reject(error instanceof Error ? error : new Error("파일 파싱 중 오류가 발생했습니다."));
        }
      },
      error: (error) => {
        reject(new Error(`CSV 파싱 오류: ${error.message}`));
      },
    });
  });
}

/**
 * JSON 파일 파싱 (i18next 형식)
 * @param file JSON 파일 또는 ZIP 파일
 */
export async function parseJSONFile(file: File): Promise<ParsedImportData> {
  if (file.name.endsWith(".zip")) {
    return parseJSONZipFile(file);
  } else {
    return parseSingleJSONFile(file);
  }
}

/**
 * 단일 JSON 파일 파싱
 */
async function parseSingleJSONFile(file: File): Promise<ParsedImportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const translations: Record<string, string> = JSON.parse(content);

        // 파일명에서 언어 코드 추출 (예: "ko.json" -> "ko")
        const fileName = file.name.replace(/\.json$/i, "");
        const localeCode = fileName.toLowerCase();

        // 키 추출
        const keys: Array<{ name: string; description: string | null }> = [];
        const translationItems: TranslationUpdateItem[] = [];

        for (const [key, value] of Object.entries(translations)) {
          if (typeof value === "string" && value.trim()) {
            keys.push({ name: key, description: null });
            translationItems.push({
              key,
              locale: localeCode,
              value: value.trim(),
            });
          }
        }

        resolve({
          keys,
          translations: translationItems,
          locales: [localeCode],
        });
      } catch (error) {
        reject(error instanceof Error ? error : new Error("JSON 파일 파싱 중 오류가 발생했습니다."));
      }
    };

    reader.onerror = () => {
      reject(new Error("파일 읽기 중 오류가 발생했습니다."));
    };

    reader.readAsText(file);
  });
}

/**
 * ZIP 파일에서 JSON 파일들 파싱
 */
async function parseJSONZipFile(file: File): Promise<ParsedImportData> {
  try {
    const zip = await JSZip.loadAsync(file);
    const allKeys: Array<{ name: string; description: string | null }> = [];
    const allTranslations: TranslationUpdateItem[] = [];
    const locales: string[] = [];

    // ZIP 파일 내의 모든 JSON 파일 처리
    const jsonFiles = Object.keys(zip.files).filter((name) =>
      name.endsWith(".json")
    );

    if (jsonFiles.length === 0) {
      throw new Error("ZIP 파일에 JSON 파일이 없습니다.");
    }

    for (const fileName of jsonFiles) {
      const file = zip.files[fileName];
      if (!file || file.dir) continue;

      const content = await file.async("string");
      const translations: Record<string, string> = JSON.parse(content);

      // 파일명에서 언어 코드 추출
      const localeCode = fileName.replace(/\.json$/i, "").toLowerCase();

      if (!locales.includes(localeCode)) {
        locales.push(localeCode);
      }

      // 키 및 번역 추출
      for (const [key, value] of Object.entries(translations)) {
        if (typeof value === "string" && value.trim()) {
          // 키가 이미 추가되지 않았다면 추가
          if (!allKeys.find((k) => k.name === key)) {
            allKeys.push({ name: key, description: null });
          }

          allTranslations.push({
            key,
            locale: localeCode,
            value: value.trim(),
          });
        }
      }
    }

    return {
      keys: allKeys,
      translations: allTranslations,
      locales,
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("ZIP 파일 파싱 중 오류가 발생했습니다.");
  }
}

