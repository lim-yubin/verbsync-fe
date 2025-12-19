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
  const handleExportExcel = () => {
    try {
      exportToExcel(matrix, projectName);
      toast.success("Excel 파일이 다운로드되었습니다.");
    } catch (error) {
      toast.error("Excel 파일 다운로드 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(matrix, projectName);
      toast.success("CSV 파일이 다운로드되었습니다.");
    } catch (error) {
      toast.error("CSV 파일 다운로드 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleExportJSONZip = async () => {
    try {
      await exportToJSON(matrix, projectName, true);
      toast.success("JSON 파일(ZIP)이 다운로드되었습니다.");
    } catch (error) {
      toast.error("JSON 파일 다운로드 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  const handleExportJSONIndividual = async () => {
    try {
      await exportToJSON(matrix, projectName, false);
      toast.success("JSON 파일들이 다운로드되었습니다.");
    } catch (error) {
      toast.error("JSON 파일 다운로드 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          내보내기
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>내보내기 형식</DropdownMenuLabel>
        {isFiltered && (
          <>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              현재 필터가 적용된 데이터만 내보내집니다.
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Excel 다운로드
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          CSV 다운로드
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleExportJSONZip}
          className="cursor-pointer"
        >
          <FileJson className="mr-2 h-4 w-4" />
          JSON 다운로드 (ZIP)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportJSONIndividual}
          className="cursor-pointer"
        >
          <FileJson className="mr-2 h-4 w-4" />
          JSON 다운로드 (개별)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

