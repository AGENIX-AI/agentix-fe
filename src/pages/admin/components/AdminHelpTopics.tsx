import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, PlusCircle, Pencil, Trash } from "lucide-react";
import type {
  HelpTopic,
  HelpMainTopic,
  ContentBlock,
} from "@/api/admin/helpCenter";
import {
  createHelpTopic,
  deleteHelpTopic,
  fetchHelpMainTopics,
  fetchHelpTopicsByMainId,
} from "@/api/admin/helpCenter";
// import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { TopicFormSidebar } from "./sidebars/TopicFormSidebar";
import { updatePageBlocks } from "@/api/page";

export function AdminHelpTopics() {
  const { mainTopicId } = useParams<{ mainTopicId: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<HelpTopic[]>([]);
  const [mainTopic, setMainTopic] = useState<HelpMainTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<HelpTopic | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [isFormSidebarVisible, setIsFormSidebarVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  useEffect(() => {
    if (mainTopicId) {
      loadData();
    }
  }, [mainTopicId]);

  const loadData = async () => {
    if (!mainTopicId) return;

    try {
      setLoading(true);

      // Load main topics to get the current main topic info
      const mainTopics = await fetchHelpMainTopics();
      const currentMainTopic = mainTopics.find(
        (topic) => topic.id === mainTopicId
      );
      if (currentMainTopic) {
        setMainTopic(currentMainTopic);
      }

      // Load topics for this main topic
      const topicsList = await fetchHelpTopicsByMainId(mainTopicId);
      setTopics(topicsList);
    } catch (error) {
      console.error("Failed to load help topics:", error);
      toast.error("Failed to load help topics");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTopic = async (
    mainId: string,
    topicData: Partial<HelpTopic> & { title: string; content: ContentBlock[] }
  ) => {
    try {
      if (topicData.id) {
        await updatePageBlocks(topicData.id, {
          title: topicData.title,
          content: topicData.content,
        });

        toast.success("Help topic updated successfully");
      } else {
        if (!mainId) {
          toast.error("Missing main topic id");
          return;
        }
        const newOrder = topics.length + 1;
        const created = await createHelpTopic({
          collection_id: mainId,
          title: topicData.title,
          content: topicData.content,
          order: newOrder,
        });
        setTopics((prev) => [...prev, created]);
        if (mainTopic) {
          setMainTopic({
            ...mainTopic,
            topics_count: (mainTopic.topics_count || 0) + 1,
          });
        }
        toast.success("Help topic created successfully");
      }
    } catch (error) {
      console.error("Failed to save help topic:", error);
      toast.error("Failed to save help topic");
      return;
    } finally {
      setIsFormSidebarVisible(false);
      setSelectedTopic(null);
    }
  };

  const handleDeleteTopic = async () => {
    if (!currentTopic) return;

    try {
      await deleteHelpTopic(currentTopic.id);
      setTopics(topics.filter((topic) => topic.id !== currentTopic.id));

      // Update main topic count
      if (mainTopic) {
        setMainTopic({
          ...mainTopic,
          topics_count: mainTopic.topics_count - 1,
        });
      }

      setIsDeleteDialogOpen(false);
      toast.success("Help topic deleted successfully");
    } catch (error) {
      console.error("Failed to delete help topic:", error);
      toast.error("Failed to delete help topic");
    }
  };

  const openEditDialog = (topic: HelpTopic) => {
    navigate(`/admin/help-center/topics/${topic.id}/edit?tab=student`);
  };

  const openDeleteDialog = (topic: HelpTopic) => {
    setCurrentTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  const openViewSidebar = (topic: HelpTopic) => {
    setSelectedTopic(topic);
    setFormMode("view");
    setIsFormSidebarVisible(true);
  };
  const openCreateSidebar = () => {
    if (!mainTopicId) return;
    navigate(
      `/admin/help-center/collections/${mainTopicId}/topics/new?tab=student`
    );
  };
  const closeFormSidebar = () => {
    setIsFormSidebarVisible(false);
    setSelectedTopic(null);
  };

  const goBack = () => {
    navigate("/admin/help-center");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" onClick={goBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">
            {mainTopic?.title || "Help Topics"}
          </h2>
          <p className="text-muted-foreground">
            Manage topics for this help category
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div></div>
        <Button className="space-x-2" onClick={openCreateSidebar}>
          <PlusCircle className="h-4 w-4" />
          <span>New Topic</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Title
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Order
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-xs text-muted-foreground"
                  >
                    No topics found. Create your first help topic to get
                    started.
                  </TableCell>
                </TableRow>
              ) : (
                topics.map((topic) => (
                  <TableRow key={topic.id} className="hover:bg-muted/50">
                    <TableCell className="text-xs font-medium align-middle">
                      {topic.title}
                    </TableCell>
                    <TableCell className="text-xs align-middle text-center">
                      {topic.order}
                    </TableCell>
                    <TableCell className="align-middle">
                      <div className="flex gap-1 items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-blue-600 hover:text-blue-800"
                          onClick={() => openViewSidebar(topic)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(topic)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(topic)}
                          title="Delete"
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
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Help Topic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this help topic? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteTopic}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isFormSidebarVisible && formMode === "view" && (
        <TopicFormSidebar
          isVisible={isFormSidebarVisible}
          mode={formMode}
          mainId={mainTopicId || ""}
          topic={selectedTopic || undefined}
          onClose={closeFormSidebar}
          onSave={handleSaveTopic}
          onEdit={() => {
            if (selectedTopic) {
              setFormMode("edit");
            }
          }}
          onDelete={(topicId: string) => {
            const found = topics.find((t) => t.id === topicId) || null;
            if (found) {
              setCurrentTopic(found);
              setIsDeleteDialogOpen(true);
            }
          }}
          activeTab="student"
        />
      )}
    </div>
  );
}
