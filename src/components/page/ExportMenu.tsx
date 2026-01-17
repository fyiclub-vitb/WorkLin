import React, { useState } from "react";
import { Page } from "../../types/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { FileDown, FileText, Code2, File } from "lucide-react";
import { exportMarkdown } from "../../lib/export/markdown";
import { exportHtml } from "../../lib/export/html";
import { exportPdf, exportPdfAlternative } from "../../lib/export/pdf";
import { useToast } from "../../hooks/use-toast";

interface ExportMenuProps {
  page: Page;
  disabled?: boolean;
}

// This dropdown menu lets users export their page in different formats
export const ExportMenu: React.FC<ExportMenuProps> = ({
  page,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Export as Markdown (.md file)
  const handleExportMarkdown = () => {
    try {
      exportMarkdown(page);
      toast({
        title: "Success",
        description: `"${page.title}" exported as Markdown`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export as Markdown",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Export as HTML (.html file)
  const handleExportHtml = () => {
    try {
      exportHtml(page);
      toast({
        title: "Success",
        description: `"${page.title}" exported as HTML`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export as HTML",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Export as PDF (.pdf file)
  const handleExportPdf = async () => {
    setIsLoading(true);
    try {
      // Try the main PDF library first
      try {
        await exportPdf(page);
      } catch {
        // If that fails, try the backup method
        await exportPdfAlternative(page);
      }

      toast({
        title: "Success",
        description: `"${page.title}" exported as PDF`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description:
          "Failed to export as PDF. Please ensure required libraries are installed.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={disabled || isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
            text-gray-700 dark:text-gray-300 
            hover:text-gray-900 dark:hover:text-gray-100
            hover:bg-gray-100 dark:hover:bg-gray-800
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          title="Export page"
        >
          <FileDown size={18} />
          {isLoading ? "Exporting..." : "Export"}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
          Export as
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        {/* Markdown export option */}
        <DropdownMenuItem
          onClick={handleExportMarkdown}
          disabled={isLoading}
          className="gap-2 cursor-pointer"
        >
          <FileText size={16} className="text-blue-600" />
          <span>Markdown (.md)</span>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            ⌘M
          </span>
        </DropdownMenuItem>

        {/* HTML export option */}
        <DropdownMenuItem
          onClick={handleExportHtml}
          disabled={isLoading}
          className="gap-2 cursor-pointer"
        >
          <Code2 size={16} className="text-orange-600" />
          <span>HTML (.html)</span>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            ⌘H
          </span>
        </DropdownMenuItem>

        {/* PDF export option */}
        <DropdownMenuItem
          onClick={handleExportPdf}
          disabled={isLoading}
          className="gap-2 cursor-pointer"
        >
          <File size={16} className="text-red-600" />
          <span>PDF (.pdf)</span>
          <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
            ⌘P
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        {/* Info about what gets exported */}
        <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-1">Includes:</p>
          <ul className="space-y-0.5">
            <li>✓ Page title</li>
            <li>✓ All blocks & content</li>
            <li>✓ Formatting</li>
            <li>✓ Metadata</li>
          </ul>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};