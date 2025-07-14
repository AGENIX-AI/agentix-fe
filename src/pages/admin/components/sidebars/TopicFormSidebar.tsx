import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { HelpTopic } from "@/api/admin/helpCenter";

interface TopicFormSidebarProps {
  isVisible: boolean;
  mode: "create" | "edit";
  mainId: string;
  topic?: HelpTopic;
  onClose: () => void;
  onSave: (
    mainId: string,
    topic: Partial<HelpTopic> & { title: string; content: string }
  ) => void;
}

export function TopicFormSidebar({
  isVisible,
  mode,
  mainId,
  topic,
  onClose,
  onSave,
}: TopicFormSidebarProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (isVisible) {
      if (mode === "edit" && topic) {
        setTitle(topic.title);
        setContent(topic.content);
      } else {
        setTitle("");
        setContent("");
      }
      setActiveTab("edit");
    }
  }, [isVisible, mode, topic]);

  if (!isVisible) return null;

  const handleSave = () => {
    const topicData = {
      id: topic?.id,
      title,
      content,
    };
    onSave(mainId, topicData);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[600px] bg-background border-l border-border shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {mode === "create" ? "Create New Topic" : "Edit Topic"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="topic-title">Title</Label>
          <Input
            id="topic-title"
            placeholder="Enter topic title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-4">
            <div className="space-y-2">
              <Label htmlFor="topic-content">Content (Markdown)</Label>
              <Textarea
                id="topic-content"
                placeholder="# Topic Title

## Section 1
Write your content using Markdown formatting...

### Examples:
- **Bold text**
- *Italic text*
- [Links](https://example.com)
- `Code snippets`

```
Code blocks
```"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="border rounded-md p-4 min-h-[400px] bg-muted/20 overflow-auto">
              {content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs [&>*]:text-xs [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_p]:text-xs [&_li]:text-xs [&_code]:text-xs">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8 text-xs">
                  Enter content in the Edit tab to see preview here
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-background border-t border-border p-6">
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {mode === "create" ? "Create Topic" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
