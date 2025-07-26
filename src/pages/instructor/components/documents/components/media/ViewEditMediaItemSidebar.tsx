import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ImageDocument } from "@/api/documents";

interface ViewEditMediaItemSidebarProps {
  isVisible: boolean;
  item: ImageDocument | null;
  mode: "view" | "edit";
  onClose: () => void;
  onSuccess: () => void;
}

export function ViewEditMediaItemSidebar({
  isVisible,
  item,
  mode,
  onClose,
  onSuccess,
}: ViewEditMediaItemSidebarProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form values when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setSummary(item.summary);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title for the media item");
      return;
    }

    if (!item) return;

    setIsSubmitting(true);
    try {
      // Placeholder for API call to update media item
      toast.success("Media item updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating media item:", error);
      toast.error("An error occurred while updating the media item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "View Media Item" : "Edit Media Item"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter media title"
              disabled={isSubmitting || mode === "view"}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter media summary"
              disabled={isSubmitting || mode === "view"}
              className="w-full"
            />
          </div>

          {item && (
            <div className="space-y-2">
              <Label>Image</Label>
              <div className="mt-2">
                <img
                  src={item.url}
                  alt={item.title}
                  className="max-h-60 rounded-md"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode === "edit" && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Media Item"
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
