import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TurndownService from "turndown";
import { marked } from "marked";
import type { Blog } from "@/api/admin/blogs";

interface BlogFormSidebarProps {
  isVisible: boolean;
  mode: "create" | "edit";
  blog?: Blog;
  onClose: () => void;
  onSave: (blog: Partial<Blog> & { title: string; content: string }) => void;
}

export function BlogFormSidebar({
  isVisible,
  mode,
  blog,
  onClose,
  onSave,
}: BlogFormSidebarProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
      Highlight,
      Placeholder.configure({
        placeholder: "Start writing your blog content here...",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      if (!isEditing) setIsEditing(true);
    },
    editable: isEditing,
  });

  useEffect(() => {
    if (isVisible) {
      if (mode === "edit" && blog) {
        setTitle(blog.title);
        // Parse markdown content to HTML for the editor
        const htmlContent = marked(blog.content) as string;
        setContent(htmlContent);
        setIsEditing(false); // Start in preview mode for existing blogs
        if (editor) {
          editor.commands.setContent(htmlContent);
          editor.setEditable(false);
        }
      } else {
        setTitle("");
        setContent("");
        setIsEditing(true); // Start in edit mode for new blogs
        if (editor) {
          editor.commands.setContent("");
          editor.setEditable(true);
        }
      }
    }
  }, [isVisible, mode, blog, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  if (!isVisible) return null;

  const handleSave = () => {
    // Convert HTML content to markdown before saving
    const turndownService = new TurndownService({
      headingStyle: "atx",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      fence: "```",
      emDelimiter: "*",
      strongDelimiter: "**",
      linkStyle: "inlined",
      linkReferenceStyle: "full",
    });

    const markdownContent = turndownService.turndown(content);

    const blogData = {
      id: blog?.id,
      title,
      content: markdownContent,
    };
    onSave(blogData);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 app-sidebar-panel bg-background border-l border-border shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-6 h-18">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Create New Blog" : "Edit Blog"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Title</Label>
          <Input
            id="blog-title"
            placeholder="Enter blog title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog-content">Content</Label>

          {/* Toolbar */}
          {isEditing && editor && (
            <div className="border border-b-0 rounded-t-md p-2 bg-muted/30">
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""
                  }`}
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""
                  }`}
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                  }
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("heading", { level: 3 }) ? "bg-muted" : ""
                  }`}
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("bold") ? "bg-muted" : ""
                  }`}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("italic") ? "bg-muted" : ""
                  }`}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("strike") ? "bg-muted" : ""
                  }`}
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("bulletList") ? "bg-muted" : ""
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("orderedList") ? "bg-muted" : ""
                  }`}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                  }
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("blockquote") ? "bg-muted" : ""
                  }`}
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("codeBlock") ? "bg-muted" : ""
                  }`}
                >
                  <Code className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = window.prompt("Enter URL");
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                  className={`h-8 w-8 p-0 ${
                    editor.isActive("link") ? "bg-muted" : ""
                  }`}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = window.prompt("Enter image URL");
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  className="h-8 w-8 p-0"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Editor */}
          <div
            className={`border ${
              isEditing && editor ? "rounded-b-md border-t-0" : "rounded-md"
            } overflow-hidden min-h-[400px] bg-background`}
          >
            <EditorContent
              editor={editor}
              className="tiptap-editor prose prose-sm max-w-none p-4 min-h-[400px] focus:outline-none"
              onClick={() => {
                if (!isEditing && mode === "edit") {
                  setIsEditing(true);
                }
              }}
            />
          </div>

          {/* Mode Toggle */}
          {!isEditing && mode === "edit" && blog && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Preview mode - Click to edit</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-6 px-2 text-xs"
              >
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-6 h-18">
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {mode === "create" ? "Create Blog" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
