import { Checkbox } from "@/components/ui/checkbox";

interface ImageGridProps {
  images: string[];
  selectedImages: string[];
  onImageSelect: (imagePath: string) => void;
}

export default function ImageGrid({
  images,
  selectedImages,
  onImageSelect,
}: ImageGridProps) {
  return (
    <div className="grid grid-cols-5 gap-3 pb-4">
      {images.map((imagePath, index) => {
        const baseUrl = import.meta.env.VITE_API_URL || "";
        const fullImageUrl = `${baseUrl}/${imagePath}`;
        const isSelected = selectedImages.includes(imagePath);

        return (
          <div
            key={index}
            className={`relative rounded-md overflow-hidden border shadow-sm transition-all duration-200 ${
              isSelected
                ? "border-primary border-2 bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="relative">
              <img
                src={fullImageUrl}
                alt={`Document page ${index + 1}`}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onImageSelect(imagePath)}
                  className="bg-background border-2"
                />
              </div>
            </div>
            <div className="p-2 bg-background/80 text-xs text-center">
              Page {index + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}
