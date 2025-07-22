import { useState, useEffect, useRef, memo } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { useInstructor } from "@/contexts/InstructorContext";
import {
  getInstructorListConversations,
  createInstructorFirstConversation,
} from "@/api/conversations";
import type { ConversationListItem } from "@/lib/utils/types/conversation";
import { eventBus } from "@/lib/utils/event/eventBus";
import { ConversationItem } from "./ConversationItem";

interface LearningTopicBlockProps {
  searchQuery: string;
  setIsChatLoading: (loading: boolean) => void;
  learningTopicsData?: ConversationListItem[];
  assistantId: string | null;
}

function LearningTopicBlockComponent({
  searchQuery,
  setIsChatLoading,
  learningTopicsData,
  assistantId,
}: LearningTopicBlockProps) {
  const { setAssistantId, setConversationId, setRightPanel, isChatLoading } =
    useInstructor();

  const [learningTopics, setLearningTopics] = useState<ConversationListItem[]>(
    learningTopicsData || []
  );
  const learningTopicsRef = useRef<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(learningTopicsData ? false : true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;

  // Update local state when prop changes
  useEffect(() => {
    if (learningTopicsData) {
      setLearningTopics(learningTopicsData);
      learningTopicsRef.current = learningTopicsData;
      setIsLoading(false);
    }
  }, [learningTopicsData]);

  // Display loading state for the component
  const showLoadingState = isLoading && learningTopics.length === 0;

  const fetchLearningTopics = async (search?: string, page: number = 1) => {
    try {
      setIsLoading(true);
      console.log("fetchLearningTopics");
      const response = await getInstructorListConversations(
        page,
        pageSize,
        "created_at",
        1,
        search,
        "Learning Topic"
      );
      if (response.success) {
        setLearningTopics(response.conversations);
        learningTopicsRef.current = response.conversations;
        setCurrentPage(response.page_number);
      }
    } catch (error) {
      console.error("Failed to fetch learning topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch if no data provided
  useEffect(() => {
    if (!learningTopicsData) {
      fetchLearningTopics();
    }
  }, []);

  // Handle search queries
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        fetchLearningTopics(searchQuery, 1);
      }, 300); // Debounce search requests

      return () => clearTimeout(timeoutId);
    } else {
      // If no search query and no initial data, fetch without search
      if (!learningTopicsData && !isLoading) {
        fetchLearningTopics();
      }
    }
  }, [searchQuery]);

  // Listen for conversation updates
  useEffect(() => {
    const conversationUpdateUnsubscribe = eventBus.on(
      "conversation-update",
      (data) => {
        console.log(
          "LearningTopicBlock received conversation-update event:",
          data
        );

        setLearningTopics((prevTopics) => {
          // Find the conversation that was updated by conversationId
          const updatedTopicIndex = prevTopics.findIndex(
            (topic) => topic.id === data.conversationId
          );

          if (updatedTopicIndex === -1) {
            return prevTopics;
          }

          // Create a new array with the updated topic
          const newTopics = [...prevTopics];

          // Update the topic with new last_message
          const updatedTopic = {
            ...newTopics[updatedTopicIndex],
            last_message: data.lastMessage,
          };

          // Remove the topic from its current position
          newTopics.splice(updatedTopicIndex, 1);

          // Add it to the beginning of the array (move to top)
          newTopics.unshift(updatedTopic);

          return newTopics;
        });

        // Also update the reference
        const updatedTopicIndex = learningTopicsRef.current.findIndex(
          (topic) => topic.id === data.conversationId
        );

        if (updatedTopicIndex !== -1) {
          const updatedTopic = {
            ...learningTopicsRef.current[updatedTopicIndex],
            last_message: data.lastMessage,
          };

          learningTopicsRef.current.splice(updatedTopicIndex, 1);
          learningTopicsRef.current.unshift(updatedTopic);
        }
      }
    );

    // Listen for reload-history event to refresh the topic list
    const reloadHistoryUnsubscribe = eventBus.on("reload-history", () => {
      console.log("LearningTopicBlock received reload-history event");

      // Fetch topics to refresh the list
      fetchLearningTopics(searchQuery, currentPage);
    });

    return () => {
      conversationUpdateUnsubscribe();
      reloadHistoryUnsubscribe();
    };
  }, [searchQuery, currentPage]);

  const handleTopicClick = async (topic: ConversationListItem) => {
    // Prevent actions if messages are currently loading
    if (isChatLoading) {
      return;
    }
    setIsChatLoading(true);

    // Set assistant ID from the topic
    setAssistantId(topic.assistants?.id);

    if (topic && topic.id) {
      // If this is an existing topic with details
      setConversationId(topic.id);
    } else {
      // Create a new conversation if no conversation ID exists
      try {
        if (topic.assistants?.id) {
          const response = await createInstructorFirstConversation(
            topic.assistants.id
          );
          console.log(
            "Conversation created with ID:",
            response.conversation_id
          );
          setConversationId(response.conversation_id);

          // Emit reload-history event to refresh the topic list
          eventBus.emit("reload-history", {
            assistantId: topic.assistants.id,
            conversationId: response.conversation_id,
          });
        } else {
          // Reset states for a new conversation
          setConversationId(null);
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
        setConversationId(null);
      }
    }

    // Change the right panel to assistantTopics
    setRightPanel("assistantTopics");
    setIsChatLoading(false);
  };

  if (showLoadingState) {
    return (
      <LoadingState
        message="Loading learning topics..."
        size="medium"
        className="h-32"
      />
    );
  }

  return (
    <div className="">
      {learningTopics.length > 0 ? (
        learningTopics.map((topic: ConversationListItem) => (
          <div key={topic.id}>
            <ConversationItem
              conversation={topic}
              onClick={handleTopicClick}
              assistantId={assistantId}
              isLearningTopic={true}
            />
          </div>
        ))
      ) : (
        <div className="text-xs text-muted-foreground p-2">
          No learning topics available
        </div>
      )}
    </div>
  );
}

export const LearningTopicBlock = memo(LearningTopicBlockComponent);
