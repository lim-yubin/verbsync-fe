import ExcelJS from "exceljs";
import Papa from "papaparse";
import JSZip from "jszip";
import type { TranslationMatrix } from "@/types/api";

/**
 * Excel 파일로 내보내기
 */
export async function exportToExcel(
  matrix: TranslationMatrix,
  projectName: string
): Promise<void> {
  // 워크북 생성
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Translations");

  // 헤더 형식: "언어명 (코드)" (예: "한국어 (ko)")
  const headers = [
    "Key",
    "Description",
    ...matrix.locales.map((l) => `${l.name} (${l.code})`),
  ];

  // 헤더 행 추가
  worksheet.addRow(headers);

  // 헤더 행 스타일 설정
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // 데이터 행 추가
  for (const row of matrix.rows) {
    const rowData = [
      row.key,
      row.description || "",
      ...matrix.locales.map((locale) => row.translations[locale.code] || ""),
    ];
    worksheet.addRow(rowData);
  }

  // 열 너비 설정
  worksheet.getColumn(1).width = 30; // Key
  worksheet.getColumn(2).width = 30; // Description
  for (let i = 3; i <= headers.length; i++) {
    worksheet.getColumn(i).width = 25; // Locales
  }

  // 파일명 생성
  const date = new Date().toISOString().split("T")[0];
  const fileName = `${projectName}_translations_${date}.xlsx`;

  // 버퍼로 변환 후 다운로드
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

