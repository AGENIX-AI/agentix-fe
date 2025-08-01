import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PlusCircle, Pencil, Trash, Eye, Search } from "lucide-react";
import type { Blog, BlogsQueryParams } from "@/api/admin/blogs";
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "@/api/admin/blogs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { BlogFormSidebar } from "./sidebars/BlogFormSidebar";

interface AdminBlogsProps {
  searchQuery?: string;
}

export function AdminBlogs({ searchQuery = "" }: AdminBlogsProps) {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Sidebar states
  const [blogFormSidebar, setBlogFormSidebar] = useState<{
    open: boolean;
    mode: "create" | "edit";
    blog?: Blog;
  }>({ open: false, mode: "create" });

  // Form states
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);

  // Search state
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  useEffect(() => {
    loadBlogs();
  }, [currentPage, searchQuery]);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const params: BlogsQueryParams = {
        page_number: currentPage,
        page_size: pageSize,
        sort_by: "created_at",
        sort_order: -1, // Descending order (newest first)
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await fetchBlogs(params);
      setBlogs(response.blogs);
      setTotalCount(response.total_count);
    } catch (error) {
      console.error("Failed to load blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlogFromSidebar = async (
    blogData: Partial<Blog> & { title: string; content: string }
  ) => {
    try {
      if (blogFormSidebar.mode === "create") {
        const newBlog = await createBlog({
          title: blogData.title,
          content: blogData.content,
        });

        // Add to the beginning of the list (newest first)
        setBlogs([newBlog, ...blogs]);
        setTotalCount(totalCount + 1);
        toast.success("Blog created successfully");
      } else if (blogFormSidebar.mode === "edit" && blogData.id) {
        const updatedBlog = await updateBlog(blogData.id, {
          title: blogData.title,
          content: blogData.content,
        });

        setBlogs(
          blogs.map((blog) => (blog.id === blogData.id ? updatedBlog : blog))
        );
        toast.success("Blog updated successfully");
      }

      setBlogFormSidebar({ open: false, mode: "create" });
    } catch (error) {
      console.error("Failed to save blog:", error);
      toast.error("Failed to save blog");
    }
  };

  const handleDeleteBlog = async () => {
    if (!currentBlog) return;

    try {
      await deleteBlog(currentBlog.id);
      setBlogs(blogs.filter((blog) => blog.id !== currentBlog.id));
      setTotalCount(totalCount - 1);

      setCurrentBlog(null);
      setIsDeleteDialogOpen(false);
      toast.success("Blog deleted successfully");
    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const openEditSidebar = (blog: Blog) => {
    setBlogFormSidebar({ open: true, mode: "edit", blog });
  };

  const openViewSidebar = (blog: Blog) => {
    setBlogFormSidebar({ open: true, mode: "edit", blog });
  };

  const openCreateSidebar = () => {
    setBlogFormSidebar({ open: true, mode: "create" });
  };

  const openDeleteDialog = (blog: Blog) => {
    setCurrentBlog(blog);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Manage blog posts ({totalCount} total)
          </p>
        </div>
        <Button onClick={openCreateSidebar}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Blog
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search blogs..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Blogs Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchQuery
                      ? "No blogs found matching your search."
                      : "No blogs created yet."}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    <div className="font-medium">{blog.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-md">
                      {blog.content.substring(0, 100)}...
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(blog.created_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(blog.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewSidebar(blog)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSidebar(blog)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(blog)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} blogs
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-xs">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Blog Form Sidebar */}
      <BlogFormSidebar
        isVisible={blogFormSidebar.open}
        mode={blogFormSidebar.mode}
        blog={blogFormSidebar.blog}
        onClose={() => setBlogFormSidebar({ open: false, mode: "create" })}
        onSave={handleSaveBlogFromSidebar}
      />



      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentBlog?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteBlog}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
