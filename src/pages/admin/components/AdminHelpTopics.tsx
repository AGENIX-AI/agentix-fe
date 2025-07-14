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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, PlusCircle, Pencil, Trash, Eye } from "lucide-react";
import type { HelpTopic, HelpMainTopic } from "@/api/admin/helpCenter";
import {
  createHelpTopic,
  deleteHelpTopic,
  fetchHelpMainTopics,
  fetchHelpTopicsByMainId,
  updateHelpTopic,
} from "@/api/admin/helpCenter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { HelpTopicDetailSidebar } from "./sidebars/HelpTopicDetailSidebar";

export function AdminHelpTopics() {
  const { mainTopicId } = useParams<{ mainTopicId: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<HelpTopic[]>([]);
  const [mainTopic, setMainTopic] = useState<HelpMainTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<HelpTopic | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);

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

  const handleCreateTopic = async () => {
    if (!mainTopicId || !newTopicTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      const newOrder = topics.length + 1;
      const newTopic = await createHelpTopic({
        help_main_id: mainTopicId,
        title: newTopicTitle,
        content: newTopicContent,
        order: newOrder,
      });
      setTopics([...topics, newTopic]);

      // Update main topic count
      if (mainTopic) {
        setMainTopic({
          ...mainTopic,
          topics_count: mainTopic.topics_count + 1,
        });
      }

      setNewTopicTitle("");
      setNewTopicContent("");
      setIsCreateDialogOpen(false);
      toast.success("Help topic created successfully");
    } catch (error) {
      console.error("Failed to create help topic:", error);
      toast.error("Failed to create help topic");
    }
  };

  const handleUpdateTopic = async () => {
    if (!currentTopic || !newTopicTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const updatedTopic = await updateHelpTopic(currentTopic.id, {
        title: newTopicTitle,
        content: newTopicContent,
      });

      setTopics(
        topics.map((topic) =>
          topic.id === currentTopic.id ? updatedTopic : topic
        )
      );
      setIsEditDialogOpen(false);
      toast.success("Help topic updated successfully");
    } catch (error) {
      console.error("Failed to update help topic:", error);
      toast.error("Failed to update help topic");
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
    setCurrentTopic(topic);
    setNewTopicTitle(topic.title);
    setNewTopicContent(topic.content);
    setIsEditDialogOpen(true);
    setActiveTab("edit");
  };

  const openDeleteDialog = (topic: HelpTopic) => {
    setCurrentTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  const openPreviewDialog = (topic: HelpTopic) => {
    setCurrentTopic(topic);
    setIsPreviewDialogOpen(true);
  };

  const openSidebar = (topic: HelpTopic) => {
    setSelectedTopic(topic);
    setSidebarVisible(true);
  };
  const closeSidebar = () => {
    setSidebarVisible(false);
    setSelectedTopic(null);
  };

  const goBack = () => {
    navigate("/admin/help-center");
  };

  const renderMarkdown = (content: string) => {
    // This is a simple implementation - you might want to use a proper Markdown renderer
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>New Topic</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Help Topic</DialogTitle>
              <DialogDescription>
                Add a new help topic to this category.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-4">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Getting Started Guide"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                  />
                </div>
                {/* Order is auto-set, so no order input here */}
              </div>

              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
              >
                <TabsList className="mb-2">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="content">Content (Markdown)</Label>
                    <Textarea
                      id="content"
                      placeholder="# Topic Title
                      
## Section 1
Write your content using Markdown formatting..."
                      value={newTopicContent}
                      onChange={(e) => setNewTopicContent(e.target.value)}
                      className="min-h-[300px] font-mono"
                    />
                  </div>
                </TabsContent>
                <TabsContent
                  value="preview"
                  className="mt-0 border rounded-md p-4 min-h-[300px]"
                >
                  {newTopicContent ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {renderMarkdown(newTopicContent)}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Enter content in the Edit tab to see preview here
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateTopic}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                          onClick={() => openSidebar(topic)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openPreviewDialog(topic)}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Help Topic</DialogTitle>
            <DialogDescription>
              Update the details of this help topic.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Topic title"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
              />
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "edit" | "preview")}
            >
              <TabsList className="mb-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-0">
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Content (Markdown)</Label>
                  <Textarea
                    id="edit-content"
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    className="min-h-[400px] font-mono"
                  />
                </div>
              </TabsContent>
              <TabsContent
                value="preview"
                className="mt-0 border rounded-md p-4 min-h-[400px]"
              >
                {newTopicContent ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {renderMarkdown(newTopicContent)}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Enter content in the Edit tab to see preview here
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateTopic}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{currentTopic?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {currentTopic && renderMarkdown(currentTopic.content)}
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
            <Button
              variant="outline"
              onClick={() => {
                setIsPreviewDialogOpen(false);
                if (currentTopic) {
                  openEditDialog(currentTopic);
                }
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <HelpTopicDetailSidebar
        isVisible={sidebarVisible}
        onClose={closeSidebar}
        topic={selectedTopic}
      />
    </div>
  );
}
