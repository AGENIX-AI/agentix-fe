import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { HelpTopic, ContentBlock } from "@/api/admin/helpCenter";

interface HelpTopicDetailSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  topic: HelpTopic | null;
}

function renderContentBlocks(blocks: ContentBlock[]) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'header':
            const level = block.data.level || 1;
            if (level === 1) return <h1 key={index}>{block.data.text}</h1>;
            if (level === 2) return <h2 key={index}>{block.data.text}</h2>;
            if (level === 3) return <h3 key={index}>{block.data.text}</h3>;
            if (level === 4) return <h4 key={index}>{block.data.text}</h4>;
            if (level === 5) return <h5 key={index}>{block.data.text}</h5>;
            return <h6 key={index}>{block.data.text}</h6>;
          case 'paragraph':
            return <p key={index}>{block.data.text}</p>;
          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag key={index}>
                {block.data.items.map((item: string, itemIndex: number) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ListTag>
            );
          case 'code':
            return (
              <pre key={index}>
                <code>{block.data.code}</code>
              </pre>
            );
          case 'quote':
            return (
              <blockquote key={index}>
                <p>{block.data.text}</p>
                {block.data.caption && <cite>{block.data.caption}</cite>}
              </blockquote>
            );
          case 'image':
            return (
              <figure key={index}>
                <img src={block.data.url} alt={block.data.caption || ''} />
                {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
              </figure>
            );
          case 'url':
            return (
              <p key={index}>
                <a href={block.data.url} target="_blank" rel="noopener noreferrer">
                  {block.data.title || block.data.url}
                </a>
              </p>
            );
          case 'separator':
            return <hr key={index} />;
          case 'checklist':
            return (
              <ul key={index}>
                {block.data.items.map((item: any, itemIndex: number) => (
                  <li key={itemIndex}>
                    <input type="checkbox" checked={item.checked} readOnly />
                    {item.text}
                  </li>
                ))}
              </ul>
            );
          default:
            return <p key={index}>{block.data.text || ''}</p>;
        }
      })}
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
              {renderContentBlocks(topic.content)}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
