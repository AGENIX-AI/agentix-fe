/**
 * Extracts initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Formats date to a readable string
 */
export function formatMessageDate(timestamp: string): string {
  if (!timestamp) return "";
  console.log("timestamp", timestamp);
  const date = new Date(Number(timestamp) * 1000); // Convert seconds to ms
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Bangkok",
  }).format(date);
  return formattedDate;
}

/**
 * Escapes markdown image syntax
 */
export function escapeMarkdownImage(imageUrl: string, text?: string): string {
  const encoded = encodeURIComponent(imageUrl);
  const escapedImageMarkdown = `![image](${encoded})`;
  return text ? `${escapedImageMarkdown}\n\n${text}` : escapedImageMarkdown;
}

/**
 * Processes message content to handle text and embedded images
 * Converts markdown image syntax to HTML and handles URL encoding
 * Also processes numbered lists, bullet lists, formatting, and preserves LaTeX
 */
export function processMessageContent(content: string): {
  cleanedContent: string;
  imageUrls: string[];
} {
  if (!content) return { cleanedContent: "", imageUrls: [] };

  const imageUrls: string[] = [];

  // Store LaTeX expressions to restore later
  const latexBlocks: { placeholder: string; content: string }[] = [];
  let processedContent = content;

  // Preserve LaTeX blocks (display math)
  const displayMathRegex = /\$\$([\s\S]*?)\$\$/g;
  processedContent = processedContent.replace(displayMathRegex, (match, _) => {
    const placeholder = `__LATEX_DISPLAY_${latexBlocks.length}__`;
    latexBlocks.push({ placeholder, content: match });
    return placeholder;
  });

  // Preserve LaTeX inline math
  const inlineMathRegex = /\$((?!\$)[\s\S]*?)\$/g;
  processedContent = processedContent.replace(inlineMathRegex, (match, _) => {
    const placeholder = `__LATEX_INLINE_${latexBlocks.length}__`;
    latexBlocks.push({ placeholder, content: match });
    return placeholder;
  });

  // Extract image URLs from markdown syntax ![text](url)
  const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let match;

  while ((match = markdownImageRegex.exec(content)) !== null) {
    const [fullMatch, altText, encodedUrl] = match;
    const decodedUrl = decodeURIComponent(encodedUrl);
    imageUrls.push(decodedUrl);

    // Replace markdown with HTML img tag
    const imgHtml = `<img src="${decodedUrl}" alt="${altText}" class="max-w-full rounded-md my-2" />`;
    processedContent = processedContent.replace(fullMatch, imgHtml);
  }

  // Process lists (both numbered and bullet)
  const lines = processedContent.split(/\r?\n/);
  const processedLines: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Process headings (###)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const headingClasses = {
        1: "text-2xl font-bold mt-6 mb-4",
        2: "text-xl font-bold mt-5 mb-3",
        3: "text-lg font-bold mt-4 mb-2",
        4: "text-base font-semibold mt-3 mb-2",
        5: "text-sm font-semibold mt-2 mb-1",
        6: "text-xs font-semibold mt-2 mb-1",
      };
      processedLines.push(
        `<h${level} class="${
          headingClasses[level as keyof typeof headingClasses]
        }">${headingText}</h${level}>`
      );
      i++;
      continue;
    }

    const numberedListMatch = line.match(/^(\d+)\.\s+(.*)/);
    const bulletListMatch = line.match(/^\s*[-*+]\s+(.*)/);

    // Check if this line starts a list
    if (numberedListMatch || bulletListMatch) {
      // Determine list type
      const isNumbered = !!numberedListMatch;
      const listTag = isNumbered ? "ol" : "ul";
      const listClass = isNumbered
        ? "my-4 ml-2 list-decimal [&>li]:mt-2"
        : "my-4 ml-2 list-disc [&>li]:mt-2";

      const listItems: string[] = [];

      let j = i;

      // Process list items
      while (j < lines.length) {
        const currentLine = lines[j];
        const currentNumberedMatch = currentLine.match(/^(\d+)\.\s+(.*)/);
        const currentBulletMatch = currentLine.match(/^\s*[-*+]\s+(.*)/);

        // If not a list item, break out of the loop
        if (!currentNumberedMatch && !currentBulletMatch) {
          break;
        }

        // Get the content of the list item
        const itemContent = currentNumberedMatch
          ? currentNumberedMatch[2].trim()
          : currentBulletMatch![1].trim();

        // Check for nested list items in the next lines
        const nestedItems: string[] = [];
        let k = j + 1;
        let hasNestedList = false;

        while (k < lines.length) {
          const nestedLine = lines[k];
          const nestedNumberedMatch = nestedLine.match(/^\s+(\d+)\.\s+(.*)/);
          const nestedBulletMatch = nestedLine.match(/^\s+[-*+]\s+(.*)/);

          if (nestedNumberedMatch || nestedBulletMatch) {
            // This is a nested list item
            hasNestedList = true;
            nestedItems.push(nestedLine);
            k++;
          } else if (hasNestedList && nestedLine.trim() === "") {
            // Empty line after nested list, still part of the nesting
            nestedItems.push(nestedLine);
            k++;
          } else {
            // Not a nested list item
            break;
          }
        }

        // Process nested list if any
        let nestedListHtml = "";
        if (nestedItems.length > 0) {
          // Process nested list items
          const nestedNumberedList = nestedItems.some((item) =>
            /^\s+\d+\.\s+/.test(item)
          );
          const nestedBulletList = nestedItems.some((item) =>
            /^\s+[-*+]\s+/.test(item)
          );

          if (nestedNumberedList || nestedBulletList) {
            const nestedTag = nestedNumberedList ? "ol" : "ul";
            const nestedClass = nestedNumberedList
              ? "ml-4 mt-2 list-decimal [&>li]:mt-1"
              : "ml-4 mt-2 list-disc [&>li]:mt-1";

            const nestedListItems: string[] = [];

            for (const nestedItem of nestedItems) {
              const nestedNumbered = nestedItem.match(/^\s+(\d+)\.\s+(.*)/);
              const nestedBullet = nestedItem.match(/^\s+[-*+]\s+(.*)/);

              if (nestedNumbered || nestedBullet) {
                const nestedContent = nestedNumbered
                  ? nestedNumbered[2].trim()
                  : nestedBullet![1].trim();

                nestedListItems.push(`<li>${nestedContent}</li>`);
              }
            }

            if (nestedListItems.length > 0) {
              nestedListHtml = `
<${nestedTag} class="${nestedClass}">
  ${nestedListItems.join("\n  ")}
</${nestedTag}>`;
            }
          }

          // Skip the nested items in the main loop
          j = k;
        } else {
          // No nested items, move to the next line
          j++;
        }

        // Add the list item with any nested list
        listItems.push(`<li>${itemContent}${nestedListHtml}</li>`);
      }

      // Create the list HTML
      if (listItems.length > 0) {
        // Add start attribute for ordered lists to make them cumulative
        const startAttr =
          isNumbered && numberedListMatch
            ? ` start="${numberedListMatch[1]}"`
            : "";
        const listHtml = `<${listTag}${startAttr} class="${listClass}">
  ${listItems.join("\n  ")}
</${listTag}>`;

        processedLines.push(listHtml);
        i = j; // Skip processed lines
      } else {
        // No list items found, just add the line
        processedLines.push(line);
        i++;
      }
    } else {
      // Not a list item, just add the line
      processedLines.push(line);
      i++;
    }
  }

  // Join the processed lines back together
  processedContent = processedLines.join("\n");

  // Process markdown tables
  processedContent = processMarkdownTables(processedContent);

  // Process bold text (**text**)
  processedContent = processedContent.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  // Restore LaTeX expressions
  for (const { placeholder, content } of latexBlocks) {
    // Check if this placeholder is alone on its line (surrounded only by whitespace)
    const placeholderRegex = new RegExp(`^\\s*${placeholder}\\s*$`, "m");
    const isStandalone = placeholderRegex.test(processedContent);

    // If it's a display math placeholder and it's alone on a line, wrap it in a centered div
    if (placeholder.includes("LATEX_DISPLAY") && isStandalone) {
      processedContent = processedContent.replace(
        placeholderRegex,
        `<div class="flex justify-center my-4">${content}</div>`
      );
    } else {
      processedContent = processedContent.replace(placeholder, content);
    }
  }

  return {
    cleanedContent: processedContent,
    imageUrls,
  };
}

/**
 * Processes markdown tables and converts them to HTML
 */
function processMarkdownTables(content: string): string {
  // Split content into lines to process tables separately
  const lines = content.split(/\r?\n/);
  const processedLines: string[] = [];

  let inTable = false;
  let tableRows: string[] = [];
  let headerRow = "";
  let alignments: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for table row (contains | character)
    if (line.includes("|")) {
      // If this is potentially the start of a table
      if (!inTable) {
        inTable = true;
        tableRows = [];
        headerRow = "";

        // Store the header row
        headerRow = line;

        // Check if the next line is a separator row
        if (i + 1 < lines.length && lines[i + 1].trim().includes("|")) {
          const separatorRow = lines[i + 1].trim();
          // Check if it's a valid separator row (contains only |, -, :)
          if (/^[\|\-:\s]+$/.test(separatorRow)) {
            // Extract alignment information
            alignments = separatorRow
              .split("|")
              .filter((cell) => cell.trim() !== "")
              .map((cell) => {
                cell = cell.trim();
                if (cell.startsWith(":") && cell.endsWith(":")) {
                  return "text-center";
                } else if (cell.endsWith(":")) {
                  return "text-right";
                } else {
                  return "text-left";
                }
              });

            // Skip the separator row in the next iteration
            i++;
            continue;
          }
        }
      } else {
        // Add to table rows
        tableRows.push(line);
      }
    } else if (inTable) {
      // End of table encountered
      inTable = false;

      // Process the collected table data
      if (headerRow && tableRows.length > 0) {
        const headerCells = headerRow
          .split("|")
          .filter((cell) => cell.trim() !== "")
          .map((cell, index) => {
            const alignment = alignments[index] || "text-left";
            return `<th class="border border-gray-300 px-4 py-2 ${alignment}">${cell.trim()}</th>`;
          });

        const bodyRows = tableRows.map((row) => {
          const cells = row
            .split("|")
            .filter((cell) => cell.trim() !== "")
            .map((cell, index) => {
              const alignment = alignments[index] || "text-left";
              return `<td class="border border-gray-300 px-4 py-2 ${alignment}">${cell.trim()}</td>`;
            });

          return `<tr>${cells.join("")}</tr>`;
        });

        const tableHtml = `
<div class="overflow-x-auto my-4">
  <table class="min-w-full bg-white border border-gray-300 rounded-md">
    <thead class="bg-gray-100">
      <tr>${headerCells.join("")}</tr>
    </thead>
    <tbody>
      ${bodyRows.join("\n      ")}
    </tbody>
  </table>
</div>`;

        processedLines.push(tableHtml);
      }

      // Add the current non-table line
      processedLines.push(line);
    } else {
      // Regular non-table line
      processedLines.push(line);
    }
  }

  // Handle case where the table is at the end of the content
  if (inTable && headerRow && tableRows.length > 0) {
    const headerCells = headerRow
      .split("|")
      .filter((cell) => cell.trim() !== "")
      .map((cell, index) => {
        const alignment = alignments[index] || "text-left";
        return `<th class="border border-gray-300 px-4 py-2 ${alignment}">${cell.trim()}</th>`;
      });

    const bodyRows = tableRows.map((row) => {
      const cells = row
        .split("|")
        .filter((cell) => cell.trim() !== "")
        .map((cell, index) => {
          const alignment = alignments[index] || "text-left";
          return `<td class="border border-gray-300 px-4 py-2 ${alignment}">${cell.trim()}</td>`;
        });

      return `<tr>${cells.join("")}</tr>`;
    });

    const tableHtml = `
<div class="overflow-x-auto my-4">
  <table class="min-w-full bg-white border border-gray-300 rounded-md">
    <thead class="bg-gray-100">
      <tr>${headerCells.join("")}</tr>
    </thead>
    <tbody>
      ${bodyRows.join("\n      ")}
    </tbody>
  </table>
</div>`;

    processedLines.push(tableHtml);
  }

  return processedLines.join("\n");
}
