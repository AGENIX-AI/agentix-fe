import { useState, useEffect, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  uploadDocument,
  createImageIndex,
  getOwnDocuments,
  linkDocument,
  unlinkDocument,
} from "@/api/documents";
import type { Document } from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";
import { toast } from "sonner";
import { Small } from "@/components/ui/typography";

export function MediaTab() {
  const { assistantId } = useInstructor();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [images, setImages] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingDocumentIds, setLoadingDocumentIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // New state for upload result and confirmation dialog
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    description: string;
    title: string;
    url: string;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch images on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchImages();
  }, [refreshTrigger, currentPage]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const response = await getOwnDocuments({
        type: "image",
        page_number: currentPage,
        page_size: pageSize,
        sort_by: "created_at",
        sort_order: 1,
        assistant_id: assistantId || undefined,
      });
      setImages(response.documents);
      setTotalItems(response.total_items);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("Failed to fetch images.");
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setSelectedFile(droppedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select an image file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload the image
      const result = await uploadDocument(selectedFile);

      if (!result.success) {
        throw new Error(result.description || "Failed to upload image.");
      }

      // Store the upload result and show confirmation dialog
      setUploadResult(result);
      setShowConfirmDialog(true);
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmIndex = async () => {
    if (!uploadResult) return;

    setIsIndexing(true);

    try {
      // Create image index using the data from upload result
      const indexResult = await createImageIndex(
        "", // We don't need assistant_id for own documents
        uploadResult.description,
        uploadResult.title,
        uploadResult.url
      );

      if (!indexResult.success) {
        throw new Error("Failed to index image.");
      }

      setSuccessMessage("Image indexed successfully!");
      setSelectedFile(null);
      setShowConfirmDialog(false);
      setUploadResult(null);

      // Refresh the image list
      setRefreshTrigger((prev) => prev + 1);

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Error indexing image:", err);
      setError(err.message || "Failed to index image. Please try again.");
    } finally {
      setIsIndexing(false);
    }
  };

  const handleCancelIndex = () => {
    setShowConfirmDialog(false);
    setUploadResult(null);
    setSuccessMessage("Image uploaded but not indexed.");
  };

  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
    setShowPreview(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleLinkDocument = async (documentId: string) => {
    if (!assistantId) {
      toast.error("No assistant selected");
      return;
    }

    try {
      setLoadingDocumentIds((prev) => [...prev, documentId]);
      const response = await linkDocument(documentId, assistantId);
      if (response.success) {
        toast.success("Image linked successfully");
        // Update the document in the list
        setImages(
          images.map((doc) =>
            doc.id === documentId ? { ...doc, linked: true } : doc
          )
        );
      } else {
        toast.error(response.message || "Failed to link image");
      }
    } catch (error) {
      console.error("Error linking image:", error);
      toast.error("Failed to link image");
    } finally {
      setLoadingDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

  const handleUnlinkDocument = async (documentId: string) => {
    if (!assistantId) {
      toast.error("No assistant selected");
      return;
    }

    try {
      setLoadingDocumentIds((prev) => [...prev, documentId]);
      const response = await unlinkDocument(documentId, assistantId);
      if (response.success) {
        toast.success("Image unlinked successfully");
        // Update the document in the list
        setImages(
          images.map((doc) =>
            doc.id === documentId ? { ...doc, linked: false } : doc
          )
        );
      } else {
        toast.error(response.message || "Failed to unlink image");
      }
    } catch (error) {
      console.error("Error unlinking image:", error);
      toast.error("Failed to unlink image");
    } finally {
      setLoadingDocumentIds((prev) => prev.filter((id) => id !== documentId));
    }
  };

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Status messages */}
          {successMessage && (
            <div className="bg-green-100 border border-green-200 text-green-800 rounded-md mb-4 text-xs flex items-center p-2 max-w-full">
              <Check className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="break-words text-xs">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md flex items-center space-x-2 mb-4 max-w-full">
              <AlertCircle
                size={12}
                className="text-destructive flex-shrink-0"
              />
              <p className="text-xs text-destructive break-words">{error}</p>
            </div>
          )}

          {/* Upload Section */}
          <div className="w-full space-y-2">
            <p className="text-xs text-muted-foreground">
              Upload images to use in your content. Accepted formats: JPEG, PNG,
              GIF, and other common image formats.
            </p>

            <div
              className={`border-2 border-dashed rounded-lg p-4 w-full flex flex-col items-center justify-center transition-all duration-200 ${
                isDragging
                  ? "border-primary bg-accent/20"
                  : "border-border hover:border-primary/50 hover:bg-accent/10"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div
                className={`p-2 rounded-full bg-accent mb-2 ${
                  isDragging ? "bg-primary/10" : ""
                }`}
              >
                <Upload
                  size={20}
                  className={`${
                    isDragging ? "text-primary" : "text-primary/70"
                  }`}
                />
              </div>
              <p className="text-xs font-medium mb-1">
                Drag and drop your image here
              </p>
              <p className="text-xs text-muted-foreground mb-2">or</p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />

              <Button
                onClick={handleButtonClick}
                variant="outline"
                size="sm"
                className="bg-background hover:bg-accent/50 transition-colors text-xs"
              >
                Browse files
              </Button>
            </div>

            {selectedFile && (
              <div className="w-full space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-3 bg-primary rounded-full"></div>
                  <p className="text-xs font-medium">Selected Image</p>
                </div>

                <div className="flex items-start space-x-6 p-3 border rounded-md bg-accent/5 hover:bg-accent/10 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-md shadow-sm">
                    <div className="w-10 h-10 flex items-center justify-center bg-accent rounded overflow-hidden">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-medium">{selectedFile.name}</p>
                      <span className="px-2 py-0.5 bg-success/10 text-success-foreground rounded-full text-[10px] font-medium">
                        Image
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>

                    <div className="mt-3 flex justify-end">
                      <Button
                        size="sm"
                        className="text-xs h-7 px-3 bg-success hover:bg-success/90 text-success-foreground"
                        onClick={handleUpload}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Image"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Images Table */}
          <div>
            <div className="mb-3">
              <Small className="font-semibold">Your Images</Small>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-xs font-medium">No images found</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your first image above.
                </p>
              </div>
            ) : (
              <div className="w-full max-w-full overflow-hidden">
                <div className="w-full max-w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px] text-xs">
                          Preview
                        </TableHead>
                        <TableHead className="text-xs">Title</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Created At</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        {assistantId && (
                          <TableHead className="text-xs">Linked</TableHead>
                        )}
                        <TableHead className="text-xs w-[100px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {images.map((image) => (
                        <TableRow key={image.id}>
                          <TableCell>
                            <div
                              className="w-10 h-10 rounded bg-muted flex items-center justify-center cursor-pointer overflow-hidden"
                              onClick={() => handlePreviewImage(image.url)}
                            >
                              {image.url ? (
                                <img
                                  src={image.url}
                                  alt={image.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {image.title}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] ${getStatusColor(
                                image.upload_status
                              )}`}
                            >
                              {image.upload_status}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDate(image.created_at)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {image.type}
                          </TableCell>
                          {assistantId && (
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-[10px] ${getLinkStatus(
                                  image.linked
                                )}`}
                              >
                                {image.linked ? "Linked" : "Not Linked"}
                              </span>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => handlePreviewImage(image.url)}
                              >
                                <ImageIcon className="h-4 w-4" />
                                <span className="sr-only">Preview</span>
                              </Button>

                              {assistantId &&
                                (image.linked ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() =>
                                      handleUnlinkDocument(image.id)
                                    }
                                    disabled={loadingDocumentIds.includes(
                                      image.id
                                    )}
                                  >
                                    {loadingDocumentIds.includes(image.id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Unlink className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Unlink</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => handleLinkDocument(image.id)}
                                    disabled={loadingDocumentIds.includes(
                                      image.id
                                    )}
                                  >
                                    {loadingDocumentIds.includes(image.id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <LinkIcon className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Link</span>
                                  </Button>
                                ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Simple Pagination */}
                {totalItems > pageSize && (
                  <div className="flex justify-between items-center mt-4 text-xs">
                    <div>
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, totalItems)} of{" "}
                      {totalItems} images
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        disabled={currentPage * pageSize >= totalItems}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-sm">Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex justify-center">
              <img
                src={previewImage}
                alt="Preview"
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Indexing */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">
              Confirm Image Indexing
            </DialogTitle>
          </DialogHeader>

          {uploadResult && (
            <div className="space-y-4">
              <div className="flex justify-center my-4">
                <div className="w-40 h-40 rounded overflow-hidden">
                  <img
                    src={uploadResult.url}
                    alt={uploadResult.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium">Title:</p>
                <p className="text-xs">{uploadResult.title}</p>
              </div>

              {uploadResult.description && (
                <div>
                  <p className="text-xs font-medium">Description:</p>
                  <p className="text-xs">{uploadResult.description}</p>
                </div>
              )}

              <p className="text-xs">
                The image has been uploaded successfully. Do you want to index
                it now?
              </p>
            </div>
          )}

          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={handleCancelIndex}
              disabled={isIndexing}
              className="text-xs"
            >
              Skip Indexing
            </Button>
            <Button
              onClick={handleConfirmIndex}
              disabled={isIndexing}
              className="text-xs"
            >
              {isIndexing ? "Indexing..." : "Confirm & Index"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
