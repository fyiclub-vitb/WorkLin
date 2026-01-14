import { Page, Block } from "../../types/workspace";

/**
 * Formats a block's content to HTML based on its type
 */
function formatBlockToHtml(block: Block): string {
  const content = block.content || block.text || "";

  switch (block.type) {
    case "heading1":
      return `<h1 style="font-size: 2em; font-weight: bold; margin: 0.5em 0; word-break: break-word;">${escapeHtml(content)}</h1>`;
    case "heading2":
      return `<h2 style="font-size: 1.5em; font-weight: bold; margin: 0.5em 0; word-break: break-word;">${escapeHtml(content)}</h2>`;
    case "heading3":
      return `<h3 style="font-size: 1.25em; font-weight: bold; margin: 0.5em 0; word-break: break-word;">${escapeHtml(content)}</h3>`;
    case "paragraph":
      return `<p style="margin: 0.5em 0; line-height: 1.6; word-break: break-word; white-space: pre-wrap;">${escapeHtml(content)}</p>`;
    case "bulleted-list":
      return `<li style="margin-left: 2em; word-break: break-word;">${escapeHtml(content)}</li>`;
    case "numbered-list":
      return `<li style="margin-left: 2em; word-break: break-word;">${escapeHtml(content)}</li>`;
    case "quote":
      return `<blockquote style="border-left: 4px solid #ccc; margin-left: 0; padding-left: 1em; color: #666; font-style: italic; margin: 0.5em 0; word-break: break-word;">${escapeHtml(content)}</blockquote>`;
    case "code":
      return `<pre style="background-color: #f5f5f5; padding: 1em; border-radius: 4px; overflow-wrap: break-word; white-space: pre-wrap; margin: 0.5em 0;"><code>${escapeHtml(content)}</code></pre>`;
    case "checkbox":
      return `<div style="margin: 0.5em 0; word-break: break-word;"><input type="checkbox" ${block.checked ? "checked" : ""} disabled /> ${escapeHtml(content)}</div>`;
    case "image":
      return block.properties?.url
        ? `<img src="${block.properties.url}" style="max-width: 100%; height: auto; margin: 1em 0; display: block;" alt="Image" />`
        : "";
    case "divider":
      return '<hr style="margin: 1em 0; border: none; border-top: 1px solid #ddd;" />';
    case "callout":
      return `<div style="background-color: #f0f0f0; border-left: 4px solid #007bff; padding: 1em; margin: 0.5em 0; border-radius: 4px; word-break: break-word;">${escapeHtml(content)}</div>`;
    case "table":
      return formatTableToHtml(block.properties?.tableData);
    case "toggle":
      return `<details style="margin: 0.5em 0; word-break: break-word;"><summary>${escapeHtml(content)}</summary></details>`;
    default:
      return `<p style="margin: 0.5em 0; word-break: break-word;">${escapeHtml(content)}</p>`;
  }
}

/**
 * Formats table data to HTML
 */
function formatTableToHtml(tableData: any): string {
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return '<table style="border-collapse: collapse; width: 100%; margin: 1em 0;"></table>';
  }

  let html =
    '<table style="border-collapse: collapse; width: 100%; margin: 1em 0; border: 1px solid #ddd;">';

  // Add header row if available
  if (tableData.rows[0]) {
    html += "<thead><tr>";
    tableData.rows[0].forEach((cell: string) => {
      html += `<th style="border: 1px solid #ddd; padding: 0.5em; background-color: #f5f5f5; font-weight: bold; word-break: break-word;">${escapeHtml(cell)}</th>`;
    });
    html += "</tr></thead>";
  }

  // Add body rows
  html += "<tbody>";
  for (let i = 1; i < tableData.rows.length; i++) {
    html += "<tr>";
    tableData.rows[i].forEach((cell: string) => {
      html += `<td style="border: 1px solid #ddd; padding: 0.5em; word-break: break-word;">${escapeHtml(cell)}</td>`;
    });
    html += "</tr>";
  }
  html += "</tbody></table>";

  return html;
}

/**
 * Escapes HTML special characters
 */
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

/**
 * Generates HTML content from page data
 */
function generatePageHtml(page: Page): string {
  const contentHtml = page.blocks.map(formatBlockToHtml).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(page.title)}</title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            width: 100%;
            margin: 0;
            padding: 20px;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        h1 { font-size: 2em; font-weight: bold; margin: 0.5em 0; word-break: break-word; }
        h2 { font-size: 1.5em; font-weight: bold; margin: 0.5em 0; word-break: break-word; }
        h3 { font-size: 1.25em; font-weight: bold; margin: 0.5em 0; word-break: break-word; }
        p { margin: 0.5em 0; line-height: 1.6; word-break: break-word; }
        li { word-break: break-word; }
        blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 1em; color: #666; font-style: italic; word-break: break-word; }
        pre { background-color: #f5f5f5; padding: 1em; border-radius: 4px; overflow-wrap: break-word; white-space: pre-wrap; }
        code { font-family: 'Courier New', monospace; word-break: break-word; }
        img { max-width: 100%; height: auto; display: block; }
        hr { margin: 1em 0; border: none; border-top: 1px solid #ddd; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 0.5em; text-align: left; word-break: break-word; }
        th { background-color: #f5f5f5; font-weight: bold; }
        div, span { word-wrap: break-word; overflow-wrap: break-word; }
    </style>
</head>
<body>
    <h1>${escapeHtml(page.title)}</h1>
    <p style="color: #999; font-size: 0.9em;">
        Created: ${new Date(page.createdAt).toLocaleDateString()} | 
        Last updated: ${new Date(page.updatedAt).toLocaleDateString()}
    </p>
    <hr />
    ${contentHtml}
</body>
</html>`;
}

/**
 * Exports page as PDF using html2pdf
 */
export async function exportPdf(page: Page): Promise<void> {
  try {
    // Dynamic import to avoid build issues if html2pdf is not installed
    // @ts-ignore - html2pdf.js doesn't have type declarations
    const html2pdf = (await import("html2pdf.js")).default;

    const htmlContent = generatePageHtml(page);

    // Create a temporary container with proper styling
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    element.style.padding = "0";
    element.style.margin = "0";
    element.style.width = "100%";

    // Append to body to ensure proper rendering
    document.body.appendChild(element);

    const options = {
      margin: [10, 10, 10, 10], // [top, left, bottom, right] in mm
      filename: `${page.title}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: true },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    // Use the body element's content for better rendering
    const bodyContent = element.querySelector("body");
    await html2pdf()
      .set(options)
      .from(bodyContent || element)
      .save();

    // Clean up
    document.body.removeChild(element);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw new Error(
      "Failed to export as PDF. Please ensure html2pdf is installed."
    );
  }
}

/**
 * Exports page as PDF using alternative method (canvas-based)
 * This is a fallback if html2pdf is not available
 */
export async function exportPdfAlternative(page: Page): Promise<void> {
  try {
    // @ts-ignore - jsPDF doesn't have complete type declarations
    const jsPdf = (await import("jspdf")).jsPDF;
    // @ts-ignore - html2canvas doesn't have complete type declarations
    const html2canvas = (await import("html2canvas")).default;

    const htmlContent = generatePageHtml(page);

    // Create container with proper styling
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    element.style.padding = "20px";
    element.style.backgroundColor = "white";
    element.style.width = "210mm"; // A4 width
    element.style.margin = "0";
    element.style.position = "fixed";
    element.style.left = "-9999px"; // Position off-screen

    // Append to body for rendering
    document.body.appendChild(element);

    // Wait a moment for content to render
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    // Clean up
    document.body.removeChild(element);

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPdf("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // 10mm margins on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // Add first image
    pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    pdf.save(`${page.title}.pdf`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw new Error(
      "Failed to export as PDF. Please ensure jsPDF and html2canvas are installed."
    );
  }
}
