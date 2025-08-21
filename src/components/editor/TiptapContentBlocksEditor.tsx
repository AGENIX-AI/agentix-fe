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
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Underline,
  Highlighter,
  GripVertical,
} from "lucide-react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Combobox } from "@/components/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
    <div className="space-y-2 border border-border rounded-md">
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

            {/* Headings combobox (Aa) */}
            <Combobox
              options={[
                { value: "0", label: "P" },
                { value: "1", label: "H1" },
                { value: "2", label: "H2" },
                { value: "3", label: "H3" },
              ]}
              value={
                editor.isActive("heading", { level: 1 })
                  ? "1"
                  : editor.isActive("heading", { level: 2 })
                  ? "2"
                  : editor.isActive("heading", { level: 3 })
                  ? "3"
                  : "0"
              }
              triggerLabel={
                <span className="flex text-sm">
                  <span className="">Aa</span>
                  <span className="pl-1">▾</span>
                </span>
              }
              triggerClassName="h-8 p-0 px-2 w-auto min-w-0"
              contentClassName="min-w-[100px] w-auto"
              className="w-auto"
              optionClassName="whitespace-nowrap"
              optionLabelClassName="whitespace-nowrap"
              triggerVariant="ghost"
              triggerSize="sm"
              onValueChange={(val) => {
                const level = parseInt(val);
                if (level === 0) editor.chain().focus().setParagraph().run();
                else
                  editor
                    .chain()
                    .focus()
                    .toggleHeading({ level: level as 1 | 2 | 3 })
                    .run();
              }}
            />
            <div className="tiptap-toolbar-divider" />

            {/* Lists group */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 min-w-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                >
                  Numbered list
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                >
                  Bullet list
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

            {/* Text Formatting with tooltips + More group */}
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Bold</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Italic</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Underline</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Highlight</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 min-w-0"
                >
                  •••
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                  Strikethrough
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().toggleCode().run()}
                >
                  Code
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().unsetAllMarks().clearNodes().run()
                  }
                >
                  Clear formatting
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="tiptap-toolbar-divider" />

            {/* Insert group */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 min-w-0"
                >
                  +
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                  Code block
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                >
                  Block quote
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                  }
                >
                  Divider
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="tiptap-toolbar-divider" />

            {/* Links */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = window.prompt("Enter URL");
                    if (url)
                      editor.chain().focus().setLink({ href: url }).run();
                  }}
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("link")
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                      : ""
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Insert link</TooltipContent>
            </Tooltip>
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

            {/* Table controls (visible only when selection is inside a table) */}
            {editor.isActive("table") && (
              <>
                <div className="tiptap-toolbar-divider" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  className="h-8 px-2"
                  title="Add row before"
                >
                  Row ↑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="h-8 px-2"
                  title="Add row after"
                >
                  Row ↓
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="h-8 px-2"
                  title="Delete row"
                >
                  Row ✕
                </Button>
                <div className="tiptap-toolbar-divider" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  className="h-8 px-2"
                  title="Add column before"
                >
                  Col ←
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="h-8 px-2"
                  title="Add column after"
                >
                  Col →
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="h-8 px-2"
                  title="Delete column"
                >
                  Col ✕
                </Button>
                <div className="tiptap-toolbar-divider" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                  className={`h-8 px-2 ${
                    editor.isActive("tableHeader")
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                      : ""
                  }`}
                  title="Toggle header row"
                >
                  Header
                </Button>
                <div className="tiptap-toolbar-divider" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().mergeOrSplit().run()}
                  className="h-8 px-2"
                  title="Merge or split cells"
                >
                  Merge/Split
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="h-8 px-2"
                  title="Delete table"
                >
                  Delete
                </Button>
              </>
            )}
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
              "ordered_list",
              "quote",
              "image",
              "divider",
              "task_list",
              "table",
            ] as any,
            showGroups: true,
            itemGroups: {
              text: "Style",
              heading_1: "Style",
              heading_2: "Style",
              bullet_list: "Lists",
              ordered_list: "Lists",
              quote: "Style",
              image: "Upload",
              divider: "Insert",
              task_list: "Style",
              table: "Insert",
            } as any,
          }}
        />
      </div>
    </div>
  );
}

// helpers moved to utils/content-blocks.ts
