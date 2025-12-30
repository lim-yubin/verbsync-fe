import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Upload, FileSpreadsheet, FileText, FileJson, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  parseExcelFile,
  parseCSVFile,
  parseJSONFile,
  type ParsedImportData,
  type LocaleMapping,
} from "@/lib/import-utils";
import { toast } from "sonner";
import type { TranslationUpdateItem } from "@/types/api";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (
    data: {
      keys: Array<{ name: string; description: string | null }>;
      translations: TranslationUpdateItem[];
    },
    mode: "merge" | "overwrite"
  ) => Promise<void>;
  existingLocales: LocaleMapping[]; // { code: string, name: string }[]
  existingKeys?: string[]; // 기존 키 이름 목록 (새 키 구분용)
}

type ImportMode = "merge" | "overwrite";

export function ImportDialog({
  open,
  onOpenChange,
  onImport,
  existingLocales,
  existingKeys = [],
}: ImportDialogProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ImportMode>("merge");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedImportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setParsedData(null);
    setIsLoading(true);

    try {
      // 파일 크기 제한 (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error(t("import.fileSizeError"));
      }

      let data: ParsedImportData;

      // 파일 확장자에 따라 파싱
      const fileName = selectedFile.name.toLowerCase();
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        data = await parseExcelFile(selectedFile, existingLocales);
      } else if (fileName.endsWith(".csv")) {
        data = await parseCSVFile(selectedFile, existingLocales);
      } else if (fileName.endsWith(".json") || fileName.endsWith(".zip")) {
        data = await parseJSONFile(selectedFile);
      } else {
        throw new Error(t("import.unsupportedFormat"));
      }

      setParsedData(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("import.parseError");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;

    setIsLoading(true);
    try {
      await onImport(
        {
          keys: parsedData.keys,
          translations: parsedData.translations,
        },
        mode
      );
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("import.importError");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    setMode("merge");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  // 새로 발견된 언어 확인
  const existingLocaleCodes = existingLocales.map((l) => l.code);
  const newLocales =
    parsedData?.locales.filter(
      (locale) => !existingLocaleCodes.includes(locale)
    ) || [];

  // 새로 추가될 키 확인
  const existingKeySet = new Set(existingKeys);
  const newKeys =
    parsedData?.keys.filter((key) => !existingKeySet.has(key.name)) || [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("import.title")}</DialogTitle>
          <DialogDescription>
            {t("import.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 파일 선택 */}
          <div className="space-y-2">
            <Label>{t("import.selectFile")}</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.json,.zip"
                onChange={handleFileInputChange}
                className="hidden"
                id="import-file-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="cursor-pointer"
              >
                <Upload className="mr-2 h-4 w-4" />
                {t("import.selectFile")}
              </Button>
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {file.name.endsWith(".xlsx") || file.name.endsWith(".xls") ? (
                    <FileSpreadsheet className="h-4 w-4" />
                  ) : file.name.endsWith(".csv") ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <FileJson className="h-4 w-4" />
                  )}
                  <span>{file.name}</span>
                  <span className="text-xs">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="text-sm text-muted-foreground">{t("import.parsing")}</div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 파싱된 데이터 미리보기 */}
          {parsedData && !error && (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">{t("import.parsingResult")}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("import.totalKeys")}</span>{" "}
                    <span className="font-medium">{parsedData.keys.length}{t("common.count")}</span>
                    {newKeys.length > 0 && (
                      <span className="ml-2 text-primary">
                        ({t("import.newKeys")} {newKeys.length}{t("common.count")})
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("import.translations")}</span>{" "}
                    <span className="font-medium">
                      {parsedData.translations.length}{t("common.count")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("import.locales")}</span>{" "}
                    <span className="font-medium">
                      {parsedData.locales.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* 새 키 안내 */}
              {newKeys.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{t("import.newKeysAlert", { count: newKeys.length })}</strong>
                    <ul className="mt-2 ml-4 list-disc space-y-1">
                      {newKeys.slice(0, 5).map((key) => (
                        <li key={key.name} className="text-xs">
                          <code className="rounded bg-muted px-1 py-0.5">
                            {key.name}
                          </code>
                          {key.description && (
                            <span className="ml-2 text-muted-foreground">
                              - {key.description}
                            </span>
                          )}
                        </li>
                      ))}
                      {newKeys.length > 5 && (
                        <li className="text-xs text-muted-foreground">
                          {t("import.andMore", { count: newKeys.length - 5 })}
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* 새 언어 경고 */}
              {newLocales.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t("import.newLocalesAlert")}{" "}
                    <strong>{newLocales.join(", ")}</strong>
                    <br />
                    {t("import.newLocalesDescription")}
                  </AlertDescription>
                </Alert>
              )}

              {/* 업로드 모드 선택 */}
              <div className="space-y-2">
                <Label>{t("import.uploadMode")}</Label>
                <RadioGroup value={mode} onValueChange={(v) => setMode(v as ImportMode)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="merge" id="merge" />
                    <Label htmlFor="merge" className="cursor-pointer font-normal">
                      {t("import.mergeMode")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overwrite" id="overwrite" />
                    <Label htmlFor="overwrite" className="cursor-pointer font-normal">
                      {t("import.overwriteMode")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={!parsedData || isLoading}
            className="cursor-pointer"
          >
            {isLoading ? t("import.importing") : t("import.import")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

