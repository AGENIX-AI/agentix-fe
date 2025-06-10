import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  createImageIndex,
  uploadImageDocument,
  getImageDocuments,
  type ImageDocument,
} from "@/api/documents";

// Import components
import { StatCard } from "./components/StatCard";
import { ImageItem } from "./components/ImageItem";
import { ImageDetail } from "./components/ImageDetail";
import { UploadDialog } from "./components/UploadDialog";
import type { ImageData, ImageStats } from "./components/types";
import { Large, Small } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { useInstructor } from "@/contexts/InstructorContext";
import { VisuallyHidden } from "@/components/ui/visually-hidden";

export default function ModifyImageComponent() {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<ImageData | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  // For pagination and filtering
  const [totalImages, setTotalImages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [stats, setStats] = useState<ImageStats>({
    total: 0,
    processed: 0,
    analyzed: 0,
  });

  const { assistantId, assistantInfo } = useInstructor();

  // Function to fetch images from API
  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    if (!assistantId) return;
    try {
      const response = await getImageDocuments(assistantId, {
        page_number: currentPage,
        page_size: pageSize,
        sort_by: "chunk_index",
        sort_order: -1, // descending order (newest first)
      });

      if (response.success) {
        // Map the API response to our ImageData format
        const fetchedImages = response.documents.map(
          (doc: ImageDocument): ImageData => ({
            id: doc.id,
            url: doc.url,
            file_name: "",
            content: doc.description,
            summary: doc.description,
            created_at: new Date().toISOString(), // API might not provide this
            assistantId: assistantId,
          })
        );

        setImages(fetchedImages);
        setTotalImages(response.total_items || 0);

        // Update stats
        setStats({
          total: response.total_items || 0,
          processed: fetchedImages.filter((img: ImageData) => img.content)
            .length,
          analyzed: fetchedImages.filter((img: ImageData) => img.summary)
            .length,
        });
      } else {
        toast.error("Failed to fetch images");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to fetch images");
    } finally {
      setIsLoading(false);
    }
  }, [assistantId, currentPage, pageSize]);

  // Fetch images on initial load and when dependencies change
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Handle image upload
  const handleUpload = async (file: File) => {
    if (!assistantId) {
      toast.error("Assistant ID is missing");
      return;
    }

    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image file is too large. Maximum size is 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadImageDocument(assistantId, file);
      if (response.success) {
        toast.success("Image uploaded successfully");

        // Create a new image data object
        const newImage: ImageData = {
          id: assistantId,
          url: response.url,
          file_name: file.name,
          content: response.description || "",
          summary: "",
          created_at: new Date().toISOString(),
          assistantId: assistantId,
        };

        // Set the uploaded image to show in the dialog
        setUploadedImage(newImage);
        setShowUploadDialog(true);

        // Refresh the images list
        fetchImages();
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file input change for image upload
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  // Handle drag and drop for image upload
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  // Create image index with description
  const handleCreateIndex = async (description: string) => {
    if (!uploadedImage?.assistantId || !uploadedImage.url) {
      toast.error("Missing data for creating image index");
      return;
    }

    try {
      const response = await createImageIndex(
        uploadedImage.assistantId,
        description,
        uploadedImage.url
      );

      if (response.success) {
        toast.success("Image index created successfully");
        // Refresh the images list
        fetchImages();
        return response;
      } else {
        throw new Error("Failed to create image index");
      }
    } catch (error) {
      console.error("Error creating index:", error);
      throw error;
    }
  };

  // Close the upload dialog
  const handleCloseUploadDialog = () => {
    setShowUploadDialog(false);
    setUploadedImage(null);
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-4">
        <Large className="font-bold tracking-tight">
          Modify Images {assistantInfo?.name}
        </Large>
      </div>

      <div className="space-y-6 p-4">
        {/* Stats Section */}

        <Small className="font-bold text-primary mb-3">Image Statistics</Small>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          <StatCard title="Total Images" value={stats.total} />
          <StatCard title="Processed" value={stats.processed} />
          <StatCard title="Analyzed" value={stats.analyzed} />
        </div>
        <Separator className="my-6" />
        {/* Upload Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <Small className="font-bold text-primary mb-1">Upload Image</Small>
            <p className="text-xs text-muted-foreground">
              Max file size: 5MB | Accepted formats: JPG, PNG, GIF, WEBP
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
          <div className="flex-1">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-primary/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center py-4">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm mb-1">Drag and drop your image here</p>
                <p className="text-xs text-muted-foreground mb-3">
                  or click to browse
                </p>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                  disabled={isUploading}
                />
                <label htmlFor="imageUpload">
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isUploading}
                    asChild
                  >
                    <span>
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Browse Images
                        </>
                      )}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-6" />

        {/* Image Grid */}
        <Small className="font-bold text-primary mb-3">Your Images</Small>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading images...</span>
          </div>
        ) : images.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <ImageItem
                  key={image.id}
                  image={image}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
            {totalImages > pageSize && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {Math.ceil(totalImages / pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= Math.ceil(totalImages / pageSize)}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 text-base font-medium">No images found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your first image to get started
            </p>
          </div>
        )}

        {/* Image Detail Dialog */}
        {selectedImage && (
          <Dialog
            open={!!selectedImage}
            onOpenChange={(open) => !open && setSelectedImage(null)}
          >
            <DialogContent>
              <DialogHeader>
                <VisuallyHidden>
                  <DialogTitle>{"Image Details:"}</DialogTitle>
                </VisuallyHidden>
              </DialogHeader>
              <ImageDetail image={selectedImage} />
            </DialogContent>
          </Dialog>
        )}

        {/* Upload Dialog for Image Description and Index Creation */}
        {uploadedImage && (
          <UploadDialog
            image={uploadedImage}
            isOpen={showUploadDialog}
            onClose={handleCloseUploadDialog}
            onCreateIndex={handleCreateIndex}
          />
        )}
      </div>
    </div>
  );
}
