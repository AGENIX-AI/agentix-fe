import { useState, useEffect } from "react";
import { getHelpDocuments } from "@/api/systems";
import type { HelpDocument } from "@/api/systems";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpContentSidebar } from "./HelpContentSidebar";

export const Helps = () => {
  const [helpDocuments, setHelpDocuments] = useState<HelpDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    const fetchHelpDocuments = async () => {
      try {
        setIsLoading(true);
        const data = await getHelpDocuments();
        setHelpDocuments(data);

        // Initialize expanded state for each main topic
        const initialExpandedState: Record<string, boolean> = {};
        data.forEach((doc) => {
          initialExpandedState[doc.main_topic] = false;
        });
        setExpandedTopics(initialExpandedState);

        setError(null);
      } catch (err) {
        setError("Failed to fetch help documents. Please try again later.");
        console.error("Error fetching help documents:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpDocuments();
  }, []);

  const toggleTopic = (mainTopic: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [mainTopic]: !prev[mainTopic],
    }));
  };

  const handleChildTopicClick = (topicId: string) => {
    setSelectedTopic(topicId);
    setShowSidebar(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="overflow-y-auto p-4 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {helpDocuments.map((doc, index) => (
              <div
                key={doc.main_topic}
                className={index !== 0 ? "border-t border-gray-200" : ""}
              >
                <button
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                  onClick={() => toggleTopic(doc.main_topic)}
                >
                  <span className="font-medium text-xs">{doc.show_text}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-gray-500 transition-transform duration-200",
                      expandedTopics[doc.main_topic] && "transform rotate-180"
                    )}
                  />
                </button>

                {expandedTopics[doc.main_topic] && (
                  <div className="bg-blue-50 px-4 py-4 space-y-4">
                    {doc.children_topic.map((child) => (
                      <div
                        key={child.topic}
                        className="py-2 px-4 bg-transparent cursor-pointer transition-colors hover:text-blue-600 text-xs"
                        onClick={() => handleChildTopicClick(child.topic)}
                      >
                        {child.show_text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <HelpContentSidebar
        isVisible={showSidebar}
        onClose={() => setShowSidebar(false)}
        topicId={selectedTopic}
      />
    </div>
  );
};
