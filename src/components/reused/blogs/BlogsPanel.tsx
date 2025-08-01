import React, { useState, useEffect } from 'react';
import { fetchBlogs } from '@/api/admin/blogs';
import type { Blog, BlogsQueryParams } from '@/api/admin/blogs';
import { useTranslation } from 'react-i18next';
import { Search, Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';

export const BlogsPanel: React.FC = () => {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadBlogs = async (params?: BlogsQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchBlogs({
        page_number: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        sort_by: 'created_at',
        sort_order: -1, // Newest first
        ...params,
      });
      setBlogs(response.blogs);
      setTotalCount(response.total_count);
    } catch (err) {
      setError(t('common.error.failedToLoad'));
      console.error('Failed to fetch blogs:', err);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
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
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Search bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Blogs list */}
      <div className="flex-1 overflow-y-auto p-4">
        {blogs.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? t('common.noSearchResults') : t('blogs.noBlogsFound')}
            </p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
              <span>
                {t('common.showing')} {blogs.length} {t('common.of')} {totalCount} {t('blogs.blogs')}
              </span>
            </div>

            {/* Blog entries */}
            <div className="space-y-8">
              {blogs.map((blog, index) => (
                <div key={blog.id}>
                  <article className="space-y-4">
                    {/* Blog title */}
                    <h2 className="text-xl font-bold text-foreground hover:text-primary cursor-pointer transition-colors">
                      {blog.title}
                    </h2>
                    
                    {/* Blog metadata */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(blog.created_at)}</span>
                      </div>
                      {blog.updated_at !== blog.created_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{t('blogs.updated')} {formatDate(blog.updated_at)}</span>
                        </div>
                      )}
                    </div>

                    {/* Blog content as markdown */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
                          p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-muted pl-4 italic text-muted-foreground mb-3">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children }) => (
                            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-3">{children}</pre>
                          ),
                        }}
                      >
                        {blog.content}
                      </ReactMarkdown>
                    </div>
                  </article>
                  
                  {/* Separator between blogs */}
                  {index < blogs.length - 1 && <Separator className="my-8" />}
                </div>
              ))}
            </div>

            {/* Load more button */}
            {hasMorePages && (
              <div className="flex justify-center pt-8">
                <Button 
                  onClick={handleLoadMore} 
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? t('common.loading') : t('common.loadMore')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
