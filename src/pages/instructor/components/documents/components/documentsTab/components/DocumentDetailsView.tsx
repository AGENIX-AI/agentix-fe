import { useState, useEffect } from "react";
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

import { MediaItemsTable, AddMediaItemSidebar } from "../../media";
import {
  TopicKnowledgeItemsTable,
  AddKnowledgeChunkSidebar,
} from "../../knowledgeNotes";

interface DocumentDetailsViewProps {
  document: Document;
  onBack: () => void;
}

export default function DocumentDetailsView({
  document,
  onBack,
}: DocumentDetailsViewProps) {
  // Images state
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [images, setImages] = useState<ImageDocument[]>([]);
  const [currentImagePage, setCurrentImagePage] = useState(1);
  const [imagePageSize] = useState(10);
  const [totalImages, setTotalImages] = useState(0);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [loadingImageIds, setLoadingImageIds] = useState<string[]>([]);
  const [showAddMediaSidebar, setShowAddMediaSidebar] = useState(false);

  // Notes state
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [notes, setNotes] = useState<TopicKnowledgeItem[]>([]);
  const [currentNotePage, setCurrentNotePage] = useState(1);
  const [notePageSize] = useState(10);
  const [totalNotes, setTotalNotes] = useState(0);
  const [noteSearchQuery, setNoteSearchQuery] = useState("");
  const [loadingNoteIds, setLoadingNoteIds] = useState<string[]>([]);
  const [showAddNoteSidebar, setShowAddNoteSidebar] = useState(false);

  // Custom callbacks for AddKnowledgeChunkSidebar
  const onCreateManualNote = async (data: {
    title: string;
    content: string;
    ai_parse?: boolean;
  }) => {
    try {
      const response = await createTopicKnowledgeManual({
        page_id: document.id,
        title: data.title,
        content: data.content,
        ai_parse: data.ai_parse,
      });

      if (response.success) {
        // Add the new note to the list
        const newNote = response.output.output;
        setNotes((prevNotes) => [newNote, ...prevNotes]);
        setTotalNotes((prev) => prev + 1);
        toast.success("Note created successfully!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
      return false;
    }
  };

  const onCreateFrameworkNotes = async (framework: Framework) => {
    try {
      const response = await createTopicKnowledgeFramework({
        page_id: document.id,
        framework,
      });

      if (response.success) {
        // Add the new notes to the list
        const newNotes = response.output;
        setNotes((prevNotes) => [...newNotes, ...prevNotes]);
        setTotalNotes((prev) => prev + newNotes.length);
        toast.success(`${newNotes.length} notes created successfully!`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating framework notes:", error);
      toast.error("Failed to create framework notes");
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
        toast.success("Media item added successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating media item:", error);
      toast.error("Failed to create media item");
      return false;
    }
  };

  // Fetch images when page, search, or documentId changes
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
        console.error("Error fetching document images:", error);
        toast.error("Failed to fetch document images");
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImages();
  }, [document.id, currentImagePage, imagePageSize, imageSearchQuery]);

  // Fetch notes when page, search, or documentId changes
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
        console.error("Error fetching topic knowledge items:", error);
        toast.error("Failed to fetch topic knowledge items");
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [document.id, currentNotePage, notePageSize, noteSearchQuery]);

  const handleEditNote = (chunkIndex: string) => {
    setLoadingNoteIds((prev) => [...prev, chunkIndex]);
    toast.info(`Edit note functionality to be implemented for ${chunkIndex}`);
    // After operation completes (success or failure), remove from loading state
    setTimeout(() => {
      setLoadingNoteIds((prev) => prev.filter((id) => id !== chunkIndex));
    }, 1000);
  };

  const handleDeleteNote = (chunkIndex: string) => {
    setLoadingNoteIds((prev) => [...prev, chunkIndex]);
    toast.info(`Delete note functionality to be implemented for ${chunkIndex}`);
    // After operation completes (success or failure), remove from loading state
    setTimeout(() => {
      setLoadingNoteIds((prev) => prev.filter((id) => id !== chunkIndex));
    }, 1000);
  };

  const handleViewNote = (chunkIndex: string) => {
    setLoadingNoteIds((prev) => [...prev, chunkIndex]);
    toast.info(`View note functionality to be implemented for ${chunkIndex}`);
    // After operation completes (success or failure), remove from loading state
    setTimeout(() => {
      setLoadingNoteIds((prev) => prev.filter((id) => id !== chunkIndex));
    }, 1000);
  };

  const handleEditImage = (chunkIndex: string) => {
    setLoadingImageIds((prev) => [...prev, chunkIndex]);
    toast.info(`Edit image functionality to be implemented for ${chunkIndex}`);
    // After operation completes (success or failure), remove from loading state
    setTimeout(() => {
      setLoadingImageIds((prev) => prev.filter((id) => id !== chunkIndex));
    }, 1000);
  };

  const handleDeleteImage = (chunkIndex: string) => {
    setLoadingImageIds((prev) => [...prev, chunkIndex]);
    toast.info(
      `Delete image functionality to be implemented for ${chunkIndex}`
    );
    // After operation completes (success or failure), remove from loading state
    setTimeout(() => {
      setLoadingImageIds((prev) => prev.filter((id) => id !== chunkIndex));
    }, 1000);
  };

  const handleAddNote = () => {
    setShowAddNoteSidebar(true);
  };

  const handleAddMedia = () => {
    setShowAddMediaSidebar(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{document.title}</h2>
        </div>
      </div>

      <div className="space-y-8">
        {/* Topic Knowledge Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Small className="font-semibold">Knowledge Notes</Small>
            <Button
              onClick={handleAddNote}
              className="px-3 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Note
            </Button>
          </div>

          {/* Simple search bar for notes */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search knowledge notes..."
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
                    No knowledge notes found
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No knowledge notes available for this document
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
                      loadingItemIds={loadingNoteIds}
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
        <div>
          <div className="flex items-center justify-between mb-3">
            <Small className="font-semibold">Media Items</Small>
            <Button
              onClick={handleAddMedia}
              className="px-3 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Media
            </Button>
          </div>

          {/* Simple search bar for images */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search media items..."
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
                    No media items found
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No media items available for this document
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-full overflow-hidden">
                  <div className="w-full max-w-full overflow-x-auto">
                    <MediaItemsTable
                      items={images}
                      onEdit={handleEditImage}
                      onDelete={handleDeleteImage}
                      loadingItemIds={loadingImageIds}
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

      {/* Add Note Sidebar */}
      <AddKnowledgeChunkSidebar
        isVisible={showAddNoteSidebar}
        topicKnowledgeId={document.id}
        onClose={() => setShowAddNoteSidebar(false)}
        onSuccess={() => setShowAddNoteSidebar(false)}
        onCreateManualNote={onCreateManualNote}
        onCreateFrameworkNotes={onCreateFrameworkNotes}
      />

      {/* Add Media Sidebar */}
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
