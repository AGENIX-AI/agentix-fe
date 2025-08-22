import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import type { Document } from "@/api/page";
import { getPage } from "@/api/page";
import type { BlockData } from "@/api/page";
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

  useEffect(() => {
    if (!isOpen || !document?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const page = await getPage(document.id);
        const mapped: ContentBlock[] = (page.blocks || [])
          .sort((a: BlockData, b: BlockData) => (a.order ?? 0) - (b.order ?? 0))
          .map((b: BlockData, idx: number) => ({
            id: (b.id as string) || `block-${idx}-${Date.now()}`,
            type: (b.type as ContentBlock["type"]) || "paragraph",
            data: b.data || {},
            order: b.order ?? idx,
          }));
        setBlocks(mapped);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load page blocks:", e);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, document?.id]);

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
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                Loading content...
              </p>
            </div>
          ) : document ? (
            <TiptapContentBlocksViewer
              blocks={blocks}
              className="prose-sm"
              placeholder="No content"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
