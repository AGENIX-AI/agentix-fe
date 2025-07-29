import { useState, useEffect } from "react";
import { Check, AlertCircle, X, Loader2, Upload } from "lucide-react";
import { DocumentUpload, DocumentGuidelines } from "./components";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

import { EmbeddedDocumentsComponent } from "./ownDocuments";
import DocumentDetailsView from "./components/DocumentDetailsView";
import type { Document } from "@/api/documents";

// Removed unused interface
export interface ApiDocument {
  id: string;
  user_id: string;
  url: string;
  upload_status: "completed" | "not_complete" | "failed" | "pending";
  created_at: string;
  updated_at: string;
  file_name: string;
  title: string;
  type: "document" | "image";
  linked?: boolean;
  assistant_document?: {
    assistant_id: string;
  }[];
}
// Response types are defined inline where needed

export default function AddDocument() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [documentImages, setDocumentImages] = useState<string[]>([]);
  const [showImageSidebar, setShowImageSidebar] = useState(false);
  const [showAddDocumentSidebar, setShowAddDocumentSidebar] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string>("");
  const [isSubmittingImages, setIsSubmittingImages] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
      setError(t("documents.documentsTab.failedToFetchImages"));
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Handle successful document upload
  const handleUploadSuccess = async (documentId: string) => {
    setSuccessMessage(t("documents.documentsTab.uploadSuccess"));
    setCurrentDocumentId(documentId);
    await fetchDocumentImages(documentId);
    setShowImageSidebar(true);
    setShowAddDocumentSidebar(false);
  };

  // Handle upload error
  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Function to close the image sidebar
  const handleCloseSidebar = () => {
    setShowImageSidebar(false);
    setSelectedImages([]);

    // Trigger document refresh
    console.log("Triggering document refresh");
    setRefreshDocuments((prev) => prev + 1);
  };

  // Function to close the add document sidebar
  const handleCloseAddDocumentSidebar = () => {
    setShowAddDocumentSidebar(false);
    setError(null);
  };

  // State to trigger document refresh
  const [refreshDocuments, setRefreshDocuments] = useState(0);

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

  // Function to handle document selection for viewing details
  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentDetails(true);
  };

  // Function to submit images (selected or all)
  const handleSubmitImages = async (
    imagesToSubmit: string[],
    isAllImages = false
  ) => {
    if (!currentDocumentId) {
      setError(t("documents.documentsTab.noDocumentSelected"));
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
          ? t("documents.documentsTab.imageIndexUpdated", {
              count: result.remaining_files.length,
              type: isAllImages ? t("documents.documentsTab.submitted") : t("documents.documentsTab.selected")
            })
          : t("documents.documentsTab.documentSubmittedNoImages");

      // Show success toast and close sidebar immediately
      toast.success(messageText);

      // Close sidebar and reset state
      setShowImageSidebar(false);
      setSelectedImages([]);

      // Trigger document refresh
      setRefreshDocuments((prev) => prev + 1);
    } catch (err) {
      console.error("Error updating image index:", err);
      setError(t("documents.documentsTab.failedToUpdateIndex"));
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

  // If showing document details, render that component
  if (showDocumentDetails && selectedDocument) {
    return (
      <DocumentDetailsView
        document={selectedDocument}
        onBack={() => setShowDocumentDetails(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="">
          {successMessage && (
            <div className="bg-green-100 border border-green-200 text-green-800 rounded-md mb-4 text-xs flex items-center p-2 max-w-full">
              <Check className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="break-words">{successMessage}</span>
            </div>
          )}

          {error && !showAddDocumentSidebar && (
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md flex items-center space-x-2 mb-4 max-w-full">
              <AlertCircle
                size={12}
                className="text-destructive flex-shrink-0"
              />
              <p className="text-xs text-destructive break-words">{error}</p>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <EmbeddedDocumentsComponent
              refreshTrigger={refreshDocuments}
              onDocumentSelect={handleDocumentSelect}
            />
          </div>
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
          <div className="relative ml-auto w-[500px] bg-background border-l shadow-xl h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b h-18">
              <h2 className="text-lg font-semibold">{t("documents.documentsTab.addDocument")}</h2>
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
                <h2 className="text-lg font-semibold">{t("documents.documentsTab.documentImages")}</h2>
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
                      {t("documents.documentsTab.selectAll")} ({selectedImages.length}/
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
                      ? t("documents.documentsTab.submittingImages")
                      : t("documents.documentsTab.loadingImages")}
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
                            alt={`${t("documents.documentsTab.documentPage")} ${index + 1}`}
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
                          {t("documents.documentsTab.page")} {index + 1}
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
                  <p className="text-sm font-medium">{t("documents.documentsTab.noImages")}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("documents.documentsTab.noImagesAvailable")}
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
                        {t("documents.documentsTab.submitting")}
                      </>
                    ) : (
                      `${t("documents.documentsTab.submitAllImages")} (${documentImages.length})`
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
                        {t("documents.documentsTab.submitting")}
                      </>
                    ) : (
                      `${t("documents.documentsTab.submitSelectedImages")} (${selectedImages.length})`
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
                      {t("documents.documentsTab.submitting")}
                    </>
                  ) : (
                    t("documents.documentsTab.submitWithoutImages")
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
