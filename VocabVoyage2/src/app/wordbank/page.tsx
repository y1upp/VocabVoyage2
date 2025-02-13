"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PocketBase from "pocketbase";

const WordBankPage = () => {
  const router = useRouter();
  const pb = new PocketBase("http://127.0.0.1:8090");

  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [learnedWords, setLearnedWords] = useState<any[]>([]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = pb.authStore.model;
      console.log("Logged-in user:", user); // Debugging log

      if (user) {
        setUsername(user.username);
        setUserId(user.id);
        fetchLearnedWords(user.id);
      } else {
        router.push("/login"); // Redirect if not logged in
      }
    };
    fetchUserData();
  }, [router, pb.authStore]);

  // Fetch words that the user has learned
  const fetchLearnedWords = async (userId: string) => {
    try {
      console.log("Fetching learned words for user:", userId);

      // Fetch user progress where Learned = true
      const userProgress = await pb.collection("user_words").getFullList(200, {
        filter: `userId = "${userId}" && Learned = true`,
      });

      console.log("User progress entries:", userProgress); // Debugging log

      if (userProgress.length === 0) {
        console.log("No words marked as learned for this user.");
        setLearnedWords([]);
        return;
      }

      // Extract all wordIds
      const wordIds = userProgress.map((progress) => progress.wordId);
      console.log("Word IDs to fetch:", wordIds); // Debugging log

      if (wordIds.length === 0) {
        setLearnedWords([]);
        return;
      }

      // Fetch words using wordId
      const learnedWordsResponse = await pb.collection("words").getFullList(200, {
        filter: wordIds.map(id => `id = "${id}"`).join(" || "),
      });

      console.log("Fetched learned words:", learnedWordsResponse); // Debugging log
      setLearnedWords(learnedWordsResponse);
    } catch (error) {
      console.error("❌ Error fetching learned words:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      pb.authStore.clear();
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Navigation helpers
  const goToHomePage = () => router.push("/blank");
  const goToLessons = () => router.push("/lessons");
  const goToListening = () => router.push("/listening"); // Added helper
  const goToSettings = () => router.push("/settings");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600">
      <div className="w-[90%] max-w-screen-2xl h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden flex">

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
        <div className="bg-[#F0F8E1] p-8 flex-1 flex flex-col">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#007C55]">Word Bank</h1>
            <p className="mt-2 text-xl text-[#007C55]">Manage your vocabulary</p>
          </div>

          <hr className="my-6 border-gray-300" />

          {/* Word Bank List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <h2 className="text-2xl font-semibold text-[#007C55]">Learned Words</h2>
            <div className="grid grid-cols-2 gap-4">
              {learnedWords.length > 0 ? (
                learnedWords.map((word: any) => (
                  <div
                    key={word.id}
                    className="p-4 rounded-lg shadow-md bg-green-200 text-black"
                  >
                    <strong>{word.EnglishSpelling}</strong> - {word.LithuanianSpelling}
                    <span className="ml-2 text-green-600">(Learned)</span>
                  </div>
                ))
              ) : (
                <p>No learned words yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordBankPage;
