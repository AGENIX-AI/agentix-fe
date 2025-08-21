import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { TiptapContentBlocksEditor } from "@/components/editor/TiptapContentBlocksEditor";
import type { ContentBlock } from "@/api/admin/helpCenter";
import { createBlog } from "@/api/admin/blogs";
import { updatePageBlocks } from "@/api/page";

export default function BlogCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const goBack = () => navigate("/admin/blogs");

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsSaving(true);
    try {
      // Create via blogs API (content left blank; blocks will be set via page API)
      const blog = await createBlog({ title: title.trim(), content: "" });
      // Update page blocks for the created blog
      await updatePageBlocks(blog.id, {
        title: title.trim(),
        content: contentBlocks.map((b) => ({
          id: b.id,
          order: b.order,
          type: b.type,
          data: b.data,
        })),
      });
      toast.success("Blog created successfully");
      goBack();
    } catch (e) {
      toast.error("Failed to create blog");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold">New Blog</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Title</Label>
          <Input
            id="blog-title"
            placeholder="Enter blog title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <TiptapContentBlocksEditor
          blocks={contentBlocks}
          onChange={setContentBlocks}
          placeholder="Type '/' for commands..."
        />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={goBack} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSaving || !title.trim()}>
            {isSaving ? "Creating..." : "Create Blog"}
          </Button>
        </div>
      </div>
    </div>
  );
}
