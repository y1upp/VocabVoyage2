'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PocketBase from 'pocketbase';

// Define a type for all answers (including correct answers and user's answers)
interface Answer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const PlacesTestPage = () => {
  const router = useRouter();
  const pb = new PocketBase('http://127.0.0.1:8090');

  // State to hold the fetched words and user answers
  const [words, setWords] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]); // To store the answers for each word
  const [score, setScore] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false); // State to toggle confirmation screen
  const [showResults, setShowResults] = useState(false); // State to toggle results screen
  const [allAnswers, setAllAnswers] = useState<Answer[]>([]); // State to store all answers
  const [showBackConfirmation, setShowBackConfirmation] = useState(false); // State to toggle confirmation for back

  // Fetch words for the Intro module test (lesson IDs: kk4cu8sf4tc0580 and 34l37r61q6lvzip)
  useEffect(() => {
    const fetchWords = async () => {
      try {
        // Fetch all words (no LessonId filter here)
        const wordsResponse = await pb.collection('words').getList(1, 200); 

        // Log the response to debug
        console.log("Fetched words:", wordsResponse);

        // Filter words manually based on the LessonId
        const filteredWords = wordsResponse.items.filter(word => 
          word.LessonId === "zid81656a163vm3" || word.LessonId === "2455439j17ztd9k" || word.LessonId === "08ve126is5d1605"
        );

        // Check if words are fetched correctly
        if (filteredWords.length > 0) {
          // Set the filtered words to be displayed
          setWords(filteredWords);
          setUserAnswers(new Array(filteredWords.length).fill(''));  // Initialize userAnswers state
        } else {
          console.log("No words found for the selected lessons.");
          setWords([]);  // Set words to empty if no results
        }
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };

    fetchWords();
  }, []); // Empty dependency array to run only once when the component is mounted

  // Handle the user answer change
  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = value;
    setUserAnswers(updatedAnswers);
  };

  // Submit the answers and calculate score
  const handleSubmit = () => {
    let newScore = 0;
    const allAnswered: Answer[] = []; // Explicitly type the array here
    words.forEach((word, index) => {
      // Trim the user's input and the correct answer for spaces and ensure case-insensitive comparison
      const userAnswer = userAnswers[index].trim().toLowerCase();
      const correctAnswer = word.EnglishSpelling.trim().toLowerCase();

      // Check if the answers match
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) {
        newScore += 1;
      }

      // Save each answer (whether correct or incorrect)
      allAnswered.push({
        question: word.LithuanianSpelling,
        userAnswer: userAnswers[index],
        correctAnswer: word.EnglishSpelling,
        isCorrect
      });
    });

    setScore(newScore);
    setAllAnswers(allAnswered);
    setShowResults(true);  // Show results after submission
  };

  // Handle confirmation before submission
  const handleConfirmation = () => {
    setShowConfirmation(true); // Show confirmation screen
  };

  // Close confirmation overlay
  const closeConfirmation = () => {
    setShowConfirmation(false);
  };

  // Handle when user confirms submission
  const confirmSubmission = () => {
    setShowConfirmation(false);
    handleSubmit(); // Submit answers after confirmation
  };

  // Handle showing the back confirmation
  const handleBackConfirmation = () => {
    setShowBackConfirmation(true); // Show back confirmation
  };

  // Close back confirmation overlay
  const closeBackConfirmation = () => {
    setShowBackConfirmation(false);
  };

  // Handle when user confirms back
  const confirmBack = () => {
    setShowBackConfirmation(false);
    router.push('/test'); // Navigate back to the tests page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600">
      <div className="w-[90%] max-w-screen-2xl h-[90vh] bg-[#c0d4c2] rounded-lg shadow-lg overflow-hidden flex flex-col items-center justify-center">

        {/* Confirmation Overlay */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
              <h2 className="text-2xl font-semibold mb-4 text-black">Are you sure you want to submit your answers?</h2>
              <div className="space-x-4">
                <button
                  onClick={confirmSubmission}
                  className="bg-yellow-500 text-white py-2 px-6 rounded-lg shadow-md transition-all hover:bg-yellow-600 hover:shadow-lg"
                >
                  Yes, Submit
                </button>
                <button
                  onClick={closeConfirmation}
                  className="bg-gray-500 text-white py-2 px-6 rounded-lg shadow-md transition-all hover:bg-gray-600 hover:shadow-lg"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Overlay */}
        {showResults && !showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg text-center">
              <h2 className="text-2xl font-semibold mb-4 text-black">Your Score: {score} / {words.length}</h2>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-black">All Answers:</h3>
                <div className="max-h-60 overflow-y-scroll mt-4">
                  <ul className="space-y-2">
                    {allAnswers.map((item, index) => (
                      <li key={index} className="text-left">
                        <p className="text-sm text-black">What does <strong>{item.question}</strong> mean in English?</p>
                        <p className={`text-xs ${item.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                          Your answer: {item.userAnswer}
                        </p>
                        <p className="text-xs text-green-500">Correct answer: {item.correctAnswer}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => router.push('/test')}
                className="bg-blue-500 text-white py-3 px-6 rounded-lg shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
              >
                Back to Tests
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Places Module Test</h1>
        <p className="text-xl text-gray-700 mb-4">Answer the questions below to test your knowledge of the Places module!</p>

        {/* Display the list of words */}
        <div className="w-full max-w-md space-y-4 overflow-y-auto h-[60vh] mb-4">
          {words.length > 0 ? (
            words.map((word, index) => (
              <div key={index} className="space-y-2">
                <p className="text-lg font-semibold text-black">
                  What does <span className="font-bold">{word.LithuanianSpelling}</span> mean in English?
                </p>
                <input
                  type="text"
                  value={userAnswers[index]}  // Bind the answer to each word
                  onChange={(e) => handleAnswerChange(index, e.target.value)}  // Update the state when the user types
                  className="w-full p-3 border rounded-lg text-black"  // Set text color to black
                  placeholder="Type your answer here"
                />
              </div>
            ))
          ) : (
            <p>No words found for the selected lessons.</p>
          )}
        </div>

        {/* Submit Button */}
        {!showConfirmation && !showResults && (
          <div className="text-center mt-4">
            <button
              onClick={handleConfirmation}
              className="bg-yellow-500 text-white py-3 px-6 rounded-lg shadow-md transition-all hover:bg-yellow-600 hover:shadow-lg"
            >
              Submit Answers
            </button>
          </div>
        )}
        
        <div className="mt-4">
            
            <button
            onClick={() => router.push('/test')} // This redirects directly to the tests page
            className="bg-red-500 text-white py-3 px-6 rounded-lg shadow-md transition-all hover:bg-red-600 hover:shadow-lg"
            >
                Back to Tests
                </button>
                </div>
                </div>
                </div>
                );
            };

export default PlacesTestPage;
