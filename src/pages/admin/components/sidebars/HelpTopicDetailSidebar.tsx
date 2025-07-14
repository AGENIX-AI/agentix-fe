import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { HelpTopic } from "@/api/admin/helpCenter";

interface HelpTopicDetailSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  topic: HelpTopic | null;
}

function renderMarkdown(content: string) {
  // For now, just render as plain text. Replace with a markdown renderer if needed.
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
      {content}
    </div>
  );
}

export function HelpTopicDetailSidebar({
  isVisible,
  onClose,
  topic,
}: HelpTopicDetailSidebarProps) {
  if (!isVisible || !topic) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Topic Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-sm">Title</p>
              <p className="text-xs text-muted-foreground">{topic.title}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Order</p>
              <p className="text-xs text-muted-foreground">{topic.order}</p>
            </div>
            <div>
              <p className="font-medium text-sm">ID</p>
              <p className="text-xs text-muted-foreground font-mono">
                {topic.id}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-medium">Content</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 pr-2">
              {renderMarkdown(topic.content)}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
