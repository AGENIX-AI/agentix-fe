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
    <div className="flex flex-row gap-3 mb-3 w-full">
      <div className="w-1/2">
        <Input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-[20%]">
        <Select
          value={documentType || "all"}
          onValueChange={(value) => setDocumentType(value as any)}
        >
          <SelectTrigger className="w-full">
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

      <div className="w-[30%]">
        <Button onClick={onAddDocument} className="w-full">
          Add Document
        </Button>
      </div>
    </div>
  );
}
