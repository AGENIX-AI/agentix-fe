import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DocumentGuidelines() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter guidelines based on search query
  const fileTypes = [
    { label: "Documents (PDF, DOC, DOCX)", searchTerms: ["pdf", "doc", "docx", "documents"] },
    { label: "Markdown (.md, .markdown)", searchTerms: ["markdown", "md"] }
  ];

  const sizeLimits = [
    { label: "Maximum file size: 10MB", searchTerms: ["size", "10mb", "maximum", "limit"] },
    { label: "Recommended image resolution: 1920×1080", searchTerms: ["resolution", "1920", "1080", "image", "recommended"] }
  ];

  const filteredFileTypes = fileTypes.filter(item => 
    searchQuery === "" || 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.searchTerms.some(term => term.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSizeLimits = sizeLimits.filter(item => 
    searchQuery === "" || 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.searchTerms.some(term => term.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-3 bg-muted-foreground/50 rounded-full"></div>
          <p className="text-xs font-medium">Document Guidelines</p>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search guidelines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-8 text-xs"
        />
      </div>

      <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
        {(filteredFileTypes.length > 0 || searchQuery === "") && (
          <div className="p-3 border border-border/80 rounded-md flex-1 bg-accent/5 hover:bg-accent/10 transition-colors">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-1 h-2 bg-primary/70 rounded-full"></div>
              <p className="text-xs font-medium">Accepted File Types</p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 pl-2">
              {(searchQuery === "" ? fileTypes : filteredFileTypes).map((item, index) => (
                <li key={index} className="flex items-center space-x-1">
                  <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(filteredSizeLimits.length > 0 || searchQuery === "") && (
          <div className="p-3 border border-border/80 rounded-md flex-1 bg-accent/5 hover:bg-accent/10 transition-colors">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-1 h-2 bg-primary/70 rounded-full"></div>
              <p className="text-xs font-medium">Size Limits</p>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 pl-2">
              {(searchQuery === "" ? sizeLimits : filteredSizeLimits).map((item, index) => (
                <li key={index} className="flex items-center space-x-1">
                  <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* No results message */}
      {searchQuery !== "" && filteredFileTypes.length === 0 && filteredSizeLimits.length === 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">No guidelines found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
