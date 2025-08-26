import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Document } from "@/api/documents";
import { getDocumentBlocks } from "@/api/documents";
import { updatePageBlocks } from "@/api/page";
import type { ContentBlock } from "@/api/admin/helpCenter";
import { TiptapContentBlocksEditor } from "@/components/editor/TiptapContentBlocksEditor";
import { toast } from "sonner";

interface UpdateDocumentSidebarProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateDocumentSidebar({
  isOpen,
  document,
  onClose,
  onSuccess,
}: UpdateDocumentSidebarProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [previousBlocks, setPreviousBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !document) return;
    const load = async () => {
      setLoading(true);
      try {
        const PAGE_SIZE = 50;
        let pageNumber = 1;
        let hasNext = true;
        const allBlocks: ContentBlock[] = [];

        while (hasNext) {
          const response = await getDocumentBlocks(document.id, {
            page_number: pageNumber,
            page_size: PAGE_SIZE,
            sort_by: "order",
            sort_order: 0,
          });
          const items = response?.items || [];
          const mapped: ContentBlock[] = items.map((b: any, idx: number) => ({
            id: (b.id as string) || `block-${pageNumber}-${idx}-${Date.now()}`,
            type: (b.type as ContentBlock["type"]) || "paragraph",
            data: b.data || {},
            order: (b as any).order ?? idx,
          }));
          allBlocks.push(...mapped);
          hasNext = Boolean((response as any)?.has_next);
          pageNumber += 1;
        }

        // Ensure stable order just in case
        allBlocks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setBlocks(allBlocks);
        setPreviousBlocks(allBlocks);
      } catch (e) {
        console.error("Failed to load page blocks for update:", e);
        toast.error("Failed to load document content");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, document?.id]);

  const handleSave = async () => {
    if (!document) return;
    try {
      setSaving(true);
      await updatePageBlocks(document.id, {
        content: blocks.map((b) => ({
          id: b.id,
          order: b.order,
          type: b.type,
          data: b.data,
        })),
      });
      toast.success("Document content updated");
      onClose();
      onSuccess();
    } catch (e) {
      console.error("Failed to save updated content:", e);
      toast.error("Failed to update document content");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <div className="w-1/2 bg-background border-l shadow-lg flex flex-col">
        <div className="border-b px-6 py-4 flex items-center justify-between h-18">
          <div>
            <h2 className="text-lg font-semibold">
              {document?.title || "Update Document"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {document?.file_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">
                Loading content...
              </p>
            </div>
          ) : (
            <TiptapContentBlocksEditor
              blocks={blocks}
              previousBlocks={previousBlocks}
              onChange={setBlocks}
              placeholder="Edit document content..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
