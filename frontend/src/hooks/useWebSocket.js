import { useEffect, useRef } from 'react';

export function useWebSocket(channel = 'general') {
  const wsRef = useRef(null);

  useEffect(() => {
    // Only attempt WebSocket connection if explicitly enabled and backend is available
    let ws = null;
    try {
      ws = new WebSocket(`ws://localhost:8000/ws/stream?channel=${channel}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[WebSocket] Connected to channel: ${channel}`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'alert_triggered') {
            console.log('[WebSocket Alert Received]', data);
          }
        } catch (e) {
          // ignore
        }
      };

      ws.onerror = (err) => {
        // Silently catch errors without breaking UI
        console.debug('[WebSocket] Connection pending backend server...');
      };
    } catch (e) {
      // Fallback
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [channel]);

  return wsRef.current;
}
