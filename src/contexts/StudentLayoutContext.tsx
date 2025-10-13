import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface StudentLayoutState {
  // Sidebar in pixels
  sidebarWidth: number;
  setSidebarWidth: (px: number) => void;
  sidebarMin: number;
  sidebarMax: number;

  // History (left pane) in percent of main content
  historyWidthPercent: number; // 0-100
  setHistoryWidthPercent: (percent: number) => void;
  historyMinPercent: number;
  historyMaxPercent: number;
}

const StudentLayoutContext = createContext<StudentLayoutState | null>(null);

export function StudentLayoutProvider({ children }: { children: ReactNode }) {
  // Defaults aligned with current components
  const [sidebarWidth, _setSidebarWidth] = useState<number>(260);
  const sidebarMin = 180;
  const sidebarMax = 400;

  const setSidebarWidth = (px: number) => {
    const clamped = Math.max(sidebarMin, Math.min(sidebarMax, px));
    _setSidebarWidth(clamped);
  };

  const [historyWidthPercent, _setHistoryWidthPercent] = useState<number>(30);
  const historyMinPercent = 20; // allow a bit more narrow than current 30 if needed
  const historyMaxPercent = 60; // generous upper bound; UI may set tighter

  const setHistoryWidthPercent = (percent: number) => {
    const clamped = Math.max(
      historyMinPercent,
      Math.min(historyMaxPercent, percent)
    );
    _setHistoryWidthPercent(clamped);
  };

  const value = useMemo<StudentLayoutState>(
    () => ({
      sidebarWidth,
      setSidebarWidth,
      sidebarMin,
      sidebarMax,
      historyWidthPercent,
      setHistoryWidthPercent,
      historyMinPercent,
      historyMaxPercent,
    }),
    [sidebarWidth, historyWidthPercent]
  );

  return (
    <StudentLayoutContext.Provider value={value}>
      {children}
    </StudentLayoutContext.Provider>
  );
}

export function useStudentLayout(): StudentLayoutState {
  const ctx = useContext(StudentLayoutContext);
  if (!ctx) {
    throw new Error(
      "useStudentLayout must be used within StudentLayoutProvider"
    );
  }
  return ctx;
}
