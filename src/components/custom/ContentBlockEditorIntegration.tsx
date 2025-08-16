import { useState } from "react";
import { PlateContentBlockEditor } from "./PlateContentBlockEditor";
import type { ContentBlock } from "./PlateContentBlockEditor";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";

interface ContentBlockEditorIntegrationProps {
  block: ContentBlock;
  onBlockUpdate: (updatedBlock: ContentBlock) => void;
  trigger?: React.ReactNode;
}

export function ContentBlockEditorIntegration({
  block,
  onBlockUpdate,
  trigger,
}: ContentBlockEditorIntegrationProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedBlock: ContentBlock) => {
    onBlockUpdate(updatedBlock);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <Edit className="h-4 w-4" />
    </Button>
  );

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-background border rounded-lg shadow-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
          <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Edit {block.type} Block</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4">
            <PlateContentBlockEditor
              block={block}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)}>{trigger || defaultTrigger}</div>
  );
}
