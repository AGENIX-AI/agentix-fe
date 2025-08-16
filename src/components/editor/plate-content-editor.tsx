import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlateEditor } from "@/components/editor/plate-editor";
import type { ContentBlock } from "@/components/custom/PlateContentBlockEditor";

interface PlateContentEditorProps {
  contentBlocks: ContentBlock[];
  onSave: (blocks: ContentBlock[]) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

// Convert ContentBlocks to Plate.js value format
const convertBlocksToPlateValue = (blocks: ContentBlock[]): any[] => {
  console.log("Converting blocks to Plate value:", blocks);
  console.log("Blocks array length:", blocks.length);

  // Log block types for debugging
  const blockTypes = blocks.map((b) => b.type);
  console.log("Block types:", blockTypes);

  const result = blocks.map((block, index) => {
    console.log(`Converting block ${index}:`, block);
    console.log(`Block type: ${block.type}`);
    console.log(`Block data:`, block.data);

    // Base node with original ID preserved
    const baseNode = {
      id: block.id, // Preserve the original ID
      originalBlockId: block.originalBlockId, // Preserve the original block_id
    };

    switch (block.type) {
      case "paragraph":
        const paragraphResult = {
          ...baseNode,
          children: [{ text: (block.data as any).text || "" }],
          type: "p",
        };
        console.log(`Paragraph result:`, paragraphResult);
        return paragraphResult;

      case "header":
        const level = (block.data as any).level || 2;
        const headerResult = {
          ...baseNode,
          children: [{ text: (block.data as any).text || "" }],
          type: `h${level}`,
        };
        console.log(`Header result:`, headerResult);
        return headerResult;

      case "list":
        const listData = block.data as any;
        const listType = listData.style === "ordered" ? "ol" : "ul";
        const listItems = (listData.items || []).map((item: string) => ({
          children: [{ text: item || "" }],
          type: "li",
        }));
        const listResult = {
          ...baseNode,
          children: listItems,
          type: listType,
        };
        console.log(`List result:`, listResult);
        return listResult;

      case "quote":
        const quoteData = block.data as any;
        const quoteResult = {
          ...baseNode,
          children: [
            {
              children: [{ text: quoteData.text || "" }],
              type: "p",
            },
          ],
          type: "blockquote",
        };
        console.log(`Quote result:`, quoteResult);
        return quoteResult;

      case "code":
        const codeData = block.data as any;
        const codeResult = {
          ...baseNode,
          children: [{ text: codeData.code || "" }],
          type: "code_block",
        };
        console.log(`Code result:`, codeResult);
        return codeResult;

      case "image":
        const imageData = block.data as any;
        const imageResult = {
          ...baseNode,
          children: [{ text: "" }],
          type: "img",
          url: imageData.url || "",
          caption: imageData.caption || "",
        };
        console.log(`Image result:`, imageResult);
        return imageResult;

      case "checklist":
        const checklistData = block.data as any;
        const checklistItems = (checklistData.items || []).map((item: any) => ({
          children: [{ text: item.text || "" }],
          type: "li",
          checked: item.checked || false,
        }));
        const checklistResult = {
          ...baseNode,
          children: checklistItems,
          type: "ul",
        };
        console.log(`Checklist result:`, checklistResult);
        return checklistResult;

      case "separator":
        const separatorResult = {
          ...baseNode,
          children: [{ text: "" }],
          type: "hr",
        };
        console.log(`Separator result:`, separatorResult);
        return separatorResult;

      case "url":
        const urlData = block.data as any;
        const urlResult = {
          ...baseNode,
          children: [{ text: urlData.title || urlData.url || "" }],
          type: "a",
          url: urlData.url || "",
        };
        console.log(`URL result:`, urlResult);
        return urlResult;

      default:
        const defaultResult = {
          ...baseNode,
          children: [{ text: (block.data as any).text || "" }],
          type: "p",
        };
        console.log(`Default result:`, defaultResult);
        return defaultResult;
    }
  });

  console.log("Final Plate value:", result);
  console.log("Plate value length:", result.length);

  // Check if we lost any blocks
  if (result.length !== blocks.length) {
    console.warn(
      `WARNING: Lost blocks during conversion! Input: ${blocks.length}, Output: ${result.length}`
    );
    console.log("Input blocks:", blocks);
    console.log("Output result:", result);
  }

  return result;
};

// Convert Plate.js value back to ContentBlocks
const convertPlateValueToBlocks = (value: any[]): ContentBlock[] => {
  console.log("convertPlateValueToBlocks called with:", value);
  console.log("Value length:", value?.length);

  // Ensure value is an array
  if (!Array.isArray(value) || value.length === 0) {
    console.log("Value is not array or empty, returning empty array");
    return [];
  }

  const result = value
    .map((node, index) => {
      console.log(`Processing node ${index}:`, node);
      console.log(`Node type: ${node.type}`);
      console.log(`Node children:`, node.children);

      // Preserve the original ID and originalBlockId from the node
      const blockId = node.id || `block-${Date.now()}-${index}`;
      const originalBlockId = node.originalBlockId || null;

      switch (node.type) {
        case "p":
          const paragraphText =
            node.children
              ?.map((child: any) =>
                typeof child === "string" ? child : child.text || ""
              )
              .join("") || "";

          console.log(`Paragraph text: "${paragraphText}"`);

          // Don't skip paragraphs - keep all content
          return {
            id: blockId,
            type: "paragraph" as const,
            data: { text: paragraphText },
            order: index,
            section: "", // Will be set by the parent component
            originalBlockId: originalBlockId,
          };
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          const level = parseInt(node.type.charAt(1));
          const headerText =
            node.children
              ?.map((child: any) =>
                typeof child === "string" ? child : child.text || ""
              )
              .join("") || "";

          console.log(`Header level ${level}, text: "${headerText}"`);

          return {
            id: blockId,
            type: "header" as const,
            data: {
              text: headerText,
              level,
            },
            order: index,
            section: "", // Will be set by the parent component
            originalBlockId: originalBlockId,
          };
        case "ul":
        case "ol":
          const items =
            node.children?.map(
              (child: any) =>
                child.children
                  ?.map((grandChild: any) =>
                    typeof grandChild === "string"
                      ? grandChild
                      : grandChild.text || ""
                  )
                  .join("") || ""
            ) || [];

          // Keep all items, even if they appear empty
          console.log(`List items:`, items);

          return {
            id: blockId,
            type: "list" as const,
            data: {
              style: node.type === "ol" ? "ordered" : "unordered",
              items: items,
            },
            order: index,
            section: "", // Will be set by the parent component
            originalBlockId: originalBlockId,
          };
        case "blockquote":
          const quoteText =
            node.children?.[0]?.children
              ?.map((child: any) =>
                typeof child === "string" ? child : child.text || ""
              )
              .join("") || "";

          console.log(`Quote text: "${quoteText}"`);

          return {
            id: blockId,
            type: "quote" as const,
            data: {
              text: quoteText,
              caption: "",
            },
            order: index,
            section: "", // Will be set by the parent component
            originalBlockId: originalBlockId,
          };
        case "code_block":
          const codeText =
            node.children
              ?.map((child: any) =>
                typeof child === "string" ? child : child.text || ""
              )
              .join("") || "";

          console.log(`Code text: "${codeText}"`);

          return {
            id: blockId,
            type: "code" as const,
            data: {
              code: codeText,
              language: node.lang || "text",
            },
            order: index,
            section: "", // Will be set by the parent component
            originalBlockId: originalBlockId,
          };
        case "img":
          console.log(`Image: url=${node.url}, caption=${node.caption}`);
          return {
            id: blockId,
            type: "image" as const,
            data: {
              url: node.url || "",
              caption: node.caption || "",
            },
            order: index,
            section: "", // Will be set by the parent component
            originalBlockId: originalBlockId,
          };
        case "hr":
          console.log("Separator found");
          return {
            id: blockId,
            type: "separator" as const,
            data: { style: "horizontal_line" },
            order: index,
            section: "", // Will be set by the parent component
            originalBlockId: originalBlockId,
          };
        case "a":
          const linkText =
            node.children
              ?.map((child: any) =>
                typeof child === "string" ? child : child.text || ""
              )
              .join("") || "";

          console.log(`Link: text="${linkText}", url=${node.url}`);

          return {
            id: blockId,
            type: "url" as const,
            data: {
              url: node.url || "",
              title: linkText,
            },
            order: index,
            section: "", // Will be set by the parent component
            originalBlockId: originalBlockId,
          };
        default:
          const defaultText =
            node.children
              ?.map((child: any) =>
                typeof child === "string" ? child : child.text || ""
              )
              .join("") || "";

          console.log(`Default case: text="${defaultText}"`);

          return {
            id: blockId,
            type: "paragraph" as const,
            data: { text: defaultText },
            order: index,
            section: "", // Will be set by the parent component
            originalBlockId: originalBlockId,
          };
      }
    })
    .filter(Boolean) as ContentBlock[]; // Remove null values and type as ContentBlock[]

  console.log("Final result:", result);
  return result;
};

export function PlateContentEditor({
  contentBlocks,
  onSave,
  onCancel,
}: PlateContentEditorProps) {
  console.log(
    "PlateContentEditor initialized with contentBlocks:",
    contentBlocks
  );
  console.log("ContentBlocks length:", contentBlocks.length);

  const [plateValue, setPlateValue] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<any>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update plateValue when contentBlocks change
  useEffect(() => {
    console.log("ContentBlocks changed, updating plateValue:", contentBlocks);
    if (contentBlocks && contentBlocks.length > 0) {
      const newPlateValue = convertBlocksToPlateValue(contentBlocks);
      console.log("New plate value:", newPlateValue);
      setPlateValue(newPlateValue);
      setHasChanges(false); // Reset changes when new content is loaded
    } else {
      console.log("No content blocks, setting empty plate value");
      setPlateValue([]);
      setHasChanges(false);
    }
  }, [contentBlocks]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Auto-save function
  const autoSave = async (value: any[]) => {
    if (isSaving) return; // Prevent multiple simultaneous saves

    try {
      setIsSaving(true);

      // Always try to get the current value from the editor to ensure we have the latest
      let currentValue = value;

      // If the passed value seems incomplete, get it from the editor
      if (
        !Array.isArray(currentValue) ||
        currentValue.length === 0 ||
        currentValue.length < contentBlocks.length
      ) {
        console.log("Value seems incomplete, getting from editor");
        if (editorRef.current) {
          // Try multiple ways to get the current content
          currentValue =
            editorRef.current.children ||
            editorRef.current.value ||
            editorRef.current.getContent?.() ||
            value;
        }
      }

      // If we still don't have a good value, use the last known plateValue
      if (!Array.isArray(currentValue) || currentValue.length === 0) {
        console.log("Using last known plateValue:", plateValue);
        currentValue = plateValue;
      }

      // Safety check: if we're losing too many blocks, don't auto-save
      if (currentValue.length < contentBlocks.length * 0.5) {
        return;
      }

      if (!Array.isArray(currentValue) || currentValue.length === 0) {
        return;
      }

      const newBlocks = convertPlateValueToBlocks(currentValue);

      // Only save if we have a reasonable number of blocks
      if (newBlocks.length > 0) {
        await onSave(newBlocks);
        setHasChanges(false);
      } else {
        console.warn("No blocks to save, skipping");
      }
    } catch (error) {
      console.error("Error auto-saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle editor content changes with auto-save
  const handleEditorChange = (value: any[]) => {
    console.log("Editor changed:", value);
    if (Array.isArray(value)) {
      setPlateValue(value);
      setHasChanges(true);

      // Debounced auto-save to avoid excessive saves
      // Clear any existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout
      autoSaveTimeoutRef.current = setTimeout(() => {
        console.log("Auto-save timeout triggered");
        autoSave(value);
      }, 1000); // Increased delay to 1 second
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Plate.js Editor */}
      <div className="border rounded-lg bg-background flex-1 min-h-0">
        <PlateEditor
          value={plateValue}
          onChange={handleEditorChange}
          ref={editorRef}
        />
      </div>
    </div>
  );
}
