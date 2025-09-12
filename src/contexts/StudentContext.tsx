import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
// import { getConversationById } from "@repo/api/src/external";
import { getAssistantById } from "@/api/assistants";
import { workspaceService } from "@/services/workspaces";
import { useAuth } from "./AuthContext";

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
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
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
      workspaceId: null,
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
  const [workspaceId, setWorkspaceId] = useState<string | null>(
    initialState.workspaceId
  );
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Ensure workspace is initialized if missing
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    const ensureWorkspaceSelected = async () => {
      if (!isAuthenticated || authLoading) return;
      if (workspaceId) return;
      try {
        const res = await workspaceService.list();
        const items = res.items || [];
        if (items.length > 0) {
          const current = items.find((w) => w.is_default) || items[0];
          setWorkspaceId(current.id);
        }
        // If no workspaces, PrivateRoute will handle redirect to onboarding
      } catch (err) {
        // Silently ignore; PrivateRoute will handle absence/redirects
        // console.error("Failed to load workspaces", err);
      }
    };

    ensureWorkspaceSelected();
  }, [isAuthenticated, authLoading, workspaceId, setWorkspaceId]);

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
      workspaceId,
    };
    localStorage.setItem("student_state", JSON.stringify(state));
    console.log("student_state", state);
  }, [rightPanel, conversationId, assistantId, workspaceId]);

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
        workspaceId,
        setWorkspaceId,

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
