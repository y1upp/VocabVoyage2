'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PocketBase from 'pocketbase';

const LessonsPage = () => {
  const [words, setWords] = useState<any[]>([]);
  const [englishWords, setEnglishWords] = useState<any[]>([]);
  const [lithuanianWords, setLithuanianWords] = useState<any[]>([]);
  const [selectedPair, setSelectedPair] = useState<{ english: any | null; lithuanian: any | null }>({ english: null, lithuanian: null });
  const [matchedPairs, setMatchedPairs] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ message: string; color: string }>({ message: '', color: 'text-red-500' });
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const [isLessonCompleted, setIsLessonCompleted] = useState<boolean>(false); // Track lesson completion

  const pb = new PocketBase('http://127.0.0.1:8090'); // Local PocketBase URL

  useEffect(() => {
    const fetchUserAndWords = async () => {
      try {
        // Get logged-in user
        const user = pb.authStore.model;
        if (!user) {
          console.error('User not logged in.');
          return;
        }
        setUserId(user.id);

        // Fetch all words for the lesson
        const wordsResponse = await pb.collection('words').getList(1, 50, {
          filter: `LessonId="kvmti95y933dr85"`, // Adjust for the correct lesson
        });

        // Fetch user-specific progress
        const progressResponse = await pb.collection('user_words').getFullList({
          filter: `userId = "${user.id}"`,
        });

        // Merge words with user progress
        const wordsWithProgress = wordsResponse.items.map(word => {
          const progress = progressResponse.find(p => p.wordId === word.id);
          return {
            ...word,
            Learned: progress ? progress.Learned : false, // Default false if no progress
          };
        });

        setWords(wordsWithProgress);
        shuffleLists(wordsWithProgress);
      } catch (error) {
        console.error('Error fetching words or user:', error);
      }
    };

    fetchUserAndWords();
  }, []);

  // Shuffle into two separate arrays (English and Lithuanian)
  const shuffleLists = (words: any[]) => {
    const eng = [...words].sort(() => Math.random() - 0.5);
    const lit = [...words].sort(() => Math.random() - 0.5);

    setEnglishWords(eng);
    setLithuanianWords(lit);
  };

  // Handle selecting a word for English or Lithuanian
  const handleSelectWord = (word: any, type: 'english' | 'lithuanian') => {
    setSelectedPair(prev => ({
      ...prev,
      [type]: word,
    }));
  };

  useEffect(() => {
    if (selectedPair.english && selectedPair.lithuanian) {
      if (selectedPair.english.id === selectedPair.lithuanian.id) {
        setMatchedPairs(prev => [...prev, selectedPair.english.id]);
        setFeedback({ message: 'Matched!', color: 'text-green-500' }); // ✅ Green for correct matches
  
        // Save progress in user_words collection
        saveUserWordProgress(selectedPair.english.id);
      } else {
        setFeedback({ message: 'Not a match!', color: 'text-red-500' }); // ❌ Red for incorrect matches
      }
  
      setTimeout(() => {
        setSelectedPair({ english: null, lithuanian: null });
        setFeedback({ message: '', color: 'text-black' }); // Reset feedback
      }, 1000);
    }
  }, [selectedPair]);

  // Function to save progress in user_words
  const saveUserWordProgress = async (wordId: string) => {
    if (!userId) {
      console.error("User not found!");
      return;
    }
  
    try {
      console.log(`Checking if progress exists for user ${userId} and word ${wordId}`);
  
      // Check if the user already has progress for this word
      const progressRecords = await pb.collection('user_words').getList(1, 1, {
        filter: `userId = "${userId}" && wordId = "${wordId}"`,
      });
  
      let pointsEarned = 10; // Each word gives 10 points
  
      if (progressRecords.items.length > 0) {
        console.log("Progress exists, updating...");
        await pb.collection('user_words').update(progressRecords.items[0].id, { Learned: true, points: pointsEarned });
      } else {
        console.log("Progress does not exist, creating new record...");
        await pb.collection('user_words').create({
          userId,
          wordId,
          Learned: true,
          points: pointsEarned,
        });
      }
  
      // Add points to user total
      const user = await pb.collection('users').getOne(userId);
      const newTotalPoints = (user.totalPoints || 0) + pointsEarned;
  
      await pb.collection('users').update(userId, { totalPoints: newTotalPoints });
  
      console.log(`✅ User ${userId} gained ${pointsEarned} points! New total: ${newTotalPoints}`);
    } catch (error) {
      console.error('❌ Error saving user word progress:', error);
    }
  };
  
// Function to mark the lesson as completed
  const markLessonCompleted = async (lessonId: string) => {
    if (!userId) return;

    try {
      const existingRecord = await pb.collection('user_lessons').getList(1, 1, {
        filter: `userId = "${userId}" && lessonId = "${lessonId}"`,
      });

      if (existingRecord.items.length > 0) {
        await pb.collection('user_lessons').update(existingRecord.items[0].id, { isCompleted: true });
      } else {
        await pb.collection('user_lessons').create({
          userId,
          lessonId,
          isCompleted: true,
        });
      }

      console.log(`✅ Lesson ${lessonId} marked as completed for user ${userId}`);
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
    }
  };

  // Call markLessonCompleted when all words are matched
  useEffect(() => {
    if (matchedPairs.length === words.length && !isLessonCompleted) {
      setIsLessonCompleted(true); // Set the lesson as completed when all words are matched
    }
  }, [matchedPairs, words, isLessonCompleted]);
  // Determine button background color
  const getButtonColor = (word: any, selectedId: string | undefined) => {
    if (selectedId === word.id) {
      return 'bg-yellow-200';
    }
    if (word.Learned === true) {
      return 'bg-green-200'; // Show green if the user has learned this word
    }
    return 'bg-white';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600">
      <div className="w-[90%] max-w-screen-2xl h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden flex">
        {/* Sidebar */}
        <div className="bg-[#004A29] text-white p-6 flex flex-col w-[250px] rounded-l-lg">
          <h2 className="text-2xl font-bold mb-6">Menu</h2>
          <button
            onClick={() => router.push('/lessons')}
            className="mt-6 w-full bg-[#006744] hover:bg-[#009974] text-white p-3 rounded"
          >
            Back to Lessons
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-[#F0F8E1] p-8 flex-1 overflow-y-auto rounded-r-lg">
          
          {/* LESSON OVERVIEW / TEACHING SECTION */}
          <div className="p-6 bg-white rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold text-[#007C55] mb-4">Lesson Overview: Greetings 3</h2>
            <p className="text-gray-700 mb-4">
              This lesson covers helpful questions you might ask when you’re out and about:
              directions, costs, etc. Review these notes, then scroll down to practice matching
              English–Lithuanian pairs.
            </p>

            <ul className="list-disc list-inside text-gray-800 space-y-1">
  <li><strong>Nice to meet you</strong> — “Malonu susipažinti”</li>
  <li><strong>What’s your name?</strong> — “Koks tavo vardas?”</li>
  <li><strong>My name is...</strong> — “Mano vardas yra...”</li>
  <li><strong>See you later</strong> — “Iki pasimatymo”</li>
</ul>

<p className="text-gray-700 mt-4">
  These essential phrases will help you introduce yourself and greet people in Lithuanian. 
  Practice them in the matching game below to memorize them effectively!
</p>

          </div>

          {/* Feedback Message */}
          <div className={`text-center mb-4 text-xl ${feedback.color}`}>
            {feedback.message}
            </div>

          {/* Matching Game */}
          <div className="grid grid-cols-2 gap-4">
            {/* English Column */}
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl font-semibold text-center text-black">English Words</h2>
              {englishWords.map(word => (
                matchedPairs.includes(word.id) ? null : (
                  <button
                    key={`english-${word.id}`}
                    onClick={() => handleSelectWord(word, 'english')}
                    className={`p-4 text-black rounded-lg shadow-md transition-all hover:bg-gray-100 ${getButtonColor(
                      word,
                      selectedPair.english?.id
                    )}`}
                  >
                    {word.EnglishSpelling}
                  </button>
                )
              ))}
            </div>

            {/* Lithuanian Column */}
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl font-semibold text-center text-black">Lithuanian Words</h2>
              {lithuanianWords.map(word => (
                matchedPairs.includes(word.id) ? null : (
                  <button
                    key={`lithuanian-${word.id}`}
                    onClick={() => handleSelectWord(word, 'lithuanian')}
                    className={`p-4 text-black rounded-lg shadow-md transition-all hover:bg-gray-100 ${getButtonColor(
                      word,
                      selectedPair.lithuanian?.id
                    )}`}
                  >
                    {word.LithuanianSpelling}
                  </button>
                )
              ))}
            </div>
          </div>

          {/* "Complete Lesson" Button */}
          {isLessonCompleted && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  markLessonCompleted("kvmti95y933dr85"); // Use dynamic lessonId if necessary
                  router.push('/lessons'); // Redirect back to the lessons page
                }}
                className="bg-green-500 text-white p-4 rounded-lg transition-all hover:bg-green-600"
              >
                Complete Lesson
              </button>
            </div>
          )}




        </div>
      </div>
    </div>
  );
};

export default LessonsPage;
