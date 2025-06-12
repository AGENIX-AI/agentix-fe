import { Large } from "@/components/ui/typography";
import { useState, useRef, useEffect } from "react";
import type { DragEvent, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Check, AlertCircle } from "lucide-react";
import {
  uploadDocument,
  createImageIndex,
  uploadDocumentFile,
} from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Response type for image upload
interface ImageUploadResponse {
  success: boolean;
  description: string;
  title: string;
  url: string;
}

// Response types are defined inline where needed

export default function AddDocument() {
  // Get the assistant ID from URL parameters
  const { assistantId } = useInstructor();

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [uploadResponse, setUploadResponse] =
    useState<ImageUploadResponse | null>(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [isParse, setIsParse] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Allowed file types
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];
  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "text/markdown",
  ];

  const validateFile = (file: File): boolean => {
    const fileType = file.type;

    if (allowedImageTypes.includes(fileType)) {
      console.log("File type: Image");
      return true;
    } else if (allowedDocumentTypes.includes(fileType)) {
      console.log("File type: Document");
      return true;
    } else {
      setError("Only images, PDFs, DOC files, and Markdown files are allowed");
      console.error("Invalid file type:", fileType);
      return false;
    }
  };

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

  const handleSubmit = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if the file is an image or a document
      const isImage = file.type.startsWith("image/");

      if (isImage) {
        // Handle image upload
        const data = await uploadDocument(file);

        if (data.success) {
          setUploadResponse(data);
          setTitle(data.title);
          setDescription(data.description);
          setImageDialogOpen(true);
        } else {
          throw new Error("Upload failed");
        }
      } else {
        // For documents, open the document dialog with the file name as default title
        setDocumentTitle(file.name.split(".")[0] || "Document");
        setDocumentDialogOpen(true);
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageDialogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!uploadResponse?.url) {
        throw new Error("Missing image URL");
      }

      // Ensure assistantId is always a string
      const currentAssistantId = assistantId || "default-assistant-id";

      // Call the API to create an image index
      const result = await createImageIndex(
        currentAssistantId,
        description,
        title,
        uploadResponse.url
      );

      console.log("Image index created:", result);

      if (result.success) {
        // Close the dialog on success
        setImageDialogOpen(false);
        // Reset the form
        setFile(null);
        // Show success message
        setSuccessMessage("Image document successfully added!");
      } else {
        throw new Error("Failed to create image index");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to save document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentDialogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!file) {
        throw new Error("Missing document file");
      }
      if (!assistantId) {
        throw new Error("Missing assistant ID");
      }

      // Call the API to upload the document
      const result = await uploadDocumentFile(
        file,
        documentTitle || "Untitled Document", // Ensure title is never null
        isParse,
        assistantId
      );

      console.log("Document uploaded:", result);

      if (result.success) {
        // Close the dialog on success
        setDocumentDialogOpen(false);
        // Reset the form
        setFile(null);
        // Show success message
        setSuccessMessage("Document successfully uploaded!");
      } else {
        throw new Error("Failed to upload document");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Failed to upload document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-6">
        <Large className="font-bold tracking-tight">Add Document</Large>
      </div>

      <div className="p-6">
        {successMessage && (
          <div className="bg-green-100 border border-green-200 text-green-800 rounded-md p-2 mb-4 text-xs flex items-center">
            <Check className="h-4 w-4 mr-2" />
            {successMessage}
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
          <div className="flex flex-col p-4 space-y-2">
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground">
                Upload your learning materials to share with students. Accepted
                formats: images, PDF, DOC, and Markdown.
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
                  Drag and drop your file here
                </p>
                <p className="text-xs text-muted-foreground mb-2">or</p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.md,.markdown"
                />

                <Button
                  onClick={handleButtonClick}
                  variant="outline"
                  size="sm"
                  className="bg-background hover:bg-accent/50 transition-colors"
                >
                  Browse files
                </Button>
              </div>

              {error && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-md flex items-center space-x-2">
                  <AlertCircle size={12} className="text-destructive" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
            </div>

            <Separator className="my-2 bg-border/50" />

            {file && (
              <div className="w-full space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-3 bg-primary rounded-full"></div>
                  <p className="text-xs font-medium">Selected Document</p>
                </div>

                <div className="flex items-start space-x-6 p-3 border rounded-md bg-accent/5 hover:bg-accent/10 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-md shadow-sm">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-accent rounded">
                        <p className="text-xs uppercase font-bold text-primary/70">
                          {file.name.split(".").pop()}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-medium">{file.name}</p>
                      <span className="px-2 py-0.5 bg-success/10 text-success-foreground rounded-full text-[10px] font-medium">
                        {file.type.startsWith("image/") ? "Image" : "Document"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        className="text-xs h-7 px-3 bg-success hover:bg-success/90 text-success-foreground"
                        onClick={handleSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? "Uploading..." : "Submit Document"}
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator className="my-2 bg-border/50" />
              </div>
            )}

            <div className="w-full space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-3 bg-muted-foreground/50 rounded-full"></div>
                <p className="text-xs font-medium">Document Guidelines</p>
              </div>

              <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
                <div className="p-3 border border-border/80 rounded-md flex-1 bg-accent/5 hover:bg-accent/10 transition-colors">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-2 bg-primary/70 rounded-full"></div>
                    <p className="text-xs font-medium">Accepted File Types</p>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 pl-2">
                    <li className="flex items-center space-x-1">
                      <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                      <span>Images (JPG, PNG, GIF, WebP)</span>
                    </li>
                    <li className="flex items-center space-x-1">
                      <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                      <span>Documents (PDF, DOC, DOCX)</span>
                    </li>
                    <li className="flex items-center space-x-1">
                      <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                      <span>Markdown (.md, .markdown)</span>
                    </li>
                  </ul>
                </div>

                <div className="p-3 border border-border/80 rounded-md flex-1 bg-accent/5 hover:bg-accent/10 transition-colors">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-1 h-2 bg-primary/70 rounded-full"></div>
                    <p className="text-xs font-medium">Size Limits</p>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 pl-2">
                    <li className="flex items-center space-x-1">
                      <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                      <span>Maximum file size: 10MB</span>
                    </li>
                    <li className="flex items-center space-x-1">
                      <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                      <span>Recommended image resolution: 1920×1080</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleImageDialogSubmit} className="space-y-4">
            <div className="grid gap-4 py-2">
              {uploadResponse?.url && (
                <div className="flex flex-col items-center space-y-2 mb-2">
                  <div className="relative w-full max-w-sm mx-auto">
                    <img
                      src={uploadResponse.url}
                      alt="Uploaded document"
                      className="w-full h-auto rounded-md object-cover border border-border"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImageDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Document Upload Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleDocumentDialogSubmit} className="space-y-4">
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="documentTitle" className="text-xs">
                  Title
                </Label>
                <Input
                  id="documentTitle"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isParse"
                  checked={isParse}
                  onCheckedChange={(checked) => setIsParse(checked === true)}
                />
                <Label htmlFor="isParse" className="text-xs cursor-pointer">
                  Parse document content
                </Label>
              </div>

              {file && (
                <div className="p-3 border rounded-md bg-accent/5">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 flex items-center justify-center bg-accent rounded">
                      <p className="text-xs uppercase font-bold text-primary/70">
                        {file.name.split(".").pop()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDocumentDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Upload Document"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
