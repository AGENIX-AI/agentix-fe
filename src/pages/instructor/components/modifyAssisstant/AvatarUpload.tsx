import { useState } from "react";
import { Upload, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
interface AvatarUploadProps {
  avatarPreview: string;
  isGenerating: boolean;
  onAvatarChange: (file: File) => void;
  onGenerateWithAI: (style: string) => Promise<void>;
  className?: string;
}

const imageStyleOptions = [
  { value: "realistic", label: "Realistic" },
  { value: "professional", label: "Professional" },
  { value: "cartoon", label: "Cartoon" },
  { value: "anime", label: "Anime" },
  { value: "digital-art", label: "Digital Art" },
  { value: "painting", label: "Painting" },
  { value: "3d-render", label: "3D Render" },
];

export function AvatarUpload({
  avatarPreview,
  isGenerating,
  onAvatarChange,
  onGenerateWithAI,
  className,
}: AvatarUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("realistic");

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onAvatarChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleGenerate = async () => {
    // Close dialog immediately
    setIsDialogOpen(false);

    // Call parent generation function
    await onGenerateWithAI(selectedStyle);
  };

  return (
    <>
      <div className={cn("spacey=3 spacex=6", className)}>
        <h2 className="text-sm font-bold">Avatar</h2>
        <div className="flex flex-col items-center">
          <div
            className="relative w-40 h-40 border-2 border-dashed rounded-md flex items-center justify-center overflow-hidden cursor-pointer mb-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center w-full h-full bg-background/80">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Generating...
                </p>
              </div>
            ) : avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Assistant Avatar"
                className="object-cover"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p>Drag & drop or click to upload</p>
              </div>
            )}
          </div>
          <div className="flex gap-4 w-full justify-center">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && onAvatarChange(e.target.files[0])
              }
              disabled={isGenerating}
            />
            <label htmlFor="avatar-upload">
              <Button variant="outline" asChild disabled={isGenerating}>
                <span>
                  <Upload className="w-4 h-4 mr-2" /> Upload
                </span>
              </Button>
            </label>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              disabled={isGenerating}
            >
              <Wand2 className="w-4 h-4 mr-2" /> Generate
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Avatar</DialogTitle>
            <DialogDescription>
              Choose a style for the AI-generated avatar based on the
              assistant's information.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="image-style" className="block mb-2">
              Image Style
            </Label>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
              <SelectTrigger id="image-style" className="w-full">
                <SelectValue placeholder="Select a style" />
              </SelectTrigger>
              <SelectContent>
                {imageStyleOptions.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate}>
              <Wand2 className="w-4 h-4 mr-2" /> Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
