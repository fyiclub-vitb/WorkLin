import { Page, Block } from "../../types/workspace";

// Function to convert a block to HTML based on its type
// Each block type gets rendered with appropriate HTML tags and styling classes
function formatBlockToHtml(block: Block): string {
  // Get the content from either content or text field
  const content = block.content || block.text || "";

  switch (block.type) {
    case "heading1":
      return `<h1 class="page-heading-1">${escapeHtml(content)}</h1>`;
    case "heading2":
      return `<h2 class="page-heading-2">${escapeHtml(content)}</h2>`;
    case "heading3":
      return `<h3 class="page-heading-3">${escapeHtml(content)}</h3>`;
    case "paragraph":
      return `<p class="page-paragraph">${escapeHtml(content)}</p>`;
    case "bulleted-list":
      return `<li class="page-list-item">${escapeHtml(content)}</li>`;
    case "numbered-list":
      return `<li class="page-list-item">${escapeHtml(content)}</li>`;
    case "quote":
      return `<blockquote class="page-quote">${escapeHtml(content)}</blockquote>`;
    case "code":
      return `<pre class="page-code"><code>${escapeHtml(content)}</code></pre>`;
    case "checkbox":
      // Render checkbox with checked state
      return `<div class="page-checkbox"><input type="checkbox" ${block.checked ? "checked" : ""} disabled /> <span>${escapeHtml(content)}</span></div>`;
    case "image":
      // Only render if URL exists, with optional caption
      return block.properties?.url
        ? `<figure class="page-image"><img src="${block.properties.url}" alt="Image" />${block.properties.caption ? `<figcaption>${escapeHtml(block.properties.caption)}</figcaption>` : ""}</figure>`
        : "";
    case "divider":
      return '<hr class="page-divider" />';
    case "callout":
      return `<div class="page-callout"><p>${escapeHtml(content)}</p></div>`;
    case "table":
      // Tables need special formatting with rows and columns
      return formatTableToHtml(block.properties?.tableData);
    case "toggle":
      // Use HTML details/summary for collapsible content
      return `<details class="page-toggle"><summary>${escapeHtml(content)}</summary><div class="toggle-content"></div></details>`;
    default:
      // Default to paragraph for unknown block types
      return `<p class="page-paragraph">${escapeHtml(content)}</p>`;
  }
}

// Function to convert table data structure to HTML table
// Handles header row and body rows separately
function formatTableToHtml(tableData: any): string {
  // Return empty table if no data
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return '<table class="page-table"></table>';
  }

  let html = '<table class="page-table">';

  // First row becomes the table header
  if (tableData.rows[0]) {
    html += "<thead><tr>";
    tableData.rows[0].forEach((cell: string) => {
      html += `<th>${escapeHtml(cell)}</th>`;
    });
    html += "</tr></thead>";
  }

  // Remaining rows become the table body
  html += "<tbody>";
  for (let i = 1; i < tableData.rows.length; i++) {
    html += "<tr>";
    tableData.rows[i].forEach((cell: string) => {
      html += `<td>${escapeHtml(cell)}</td>`;
    });
    html += "</tr>";
  }
  html += "</tbody></table>";

  return html;
}

// Function to escape special HTML characters to prevent XSS attacks
// Converts characters like < > & " ' to their HTML entity equivalents
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Main function to generate a complete standalone HTML document
// Includes full HTML structure with head, styles, and body
function generatePageHtml(page: Page): string {
  // Convert all blocks to HTML
  const contentHtml = page.blocks.map(formatBlockToHtml).join("");

  // Return complete HTML document with embedded CSS
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Exported page from WorkLin">
    <meta name="author" content="${escapeHtml(page.createdBy || "WorkLin")}">
    <title>${escapeHtml(page.title)}</title>
    <style>
        /* Reset default styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        html {
            background-color: #f8f9fa;
        }
        
        /* Main body styles - centered with shadow for depth */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: white;
            max-width: 900px;
            margin: 0 auto;
            padding: 3rem 2rem;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        
        /* Page header with title and metadata */
        .page-header {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 2px solid #e9ecef;
        }
        
        .page-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 0.5rem 0;
        }
        
        /* Metadata like dates shown in smaller gray text */
        .page-metadata {
            color: #999;
            font-size: 0.9rem;
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }
        
        .page-content {
            line-height: 1.8;
        }
        
        /* Heading styles with decreasing sizes */
        .page-heading-1 {
            font-size: 2rem;
            font-weight: 700;
            margin: 1.5rem 0 0.5rem 0;
            color: #1a1a1a;
        }
        
        .page-heading-2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 1.25rem 0 0.5rem 0;
            color: #2d2d2d;
        }
        
        .page-heading-3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 1rem 0 0.5rem 0;
            color: #404040;
        }
        
        .page-paragraph {
            margin: 1rem 0;
            font-size: 1rem;
        }
        
        /* List items with indentation */
        .page-list-item {
            margin-left: 2rem;
            margin: 0.5rem 0 0.5rem 2rem;
        }
        
        /* Blockquote with left border and background */
        .page-quote {
            border-left: 4px solid #007bff;
            margin-left: 0;
            margin: 1rem 0;
            padding-left: 1rem;
            color: #666;
            font-style: italic;
            background-color: #f8f9fa;
            padding: 0.75rem 1rem;
            border-radius: 4px;
        }
        
        /* Code blocks with monospace font and gray background */
        .page-code {
            background-color: #f5f5f5;
            border: 1px solid #e0e0e0;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
            margin: 1rem 0;
            font-family: 'Courier New', 'Monaco', monospace;
            font-size: 0.9rem;
            line-height: 1.4;
        }
        
        .page-code code {
            color: #333;
        }
        
        /* Checkbox items with flex layout */
        .page-checkbox {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.5rem 0;
        }
        
        .page-checkbox input {
            cursor: not-allowed;
        }
        
        /* Images centered with shadow and caption */
        .page-image {
            margin: 1.5rem 0;
            text-align: center;
        }
        
        .page-image img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .page-image figcaption {
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #999;
            font-style: italic;
        }
        
        /* Horizontal divider line */
        .page-divider {
            margin: 2rem 0;
            border: none;
            border-top: 2px solid #e9ecef;
        }
        
        /* Callout boxes with blue accent */
        .page-callout {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 4px;
        }
        
        .page-callout p {
            margin: 0;
        }
        
        /* Table styles with borders and hover effects */
        .page-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .page-table th {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 0.75rem;
            text-align: left;
            font-weight: 600;
            color: #2d2d2d;
        }
        
        .page-table td {
            border: 1px solid #dee2e6;
            padding: 0.75rem;
        }
        
        /* Alternating row colors for better readability */
        .page-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .page-table tbody tr:hover {
            background-color: #e9ecef;
        }
        
        /* Collapsible toggle sections */
        .page-toggle {
            margin: 1rem 0;
            padding: 1rem;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
        }
        
        .page-toggle summary {
            cursor: pointer;
            font-weight: 600;
            padding: 0.5rem 0;
            user-select: none;
        }
        
        .page-toggle summary:hover {
            color: #007bff;
        }
        
        .toggle-content {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e9ecef;
        }
        
        /* Print-specific styles to optimize for paper */
        @media print {
            body {
                box-shadow: none;
                max-width: 100%;
                margin: 0;
                padding: 0;
            }
            
            /* Prevent page breaks inside images */
            .page-image {
                page-break-inside: avoid;
            }
            
            /* Prevent page breaks inside tables */
            .page-table {
                page-break-inside: avoid;
            }
        }
        
        /* Mobile responsive styles for smaller screens */
        @media (max-width: 768px) {
            body {
                padding: 1.5rem 1rem;
            }
            
            .page-title {
                font-size: 1.75rem;
            }
            
            .page-metadata {
                font-size: 0.85rem;
                gap: 1rem;
            }
            
            .page-table {
                font-size: 0.9rem;
            }
            
            .page-table th,
            .page-table td {
                padding: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="page-header">
        <h1 class="page-title">${escapeHtml(page.title)}</h1>
        <div class="page-metadata">
            <span><strong>Created:</strong> ${new Date(
              page.createdAt
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
            <span><strong>Last Updated:</strong> ${new Date(
              page.updatedAt
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</span>
        </div>
    </div>
    
    <div class="page-content">
        ${contentHtml}
    </div>
    
    <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e9ecef; color: #999; font-size: 0.9rem; text-align: center;">
        <p>Exported from <strong>WorkLin</strong> on ${new Date().toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )}</p>
    </footer>
</body>
</html>`;
}

// Public function to export a page as an HTML file
// Creates a download link and triggers the browser's download
export function exportHtml(page: Page): void {
  const htmlContent = generatePageHtml(page);

  // Create a temporary anchor element for downloading
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent)
  );
  element.setAttribute("download", `${page.title}.html`);
  element.style.display = "none";

  // Add to DOM, click to download, then remove
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Helper function to get HTML content as a string
// Useful for previewing, copying to clipboard, or other purposes
export function getHtmlContent(page: Page): string {
  return generatePageHtml(page);
}