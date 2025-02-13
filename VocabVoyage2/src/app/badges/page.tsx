'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PocketBase from 'pocketbase';
import Head from 'next/head';

const pb = new PocketBase('http://127.0.0.1:8090');

const BadgesPage = () => {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [wordCount, setWordCount] = useState<number>(0);
    const [lessonCount, setLessonCount] = useState<number>(0);
    const [totalPoints, setTotalPoints] = useState<number>(0);
    const [badges, setBadges] = useState<{ emoji: string; name: string; description: string }[]>([]);

    const handleLogout = async () => {
        try {
            pb.authStore.clear();
            router.push('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const authData = pb.authStore.model;
                if (!authData) {
                    router.push('/login');
                    return;
                }

                const loggedInUserId = authData.id;
                setUserId(loggedInUserId);

                // Fetch word count for user
                const words = await pb.collection('user_words').getFullList({
                    filter: `userId = "${loggedInUserId}"`,
                });
                setWordCount(words.length);

                // Fetch lesson count for user
                const lessons = await pb.collection('user_lessons').getFullList({
                    filter: `userId = "${loggedInUserId}"`,
                });
                setLessonCount(lessons.length);

                // Fetch total points from users collection
                const user = await pb.collection('users').getOne(loggedInUserId);
                setTotalPoints(user.totalPoints || 0);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [router]);

    useEffect(() => {
        const assignBadges = () => {
            let assignedBadges = [];

            // Word Collection Badges
            if (wordCount >= 1)
                assignedBadges.push({ emoji: '📝', name: 'First Steps!', description: 'Learnt your first word!' });
            if (wordCount >= 5)
                assignedBadges.push({ emoji: '📝', name: 'Early Collector', description: 'Learnt 5 words!' });
            if (wordCount >= 10)
                assignedBadges.push({ emoji: '📝', name: 'Beginner Word Collector', description: 'Learnt 10 words!' });
            if (wordCount >= 20)
                assignedBadges.push({ emoji: '📖', name: 'Growing Vocabulary', description: 'Learnt 20 words!' });
            if (wordCount >= 50)
                assignedBadges.push({ emoji: '📖', name: 'Word Enthusiast', description: 'Learnt 50 words!' });
            if (wordCount >= 100)
                assignedBadges.push({ emoji: '📚', name: 'Word Master', description: 'Learnt 100 words!' });

            // Lesson Completion Badges
            if (lessonCount >= 2)
                assignedBadges.push({ emoji: '🎓', name: 'Intro Completed!', description: 'Completed 2 lessons!' });
            if (lessonCount >= 5)
                assignedBadges.push({ emoji: '🎓', name: 'Beginner Learner', description: 'Completed 5 lessons!' });
            if (lessonCount >= 10)
                assignedBadges.push({ emoji: '🎓', name: 'Intermediate Scholar', description: 'Completed 10 lessons!' });
            if (lessonCount >= 20)
                assignedBadges.push({ emoji: '🏆', name: 'Advanced Learner', description: 'Completed 20 lessons!' });
            if (lessonCount >= 50)
                assignedBadges.push({ emoji: '🌟', name: 'Language Expert', description: 'Completed 50 lessons!' });

            // Points-Based Achievements
            if (totalPoints >= 100)
                assignedBadges.push({ emoji: '💰', name: 'Point Collector', description: 'Earned 100 points!' });
            if (totalPoints >= 500)
                assignedBadges.push({ emoji: '💎', name: 'Experienced Achiever', description: 'Earned 500 points!' });
            if (totalPoints >= 1000)
                assignedBadges.push({ emoji: '🏅', name: 'Elite Learner', description: 'Earned 1000 points!' });

            setBadges(assignedBadges);
        };

        assignBadges();
    }, [wordCount, lessonCount, totalPoints]);

    return (
        <>
            <Head>
                <title>Badges</title>
                <link rel="icon" href="/favicon.ico" type="image/png" />
            </Head>

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

<div className="bg-[#F0F8E1] p-8 flex-1 overflow-y-auto rounded-r-lg">
    <div className="text-center mb-8">
    <h1 className="text-4xl font-bold text-[#007C55]">🏅 Badges</h1>
    <p className="mt-2 text-xl text-[#007C55]">Earn and collect unique badges!</p>
    
    {/* Total Badges Earned */}
    <p className="mt-2 text-lg text-black font-semibold">
         <span className="text-[#007C55]">{badges.length}</span> out of <span className="text-[#007C55]">15</span> badges!
    </p>
</div>


                        <hr className="my-6 border-gray-300" />
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {badges.map((badge, index) => (
                                <div key={index} className="bg-white shadow-md p-4 rounded-lg text-center relative group">
                                    <span className="text-3xl text-black">{badge.emoji}</span>
                                    <p className="mt-2 font-semibold text-black">{badge.name}</p>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-700 text-white text-sm px-3 py-1 rounded-lg shadow-md">
                                    {badge.description}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default BadgesPage;
