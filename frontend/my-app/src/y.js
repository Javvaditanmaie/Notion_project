import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export const ydoc = new Y.Doc();

export const getProvider = (roomName) => {
  return new WebsocketProvider("wss://demos.yjs.dev", roomName, ydoc);
};

export const awareness = ydoc.getMap("awareness"); // Optional, or use `provider.awareness`
