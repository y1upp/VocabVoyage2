'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PocketBase from 'pocketbase';

const BlankPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [newsArticles, setNewsArticles] = useState<{ title: string; source: { name: string }; url: string }[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isHowItWorksVisible, setIsHowItWorksVisible] = useState(false);

  const pb = new PocketBase('http://127.0.0.1:8090');
  const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 18) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
};

const [toDoLessons, setToDoLessons] = useState<{ lessonName: string; moduleName: string }[]>([]);


  // Define Leveling System
  const getLevel = (points: number) => {
    if (points >= 4000) return 7;
    if (points >= 2000) return 6;
    if (points >= 1000) return 5;
    if (points >= 500) return 4;
    if (points >= 250) return 3;
    if (points >= 100) return 2;
    return 1;
  };

  // Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = pb.authStore.model;
      if (user) {
        setUsername(user.username);
        setTotalPoints(user.totalPoints || 0);
      } else {
        router.push('/login');
      }
    };
    fetchUserData();
  }, [router]);

  useEffect(() => {
    const fetchToDoLessons = async () => {
      try {
        const user = pb.authStore.model;
        if (!user || !user.id) {
          console.error("❌ No authenticated user found.");
          return;
        }
  
        console.log("✅ User ID:", user.id);
  
        // Fetch all available lessons
        console.log("🔄 Fetching all lessons...");
        const allLessons = await pb.collection('Lesson').getFullList({
          fields: 'id,lessonName,moduleName',
        });
  
        console.log("✅ Fetched Lessons:", allLessons.length);
  
        // Fetch user's completed lessons 
        console.log("🔄 Fetching user's completed lessons...");
        const completedLessons = await pb.collection('user_lessons').getFullList({
          filter: `userId = "${user.id}" && isCompleted = true`,
          fields: 'lessonId',
        });
  
        console.log("✅ Completed Lessons:", completedLessons.length);
  
        // Extract completed lesson IDs
        const completedLessonIds = new Set(completedLessons.map((entry) => entry.lessonId));
  
        // Find lessons the user hasn't completed
        const missingLessons = allLessons.filter((lesson) => !completedLessonIds.has(lesson.id));
  
        console.log("✅ Missing Lessons:", missingLessons.length);
  
        setToDoLessons(missingLessons.map((lesson) => ({
          lessonName: lesson.lessonName || "Unnamed Lesson",
          moduleName: lesson.moduleName || "Unknown Module",
        })));
  
      } catch (error) {
        console.error("❌ Error fetching to-do lessons:", error);
      }
    };
  
    fetchToDoLessons();
  }, []);
  
  // Fetch Lithuanian News
  useEffect(() => {
    const fetchNews = async () => {
      const url = `https://newsapi.org/v2/everything?q=lithuania&language=lt&apiKey=7f0b30a83f704e34a08594ef0d6ea0a7`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'ok' && data.articles) {
          setNewsArticles(data.articles);
        } else {
          console.error("News API returned an error:", data);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, []);

  // Fetch Leaderboard Data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const users = await pb.collection('users').getFullList({
          sort: '-totalPoints',
          fields: 'username,totalPoints',
        });
        setLeaderboard(users);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };
    fetchLeaderboard();
  }, []);

  const userLevel = getLevel(totalPoints);
  const language = 'Lithuanian';

  const handleLogout = async () => {
    try {
      pb.authStore.clear();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600">
      {/* Background Flag Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/a/a3/Flag_of_Lithuania.svg')",
        }}
      ></div>

      {/* Main Container */}
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
<div className="bg-yellow-50 p-8 flex-1 h-full overflow-y-auto home-scrollbar">
  <div className="text-center mb-8">
    {/* Dynamic Greeting */}
    <h1 className="text-4xl font-bold text-black">
      {getGreeting()}, {username || 'Guest'}
    </h1>
    {/* Paragraphs in black */}
    <p className="mt-2 text-xl text-black">
      Level: {userLevel} | Language: {language}
    </p>
    <p className="mt-1 text-lg text-black">
      Total Points: <span className="font-bold">{totalPoints}</span>
    </p>

    {/* Flag */}
    <img
      src="/images/FlagLithuanian.png"
      alt="Lithuanian Flag"
      width="125"
      height="125"
      className="mx-auto mt-2"
    />
  </div>

  {/* Action Buttons */}
  <div className="space-y-6">
    {/* Toggle Button for How It Works */}
    <button
  onClick={() => setIsHowItWorksVisible(!isHowItWorksVisible)}
  className="bg-yellow-500 text-white py-2 px-4 rounded-lg shadow-md text-md 
             hover:bg-yellow-600 transition duration-200 mx-auto block w-auto"
>
  {isHowItWorksVisible ? 'Hide How It Works ⬆️' : 'Show How It Works ⬇️'}
</button>


    {/* Collapsible How It Works Section */}
    {isHowItWorksVisible && (
      <div className="bg-yellow-100 p-6 rounded-lg shadow-lg mt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">📖 How VocabVoyage Works</h2>
        <p className="text-gray-700">
          Welcome to <span className="font-bold">VocabVoyage</span>, your interactive language-learning platform! Here’s how you can get started:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-800">
          <li><strong>📚 Lessons:</strong> Explore structured lessons to build your vocabulary.</li>
          <li><strong>🔤 Word Bank:</strong> Words you have matched and saved in lessons will appear here!</li>
          <li><strong>🎧 Listening Lessons:</strong> Improve your pronunciation and comprehension with interactive listening exercises.</li>
          <li><strong>📖 Reading Materials:</strong> Practice reading comprehension with carefully selected texts.</li>
          <li><strong>🔥 Daily Challenge:</strong> Earn points by answering a new challenge every day.</li>
          <li><strong>🏆 Leaderboard:</strong> Compete with others by gaining points.</li>
          <li><strong>🎯 Tests:</strong> Unlock and take tests after completing Modules.</li>
          <li><strong>⚔️ Quiz Battle:</strong> Compete in real-time against other players!</li>
          <li><strong>📖 Scroll down to see your To-Do list!</strong></li>
        </ul>
        <p className="mt-4 text-gray-700">
          🎯 <strong>Earn Points:</strong> Gain points for learning new words in lessons and for completing Listening lessons! Keep progressing to level up. 🚀
        </p>
      </div>
    )}
                                <button
                                onClick={() => router.push('/lessons')}
                                className="w-full bg-yellow-400 text-gray-800 py-6 px-8 rounded-lg shadow-lg text-lg text-left hover:bg-yellow-300"
                                >
                                  Jump to the Lessons Page!
                                  </button>
                                  </div>
                                  <hr className="my-6 border-gray-400" />
                                  
                                  {/* Lithuanian News Section */}
                                  <div className="mt-8">
                                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Latest Lithuanian News</h2>
                                    {newsArticles.length > 0 ? (
                                      <div className="space-y-4">
                                        {newsArticles.slice(0, 3).map((article, index) => (
                                          <a 
                                          key={index} 
                                          href={article.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="block bg-yellow-400 p-4 rounded-lg shadow-lg hover:bg-yellow-300"
                                          >
                                            <h3 className="text-lg font-bold text-black">{article.title}</h3>
                                            <p className="text-sm text-gray-800">{article.source.name}</p>
                                            </a>
                                          ))}
                                          </div>
                                          ) : (
                                          <p>Loading news...</p>
                                          )}
                                          </div>
                                          
                                          {/* To-Do List Section */}
                                          <div 
                                          className="p-6 rounded-lg shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl mt-10" // Added margin-top for spacing
                                          style={{ backgroundColor: '#F5A623', color: '#333' }}
                                          >
                                            <h2 className="text-2xl font-bold mb-6 text-center text-white">📌 Your To-Do List</h2>
                                            {toDoLessons.length > 0 ? (
                                              <ul className="space-y-4">
                                                {toDoLessons.slice(0, 5).map((lesson, index) => (
                                                  <li 
                                                  key={index} 
                                                  className="p-4 bg-orange-300 rounded-lg shadow-md flex items-center justify-between transform transition-all hover:scale-105 hover:bg-orange-400"
                                                  >
                                                    <div>
                                                      <strong className="block text-lg">{lesson.moduleName}</strong>
                                                      <span className="text-sm text-gray-700">{lesson.lessonName}</span>
                                                      </div>
                                                      <button 
                                                      onClick={() => router.push('/lessons')} 
                                                      className="text-white bg-orange-600 px-4 py-2 rounded-lg shadow-md hover:bg-orange-700 transition-all"
                                                      >
                                                        Start →
                                                        </button>
                                                        </li>
                                                      ))}
                                                      </ul>
                                                      ) : (
                                                      <p className="text-center text-white text-lg">🎉 All lessons completed! Great job!</p>
                                                      )}
                                                      {toDoLessons.length > 0 && (
                                                        <div className="flex justify-center mt-6">
                                                          <button 
                                                          onClick={() => router.push('/lessons')}
                                                          className="bg-orange-700 text-white py-3 px-6 rounded-lg shadow-md transition-all hover:bg-orange-800 hover:shadow-lg hover:scale-110 active:scale-100"
                                                          >
                                                            Continue Learning 🚀
                                                            </button>
                                                            </div>
                                                          )}
                                                          </div>
                                                          </div>
                                                          {/* Vertical Divider */}
                                                          
                                                          <div className="w-[2px] bg-yellow-300"></div>
                                                          
                                                          {/* Right Section */}
                                                          
                                                          <div className="p-6 bg-yellow-200 flex flex-col space-y-8 h-full overflow-y-auto home-scrollbar">
                                                            {/* Daily Challenge */}
                                                            <div 
                                                            className="p-6 rounded-lg shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl" 
                                                            style={{ backgroundColor: '#FFDAC1', color: '#333' }}
                                                            >
                                                              <h2 className="text-xl font-bold mb-4 text-center">🔥 Daily Challenge 🔥</h2>
                                                              <p className="mb-4 text-center">Get these words correct and earn points!</p>
                                                              <div className="flex justify-center">
                                                                <button 
                                                                onClick={() => router.push('/daily-challenge')} 
                                                                className="
                                                                bg-yellow-500 text-white py-3 px-6 rounded-lg shadow-md transition-all 
                                                                hover:bg-yellow-600 hover:shadow-lg hover:scale-110 active:scale-100"
                                                                >
                                                                  Start 🚀
                                                                  </button>
                                                                  </div>
                                                                  </div>
                                                                  
                                                                  {/* Leaderboard */}
                                                                  <div 
                                                                  className="p-6 rounded-lg shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl" 
                                                                  style={{ backgroundColor: '#E2F0CB', color: '#333' }}
                                                                  >
                                                                    <h2 className="text-xl font-bold mb-4 text-center">🏆 Leaderboard 🏆</h2>
                                                                    <ul className="space-y-2">
                                                                      {leaderboard.length > 0 ? (
                                                                        leaderboard.slice(0, 5).map((user, index) => (
                                                                        <li 
                                                                        key={user.id} 
                                                                        className="text-lg p-2 rounded-md transition-all 
                                                                        hover:bg-green-300 hover:shadow-md"
                                                                        >
                                                                          <strong>{index + 1}. {user.username}</strong> - {user.totalPoints} points
                                                                          </li>
                                                                          ))
                                                                        ) : (
                                                                        <p className="text-center">No leaderboard data available.</p>
                                                                        )}
                                                                        </ul>
                                                                        </div>
                                                                        {/* Test Button */}
                                                                        <div 
                                                                        className="p-6 rounded-lg shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl" 
                                                                        style={{ backgroundColor: '#ADD8E6', color: '#333' }}
                                                                        >
                                                                          <h2 className="text-xl font-bold mb-4 text-center">🎯 Your Tests! 🎯</h2>
                                                                          <div className="flex justify-center">
                                                                            <button 
                                                                            onClick={() => router.push('/test')} 
                                                                            className="
                                                                            bg-blue-500 text-white py-3 px-6 rounded-lg shadow-md transition-all 
                                                                            hover:bg-blue-600 hover:shadow-lg hover:scale-110 active:scale-100
                                                                            "
                                                                            >
                                                                              Start Test 🚀
                                                                              </button>
                                                                              </div>
                                                                              </div>
                                                                              {/* Quiz Battle Button */}
                                                                              <div 
                                                                              className="p-6 rounded-lg shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl" 
                                                                              style={{ backgroundColor: '#FFD700', color: '#333' }}
                                                                              >
                                                                                <h2 className="text-xl font-bold mb-4 text-center">⚔️ Quiz Battle ⚔️</h2>
                                                                                <p className="mb-4 text-center">Compete against other players!</p>
                                                                                <div className="flex justify-center">
                                                                                  <button 
                                                                                  onClick={() => router.push('/quiz')} 
                                                                                  className="
                                                                                  bg-red-500 text-white py-3 px-6 rounded-lg shadow-md transition-all 
                                                                                  hover:bg-red-600 hover:shadow-lg hover:scale-110 active:scale-100
                                                                                  "
                                                                                  >
                                                                                    Join Battle 🚀
                                                                                    </button>
                                                                                    </div>
                                                                                    </div>
                                                                                    </div>
                                                                                    </div>
                                                                                    </div>
                                                                                    );
                                                                                  };

export default BlankPage;
