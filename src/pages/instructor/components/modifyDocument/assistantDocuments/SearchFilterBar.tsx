import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  documentType: "document" | "image" | "all" | undefined;
  setDocumentType: (type: "document" | "image" | "all") => void;
}

export function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  documentType,
  setDocumentType,
}: SearchFilterBarProps) {
  return (
    <div className="w-full flex justify-between items-start mb-3">
      <div></div>
      <div className="flex items-center space-x-6">
        <div className="relative flex items-center gap-2">
          <SearchIcon className="absolute left-4 h-4 text-muted-foreground" />
          <Input
            className="h-8 pl-10"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-3">
          <Label htmlFor="documentType" className="text-xs">
            Type:
          </Label>
          <Select
            value={documentType}
            onValueChange={(value) =>
              setDocumentType(value as "document" | "image" | "all")
            }
          >
            <SelectTrigger className="text-xs h-8 w-24">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
