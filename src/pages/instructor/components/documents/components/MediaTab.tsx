import { useState } from "react";
import { MediaCollectionsComponent } from "./media/MediaCollectionsComponent";
import { AddMediaCollectionSidebar } from "./media/AddMediaCollectionSidebar";
import { useInstructor } from "@/contexts/InstructorContext";
import MediaItemsDetails from "./media/media-items-details";

export default function MediaTab() {
  const [refreshDocuments, setRefreshDocuments] = useState(0);
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const { metaData, setMetaData } = useInstructor();
  const [showDetails, setShowDetails] = useState(false);

  const handleSidebarSuccess = () => {
    // Refresh the media collections list
    setRefreshDocuments((prev) => prev + 1);
    // Close the sidebar to show the updated list
    setShowAddSidebar(false);
    // Don't automatically navigate to details - let user see the updated list
  };

  if (showDetails) {
    return <MediaItemsDetails setShowDetails={setShowDetails} />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MediaCollectionsComponent
          refreshTrigger={refreshDocuments}
          onAddMediaCollection={() => setShowAddSidebar(true)}
          setShowDetails={setShowDetails}
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
