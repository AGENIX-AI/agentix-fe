import { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import Mathematics from "@tiptap/extension-mathematics";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import UnderlineExtension from "@tiptap/extension-underline";
import type { ContentBlock } from "@/api/admin/helpCenter";
import { convertBlocksToJSON } from "@/components/editor/utils/content-blocks";
import "katex/dist/katex.min.css";
import "@/styles/tiptap-editor.css";

interface TiptapContentBlocksViewerProps {
  blocks: ContentBlock[];
  className?: string;
  placeholder?: string;
  minHeight?: number | string;
}

export function TiptapContentBlocksViewer({
  blocks,
  className = "",
  placeholder = "",
  minHeight = 0,
}: TiptapContentBlocksViewerProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        dropcursor: { color: "transparent", width: 0 },
      }),
      Link.configure({ openOnClick: true }),
      Image,
      TableKit,
      Mathematics,
      TextStyle,
      Color,
      Highlight,
      UnderlineExtension,
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: convertBlocksToJSON(blocks) as any,
    editable: false,
    onCreate: ({ editor }) => {
      editor.setEditable(false);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const jsonContent = convertBlocksToJSON(blocks);
    editor.commands.setContent(jsonContent as any, { emitUpdate: false });
  }, [editor, blocks]);

  return (
    <div className={`tiptap-editor-container ${className}`}>
      <EditorContent
        editor={editor}
        className="tiptap-editor prose prose-sm max-w-none p-0"
        style={{
          minHeight:
            typeof minHeight === "number" ? `${minHeight}px` : minHeight,
        }}
        aria-readonly
        role="document"
      />
      {!editor && placeholder && (
        <div className="text-sm text-muted-foreground">{placeholder}</div>
      )}
    </div>
  );
}

export default TiptapContentBlocksViewer;
