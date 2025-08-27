import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  X,
  AlertCircle,
  Check,
  Upload,
  BookCopy,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

import { updateModeDocument } from "@/api/documents";
import { getOwnDocuments } from "@/api/page";

import type { Document } from "@/api/page";
import { useInstructor } from "@/contexts/InstructorContext";

import { Button } from "@/components/ui/button";
import DocumentUpload from "../components/DocumentUpload";
import DocumentGuidelines from "../components/DocumentGuidelines";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Small } from "@/components/typography";
import { EditDocumentSidebar } from "./EditDocumentSidebar";
import { DeleteDocumentDialog } from "./DeleteDocumentDialog";
import { DocumentListSection } from "./DocumentListSection";
import { ViewDocumentSidebar } from "./ViewDocumentSidebar";
import { UpdateDocumentSidebar } from "./UpdateDocumentSidebar";

// Using DocumentType from types.ts

interface EmbeddedDocumentsComponentProps {
  refreshTrigger?: number;
  onAddDocument?: () => void;
  onDocumentSelect?: (document: Document) => void;
}

export function EmbeddedDocumentsComponent({
  refreshTrigger,
  onAddDocument,
  onDocumentSelect,
}: EmbeddedDocumentsComponentProps) {
  const { assistantId } = useInstructor();
  const [originalDocuments, setOriginalDocuments] = useState<Document[]>([]);
  const [referenceDocuments, setReferenceDocuments] = useState<Document[]>([]);
  const [isLoadingOriginal, setIsLoadingOriginal] = useState(false);
  const [isLoadingReference, setIsLoadingReference] = useState(false);
  const [searchQueryOriginal, setSearchQueryOriginal] = useState("");
  const [searchQueryReference, setSearchQueryReference] = useState("");
  const [currentPageOriginal, setCurrentPageOriginal] = useState(1);
  const [currentPageReference, setCurrentPageReference] = useState(1);
  const [pageSize] = useState(10);
  const [totalItemsOriginal, setTotalItemsOriginal] = useState(0);
  const [totalItemsReference, setTotalItemsReference] = useState(0);
  const [showAddDocumentSidebar, setShowAddDocumentSidebar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);
  const [updatingModeDocumentId, setUpdatingModeDocumentId] = useState<
    string | null
  >(null);

  // Edit and delete states
  const [editSidebar, setEditSidebar] = useState<{
    isVisible: boolean;
    document: Document | null;
  }>({
    isVisible: false,
    document: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    document: Document | null;
  }>({
    isOpen: false,
    document: null,
  });

  // Image handling states
  const [showImageSidebar, setShowImageSidebar] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string>("");
  const [documentImages, setDocumentImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isSubmittingImages, setIsSubmittingImages] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // View sidebar states
  const [showViewSidebar, setShowViewSidebar] = useState(false);
  const [viewDocument, setViewDocument] = useState<Document | null>(null);

  // Update content sidebar states
  const [showUpdateSidebar, setShowUpdateSidebar] = useState(false);
  const [updateDocument, setUpdateDocument] = useState<Document | null>(null);

  // Fetch original documents
  useEffect(() => {
    const fetchOriginalDocuments = async () => {
      setIsLoadingOriginal(true);
      try {
        const response = await getOwnDocuments({
          page_number: currentPageOriginal,
          page_size: pageSize,
          search: searchQueryOriginal || "",
          type: "upload_document",
          assistant_id: assistantId || undefined,
          sort_by: "created_at",
          sort_order: -1,
          mode: "original",
        });

        if (response.success) {
          setOriginalDocuments(response.documents);
          setTotalItemsOriginal(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching original documents:", error);
      } finally {
        setIsLoadingOriginal(false);
      }
    };

    fetchOriginalDocuments();
  }, [
    assistantId,
    currentPageOriginal,
    pageSize,
    searchQueryOriginal,
    refreshTrigger,
    localRefreshTrigger,
  ]);

  // Fetch reference documents
  useEffect(() => {
    const fetchReferenceDocuments = async () => {
      setIsLoadingReference(true);
      try {
        const response = await getOwnDocuments({
          page_number: currentPageReference,
          page_size: pageSize,
          search: searchQueryReference || "",
          type: "upload_document",
          assistant_id: assistantId || undefined,
          sort_by: "created_at",
          sort_order: -1,
          mode: "reference",
        });

        if (response.success) {
          setReferenceDocuments(response.documents);
          setTotalItemsReference(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching reference documents:", error);
      } finally {
        setIsLoadingReference(false);
      }
    };

    fetchReferenceDocuments();
  }, [
    assistantId,
    currentPageReference,
    pageSize,
    searchQueryReference,
    refreshTrigger,
    localRefreshTrigger,
  ]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-100 dark:bg-green-950/30 dark:border-green-900";
      case "pending":
      case "not_complete":
        return "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900";
      case "failed":
        return "text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-900/30 dark:border-gray-800";
    }
  };

  const handleAddDocument = () => {
    if (onAddDocument) {
      onAddDocument();
    } else {
      setShowAddDocumentSidebar(true);
    }
  };

  const handleCloseAddDocumentSidebar = () => {
    setShowAddDocumentSidebar(false);
    setError(null);
  };

  const handleUpdateDocumentMode = async (
    documentId: string,
    newMode: "original" | "reference"
  ) => {
    try {
      setUpdatingModeDocumentId(documentId);
      const response = await updateModeDocument(documentId, newMode);
      if (response.success) {
        toast.success(`Document mode updated to ${newMode}`);
        setLocalRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(response.message || "Failed to update document mode");
      }
    } catch (error) {
      console.error("Error updating document mode:", error);
      toast.error("Failed to update document mode");
    } finally {
      setUpdatingModeDocumentId(null);
    }
  };

  // Function to fetch document images
  const fetchDocumentImages = async (documentId: string) => {
    setIsLoadingImages(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const accessToken = Cookies.get("edvara_access_token");
      const refreshToken = Cookies.get("edvara_refresh_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      if (refreshToken) {
        headers["X-Refresh-Token"] = refreshToken;
      }

      const response = await fetch(
        `${baseUrl}/pages/index/image/${documentId}`,
        {
          method: "GET",
          headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch document images: ${response.statusText}`
        );
      }

      const imageUrls = await response.json();
      console.log("Document images:", imageUrls);
      setDocumentImages(imageUrls);
    } catch (err) {
      console.error("Error fetching document images:", err);
      setError("Failed to fetch document images.");
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleUploadSuccess = async (documentId: string) => {
    setSuccessMessage("Document successfully uploaded!");
    setCurrentDocumentId(documentId);
    await fetchDocumentImages(documentId);
    setShowImageSidebar(true);
    setShowAddDocumentSidebar(false);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Function to close the image sidebar
  const handleCloseSidebar = () => {
    setShowImageSidebar(false);
    setSelectedImages([]);
    setLocalRefreshTrigger((prev) => prev + 1);
  };

  // Function to handle image selection
  const handleImageSelect = (imagePath: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(imagePath)) {
        return prev.filter((img) => img !== imagePath);
      } else {
        return [...prev, imagePath];
      }
    });
  };

  // Function to handle select/deselect all
  const handleSelectAll = () => {
    if (selectedImages.length === documentImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages([...documentImages]);
    }
  };

  // Function to submit images (selected or all)
  const handleSubmitImages = async (
    imagesToSubmit: string[],
    isAllImages = false
  ) => {
    if (!currentDocumentId) {
      setError("No document selected for submission.");
      return;
    }

    setIsSubmittingImages(true);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const accessToken = Cookies.get("edvara_access_token");
      const refreshToken = Cookies.get("edvara_refresh_token");

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      if (refreshToken) {
        headers["X-Refresh-Token"] = refreshToken;
      }

      const response = await fetch(
        `${baseUrl}/pages/index/image/${currentDocumentId}`,
        {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({
            list_image: imagesToSubmit,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update image index: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Image index updated:", result);

      const messageText =
        imagesToSubmit.length > 0
          ? `Image index updated successfully! ${
              result.remaining_files.length
            } images ${isAllImages ? "submitted" : "selected"}.`
          : "Document submitted successfully with no images.";

      // Show success toast and close sidebar immediately
      toast.success(messageText);

      // Close sidebar and reset state
      setShowImageSidebar(false);
      setSelectedImages([]);

      // Trigger document refresh
      setLocalRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error updating image index:", err);
      setError("Failed to update image index. Please try again.");
    } finally {
      setIsSubmittingImages(false);
    }
  };

  // Function to submit selected images
  const handleSubmitSelectedImages = () => {
    handleSubmitImages(selectedImages, false);
  };

  // Function to submit all images
  const handleSubmitAllImages = () => {
    handleSubmitImages(documentImages, true);
  };

  // Function to submit with empty array
  const handleSubmitNoImages = () => {
    handleSubmitImages([], false);
  };

  // Update content handlers
  const handleOpenUpdateSidebar = async (document: Document) => {
    setShowUpdateSidebar(true);
    setUpdateDocument(document);
  };

  const handleCloseUpdateSidebar = () => {
    setShowUpdateSidebar(false);
    setUpdateDocument(null);
  };

  const handleSaveUpdatedBlocks = async () => {
    setLocalRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteDocument = (document: Document) => {
    setDeleteDialog({
      isOpen: true,
      document,
    });
  };

  const handleEditClose = () => {
    setEditSidebar({
      isVisible: false,
      document: null,
    });
  };

  const handleEditSuccess = () => {
    setLocalRefreshTrigger((prev) => prev + 1);
  };

  const handleDeleteClose = () => {
    setDeleteDialog({
      isOpen: false,
      document: null,
    });
  };

  const handleDeleteSuccess = () => {
    setLocalRefreshTrigger((prev) => prev + 1);
  };

  // View handlers
  const handleViewDocument = async (document: Document) => {
    setViewDocument(document);
    setShowViewSidebar(true);
  };

  const handleCloseViewSidebar = () => {
    setShowViewSidebar(false);
    setViewDocument(null);
  };

  return (
    <div className="">
      <div className="mb-3 flex justify-end items-right">
        <Button
          onClick={handleAddDocument}
          className="flex items-center space-x-1 px-3 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Document</span>
        </Button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-200 text-green-800 rounded-md mb-4 text-xs flex items-center p-2 max-w-full">
          <Check className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="break-words">{successMessage}</span>
        </div>
      )}

      {error && !showAddDocumentSidebar && !showImageSidebar && (
        <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md flex items-center space-x-2 mb-4 max-w-full">
          <AlertCircle size={12} className="text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive break-words">{error}</p>
        </div>
      )}

      <div className="flex flex-col space-y-6">
        {/* Original Documents Section */}
        <div className="rounded-md">
          <DocumentListSection
            title="Official Documents"
            icon={<FileText className="h-5 w-5 mr-2 text-primary" />}
            documents={originalDocuments}
            isLoading={isLoadingOriginal}
            currentPage={currentPageOriginal}
            setCurrentPage={setCurrentPageOriginal}
            totalItems={totalItemsOriginal}
            pageSize={pageSize}
            searchQuery={searchQueryOriginal}
            setSearchQuery={setSearchQueryOriginal}
            targetMode="original"
            updatingModeDocumentId={updatingModeDocumentId}
            getStatusColor={getStatusColor}
            onView={(doc) => handleViewDocument(doc)}
            onDelete={(doc) => handleDeleteDocument(doc)}
            onMove={(doc, newMode) => handleUpdateDocumentMode(doc.id, newMode)}
            onUpdateContent={(doc) => handleOpenUpdateSidebar(doc)}
            onRowClick={onDocumentSelect}
          />
        </div>

        {/* Reference Documents Section */}
        <div className="rounded-md">
          <DocumentListSection
            title="Reference Documents"
            icon={<BookCopy className="h-5 w-5 mr-2 text-primary" />}
            documents={referenceDocuments}
            isLoading={isLoadingReference}
            currentPage={currentPageReference}
            setCurrentPage={setCurrentPageReference}
            totalItems={totalItemsReference}
            pageSize={pageSize}
            searchQuery={searchQueryReference}
            setSearchQuery={setSearchQueryReference}
            targetMode="reference"
            updatingModeDocumentId={updatingModeDocumentId}
            getStatusColor={getStatusColor}
            onView={(doc) => handleViewDocument(doc)}
            onDelete={(doc) => handleDeleteDocument(doc)}
            onMove={(doc, newMode) => handleUpdateDocumentMode(doc.id, newMode)}
            onUpdateContent={(doc) => handleOpenUpdateSidebar(doc)}
            onRowClick={onDocumentSelect}
          />
        </div>
      </div>

      {/* Add Document Sidebar */}
      {showAddDocumentSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={handleCloseAddDocumentSidebar}
          />

          {/* Sidebar */}
          <div className="relative ml-auto app-sidebar-panel bg-background border-l shadow-xl h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b h-18">
              <h2 className="text-lg font-semibold">Add Document</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseAddDocumentSidebar}
                className="text-xs"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md flex items-center space-x-2 mb-4 max-w-full">
                  <AlertCircle
                    size={12}
                    className="text-destructive flex-shrink-0"
                  />
                  <p className="text-xs text-destructive break-words">
                    {error}
                  </p>
                </div>
              )}

              <DocumentUpload
                onUploadSuccess={handleUploadSuccess}
                onError={handleUploadError}
              />

              <DocumentGuidelines />
            </div>
          </div>
        </div>
      )}

      {/* Image Sidebar */}
      {showImageSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={isSubmittingImages ? undefined : handleCloseSidebar}
          />

          {/* Sidebar */}
          <div className="relative ml-auto app-sidebar-panel bg-background border-l shadow-xl h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b h-18">
              <div className="flex items-center space-x-4">
                <Small className="text-lg font-semibold">Document Images</Small>
                {documentImages.length > 0 && !isSubmittingImages && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={
                        selectedImages.length === documentImages.length &&
                        documentImages.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      disabled={isSubmittingImages}
                    />
                    <Label htmlFor="select-all" className="text-xs">
                      Select All ({selectedImages.length}/
                      {documentImages.length})
                    </Label>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseSidebar}
                className="text-xs"
                disabled={isSubmittingImages}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingImages || isSubmittingImages ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">
                    {isSubmittingImages
                      ? "Submitting images..."
                      : "Loading document images..."}
                  </p>
                </div>
              ) : documentImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 pb-4">
                  {documentImages.map((imagePath, index) => {
                    const baseUrl = import.meta.env.VITE_API_URL || "";
                    const fullImageUrl = `${baseUrl}/${imagePath}`;
                    const isSelected = selectedImages.includes(imagePath);

                    return (
                      <div
                        key={index}
                        className={`relative rounded-md overflow-hidden border shadow-sm transition-all duration-200 ${
                          isSelected
                            ? "border-primary border-2 bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={fullImageUrl}
                            alt={`Document page ${index + 1}`}
                            className="w-full h-40 object-cover"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                handleImageSelect(imagePath)
                              }
                              className="bg-background border-2"
                              disabled={isSubmittingImages}
                            />
                          </div>
                        </div>
                        <div className="p-2 bg-background/80 text-xs text-center">
                          Page {index + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="p-2 rounded-full bg-accent mx-auto w-fit">
                    <Upload size={20} className="text-primary/70" />
                  </div>
                  <p className="text-sm font-medium">No images found</p>
                  <p className="text-xs text-muted-foreground">
                    No images are available for this document
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t h-auto px-6 py-4 space-y-3">
              {documentImages.length > 0 ? (
                <>
                  <Button
                    onClick={handleSubmitAllImages}
                    disabled={isSubmittingImages}
                    className="w-full bg-primary hover:bg-primary/90"
                    size="sm"
                  >
                    {isSubmittingImages ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      `Submit All Images (${documentImages.length})`
                    )}
                  </Button>

                  <Button
                    onClick={handleSubmitSelectedImages}
                    disabled={selectedImages.length === 0 || isSubmittingImages}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    {isSubmittingImages ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      `Submit Selected Images (${selectedImages.length})`
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleSubmitNoImages}
                  disabled={isSubmittingImages}
                  className="w-full bg-primary hover:bg-primary/90"
                  size="sm"
                >
                  {isSubmittingImages ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Document Without Images"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Sidebar */}
      <EditDocumentSidebar
        isVisible={editSidebar.isVisible}
        document={editSidebar.document}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Document Dialog */}
      <DeleteDocumentDialog
        isOpen={deleteDialog.isOpen}
        document={deleteDialog.document}
        onClose={handleDeleteClose}
        onSuccess={handleDeleteSuccess}
      />

      {/* View Document Sidebar */}
      <ViewDocumentSidebar
        isOpen={showViewSidebar}
        document={viewDocument}
        onClose={handleCloseViewSidebar}
      />

      <UpdateDocumentSidebar
        isOpen={showUpdateSidebar}
        document={updateDocument}
        onClose={handleCloseUpdateSidebar}
        onSuccess={handleSaveUpdatedBlocks}
      />
    </div>
  );
}
