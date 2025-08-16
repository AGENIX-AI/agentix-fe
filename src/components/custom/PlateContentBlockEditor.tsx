import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Minus } from "lucide-react";

// Types for your content blocks
export interface ContentBlock {
  id: string;
  section: string;
  type:
    | "paragraph"
    | "header"
    | "list"
    | "quote"
    | "code"
    | "image"
    | "checklist"
    | "separator"
    | "url";
  data: any;
  order: number;
  originalBlockId?: string | null; // Track original block_id from API for updates
}

interface ParagraphData {
  text: string;
}

interface HeaderData {
  text: string;
  level: number;
}

interface ListData {
  style: "ordered" | "unordered";
  items: string[];
}

interface QuoteData {
  text: string;
  caption: string;
}

interface CodeData {
  code: string;
  language: string;
}

interface ImageData {
  url: string;
  caption: string;
}

interface ChecklistData {
  items: Array<{ text: string; checked: boolean }>;
}

interface URLData {
  url: string;
  title: string;
}

interface PlateContentBlockEditorProps {
  block: ContentBlock;
  onSave: (updatedBlock: ContentBlock) => void;
  onCancel: () => void;
}

export function PlateContentBlockEditor({
  block,
  onSave,
  onCancel,
}: PlateContentBlockEditorProps) {
  const [localBlock, setLocalBlock] = useState<ContentBlock>(block);

  // Handle form field changes for non-editor blocks
  const handleFormChange = (field: string, value: any) => {
    setLocalBlock((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
    }));
  };

  // Handle list item changes
  const handleListItemChange = (index: number, value: string) => {
    if (localBlock.type === "list") {
      const newItems = [...(localBlock.data as ListData).items];
      newItems[index] = value;
      handleFormChange("items", newItems);
    }
  };

  // Handle checklist item changes
  const handleChecklistItemChange = (
    index: number,
    field: "text" | "checked",
    value: any
  ) => {
    if (localBlock.type === "checklist") {
      const newItems = [...(localBlock.data as ChecklistData).items];
      newItems[index] = { ...newItems[index], [field]: value };
      handleFormChange("items", newItems);
    }
  };

  // Add new list item
  const addListItem = () => {
    if (localBlock.type === "list") {
      const newItems = [...(localBlock.data as ListData).items, ""];
      handleFormChange("items", newItems);
    }
  };

  // Remove list item
  const removeListItem = (index: number) => {
    if (localBlock.type === "list") {
      const newItems = (localBlock.data as ListData).items.filter(
        (_, i) => i !== index
      );
      handleFormChange("items", newItems);
    }
  };

  // Add new checklist item
  const addChecklistItem = () => {
    if (localBlock.type === "checklist") {
      const newItems = [
        ...(localBlock.data as ChecklistData).items,
        { text: "", checked: false },
      ];
      handleFormChange("items", newItems);
    }
  };

  // Remove checklist item
  const removeChecklistItem = (index: number) => {
    if (localBlock.type === "checklist") {
      const newItems = (localBlock.data as ChecklistData).items.filter(
        (_, i) => i !== index
      );
      handleFormChange("items", newItems);
    }
  };

  const renderFormFields = () => {
    switch (localBlock.type) {
      case "paragraph":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="paragraph-text">Text Content</Label>
              <Textarea
                id="paragraph-text"
                value={(localBlock.data as ParagraphData).text}
                onChange={(e) => handleFormChange("text", e.target.value)}
                placeholder="Enter paragraph text..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      case "header":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="header-text">Header Text</Label>
              <Input
                id="header-text"
                value={(localBlock.data as HeaderData).text}
                onChange={(e) => handleFormChange("text", e.target.value)}
                placeholder="Enter header text..."
              />
            </div>
            <div>
              <Label htmlFor="header-level">Header Level</Label>
              <Select
                value={(localBlock.data as HeaderData).level.toString()}
                onValueChange={(value) =>
                  handleFormChange("level", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                  <SelectItem value="5">H5</SelectItem>
                  <SelectItem value="6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={(localBlock.data as ImageData).url}
                onChange={(e) => handleFormChange("url", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="image-caption">Caption</Label>
              <Input
                id="image-caption"
                value={(localBlock.data as ImageData).caption}
                onChange={(e) => handleFormChange("caption", e.target.value)}
                placeholder="Image description"
              />
            </div>
          </div>
        );

      case "url":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url-link">URL</Label>
              <Input
                id="url-link"
                value={(localBlock.data as URLData).url}
                onChange={(e) => handleFormChange("url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="url-title">Title</Label>
              <Input
                id="url-title"
                value={(localBlock.data as URLData).title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder="Link title"
              />
            </div>
          </div>
        );

      case "separator":
        return (
          <div>
            <Label>Separator Style</Label>
            <div className="flex items-center gap-2 mt-2">
              <Minus className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                Horizontal line separator
              </span>
            </div>
          </div>
        );

      case "list":
        const listData = localBlock.data as ListData;
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="list-style">List Style</Label>
              <Select
                value={listData.style}
                onValueChange={(value: "ordered" | "unordered") =>
                  handleFormChange("style", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="unordered">Unordered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>List Items</Label>
              <div className="space-y-2 mt-2">
                {listData.items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) =>
                        handleListItemChange(index, e.target.value)
                      }
                      placeholder={`Item ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeListItem(index)}
                      className="px-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addListItem}>
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        );

      case "checklist":
        const checklistData = localBlock.data as ChecklistData;
        return (
          <div className="space-y-4">
            <div>
              <Label>Checklist Items</Label>
              <div className="space-y-2 mt-2">
                {checklistData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) =>
                        handleChecklistItemChange(index, "checked", checked)
                      }
                    />
                    <Input
                      value={item.text}
                      onChange={(e) =>
                        handleChecklistItemChange(index, "text", e.target.value)
                      }
                      placeholder={`Task ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeChecklistItem(index)}
                      className="px-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addChecklistItem}
                >
                  Add Task
                </Button>
              </div>
            </div>
          </div>
        );

      case "quote":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="quote-text">Quote Text</Label>
              <Textarea
                id="quote-text"
                value={(localBlock.data as QuoteData).text}
                onChange={(e) => handleFormChange("text", e.target.value)}
                placeholder="Enter quote text..."
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="quote-caption">Caption</Label>
              <Input
                id="quote-caption"
                value={(localBlock.data as QuoteData).caption}
                onChange={(e) => handleFormChange("caption", e.target.value)}
                placeholder="Author name or caption"
              />
            </div>
          </div>
        );

      case "code":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="code-content">Code Content</Label>
              <Textarea
                id="code-content"
                value={(localBlock.data as CodeData).code}
                onChange={(e) => handleFormChange("code", e.target.value)}
                placeholder="Enter code..."
                className="min-h-[150px] font-mono"
              />
            </div>
            <div>
              <Label htmlFor="code-language">Language</Label>
              <Input
                id="code-language"
                value={(localBlock.data as CodeData).language}
                onChange={(e) => handleFormChange("language", e.target.value)}
                placeholder="javascript, python, etc."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSave = () => {
    onSave(localBlock);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">
          Edit {localBlock.type} Block
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
      <div className="space-y-4">
        {/* Render form fields for all block types */}
        {renderFormFields()}
      </div>
    </div>
  );
}
