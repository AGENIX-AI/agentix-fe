import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentsTab from "./components/documentsTab/add-document";
import KnowledgeNotesTab from "./components/KnowledgeNotesTab";
import { MediaTab } from "./components/MediaTab";
// import { AssistantKnowledgeTab } from "./components/AssistantKnowledgeTab";
import WebDerivedKnowledgeTab from "./components/WebDerivedKnowledgeTab";
import { useInstructor } from "@/contexts/InstructorContext";

export interface DocumentsLayoutProps {
  defaultTab?:
    | "documents"
    | "knowledge-notes"
    | "media"
    // | "assistant-knowledge"
    | "online-sources";
}

export function DocumentsLayout({
  defaultTab = "documents",
}: DocumentsLayoutProps) {
  const { setRightPanel } = useInstructor();
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Tabs
        defaultValue={activeTab}
        value={activeTab}
        className="h-full flex flex-col w-full"
        onValueChange={(value) => {
          setActiveTab(value as any);
          setRightPanel(value as any);
        }}
      >
        <div className="px-6 pt-4">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="knowledge-notes">Notes</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            {/* <TabsTrigger value="assistant-knowledge">Assistant</TabsTrigger> */}
            <TabsTrigger value="online-sources">Online Sources</TabsTrigger>
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

          {/* <TabsContent value="assistant-knowledge" className="mt-0 h-full">
            <AssistantKnowledgeTab />
          </TabsContent> */}

          <TabsContent value="online-sources" className="mt-0 h-full">
            <WebDerivedKnowledgeTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default DocumentsLayout;
