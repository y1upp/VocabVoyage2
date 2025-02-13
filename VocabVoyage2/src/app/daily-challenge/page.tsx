'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Large pool of daily questions
const dailyQuestionsPool = [
  [{ question: "What does 'Labas' mean?", options: ["Goodbye", "Hello", "Please", "Thank you"], correctAnswer: "Hello" }],
  [{ question: "How do you say 'Thank you' in Lithuanian?", options: ["Prašau", "Labas", "Ačiū", "Viso gero"], correctAnswer: "Ačiū" }],
  [{ question: "What is the Lithuanian word for 'Good night'?", options: ["Labanakt", "Labas vakaras", "Sudie", "Iki pasimatymo"], correctAnswer: "Labanakt" }],
  [{ question: "What does 'Sudie' mean?", options: ["See you", "Hello", "Goodbye", "Welcome"], correctAnswer: "Goodbye" }],
  [{ question: "How do you say 'Please' in Lithuanian?", options: ["Ačiū", "Prašau", "Labas", "Sveiki"], correctAnswer: "Prašau" }],
  [{ question: "What is the Lithuanian word for 'Good morning'?", options: ["Labanakt", "Labas rytas", "Iki", "Viso gero"], correctAnswer: "Labas rytas" }],
  [{ question: "Translate 'Love' to Lithuanian.", options: ["Meilė", "Draugas", "Laimė", "Džiaugsmas"], correctAnswer: "Meilė" }],
  [{ question: "What does 'Draugas' mean?", options: ["Enemy", "Friend", "Love", "Sadness"], correctAnswer: "Friend" }],
  [{ question: "How do you say 'Yes' in Lithuanian?", options: ["Ne", "Taip", "Ačiū", "Prašau"], correctAnswer: "Taip" }],
  [{ question: "Translate 'House' to Lithuanian.", options: ["Namas", "Gatvė", "Miškas", "Kambarys"], correctAnswer: "Namas" }],
  [{ question: "What does 'Maistas' mean?", options: ["Water", "Food", "Milk", "Fruit"], correctAnswer: "Food" }],
  [{ question: "How do you say 'School' in Lithuanian?", options: ["Bažnyčia", "Mokykla", "Darbovietė", "Universitetas"], correctAnswer: "Mokykla" }],
  [{ question: "What is the Lithuanian word for 'Car'?", options: ["Laivas", "Dviratis", "Mašina", "Autobusas"], correctAnswer: "Mašina" }],
  [{ question: "Translate 'Sun' to Lithuanian.", options: ["Mėnulis", "Saulė", "Žvaigždė", "Diena"], correctAnswer: "Saulė" }],
  [{ question: "What does 'Katė' mean?", options: ["Dog", "Cat", "Rabbit", "Bird"], correctAnswer: "Cat" }]
];

// Shuffle function using date seed
const shuffleQuestions = (seed: number) => {
  let shuffled = [...dailyQuestionsPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1)) % shuffled.length;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get today's shuffled question set
const todaySeed = new Date().getDate();
const shuffledQuestions = shuffleQuestions(todaySeed);
const questions = shuffledQuestions.slice(0, 3).flat(); // Pick 3 unique questions

const DailyChallengePage = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = pb.authStore.model;
      if (user) {
        setUserId(user.id);
        setTotalPoints(user.totalPoints || 0);
      } else {
        router.push('/login');
      }
    };
    fetchUserData();
  }, [router]);

  // Handle answer selection
  const handleAnswer = async (option: string) => {
    setSelectedOption(option);

    if (option === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
      const newPoints = totalPoints + 30;
      setTotalPoints(newPoints);
      setShowNotification(true);

      // Hide notification after 2 seconds
      setTimeout(() => setShowNotification(false), 2000);

      // Update totalPoints in PocketBase
      if (userId) {
        await pb.collection('users').update(userId, { totalPoints: newPoints });
      }
    }
  };
 // Retry Challenge
 const retryChallenge = () => {
  setCurrentQuestion(0);
  setSelectedOption(null);
  setScore(0);
  setQuizCompleted(false);
};
  // Move to the next question
  const nextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600">
      
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/a/a3/Flag_of_Lithuania.svg')" }} />

      {/* Content Box */}
      <div className="relative w-[90%] max-w-screen-md bg-yellow-300 rounded-lg shadow-lg p-8 flex flex-col items-center">
        
        <button onClick={() => router.push('/blank')} className="absolute top-4 right-4 bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600">
          Home 🏠
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔥 Daily Challenge 🔥</h1>

        {!quizCompleted ? (
          <div className="bg-yellow-200 p-6 rounded-lg shadow-md text-gray-900 text-center w-full">
            <h2 className="text-2xl mb-4">{questions[currentQuestion].question}</h2>
            <div className="grid grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((option) => (
                <button key={option} className={`py-3 px-6 rounded-lg shadow-md text-lg 
                  ${selectedOption === option ? option === questions[currentQuestion].correctAnswer ? "bg-green-500 text-white" : "bg-red-500 text-white" : "bg-yellow-400 hover:bg-yellow-500"}`}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedOption !== null}>
                  {option}
                </button>
              ))}
            </div>
            {selectedOption && <button onClick={nextQuestion} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600">Next</button>}
          </div>
        ) : (
          <div className="bg-yellow-200 p-6 rounded-lg shadow-md text-gray-900 text-center w-full">
            <h2 className="text-3xl mb-4">🎉 Challenge Completed! 🎉</h2>
            <p className="text-lg mb-4">You scored <strong>{score} / {questions.length}</strong>!</p>
            <button onClick={retryChallenge} className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-green-600">🔄 Retry Challenge</button>

          </div>
        )}

        {showNotification && (
          <div className="absolute top-16 right-10 bg-green-500 text-white p-3 rounded-lg shadow-md animate-bounce">
            +30 Points! 🎉
          </div>
        )}

      </div>
    </div>
  );
};

export default DailyChallengePage;
