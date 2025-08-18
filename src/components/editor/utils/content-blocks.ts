import type { ContentBlock } from "@/api/admin/helpCenter";

// Helpers
export const getTextFromNode = (node: any): string => {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  if (Array.isArray(node.content))
    return node.content.map(getTextFromNode).join("");
  return "";
};

export type MarkRange = { from: number; to: number; type: string; attrs?: any };

export const extractTextAndMarksFromNode = (
  node: any
): { text: string; marks: MarkRange[] } => {
  let text = "";
  const marks: MarkRange[] = [];

  const walk = (n: any) => {
    if (!n) return;
    if (n.type === "text") {
      const start = text.length;
      const value = n.text || "";
      text += value;
      const len = value.length;
      (n.marks || []).forEach((m: any) => {
        marks.push({
          from: start,
          to: start + len,
          type: m.type,
          attrs: m.attrs,
        });
      });
      return;
    }
    if (Array.isArray(n.content)) n.content.forEach(walk);
  };
  walk(node);

  // Normalize and merge adjacent identical mark ranges
  const merged: MarkRange[] = [];
  marks
    .sort((a, b) =>
      a.type === b.type ? a.from - b.from : a.type.localeCompare(b.type)
    )
    .forEach((r) => {
      const prev = merged[merged.length - 1];
      if (
        prev &&
        prev.type === r.type &&
        JSON.stringify(prev.attrs || {}) === JSON.stringify(r.attrs || {}) &&
        prev.to === r.from
      ) {
        prev.to = r.to;
      } else {
        merged.push({ ...r });
      }
    });

  return { text, marks: merged };
};

export const buildTextNodesFromTextAndMarks = (
  text: string,
  markRanges: MarkRange[]
): any[] => {
  if (!text) return [];
  const breakpoints = new Set<number>([0, text.length]);
  markRanges.forEach((m) => {
    breakpoints.add(Math.max(0, Math.min(text.length, m.from)));
    breakpoints.add(Math.max(0, Math.min(text.length, m.to)));
  });
  const sorted = Array.from(breakpoints).sort((a, b) => a - b);

  const segments: { from: number; to: number }[] = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const from = sorted[i];
    const to = sorted[i + 1];
    if (to > from) segments.push({ from, to });
  }

  return segments.map(({ from, to }) => {
    const segmentText = text.slice(from, to);
    const activeMarks = markRanges
      .filter((m) => m.from <= from && m.to >= to)
      .map((m) => ({ type: m.type, attrs: m.attrs }));
    const node: any = { type: "text", text: segmentText };
    if (activeMarks.length > 0) node.marks = activeMarks;
    return node;
  });
};

export const convertBlocksToJSON = (blocks: ContentBlock[]): any => {
  const doc: any = { type: "doc", content: [] as any[] };
  for (const block of blocks || []) {
    switch (block.type) {
      case "header": {
        const level = (block.data.level as number) || 1;
        const nodes = buildTextNodesFromTextAndMarks(
          String(block.data.text || ""),
          (block.data.marks || []) as MarkRange[]
        );
        doc.content.push({ type: "heading", attrs: { level }, content: nodes });
        break;
      }
      case "paragraph": {
        const nodes = buildTextNodesFromTextAndMarks(
          String(block.data.text || ""),
          (block.data.marks || []) as MarkRange[]
        );
        doc.content.push({ type: "paragraph", content: nodes });
        break;
      }
      case "list": {
        const isOrdered = block.data.style === "ordered";
        const listNode: any = {
          type: isOrdered ? "orderedList" : "bulletList",
          content: (block.data.items || []).map((item: string) => ({
            type: "listItem",
            content: [
              { type: "paragraph", content: [{ type: "text", text: item }] },
            ],
          })),
        };
        doc.content.push(listNode);
        break;
      }
      case "code": {
        doc.content.push({
          type: "codeBlock",
          content: block.data.code
            ? [{ type: "text", text: String(block.data.code) }]
            : [],
        });
        break;
      }
      case "quote": {
        const nodes = buildTextNodesFromTextAndMarks(
          String(block.data.text || ""),
          (block.data.marks || []) as MarkRange[]
        );
        doc.content.push({
          type: "blockquote",
          content: [{ type: "paragraph", content: nodes }],
        });
        break;
      }
      case "image": {
        doc.content.push({
          type: "image",
          attrs: { src: block.data.url || "", alt: block.data.caption || "" },
        });
        break;
      }
      case "separator": {
        doc.content.push({ type: "horizontalRule" });
        break;
      }
      default:
        break;
    }
  }
  return doc;
};

export const convertJSONToBlocks = (
  json: any,
  previousBlocks: ContentBlock[]
): ContentBlock[] => {
  const docContent: any[] = json?.content || [];
  const blocks: ContentBlock[] = [];
  let order = 0;

  for (const node of docContent) {
    let nextBlock: ContentBlock | null = null;
    switch (node.type) {
      case "heading": {
        const level = node.attrs?.level ?? 1;
        const { text, marks } = extractTextAndMarksFromNode({
          type: "paragraph",
          content: node.content || [],
        });
        nextBlock = {
          id:
            previousBlocks?.[order]?.id ||
            `block-${Date.now()}-${Math.random()}`,
          type: "header",
          data: {
            text,
            marks,
            level: level as 1 | 2 | 3 | 4 | 5 | 6,
          },
          order,
        };
        break;
      }
      case "paragraph": {
        const { text, marks } = extractTextAndMarksFromNode(node);
        if (text.trim().length > 0 || marks.length > 0) {
          nextBlock = {
            id:
              previousBlocks?.[order]?.id ||
              `block-${Date.now()}-${Math.random()}`,
            type: "paragraph",
            data: { text, marks },
            order,
          };
        }
        break;
      }
      case "orderedList":
      case "bulletList": {
        const items: string[] = [];
        (node.content || []).forEach((li: any) => {
          const paragraph = (li.content || []).find(
            (c: any) => c.type === "paragraph"
          );
          items.push(getTextFromNode(paragraph));
        });
        if (items.length > 0) {
          nextBlock = {
            id:
              previousBlocks?.[order]?.id ||
              `block-${Date.now()}-${Math.random()}`,
            type: "list",
            data: {
              items,
              style: node.type === "orderedList" ? "ordered" : "unordered",
            },
            order,
          };
        }
        break;
      }
      case "blockquote": {
        const combined = { type: "paragraph", content: [] as any[] };
        (node.content || []).forEach((child: any) => {
          if (child?.type === "paragraph" && Array.isArray(child.content)) {
            combined.content.push(...child.content);
          }
        });
        const { text, marks } = extractTextAndMarksFromNode(combined);
        nextBlock = {
          id:
            previousBlocks?.[order]?.id ||
            `block-${Date.now()}-${Math.random()}`,
          type: "quote",
          data: { text, marks, caption: "" },
          order,
        };
        break;
      }
      case "codeBlock": {
        nextBlock = {
          id:
            previousBlocks?.[order]?.id ||
            `block-${Date.now()}-${Math.random()}`,
          type: "code",
          data: { code: getTextFromNode(node), language: "plaintext" },
          order,
        };
        break;
      }
      case "image": {
        nextBlock = {
          id:
            previousBlocks?.[order]?.id ||
            `block-${Date.now()}-${Math.random()}`,
          type: "image",
          data: { url: node.attrs?.src || "", caption: node.attrs?.alt || "" },
          order,
        };
        break;
      }
      case "horizontalRule": {
        nextBlock = {
          id:
            previousBlocks?.[order]?.id ||
            `block-${Date.now()}-${Math.random()}`,
          type: "separator",
          data: { style: "horizontal_line" },
          order,
        };
        break;
      }
      default:
        break;
    }

    if (nextBlock) {
      blocks.push(nextBlock);
      order += 1;
    }
  }

  return blocks;
};
