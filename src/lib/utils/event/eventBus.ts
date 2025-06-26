type Listener = (data: any) => void;

class EventBus {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    return () => {
      this.listeners[event] = this.listeners[event].filter(
        (listener) => listener !== callback
      );
    };
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }
}

export const eventBus = new EventBus();
