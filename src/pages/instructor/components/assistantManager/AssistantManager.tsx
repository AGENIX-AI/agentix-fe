import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Languages, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getMyAssistants } from "@/api/assistants";
import type { Assistant } from "@/api/assistants";
import AssistantDetails from "./AssistantDetails";

export default function AssistantManager() {
  const { t } = useTranslation();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // This is the actual search query used for API
  const [searchInput, setSearchInput] = useState(""); // This is the input field value
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(
    null
  );

  // Function to fetch assistants
  const fetchAssistants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyAssistants({
        page_number: pageNumber,
        page_size: pageSize,
        sort_order: -1,
        sort_by: "created_at",
        search: searchQuery,
        have_personality: false,
        have_last_message: false,
      });

      if (response.success) {
        setAssistants(response.assistants);
        setTotalCount(response.total_count);
      } else {
        setError(t("error"));
      }
    } catch (err) {
      console.error("Error fetching assistants:", err);
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, searchQuery, t]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
        setPageNumber(1); // Reset to first page when searching
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchInput, searchQuery]);

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value); // Update input value immediately for responsive UI
  };

  const handleAssistantClick = (assistantId: string) => {
    setSelectedAssistantId(assistantId);
  };

  const handleBackToList = () => {
    setSelectedAssistantId(null);
  };

  if (selectedAssistantId) {
    return (
      <AssistantDetails
        assistantId={selectedAssistantId}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t(
              "assistant.searchPlaceholder",
              "Search assistants..."
            )}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button size="sm">
          {t("assistant.create", "Create New Assistant")}
        </Button>
      </div>

      <div className="space-y-4">
        {assistants.map((assistant) => (
          <div
            key={assistant.id}
            className="border rounded-md p-4 hover:bg-accent/5 cursor-pointer"
            onClick={() => handleAssistantClick(assistant.id)}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={assistant.image}
                  alt={assistant.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/48x48?text=NA";
                  }}
                />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base truncate">
                    {assistant.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Languages className="h-3 w-3" />
                      {assistant.language}
                    </Badge>
                    {assistant.role === "system" && (
                      <Badge variant="secondary" className="text-xs">
                        {t("assistant.system", "System")}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {assistant.tagline}
                </p>
              </div>
            </div>
            {assistant.speciality && (
              <div className="mt-2 pt-2 border-t text-sm">
                <span className="font-medium">
                  {t("assistant.speciality", "Speciality")}:
                </span>{" "}
                {assistant.speciality}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalCount > pageSize && (
        <div className="mt-6">
          <Pagination
            currentPage={pageNumber}
            totalPages={Math.ceil(totalCount / pageSize)}
            totalItems={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
