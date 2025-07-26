import { useState, useEffect } from "react";
import { MediaItems } from "./MediaItems";
import { useInstructor } from "@/contexts/InstructorContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getImageDocument } from "@/api/documents";
import type { ImageDocument } from "@/api/documents";
import { toast } from "sonner";

interface MediaItemsDetailsProps {
  setShowDetails: (show: boolean) => void;
}

export default function MediaItemsDetails({
  setShowDetails,
}: MediaItemsDetailsProps) {
  const { metaData } = useInstructor();
  const [isLoading, setIsLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<ImageDocument[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchMediaItems = async () => {
      if (!metaData.currentMediaCollectionId) return;

      setIsLoading(true);
      try {
        const response = await getImageDocument(
          metaData.currentMediaCollectionId,
          {
            page_number: 1,
            page_size: 20,
            sort_by: "created_at",
            sort_order: -1,
          }
        );

        if (response.success) {
          setMediaItems(response.documents);
          setTotalItems(response.total_items);
        } else {
          toast.error("Failed to fetch media items");
        }
      } catch (error) {
        console.error("Error fetching media items:", error);
        toast.error("An error occurred while fetching media items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaItems();
  }, [metaData.currentMediaCollectionId]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(false)}
            className="flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <MediaItems
          mediaCollectionId={metaData.currentMediaCollectionId}
          initialMediaItems={mediaItems}
          initialTotalItems={totalItems}
          isInitialLoading={isLoading}
        />
      </div>
    </div>
  );
}
