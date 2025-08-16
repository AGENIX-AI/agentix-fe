import { useState } from "react";
import { MediaCollectionsComponent } from "./media/MediaCollectionsComponent";
import { AddMediaCollectionSidebar } from "./media/AddMediaCollectionSidebar";
import { useInstructor } from "@/contexts/InstructorContext";
import type { Document } from "@/api/documents";
import MediaCollectionDetails from "./media/media-collection-details";

export default function MediaTab() {
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const { metaData, setMetaData } = useInstructor();
  const [selectedCollection, setSelectedCollection] = useState<Document | null>(
    null
  );

  const handleSidebarSuccess = () => {
    // Refresh the media collections list
    setRefreshDocuments((prev) => prev + 1);
    // Close the sidebar to show the updated list
    setShowAddSidebar(false);
    // Don't automatically navigate to details - let user see the updated list
  };

  if (selectedCollection) {
    return (
      <MediaCollectionDetails
        collection={selectedCollection}
        onBack={() => setSelectedCollection(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MediaCollectionsComponent
          refreshTrigger={refreshDocuments}
          onAddMediaCollection={() => setShowAddSidebar(true)}
          onSelectCollection={(doc) => setSelectedCollection(doc)}
        />
      </div>

      <AddMediaCollectionSidebar
        isVisible={showAddSidebar}
        onClose={() => setShowAddSidebar(false)}
        onSuccess={handleSidebarSuccess}
        setMetaData={setMetaData}
        metaData={metaData}
      />
    </div>
  );
}
