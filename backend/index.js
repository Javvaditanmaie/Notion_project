const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const { setupWSConnection } = require("y-websocket/bin/utils");
const WebSocket = require("ws");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Firebase Admin
const serviceAccount = require("./firebase-service-account.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Yjs WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/yjs")) {
    wss.handleUpgrade(req, socket, head, (ws) => {
      setupWSConnection(ws, req);
    });
  } else {
    socket.destroy();
  }
});

// Optional Socket.IO for cursor syncing (not needed for Yjs-only)
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});
io.on("connection", (socket) => {
  console.log("🟢 Socket.IO client connected");

  socket.on("join-doc", (docId) => {
    socket.join(docId);
    console.log(`📄 Client joined doc ${docId}`);
  });

  socket.on("cursor-update", (data) => {
    socket.to(data.docId).emit("cursor-update", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});

// Firebase token middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("Firebase token failed:", err.message);
    res.status(401).send("Invalid token");
  }
};

// JWT middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(401).send("Invalid token");
  }
};

// Exchange Firebase token for JWT
app.post("/api/token", authenticate, (req, res) => {
  const payload = { uid: req.user.uid, email: req.user.email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10h" });
  res.json({ token });
});

// REST endpoints
app.get("/api/docs", authenticateJWT, async (req, res) => {
  const snapshot = await db.collection("documents").where("owner", "==", req.user.uid).get();
  const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.json(docs);
});

app.post("/api/docs", authenticateJWT, async (req, res) => {
  const { title, content } = req.body;
  const docRef = await db.collection("documents").add({
    title,
    content,
    access: "edit",
    favorite: false,
    owner: req.user.uid,
    createdAt: new Date(),
  });
  res.json({ id: docRef.id });
});

app.get("/api/docs/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const docSnap = await db.collection("documents").doc(id).get();
  if (!docSnap.exists) return res.status(404).send("Document not found");

  const data = docSnap.data();
  const isOwner = data.owner === req.user.uid;
  const allowed = data.access === "edit" || data.access === "view";

  if (!isOwner && !allowed) return res.status(403).send("Access denied");

  res.status(200).json({ id, ...data });
});

app.put("/api/docs/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const docRef = db.collection("documents").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) return res.status(404).send("Document not found");

  const data = docSnap.data();
  const isOwner = data.owner === req.user.uid;
  const allowed = data.access === "edit";

  if (!isOwner && !allowed) return res.status(403).send("Unauthorized");

  const updates = {};
  if (typeof title === "string") updates.title = title;
  if (typeof content === "string") updates.content = content;

  await docRef.update(updates);
  res.status(200).send("Updated");
});

app.delete("/api/docs/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const docRef = db.collection("documents").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) return res.status(404).send("Document not found");
  if (docSnap.data().owner !== req.user.uid) return res.status(403).send("Forbidden");

  await docRef.delete();
  res.sendStatus(200);
});

app.put("/api/docs/:id/favorite", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const docRef = db.collection("documents").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) return res.status(404).send("Document not found");
  if (docSnap.data().owner !== req.user.uid) return res.status(403).send("Forbidden");

  const updated = !docSnap.data().favorite;
  await docRef.update({ favorite: updated });
  res.status(200).json({ favorite: updated });
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ HTTP server running on http://localhost:${PORT}`);
  console.log(`✅ Yjs WebSocket server running on ws://localhost:${PORT}/yjs`);
});
