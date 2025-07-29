import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { uploadDocumentFile } from "@/api/documents";

interface DocumentUploadProps {
  onUploadSuccess: (documentId: string) => void;
  onError: (error: string) => void;
}

export default function DocumentUpload({
  onUploadSuccess,
  onError,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [isParse, setIsParse] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types
  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "text/markdown",
  ];

  const validateFile = (file: File): boolean => {
    const fileType = file.type;

    if (allowedDocumentTypes.includes(fileType)) {
      console.log("File type: Document");
      return true;
    } else {
      onError("Only PDFs, DOC files, and Markdown files are allowed");
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

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setDocumentTitle(droppedFile.name.split(".")[0] || "Document");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setDocumentTitle(selectedFile.name.split(".")[0] || "Document");
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsLoading(true);

    try {
      const result = await uploadDocumentFile(
        file,
        documentTitle || file.name.split(".")[0] || "Untitled Document",
        isParse
      );

      console.log("Document uploaded:", result);

      if (result.success) {
        onUploadSuccess(result.document_id);
        setFile(null);
        setDocumentTitle("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error("Failed to upload document");
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      onError("Failed to upload document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Upload your learning materials to share with students. Accepted formats:
          PDF, DOC, and Markdown.
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search uploaded documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-8 text-xs"
        />
      </div>

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
            className={`${isDragging ? "text-primary" : "text-primary/70"}`}
          />
        </div>
        <p className="text-xs font-medium mb-1">Drag and drop your file here</p>
        <p className="text-xs text-muted-foreground mb-2">or</p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.md,.markdown"
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

      {file && (
        <div className="w-full space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-3 bg-primary rounded-full"></div>
            <p className="text-xs font-medium">Selected Document</p>
          </div>

          <div className="flex items-start space-x-6 p-3 border rounded-md bg-accent/5 hover:bg-accent/10 transition-colors">
            <div className="p-2 bg-primary/10 rounded-md shadow-sm">
              <div className="w-10 h-10 flex items-center justify-center bg-accent rounded">
                <p className="text-xs uppercase font-bold text-primary/70">
                  {file.name.split(".").pop()}
                </p>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-medium">{file.name}</p>
                <span className="px-2 py-0.5 bg-success/10 text-success-foreground rounded-full text-[10px] font-medium">
                  Document
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>

              <div className="mt-3 space-y-2">
                <Label htmlFor="document-title" className="text-xs">
                  Document Title
                </Label>
                <Input
                  id="document-title"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="Enter document title"
                  className="h-8 text-xs"
                />
              </div>

              <div className="mt-3 flex items-center space-x-2">
                <Checkbox
                  id="parse-document"
                  checked={isParse}
                  onCheckedChange={(checked) => setIsParse(checked === true)}
                />
                <Label htmlFor="parse-document" className="text-xs">
                  Parse document content (extract text and create searchable
                  index)
                </Label>
              </div>

              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  className="text-xs h-7 px-3 bg-success hover:bg-success/90 text-success-foreground"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Submit Document"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
