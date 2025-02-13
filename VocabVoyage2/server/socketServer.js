const { Server } = require("socket.io");

let activeRooms = {}; // Store quiz rooms

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a quiz room
    socket.on("joinRoom", (roomCode) => {
      socket.join(roomCode);
      if (!activeRooms[roomCode]) activeRooms[roomCode] = [];
      activeRooms[roomCode].push(socket.id);

      // Start quiz when two players join
      if (activeRooms[roomCode].length === 2) {
        io.to(roomCode).emit("startQuiz", { message: "Quiz is starting!" });
      }
    });

    // Handle user answers
    socket.on("submitAnswer", ({ roomCode, userId, answer, questionId }) => {
      io.to(roomCode).emit("updateResults", { userId, answer, questionId });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const room in activeRooms) {
        activeRooms[room] = activeRooms[room].filter((id) => id !== socket.id);
        if (activeRooms[room].length === 0) delete activeRooms[room];
      }
    });
  });
};

module.exports = setupSocket;
