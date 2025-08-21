import { useCallback, useEffect, useRef, useState } from "react";
import { getPageBlocks } from "@/api/page";
import type { BlockData } from "@/api/page";

export interface DocumentBlock {
  id: string;
  type: string;
  data: {
    text?: string;
    level?: number;
    items?: string[];
    style?: string;
    url?: string;
    alt_text?: string;
    caption?: string;
    title?: string;
    [key: string]: any;
  };
}

export interface DocumentBlockItem {
  block: DocumentBlock;
  section_id: string;
  section_title: string;
  section_order: number;
  block_order: number;
  combined_order: number[];
}

interface DocumentBlocksRendererProps {
  documentId: string;
  className?: string;
  pageSize?: number;
}

export function DocumentBlocksRenderer({
  documentId,
  className = "",
  pageSize = 20,
}: DocumentBlocksRendererProps) {
  // Internal state for managing document blocks
  const [documentBlocks, setDocumentBlocks] = useState<
    (DocumentBlock | DocumentBlockItem | BlockData)[]
  >([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isLoadingMoreBlocks, setIsLoadingMoreBlocks] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreBlocks, setHasMoreBlocks] = useState(true);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const lastLoadedPageRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(false);
  const isLoadingAnyRef = useRef<boolean>(false);

  type RenderableItem = DocumentBlock | DocumentBlockItem | BlockData;

  // Helper to create a stable identity key for deduping and React keys
  const getItemIdentityKey = (item: RenderableItem): string => {
    if ("block" in item) {
      const id = item.block.id ?? "";
      const order = (item as any).block_order ?? "";
      return `${id}-${order}`;
    }
    const id = (item as any).id ?? "";
    const order = (item as any).order ?? "";
    return `${id}-${order}`;
  };

  // Helper function to extract block data from either structure
  const getBlockData = (item: RenderableItem) => {
    if ("block" in item) {
      // New structure: DocumentBlockItem
      return {
        id: item.block.id,
        type: item.block.type,
        data: item.block.data,
        order: item.block_order,
      };
    } else if ("data" in item && "type" in item && "order" in item) {
      // Page API BlockData structure
      const bd = item as BlockData;
      return {
        id: bd.id ?? null,
        type: bd.type,
        data: bd.data,
        order: bd.order,
      };
    } else {
      // Old structure: DocumentBlock
      return {
        id: item.id,
        type: item.type,
        data: item.data,
        order: (item as any).order || 0,
      };
    }
  };

  // Load more blocks function
  const loadMoreBlocks = useCallback(async () => {
    if (isLoadingMoreBlocks || isLoadingAnyRef.current || !hasMoreBlocks) {
      console.log("Load more blocked:", {
        isLoadingMoreBlocks,
        isLoadingAnyRef: isLoadingAnyRef.current,
        hasMoreBlocks,
      });
      return;
    }

    const nextPage = currentPage + 1;

    // Check if we've already loaded this page
    if (lastLoadedPageRef.current >= nextPage) {
      console.log(
        "Page already loaded:",
        nextPage,
        "Last loaded:",
        lastLoadedPageRef.current
      );
      return;
    }

    // Double-check loading state to prevent race conditions
    if (isLoadingMoreBlocks) {
      console.log("Already loading, skipping duplicate call");
      return;
    }

    console.log("Starting to load page:", nextPage);
    isLoadingAnyRef.current = true;
    setIsLoadingMoreBlocks(true);

    try {
      const response = await getPageBlocks(documentId, {
        page_number: nextPage,
        page_size: pageSize,
        sort_order: -1,
        sort_by: "order",
      });

      if (response.items && response.items.length > 0) {
        setDocumentBlocks((prev) => {
          // Handle new API structure where items have nested block objects OR plain BlockData
          const newBlocks = response.items as RenderableItem[];

          const existingKeys = new Set(
            prev.map((item) => getItemIdentityKey(item as RenderableItem))
          );
          const filteredBlocks = newBlocks.filter(
            (item) => !existingKeys.has(getItemIdentityKey(item))
          );
          return [...prev, ...filteredBlocks];
        });

        setCurrentPage(nextPage);
        lastLoadedPageRef.current = nextPage;

        // Check if we have more pages based on total items and current page
        const totalPages = Math.ceil(response.total_items / pageSize);
        const hasMore = nextPage < totalPages;

        setHasMoreBlocks(hasMore);
        setTotalBlocks(response.total_items);
      } else {
        // No more items, set hasMoreBlocks to false
        setHasMoreBlocks(false);
      }
    } catch (error) {
      console.error("Error loading more document blocks:", error);
    } finally {
      setIsLoadingMoreBlocks(false);
      isLoadingAnyRef.current = false;
    }
  }, [documentId, pageSize, isLoadingMoreBlocks, hasMoreBlocks, currentPage]);

  // Initial data fetching
  useEffect(() => {
    if (!documentId) return;

    // Reset initial load flag when document changes
    isInitialLoadRef.current = false;

    // Prevent multiple initial loads
    if (isInitialLoadRef.current) {
      console.log("Initial load already in progress, skipping");
      return;
    }

    const fetchInitialBlocks = async () => {
      isInitialLoadRef.current = true;
      isLoadingAnyRef.current = true;
      setIsLoadingBlocks(true);
      setDocumentBlocks([]);
      setCurrentPage(1);
      setHasMoreBlocks(true);
      setTotalBlocks(0);
      lastLoadedPageRef.current = 0;

      try {
        const response = await getPageBlocks(documentId, {
          page_number: 1,
          page_size: pageSize,
          sort_order: -1,
          sort_by: "order",
          organize_by_section: true,
        });

        if (response.items) {
          setDocumentBlocks(response.items);
          setTotalBlocks(response.total_items);
          setHasMoreBlocks(
            response.items.length === pageSize &&
              response.total_items > pageSize
          );
        }
      } catch (error) {
        console.error("Error fetching document blocks:", error);
      } finally {
        setIsLoadingBlocks(false);
        isLoadingAnyRef.current = false;
      }
    };

    fetchInitialBlocks();
  }, [documentId, pageSize]);

  // Infinite scroll handler with better debouncing
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 50; // Reduced threshold for more responsive loading
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Additional safety check: don't load if we've already loaded all items
    if (
      !isLoadingMoreBlocks &&
      !isLoadingAnyRef.current &&
      hasMoreBlocks &&
      distanceFromBottom <= threshold &&
      documentBlocks.length < totalBlocks &&
      totalBlocks > 0 // Ensure we have a valid total
    ) {
      console.log("Scroll triggered load more blocks...");
      // Use a more robust debouncing approach
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        if (!isLoadingMoreBlocks && hasMoreBlocks) {
          loadMoreBlocks();
        }
      }, 150); // Reduced delay for more responsive loading
    }
  }, [
    isLoadingMoreBlocks,
    hasMoreBlocks,
    documentBlocks.length,
    totalBlocks,
    loadMoreBlocks,
  ]);

  // Add scroll event listener for infinite scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Handle both scroll and wheel events for better compatibility
    const handleScrollEvent = () => {
      handleScroll();
    };

    const handleWheelEvent = () => {
      // Debounce wheel events to prevent excessive calls
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        handleScroll();
      }, 100);
    };

    container.addEventListener("scroll", handleScrollEvent, { passive: true });
    container.addEventListener("wheel", handleWheelEvent, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScrollEvent);
      container.removeEventListener("wheel", handleWheelEvent);
      // Clear any pending timeouts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  if (isLoadingBlocks) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (documentBlocks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No content available</p>
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className={`space-y-4 ${className}`}>
      {documentBlocks.map((item, index) => {
        const block = getBlockData(item as RenderableItem);
        const keyId = (block.id as any) ?? `order-${block.order}`;
        return (
          <div
            key={`${keyId}-${block.order || index}`}
            className="block-content"
          >
            {/* Header blocks */}
            {block.type === "header" && (
              <div className="header-block">
                {block.data.level === 1 && (
                  <h1 className="text-2xl font-bold mb-4">{block.data.text}</h1>
                )}
                {block.data.level === 2 && (
                  <h2 className="text-xl font-semibold mb-3">
                    {block.data.text}
                  </h2>
                )}
                {block.data.level === 3 && (
                  <h3 className="text-lg font-medium mb-2">
                    {block.data.text}
                  </h3>
                )}
                {(block.data.level || 1) > 3 && (
                  <h4 className="text-base font-medium mb-2">
                    {block.data.text}
                  </h4>
                )}
              </div>
            )}

            {/* Paragraph blocks */}
            {block.type === "paragraph" && (
              <p className="text-sm leading-relaxed mb-4 text-foreground">
                {block.data.text}
              </p>
            )}

            {/* List blocks */}
            {block.type === "list" && (
              <div className="mb-4">
                {block.data.style === "ordered" ? (
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    {block.data.items?.map((listItem: string, idx: number) => (
                      <li key={idx} className="text-foreground">
                        {listItem}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {block.data.items?.map((listItem: string, idx: number) => (
                      <li key={idx} className="text-foreground">
                        {listItem}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Table blocks */}
            {block.type === "table" && (
              <div className="mb-4">
                <div className="overflow-x-auto border border-border rounded-md">
                  <table className="w-full border-collapse text-sm">
                    {Array.isArray(block.data.rows) &&
                      block.data.rows.length > 0 && (
                        <>
                          <thead>
                            <tr className="bg-muted/40">
                              {block.data.rows[0].map(
                                (cell: string, idx: number) => (
                                  <th
                                    key={`head-${idx}`}
                                    className="text-left px-3 py-2 border-b border-border font-medium text-foreground"
                                  >
                                    {cell}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          {block.data.rows.length > 1 && (
                            <tbody>
                              {block.data.rows
                                .slice(1)
                                .map((row: string[], rIdx: number) => (
                                  <tr
                                    key={`row-${rIdx}`}
                                    className={
                                      rIdx % 2 === 0
                                        ? "bg-background"
                                        : "bg-muted/10"
                                    }
                                  >
                                    {row.map((cell: string, cIdx: number) => (
                                      <td
                                        key={`cell-${rIdx}-${cIdx}`}
                                        className="px-3 py-2 border-b border-border text-foreground"
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                            </tbody>
                          )}
                        </>
                      )}
                    {(!block.data.rows || block.data.rows.length === 0) && (
                      <tbody>
                        <tr>
                          <td className="px-3 py-2 text-muted-foreground">
                            No data
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>
                {block.data.caption && (
                  <p className="text-xs text-muted-foreground mt-2 text-center italic">
                    {block.data.caption}
                  </p>
                )}
              </div>
            )}

            {/* Image blocks */}
            {block.type === "image" && (
              <div className="mb-4">
                <img
                  src={block.data.url}
                  alt={block.data.alt_text || block.data.caption || "Image"}
                  className="max-w-full h-auto rounded-md border border-border"
                  loading="lazy"
                />
                {block.data.caption && (
                  <p className="text-sm text-muted-foreground mt-2 text-center italic">
                    {block.data.caption}
                  </p>
                )}
              </div>
            )}

            {/* Separator blocks */}
            {block.type === "separator" && (
              <div className="my-6">
                {block.data.style === "horizontal_line" && (
                  <hr className="border-t border-border" />
                )}
              </div>
            )}

            {/* URL blocks */}
            {block.type === "url" && (
              <div className="mb-4 p-4 border border-border rounded-lg bg-muted/30">
                <h4 className="text-sm font-medium mb-2">
                  {block.data.title || "URL"}
                </h4>
                <a
                  href={block.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {block.data.url}
                </a>
                {block.data.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                  <div className="mt-3">
                    <img
                      src={block.data.url}
                      alt={block.data.title || "Image"}
                      className="max-w-full h-auto rounded border"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Loading more indicator */}
      {isLoadingMoreBlocks && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">
            Loading more content...
          </span>
        </div>
      )}

      {/* Subtle loading indicator when approaching bottom */}
      {!isLoadingMoreBlocks && hasMoreBlocks && documentBlocks.length > 0 && (
        <div className="flex justify-center items-center py-2 opacity-50">
          <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* End of content indicator */}
      {!hasMoreBlocks && documentBlocks.length > 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            End of document ({totalBlocks} blocks total)
          </p>
        </div>
      )}
    </div>
  );
}
