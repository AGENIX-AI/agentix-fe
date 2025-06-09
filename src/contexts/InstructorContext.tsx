import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
// import { getConversationById } from "@repo/api/src/external";
import { getAssistantById } from "@/api/assistants";

interface Personality {
  id: string;
  voice: string;
  created_at: string;
  mood_style: number;
  assistant_id: string;
  formality_style: number;
  instruction_style: number;
  assertiveness_style: number;
  communication_style: number;
  response_length_style: number;
}

interface AssistantInfo {
  id: string;
  name: string;
  image: string;
  tagline: string;
  description: string;
  speciality: string | null;
  owner_id: string;
  base_stream_name: string | null;
  updated_at: string;
  role: string;
  language: string;
  created_at: string;
  personality: Personality;
}

interface LastMessage {
  characterId: string;
  content: string;
  timestamp: number;
  sender_email: string;
}

interface ConversationInfo {
  id: string;
  stream_id: string;
  topic_name: string;
  language: string;
  status: number;
  type: number;
  created_at: string;
  updated_at: string;
  last_message?: LastMessage;
}

interface AppPageContextType {
  isHistoryVisible: boolean;
  toggleHistory: () => void;
  assistantId: string | null;
  setAssistantId: (id: string | null) => void;
  assistantInfo: AssistantInfo | null;
  setAssistantInfo: (info: AssistantInfo | null) => void;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  conversationInfo: ConversationInfo | null;
  isTasksVisible: boolean;
  toggleTasks: () => void;
  rightPanel: string;
  setRightPanel: (panel: string) => void;
  chatPanel: string;
  setChatPanel: (panel: string) => void;
  instructorId: string | null;
  setInstructorId: (id: string | null) => void;
  isMessageLoading: boolean;
  setIsMessageLoading: (loading: boolean) => void;
  isChatLoading: boolean;
  setIsChatLoading: (loading: boolean) => void;
}

const InstructorContext = createContext<AppPageContextType | undefined>(
  undefined
);

// function saveToLocalStorage(key: string, data: any) {
//   if (typeof window !== "undefined") {
//     localStorage.setItem(key, JSON.stringify(data));
//   }
// }

// function getFromLocalStorage(key: string) {
//   if (typeof window !== "undefined") {
//     const item = localStorage.getItem(key);
//     return item ? JSON.parse(item) : null;
//   }
//   return null;
// }

export function InstructorContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const savedState = getFromLocalStorage("edvara-app-state");
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [assistantId, setAssistantId] = useState<string | null>(
    // savedState?.assistantId || null
    null
  );
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(
    // savedState?.assistantInfo || null
    null
  );
  const [conversationId, setConversationId] = useState<string | null>(
    // savedState?.conversationId || null
    null
  );
  const [conversationInfo, setConversationInfo] =
    useState<ConversationInfo | null>(null);
  const [isTasksVisible, setIsTasksVisible] = useState(false);
  const [rightPanel, setRightPanel] = useState(
    // savedState?.rightPanel || "following_posts"
    "following_posts"
  );
  const [chatPanel, setChatPanel] = useState(
    // savedState?.chatPanel || "findInstructor"
    "findInstructor"
  );
  const [instructorId, setInstructorId] = useState<string | null>(
    // savedState?.instructorId || null
    null
  );
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  const toggleTasks = () => {
    setIsTasksVisible(!isTasksVisible);
  };

  // Define fetchAssistantData outside useEffect and memoize it with useCallback
  const fetchAssistantData = useCallback(async () => {
    if (!assistantId) {
      setAssistantInfo(null);
      return;
    }

    console.log("fetchAssistantData called with assistantId:", assistantId);

    try {
      const response = await getAssistantById(assistantId);

      if (response.success && response.assistant) {
        const assistant = response.assistant;
        setAssistantInfo(assistant as AssistantInfo);
        setInstructorId(assistant.owner_id);
      }
    } catch (error) {
      console.error("Error fetching assistant data:", error);
    }
  }, [assistantId, setAssistantInfo, setInstructorId]);

  // Fetch assistant data when assistantId changes
  useEffect(() => {
    if (assistantId) {
      fetchAssistantData();
    } else {
      setAssistantInfo(null);
    }
  }, [assistantId, fetchAssistantData]);

  // Fetch conversation data when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setConversationInfo(null);
      return;
    }

    const fetchConversationData = async () => {
      try {
        // const response = await getConversationById(conversationId);
        // if (response.success) {
        //   const newConversationInfo = {
        //     id: response.conversation_id,
        //     stream_id: response.stream_id,
        //     topic_name: response.topic_name,
        //     language: response.language,
        //     status: response.status,
        //     type: response.type,
        //     created_at: response.created_at,
        //     updated_at: response.updated_at,
        //   };
        //   setConversationInfo(newConversationInfo);
        // }
        console.log("fetchConversationData");
      } catch (error) {
        console.error("Error fetching conversation data:", error);
      }
    };

    fetchConversationData();
  }, [conversationId]);

  // useEffect(() => {
  //   const stateToSave = {
  //     assistantId,
  //     conversationId,
  //     rightPanel,
  //   };
  //   console.log("state:", stateToSave);
  //   // saveToLocalStorage("edvara-app-state", stateToSave);
  // }, [assistantId, conversationId, rightPanel]);

  return (
    <InstructorContext.Provider
      value={{
        isHistoryVisible,
        toggleHistory,
        assistantId,
        setAssistantId,
        assistantInfo,
        setAssistantInfo,
        conversationId,
        setConversationId,
        conversationInfo,
        isTasksVisible,
        toggleTasks,
        rightPanel,
        setRightPanel,
        chatPanel,
        setChatPanel,
        instructorId,
        setInstructorId,
        isMessageLoading,
        setIsMessageLoading,
        isChatLoading,
        setIsChatLoading,
      }}
    >
      {children}
    </InstructorContext.Provider>
  );
}

export function useInstructor() {
  const context = useContext(InstructorContext);
  if (context === undefined) {
    throw new Error("useInstructor must be used within an InstructorContext");
  }
  return context;
}
