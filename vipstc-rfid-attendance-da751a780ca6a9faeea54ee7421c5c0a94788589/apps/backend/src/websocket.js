import { WebSocketServer } from 'ws';
import { broadcastSnapshot } from './services/attendanceService.js';  // adjust path

let wss = null;

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

/**
 * Send an event to all WebSocket clients listening on a given sessionId.
 */
export function broadcast(sessionId, event, data) {
  if (!wss) return;
  const msg = JSON.stringify({ event, data });

  // DEBUG LOG: confirm what we're sending
  console.log(`🕸️ [broadcast] session=${sessionId}  event=${event}`);

  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.sessionId === String(sessionId)) {
      client.send(msg);
    }
  });
}

export { wss };
