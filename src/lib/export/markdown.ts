import { Page, Block } from "../../types/workspace";

/**
 * Formats a block to Markdown syntax
 */
function formatBlockToMarkdown(block: Block): string {
  const content = block.content || block.text || "";

  switch (block.type) {
    case "heading1":
      return `# ${content}`;
    case "heading2":
      return `## ${content}`;
    case "heading3":
      return `### ${content}`;
    case "paragraph":
      return content || "";
    case "bulleted-list":
      return `- ${content}`;
    case "numbered-list":
      return `1. ${content}`;
    case "quote":
      return `> ${content}`;
    case "code":
      return `\`\`\`\n${content}\n\`\`\``;
    case "checkbox":
      return `- [${block.checked ? "x" : " "}] ${content}`;
    case "image":
      return block.properties?.url ? `![Image](${block.properties.url})` : "";
    case "divider":
      return "---";
    case "callout":
      return `> **Note:** ${content}`;
    case "table":
      return formatTableToMarkdown(block.properties?.tableData);
    case "toggle":
      return `<details>\n<summary>${content}</summary>\n\n</details>`;
    default:
      return content;
  }
}

/**
 * Converts table data to Markdown format
 */
function formatTableToMarkdown(tableData: any): string {
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return "";
  }

  const rows = tableData.rows;
  let markdown = "";

  // First row as header
  if (rows[0]) {
    markdown += "| " + rows[0].join(" | ") + " |\n";
    markdown += "| " + rows[0].map(() => "---").join(" | ") + " |\n";
  }

  // Remaining rows as body
  for (let i = 1; i < rows.length; i++) {
    markdown += "| " + rows[i].join(" | ") + " |\n";
  }

  return markdown;
}

/**
 * Generates Markdown content from page data
 */
function generatePageMarkdown(page: Page): string {
  const metadata = `---
title: ${page.title}
icon: ${page.icon}
created: ${new Date(page.createdAt).toISOString()}
updated: ${new Date(page.updatedAt).toISOString()}
${page.createdBy ? `createdBy: ${page.createdBy}` : ""}
${page.lastEditedBy ? `lastEditedBy: ${page.lastEditedBy}` : ""}
---

`;

  const content = page.blocks
    .map((block) => formatBlockToMarkdown(block))
    .filter((line) => line.length > 0)
    .join("\n\n");

  return metadata + `# ${page.title}\n\n` + content;
}

/**
 * Exports page as Markdown file
 */
export function exportMarkdown(page: Page): void {
  const markdownContent = generatePageMarkdown(page);

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/markdown;charset=utf-8," + encodeURIComponent(markdownContent)
  );
  element.setAttribute("download", `${page.title}.md`);
  element.style.display = "none";

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Gets Markdown content as string (for clipboard, preview, etc.)
 */
export function getMarkdownContent(page: Page): string {
  return generatePageMarkdown(page);
}
