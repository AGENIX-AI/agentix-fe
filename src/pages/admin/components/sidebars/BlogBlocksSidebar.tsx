import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";
import { TiptapContentBlocksEditor } from "@/components/editor/TiptapContentBlocksEditor";
import type { Blog } from "@/api/admin/blogs";
import type { ContentBlock } from "@/api/admin/helpCenter";
import { getPage, getPageBlocks, updatePageBlocks } from "@/api/page";
import type { BlockData } from "@/api/page";

interface BlogBlocksSidebarProps {
  isVisible: boolean;
  mode: "view" | "edit";
  blog: Blog;
  onClose: () => void;
  onSaved?: (updated: { id: string; title?: string }) => void;
}

export function BlogBlocksSidebar({
  isVisible,
  mode,
  blog,
  onClose,
  onSaved,
}: BlogBlocksSidebarProps) {
  const [title, setTitle] = useState<string>(blog?.title ?? "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const previousBlocksRef = useRef<ContentBlock[]>([]);

  // Initialize with incoming blog
  useEffect(() => {
    if (isVisible && blog && !initialized) {
      setTitle(blog.title ?? "");
      setInitialized(true);
    }
  }, [isVisible, blog, initialized]);

  // Fetch page meta + blocks when opened
  useEffect(() => {
    if (!isVisible || !blog?.id || !initialized) return;
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const page = await getPage(blog.id);
        if (!cancelled) setTitle(page.page?.title ?? blog.title ?? "");
        const blocksResp = await getPageBlocks(blog.id, {
          organize_by_section: false,
          page_number: 1,
          page_size: 100,
          sort_by: "order",
          sort_order: 1,
        });
        // Map BlockData -> ContentBlock for editor consumption
        const items: ContentBlock[] = (blocksResp.items || [])
          .sort((a: BlockData, b: BlockData) => (a.order ?? 0) - (b.order ?? 0))
          .map((b: BlockData, idx: number) => ({
            id: (b.id as string) || `block-${idx}-${Date.now()}`,
            type: (b.type as ContentBlock["type"]) || "paragraph",
            data: b.data || {},
            order: b.order ?? idx,
          }));
        if (!cancelled) {
          setContentBlocks(items);
          previousBlocksRef.current = items;
        }
      } catch (e) {
        if (!cancelled)
          setError("Failed to load blog content. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [isVisible, blog?.id, initialized, blog?.title]);

  // Reset when closing
  useEffect(() => {
    if (!isVisible) {
      setInitialized(false);
      setIsLoading(false);
      setError(null);
      setContentBlocks([]);
      previousBlocksRef.current = [];
    }
  }, [isVisible]);

  const handleSave = useCallback(async () => {
    if (!blog?.id) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Title is required");
      return;
    }
    try {
      await updatePageBlocks(blog.id, {
        title: trimmedTitle,
        content: contentBlocks.map((b) => ({
          id: b.id,
          order: b.order,
          type: b.type,
          data: b.data,
        })),
      });
      previousBlocksRef.current = contentBlocks;
      toast.success("Blog updated successfully");
      onSaved?.({ id: blog.id, title: trimmedTitle });
      onClose();
    } catch (e) {
      toast.error("Failed to update blog");
    }
  }, [blog?.id, contentBlocks, title, onClose, onSaved]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 app-sidebar-panel bg-background border-l border-border shadow-lg flex flex-col">
      <div className="sticky top-0 z-10 bg-background border-b border-border p-6 h-18">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "edit" ? "Edit Blog" : "View Blog"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 pb-0">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Title</Label>
          <Input
            id="blog-title"
            placeholder="Enter blog title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="h-full flex flex-col">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading content...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-destructive">{error}</div>
            </div>
          ) : (
            <TiptapContentBlocksEditor
              blocks={contentBlocks}
              previousBlocks={previousBlocksRef.current}
              onChange={setContentBlocks}
              placeholder="Type '/' for commands..."
            />
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background border-t border-border p-6 h-18">
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {mode === "edit" && (
            <Button onClick={handleSave} disabled={!title.trim()}>
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogBlocksSidebar;
