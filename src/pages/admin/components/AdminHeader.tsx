import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { H3 } from "@/components/ui/typography";

interface AdminHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showNewButton: boolean;
  newButtonText: string;
}

export function AdminHeader({
  title,
  searchQuery,
  onSearchChange,
  showNewButton,
  newButtonText,
}: AdminHeaderProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearchChange]);

  // Update local state when parent search query changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  return (
    <header className="flex items-center justify-between p-6 bg-background border-b border-border h-18">
      {/* Title */}
      <H3 className="font-semibold">{title}</H3>

      {/* Right section with search and new button */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Search ${title.toLowerCase()}`}
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10 w-80 text-xs"
          />
        </div>

        {/* New Button */}
        {showNewButton && <Button className="text-xs">{newButtonText}</Button>}
      </div>
    </header>
  );
}
