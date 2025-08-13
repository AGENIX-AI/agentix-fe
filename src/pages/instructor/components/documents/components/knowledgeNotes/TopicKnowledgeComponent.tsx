import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { getOwnDocuments } from "@/api/documents";
import type { NoteCollection } from "@/api/documents/note-collections";

import { NoteCollectionsTable } from "./NoteCollectionsTable";
import { AddKnowledgeChunkSidebar } from "./AddKnowledgeChunkSidebar";
import { Small } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopicKnowledgeDetails from "./topic-knowledge-details";

// Custom hook for fetching note collections
const useNoteCollections = (refreshTrigger: number) => {
  const [collections, setCollections] = useState<NoteCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const fetchCollections = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getOwnDocuments({
        page_number: 1,
        page_size: 50,
        search: "",
        type: "note_collection",
        sort_by: "created_at",
        sort_order: 1,
      });

      if (response.success) {
        const mappedCollections: NoteCollection[] = response.documents.map(
          (doc) => ({
            id: doc.id,
            user_id: doc.user_id,
            title: doc.title,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
            type: "note_collection",
          })
        );
        setCollections(mappedCollections);
      }
    } catch (error) {
      console.error("Error fetching note collections:", error);
      toast.error(t("documents.knowledgeNotes.failedToFetchCollections"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections, refreshTrigger]);

  return { collections, isLoading, refetch: fetchCollections };
};

interface TopicKnowledgeComponentProps {
  refreshTrigger?: number;
  onAddTopicKnowledge?: () => void;
}

export function TopicKnowledgeComponent({
  refreshTrigger = 0,
  onAddTopicKnowledge,
}: TopicKnowledgeComponentProps) {
  const { t } = useTranslation();
  const { collections, isLoading } = useNoteCollections(refreshTrigger);

  const [selectedCollection, setSelectedCollection] =
    useState<NoteCollection | null>(null);
  const [showAddDocumentSidebar, setShowAddDocumentSidebar] = useState(false);

  const handleCollectionSelect = useCallback((collection: NoteCollection) => {
    setSelectedCollection(collection);
  }, []);

  const handleBackFromDetails = useCallback(() => {
    setSelectedCollection(null);
  }, []);

  const handleAddDocumentClose = useCallback(() => {
    setShowAddDocumentSidebar(false);
  }, []);

  const handleAddDocumentSuccess = useCallback(() => {
    setShowAddDocumentSidebar(false);
  }, []);

  // Render collections list
  const renderCollectionsList = () => (
    <>
      <div className="mb-3 flex items-center justify-between">
        <Small className="font-semibold">
          {t("documents.knowledgeNotes.title")}
        </Small>
        <Button
          onClick={onAddTopicKnowledge}
          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3 mr-1" />
          {t("documents.knowledgeNotes.add")}
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("documents.knowledgeNotes.searchPlaceholder")}
            className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="w-full">
          <NoteCollectionsTable
            collections={collections}
            onCollectionSelect={handleCollectionSelect}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  );

  // Render add document sidebar
  const renderAddDocumentSidebar = () => {
    if (!showAddDocumentSidebar || !selectedCollection) return null;

    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="absolute inset-0 bg-black/20"
          onClick={handleAddDocumentClose}
        />
        <div className="relative ml-auto w-[500px] bg-background border-l shadow-xl h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b h-18">
            <h2 className="text-lg font-semibold">Add Document</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddDocumentClose}
              className="text-xs"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AddKnowledgeChunkSidebar
              isVisible={true}
              topicKnowledgeId={selectedCollection.id}
              onClose={handleAddDocumentClose}
              onSuccess={handleAddDocumentSuccess}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {!selectedCollection ? (
          renderCollectionsList()
        ) : (
          <TopicKnowledgeDetails
            collection={selectedCollection}
            onBack={handleBackFromDetails}
          />
        )}
      </div>

      {renderAddDocumentSidebar()}
    </div>
  );
}
