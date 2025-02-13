'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import PocketBase from 'pocketbase';

const SettingsPage = () => {
  const router = useRouter();
  const pb = new PocketBase('http://127.0.0.1:8090'); // Adjust if needed

  // Basic user info
  const [username, setUsername] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  // For changing username
  const [newUsername, setNewUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);

  // For toggling a newsletter subscription
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState<boolean>(false);
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null);

  // Optional leveling system
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

  // On mount, check auth & load user data
  useEffect(() => {
    (async () => {
      try {
        const user = pb.authStore.model;
        if (!user) {
          router.push('/login');
          return;
        }
        setUsername(user.username || '');
        setUserId(user.id || '');
        setTotalPoints(user.totalPoints || 0);

        // If you have a 'subscribeToNewsletter' field in the DB, set it:
        if (typeof user.subscribeToNewsletter !== 'undefined') {
          setSubscribeToNewsletter(user.subscribeToNewsletter);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      }
    })();
  }, [router, pb]);

  // Logout
  const handleLogout = async () => {
    try {
      pb.authStore.clear();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  /**
   * Helper: fetch the full user record before any update
   * so we can resend all required fields.
   */
  const fetchCurrentUserRecord = async () => {
    if (!userId) return null;
    try {
      const record = await pb.collection('users').getOne(userId);
      return record;
    } catch (error) {
      console.error('Error fetching user record:', error);
      return null;
    }
  };

  // Handle Username Update
  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      setUsernameMessage('Username cannot be blank.');
      return;
    }
    if (!userId) return;

    const userRecord = await fetchCurrentUserRecord();
    if (!userRecord) {
      setUsernameMessage('Failed to retrieve current user record.');
      return;
    }

    try {
      await pb.collection('users').update(userId, {
        // Adjust to your actual schema field names if they differ
        email: userRecord.email,
        emailVisibility: userRecord.emailVisibility,
        verified: userRecord.verified,
        totalPoints: userRecord.totalPoints,
        subscribeToNewsletter: userRecord.subscribeToNewsletter,

        // Update username
        username: newUsername.trim(),
      });

      // Update local state
      setUsername(newUsername.trim());
      setUsernameMessage('Username successfully updated!');
      setNewUsername('');
    } catch (error: any) {
      console.error('Error updating username:', error);
      setUsernameMessage(error?.message || 'Failed to update username.');
    }
  };

  // Handle Newsletter Toggle
  const handleNewsletterToggle = async () => {
    if (!userId) return;

    const userRecord = await fetchCurrentUserRecord();
    if (!userRecord) {
      setNewsletterMessage('Failed to retrieve current user record.');
      return;
    }

    try {
      const newStatus = !subscribeToNewsletter;

      await pb.collection('users').update(userId, {
        email: userRecord.email,
        emailVisibility: userRecord.emailVisibility,
        verified: userRecord.verified,
        totalPoints: userRecord.totalPoints,
        username: userRecord.username,

        subscribeToNewsletter: newStatus,
      });

      // Update state
      setSubscribeToNewsletter(newStatus);
      setNewsletterMessage(
        newStatus
          ? 'You are now subscribed to the newsletter!'
          : 'You have unsubscribed from the newsletter.'
      );
    } catch (error: any) {
      console.error('Error toggling newsletter subscription:', error);
      setNewsletterMessage(error?.message || 'Failed to update subscription.');
    }
  };

  return (
    <>
      {/* Set favicon and meta */}
      <Head>
        <title>My Settings</title>
        <link rel="icon" href="/favivon.ico" type="image/png" />
      </Head>

      {/* Use the same gradient background as LessonsPage */}
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


          {/* Main Content - EXACT same as LessonsPage: bg-[#F0F8E1] */}
          <div className="bg-[#F0F8E1] p-8 flex-1 overflow-y-auto rounded-r-lg">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#007C55]">Settings</h1>
              <p className="mt-2 text-xl text-[#007C55]">
                Level: {userLevel} | Language: Lithuanian
              </p>
              <p className="mt-1 text-lg text-[#007C55]">
                Logged in as: <span className="font-bold">{username}</span>
              </p>
              <img
                src="/images/FlagLithuanian.png"
                alt="Lithuanian Flag"
                width="125"
                height="125"
                className="mx-auto mt-2"
              />
            </div>

            <hr className="my-6 border-gray-300" />

            {/* Settings Content */}
            <div className="max-w-md mx-auto space-y-10">
              {/* Change Username */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Change Username</h2>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="New Username"
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <button
                  onClick={handleUsernameChange}
                  className="bg-[#046A38] text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Update Username
                </button>
                {usernameMessage && (
                  <p className="mt-2 p-2 rounded bg-[#e6f6ee] text-green-800">
                    {usernameMessage}
                  </p>
                )}
              </div>

              {/* Subscribe to Newsletter (boolean toggle) */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Newsletter Subscription</h2>

                <label className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    checked={subscribeToNewsletter}
                    onChange={handleNewsletterToggle}
                    className="h-5 w-5 text-green-600"
                  />
                  <span className="text-gray-800">Subscribe to our weekly newsletter</span>
                </label>

                {newsletterMessage && (
                  <p className="mt-2 p-2 rounded bg-[#e6f6ee] text-green-800">
                    {newsletterMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
