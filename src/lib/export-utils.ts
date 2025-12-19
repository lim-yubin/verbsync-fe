import * as XLSX from "xlsx";
import Papa from "papaparse";
import JSZip from "jszip";
import type { TranslationMatrix } from "@/types/api";

/**
 * Excel 파일로 내보내기
 */
export function exportToExcel(
  matrix: TranslationMatrix,
  projectName: string
): void {
  // 워크북 생성
  const wb = XLSX.utils.book_new();

  // 데이터 준비: [Key, Description, ...Locales]
  // 헤더 형식: "언어명 (코드)" (예: "한국어 (ko)")
  const headers = [
    "Key",
    "Description",
    ...matrix.locales.map((l) => `${l.name} (${l.code})`),
  ];
  const data = matrix.rows.map((row) => [
    row.key,
    row.description || "",
    ...matrix.locales.map((locale) => row.translations[locale.code] || ""),
  ]);

  // 워크시트 생성
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // 열 너비 설정
  ws["!cols"] = [
    { wch: 30 }, // Key
    { wch: 30 }, // Description
    ...matrix.locales.map(() => ({ wch: 25 })), // Locales
  ];

  // 워크북에 워크시트 추가
  XLSX.utils.book_append_sheet(wb, ws, "Translations");

  // 파일명 생성
  const date = new Date().toISOString().split("T")[0];
  const fileName = `${projectName}_translations_${date}.xlsx`;

  // 파일 다운로드
  XLSX.writeFile(wb, fileName);
}

/**
 * CSV 파일로 내보내기
 */
export function exportToCSV(
  matrix: TranslationMatrix,
  projectName: string
): void {
  // 헤더 준비
  // 헤더 형식: "언어명 (코드)" (예: "한국어 (ko)")
  const headers = [
    "Key",
    "Description",
    ...matrix.locales.map((l) => `${l.name} (${l.code})`),
  ];

  // 데이터 준비
  const data = matrix.rows.map((row) => [
    row.key,
    row.description || "",
    ...matrix.locales.map((locale) => row.translations[locale.code] || ""),
  ]);

  // CSV 문자열 생성 (UTF-8 BOM 포함 - Excel 호환성)
  const csv = Papa.unparse([headers, ...data], {
    delimiter: ",",
    newline: "\n",
  });

  // UTF-8 BOM 추가
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });

  // 파일 다운로드
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${projectName}_translations_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * JSON 파일로 내보내기 (i18next 형식)
 * @param asZip ZIP 파일로 묶어서 다운로드할지 여부
 */
export async function exportToJSON(
  matrix: TranslationMatrix,
  projectName: string,
  asZip: boolean = true
): Promise<void> {
  if (asZip) {
    // ZIP 파일로 묶어서 다운로드
    const zip = new JSZip();

    // 각 언어별로 JSON 파일 생성
    for (const locale of matrix.locales) {
      const translations: Record<string, string> = {};
      for (const row of matrix.rows) {
        const value = row.translations[locale.code];
        if (value) {
          translations[row.key] = value;
        }
      }

      // JSON 문자열 생성 (들여쓰기 2칸)
      const jsonContent = JSON.stringify(translations, null, 2);
      zip.file(`${locale.code}.json`, jsonContent);
    }

    // ZIP 파일 생성 및 다운로드
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName}_translations_${new Date().toISOString().split("T")[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // 개별 파일로 다운로드
    for (const locale of matrix.locales) {
      const translations: Record<string, string> = {};
      for (const row of matrix.rows) {
        const value = row.translations[locale.code];
        if (value) {
          translations[row.key] = value;
        }
      }

      // JSON 문자열 생성
      const jsonContent = JSON.stringify(translations, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${locale.code}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}

