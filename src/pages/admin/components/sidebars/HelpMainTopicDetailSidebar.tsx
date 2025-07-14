import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HelpMainTopic } from "@/api/admin/helpCenter";

interface HelpMainTopicDetailSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  mainTopic: HelpMainTopic | null;
}

export function HelpMainTopicDetailSidebar({
  isVisible,
  onClose,
  mainTopic,
}: HelpMainTopicDetailSidebarProps) {
  if (!isVisible || !mainTopic) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-background border-l border-border shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Category Details</h2>
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
              <p className="text-xs text-muted-foreground">{mainTopic.title}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Order</p>
              <p className="text-xs text-muted-foreground">{mainTopic.order}</p>
            </div>
            <div>
              <p className="font-medium text-sm">Topics Count</p>
              <p className="text-xs text-muted-foreground">
                {mainTopic.topics_count}
              </p>
            </div>
            <div>
              <p className="font-medium text-sm">ID</p>
              <p className="text-xs text-muted-foreground font-mono">
                {mainTopic.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
