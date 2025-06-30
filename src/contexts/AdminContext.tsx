import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { AssistantData, Instructor, Student } from "@/api/admin";

interface AdminContextType {
  rightPanel: string;
  setRightPanel: (panel: string) => void;
  isHistoryVisible: boolean;
  setIsHistoryVisible: (visible: boolean) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  // Sidebar state
  sidebarType: "assistant" | "instructor" | "student" | null;
  setSidebarType: (type: "assistant" | "instructor" | "student" | null) => void;

  // Detail data
  selectedAssistant: AssistantData | null;
  setSelectedAssistant: (assistant: AssistantData | null) => void;

  selectedInstructor: Instructor | null;
  setSelectedInstructor: (instructor: Instructor | null) => void;

  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;

  // Helper functions
  showAssistantDetails: (assistant: AssistantData) => void;
  showInstructorDetails: (instructor: Instructor) => void;
  showStudentDetails: (student: Student) => void;
  closeSidebar: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminContextProvider");
  }
  return context;
};

export const AdminContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [rightPanel, setRightPanel] = useState("dashboard");
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Sidebar state
  const [sidebarType, setSidebarType] = useState<
    "assistant" | "instructor" | "student" | null
  >(null);
  const [selectedAssistant, setSelectedAssistant] =
    useState<AssistantData | null>(null);
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Helper functions
  const showAssistantDetails = (assistant: AssistantData) => {
    setSelectedAssistant(assistant);
    setSidebarType("assistant");
  };

  const showInstructorDetails = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setSidebarType("instructor");
  };

  const showStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setSidebarType("student");
  };

  const closeSidebar = () => {
    setSidebarType(null);
    setSelectedAssistant(null);
    setSelectedInstructor(null);
    setSelectedStudent(null);
  };

  return (
    <AdminContext.Provider
      value={{
        rightPanel,
        setRightPanel,
        isHistoryVisible,
        setIsHistoryVisible,
        currentTab,
        setCurrentTab,
        sidebarType,
        setSidebarType,
        selectedAssistant,
        setSelectedAssistant,
        selectedInstructor,
        setSelectedInstructor,
        selectedStudent,
        setSelectedStudent,
        showAssistantDetails,
        showInstructorDetails,
        showStudentDetails,
        closeSidebar,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
