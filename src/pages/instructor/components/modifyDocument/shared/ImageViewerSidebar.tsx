import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, Search } from "lucide-react";
import {
  getImageDocument,
  type ImageDocument,
  type GetImageDocumentsParams,
} from "@/api/documents";

interface ImageViewerSidebarProps {
  isVisible: boolean;
  documentId: string | null;
  onClose: () => void;
}

export function ImageViewerSidebar({
  isVisible,
  documentId,
  onClose,
}: ImageViewerSidebarProps) {
  const [images, setImages] = useState<ImageDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);

  // Fetch images when documentId changes or search/page changes
  useEffect(() => {
    if (documentId && isVisible) {
      fetchImages();
    }
  }, [documentId, isVisible, searchQuery, currentPage]);

  // Reset when sidebar opens
  useEffect(() => {
    if (isVisible && documentId) {
      setCurrentPage(1);
      setSearchQuery("");
    }
  }, [isVisible, documentId]);

  const fetchImages = async () => {
    if (!documentId) return;

    setIsLoading(true);
    try {
      const params: GetImageDocumentsParams = {
        page_number: currentPage,
        page_size: pageSize,
        sort_by: "chunk_index",
        sort_order: 1,
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await getImageDocument(documentId, params);

      if (response.success) {
        setImages(response.documents);
        setTotalItems(response.total_items);
      }
    } catch (error) {
      console.error("Error fetching image documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchImages();
  };

  const handleNextPage = () => {
    if (currentPage * pageSize < totalItems) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-screen border-l overflow-auto flex flex-col z-30 transition-transform duration-300 ease-in-out bg-background ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
      style={{ width: "700px" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background flex items-center justify-between h-18 border-b w-full px-6 py-3">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-bold">Document Images</h3>
          {totalItems > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalItems} image{totalItems !== 1 ? "s" : ""} found
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8 text-xs"
            />
          </div>
          <Button type="submit" size="sm" className="h-8">
            Search
          </Button>
        </form>
      </div>

      {/* Content */}
      <div className="flex flex-col h-full">
        <div className="px-6 py-3 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Loading images...</p>
            </div>
          ) : images.length > 0 ? (
            <div className="space-y-4">
              {images.map((image, index) => (
                <div
                  key={image.chunk_index || index}
                  className="border rounded-lg overflow-hidden bg-card"
                >
                  <div className="relative">
                    <img
                      src={image.url}
                      alt={image.title || image.summary}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-medium line-clamp-2">
                      {image.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {image.summary}
                    </p>
                    {image.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {image.keywords.slice(0, 5).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                    <a
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-primary hover:underline"
                    >
                      View Full Size
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs text-muted-foreground">
                No images found for this document
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalItems > pageSize && (
          <div className="p-6 bg-background border-t">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalItems / pageSize)}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage * pageSize >= totalItems}
                  className="h-8"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
