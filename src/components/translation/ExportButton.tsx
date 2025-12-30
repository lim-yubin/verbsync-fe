import { useTranslation } from "react-i18next";
import { Download, FileSpreadsheet, FileText, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToCSV, exportToJSON } from "@/lib/export-utils";
import type { TranslationMatrix } from "@/types/api";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";

interface ExportButtonProps {
  matrix: TranslationMatrix;
  projectName: string;
  isFiltered: boolean;
}

export function ExportButton({
  matrix,
  projectName,
  isFiltered,
}: ExportButtonProps) {
  const { t } = useTranslation();
  const { data: planInfo } = usePlan();
  const canExportExcel = planInfo?.features.canExportExcel ?? false;

  const handleExportExcel = async () => {
    if (!canExportExcel) {
      toast.error(t("export.notAvailable"));
      return;
    }
    try {
      await exportToExcel(matrix, projectName);
      toast.success(t("export.excelSuccess"));
    } catch (error) {
      toast.error(t("export.excelFailed"));
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    if (!canExportExcel) {
      toast.error(t("export.notAvailable"));
      return;
    }
    try {
      exportToCSV(matrix, projectName);
      toast.success(t("export.csvSuccess"));
    } catch (error) {
      toast.error(t("export.csvFailed"));
      console.error(error);
    }
  };

  const handleExportJSONZip = async () => {
    try {
      await exportToJSON(matrix, projectName, true);
      toast.success(t("export.jsonZipSuccess"));
    } catch (error) {
      toast.error(t("export.jsonFailed"));
      console.error(error);
    }
  };

  const handleExportJSONIndividual = async () => {
    try {
      await exportToJSON(matrix, projectName, false);
      toast.success(t("export.jsonIndividualSuccess"));
    } catch (error) {
      toast.error(t("export.jsonFailed"));
      console.error(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          {t("export.title")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("export.format")}</DropdownMenuLabel>
        {isFiltered && (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              {t("export.filteredWarning")}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        {canExportExcel ? (
          <>
            <DropdownMenuItem
              onClick={handleExportExcel}
              className="cursor-pointer"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {t("export.excel")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportCSV}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t("export.csv")}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              disabled
              className="cursor-not-allowed opacity-50"
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center w-full">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>{t("export.excel")}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-6">
                  {t("export.starterRequired")}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled
              className="cursor-not-allowed opacity-50"
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{t("export.csv")}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-6">
                  {t("export.starterRequired")}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs text-primary cursor-pointer"
                onClick={() => {
                  window.location.href = "/pricing";
                }}
              >
                {t("export.upgrade")}
              </Button>
            </div>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleExportJSONZip}
          className="cursor-pointer"
        >
          <FileJson className="mr-2 h-4 w-4" />
          {t("export.jsonZip")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportJSONIndividual}
          className="cursor-pointer"
        >
          <FileJson className="mr-2 h-4 w-4" />
          {t("export.jsonIndividual")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
