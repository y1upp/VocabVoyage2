'use client';

import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import { useRouter } from 'next/navigation';

interface ReadingRecord {
  id: string;
  title: string;
  passage: string;
  english?: string;
  reading?: string;       // The File field
  difficulty?: number;    // 1 to 5
}

const ReadingPage = () => {
  const router = useRouter();
  const pb = new PocketBase('http://127.0.0.1:8090'); // Adjust if needed

  const [readings, setReadings] = useState<ReadingRecord[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

  // Navigation
  const goToHomePage = () => router.push('/blank');
  const goToLessonsPage = () => router.push('/lessons');
  const goToWordBank = () => router.push('/wordbank');
  const goToListeningPage = () => router.push('/listening');
  const goToSettingsPage = () => router.push('/settings');
  const handleLogout = () => {
    pb.authStore.clear();
    router.push('/login');
  };

  // 1) Initially, fetch *all* readings or none
  useEffect(() => {
    fetchReadings(null);
  }, []);

  // 2) A helper function to fetch by difficulty
  const fetchReadings = async (difficulty: number | null) => {
    try {
      let filterQuery = '';
      if (difficulty !== null) {
        // e.g., 'difficulty = 3'
        filterQuery = `difficulty = ${difficulty}`;
      }

      // Get full list with optional filter
      const result = await pb.collection('readings').getFullList<ReadingRecord>({
        sort: '-created',
        filter: filterQuery || '',
      });

      setReadings(result);
    } catch (error) {
      console.error('Error fetching readings:', error);
    }
  };

  // 3) Handle difficulty button clicks
  const handleDifficultyChange = (level: number) => {
    setSelectedDifficulty(level);
    fetchReadings(level);
  };

  // Same approach to play audio
  const handlePlayAudio = (readingItem: ReadingRecord) => {
    if (!readingItem.reading) return;
    const audioUrl = pb.getFileUrl(readingItem, readingItem.reading);
    const audio = new Audio(audioUrl);
    audio.play();
  };

  return (
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
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#007C55]">Reading</h1>
            <p className="mt-2 text-xl text-[#007C55]">
              Explore Lithuanian reading materials by difficulty!
            </p>
            <p className="mt-2 text-md text-[#007C55] max-w-lg mx-auto">
              You can also listen to the Lithuanian audio for some of these stories. 
              Try speaking along to improve your pronunciation!
            </p>
          </div>

          <hr className="my-6 border-gray-300" />

          {/* Difficulty Buttons */}
          <div className="flex space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleDifficultyChange(lvl)}
                className={`
                  px-4 py-2 rounded 
                  ${selectedDifficulty === lvl ? 'bg-green-600 text-white' : 'bg-white text-green-700'}
                  hover:bg-green-500 hover:text-white transition-colors
                `}
              >
                Difficulty {lvl}
              </button>
            ))}
          </div>

          {/* Reading List */}
          {readings.length > 0 ? (
            <div className="space-y-6">
              {readings.map((readingItem) => (
                <div key={readingItem.id} className="bg-white p-6 rounded-lg shadow-md">
                  {/* Title, passage, difficulty */}
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    {readingItem.title}
                    {readingItem.difficulty && (
                      <span className="ml-2 text-sm text-gray-500">
                        (Difficulty: {readingItem.difficulty})
                      </span>
                    )}
                  </h2>

                  <p className="text-gray-700 mb-3">{readingItem.passage}</p>

                  {/* English translation if available */}
                  {readingItem.english && (
                    <p className="text-gray-500 italic mb-4">
                      Translation: {readingItem.english}
                    </p>
                  )}

                  {/* Audio file, if present */}
                  {readingItem.reading && (
                    <button
                      onClick={() => handlePlayAudio(readingItem)}
                      className="bg-yellow-400 text-gray-800 py-2 px-4 rounded shadow hover:bg-yellow-300"
                    >
                      Play Audio
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-700">
                No readings found {selectedDifficulty ? `for difficulty ${selectedDifficulty}` : ''}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingPage;
