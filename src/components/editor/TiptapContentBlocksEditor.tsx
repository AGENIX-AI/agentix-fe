import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import Mathematics from "@tiptap/extension-mathematics";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import "katex/dist/katex.min.css";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Strikethrough,
  Underline,
  Highlighter,
  GripVertical,
} from "lucide-react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { Button } from "@/components/ui/button";
import type { ContentBlock } from "@/api/admin/helpCenter";
import {
  convertBlocksToJSON,
  convertJSONToBlocks,
} from "@/components/editor/utils/content-blocks";
import "@/styles/tiptap-editor.css";
import { SlashDropdownMenu } from "@/components/tiptap-ui/slash-dropdown-menu";

interface TiptapContentBlocksEditorProps {
  blocks: ContentBlock[];
  previousBlocks?: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  placeholder?: string;
}

export function TiptapContentBlocksEditor({
  blocks,
  previousBlocks,
  onChange,
  placeholder = "Type '/' for commands...",
}: TiptapContentBlocksEditorProps) {
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [, forceToolbarRefresh] = useState(0);
  // Guard to avoid resetting editor content after internal onChange
  const isInternalUpdateRef = useRef(false);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        dropcursor: { color: "#3b82f6", width: 2 },
      }),
      Link.configure({ openOnClick: false }),
      Image,
      TableKit,
      Mathematics,
      TaskList,
      TaskItem,
      TextStyle,
      Color,
      Highlight,
      Placeholder.configure({ placeholder }),
      UnderlineExtension,
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content: "",
    editable: true,
    onUpdate: ({ editor }) => {
      const { state } = editor;
      const { selection } = state;
      const textBeforeCursor = state.doc.textBetween(
        Math.max(0, selection.from - 200),
        selection.from
      );
      const lastLine = textBeforeCursor.split("\n").pop() || "";
      const isSlashQuery = lastLine.trimStart().startsWith("/");
      if (isSlashQuery) setShowSlashCommands(true);
      else if (showSlashCommands && !isSlashQuery) setShowSlashCommands(false);

      // Emit converted content blocks on each update
      try {
        const json = editor.getJSON();
        const converted = convertJSONToBlocks(json, previousBlocks || []);
        isInternalUpdateRef.current = true;
        onChange(converted);
      } catch {
        // ignore transient conversion errors during typing
      }
    },
  });

  // Reflect selection changes to update toolbar active states
  useEffect(() => {
    if (!editor) return;
    const handler = () => forceToolbarRefresh((v) => v + 1);
    editor.on("selectionUpdate", handler);
    editor.on("transaction", handler);
    editor.on("update", handler);
    return () => {
      editor.off("selectionUpdate", handler);
      editor.off("transaction", handler);
      editor.off("update", handler);
    };
  }, [editor]);

  // Convert incoming blocks to TipTap JSON and set into editor
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }
    const jsonContent = convertBlocksToJSON(blocks);
    editor.commands.setContent(jsonContent as any, { emitUpdate: false });
  }, [editor, blocks]);

  // Keyboard shortcuts for slash menu
  useEffect(() => {
    if (!editor) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showSlashCommands) {
        event.preventDefault();
        setShowSlashCommands(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, showSlashCommands]);

  return (
    <div className="space-y-4">
      {editor && (
        <div className="tiptap-toolbar">
          <div className="flex flex-wrap gap-1">
            {/* History */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className={`h-8 w-8 p-0 ${
                !editor.can().undo() ? "opacity-50" : ""
              }`}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className={`h-8 w-8 p-0 ${
                !editor.can().redo() ? "opacity-50" : ""
              }`}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <div className="tiptap-toolbar-divider" />

            {/* Headings */}
            <select
              onChange={(e) => {
                const level = parseInt(e.target.value);
                if (level === 0) editor.chain().focus().setParagraph().run();
                else
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({ level: level as 1 | 2 | 3 })
                    .run();
              }}
              value={
                editor.isActive("heading", { level: 1 })
                  ? "1"
                  : editor.isActive("heading", { level: 2 })
                  ? "2"
                  : editor.isActive("heading", { level: 3 })
                  ? "3"
                  : "0"
              }
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="0">Paragraph</option>
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
            </select>
            <div className="tiptap-toolbar-divider" />

            {/* Lists */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("bulletList")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("orderedList")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("blockquote")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <div className="tiptap-toolbar-divider" />

            {/* Text Formatting */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("bold")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("italic")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("strike")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("underline")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("highlight")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <Highlighter className="h-4 w-4" />
            </Button>
            <div className="tiptap-toolbar-divider" />

            {/* Code */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("code")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("codeBlock")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <Code className="h-4 w-4" />
            </Button>
            <div className="tiptap-toolbar-divider" />

            {/* Links */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = window.prompt("Enter URL");
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              className={`h-8 w-8 p-0 ${
                editor.isActive("link")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = window.prompt("Enter image URL");
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }}
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <div className="tiptap-toolbar-divider" />

            {/* Tables & Math */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              className="h-8 w-8 p-0"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const latex = window.prompt(
                  "Enter LaTeX (e.g. \\frac{a}{b})",
                  ""
                );
                if (latex !== null) {
                  const chain: any = editor.chain().focus();
                  if (typeof chain.insertBlockMath === "function") {
                    chain.insertBlockMath({ latex }).run();
                  } else if (typeof chain.insertInlineMath === "function") {
                    chain.insertInlineMath({ latex }).run();
                  }
                }
              }}
              className="h-8 w-8 p-0"
              title="Insert Math (LaTeX)"
            >
              <span className="text-sm leading-none">∑</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={`h-8 w-8 p-0 ${
                editor.isActive("taskList")
                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                  : ""
              }`}
              title="Toggle Task List"
            >
              <span className="text-sm leading-none">☑️</span>
            </Button>
            <div className="tiptap-toolbar-divider" />
          </div>
        </div>
      )}

      <div className="tiptap-editor-container relative pl-2">
        <EditorContent
          editor={editor}
          className="tiptap-editor prose prose-sm max-w-none p-6 min-h-[300px] focus:outline-none"
        />

        {editor && (
          <DragHandle editor={editor} className="bg-transparent pr-1">
            <div className="tiptap-drag-handle flex h-6 w-6 items-center justify-center rounded-md border border-border bg-transparent shadow-none">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </DragHandle>
        )}

        <SlashDropdownMenu
          editor={editor}
          config={{
            enabledItems: [
              "text",
              "heading_1",
              "heading_2",
              "bullet_list",
              "quote",
            ],
            showGroups: true,
            itemGroups: {
              text: "Style",
              heading_1: "Style",
              heading_2: "Style",
              bullet_list: "Lists",
              quote: "Style",
            },
          }}
        />
      </div>
    </div>
  );
}

// helpers moved to utils/content-blocks.ts
