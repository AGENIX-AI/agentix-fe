import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TiptapContentBlocksEditor } from "@/components/editor/TiptapContentBlocksEditor";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { ContentBlock, HelpTopic } from "@/api/admin/helpCenter";
import { fetchHelpTopic, updateHelpTopic } from "@/api/admin/helpCenter";
import {
  fetchHelpTopic as fetchInstructorHelpTopic,
  updateHelpTopic as updateInstructorHelpTopic,
} from "@/api/admin/helpCenterInstructor";

export default function HelpTopicEditPage() {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const [searchParams] = useSearchParams();
  const activeTab =
    (searchParams.get("tab") as "student" | "instructor") || "student";

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [title, setTitle] = useState<string>("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const previousBlocksRef = useRef<ContentBlock[]>([]);

  const apis = useMemo(() => {
    if (activeTab === "instructor") {
      return {
        fetchById: fetchInstructorHelpTopic,
        updateById: updateInstructorHelpTopic,
      };
    }
    return {
      fetchById: fetchHelpTopic,
      updateById: updateHelpTopic,
    };
  }, [activeTab]);

  useEffect(() => {
    const load = async () => {
      if (!topicId) {
        setErrorMessage("Missing topic id");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const topic: HelpTopic = await apis.fetchById(topicId);
        setTitle(topic.title || "");
        setContentBlocks(topic.content || []);
        previousBlocksRef.current = topic.content || [];
      } catch (err) {
        setErrorMessage("Failed to load topic. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [topicId, apis]);

  const goBackToList = () => {
    navigate("/admin/help-center");
  };

  const handleSave = async () => {
    if (!topicId) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsSaving(true);
    try {
      await apis.updateById(topicId, {
        title: title.trim(),
        content: contentBlocks,
      });
      toast.success("Help topic updated successfully");
      goBackToList();
    } catch (err) {
      toast.error("Failed to update help topic");
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
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : errorMessage ? (
        <div className="space-y-4">
          <div className="text-destructive">{errorMessage}</div>
          <Button variant="outline" onClick={goBackToList}>
            Back
          </Button>
        </div>
      ) : (
        <>
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

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={goBackToList}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
