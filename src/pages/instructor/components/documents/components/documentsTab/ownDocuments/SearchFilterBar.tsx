import { Input } from "@/components/ui/input";

interface SearchFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function SearchFilterBar({
  searchQuery,
  setSearchQuery,
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
    </div>
  );
}
