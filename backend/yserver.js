// yserver.js
const { WebsocketServer } = require('y-websocket/bin/utils');

const port = 1234;
new WebsocketServer({ port });

console.log(`✅ Yjs WebSocket server running on ws://localhost:${port}`);
