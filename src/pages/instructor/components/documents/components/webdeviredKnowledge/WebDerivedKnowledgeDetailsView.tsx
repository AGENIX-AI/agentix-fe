import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getImageDocument,
  getOwnDocuments,
  createImageIndex,
  getCollectionChildrenDocuments,
} from "@/api/documents";
import type { ImageDocument, Document } from "@/api/documents";
import { Small } from "@/components/ui/typography";
import { toast } from "sonner";
import { Pagination } from "@/pages/instructor/components/modifyDocument/shared/Pagination";

import { MediaItemsTable, AddMediaItemSidebar } from "../media";
import { DocumentTable } from "../documentsTab/ownDocuments/DocumentTable";

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

  // Notes state - these are note collections (Document objects)
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [notes, setNotes] = useState<Document[]>([]);
  const [currentNotePage, setCurrentNotePage] = useState(1);
  const [notePageSize] = useState(10);
  const [totalNotes, setTotalNotes] = useState(0);
  const [noteSearchQuery, setNoteSearchQuery] = useState("");

  // Child notes state for note collections
  const [showChildNotes, setShowChildNotes] = useState(false);
  const [selectedNoteCollection, setSelectedNoteCollection] =
    useState<Document | null>(null);
  const [childNotes, setChildNotes] = useState<Document[]>([]);
  const [isLoadingChildNotes, setIsLoadingChildNotes] = useState(false);
  const [currentChildNotePage, setCurrentChildNotePage] = useState(1);
  const [childNotePageSize] = useState(10);
  const [totalChildNotes, setTotalChildNotes] = useState(0);
  const [childNoteSearchQuery, setChildNoteSearchQuery] = useState("");

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

  // Fetch notes (note collections)
  useEffect(() => {
    const fetchNotes = async () => {
      if (!document.id) return;

      setIsLoadingNotes(true);
      try {
        const response = await getOwnDocuments({
          page_number: currentNotePage,
          page_size: notePageSize,
          search: noteSearchQuery,
          type: "topic_knowledge",
          sort_by: "created_at",
          sort_order: 1,
        });

        if (response.success) {
          setNotes(response.documents);
          setTotalNotes(response.total_items);
        } else {
          throw new Error("Failed to fetch note collections");
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

  // Fetch child notes when search changes
  useEffect(() => {
    if (showChildNotes && selectedNoteCollection) {
      fetchChildNotes(selectedNoteCollection.id, 1, childNoteSearchQuery);
    }
  }, [childNoteSearchQuery]);

  // Fetch child notes when page changes
  useEffect(() => {
    if (showChildNotes && selectedNoteCollection) {
      fetchChildNotes(
        selectedNoteCollection.id,
        currentChildNotePage,
        childNoteSearchQuery
      );
    }
  }, [currentChildNotePage]);

  const handleViewNote = async (noteId: string) => {
    try {
      // Find the note collection
      const noteCollection = notes.find((note) => note.id === noteId);
      if (!noteCollection) {
        toast.error("Note collection not found");
        return;
      }

      // Set the selected note collection and show child notes view
      setSelectedNoteCollection(noteCollection);
      setShowChildNotes(true);

      // Fetch child notes
      await fetchChildNotes(noteId);
    } catch (error) {
      console.error("Error viewing note collection:", error);
      toast.error("Failed to load note collection");
    }
  };

  const fetchChildNotes = async (
    collectionId: string,
    page: number = 1,
    search: string = ""
  ) => {
    setIsLoadingChildNotes(true);
    try {
      const response = await getCollectionChildrenDocuments(collectionId, {
        page_number: page,
        page_size: childNotePageSize,
        search: search,
        sort_by: "created_at",
        sort_order: 1,
      });

      if (response.success) {
        setChildNotes(response.documents);
        setTotalChildNotes(response.total_items);
        setCurrentChildNotePage(page);
      } else {
        throw new Error("Failed to fetch child notes");
      }
    } catch (error) {
      console.error("Error fetching child notes:", error);
      toast.error("Failed to fetch child notes");
    } finally {
      setIsLoadingChildNotes(false);
    }
  };

  const handleBackFromChildNotes = () => {
    setShowChildNotes(false);
    setSelectedNoteCollection(null);
    setChildNotes([]);
    setCurrentChildNotePage(1);
    setTotalChildNotes(0);
    setChildNoteSearchQuery("");
  };

  const handleViewNoteChild = (document: Document) => {
    toast.info(`Viewing document: ${document.title}`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900";
      case "pending":
      case "not_complete":
        return "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-green-900";
      case "failed":
        return "text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-900/30 dark:border-gray-800";
    }
  };

  // Show child notes view if selected
  if (showChildNotes && selectedNoteCollection) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackFromChildNotes}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs">Back to Notes</span>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                {selectedNoteCollection.title} - Child Notes
              </h1>
              <p className="text-xs text-muted-foreground">
                Collection: {document.title}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8">
          {/* Child Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Small className="font-semibold">Child Notes</Small>
            </div>

            {/* Search bar for child notes */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search child notes..."
                value={childNoteSearchQuery}
                onChange={(e) => setChildNoteSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {isLoadingChildNotes ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {childNotes.length === 0 ? (
                  <div className="text-center py-8 border rounded-lg">
                    <h3 className="mt-2 text-xs font-medium">
                      No child notes found
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      This note collection doesn't have any child notes yet
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-full overflow-hidden">
                    <div className="w-full max-w-full overflow-x-auto">
                      <DocumentTable
                        documents={childNotes}
                        getStatusColor={getStatusColor}
                        onRowClick={handleViewNoteChild}
                        renderActions={(document) => (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNote(document.id);
                              }}
                              className="text-xs text-amber-600 hover:underline"
                              title="Edit document"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(document.id);
                              }}
                              className="text-xs text-red-600 hover:underline"
                              title="Delete document"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <Pagination
                        currentPage={currentChildNotePage}
                        totalItems={totalChildNotes}
                        pageSize={childNotePageSize}
                        documentsCount={childNotes.length}
                        setCurrentPage={setCurrentChildNotePage}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

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
                    <DocumentTable
                      documents={notes}
                      getStatusColor={getStatusColor}
                      onRowClick={(document) => handleViewNote(document.id)}
                      renderActions={(document) => (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditNote(document.id);
                            }}
                            className="text-xs text-amber-600 hover:underline"
                            title="Edit note collection"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNote(document.id);
                            }}
                            className="text-xs text-red-600 hover:underline"
                            title="Delete note collection"
                          >
                            Delete
                          </button>
                        </div>
                      )}
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
