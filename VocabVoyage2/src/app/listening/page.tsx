'use client';

import React, { useEffect, useState } from 'react';
import PocketBase from 'pocketbase';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

/** The shape of each record in the "Listening" collection. */
interface ListeningRecord {
  id: string;
  lithuanian_phrase: string;
  english_translation: string;
  field: string;  // The audio file field
}

/** Shuffle helper (Fisher-Yates). */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** Get 'count' random distractors from 'allRecords', excluding 'excludeId'. */
function getRandomDistractors(
  allRecords: ListeningRecord[],
  excludeId: string,
  count: number
) {
  const others = allRecords.filter((r) => r.id !== excludeId);
  shuffleArray(others);
  return others.slice(0, count);
}

const ListeningPage = () => {
  const router = useRouter();
  const pb = new PocketBase('http://127.0.0.1:8090'); // Adjust if needed

  // ----------- Auth and Data -----------
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  // All records from "Listening" collection
  const [records, setRecords] = useState<ListeningRecord[]>([]);

  // ----------- GAME #1: Match Lithuanian -----------
  const [currentIndex1, setCurrentIndex1] = useState<number>(0);
  const [options1, setOptions1] = useState<ListeningRecord[]>([]);
  const [feedback1, setFeedback1] = useState<string>('');
  const [hasAnswered1, setHasAnswered1] = useState<boolean>(false);

  // ----------- GAME #2: Match English -----------
  const [currentIndex2, setCurrentIndex2] = useState<number>(0);
  const [options2, setOptions2] = useState<ListeningRecord[]>([]);
  const [feedback2, setFeedback2] = useState<string>('');
  const [hasAnswered2, setHasAnswered2] = useState<boolean>(false);

  // =========================
  //  1) Fetch user + records
  // =========================
  useEffect(() => {
    const user = pb.authStore.model;
    if (!user) {
      router.push('/login');
      return;
    }
    setUsername(user.username);
    setUserId(user.id);
    setTotalPoints(user.totalPoints || 0);

    const fetchRecords = async () => {
      try {
        const result = await pb.collection('Listening').getFullList<ListeningRecord>({
          sort: '-created',
        });
        setRecords(result);
      } catch (error) {
        console.error('Error fetching listening records:', error);
      }
    };
    fetchRecords();
  }, []); // Empty deps = only once on mount

  // =========================
  //  2) Build Game #1 Options
  // =========================
  useEffect(() => {
    if (records.length > 0 && currentIndex1 < records.length) {
      setFeedback1('');
      setHasAnswered1(false);
      const questionItem = records[currentIndex1];
      // Distinct from questionItem
      const distractors = getRandomDistractors(records, questionItem.id, 3);
      // Combine & shuffle
      const combined = shuffleArray([questionItem, ...distractors]);
      setOptions1(combined);
    }
  }, [records, currentIndex1]);

  // =========================
  //  3) Build Game #2 Options
  // =========================
  useEffect(() => {
    if (records.length > 0 && currentIndex2 < records.length) {
      setFeedback2('');
      setHasAnswered2(false);
      const questionItem = records[currentIndex2];
      const distractors = getRandomDistractors(records, questionItem.id, 3);
      const combined = shuffleArray([questionItem, ...distractors]);
      setOptions2(combined);
    }
  }, [records, currentIndex2]);

  // =========================
  //  Navigation Helpers
  // =========================
  const goToHomePage = () => router.push('/blank');
  const goToLessonsPage = () => router.push('/lessons');
  const goToWordBank = () => router.push('/wordbank');
  const goToSettings = () => router.push('/settings');
  const handleLogout = () => {
    pb.authStore.clear();
    router.push('/login');
  };

  // =========================
  //  Shared Audio Player
  // =========================
  const handlePlayAudio = (recordIndex: number) => {
    if (!records[recordIndex]) return;
    const item = records[recordIndex];
    const audioUrl = pb.getFileUrl(item, item.field);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // =========================
  //  GAME #1 Logic
  // =========================
  const handleChoiceClick1 = async (chosen: ListeningRecord) => {
    if (hasAnswered1) return;

    const correctItem = records[currentIndex1];
    if (chosen.id === correctItem.id) {
      // Correct guess => +30 points
      setFeedback1('Correct! +30 points');
      if (userId) {
        try {
          const newTotal = totalPoints + 30;
          await pb.collection('users').update(userId, { totalPoints: newTotal });
          setTotalPoints(newTotal);
        } catch (err) {
          console.error('Error updating totalPoints:', err);
        }
      }
    } else {
      // Incorrect
      setFeedback1(`Incorrect. The correct phrase was: ${correctItem.lithuanian_phrase}`);
    }
    setHasAnswered1(true);
  };

  const handleNext1 = () => {
    if (currentIndex1 < records.length - 1) {
      setCurrentIndex1(currentIndex1 + 1);
    } else {
      setFeedback1('Game Over! You finished all entries (Game #1).');
    }
  };

  // =========================
  //  GAME #2 Logic
  // =========================
  const handleChoiceClick2 = async (chosen: ListeningRecord) => {
    if (hasAnswered2) return;

    const correctItem = records[currentIndex2];
    if (chosen.id === correctItem.id) {
      // Correct => +50 points
      setFeedback2('Correct! +50 points');
      if (userId) {
        try {
          const newTotal = totalPoints + 50;
          await pb.collection('users').update(userId, { totalPoints: newTotal });
          setTotalPoints(newTotal);
        } catch (err) {
          console.error('Error updating totalPoints:', err);
        }
      }
    } else {
      // Incorrect
      setFeedback2(`Incorrect. The correct English was: ${correctItem.english_translation}`);
    }
    setHasAnswered2(true);
  };

  const handleNext2 = () => {
    if (currentIndex2 < records.length - 1) {
      setCurrentIndex2(currentIndex2 + 1);
    } else {
      setFeedback2('Game Over! You finished all entries (Game #2).');
    }
  };

  // Current items for each game
  const currentItem1 = records[currentIndex1];
  const currentItem2 = records[currentIndex2];

  return (
    <>
      <Head>
        <title>Listening Games</title>
        <link rel="icon" href="/favivon.ico" type="image/x-icon" />
      </Head>

      {/* Outer container with same gradient */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600">
        <div className="relative w-[90%] max-w-screen-2xl h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden flex">
          
          {/* Sidebar */}
<div className="bg-yellow-500 text-gray-800 p-6 flex flex-col w-[250px]">
  {/* VocabVoyage Logo */}
  <div className="flex items-center space-x-2 mb-6">
    <img src="/favicon.ico" alt="VocabVoyage Logo" className="w-6 h-6" />
    <h1 className="text-2xl font-bold">VocabVoyage</h1>
  </div>

  {/* Menu */}
  <h2 className="text-xl font-semibold mb-4">Menu</h2>
  <nav className="flex flex-col space-y-2">
    <button onClick={() => router.push('/blank')} className="bg-yellow-500 text-gray-800 rounded-md py-2 px-4 text-left hover:bg-gray-300 transition duration-200">
      🏠 Home
    </button>
    <button onClick={() => router.push('/lessons')} className="bg-yellow-500 text-gray-800 rounded-md py-2 px-4 text-left hover:bg-gray-300 transition duration-200">
      📚 Lessons
    </button>
    <button onClick={() => router.push('/wordbank')} className="bg-yellow-500 text-gray-800 rounded-md py-2 px-4 text-left hover:bg-gray-300 transition duration-200">
      📖 Word Bank
    </button>
    <button onClick={() => router.push('/listening')} className="bg-yellow-500 text-gray-800 rounded-md py-2 px-4 text-left hover:bg-gray-300 transition duration-200">
      🎧 Listening
    </button>
    <button onClick={() => router.push('/Reading')} className="bg-yellow-500 text-gray-800 rounded-md py-2 px-4 text-left hover:bg-gray-300 transition duration-200">
      📕 Reading
    </button>
    <button onClick={() => router.push('/badges')} className="bg-yellow-500 text-gray-800 rounded-md py-2 px-4 text-left hover:bg-gray-300 transition duration-200">
      🏅 Badges
    </button>

    {/* VoyagePass Button */}
    <button 
      onClick={() => router.push('/VoyagePass')} 
      className="mt-4 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
    >
      🚀 VoyagePass
    </button>

    {/* Inventory Button (Smaller than VoyagePass) */}
    <button 
      onClick={() => router.push('/inventory')} 
      className="mt-2 bg-green-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
    >
      🎒 Inventory
    </button>
  </nav>

  {/* Profile & Settings */}
  <div className="mt-auto space-y-2">
    <button onClick={() => router.push('/profile')} className="bg-yellow-500 text-gray-800 rounded-md py-2 px-4 text-left hover:bg-gray-300 transition duration-200">
      👤 Profile
    </button>
    <button onClick={() => router.push('/settings')} className="bg-yellow-500 text-gray-800 rounded-md py-2 px-4 text-left hover:bg-gray-300 transition duration-200">
      ⚙️ Settings
    </button>
    <button onClick={handleLogout} className="bg-red-500 text-white rounded-md py-2 px-4 text-left hover:bg-red-600 transition duration-200">
      🚪 Logout
    </button>
  </div>
</div>


          {/* Main Content */}
          <div className="bg-[#F0F8E1] p-8 flex-1 overflow-y-auto rounded-r-lg">
            {/* User info */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-[#007C55]">Listening Games</h1>
              <p className="mt-2 text-xl text-[#007C55]">
                Two Different Matching Games
              </p>
              {username && (
                <p className="mt-1 text-lg text-[#007C55]">
                  Logged in as: <span className="font-bold">{username}</span>
                </p>
              )}
              <p className="mt-1 text-md text-[#007C55]">
                Current Points: <span className="font-bold">{totalPoints}</span>
              </p>
            </div>

            <hr className="mb-6 border-gray-300" />

            {/* ======================================
                GAME #1: Match the Lithuanian Phrase
               ====================================== */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-10">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Game #1: Match the Lithuanian Phrase (Earn +30 points)
              </h2>

              {records.length === 0 ? (
                <p className="text-gray-700">No entries found in the Listening collection.</p>
              ) : (
                <>
                  {currentItem1 && currentIndex1 < records.length ? (
                    <>
                      <p className="mb-2 text-gray-600">
                        Question {currentIndex1 + 1} of {records.length}
                      </p>

                      <button
                        onClick={() => handlePlayAudio(currentIndex1)}
                        className="bg-yellow-400 text-gray-800 py-2 px-4 rounded shadow hover:bg-yellow-300"
                      >
                        Play Audio
                      </button>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {options1.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleChoiceClick1(option)}
                            disabled={hasAnswered1}
                            className="bg-white border-2 border-[#046A38] text-[#046A38] py-2 px-4 rounded shadow hover:bg-[#046A38] hover:text-white transition-colors disabled:opacity-50"
                          >
                            {option.lithuanian_phrase}
                          </button>
                        ))}
                      </div>

                      {feedback1 && (
                        <p className="mt-4 text-lg font-semibold text-blue-700">
                          {feedback1}
                        </p>
                      )}

                      {/* Next button if answered & not done */}
                      {hasAnswered1 && currentIndex1 < records.length - 1 && (
                        <button
                          onClick={handleNext1}
                          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                          Next
                        </button>
                      )}

                      {hasAnswered1 && currentIndex1 === records.length - 1 && (
                        <p className="mt-4 font-semibold text-red-600">
                          Game Over! You finished all entries (Game #1).
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-700">
                      Game Over! You finished all entries (Game #1).
                    </p>
                  )}
                </>
              )}
            </div>

            {/* ==========================================
                GAME #2: Match the English Translation
               ========================================== */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Game #2: Match the English Translation (Earn +50 points)
              </h2>

              {records.length === 0 ? (
                <p className="text-gray-700">No entries found in the Listening collection.</p>
              ) : (
                <>
                  {currentItem2 && currentIndex2 < records.length ? (
                    <>
                      <p className="mb-2 text-gray-600">
                        Question {currentIndex2 + 1} of {records.length}
                      </p>

                      <button
                        onClick={() => handlePlayAudio(currentIndex2)}
                        className="bg-yellow-400 text-gray-800 py-2 px-4 rounded shadow hover:bg-yellow-300"
                      >
                        Play Audio
                      </button>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {options2.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleChoiceClick2(option)}
                            disabled={hasAnswered2}
                            className="bg-white border-2 border-[#046A38] text-[#046A38] py-2 px-4 rounded shadow hover:bg-[#046A38] hover:text-white transition-colors disabled:opacity-50"
                          >
                            {option.english_translation}
                          </button>
                        ))}
                      </div>

                      {feedback2 && (
                        <p className="mt-4 text-lg font-semibold text-blue-700">
                          {feedback2}
                        </p>
                      )}

                      {/* Next button if answered & not done */}
                      {hasAnswered2 && currentIndex2 < records.length - 1 && (
                        <button
                          onClick={handleNext2}
                          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                          Next
                        </button>
                      )}

                      {hasAnswered2 && currentIndex2 === records.length - 1 && (
                        <p className="mt-4 font-semibold text-red-600">
                          Game Over! You finished all entries (Game #2).
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-700">
                      Game Over! You finished all entries (Game #2).
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListeningPage;
