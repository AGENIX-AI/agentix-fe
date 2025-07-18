import { Small } from "@/components/ui/typography";
import { ImageIcon } from "lucide-react";

interface ImageInputProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function ImageInput({
  onFileChange,
  disabled = false,
}: ImageInputProps) {
  return (
    <label
      htmlFor="file-upload"
      className={`p-2 text-gray-500 hover:text-gray-700 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/*"
        onChange={onFileChange}
        disabled={disabled}
      />
      <ImageIcon className="size-4" />
      <Small className="sr-only">Upload image</Small>
    </label>
  );
}
