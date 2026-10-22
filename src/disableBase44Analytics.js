/**
 * Pre-initialization hook to completely disable Base44 SDK telemetry,
 * heartbeats, and analytics background network calls.
 * Must be evaluated before @base44/sdk is imported.
 */
if (typeof window !== "undefined") {
  window.base44SharedInstances = window.base44SharedInstances || {};
  window.base44SharedInstances["analytics"] = {
    instance: {
      requestsQueue: [],
      isProcessing: false,
      isHeartBeatProcessing: false,
      wasInitializationTracked: true,
      sessionContext: null,
      sessionStartTime: null,
      config: {
        enabled: false,
        maxQueueSize: 0,
        throttleTime: 86400000,
        batchSize: 0,
        heartBeatInterval: 86400000,
      },
      track: () => {},
      cleanup: () => {},
    },
  };
}
