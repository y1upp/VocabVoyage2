'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import PocketBase from 'pocketbase';

const ProfilePage = () => {
  const router = useRouter();
  const pb = new PocketBase('http://127.0.0.1:8090');

  // User data
  const [username, setUsername] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [languagePreference, setLanguagePreference] = useState<string>('Lithuanian');
  const handleLogout = () => {
    pb.authStore.clear();
    router.push('/login');
  };
  // Get user level
  const getLevel = (points: number) => {
    if (points >= 4000) return 7;
    if (points >= 2000) return 6;
    if (points >= 1000) return 5;
    if (points >= 500) return 4;
    if (points >= 250) return 3;
    if (points >= 100) return 2;
    return 1;
  };

  const userLevel = getLevel(totalPoints);

  // Fetch user data
  useEffect(() => {
    (async () => {
      try {
        const user = pb.authStore.model;
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUsername(user.username || 'Unknown User');
        setUserId(user.id || '');
        setEmail(user.email || 'No email set');
        setTotalPoints(user.totalPoints || 0);
        setCreatedAt(new Date(user.created).toLocaleDateString());
        setProfilePicture(user.profilePicture ? pb.files.getUrl(user, user.profilePicture) : null);
        setLanguagePreference(user.language || 'Lithuanian');
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    })();
  }, [router]);

  // Navigation helpers
  const goToHomePage = () => router.push('/blank');
  const goToLessonsPage = () => router.push('/lessons');
  const goToWordBank = () => router.push('/wordbank');
  const goToSettings = () => router.push('/settings');

  return (
    <>
      <Head>
        <title>{username}'s Profile</title>
        <link rel="icon" href="/favicon.ico" type="image/png" />
      </Head>

      {/* Background Gradient */}
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

          {/* Main Profile Section */}
          <div className="bg-[#F0F8E1] p-8 flex-1 overflow-y-auto rounded-r-lg">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#007C55]">Profile</h1>
              <p className="mt-2 text-xl text-[#007C55]">
                Level: {userLevel} 🚀 | Language: {languagePreference}
              </p>
              <p className="mt-1 text-lg text-[#007C55]">
                Logged in as: <span className="font-bold">{username}</span>
              </p>
              <img
                src={profilePicture || '/images/default-avatar.png'}
                alt="Profile"
                className="w-32 h-32 rounded-full shadow-md mx-auto mt-4"
              />
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Profile Details */}
            <div className="max-w-md mx-auto space-y-6 text-gray-800">

              <div className="p-4 bg-white rounded-lg shadow-md">
                <p><strong>Email:</strong> {email}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-md">
                <p><strong>Total Points:</strong> {totalPoints}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-md">
                <p><strong>Joined:</strong> {createdAt}</p>
              </div>
            </div>

              
            </div>
          </div>
        </div>
      
    </>
  );
};

export default ProfilePage;
