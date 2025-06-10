import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languageOptions } from "./types";
import { cn } from "@/lib/utils";

interface BasicInformationProps {
  name: string;
  tagline: string;
  description: string;
  language: string;
  onInputChange: (field: string, value: string) => void;
  onGenerateWithAI: (field: "name" | "tagline" | "description") => void;
  className?: string;
}

export function BasicInformation({
  name,
  tagline,
  description,
  language,
  onInputChange,
  onGenerateWithAI,
  className,
}: BasicInformationProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-sm font-bold">Basic Information</h2>
      <div>
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="name">Name</Label>
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => onGenerateWithAI("name")}
            >
              <Wand2 className="w-4 h-4 mr-1" /> Generate
            </Button>
          </div>
          <Input
            id="name"
            value={name}
            onChange={(e) => onInputChange("name", e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="tagline">Tagline</Label>
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => onGenerateWithAI("tagline")}
            >
              <Wand2 className="w-4 h-4 mr-1" /> Generate
            </Button>
          </div>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => onInputChange("tagline", e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="description">Description</Label>
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => onGenerateWithAI("description")}
            >
              <Wand2 className="w-4 h-4 mr-1" /> Generate
            </Button>
          </div>
          <Textarea
            id="description"
            className="min-h-32"
            value={description}
            onChange={(e) => onInputChange("description", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <Label htmlFor="language" className="mb-3 block">
          Language
        </Label>
        <Select
          value={language}
          onValueChange={(value) => onInputChange("language", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
