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
  assistantId: string | null;
  setAssistantId: (id: string | null) => void;
  assistantInfo: AssistantInfo | null;
  setAssistantInfo: (info: AssistantInfo | null) => void;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  rightPanel: string;
  setRightPanel: (panel: string) => void;
  instructorId: string | null;
  setInstructorId: (id: string | null) => void;

  isChatLoading: boolean;
  setIsChatLoading: (loading: boolean) => void;
}

const StudentContext = createContext<AppPageContextType | undefined>(undefined);

export function StudentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize state from localStorage if available
  const getInitialState = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("student_state");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          // ignore parse error
        }
      }
    }
    return {
      assistantId: null,
      conversationId: null,
      rightPanel: "findInstructor",
    };
  };
  const initialState = getInitialState();

  const [assistantId, setAssistantId] = useState<string | null>(
    initialState.assistantId
  );
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(
    null
  );
  const [conversationId, setConversationId] = useState<string | null>(
    initialState.conversationId
  );
  const [rightPanel, setRightPanel] = useState<string>(initialState.rightPanel);
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

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
      // fetchAssistantData();
    } else {
      setAssistantInfo(null);
    }
  }, [assistantId, fetchAssistantData]);

  useEffect(() => {
    const state = {
      assistantId,
      conversationId,
      rightPanel,
    };
    localStorage.setItem("student_state", JSON.stringify(state));
    console.log("student_state", state);
  }, [rightPanel, conversationId, assistantId]);

  return (
    <StudentContext.Provider
      value={{
        assistantId,
        setAssistantId,
        assistantInfo,
        setAssistantInfo,
        conversationId,
        setConversationId,
        rightPanel,
        setRightPanel,

        instructorId,
        setInstructorId,
        isChatLoading,
        setIsChatLoading,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error("useStudent must be used within a StudentContext");
  }
  return context;
}
