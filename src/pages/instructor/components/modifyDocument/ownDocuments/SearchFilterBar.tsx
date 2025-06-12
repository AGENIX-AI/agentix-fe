import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import type { DocumentType } from "./OwnDocumentsComponent";
import { Button } from "@/components/ui/button";

interface SearchFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  documentType: DocumentType;
  setDocumentType: (type: DocumentType) => void;
  onAddDocument: () => void;
}

export function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  documentType,
  setDocumentType,
  onAddDocument,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-row gap-3 mb-4">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-70"
        />
      </div>
      <div className="flex-1 sm:w-40">
        <Select
          value={documentType || "all"}
          onValueChange={(value) => setDocumentType(value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center">
        <Button onClick={onAddDocument}>Add Document</Button>
      </div>
    </div>
  );
}
