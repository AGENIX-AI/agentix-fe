import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { HelpMainTopic, HelpTopic } from "@/api/admin/helpCenter";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpContentSidebar } from "./HelpContentSidebar";

interface HelpsProps {
  fetchHelpMainTopics: () => Promise<HelpMainTopic[]>;
  fetchHelpTopicsByMainId: (id: string) => Promise<HelpTopic[]>;
  fetchHelpTopic: (id: string) => Promise<HelpTopic>;
}

export const Helps = ({
  fetchHelpMainTopics,
  fetchHelpTopicsByMainId,
  fetchHelpTopic,
}: HelpsProps) => {
  const { t } = useTranslation();
  const [helpMainTopics, setHelpMainTopics] = useState<HelpMainTopic[]>([]);
  const [helpTopicsMap, setHelpTopicsMap] = useState<
    Record<string, HelpTopic[]>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [loadingTopics, setLoadingTopics] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        setIsLoading(true);
        const mainTopics = await fetchHelpMainTopics();

        // Sort by order
        const sortedMainTopics = mainTopics.sort((a, b) => a.order - b.order);
        setHelpMainTopics(sortedMainTopics);

        // Initialize expanded state for each main topic
        const initialExpandedState: Record<string, boolean> = {};
        sortedMainTopics.forEach((topic) => {
          initialExpandedState[topic.id] = false;
        });
        setExpandedTopics(initialExpandedState);

        setError(null);
      } catch (err) {
        setError(
          t(
            "help.fetch_failed",
            "Failed to fetch help topics. Please try again later."
          )
        );
        console.error("Error fetching help topics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHelpData();
  }, []);

  const loadTopicsForMainTopic = async (mainTopicId: string) => {
    if (helpTopicsMap[mainTopicId]) {
      return; // Already loaded
    }

    try {
      setLoadingTopics((prev) => ({ ...prev, [mainTopicId]: true }));
      const topics = await fetchHelpTopicsByMainId(mainTopicId);

      // Sort by order
      const sortedTopics = topics.sort((a, b) => a.order - b.order);
      setHelpTopicsMap((prev) => ({ ...prev, [mainTopicId]: sortedTopics }));
    } catch (err) {
      console.error("Error fetching topics for main topic:", err);
      setError(
        t(
          "help.load_topics_failed",
          "Failed to load topics. Please try again later."
        )
      );
    } finally {
      setLoadingTopics((prev) => ({ ...prev, [mainTopicId]: false }));
    }
  };

  const toggleTopic = async (mainTopicId: string) => {
    const isCurrentlyExpanded = expandedTopics[mainTopicId];

    if (!isCurrentlyExpanded) {
      // Load topics before expanding
      await loadTopicsForMainTopic(mainTopicId);
    }

    setExpandedTopics((prev) => ({
      ...prev,
      [mainTopicId]: !prev[mainTopicId],
    }));
  };

  const handleChildTopicClick = (topicId: string) => {
    setSelectedTopicId(topicId);
    setShowSidebar(true);
  };

  // Function to refresh help data
  const refreshHelpData = async () => {
    setIsLoading(true);
    setHelpTopicsMap({});
    try {
      const mainTopics = await fetchHelpMainTopics();
      const sortedMainTopics = mainTopics.sort((a, b) => a.order - b.order);
      setHelpMainTopics(sortedMainTopics);

      // Reset expanded state
      const initialExpandedState: Record<string, boolean> = {};
      sortedMainTopics.forEach((topic) => {
        initialExpandedState[topic.id] = false;
      });
      setExpandedTopics(initialExpandedState);

      setError(null);
    } catch (err) {
      setError(
        t(
          "help.refresh_failed",
          "Failed to refresh help topics. Please try again later."
        )
      );
      console.error("Error refreshing help topics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-4 overflow-y-auto">
        {error && (
          <div className="text-destructive text-xs p-2 bg-destructive/10 rounded">
            {error}
            <button
              onClick={refreshHelpData}
              className="ml-2 underline hover:no-underline"
            >
              {t("common.retry", "Retry")}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {helpMainTopics.map((mainTopic) => (
              <div key={mainTopic.id} className="border rounded-lg">
                <button
                  onClick={() => toggleTopic(mainTopic.id)}
                  className="w-full p-4 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium text-left">
                    {mainTopic.title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      expandedTopics[mainTopic.id] && "rotate-180"
                    )}
                  />
                </button>

                {expandedTopics[mainTopic.id] && (
                  <div className="border-t bg-secondary/5 rounded-b-lg">
                    {loadingTopics[mainTopic.id] ? (
                      <div className="p-4 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : helpTopicsMap[mainTopic.id]?.length > 0 ? (
                      helpTopicsMap[mainTopic.id].map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleChildTopicClick(topic.id)}
                          className="w-full p-3 text-left hover:bg-muted transition-colors border-b last:border-b-0 last:rounded-lg cursor-pointer"
                        >
                          <span className="text-xs text-foreground">
                            {topic.title}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-xs text-foreground text-center">
                        {t("help.no_topics", "No topics available")}
                      </div>
                    )}
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
        topicId={selectedTopicId}
        fetchHelpTopic={fetchHelpTopic}
      />
    </div>
  );
};
