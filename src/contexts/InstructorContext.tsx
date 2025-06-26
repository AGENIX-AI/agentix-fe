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

interface AppPageContextType {
  isHistoryVisible: boolean;
  toggleHistory: () => void;
  assistantId: string | null;
  setAssistantId: (id: string | null) => void;
  assistantInfo: AssistantInfo | null;
  setAssistantInfo: (info: AssistantInfo | null) => void;
  fetchAssistantData: () => void;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;

  rightPanel: string;
  setRightPanel: (panel: string) => void;
  instructorId: string | null;
  setInstructorId: (id: string | null) => void;
  isChatLoading: boolean;
  setIsChatLoading: (loading: boolean) => void;
  characterInfo?: {
    name: string;
  };
  metaData: any;
  setMetaData: (metaData: any) => void;
}

const InstructorContext = createContext<AppPageContextType | undefined>(
  undefined
);

export function InstructorContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const savedState = getFromLocalStorage("edvara-app-state");
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(
    null
  );
  const [conversationId, setConversationId] = useState<string | null>(null);

  const [rightPanel, setRightPanel] = useState("dashboard");
  const [instructorId, setInstructorId] = useState<string | null>(null);

  const [metaData, setMetaData] = useState<any>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible);
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

  return (
    <InstructorContext.Provider
      value={{
        isHistoryVisible,
        toggleHistory,
        assistantId,
        setAssistantId,
        assistantInfo,
        setAssistantInfo,
        fetchAssistantData,
        conversationId,
        setConversationId,
        rightPanel,
        setRightPanel,

        instructorId,
        setInstructorId,
        isChatLoading,
        setIsChatLoading,
        metaData,
        setMetaData,
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
