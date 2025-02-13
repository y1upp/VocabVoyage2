"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../context/SocketContext";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://localhost:8090");

interface Question {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
}

export default function QuizGame({ roomCode }: { roomCode: string }) {
  const socket = useSocket();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [results, setResults] = useState<{ userId: string; answer: string; questionId: string }[]>([]);
  const [username, setUsername] = useState<string>("Guest");
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [showPoints, setShowPoints] = useState<boolean>(false); // ✅ Show "+50 Points" notification
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);


  useEffect(() => {
    const fetchUser = async () => {
      const user = pb.authStore.model;
      if (user) {
        setUsername(user.username);
        setTotalPoints(user.totalPoints || 0);
      }
    };

    fetchUser();

    const fetchQuestions = async () => {
      try {
        const response = await pb.collection("questions").getList(1, 5);

        if (!response.items || response.items.length === 0) {
          console.error("❌ No questions found in PocketBase!");
          return;
        }

        const fetchedQuestions: Question[] = response.items.map((item) => ({
          id: item.id,
          question: item.question,
          choices: item.choices,
          correctAnswer: item.correctAnswer,
        }));

        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error("❌ Error fetching questions:", error);
      }
    };

    fetchQuestions();

    socket?.on("updateResults", (data) => {
      setResults((prev) => [...prev, data]);

      if (data.answer === questions[currentQuestion]?.correctAnswer) {
        setIsLocked(true);
        updatePoints(data.userId);

        // ✅ Show "+50 Points" animation for correct user
        if (data.userId === username) {
          setShowPoints(true);
          setTimeout(() => {
            setShowPoints(false);
          }, 1500);
        }

        setTimeout(() => {
          setCurrentQuestion((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsLocked(false);
        }, 2000);
      }
    });

    return () => {
      socket?.off("updateResults");
    };
  }, [socket, currentQuestion, questions]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestion < questions.length) {
      setShuffledChoices(shuffleArray([...questions[currentQuestion].choices])); // ✅ Shuffle once per question
    }
  }, [currentQuestion, questions]);

  const handleAnswer = (answer: string) => {
    if (isLocked) return;

    setSelectedAnswer(answer);
    setIsLocked(true);

    socket?.emit("submitAnswer", {
      roomCode,
      userId: username,
      answer,
      questionId: questions[currentQuestion]?.id,
    });
  };

  const updatePoints = async (userId: string) => {
    if (userId === username) {
      try {
        const user = await pb.collection("users").getFirstListItem(`username="${userId}"`);
        await pb.collection("users").update(user.id, {
          totalPoints: user.totalPoints + 50,
        });

        setTotalPoints((prev) => prev + 50);
        console.log("🏆 +50 Points Awarded to:", userId);
      } catch (error) {
        console.error("❌ Error updating points:", error);
      }
    }
  };

  function shuffleArray(array: string[]): string[] {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600 w-full">
      {/* Background Flag Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/a/a3/Flag_of_Lithuania.svg')",
        }}
      ></div>

      {/* "+50 Points!" Notification */}
      {showPoints && (
        <div className="absolute top-20 bg-green-500 text-white py-2 px-6 rounded-lg shadow-lg animate-bounce">
          +50 Points!
        </div>
      )}

      {/* Quiz Box */}
      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-lg p-8 text-center">
        {questions.length > 0 && currentQuestion < questions.length ? (
          <>
            <h2 className="text-3xl font-bold text-gray-800">{questions[currentQuestion].question}</h2>
            <div className="mt-6 space-y-3">
              {questions[currentQuestion].choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleAnswer(choice)}
                  className={`block w-full p-4 rounded-lg text-lg font-semibold transition duration-200 ${
                    selectedAnswer === choice
                      ? "bg-blue-500 text-white"
                      : isLocked
                      ? "bg-gray-500 text-gray-400 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                  disabled={isLocked}
                >
                  {choice}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Game Over!</h2>
            <button
              onClick={() => router.push("/blank")}
              className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-200"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Live Results */}
        <div className="mt-8 bg-gray-800 p-4 rounded-lg text-white">
          <h3 className="text-xl font-bold mb-2">Live Results:</h3>
          <div className="overflow-y-auto max-h-40">
            {results.length > 0 ? (
              results.map((res, index) => (
                <p key={index} className="text-lg p-2 rounded-md bg-gray-700 my-1">
                  <strong className="text-yellow-400">{res.userId}</strong>: {res.answer}
                </p>
              ))
            ) : (
              <p className="text-gray-400">No answers submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
