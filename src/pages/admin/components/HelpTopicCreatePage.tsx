import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapContentBlocksEditor } from "@/components/editor/TiptapContentBlocksEditor";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { ContentBlock, HelpTopic } from "@/api/admin/helpCenter";
import {
  createHelpTopic,
  fetchHelpTopicsByMainId,
} from "@/api/admin/helpCenter";
import {
  createHelpTopic as createInstructorHelpTopic,
  fetchHelpTopicsByMainId as fetchInstructorHelpTopicsByMainId,
} from "@/api/admin/helpCenterInstructor";

export default function HelpTopicCreatePage() {
  const navigate = useNavigate();
  const { mainId } = useParams<{ mainId: string }>();
  const [searchParams] = useSearchParams();
  const activeTab =
    (searchParams.get("tab") as "student" | "instructor") || "student";

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(true);
  const [title, setTitle] = useState<string>("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const previousBlocksRef = useRef<ContentBlock[]>([]);
  const [nextOrder, setNextOrder] = useState<number>(1);

  const apis = useMemo(() => {
    if (activeTab === "instructor") {
      return {
        create: createInstructorHelpTopic,
        fetchList: fetchInstructorHelpTopicsByMainId,
      };
    }
    return {
      create: createHelpTopic,
      fetchList: fetchHelpTopicsByMainId,
    };
  }, [activeTab]);

  useEffect(() => {
    const loadOrder = async () => {
      if (!mainId) return;
      setLoadingOrder(true);
      try {
        const list: HelpTopic[] = await apis.fetchList(mainId);
        setNextOrder((list?.length || 0) + 1);
      } catch {
        setNextOrder(1);
      } finally {
        setLoadingOrder(false);
      }
    };
    loadOrder();
  }, [mainId, apis]);

  const goBackToList = () => navigate("/admin/help-center");

  const handleSave = async () => {
    if (!mainId) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsSaving(true);
    try {
      await apis.create({
        collection_id: mainId,
        title: title.trim(),
        content: contentBlocks,
        order: nextOrder,
      });
      toast.success("Help topic created successfully");
      goBackToList();
    } catch (err) {
      toast.error("Failed to create help topic");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={goBackToList}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">New Help Topic</h2>
          <p className="text-muted-foreground">
            {activeTab === "instructor" ? "Instructor" : "Student"} Help Center
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic-title">Title</Label>
        <Input
          id="topic-title"
          placeholder="Enter topic title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <TiptapContentBlocksEditor
        blocks={contentBlocks}
        previousBlocks={previousBlocksRef.current}
        onChange={setContentBlocks}
        placeholder="Type '/' for commands..."
      />

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {loadingOrder ? "Calculating order..." : `Order: ${nextOrder}`}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={goBackToList} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? "Saving..." : "Create Topic"}
          </Button>
        </div>
      </div>
    </div>
  );
}
