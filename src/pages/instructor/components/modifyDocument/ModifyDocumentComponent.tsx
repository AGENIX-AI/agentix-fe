import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Loader2, UploadCloud, FileText, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExtraSmall, Small } from "@/components/ui/typography";
import { getAssistantDocuments, type Document as ApiDocument } from "@/api/documents";
import { useInstructor } from "@/contexts/InstructorContext";

interface DocumentStats {
  total: number;
  uploaded: number;
  embedded: number;
  analyzed: number;
}

interface Document {
  id: string;
  title: string;
  url: string;
  file_name: string;
  upload_status: "pending" | "completed" | "failed" | "not_complete";
  embedding_status?: "pending" | "completed" | "failed" | "not_started";
  analysis_status?: "pending" | "completed" | "failed" | "not_started";
  created_at: string;
  number_index?: number;
}

export default function ModifyDocumentComponent() {
  const { assistantId } = useInstructor();
  const [isUploading, setIsUploading] = useState(false);
  const [formatAfterUpload, setFormatAfterUpload] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy] = useState("created_at");
  const [sortOrder] = useState(1); // 1 for ascending, -1 for descending

  // Fetch documents when assistantId, page, or search changes
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!assistantId) return;
      
      setIsLoading(true);
      try {
        const response = await getAssistantDocuments(assistantId, {
          page_number: currentPage,
          page_size: pageSize,
          sort_by: sortBy,
          sort_order: sortOrder,
          search: searchQuery || undefined,
        });
        
        if (response.success) {
          // Convert API documents to our Document interface
          const mappedDocuments: Document[] = response.documents.map((doc: ApiDocument) => ({
            id: doc.id,
            title: doc.title || doc.file_name,
            url: doc.url,
            file_name: doc.file_name,
            upload_status: doc.upload_status,
            created_at: doc.created_at,
          }));
          
          setDocuments(mappedDocuments);
          setTotalItems(response.total_items);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, [assistantId, currentPage, pageSize, sortBy, sortOrder, searchQuery]);
  
  // Calculate stats from documents
  const stats: DocumentStats = {
    total: totalItems,
    uploaded: documents.filter((doc) => doc.upload_status === "completed").length,
    embedded: documents.filter((doc) => doc.embedding_status === "completed").length || 0,
    analyzed: documents.filter((doc) => doc.analysis_status === "completed").length || 0,
  };

  // Handle drag events for the dropzone
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validFileTypes = [".pdf", ".docx", ".txt"];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      if (validFileTypes.includes(fileExtension || "")) {
        // Simulate file input change
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        if (fileInput) {
          // Create a DataTransfer object and add the file
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;

          // Trigger the change event manually
          const event = new Event("change", { bubbles: true });
          fileInput.dispatchEvent(event);
        }
      }
    }
  }, []);

  // Mock function to handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Simulate API call with setTimeout
    setTimeout(() => {
      const newDocument: Document = {
        id: `${documents.length + 1}`,
        title: file.name.split(".")[0],
        url: URL.createObjectURL(file),
        file_name: file.name,
        upload_status: "completed",
        embedding_status: formatAfterUpload ? "pending" : "not_started",
        analysis_status: "not_started",
        created_at: new Date().toISOString(),
        number_index: documents.length + 1,
      };

      setDocuments((prev) => [newDocument, ...prev]);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-20 bg-background flex items-center h-18 border-b w-full p-4">
        <h1 className="text-lg font-bold tracking-tight">
          Modify Document {document.title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {/* Stats Section */}
        <div className="space-y-3">
          <Small className="font-bold text-primary">Document Statistics</Small>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <StatCard title="Total Documents" value={stats.total} />
            <StatCard title="Uploaded" value={stats.uploaded} />
            <StatCard title="Embedded" value={stats.embedded} />
            <StatCard title="Analyzed" value={stats.analyzed} />
          </div>
        </div>

        <Separator className="my-3" />

        {/* Upload Section */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <Small className="font-bold text-primary mb-1">
                Upload Document
              </Small>
              <div className="flex items-center gap-2"> </div>
              <ExtraSmall className="text-muted-foreground">
                Max file size: 10MB | Accepted formats: PDF, DOCX, TXT
              </ExtraSmall>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="file-upload" className="cursor-pointer block">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                    "hover:border-primary hover:bg-primary/5",
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <UploadCloud className="mx-auto h-12 w-12 text-primary opacity-80" />
                  <p className="mt-3 text-sm font-medium text-primary">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, TXT (max 10MB)
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </Label>
            </div>
            <Button
              size="lg"
              className={cn(
                "w-full sm:w-auto min-h-12 px-6 text-white",
                "bg-gradient-to-r from-primary to-primary/80",
                "hover:opacity-90 active:scale-95 transition-all",
                "rounded-lg shadow-md hover:shadow-lg",
                "disabled:pointer-events-none disabled:opacity-50",
                "flex items-center justify-center gap-2"
              )}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5" />
                  <span>Upload</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative flex items-start">
              <Checkbox
                id="format-after-upload"
                checked={formatAfterUpload}
                onCheckedChange={(checked) =>
                  setFormatAfterUpload(checked as boolean)
                }
                className="rounded-sm h-5 w-5 border-2 border-primary/40 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
              <Label
                htmlFor="format-after-upload"
                className="text-sm ml-2 font-medium text-foreground cursor-pointer"
              >
                Format document after upload
              </Label>
            </div>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help hover:text-primary transition-colors" />
          </div>
        </div>

        <Separator className="my-3" />

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
        
        {/* Documents List */}
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <Small className="font-bold text-primary">Documents</Small>
            <div className="text-sm text-muted-foreground">
              {stats.total} document{stats.total !== 1 ? "s" : ""}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin" />
              <ExtraSmall className="text-gray-500 mt-2">
                Loading documents...
              </ExtraSmall>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <UploadCloud className="mx-auto h-10 w-10 text-gray-300" />
              <ExtraSmall className="text-gray-500 mt-2">
                No documents found
              </ExtraSmall>
              <ExtraSmall className="text-gray-400">
                {searchQuery ? "Try a different search term" : "Upload your first document above"}
              </ExtraSmall>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <DocumentItem key={doc.id} document={doc} />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalItems > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <Small>Items per page:</Small>
                    <select 
                      className="text-sm border rounded p-1"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <Small>
                      Page {currentPage} of {Math.ceil(totalItems / pageSize)}
                    </Small>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= Math.ceil(totalItems / pageSize)}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </Button>
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

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
    </Card>
  );
}

function DocumentItem({ document }: { document: Document }) {
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

  const StatusBadge = ({
    status,
    label,
  }: {
    status: string;
    label?: string;
  }) => (
    <span
      className={cn(
        "px-2 py-1 rounded-md text-xs font-medium border",
        getStatusColor(status)
      )}
    >
      {label ||
        status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
    </span>
  );

  return (
    <div className="border rounded-lg bg-card/50 hover:shadow-sm transition-all duration-200">
      <div className="p-4 flex flex-col md:flex-row gap-4">
        {/* Document Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{document.title}</h3>
            <StatusBadge status={document.upload_status} />
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            <span>{document.file_name}</span>
            <span>•</span>
            <span>{new Date(document.created_at).toLocaleDateString()}</span>
          </div>
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs inline-flex items-center gap-1 text-primary hover:underline"
          >
            View document
          </a>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-2 items-center">
          {document.embedding_status && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Embedding:</span>
              <StatusBadge status={document.embedding_status} />
            </div>
          )}
          {document.analysis_status && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Analysis:</span>
              <StatusBadge status={document.analysis_status} />
            </div>
          )}
          {document.number_index && (
            <div className="text-xs text-muted-foreground ml-1 md:ml-4">
              {document.number_index} chunks
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
