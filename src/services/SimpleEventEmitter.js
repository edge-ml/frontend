class SimpleEventEmitter {
  constructor() {
    this._listeners = new Map();
  }

  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(handler);
    return this;
  }

  off(event, handler) {
    const handlers = this._listeners.get(event);
    if (!handlers) {
      return this;
    }
    handlers.delete(handler);
    if (handlers.size === 0) {
      this._listeners.delete(event);
    }
    return this;
  }

  removeAllListeners(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
    return this;
  }

  emit(event, ...args) {
    const handlers = this._listeners.get(event);
    if (!handlers) {
      return false;
    }
    for (const handler of Array.from(handlers)) {
      handler(...args);
    }
    return true;
  }
}

export default SimpleEventEmitter;
