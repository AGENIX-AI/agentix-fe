import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Search,
  X,
  AlertCircle,
  Check,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import Cookies from "js-cookie";

import { getOwnDocuments, linkDocument, unlinkDocument } from "@/api/documents";
import type { Document } from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";

import { Small } from "@/components/ui/typography";
import { DocumentTable } from "./DocumentTable";
import { Pagination } from "./Pagination";
import { Button } from "@/components/ui/button";
import DocumentUpload from "../components/DocumentUpload";
import DocumentGuidelines from "../components/DocumentGuidelines";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Using DocumentType from types.ts

interface EmbeddedDocumentsComponentProps {
  refreshAssistantDocuments?: () => Promise<void>;
  refreshTrigger?: number;
  onAddDocument?: () => void;
  onDocumentSelect?: (document: Document) => void;
}

export function EmbeddedDocumentsComponent({
  refreshAssistantDocuments,
  refreshTrigger,
  onAddDocument,
  onDocumentSelect,
}: EmbeddedDocumentsComponentProps) {
  const { assistantId } = useInstructor();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDocumentIds, setLoadingDocumentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [showAddDocumentSidebar, setShowAddDocumentSidebar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(0);

  // Image handling states
  const [showImageSidebar, setShowImageSidebar] = useState(false);
  const [currentDocumentId, setCurrentDocumentId] = useState<string>("");
  const [documentImages, setDocumentImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isSubmittingImages, setIsSubmittingImages] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch documents when page, search, document type, or refresh trigger changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await getOwnDocuments({
          page_number: currentPage,
          page_size: pageSize,
          search: searchQuery || "",
          type: "document",
          assistant_id: assistantId || undefined, // Provide undefined when no assistant selected
          sort_by: "created_at",
          sort_order: 1,
        });

        if (response.success) {
          setDocuments(response.documents);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [
    assistantId,
    currentPage,
    pageSize,
    searchQuery,
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

  const getLinkStatus = (linked: boolean | undefined) => {
    return linked
      ? "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900"
      : "text-gray-600 bg-gray-50 border-gray-100 dark:bg-gray-900/30 dark:border-gray-800";
  };

  const handleLinkDocument = async (documentId: string) => {
    if (!assistantId) return;

    try {
      setLoadingDocumentIds((prev) => [...prev, documentId]);
      const response = await linkDocument(documentId, assistantId);
      if (response.success) {
        toast.success("Document linked successfully");
        // Update the document in the list
        setDocuments(
          documents.map((doc) =>
            doc.id === documentId ? { ...doc, linked: true } : doc
          )
        );
        // Refresh assistant documents to show the newly linked document
        refreshAssistantDocuments?.();
      } else {
        toast.error(response.message || "Failed to link document");
      }
    } catch (error) {
      console.error("Error linking document:", error);
      toast.error("Failed to link document");
    } finally {
      setLoadingDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

  const handleUnlinkDocument = async (documentId: string) => {
    if (!assistantId) return;

    try {
      setLoadingDocumentIds((prev) => [...prev, documentId]);
      const response = await unlinkDocument(documentId, assistantId);
      if (response.success) {
        toast.success("Document unlinked successfully");
        // Update the document in the list
        setDocuments(
          documents.map((doc) =>
            doc.id === documentId ? { ...doc, linked: false } : doc
          )
        );
        // Refresh assistant documents to remove the unlinked document
        refreshAssistantDocuments?.();
      } else {
        toast.error(response.message || "Failed to unlink document");
      }
    } catch (error) {
      console.error("Error unlinking document:", error);
      toast.error("Failed to unlink document");
    } finally {
      setLoadingDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

  const handleViewDocument = (documentId: string) => {
    if (onDocumentSelect) {
      const document = documents.find((doc) => doc.id === documentId);
      if (document) {
        onDocumentSelect(document);
      }
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
        `${baseUrl}/documents/index/image/${documentId}`,
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
        `${baseUrl}/documents/index/image/${currentDocumentId}`,
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

  return (
    <div className="">
      <div className="mb-3 flex justify-between items-center">
        <Small className="font-semibold">Your Documents</Small>
        <Button
          onClick={handleAddDocument}
          className="flex items-center space-x-1 px-3 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Document</span>
        </Button>
      </div>

      <div className="flex items-center space-x-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
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

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {documents.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="mt-2 text-xs font-medium">No documents found</h3>
              <p className="text-xs text-muted-foreground mt-1">
                No documents available
              </p>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-hidden">
              <div className="w-full max-w-full overflow-x-auto">
                <DocumentTable
                  documents={documents}
                  getStatusColor={getStatusColor}
                  getLinkStatus={getLinkStatus}
                  showLinkedColumn={true}
                  onLinkDocument={handleLinkDocument}
                  onUnlinkDocument={handleUnlinkDocument}
                  loadingDocumentIds={loadingDocumentIds}
                  onViewDocument={
                    onDocumentSelect ? handleViewDocument : undefined
                  }
                  onRowClick={onDocumentSelect}
                />
              </div>

              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  documentsCount={documents.length}
                  setCurrentPage={setCurrentPage}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Document Sidebar */}
      {showAddDocumentSidebar && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20"
            onClick={handleCloseAddDocumentSidebar}
          />

          {/* Sidebar */}
          <div className="relative ml-auto w-[500px] bg-background border-l shadow-xl h-full flex flex-col">
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
          <div className="relative ml-auto w-[600px] bg-background border-l shadow-xl h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b h-18">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">Document Images</h2>
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
    </div>
  );
}
