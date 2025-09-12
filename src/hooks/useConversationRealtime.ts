import { useEffect, useMemo, useRef, useState } from "react";
import Pusher from "pusher-js";

export type RealtimeEvent =
  | { type: "message:new"; payload: any }
  | { type: "message:edited"; payload: any }
  | { type: "message:deleted"; payload: any }
  | { type: "typing:start"; payload: { user_id: string } }
  | { type: "typing:stop"; payload: { user_id: string } }
  | { type: "read:receipt"; payload: any }
  | { type: "participant:joined"; payload: any }
  | { type: "participant:left"; payload: any };

export interface RealtimeState {
  isConnected: boolean;
  members: Map<string, { name?: string; avatar?: string }>; // presence
}

export interface RealtimeActions {
  sendTyping: (state: "start" | "stop") => Promise<void>;
  disconnect: () => void;
}

export function useConversationRealtime(conversationId: string | null, opts: {
  pusherKey: string;
  cluster: string;
  jwt: string;
  onEvent?: (e: RealtimeEvent) => void;
}) {
  const { pusherKey, cluster, jwt, onEvent } = opts;
  const [state, setState] = useState<RealtimeState>({ isConnected: false, members: new Map() });
  const pusherRef = useRef<Pusher | null>(null);
  const privateChannelName = useMemo(() => conversationId ? `private-conv-${conversationId}` : null, [conversationId]);
  const presenceChannelName = useMemo(() => conversationId ? `presence-conv-${conversationId}` : null, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const baseUrl = import.meta.env.VITE_API_URL || "";
    const pusher = new Pusher(pusherKey, {
      cluster,
      authEndpoint: `${baseUrl}/realtime/auth`,
      auth: { headers: { Authorization: `Bearer ${jwt}`, "X-Refresh-Token": localStorage.getItem("agentix_refresh_token") || "" } },
    });
    pusherRef.current = pusher;

    const privateChannel = pusher.subscribe(privateChannelName!);
    const presenceChannel = pusher.subscribe(presenceChannelName!);

    const handle = (name: RealtimeEvent["type"]) => (data: any) => onEvent?.({ type: name, payload: data } as RealtimeEvent);

    privateChannel.bind("message:new", handle("message:new"));
    privateChannel.bind("message:edited", handle("message:edited"));
    privateChannel.bind("message:deleted", handle("message:deleted"));

    presenceChannel.bind("typing:start", handle("typing:start"));
    presenceChannel.bind("typing:stop", handle("typing:stop"));
    presenceChannel.bind("read:receipt", handle("read:receipt"));
    presenceChannel.bind("participant:joined", handle("participant:joined"));
    presenceChannel.bind("participant:left", handle("participant:left"));

    presenceChannel.bind("pusher:subscription_succeeded", (members: any) => {
      const map = new Map<string, { name?: string; avatar?: string }>();
      members.each((m: any) => {
        map.set(m.id, { name: m.info?.name, avatar: m.info?.avatar });
      });
      setState({ isConnected: true, members: map });
    });

    presenceChannel.bind("pusher:member_added", (member: any) => {
      setState((prev) => {
        const map = new Map(prev.members);
        map.set(member.id, { name: member.info?.name, avatar: member.info?.avatar });
        return { ...prev, members: map };
      });
    });
    presenceChannel.bind("pusher:member_removed", (member: any) => {
      setState((prev) => {
        const map = new Map(prev.members);
        map.delete(member.id);
        return { ...prev, members: map };
      });
    });

    return () => {
      try {
        privateChannel.unbind_all();
        presenceChannel.unbind_all();
        pusher.unsubscribe(privateChannelName!);
        pusher.unsubscribe(presenceChannelName!);
        pusher.disconnect();
      } catch {}
      setState({ isConnected: false, members: new Map() });
    };
  }, [conversationId, pusherKey, cluster, jwt, privateChannelName, presenceChannelName, onEvent]);

  const actions: RealtimeActions = useMemo(() => ({
    sendTyping: async (state) => {
      if (!conversationId) return;
      await fetch(`/conversations/${conversationId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}`, "X-Refresh-Token": localStorage.getItem("refresh_token") || "" },
        body: JSON.stringify({ state }),
      });
    },
    disconnect: () => {
      try { pusherRef.current?.disconnect(); } catch {}
    },
  }), [conversationId, jwt]);

  return { state, actions } as const;
}
