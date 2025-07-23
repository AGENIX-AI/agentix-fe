import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentsTab from "./components/documentsTab/add-document";
import KnowledgeNotesTab from "./components/KnowledgeNotesTab";
import { MediaTab } from "./components/MediaTab";
import { AssistantKnowledgeTab } from "./components/AssistantKnowledgeTab";

export interface DocumentsLayoutProps {
  defaultTab?:
    | "documents"
    | "knowledge-notes"
    | "media"
    | "assistant-knowledge";
}

export function DocumentsLayout({
  defaultTab = "documents",
}: DocumentsLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        className="w-full h-full flex flex-col"
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <div className="px-6 pt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="knowledge-notes">Knowledge Notes</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="assistant-knowledge">
              Assistant Knowledge
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <TabsContent value="documents" className="mt-0 h-full">
            <DocumentsTab />
          </TabsContent>

          <TabsContent value="knowledge-notes" className="mt-0 h-full">
            <KnowledgeNotesTab />
          </TabsContent>

          <TabsContent value="media" className="mt-0 h-full">
            <MediaTab />
          </TabsContent>

          <TabsContent value="assistant-knowledge" className="mt-0 h-full">
            <AssistantKnowledgeTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default DocumentsLayout;
