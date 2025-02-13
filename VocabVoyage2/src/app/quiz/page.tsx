"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../context/SocketContext";
import QuizGame from "./QuizGame";

export default function QuizLobby() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const socket = useSocket();

  // Generate a random room code
  const generateRoomCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(randomCode);
  };

  // Join room with the entered/generated code (only once)
  const joinRoom = () => {
    if (roomCode.trim() && socket && !isJoined) {
      socket.emit("joinRoom", roomCode);
      setIsJoined(true);
    }
  };

  if (socket) {
    socket.on("startQuiz", () => {
      setGameStarted(true);
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600 w-full">
      {/* Background Flag Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/a/a3/Flag_of_Lithuania.svg')",
        }}
      ></div>

      {!gameStarted ? (
        <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Join a Quiz Battle</h2>
          
          {/* Room Code Input */}
          <input
            type="text"
            placeholder="Enter room code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            className="border p-3 rounded-lg w-full text-center mb-4 text-lg text-gray-900 placeholder-gray-700"
          />
          
          {/* Join Room Button */}
          <button
            onClick={joinRoom}
            disabled={isJoined}
            className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition ${
              isJoined ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isJoined ? "Joined!" : "Join Room"}
          </button>

          <p className="mt-4 text-gray-600 text-lg">Or generate a random room:</p>

          {/* Generate Room Code Button */}
          <button
            onClick={generateRoomCode}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition text-lg mt-2"
          >
            Generate Room Code
          </button>

          {/* Display Room Code */}
          {roomCode && <p className="mt-4 font-bold text-xl text-gray-900">Room Code: {roomCode}</p>}

          {/* Back Button */}
          <button
            onClick={() => router.push("/blank")}
            className="mt-6 w-full bg-red-500 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-red-600 transition text-lg"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <QuizGame roomCode={roomCode} />
      )}
    </div>
  );
}
