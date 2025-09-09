import { CopilotPopup } from "@copilotkit/react-ui";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function CopilotIntegrator() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, needsApproval, needsWaitlistForm } = useAuth();

  // Publish readable user context to CopilotKit
  const copilotUser = useMemo(
    () =>
      user
        ? {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.metadata?.full_name,
          }
        : null,
    [user]
  );

  useCopilotReadable({
    description: "Authenticated user context and auth gates",
    value: {
      isAuthenticated,
      user: copilotUser,
      needsApproval,
      needsWaitlistForm,
    },
  });

  // Publish route + UI state
  const studentState = useMemo(() => {
    try {
      const stored = localStorage.getItem("student_state");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {} as any;
    }
  }, [location.pathname]);

  useCopilotReadable({
    description: "Current route and UI panel preferences",
    value: {
      path: location.pathname,
      rightPanel: studentState.rightPanel ?? null,
      assistantId: studentState.assistantId ?? null,
      conversationId: studentState.conversationId ?? null,
    },
  });

  // Action: navigate to a route
  useCopilotAction({
    name: "navigateTo",
    description: "Navigate the app to a specific route path.",
    parameters: [
      {
        name: "path",
        type: "string",
        description: "Absolute route path, e.g. /home or /admin.",
        required: true,
      },
    ],
    handler: ({ path }: { path: string }) => {
      navigate(path);
      return `Navigated to ${path}`;
    },
  });

  // Action: open right panel mode in home page context
  useCopilotAction({
    name: "openRightPanel",
    description: "Open a specific right panel mode in the student area.",
    parameters: [
      {
        name: "panel",
        type: "string",
        description: "Panel key, e.g. findInstructor, notes, topics.",
        required: true,
      },
    ],
    handler: ({ panel }: { panel: string }) => {
      try {
        const stored = localStorage.getItem("student_state");
        const state = stored ? JSON.parse(stored) : {};
        const next = { ...state, rightPanel: panel };
        localStorage.setItem("student_state", JSON.stringify(next));
        return `Right panel set to ${panel}`;
      } catch (e) {
        return "Failed to set panel";
      }
    },
  });

  // Action: set conversation context (assistantId, conversationId)
  useCopilotAction({
    name: "setConversationContext",
    description:
      "Set assistant and conversation identifiers for context across the app.",
    parameters: [
      {
        name: "assistantId",
        type: "string",
        description: "Assistant identifier.",
        required: false,
      },
      {
        name: "conversationId",
        type: "string",
        description: "Conversation identifier.",
        required: false,
      },
    ],
    handler: ({
      assistantId,
      conversationId,
    }: {
      assistantId?: string;
      conversationId?: string;
    }) => {
      try {
        const stored = localStorage.getItem("student_state");
        const state = stored ? JSON.parse(stored) : {};
        const next = { ...state, assistantId, conversationId };
        localStorage.setItem("student_state", JSON.stringify(next));
        return "Context updated";
      } catch (e) {
        return "Failed to update context";
      }
    },
  });

  // Action: show toast to user
  useCopilotAction({
    name: "notifyUser",
    description: "Show a transient notification message to the user.",
    parameters: [
      {
        name: "message",
        type: "string",
        description: "Message to display.",
        required: true,
      },
    ],
    handler: ({ message }: { message: string }) => {
      toast(message);
      return "Notification shown";
    },
  });

  // Optional: context-aware suggestions for first-time users
  useEffect(() => {
    if (!isAuthenticated) return;
    if (location.pathname === "/home" && !studentState.rightPanel) {
      toast("Tip: Ask the copilot to 'open instructor finder'.");
    }
  }, [isAuthenticated, location.pathname, studentState.rightPanel]);

  return (
    <>
      <CopilotPopup
        instructions="Help assistant for AgentIx. Ask 'how to…'"
        suggestions="manual"
        imageUploadsEnabled={false}
        hideStopButton
      />
    </>
  );
}

export function getCopilotContext() {
  try {
    const stored = localStorage.getItem("student_state");
    if (stored) {
      const { assistantId, conversationId, rightPanel } = JSON.parse(stored);
      return { assistantId, conversationId, rightPanel };
    }
  } catch (_e) {}
  return {
    assistantId: null,
    conversationId: null,
    rightPanel: "findInstructor",
  };
}
