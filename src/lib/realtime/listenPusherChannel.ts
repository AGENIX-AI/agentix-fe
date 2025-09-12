import Pusher from "pusher-js";
import Cookies from "js-cookie";

export function listenPusherChannel(channelName: string) {
  const key = import.meta.env.VITE_PUSHER_KEY as string;
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER as string;
  const baseUrl = import.meta.env.VITE_API_URL || "";
  const jwt = Cookies.get("agentix_access_token") || "";
  const refresh = Cookies.get("agentix_refresh_token") || "";

  const pusher = new Pusher(key, {
    cluster,
    authEndpoint: `${baseUrl}/realtime/auth`,
    auth: { headers: { Authorization: `Bearer ${jwt}`, "X-Refresh-Token": refresh } },
  });

  const ch = pusher.subscribe(channelName);

  const log = (evt: string) => (payload: any) => {
    console.log(`[PUSHER] ${channelName} -> ${evt}`, payload);
  };

  const events = [
    "message:new",
    "message:edited",
    "message:deleted",
    "typing:start",
    "typing:stop",
    "read:receipt",
    "participant:joined",
    "participant:left",
  ];
  for (const evt of events) ch.bind(evt, log(evt));

  ch.bind("pusher:subscription_succeeded", (members: any) => {
    console.log(`[PUSHER] ${channelName} subscribed`, members);
  });
  ch.bind("pusher:member_added", (m: any) => console.log(`[PUSHER] member_added`, m));
  ch.bind("pusher:member_removed", (m: any) => console.log(`[PUSHER] member_removed`, m));

  return () => {
    try {
      ch.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    } catch {}
  };
}
