import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, } from "../ui/dropdown-menu";
import { FileDown, FileText, Code2, File } from "lucide-react";
import { exportMarkdown } from "../../lib/export/markdown";
import { exportHtml } from "../../lib/export/html";
import { exportPdf, exportPdfAlternative } from "../../lib/export/pdf";
import { useToast } from "../../hooks/use-toast";
export const ExportMenu = ({ page, disabled = false, }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const handleExportMarkdown = () => {
        try {
            exportMarkdown(page);
            toast({
                title: "Success",
                description: `"${page.title}" exported as Markdown`,
                duration: 3000,
            });
        }
        catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Error",
                description: "Failed to export as Markdown",
                variant: "destructive",
                duration: 3000,
            });
        }
    };
    const handleExportHtml = () => {
        try {
            exportHtml(page);
            toast({
                title: "Success",
                description: `"${page.title}" exported as HTML`,
                duration: 3000,
            });
        }
        catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Error",
                description: "Failed to export as HTML",
                variant: "destructive",
                duration: 3000,
            });
        }
    };
    const handleExportPdf = async () => {
        setIsLoading(true);
        try {
            // Try html2pdf first
            try {
                await exportPdf(page);
            }
            catch {
                // Fallback to jsPDF + html2canvas if html2pdf is not available
                await exportPdfAlternative(page);
            }
            toast({
                title: "Success",
                description: `"${page.title}" exported as PDF`,
                duration: 3000,
            });
        }
        catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Error",
                description: "Failed to export as PDF. Please ensure required libraries are installed.",
                variant: "destructive",
                duration: 4000,
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs("button", { disabled: disabled || isLoading, className: "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors\r\n            text-gray-700 dark:text-gray-300 \r\n            hover:text-gray-900 dark:hover:text-gray-100\r\n            hover:bg-gray-100 dark:hover:bg-gray-800\r\n            disabled:opacity-50 disabled:cursor-not-allowed\r\n            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900", title: "Export page", children: [_jsx(FileDown, { size: 18 }), isLoading ? "Exporting..." : "Export"] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-48", children: [_jsx(DropdownMenuLabel, { className: "px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400", children: "Export as" }), _jsx(DropdownMenuSeparator, { className: "my-1" }), _jsxs(DropdownMenuItem, { onClick: handleExportMarkdown, disabled: isLoading, className: "gap-2 cursor-pointer", children: [_jsx(FileText, { size: 16, className: "text-blue-600" }), _jsx("span", { children: "Markdown (.md)" }), _jsx("span", { className: "ml-auto text-xs text-gray-500 dark:text-gray-400", children: "\u2318M" })] }), _jsxs(DropdownMenuItem, { onClick: handleExportHtml, disabled: isLoading, className: "gap-2 cursor-pointer", children: [_jsx(Code2, { size: 16, className: "text-orange-600" }), _jsx("span", { children: "HTML (.html)" }), _jsx("span", { className: "ml-auto text-xs text-gray-500 dark:text-gray-400", children: "\u2318H" })] }), _jsxs(DropdownMenuItem, { onClick: handleExportPdf, disabled: isLoading, className: "gap-2 cursor-pointer", children: [_jsx(File, { size: 16, className: "text-red-600" }), _jsx("span", { children: "PDF (.pdf)" }), _jsx("span", { className: "ml-auto text-xs text-gray-500 dark:text-gray-400", children: "\u2318P" })] }), _jsx(DropdownMenuSeparator, { className: "my-1" }), _jsxs("div", { className: "px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400", children: [_jsx("p", { className: "font-medium mb-1", children: "Includes:" }), _jsxs("ul", { className: "space-y-0.5", children: [_jsx("li", { children: "\u2713 Page title" }), _jsx("li", { children: "\u2713 All blocks & content" }), _jsx("li", { children: "\u2713 Formatting" }), _jsx("li", { children: "\u2713 Metadata" })] })] })] })] }));
};
