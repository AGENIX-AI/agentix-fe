import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentsTab from "./components/documentsTab/add-document";
import KnowledgeNotesTab from "./components/KnowledgeNotesTab";
// import { MediaTab } from "./components/MediaTab";
import { AssistantKnowledgeTab } from "./components/AssistantKnowledgeTab";
import WebDerivedKnowledgeTab from "./components/WebDerivedKnowledgeTab";

export interface DocumentsLayoutProps {
  defaultTab?:
    | "documents"
    | "knowledge-notes"
    // | "media"
    | "assistant-knowledge"
    | "web-derived-knowledge";
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
        className="h-full flex flex-col w-full"
        onValueChange={(value) => setActiveTab(value as any)}
      >
        <div className="px-6 pt-4">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="knowledge-notes">Knowledge Notes</TabsTrigger>
            {/* <TabsTrigger value="media">Media</TabsTrigger> */}
            <TabsTrigger value="assistant-knowledge">
              Assistant Knowledge
            </TabsTrigger>
            <TabsTrigger value="web-derived-knowledge">Web derived</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <TabsContent value="documents" className="mt-0 h-full">
            <DocumentsTab />
          </TabsContent>

          <TabsContent value="knowledge-notes" className="mt-0 h-full">
            <KnowledgeNotesTab />
          </TabsContent>

          {/* <TabsContent value="media" className="mt-0 h-full">
            <MediaTab />
          </TabsContent> */}

          <TabsContent value="assistant-knowledge" className="mt-0 h-full">
            <AssistantKnowledgeTab />
          </TabsContent>

          <TabsContent value="web-derived-knowledge" className="mt-0 h-full">
            <WebDerivedKnowledgeTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default DocumentsLayout;
