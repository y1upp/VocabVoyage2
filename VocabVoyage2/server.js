const express = require("express");
const http = require("http");
const next = require("next");
const setupSocket = require("./server/socketServer");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
httpServer.listen(3000, "0.0.0.0", () => {
  console.log(`🚀 WebSocket Server running on http://0.0.0.0:3000`);
});
  
  // Attach WebSocket server
  setupSocket(httpServer);

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3001;

  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
