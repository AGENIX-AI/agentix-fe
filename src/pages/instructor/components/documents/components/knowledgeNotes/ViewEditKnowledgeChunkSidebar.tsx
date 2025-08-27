import { useState, useEffect } from "react";
import { X, Loader2, Check, Edit } from "lucide-react";
import { toast } from "sonner";

import { modifyTopicKnowledge, type TopicKnowledgeItem } from "@/api/documents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Small } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";

interface ViewEditKnowledgeChunkSidebarProps {
  isVisible: boolean;
  item: TopicKnowledgeItem | null;
  topicKnowledgeId: string;
  mode: "view" | "edit";
  onClose: () => void;
  onSuccess?: () => void;
}

export function ViewEditKnowledgeChunkSidebar({
  isVisible,
  item,
  topicKnowledgeId,
  mode,
  onClose,
  onSuccess,
}: ViewEditKnowledgeChunkSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setContent(item.content);
      setIsEditing(mode === "edit");
    }
  }, [item, mode]);

  const handleSubmit = async () => {
    if (!item) return;

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter content");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await modifyTopicKnowledge(item.chunk_index, {
        title: title.trim(),
        content: content.trim(),
        page_id: topicKnowledgeId,
      });

      if (response.success) {
        toast.success("Knowledge chunk updated successfully!");
        setIsEditing(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error updating knowledge chunk:", error);
      toast.error("Failed to update knowledge chunk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form to original values
    if (item) {
      setTitle(item.title);
      setContent(item.content);
    }
    setIsEditing(false);
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (item) {
      setTitle(item.title);
      setContent(item.content);
    }
    setIsEditing(false);
  };

  if (!isVisible || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={handleClose} />

      {/* Sidebar */}
      <div className="relative ml-auto app-sidebar-panel bg-background border-l shadow-xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit" : "View"} Knowledge Chunk
            </h2>
            <Badge variant="secondary" className="text-xs">
              {item.type}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Chunk Index
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Chunk Index</Label>
            <Small className="text-xs font-mono break-all">
              {item.chunk_index}
            </Small>
          </div> */}

          {/* Keywords */}
          {item.keywords && item.keywords.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Keywords</Label>
              <div className="flex flex-wrap gap-1">
                {item.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {item.summary && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Summary</Label>
              <div className="p-3 bg-muted/50 rounded-lg">
                <Small className="text-sm">{item.summary}</Small>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            {isEditing ? (
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                disabled={isSubmitting}
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-lg">
                <Small className="font-medium">{item.title}</Small>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            {isEditing ? (
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content"
                rows={8}
                disabled={isSubmitting}
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-lg min-h-[200px]">
                <Small className="whitespace-pre-wrap">{item.content}</Small>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={handleEdit} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
