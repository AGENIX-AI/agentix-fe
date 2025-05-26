"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
// import { getConversationById } from "@repo/api/src/external";
// import { getAssistantById } from "@repo/api/src/external/assisstants";

interface Personality {
  instruction_style: number;
  communication_style: number;
  response_length_style: number;
  formality_style: number;
  assertiveness_style: number;
  mood_style: number;
}

interface CharacterInfo {
  id: string;
  name: string;
  image: string;
  tagline: string;
  description: string;
  capability_statement?: {
    speciality: string;
    capabilities: string[];
  };
  personality?: Personality;
  language: string;
  created_at: string;
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
  characterId: string | null;
  setCharacterId: (id: string | null) => void;
  characterInfo: CharacterInfo | null;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  conversationInfo: ConversationInfo | null;
  isTasksVisible: boolean;
  toggleTasks: () => void;
  rightPanel: string;
  setRightPanel: (panel: string) => void;
  isMessageLoading: boolean;
  setIsMessageLoading: (loading: boolean) => void;
}

const StudentContext = createContext<AppPageContextType | undefined>(undefined);

function saveToLocalStorage(key: string, data: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

function getFromLocalStorage(key: string) {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  return null;
}

export function StudentContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const savedState = getFromLocalStorage("edvara-app-state");
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [characterId, setCharacterId] = useState<string | null>(
    savedState?.characterId || null
  );
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo | null>(
    savedState?.characterInfo || null
  );
  const [conversationId, setConversationId] = useState<string | null>(
    savedState?.conversationId || null
  );
  const [conversationInfo, setConversationInfo] =
    useState<ConversationInfo | null>(savedState?.conversationInfo || null);
  const [isTasksVisible, setIsTasksVisible] = useState(false);
  const [rightPanel, setRightPanel] = useState(
    savedState?.rightPanel || "empty"
  );
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  const toggleTasks = () => {
    setIsTasksVisible(!isTasksVisible);
  };

  // Fetch character data when characterId changes
  useEffect(() => {
    if (!characterId) {
      setCharacterInfo(null);
      return;
    }

    const fetchCharacterData = async () => {
      // try {
      //   const response = await getAssistantById(characterId);

      //   if (response.success && response.assistant) {
      //     const assistant = response.assistant;
      //     setCharacterInfo(assistant as CharacterInfo);
      //   }
      // } catch (error) {
      //   console.error("Error fetching character data:", error);
      // }
      console.log("fetchCharacterData");
    };

    fetchCharacterData();
  }, [characterId]);

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

  useEffect(() => {
    const stateToSave = {
      characterId,
      conversationId,
      rightPanel,
    };
    console.log("state:", stateToSave);
    saveToLocalStorage("edvara-app-state", stateToSave);
  }, [characterId, conversationId, rightPanel]);

  return (
    <StudentContext.Provider
      value={{
        isHistoryVisible,
        toggleHistory,
        characterId,
        setCharacterId,
        characterInfo,
        conversationId,
        setConversationId,
        conversationInfo,
        isTasksVisible,
        toggleTasks,
        rightPanel,
        setRightPanel,
        isMessageLoading,
        setIsMessageLoading,
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
