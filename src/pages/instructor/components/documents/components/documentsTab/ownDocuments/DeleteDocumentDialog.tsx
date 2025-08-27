import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { deletePage, type Document as PageDocument } from "@/api/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  document: PageDocument | null;
}

export function DeleteDocumentDialog({
  isOpen,
  onClose,
  onSuccess,
  document,
}: DeleteDocumentDialogProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!document) return;

    setIsDeleting(true);
    try {
      const response = await deletePage(document.id);

      if (response.success) {
        toast.success(t("documents.deleted"));
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error(t("documents.failedToDelete"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            {t("documents.deleteDocument")}
          </DialogTitle>
          <DialogDescription>
            {t("documents.deleteConfirmation", {
              title: document?.title || "this document",
            })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("documents.deleting")}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
