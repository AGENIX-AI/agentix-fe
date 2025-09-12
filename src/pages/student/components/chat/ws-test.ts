export function openWsTest(url: string) {
  try {
    const ws = new WebSocket(url);
    ws.onopen = () => console.log("[WS TEST] open", url);
    ws.onmessage = (e) => console.log("[WS TEST] message", e.data);
    ws.onerror = (e) => console.log("[WS TEST] error", e);
    ws.onclose = (e) => console.log("[WS TEST] close", e.code, e.reason);
    return ws;
  } catch (e) {
    console.error("[WS TEST] failed to open", e);
    return null;
  }
}
