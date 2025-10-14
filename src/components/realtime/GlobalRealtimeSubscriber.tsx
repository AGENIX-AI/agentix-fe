import { useEffect, useRef } from "react";
import Pusher from "pusher-js";
import Cookies from "js-cookie";
import { useAuth } from "@/contexts/AuthContext";
import { useStudent } from "@/contexts/StudentContext";
import { listConversations } from "@/api/conversations";
import { eventBus } from "@/lib/utils/event/eventBus";

const key = import.meta.env.VITE_PUSHER_KEY as string;
const cluster = import.meta.env.VITE_PUSHER_CLUSTER as string;

export function GlobalRealtimeSubscriber() {
  const { user, isAuthenticated } = useAuth();
  const { workspaceId } = useStudent();
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const jwt = Cookies.get("agentix_access_token") || "";
    const refresh = Cookies.get("agentix_refresh_token") || "";

    console.log("[Realtime] Authenticated user:", user.id);

    const baseUrl = import.meta.env.VITE_API_URL || "";
    const pusher = new Pusher(key, {
      cluster,
      authEndpoint: `${baseUrl}/realtime/auth`,
      auth: {
        headers: { Authorization: `Bearer ${jwt}`, "X-Refresh-Token": refresh },
      },
    });
    pusherRef.current = pusher;

    let unsubscribers: Array<() => void> = [];

    // Subscribe to user-wide private channel for notifications
    const userChannelName = `private-user-${user.id}`;
    const userCh = pusher.subscribe(userChannelName);
    userCh.bind("message:new", (payload: any) => {
      try {
        eventBus.emit("websocket-message", payload);
      } catch (e) {
        console.error("[Realtime] user message:new handler error", e, payload);
      }
    });
    unsubscribers.push(() => {
      try {
        userCh.unbind_all();
        pusher.unsubscribe(userChannelName);
      } catch {}
    });

    const subscribeConversations = async () => {
      if (!workspaceId) return;
      try {
        const res = await listConversations({
          workspace_id: workspaceId,
          page_number: 1,
          page_size: 200,
        });
        console.log(
          `[Realtime] Subscribing to ${res.conversations.length} conversations for workspace ${workspaceId}`
        );
        for (const conv of res.conversations) {
          const priv = `private-conv-${conv.id}`;
          const pres = `presence-conv-${conv.id}`;

          const privCh = pusher.subscribe(priv);
          const presCh = pusher.subscribe(pres);

          const log = (evt: string) => (payload: unknown) =>
            console.log(`[Realtime] ${evt}`, { convId: conv.id, payload });

          privCh.bind("message:new", (payload: any) => {
            try {
              log("message:new")(payload);

              eventBus.emit("websocket-message", payload);
            } catch (e) {
              console.error(
                "[Realtime] conv message:new handler error",
                e,
                payload
              );
            }
          });
          privCh.bind("message:edited", log("message:edited"));
          privCh.bind("message:deleted", log("message:deleted"));

          presCh.bind("typing:start", (payload: any) => {
            log("typing:start")(payload);
            try {
              console.log("[Realtime] Emitting websocket-typing:start", {
                convId: conv.id,
                payload,
              });
              eventBus.emit("websocket-typing", {
                conversation_id: conv.id,
                meta: { role: "agent", typing: true },
                message: payload?.message,
              });
            } catch (e) {
              console.warn("[Realtime] emit typing:start failed", e);
            }
          });
          presCh.bind("typing:stop", (payload: any) => {
            log("typing:stop")(payload);
            try {
              console.log("[Realtime] Emitting websocket-typing:stop", {
                convId: conv.id,
                payload,
              });
              eventBus.emit("websocket-typing", {
                conversation_id: conv.id,
                meta: { role: "agent", typing: false },
                message: payload?.message,
              });
            } catch (e) {
              console.warn("[Realtime] emit typing:stop failed", e);
            }
          });
          // Backend may emit a generic 'typing' event with meta.typing flag
          presCh.bind("typing", (payload: any) => {
            log("typing")(payload);
            try {
              const isTyping = Boolean(
                payload?.message?.meta?.typing ?? payload?.meta?.typing
              );
              console.log("[Realtime] Emitting websocket-typing (generic)", {
                convId: conv.id,
                isTyping,
                payload,
              });
              eventBus.emit("websocket-typing", {
                conversation_id: conv.id,
                meta: { role: "agent", typing: isTyping },
                message: payload?.message,
              });
            } catch (e) {
              console.warn("[Realtime] emit typing failed", e);
            }
          });
          presCh.bind("read:receipt", log("read:receipt"));
          presCh.bind("participant:joined", log("participant:joined"));
          presCh.bind("participant:left", log("participant:left"));

          unsubscribers.push(() => {
            try {
              privCh.unbind_all();
              presCh.unbind_all();
              pusher.unsubscribe(priv);
              pusher.unsubscribe(pres);
            } catch {}
          });
        }
      } catch (e) {
        console.warn("[Realtime] Failed to subscribe conversations:", e);
      }
    };

    subscribeConversations();

    return () => {
      for (const fn of unsubscribers) fn();
      try {
        pusher.disconnect();
      } catch {}
      pusherRef.current = null;
    };
  }, [isAuthenticated, user?.id, workspaceId]);

  return null;
}
