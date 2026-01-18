import { Page, Block } from "../../types/workspace";

// Helper function to escape HTML special characters
// Prevents XSS attacks and ensures proper rendering
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

// Function to convert blocks to HTML for the alternative PDF method
// This is similar to the HTML export but simplified for PDF rendering
function formatBlockToHtml(block: Block): string {
  const content = block.content || block.text || "";

  switch (block.type) {
    case "heading1":
      return `<h1>${escapeHtml(content)}</h1>`;
    case "heading2":
      return `<h2>${escapeHtml(content)}</h2>`;
    case "heading3":
      return `<h3>${escapeHtml(content)}</h3>`;
    case "paragraph":
      return `<p>${escapeHtml(content)}</p>`;
    case "bulleted-list":
      return `<ul><li>${escapeHtml(content)}</li></ul>`;
    case "numbered-list":
      return `<ol><li>${escapeHtml(content)}</li></ol>`;
    case "quote":
      return `<blockquote>${escapeHtml(content)}</blockquote>`;
    case "code":
      return `<pre><code>${escapeHtml(content)}</code></pre>`;
    case "checkbox":
      return `<div class="checkbox-item"><input type="checkbox" ${block.checked ? "checked" : ""} disabled /> <span>${escapeHtml(content)}</span></div>`;
    case "image":
      return block.properties?.url
        ? `<img src="${block.properties.url}" alt="Image" />`
        : "";
    case "divider":
      return "<hr />";
    case "callout":
      return `<div class="callout">${escapeHtml(content)}</div>`;
    case "table":
      return formatTableToHtml(block.properties?.tableData);
    case "toggle":
      return `<details><summary>${escapeHtml(content)}</summary></details>`;
    default:
      return `<p>${escapeHtml(content)}</p>`;
  }
}

// Convert table data to HTML table
function formatTableToHtml(tableData: any): string {
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return "<table></table>";
  }

  let html = "<table>";

  // First row as header
  if (tableData.rows[0]) {
    html += "<thead><tr>";
    tableData.rows[0].forEach((cell: string) => {
      html += `<th>${escapeHtml(cell)}</th>`;
    });
    html += "</tr></thead>";
  }

  // Remaining rows as body
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

// Main PDF export function using text-based rendering
// This creates searchable PDFs where you can select and copy text
// Uses jsPDF library to programmatically build the PDF
export async function exportPdf(page: Page): Promise<void> {
  try {
    // Dynamically import jsPDF library
    // @ts-ignore - jsPDF doesn't have complete TypeScript definitions
    const { jsPDF } = await import("jspdf");

    // Create new PDF document in portrait orientation with A4 size
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Track vertical position on the page
    let yPosition = 15;
    const pageMargin = 15;
    const maxWidth = pageWidth - pageMargin * 2;

    // Add the page title at the top
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(page.title, maxWidth);
    for (const line of titleLines) {
      pdf.text(line, pageMargin, yPosition);
      yPosition += 6;
    }
    yPosition += 5;

    // Add metadata (creation and update dates)
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(150, 150, 150); // Gray color for metadata
    const metadata = `Created: ${new Date(page.createdAt).toLocaleDateString()} | Last updated: ${new Date(page.updatedAt).toLocaleDateString()}`;
    const metaLines = pdf.splitTextToSize(metadata, maxWidth);
    for (const line of metaLines) {
      pdf.text(line, pageMargin, yPosition);
      yPosition += 4;
    }
    pdf.setTextColor(0, 0, 0); // Reset to black
    yPosition += 5;

    // Add horizontal divider line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(pageMargin, yPosition, pageWidth - pageMargin, yPosition);
    yPosition += 8;

    // Reset font for content
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    // Process each block and add to PDF
    for (const block of page.blocks) {
      // Check if we need a new page (approaching bottom margin)
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = pageMargin;
      }

      const content = block.content || block.text || "";

      switch (block.type) {
        case "heading1":
          // Large heading with extra spacing
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          yPosition += 4;
          const h1Lines = pdf.splitTextToSize(content, maxWidth);
          for (const line of h1Lines) {
            pdf.text(line, pageMargin, yPosition);
            yPosition += 5;
          }
          yPosition += 3;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          break;

        case "heading2":
          // Medium heading
          pdf.setFontSize(13);
          pdf.setFont("helvetica", "bold");
          yPosition += 3;
          const h2Lines = pdf.splitTextToSize(content, maxWidth);
          for (const line of h2Lines) {
            pdf.text(line, pageMargin, yPosition);
            yPosition += 5;
          }
          yPosition += 2;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          break;

        case "heading3":
          // Small heading
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          yPosition += 3;
          const h3Lines = pdf.splitTextToSize(content, maxWidth);
          for (const line of h3Lines) {
            pdf.text(line, pageMargin, yPosition);
            yPosition += 5;
          }
          yPosition += 2;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          break;

        case "paragraph":
          // Regular paragraph text with line wrapping
          const pLines = pdf.splitTextToSize(content, maxWidth);
          for (const line of pLines) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = pageMargin;
            }
            pdf.text(line, pageMargin, yPosition);
            yPosition += 4;
          }
          yPosition += 3;
          break;

        case "bulleted-list":
          // Bullet point with indentation
          const ulLines = pdf.splitTextToSize(content, maxWidth - 5);
          for (const line of ulLines) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = pageMargin;
            }
            pdf.text("• " + line, pageMargin + 3, yPosition);
            yPosition += 4;
          }
          yPosition += 2;
          break;

        case "numbered-list":
          // Numbered list (using bullets for simplicity)
          const olLines = pdf.splitTextToSize(content, maxWidth - 5);
          for (const line of olLines) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = pageMargin;
            }
            pdf.text("• " + line, pageMargin + 3, yPosition);
            yPosition += 4;
          }
          yPosition += 2;
          break;

        case "quote":
          // Quote with gray background and left border
          pdf.setFillColor(240, 240, 240);
          const qLines = pdf.splitTextToSize(content, maxWidth - 8);
          const qHeight = qLines.length * 4 + 4;

          if (yPosition + qHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = pageMargin;
          }

          // Draw background rectangle
          pdf.rect(pageMargin, yPosition - 2, maxWidth, qHeight, "F");
          // Draw left border line
          pdf.setDrawColor(150, 150, 150);
          pdf.setLineWidth(0.5);
          pdf.line(
            pageMargin + 2,
            yPosition - 2,
            pageMargin + 2,
            yPosition + qHeight - 2
          );
          pdf.setDrawColor(0, 0, 0);

          let qY = yPosition + 1;
          for (const line of qLines) {
            pdf.text(line, pageMargin + 5, qY);
            qY += 4;
          }
          yPosition += qHeight + 3;
          break;

        case "code":
          // Code block with monospace font and gray background
          pdf.setFillColor(245, 245, 245);
          pdf.setFont("courier", "normal");
          const cLines = pdf.splitTextToSize(content, maxWidth - 8);
          const cHeight = cLines.length * 4 + 4;

          if (yPosition + cHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = pageMargin;
          }

          pdf.rect(pageMargin, yPosition - 2, maxWidth, cHeight, "F");
          let cY = yPosition + 1;
          for (const line of cLines) {
            pdf.text(line, pageMargin + 3, cY);
            cY += 4;
          }
          yPosition += cHeight + 3;
          pdf.setFont("helvetica", "normal");
          break;

        case "checkbox":
          // Checkbox with [x] or [ ] notation
          const cbLines = pdf.splitTextToSize(content, maxWidth - 5);
          for (const line of cbLines) {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = pageMargin;
            }
            const checkBox = block.checked ? "[x]" : "[ ]";
            pdf.text(checkBox + " " + line, pageMargin + 3, yPosition);
            yPosition += 4;
          }
          yPosition += 2;
          break;

        case "divider":
          // Horizontal line separator
          pdf.setDrawColor(200, 200, 200);
          pdf.line(pageMargin, yPosition, pageWidth - pageMargin, yPosition);
          yPosition += 6;
          break;

        case "callout":
          // Callout box with blue background and border
          pdf.setFillColor(230, 240, 255);
          const callLines = pdf.splitTextToSize(content, maxWidth - 8);
          const callHeight = callLines.length * 4 + 4;

          if (yPosition + callHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = pageMargin;
          }

          pdf.rect(pageMargin, yPosition - 2, maxWidth, callHeight, "F");
          pdf.setDrawColor(0, 123, 255);
          pdf.setLineWidth(0.5);
          pdf.line(
            pageMargin,
            yPosition - 2,
            pageMargin,
            yPosition + callHeight - 2
          );
          pdf.setDrawColor(0, 0, 0);

          let callY = yPosition + 1;
          for (const line of callLines) {
            pdf.text(line, pageMargin + 5, callY);
            callY += 4;
          }
          yPosition += callHeight + 3;
          break;

        case "image":
          // Image placeholder (actual images would need base64 encoding)
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = pageMargin;
          }
          const imgText = `[Image]`;
          pdf.text(imgText, pageMargin, yPosition);
          yPosition += 5;
          break;

        case "table":
          // Simple table rendering with borders
          try {
            const tableData = block.properties?.tableData;
            if (tableData && tableData.rows && tableData.rows.length > 0) {
              const colCount = tableData.rows[0].length;
              const colWidth = (maxWidth - 4) / colCount;

              for (let i = 0; i < tableData.rows.length; i++) {
                if (yPosition + 8 > pageHeight - 20) {
                  pdf.addPage();
                  yPosition = pageMargin;
                }

                const row = tableData.rows[i];
                // Header row gets bold font and gray background
                if (i === 0) {
                  pdf.setFont("helvetica", "bold");
                  pdf.setFillColor(240, 240, 240);
                }

                let xPos = pageMargin + 2;
                for (const cell of row) {
                  // Draw cell border and fill
                  pdf.rect(
                    xPos - 1,
                    yPosition - 6,
                    colWidth,
                    8,
                    i === 0 ? "F" : "S"
                  );
                  // Add cell text (truncate if too long)
                  pdf.text(
                    String(cell || "").substring(0, 10),
                    xPos,
                    yPosition - 2
                  );
                  xPos += colWidth;
                }
                yPosition += 8;
                if (i === 0) {
                  pdf.setFont("helvetica", "normal");
                }
              }
              yPosition += 3;
            }
          } catch (e) {
            console.warn("Could not render table", e);
          }
          break;
      }
    }

    // Save the PDF file with the page title as filename
    pdf.save(`${page.title}.pdf`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw new Error(
      "Failed to export as PDF. Please check the console for details."
    );
  }
}

// Alternative PDF export method using HTML to canvas conversion
// This is a fallback if text-based rendering fails
// Converts the page to an image and embeds it in the PDF
export async function exportPdfAlternative(page: Page): Promise<void> {
  try {
    // Import required libraries
    // @ts-ignore - Type definitions not complete
    const { jsPDF } = await import("jspdf");
    // @ts-ignore - Type definitions not complete
    const html2canvas = (await import("html2canvas")).default;

    // Generate styled HTML content
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(page.title)}</title>
    <style>
        /* Reset and base styles */
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
        }
        h1 { font-size: 28px; font-weight: bold; margin: 20px 0 10px 0; }
        h2 { font-size: 22px; font-weight: bold; margin: 16px 0 8px 0; }
        h3 { font-size: 18px; font-weight: bold; margin: 14px 0 7px 0; }
        p { margin: 12px 0; line-height: 1.6; }
        ul, ol { margin: 10px 0; padding-left: 30px; }
        li { margin: 6px 0; }
        blockquote { 
            border-left: 4px solid #ccc; 
            margin: 12px 0; 
            padding-left: 15px; 
            color: #666; 
            font-style: italic; 
        }
        pre { 
            background-color: #f5f5f5; 
            padding: 12px; 
            border-radius: 4px; 
            overflow-wrap: break-word; 
            white-space: pre-wrap; 
            margin: 12px 0;
            font-family: 'Courier New', monospace;
        }
        code { 
            font-family: 'Courier New', monospace; 
            background-color: #f0f0f0;
            padding: 2px 4px;
            border-radius: 3px;
        }
        img { max-width: 100%; height: auto; display: block; margin: 12px 0; }
        hr { margin: 16px 0; border: none; border-top: 1px solid #ddd; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .metadata { color: #999; font-size: 12px; margin: 8px 0; }
        .callout {
            background-color: #f0f7ff;
            border-left: 4px solid #007bff;
            padding: 12px;
            margin: 12px 0;
            border-radius: 4px;
        }
        .checkbox-item {
            display: flex;
            align-items: center;
            margin: 6px 0;
        }
        .checkbox-item input[type="checkbox"] {
            margin-right: 8px;
            width: 16px;
            height: 16px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>${escapeHtml(page.title)}</h1>
    <p class="metadata">
        Created: ${new Date(page.createdAt).toLocaleDateString()} | 
        Last updated: ${new Date(page.updatedAt).toLocaleDateString()}
    </p>
    <hr />
    ${page.blocks.map(formatBlockToHtml).join("")}
</body>
</html>`;

    // Create a temporary container element to render the HTML
    const element = document.createElement("div");
    element.innerHTML = htmlContent;
    element.style.padding = "0";
    element.style.margin = "0";
    element.style.backgroundColor = "white";
    element.style.width = "210mm"; // A4 width
    element.style.position = "fixed";
    element.style.left = "-9999px"; // Hide off-screen

    // Add to DOM and wait for rendering
    document.body.appendChild(element);
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Convert HTML to canvas image
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    // Clean up the temporary element
    document.body.removeChild(element);

    // Convert canvas to image data
    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // Margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // Add first page with image
    pdf.addImage(imgData, "JPEG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    // Add additional pages if content is longer than one page
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
      "Failed to export as PDF. Please check the console for details."
    );
  }
}