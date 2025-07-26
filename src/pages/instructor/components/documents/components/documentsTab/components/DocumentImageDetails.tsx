import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getImageDocument,
  getTopicKnowledgeItems,
  deleteTopicKnowledge,
} from "@/api/documents";
import type { ImageDocument, TopicKnowledgeItem } from "@/api/documents";
import { Small } from "@/components/ui/typography";
import { toast } from "sonner";
import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";

import {
  MediaItemsTable,
  AddMediaItemSidebar,
  DeleteConfirmDialog,
  ViewEditMediaItemSidebar,
} from "../../media";
import {
  AddKnowledgeChunkSidebar,
  TopicKnowledgeItemsTable,
  ViewEditKnowledgeChunkSidebar,
} from "../../knowledgeNotes";

interface DocumentImageDetailsProps {
  documentId: string;
  setShowDetails: (show: boolean) => void;
}

export default function DocumentImageDetails({
  documentId,
  setShowDetails,
}: DocumentImageDetailsProps) {
  // Images state
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [images, setImages] = useState<ImageDocument[]>([]);
  const [currentImagePage, setCurrentImagePage] = useState(1);
  const [imagePageSize] = useState(10);
  const [totalImages, setTotalImages] = useState(0);
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [loadingImageIds] = useState<string[]>([]);
  const [showViewEditImageSidebar, setShowViewEditImageSidebar] =
    useState(false);
  const [showAddImageSidebar, setShowAddImageSidebar] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageDocument | null>(
    null
  );
  const [imageSidebarMode, setImageSidebarMode] = useState<"view" | "edit">(
    "view"
  );
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageDocument | null>(
    null
  );
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  // Notes state
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [notes, setNotes] = useState<TopicKnowledgeItem[]>([]);
  const [currentNotePage, setCurrentNotePage] = useState(1);
  const [notePageSize] = useState(10);
  const [totalNotes, setTotalNotes] = useState(0);
  const [noteSearchQuery, setNoteSearchQuery] = useState("");
  const [loadingNoteIds] = useState<string[]>([]);
  const [showViewEditNoteSidebar, setShowViewEditNoteSidebar] = useState(false);
  const [showAddNoteSidebar, setShowAddNoteSidebar] = useState(false);
  const [selectedNote, setSelectedNote] = useState<TopicKnowledgeItem | null>(
    null
  );
  const [noteSidebarMode, setNoteSidebarMode] = useState<"view" | "edit">(
    "view"
  );
  const [showDeleteNoteDialog, setShowDeleteNoteDialog] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<TopicKnowledgeItem | null>(
    null
  );
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  // Fetch images when page, search, or documentId changes
  useEffect(() => {
    const fetchImages = async () => {
      if (!documentId) return;

      setIsLoadingImages(true);
      try {
        const response = await getImageDocument(documentId, {
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
      } catch (err) {
        console.error("Error fetching document images:", err);
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImages();
  }, [documentId, currentImagePage, imagePageSize, imageSearchQuery]);

  // Fetch notes when page, search, or documentId changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!documentId) return;

      setIsLoadingNotes(true);
      try {
        const response = await getTopicKnowledgeItems(documentId, {
          page_number: currentNotePage,
          page_size: notePageSize,
          search: noteSearchQuery || "",
          sort_by: "chunk_index",
          sort_order: 1,
        });

        if (response.success) {
          setNotes(response.items);
          setTotalNotes(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching document notes:", error);
        toast.error("Failed to fetch document notes");
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  }, [documentId, currentNotePage, notePageSize, noteSearchQuery]);

  // Image handlers
  const handleImageSidebarSuccess = () => {
    // Refresh the images list
    const fetchImages = async () => {
      if (!documentId) return;

      setIsLoadingImages(true);
      try {
        const response = await getImageDocument(documentId, {
          page_number: currentImagePage,
          page_size: imagePageSize,
          search: imageSearchQuery || "",
          sort_by: "chunk_index",
          sort_order: 1,
        });

        if (response.success) {
          setImages(response.documents);
          setTotalImages(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching document images:", error);
        toast.error("Failed to fetch document images");
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImages();
  };

  const handleViewImage = async (chunkIndex: string) => {
    try {
      const image = images.find((img) => img.chunk_index === chunkIndex);
      if (image) {
        setSelectedImage(image);
        setImageSidebarMode("view");
        setShowViewEditImageSidebar(true);
      }
    } catch (error) {
      console.error("Error viewing image:", error);
      toast.error("Failed to view image");
    }
  };

  const handleEditImage = async (chunkIndex: string) => {
    try {
      const image = images.find((img) => img.chunk_index === chunkIndex);
      if (image) {
        setSelectedImage(image);
        setImageSidebarMode("edit");
        setShowViewEditImageSidebar(true);
      }
    } catch (error) {
      console.error("Error editing image:", error);
      toast.error("Failed to edit image");
    }
  };

  const handleDeleteImage = async (chunkIndex: string) => {
    const image = images.find((img) => img.chunk_index === chunkIndex);
    if (image) {
      setImageToDelete(image);
      setShowDeleteImageDialog(true);
    }
  };

  const handleConfirmDeleteImage = async () => {
    if (!imageToDelete) return;

    setIsDeletingImage(true);
    try {
      const response = await deleteTopicKnowledge(imageToDelete.chunk_index);

      if (response.success) {
        // Remove from local state
        setImages(
          images.filter((img) => img.chunk_index !== imageToDelete.chunk_index)
        );
        toast.success(response.message || "Image deleted successfully");
        setShowDeleteImageDialog(false);
        setImageToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleCloseDeleteImageDialog = () => {
    if (!isDeletingImage) {
      setShowDeleteImageDialog(false);
      setImageToDelete(null);
    }
  };

  const handleAddImage = () => {
    setShowAddImageSidebar(true);
  };

  // Note handlers
  const handleNoteSidebarSuccess = () => {
    // Refresh the notes list
    const fetchNotes = async () => {
      if (!documentId) return;

      setIsLoadingNotes(true);
      try {
        const response = await getTopicKnowledgeItems(documentId, {
          page_number: currentNotePage,
          page_size: notePageSize,
          search: noteSearchQuery || "",
          sort_by: "chunk_index",
          sort_order: 1,
        });

        if (response.success) {
          setNotes(response.items);
          setTotalNotes(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching document notes:", error);
        toast.error("Failed to fetch document notes");
      } finally {
        setIsLoadingNotes(false);
      }
    };

    fetchNotes();
  };

  const handleViewNote = async (chunkIndex: string) => {
    try {
      const note = notes.find((note) => note.chunk_index === chunkIndex);
      if (note) {
        setSelectedNote(note);
        setNoteSidebarMode("view");
        setShowViewEditNoteSidebar(true);
      }
    } catch (error) {
      console.error("Error viewing note:", error);
      toast.error("Failed to view note");
    }
  };

  const handleEditNote = async (chunkIndex: string) => {
    try {
      const note = notes.find((note) => note.chunk_index === chunkIndex);
      if (note) {
        setSelectedNote(note);
        setNoteSidebarMode("edit");
        setShowViewEditNoteSidebar(true);
      }
    } catch (error) {
      console.error("Error editing note:", error);
      toast.error("Failed to edit note");
    }
  };

  const handleDeleteNote = async (chunkIndex: string) => {
    const note = notes.find((note) => note.chunk_index === chunkIndex);
    if (note) {
      setNoteToDelete(note);
      setShowDeleteNoteDialog(true);
    }
  };

  const handleConfirmDeleteNote = async () => {
    if (!noteToDelete) return;

    setIsDeletingNote(true);
    try {
      const response = await deleteTopicKnowledge(noteToDelete.chunk_index);

      if (response.success) {
        // Remove from local state
        setNotes(
          notes.filter((note) => note.chunk_index !== noteToDelete.chunk_index)
        );
        toast.success(response.message || "Note deleted successfully");
        setShowDeleteNoteDialog(false);
        setNoteToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleCloseDeleteNoteDialog = () => {
    if (!isDeletingNote) {
      setShowDeleteNoteDialog(false);
      setNoteToDelete(null);
    }
  };

  const handleAddNote = () => {
    setShowAddNoteSidebar(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(false)}
            className="flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        {/* Notes Section */}
        <div className="my-8">
          <div className="mb-3 flex items-center justify-between">
            <Small className="font-semibold">Notes</Small>
            <Button
              onClick={handleAddNote}
              className="px-3 py-1.5 text-xs"
              size="sm"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Note
            </Button>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search notes..."
              value={noteSearchQuery}
              onChange={(e) => setNoteSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  <h3 className="mt-2 text-xs font-medium">No notes found</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No notes available for this document
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
        {/* Images Section */}
        <div className="my-3">
          <div className="mb-3 flex items-center justify-between">
            <Small className="font-semibold">Images</Small>
            <Button
              onClick={handleAddImage}
              className="px-3 py-1.5 text-xs"
              size="sm"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Image
            </Button>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search images..."
              value={imageSearchQuery}
              onChange={(e) => setImageSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  <h3 className="mt-2 text-xs font-medium">No images found</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No images available for this document
                  </p>
                </div>
              ) : (
                <div className="w-full max-w-full overflow-hidden">
                  <div className="w-full max-w-full overflow-x-auto">
                    <MediaItemsTable
                      items={images}
                      onView={handleViewImage}
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

      {/* Image Sidebars and Dialogs */}
      <ViewEditMediaItemSidebar
        isVisible={showViewEditImageSidebar}
        item={selectedImage}
        mode={imageSidebarMode}
        onClose={() => {
          setShowViewEditImageSidebar(false);
          setSelectedImage(null);
        }}
        onSuccess={handleImageSidebarSuccess}
      />

      <AddMediaItemSidebar
        isVisible={showAddImageSidebar}
        mediaCollectionId={documentId}
        onClose={() => setShowAddImageSidebar(false)}
        onSuccess={handleImageSidebarSuccess}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteImageDialog}
        isDeleting={isDeletingImage}
        itemTitle={imageToDelete?.title || ""}
        onClose={handleCloseDeleteImageDialog}
        onConfirm={handleConfirmDeleteImage}
      />

      {/* Note Sidebars and Dialogs */}
      <ViewEditKnowledgeChunkSidebar
        isVisible={showViewEditNoteSidebar}
        item={selectedNote}
        topicKnowledgeId={documentId}
        mode={noteSidebarMode}
        onClose={() => {
          setShowViewEditNoteSidebar(false);
          setSelectedNote(null);
        }}
        onSuccess={handleNoteSidebarSuccess}
      />

      <AddKnowledgeChunkSidebar
        isVisible={showAddNoteSidebar}
        topicKnowledgeId={documentId}
        onClose={() => setShowAddNoteSidebar(false)}
        onSuccess={handleNoteSidebarSuccess}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteNoteDialog}
        isDeleting={isDeletingNote}
        itemTitle={noteToDelete?.title || ""}
        onClose={handleCloseDeleteNoteDialog}
        onConfirm={handleConfirmDeleteNote}
      />
    </div>
  );
}
