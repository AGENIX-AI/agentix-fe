import React, { useState, useEffect } from "react";
import { fetchBlogs } from "@/api/admin/blogs";
import type { Blog, BlogsQueryParams } from "@/api/admin/blogs";
import { useTranslation } from "react-i18next";
import { Search, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";

export const BlogsPanel: React.FC = () => {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [expandedBlogs, setExpandedBlogs] = useState<Set<string>>(new Set());

  const loadBlogs = async (params?: BlogsQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchBlogs({
        page_number: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        sort_by: "created_at",
        sort_order: -1, // Newest first
        ...params,
      });
      setBlogs(response.blogs);
      setTotalCount(response.total_count);
    } catch (err) {
      setError(t("common.error.failedToLoad"));
      console.error("Failed to fetch blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [currentPage, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const toggleExpanded = (blogId: string) => {
    setExpandedBlogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  const getPreviewContent = (content: string) => {
    // Remove markdown formatting for preview
    const plainText = content
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
      .replace(/\*(.*?)\*/g, "$1") // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links
      .replace(/`(.*?)`/g, "$1") // Remove inline code
      .replace(/\n/g, " ") // Replace newlines with spaces
      .trim();

    // Split into words and take first ~30 words for 2 lines
    const words = plainText.split(" ");
    const previewWords = words.slice(0, 30);
    return previewWords.join(" ") + (words.length > 30 ? "..." : "");
  };

  const hasMorePages = currentPage * pageSize < totalCount;

  if (loading && blogs.length === 0) {
    return (
      <div className="flex-1 p-4 space-y-6">
        {/* Search skeleton */}
        <div className="relative">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Blog skeletons */}
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            {index < 2 && <Separator className="my-6" />}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => loadBlogs()} variant="outline">
            {t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Search bar */}
      <div className="px-6 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("common.search")}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Blogs list */}
      <div className="flex-1 overflow-y-auto px-6 py-3">
        {blogs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              {searchTerm
                ? t("common.noSearchResults")
                : t("blogs.noBlogsFound")}
            </p>
          </div>
        ) : (
          <>
            {/* Blog entries */}
            <div className="space-y-4">
              {blogs.map((blog) => {
                const isExpanded = expandedBlogs.has(blog.id);
                return (
                  <div key={blog.id} className="border rounded-lg p-4">
                    <article className="space-y-2">
                      {/* Title and Date Row */}
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-sm font-medium text-foreground leading-tight flex-1">
                          {blog.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(blog.created_at)}</span>
                          {blog.updated_at !== blog.created_at && (
                            <>
                              <Clock className="h-3 w-3 ml-2" />
                              <span>{formatDate(blog.updated_at)}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Separator */}
                      <Separator className="my-2" />

                      {/* Content Preview or Full Content */}
                      <div className="text-sm text-muted-foreground">
                        {isExpanded ? (
                          <div className="text-xs space-y-2">
                            <ReactMarkdown
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="text-[16px] font-bold mb-2">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-[14px] font-bold mb-2">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-[12px] font-bold mb-1">
                                    {children}
                                  </h3>
                                ),
                                h4: ({ children }) => (
                                  <h4 className="text-[10px] font-bold mb-1">
                                    {children}
                                  </h4>
                                ),
                                h5: ({ children }) => (
                                  <h5 className="text-xs font-bold mb-1">
                                    {children}
                                  </h5>
                                ),
                                h6: ({ children }) => (
                                  <h6 className="text-xs font-bold mb-1">
                                    {children}
                                  </h6>
                                ),
                                p: ({ children }) => (
                                  <p className="text-xs mb-2">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="text-xs list-disc pl-4 mb-2 space-y-1">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="text-xs list-decimal pl-4 mb-2 space-y-1">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-xs">{children}</li>
                                ),
                                strong: ({ children }) => (
                                  <strong className="text-xs font-bold">
                                    {children}
                                  </strong>
                                ),
                                em: ({ children }) => (
                                  <em className="text-xs italic">{children}</em>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="text-xs border-l-2 border-gray-300 pl-3 italic">
                                    {children}
                                  </blockquote>
                                ),
                                code: ({ children }) => (
                                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    {children}
                                  </code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto mb-2">
                                    {children}
                                  </pre>
                                ),
                              }}
                            >
                              {blog.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="line-clamp-2 leading-relaxed">
                            {getPreviewContent(blog.content)}
                          </p>
                        )}
                      </div>

                      {/* Expand/Collapse Button */}
                      <div className="flex justify-center mt-2">
                        <button
                          onClick={() => toggleExpanded(blog.id)}
                          className="text-primary"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>

            {/* Load more button */}
            {hasMorePages && (
              <div className="flex justify-center pt-8">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? t("common.loading") : t("common.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
