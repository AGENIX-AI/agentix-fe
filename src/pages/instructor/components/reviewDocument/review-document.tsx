import { useInstructor } from "@/contexts/InstructorContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Wand2, Save, Upload } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
// No import is required in the WebPack.
import "@uiw/react-md-editor/markdown-editor.css";
// No import is required in the WebPack.
import "@uiw/react-markdown-preview/markdown.css";

import {
  getMarkdownFile,
  editDocument,
  magicEditDocument,
  submitLearningDocument,
} from "@/api/documents/markdown";

export default function ReviewDocument() {
  const { metaData, conversationId } = useInstructor();
  const [documentPath, setDocumentPath] = useState<string>("");
  // We only need editableContent since we're using MDEditor directly
  const [editableContent, setEditableContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [magicPrompt, setMagicPrompt] = useState<string>("");
  const [isMagicProcessing, setIsMagicProcessing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch document content when document path changes
  useEffect(() => {
    if (metaData?.reviewDocumentPath) {
      setDocumentPath(metaData.reviewDocumentPath);
      fetchDocumentContent(metaData.reviewDocumentPath);
    }
  }, [metaData?.reviewDocumentPath]);

  // Fetch document content
  const fetchDocumentContent = async (path: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await getMarkdownFile(path);

      if (response.success) {
        setEditableContent(response.content.trim());
      } else {
        setError("Failed to fetch document content");
      }
    } catch (error) {
      console.error("Error fetching document content:", error);
      setError("Failed to fetch document content");
    } finally {
      setIsLoading(false);
    }
  };

  // Save direct edits
  const saveChanges = async () => {
    if (!documentPath) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await editDocument(documentPath, editableContent);

      if (response.success) {
        // Update successful, no additional state update needed
      } else {
        throw new Error("Failed to save document");
      }
    } catch (error) {
      console.error("Error saving document:", error);
      setError("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle magic prompt change
  const handleMagicPromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMagicPrompt(e.target.value);
  };

  // Process magic edit
  const processMagicEdit = async () => {
    if (!documentPath || !magicPrompt.trim()) return;

    setIsMagicProcessing(true);
    setError(null);

    try {
      const response = await magicEditDocument(documentPath, magicPrompt);

      if (response.success) {
        setEditableContent(response.new_content);
        setMagicPrompt("");
      } else {
        throw new Error("Failed to process magic edit");
      }
    } catch (error) {
      console.error("Error processing magic edit:", error);
      setError("Failed to process magic edit");
    } finally {
      setIsMagicProcessing(false);
    }
  };

  // Submit document
  const submitDocument = async () => {
    if (!documentPath || !conversationId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitLearningDocument(
        documentPath,
        conversationId
      );

      if (!response.success) {
        throw new Error("Failed to submit document");
      }
    } catch (error) {
      console.error("Error submitting document:", error);
      setError("Failed to submit document");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading document...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Document Editor</h2>
        {/* {documentPath && (
          <p className="text-sm text-muted-foreground truncate max-w-[50%]">
            {documentPath}
          </p>
        )} */}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading document...</span>
        </div>
      ) : (
        <div
          className="w-full flex-1 flex flex-col text-xs"
          style={{ minHeight: 0 }}
        >
          <div className="flex-1 overflow-hidden" data-color-mode="light">
            <MDEditor
              value={editableContent}
              onChange={(value) => setEditableContent(value || "")}
              height="100%"
              preview="edit"
              style={{
                fontSize: "0.75rem !important",
              }}
            />
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <Input
                id="magic-prompt"
                placeholder="Enter prompt for AI magic edit..."
                value={magicPrompt}
                onChange={handleMagicPromptChange}
              />
            </div>
            <Button
              onClick={processMagicEdit}
              disabled={isMagicProcessing || !magicPrompt.trim()}
              className="whitespace-nowrap w-[140px]"
              variant="outline"
            >
              {isMagicProcessing ? (
                <>
                  <Loader2 size={14} className="mr-1 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 size={14} className="mr-1" />
                  Magic Edit
                </>
              )}
            </Button>
            <Button
              onClick={saveChanges}
              disabled={isSaving}
              className="w-[140px]"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} className="mr-1" />
                  Save
                </>
              )}
            </Button>
            <Button
              onClick={submitDocument}
              disabled={isSubmitting}
              className="w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="mr-1 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload size={14} className="mr-1" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
