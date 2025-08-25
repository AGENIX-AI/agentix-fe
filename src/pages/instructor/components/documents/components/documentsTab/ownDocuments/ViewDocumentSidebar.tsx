import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import type { Document } from "@/api/documents";
import { getDocumentBlocks, getChildrenBlocksByType } from "@/api/documents";
import type { ContentBlock } from "@/api/admin/helpCenter";
import { TiptapContentBlocksViewer } from "@/components/editor/TiptapContentBlocksViewer";

interface ViewDocumentSidebarProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
}

export function ViewDocumentSidebar({
  isOpen,
  document,
  onClose,
}: ViewDocumentSidebarProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const PAGE_SIZE = 20;
  const [showImagesOnly, setShowImagesOnly] = useState(false);

  const loadPage = useCallback(
    async (page: number) => {
      if (!document?.id) return;
      const el = scrollContainerRef.current;
      const prevScrollTop = el?.scrollTop ?? 0;
      const prevScrollHeight = el?.scrollHeight ?? 0;
      setLoading(true);
      try {
        const response = await getDocumentBlocks(document.id, {
          page_number: page,
          page_size: PAGE_SIZE,
          sort_by: "order",
          sort_order: 0,
        });
        const items = response?.items || [];
        const mapped: ContentBlock[] = items.map((b: any, idx: number) => ({
          id: (b.id as string) || `block-${page}-${idx}-${Date.now()}`,
          type: (b.type as ContentBlock["type"]) || "paragraph",
          data: b.data || {},
          order: (b as any).order ?? idx,
        }));
        setBlocks((prev) => (page === 1 ? mapped : [...prev, ...mapped]));
        setHasNext(Boolean((response as any)?.has_next));
        setPageNumber(page);
        // Preserve scroll position when appending next pages
        if (page > 1) {
          requestAnimationFrame(() => {
            const elNow = scrollContainerRef.current;
            if (!elNow) return;
            // Keep the same visual position; do not jump to top
            // Optionally compensate height growth if needed
            const heightDiff = (elNow.scrollHeight ?? 0) - prevScrollHeight;
            elNow.scrollTop = prevScrollTop; // keep current position
            // If a slight shift occurs, adjust by heightDiff to anchor bottom distance
            if (
              heightDiff > 0 &&
              prevScrollTop + elNow.clientHeight >= prevScrollHeight - 2
            ) {
              elNow.scrollTop = prevScrollTop + heightDiff;
            }
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load page blocks:", e);
        if (page === 1) setBlocks([]);
      } finally {
        setLoading(false);
      }
    },
    [document?.id]
  );

  useEffect(() => {
    if (!isOpen || !document?.id) return;
    setBlocks([]);
    setPageNumber(1);
    setHasNext(true);
    if (showImagesOnly) {
      void (async () => {
        setLoading(true);
        try {
          const children = await getChildrenBlocksByType(
            document.id,
            "media_document"
          );
          const mapped: ContentBlock[] = children.map(
            (b: any, idx: number) => ({
              id: (b.id as string) || `img-${idx}-${Date.now()}`,
              type: (b.type as ContentBlock["type"]) || "paragraph",
              data: b.data || {},
              order: (b as any).order ?? idx,
            })
          );
          setBlocks(mapped);
          setHasNext(false);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("Failed to load children image blocks:", e);
          setBlocks([]);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      void loadPage(1);
    }
  }, [isOpen, document?.id, loadPage, showImagesOnly]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (loading || !hasNext) return;
      const threshold = 100;
      const isNearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
      if (isNearBottom) {
        void loadPage(pageNumber + 1);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, [loading, hasNext, pageNumber, loadPage]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-1/2 bg-background border-l shadow-lg flex flex-col">
        <div className="border-b px-6 py-4 flex items-center justify-between h-18">
          <div>
            <h2 className="text-lg font-semibold">
              {document?.title || "Document Content"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {document?.file_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showImagesOnly ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowImagesOnly((v) => !v)}
            >
              {showImagesOnly ? "View all blocks" : "View images"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
          {document ? (
            <>
              {pageNumber === 1 && loading && blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">
                    Loading content...
                  </p>
                </div>
              ) : (
                <TiptapContentBlocksViewer
                  blocks={blocks}
                  className="prose-sm"
                  placeholder="No content"
                />
              )}
            </>
          ) : null}
          {document && hasNext && loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
