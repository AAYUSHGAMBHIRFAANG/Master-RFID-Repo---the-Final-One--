// apps/backend/src/websocket.js
import { WebSocketServer } from 'ws';
import { broadcastSnapshot } from './services/attendanceService.js';  // adjust path as needed

/** ------------------------------------------------------------------
 *  Single shared WSS instance (filled inside initWebSocket)
 * ------------------------------------------------------------------ */
let wss = null;

/** ------------------------------------------------------------------
 *  initWebSocket(server)   — call once from app.js after app.listen()
 * ------------------------------------------------------------------ */
export function initWebSocket(server) {
  if (wss) return wss;
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/ws/session/')) return socket.destroy();
    wss.handleUpgrade(req, socket, head, (ws) => {
      ws.sessionId = url.pathname.split('/').pop();
      ws.isAlive = true;
      wss.emit('connection', ws);
    });
  });

  wss.on('connection', async (ws) => {
    ws.on('pong', () => (ws.isAlive = true));
    // Send current snapshot once on connect
    await broadcastSnapshot(ws.sessionId);
  });

  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30_000);
  pingInterval.unref();
  return wss;
}

/** ------------------------------------------------------------------
 *  broadcast(sessionId, event, data)
 * ------------------------------------------------------------------ */
export function broadcast(sessionId, event, data) {
  if (!wss) return;
  const msg = JSON.stringify({ event, data });
  wss.clients.forEach((c) => {
    if (c.readyState === 1 && c.sessionId === String(sessionId)) {
      c.send(msg);
    }
  });
}

/** ------------------------------------------------------------------
 *  Exports
 * ------------------------------------------------------------------ */
export { wss };
