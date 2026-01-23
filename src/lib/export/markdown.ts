import { Page, Block } from "../../types/workspace";

// Function to convert a block to Markdown syntax
// Each block type gets converted to its Markdown equivalent
function formatBlockToMarkdown(block: Block): string {
  // Get content from either content or text field
  const content = block.content || block.text || "";

  switch (block.type) {
    case "heading1":
      // H1 in Markdown uses single #
      return `# ${content}`;
    case "heading2":
      // H2 uses double ##
      return `## ${content}`;
    case "heading3":
      // H3 uses triple ###
      return `### ${content}`;
    case "paragraph":
      // Paragraphs are just plain text in Markdown
      return content || "";
    case "bulleted-list":
      // Bullet lists use - or *
      return `- ${content}`;
    case "numbered-list":
      // Numbered lists use 1. (Markdown auto-increments)
      return `1. ${content}`;
    case "quote":
      // Blockquotes use > prefix
      return `> ${content}`;
    case "code":
      // Code blocks use triple backticks
      return `\`\`\`\n${content}\n\`\`\``;
    case "checkbox":
      // Task lists use - [ ] for unchecked and - [x] for checked
      return `- [${block.checked ? "x" : " "}] ${content}`;
    case "image":
      // Images use ![alt](url) syntax
      return block.properties?.url ? `![Image](${block.properties.url})` : "";
    case "divider":
      // Horizontal rules use --- or ***
      return "---";
    case "callout":
      // Callouts can be represented as blockquotes with bold note
      return `> **Note:** ${content}`;
    case "table":
      // Tables need special formatting with pipes and dashes
      return formatTableToMarkdown(block.properties?.tableData);
    case "toggle":
      // Toggles can use HTML details/summary tags (supported in some Markdown flavors)
      return `<details>\n<summary>${content}</summary>\n\n</details>`;
    default:
      // Unknown types default to plain text
      return content;
  }
}

// Function to convert table data to Markdown table format
// Markdown tables use pipes | to separate columns and dashes for header separator
function formatTableToMarkdown(tableData: any): string {
  // Return empty string if no table data
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return "";
  }

  const rows = tableData.rows;
  let markdown = "";

  // First row becomes the header
  if (rows[0]) {
    // Add header row with pipes between cells
    markdown += "| " + rows[0].join(" | ") + " |\n";
    // Add separator row with dashes
    markdown += "| " + rows[0].map(() => "---").join(" | ") + " |\n";
  }

  // Add all remaining rows as table body
  for (let i = 1; i < rows.length; i++) {
    markdown += "| " + rows[i].join(" | ") + " |\n";
  }

  return markdown;
}

// Function to generate complete Markdown content with frontmatter
// Frontmatter is YAML metadata at the top of the file between --- markers
function generatePageMarkdown(page: Page): string {
  // Create YAML frontmatter with page metadata
  const metadata = `---
title: ${page.title}
icon: ${page.icon}
created: ${new Date(page.createdAt).toISOString()}
updated: ${new Date(page.updatedAt).toISOString()}
${page.createdBy ? `createdBy: ${page.createdBy}` : ""}
${page.lastEditedBy ? `lastEditedBy: ${page.lastEditedBy}` : ""}
---

`;

  // Convert all blocks to Markdown and join with double newlines
  // Filter out empty lines to avoid excessive whitespace
  const content = page.blocks
    .map((block) => formatBlockToMarkdown(block))
    .filter((line) => line.length > 0)
    .join("\n\n");

  // Combine metadata, title, and content
  return metadata + `# ${page.title}\n\n` + content;
}

// Public function to export page as Markdown file
// Creates a download link and triggers browser download
export function exportMarkdown(page: Page): void {
  const markdownContent = generatePageMarkdown(page);

  // Create temporary anchor element for download
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/markdown;charset=utf-8," + encodeURIComponent(markdownContent)
  );
  element.setAttribute("download", `${page.title}.md`);
  element.style.display = "none";

  // Add to DOM, trigger download, then remove
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Helper function to get Markdown content as string
// Useful for clipboard operations, previewing, or other non-download uses
export function getMarkdownContent(page: Page): string {
  return generatePageMarkdown(page);
}