import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import type {
  HelpMainTopic,
  HelpTopic,
  ContentBlock,
} from "@/api/admin/helpCenter";
import {
  createHelpMainTopic as createStudentHelpMainTopic,
  deleteHelpMainTopic as deleteStudentHelpMainTopic,
  fetchHelpMainTopics as fetchStudentHelpMainTopics,
  updateHelpMainTopic as updateStudentHelpMainTopic,
  fetchHelpTopicsByMainId as fetchStudentHelpTopicsByMainId,
  createHelpTopic as createStudentHelpTopic,
  updateHelpTopic as updateStudentHelpTopic,
  deleteHelpTopic as deleteStudentHelpTopic,
  reorderHelpMainTopic as reorderStudentHelpMainTopic,
  reorderHelpTopic as reorderStudentHelpTopic,
} from "@/api/admin/helpCenter";
import {
  createHelpMainTopic as createInstructorHelpMainTopic,
  deleteHelpMainTopic as deleteInstructorHelpMainTopic,
  fetchHelpMainTopics as fetchInstructorHelpMainTopics,
  updateHelpMainTopic as updateInstructorHelpMainTopic,
  fetchHelpTopicsByMainId as fetchInstructorHelpTopicsByMainId,
  createHelpTopic as createInstructorHelpTopic,
  updateHelpTopic as updateInstructorHelpTopic,
  deleteHelpTopic as deleteInstructorHelpTopic,
  reorderHelpMainTopic as reorderInstructorHelpMainTopic,
  reorderHelpTopic as reorderInstructorHelpTopic,
} from "@/api/admin/helpCenterInstructor";
import {
  PlusCircle,
  Pencil,
  Trash,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { HelpMainTopicDetailSidebar } from "./sidebars/HelpMainTopicDetailSidebar";
import { HelpTopicDetailSidebar } from "./sidebars/HelpTopicDetailSidebar";
import { useNavigate } from "react-router-dom";
import { Dialog as TopicDialog } from "@/components/ui/dialog";
import { TopicFormSidebar } from "./sidebars/TopicFormSidebar";

type UserType = "student" | "instructor";

export function AdminHelpCenter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<UserType>("student");
  const [mainTopics, setMainTopics] = useState<HelpMainTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<HelpMainTopic | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicOrder, setNewTopicOrder] = useState(1);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedMainTopic, setSelectedMainTopic] =
    useState<HelpMainTopic | null>(null);
  // Expanded state for each main topic
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // Topics state per main topic
  const [topicsMap, setTopicsMap] = useState<Record<string, HelpTopic[]>>({});
  const [topicsLoading, setTopicsLoading] = useState<Record<string, boolean>>(
    {}
  );

  const [topicSidebar, setTopicSidebar] = useState<{
    open: boolean;
    topic: HelpTopic | null;
  }>({ open: false, topic: null });
  const [topicDeleteDialog, setTopicDeleteDialog] = useState<{
    open: boolean;
    mainId: string;
    topic: HelpTopic | null;
  }>({ open: false, mainId: "", topic: null });
  const [topicFormSidebar, setTopicFormSidebar] = useState<{
    open: boolean;
    mode: "create" | "edit";
    mainId: string;
    topic?: HelpTopic;
  }>({ open: false, mode: "create", mainId: "" });

  // Drag and drop state
  const [draggedMainTopic, setDraggedMainTopic] =
    useState<HelpMainTopic | null>(null);
  const [draggedTopic, setDraggedTopic] = useState<HelpTopic | null>(null);

  useEffect(() => {
    loadMainTopics();
  }, [activeTab]);

  // API function getters based on active tab
  const getApiFunctions = () => {
    if (activeTab === "instructor") {
      return {
        fetchHelpMainTopics: fetchInstructorHelpMainTopics,
        createHelpMainTopic: createInstructorHelpMainTopic,
        updateHelpMainTopic: updateInstructorHelpMainTopic,
        deleteHelpMainTopic: deleteInstructorHelpMainTopic,
        fetchHelpTopicsByMainId: fetchInstructorHelpTopicsByMainId,
        createHelpTopic: createInstructorHelpTopic,
        updateHelpTopic: updateInstructorHelpTopic,
        deleteHelpTopic: deleteInstructorHelpTopic,
        reorderHelpMainTopic: reorderInstructorHelpMainTopic,
        reorderHelpTopic: reorderInstructorHelpTopic,
      };
    } else {
      return {
        fetchHelpMainTopics: fetchStudentHelpMainTopics,
        createHelpMainTopic: createStudentHelpMainTopic,
        updateHelpMainTopic: updateStudentHelpMainTopic,
        deleteHelpMainTopic: deleteStudentHelpMainTopic,
        fetchHelpTopicsByMainId: fetchStudentHelpTopicsByMainId,
        createHelpTopic: createStudentHelpTopic,
        updateHelpTopic: updateStudentHelpTopic,
        deleteHelpTopic: deleteStudentHelpTopic,
        reorderHelpMainTopic: reorderStudentHelpMainTopic,
        reorderHelpTopic: reorderStudentHelpTopic,
      };
    }
  };

  const loadMainTopics = async () => {
    try {
      setLoading(true);
      const { fetchHelpMainTopics } = getApiFunctions();
      const topics = await fetchHelpMainTopics();

      // Ensure topics is an array
      if (Array.isArray(topics)) {
        setMainTopics(topics);
      } else {
        console.warn("fetchHelpMainTopics returned non-array:", topics);
        setMainTopics([]);
      }

      // Reset expanded and topics map when switching tabs
      setExpanded({});
      setTopicsMap({});
    } catch (error) {
      console.error("Failed to load help main topics:", error);
      toast.error("Failed to load help categories");
      setMainTopics([]);
    } finally {
      setLoading(false);
    }
  };

  // Expand/collapse logic
  const toggleExpand = async (mainId: string) => {
    setExpanded((prev) => ({ ...prev, [mainId]: !prev[mainId] }));
    if (!expanded[mainId]) {
      // Only fetch if not already loaded
      if (!topicsMap[mainId]) {
        setTopicsLoading((prev) => ({ ...prev, [mainId]: true }));
        try {
          const { fetchHelpTopicsByMainId } = getApiFunctions();
          const topics = await fetchHelpTopicsByMainId(mainId);

          // Ensure topics is an array
          if (Array.isArray(topics)) {
            setTopicsMap((prev) => ({ ...prev, [mainId]: topics }));
          } else {
            console.warn("fetchHelpTopicsByMainId returned non-array:", topics);
            setTopicsMap((prev) => ({ ...prev, [mainId]: [] }));
          }
        } catch (error) {
          console.error("Failed to load topics:", error);
          toast.error("Failed to load topics");
          setTopicsMap((prev) => ({ ...prev, [mainId]: [] }));
        } finally {
          setTopicsLoading((prev) => ({ ...prev, [mainId]: false }));
        }
      }
    }
  };

  // Main topic CRUD (existing code)
  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const newOrder = mainTopics.length + 1;
      const { createHelpMainTopic } = getApiFunctions();
      const newTopic = await createHelpMainTopic({
        title: newTopicTitle,
        order: newOrder,
        type:
          activeTab === "instructor"
            ? "instructor_help_collection"
            : "student_help_collection",
      });

      setMainTopics([...mainTopics, newTopic]);
      setNewTopicTitle("");
      setNewTopicOrder(mainTopics.length + 2); // for next create
      setIsCreateDialogOpen(false);
      toast.success("Help category created successfully");
    } catch (error) {
      console.error("Failed to create help main topic:", error);
      toast.error("Failed to create help category");
    }
  };

  const handleUpdateTopic = async () => {
    if (!currentTopic || !newTopicTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const { updateHelpMainTopic } = getApiFunctions();
      const updatedTopic = await updateHelpMainTopic(currentTopic.id, {
        title: newTopicTitle,
        order: newTopicOrder,
      });

      setMainTopics(
        mainTopics.map((topic) =>
          topic.id === currentTopic.id ? updatedTopic : topic
        )
      );
      setIsEditDialogOpen(false);
      toast.success("Help category updated successfully");
    } catch (error) {
      console.error("Failed to update help main topic:", error);
      toast.error("Failed to update help category");
    }
  };

  const handleDeleteTopic = async () => {
    if (!currentTopic) return;

    try {
      const { deleteHelpMainTopic } = getApiFunctions();
      await deleteHelpMainTopic(currentTopic.id);
      setMainTopics(mainTopics.filter((topic) => topic.id !== currentTopic.id));
      setIsDeleteDialogOpen(false);
      toast.success("Help category deleted successfully");
    } catch (error) {
      console.error("Failed to delete help main topic:", error);
      toast.error("Failed to delete help category");
    }
  };

  const openEditDialog = (topic: HelpMainTopic) => {
    setCurrentTopic(topic);
    setNewTopicTitle(topic.title);
    setNewTopicOrder(topic.order);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (topic: HelpMainTopic) => {
    setCurrentTopic(topic);
    setIsDeleteDialogOpen(true);
  };

  const openDeleteTopicDialog = (mainId: string, topic: HelpTopic) => {
    setTopicDeleteDialog({ open: true, mainId, topic });
  };
  const closeDeleteTopicDialog = () => {
    setTopicDeleteDialog({ open: false, mainId: "", topic: null });
  };
  const handleDeleteHelpTopic = async () => {
    const { mainId, topic } = topicDeleteDialog;
    if (!topic) return;
    try {
      const { deleteHelpTopic } = getApiFunctions();
      await deleteHelpTopic(topic.id);
      setTopicsMap((prev) => ({
        ...prev,
        [mainId]: prev[mainId].filter((t) => t.id !== topic.id),
      }));

      // Update main topic count
      setMainTopics((prev) =>
        prev.map((mainTopic) =>
          mainTopic.id === mainId
            ? { ...mainTopic, topics_count: mainTopic.topics_count - 1 }
            : mainTopic
        )
      );

      toast.success("Help topic deleted successfully");
    } catch (error) {
      toast.error("Failed to delete help topic");
    } finally {
      closeDeleteTopicDialog();
    }
  };
  const openTopicSidebar = (topic: HelpTopic) => {
    setTopicSidebar({ open: true, topic });
  };
  const closeTopicSidebar = () => {
    setTopicSidebar({ open: false, topic: null });
  };

  // Drag and drop handlers
  const handleMainTopicDragStart = (
    e: React.DragEvent,
    topic: HelpMainTopic
  ) => {
    setDraggedMainTopic(topic);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleMainTopicDrop = async (
    e: React.DragEvent,
    targetTopic: HelpMainTopic
  ) => {
    e.preventDefault();
    if (!draggedMainTopic || draggedMainTopic.id === targetTopic.id) return;

    const draggedIndex = mainTopics.findIndex(
      (t) => t.id === draggedMainTopic.id
    );
    const targetIndex = mainTopics.findIndex((t) => t.id === targetTopic.id);

    const newTopics = [...mainTopics];
    newTopics.splice(draggedIndex, 1);
    newTopics.splice(targetIndex, 0, draggedMainTopic);

    // Update orders
    for (let i = 0; i < newTopics.length; i++) {
      newTopics[i] = { ...newTopics[i], order: i + 1 };
    }

    setMainTopics(newTopics);

    // Update in backend using reorder API
    try {
      const { reorderHelpMainTopic } = getApiFunctions();
      await reorderHelpMainTopic(draggedMainTopic.id, targetIndex);
      toast.success("Categories reordered successfully");
    } catch (error) {
      toast.error("Failed to update order");
      loadMainTopics(); // Reload on error
    }

    setDraggedMainTopic(null);
  };

  const handleTopicDragStart = (e: React.DragEvent, topic: HelpTopic) => {
    setDraggedTopic(topic);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTopicDrop = async (
    e: React.DragEvent,
    targetTopic: HelpTopic,
    mainId: string
  ) => {
    e.preventDefault();
    if (!draggedTopic || draggedTopic.id === targetTopic.id) return;

    const topics = topicsMap[mainId] || [];
    const draggedIndex = topics.findIndex((t) => t.id === draggedTopic.id);
    const targetIndex = topics.findIndex((t) => t.id === targetTopic.id);

    const newTopics = [...topics];
    newTopics.splice(draggedIndex, 1);
    newTopics.splice(targetIndex, 0, draggedTopic);

    // Update orders
    for (let i = 0; i < newTopics.length; i++) {
      newTopics[i] = { ...newTopics[i], order: i + 1 };
    }

    setTopicsMap((prev) => ({ ...prev, [mainId]: newTopics }));

    // Update in backend using reorder API
    try {
      const { reorderHelpTopic } = getApiFunctions();
      await reorderHelpTopic(draggedTopic.id, targetIndex);
      toast.success("Topics reordered successfully");
    } catch (error) {
      toast.error("Failed to update topic order");
    }

    setDraggedTopic(null);
  };

  // New function to handle saving from the sidebar
  const handleSaveTopicFromSidebar = async (
    mainId: string,
    topic: Partial<HelpTopic> & { title: string; content: ContentBlock[] }
  ) => {
    if (!topic.title.trim()) {
      toast.error("Title is required");
      return;
    }
    try {
      const { createHelpTopic, updateHelpTopic } = getApiFunctions();
      if (topic.id) {
        // Editing
        const updatedTopic = await updateHelpTopic(topic.id, {
          title: topic.title,
          content: topic.content,
        });
        setTopicsMap((prev) => ({
          ...prev,
          [mainId]: prev[mainId].map((t) =>
            t.id === topic.id ? updatedTopic : t
          ),
        }));
        toast.success("Help topic updated successfully");
      } else {
        // Creating
        const newOrder = (topicsMap[mainId]?.length || 0) + 1;
        const newTopic = await createHelpTopic({
          collection_id: mainId,
          title: topic.title,
          content: topic.content,
          order: newOrder,
        });
        setTopicsMap((prev) => ({
          ...prev,
          [mainId]: [...(prev[mainId] || []), newTopic],
        }));

        // Update main topic count
        setMainTopics((prev) =>
          prev.map((mainTopic) =>
            mainTopic.id === mainId
              ? { ...mainTopic, topics_count: mainTopic.topics_count + 1 }
              : mainTopic
          )
        );

        toast.success("Help topic created successfully");
      }
      setTopicFormSidebar({ open: false, mode: "create", mainId: "" });
    } catch (error) {
      toast.error("Failed to save help topic");
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as UserType);
    // Close any open sidebars when switching tabs
    setSidebarVisible(false);
    setTopicSidebar({ open: false, topic: null });
    setTopicFormSidebar({ open: false, mode: "create", mainId: "" });
  };

  const renderHelpCenterContent = () => (
    <>
      <div className="flex justify-between items-center">
        <div></div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="space-x-2">
              <PlusCircle className="h-4 w-4" />
              <span>New Category</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Help Category</DialogTitle>
              <DialogDescription>
                Add a new category to your help center.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Getting Started"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                />
              </div>
              {/* Order is auto-set, so no order input here */}
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
                <TableHead className="text-xs font-medium text-muted-foreground text-left w-[60%]">
                  Title
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground text-center w-[15%]">
                  Topics
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground text-center w-[25%]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mainTopics.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-xs text-muted-foreground"
                  >
                    No categories found. Create your first help category to get
                    started.
                  </TableCell>
                </TableRow>
              ) : (
                mainTopics.map((topic) => (
                  <>
                    <TableRow
                      key={topic.id}
                      className="hover:bg-muted/50 cursor-move"
                      draggable
                      onDragStart={(e) => handleMainTopicDragStart(e, topic)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleMainTopicDrop(e, topic)}
                    >
                      <TableCell className="text-xs font-medium align-middle text-left">
                        {topic.title}
                      </TableCell>
                      <TableCell className="text-xs align-middle text-center">
                        {topic.topics_count}
                      </TableCell>
                      <TableCell className="align-middle text-center">
                        <div className="flex gap-1 items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedMainTopic(topic);
                              setSidebarVisible(true);
                            }}
                            title="View Details"
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(
                                `/admin/help-center/collections/${topic.id}/topics/new?tab=${activeTab}`
                              )
                            }
                            title="Add New Topic"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleExpand(topic.id)}
                            title={expanded[topic.id] ? "Collapse" : "Expand"}
                          >
                            {expanded[topic.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expanded[topic.id] && (
                      <TableRow key={`${topic.id}-topics`}>
                        <TableCell colSpan={4} className="p-0">
                          <div className="px-2">
                            {topicsLoading[topic.id] ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin h-6 w-6 rounded-full"></div>
                              </div>
                            ) : topicsMap[topic.id]?.length > 0 ? (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs font-medium text-muted-foreground text-left w-[60%]">
                                      Title
                                    </TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground text-center w-[15%]"></TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground text-center w-[25%]">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {topicsMap[topic.id].map((helpTopic) => (
                                    <TableRow
                                      key={helpTopic.id}
                                      className="hover:bg-muted/50 cursor-move"
                                      draggable
                                      onDragStart={(e) =>
                                        handleTopicDragStart(e, helpTopic)
                                      }
                                      onDragOver={handleDragOver}
                                      onDrop={(e) =>
                                        handleTopicDrop(e, helpTopic, topic.id)
                                      }
                                    >
                                      <TableCell className="text-xs font-medium align-middle text-left">
                                        {helpTopic.title}
                                      </TableCell>
                                      <TableCell className="text-xs align-middle text-center"></TableCell>
                                      <TableCell className="align-middle text-center">
                                        <div className="flex gap-1 items-center justify-center">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              openTopicSidebar(helpTopic)
                                            }
                                            title="View Details"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              navigate(
                                                `/admin/help-center/topics/${helpTopic.id}/edit?tab=${activeTab}`
                                              );
                                            }}
                                            title="Edit"
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              openDeleteTopicDialog(
                                                topic.id,
                                                helpTopic
                                              )
                                            }
                                            title="Delete"
                                          >
                                            <Trash className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="text-center py-6 text-xs text-muted-foreground">
                                No topics found. Create your first topic to get
                                started.
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student">Student Help Center</TabsTrigger>
          <TabsTrigger value="instructor">Instructor Help Center</TabsTrigger>
        </TabsList>

        <TabsContent value="student" className="space-y-4">
          {renderHelpCenterContent()}
        </TabsContent>

        <TabsContent value="instructor" className="space-y-4">
          {renderHelpCenterContent()}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Help Category</DialogTitle>
            <DialogDescription>
              Update the details of this help category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Category title"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-order">Display Order</Label>
              <Input
                id="edit-order"
                type="number"
                min="1"
                value={newTopicOrder}
                onChange={(e) => setNewTopicOrder(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateTopic}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Help Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this help category? This action
              cannot be undone and will delete all associated topics.
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

      <HelpMainTopicDetailSidebar
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        mainTopic={selectedMainTopic}
      />

      {/* Topic Delete Confirmation Dialog */}
      <TopicDialog
        open={topicDeleteDialog.open}
        onOpenChange={closeDeleteTopicDialog}
      >
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
            <Button variant="destructive" onClick={handleDeleteHelpTopic}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </TopicDialog>

      {/* Topic Form Sidebar */}
      <TopicFormSidebar
        isVisible={topicFormSidebar.open}
        mode={topicFormSidebar.mode}
        mainId={topicFormSidebar.mainId}
        topic={topicFormSidebar.topic}
        activeTab={activeTab}
        onClose={() =>
          setTopicFormSidebar({ open: false, mode: "create", mainId: "" })
        }
        onSave={handleSaveTopicFromSidebar}
      />

      <HelpTopicDetailSidebar
        isVisible={topicSidebar.open}
        onClose={closeTopicSidebar}
        topic={topicSidebar.topic}
      />
    </div>
  );
}
