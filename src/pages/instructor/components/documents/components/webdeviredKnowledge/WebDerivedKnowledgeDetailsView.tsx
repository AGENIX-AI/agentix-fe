import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getImageDocument,
  getTopicKnowledgeItems,
  createTopicKnowledgeManual,
  createTopicKnowledgeFramework,
  createImageIndex,
} from "@/api/documents";
import type {
  ImageDocument,
  TopicKnowledgeItem,
  Document,
  Framework,
} from "@/api/documents";
import { Small } from "@/components/ui/typography";
import { toast } from "sonner";
import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";

import { MediaItemsTable, AddMediaItemSidebar } from "../media";
import {
  TopicKnowledgeItemsTable,
  AddKnowledgeChunkSidebar,
} from "../knowledgeNotes";

interface WebDerivedKnowledgeDetailsViewProps {
  document: Document;
  onBack: () => void;
}

export default function WebDerivedKnowledgeDetailsView({
  document,
  onBack,
}: WebDerivedKnowledgeDetailsViewProps) {
  const { t } = useTranslation();

  // Images state
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [images, setImages] = useState<ImageDocument[]>([]);
  const [currentImagePage, setCurrentImagePage] = useState(1);
  const [imagePageSize] = useState(10);
  const [totalImages, setTotalImages] = useState(0);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [showAddMediaSidebar, setShowAddMediaSidebar] = useState(false);

  // Notes state
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [notes, setNotes] = useState<TopicKnowledgeItem[]>([]);
  const [currentNotePage, setCurrentNotePage] = useState(1);
  const [notePageSize] = useState(10);
  const [totalNotes, setTotalNotes] = useState(0);
  const [noteSearchQuery, setNoteSearchQuery] = useState("");

  const [showAddNoteSidebar, setShowAddNoteSidebar] = useState(false);

  // Custom callbacks for AddKnowledgeChunkSidebar
  const onCreateManualNote = async (data: {
    title: string;
    content: string;
    ai_parse?: boolean;
  }) => {
    try {
      const response = await createTopicKnowledgeManual({
        document_id: document.id,
        title: data.title,
        content: data.content,
        ai_parse: data.ai_parse,
      });

      if (response.success) {
        // Add the new note to the list
        const newNote = response.output.output;
        setNotes((prevNotes) => [newNote, ...prevNotes]);
        setTotalNotes((prev) => prev + 1);
        toast.success(t("webDerivedKnowledge.note_created_successfully"));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error(t("webDerivedKnowledge.failed_to_create_note"));
      return false;
    }
  };

  const onCreateFrameworkNotes = async (framework: Framework) => {
    try {
      const response = await createTopicKnowledgeFramework({
        document_id: document.id,
        framework,
      });

      if (response.success) {
        // Add the new notes to the list
        const newNotes = response.output;
        setNotes((prevNotes) => [...newNotes, ...prevNotes]);
        setTotalNotes((prev) => prev + newNotes.length);
        toast.success(
          t("webDerivedKnowledge.framework_notes_created_successfully")
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating framework notes:", error);
      toast.error(t("webDerivedKnowledge.failed_to_create_framework_notes"));
      return false;
    }
  };

  // Custom callback for AddMediaItemSidebar
  const onCreateMediaItem = async (data: {
    title: string;
    description: string;
    url: string;
  }) => {
    try {
      const response = await createImageIndex(
        document.id,
        data.description,
        data.title,
        data.url
      );

      if (response.success) {
        // Create a new media item and add it to the list
        const newMediaItem: ImageDocument = {
          chunk_index: response.chunk_index,
          title: data.title,
          summary: data.description,
          content: data.description,
          url: data.url,
          keywords: [],
          type: "image",
        };
        setImages((prevImages) => [newMediaItem, ...prevImages]);
        setTotalImages((prev) => prev + 1);
        toast.success(t("webDerivedKnowledge.media_item_added_successfully"));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating media item:", error);
      toast.error(t("webDerivedKnowledge.failed_to_create_media_item"));
      return false;
    }
  };

  // Fetch images
  useEffect(() => {
    const fetchImages = async () => {
      if (!document.id) return;

      setIsLoadingImages(true);
      try {
        const response = await getImageDocument(document.id, {
          page_number: currentImagePage,
          page_size: imagePageSize,
          search: imageSearchQuery,
          sort_by: "chunk_index",
          sort_order: 1,
        });

        if (response.success) {
          setImages(response.documents);
          setTotalImages(response.total_items);
        } else {
          throw new Error("Failed to fetch document images");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error(t("webDerivedKnowledge.failed_to_fetch_images"));
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImages();
  }, [document.id, currentImagePage, imagePageSize, imageSearchQuery]);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!document.id) return;

      setIsLoadingNotes(true);
      try {
        const response = await getTopicKnowledgeItems(document.id, {
          page_number: currentNotePage,
          page_size: notePageSize,
          search: noteSearchQuery,
          sort_by: "chunk_index",
          sort_order: 1,
        });

        if (response.success) {
          setNotes(response.items);
          setTotalNotes(response.total_items);
        } else {
          throw new Error("Failed to fetch topic knowledge items");
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast.error(t("webDerivedKnowledge.failed_to_fetch_notes"));
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [document.id, currentNotePage, notePageSize, noteSearchQuery]);

  const handleViewNote = (noteId: string) => {
    toast.info(
      `${t(
        "webDerivedKnowledge.view_functionality_to_be_implemented"
      )} ${noteId}`
    );
  };

  const handleEditNote = (noteId: string) => {
    toast.info(
      `${t(
        "webDerivedKnowledge.edit_functionality_to_be_implemented"
      )} ${noteId}`
    );
  };

  const handleDeleteNote = async (noteId: string) => {
    toast.info(
      `${t(
        "webDerivedKnowledge.delete_functionality_to_be_implemented"
      )} ${noteId}`
    );
  };

  const handleEditImage = (imageId: string) => {
    toast.info(
      `${t(
        "webDerivedKnowledge.edit_functionality_to_be_implemented"
      )} ${imageId}`
    );
  };

  const handleDeleteImage = async (imageId: string) => {
    toast.info(
      `${t(
        "webDerivedKnowledge.delete_functionality_to_be_implemented"
      )} ${imageId}`
    );
  };

  const decodeUrlForDisplay = (url: string): string => {
    try {
      return decodeURIComponent(url);
    } catch (error) {
      return url;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs">{t("webDerivedKnowledge.back")}</span>
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{document.title}</h1>
            <p className="text-xs text-muted-foreground">
              {decodeUrlForDisplay(document.url || "")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8">
        {/* Knowledge Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Small className="font-semibold">
              {t("webDerivedKnowledge.knowledge_notes")}
            </Small>
            <Button
              onClick={() => setShowAddNoteSidebar(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              {t("webDerivedKnowledge.add_note")}
            </Button>
          </div>

          {/* Search bar for notes */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={t("webDerivedKnowledge.search_notes")}
              value={noteSearchQuery}
              onChange={(e) => setNoteSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {isLoadingNotes ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {notes.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <h3 className="mt-2 text-xs font-medium">
                    {t("webDerivedKnowledge.no_knowledge_notes_found")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("webDerivedKnowledge.no_knowledge_notes_available")}
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-full overflow-hidden">
                  <div className="w-full max-w-full overflow-x-auto">
                    <TopicKnowledgeItemsTable
                      items={notes}
                      onView={handleViewNote}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      loadingItemIds={[]}
                    />
                  </div>

                  <div className="mt-4">
                    <Pagination
                      currentPage={currentNotePage}
                      totalItems={totalNotes}
                      pageSize={notePageSize}
                      documentsCount={notes.length}
                      setCurrentPage={setCurrentNotePage}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Media Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Small className="font-semibold">
              {t("webDerivedKnowledge.media_items")}
            </Small>
            <Button
              onClick={() => setShowAddMediaSidebar(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              {t("webDerivedKnowledge.add_media")}
            </Button>
          </div>

          {/* Search bar for images */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={t("webDerivedKnowledge.search_media")}
              value={imageSearchQuery}
              onChange={(e) => setImageSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {isLoadingImages ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {images.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <h3 className="mt-2 text-xs font-medium">
                    {t("webDerivedKnowledge.no_media_items_found")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("webDerivedKnowledge.no_media_items_available")}
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-full overflow-hidden">
                  <div className="w-full max-w-full overflow-x-auto">
                    <MediaItemsTable
                      items={images}
                      onEdit={handleEditImage}
                      onDelete={handleDeleteImage}
                      loadingItemIds={[]}
                    />
                  </div>

                  <div className="mt-4">
                    <Pagination
                      currentPage={currentImagePage}
                      totalItems={totalImages}
                      pageSize={imagePageSize}
                      documentsCount={images.length}
                      setCurrentPage={setCurrentImagePage}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Knowledge Note Sidebar */}
      <AddKnowledgeChunkSidebar
        isVisible={showAddNoteSidebar}
        topicKnowledgeId={document.id}
        onClose={() => setShowAddNoteSidebar(false)}
        onSuccess={() => setShowAddNoteSidebar(false)}
        onCreateManualNote={onCreateManualNote}
        onCreateFrameworkNotes={onCreateFrameworkNotes}
      />

      {/* Add Media Item Sidebar */}
      <AddMediaItemSidebar
        isVisible={showAddMediaSidebar}
        mediaCollectionId={document.id}
        onClose={() => setShowAddMediaSidebar(false)}
        onSuccess={() => setShowAddMediaSidebar(false)}
        onCreateMediaItem={onCreateMediaItem}
      />
    </div>
  );
}
