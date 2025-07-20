// server.js
const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

const documents = {}; // In-memory store for document updates

server.on("connection", (socket) => {
  let docId = null;

  socket.on("message", (message) => {
    const data = JSON.parse(message);
    
    // When client joins a document room
    if (data.type === "join") {
      docId = data.docId;
      if (!documents[docId]) documents[docId] = [];

      // Send current document state
      socket.send(JSON.stringify({
        type: "init",
        content: documents[docId]
      }));
    }

    // When client sends update
    if (data.type === "update") {
      documents[docId] = data.content;

      // Broadcast to everyone else in the same document
      server.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "update",
            content: data.content
          }));
        }
      });
    }
  });
});
