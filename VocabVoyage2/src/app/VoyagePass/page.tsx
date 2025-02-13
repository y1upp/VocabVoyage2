'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import PocketBase from 'pocketbase';

// Define the Reward Type
type Reward = {
  id: string;
  name: string;
  type: string;
  image_url: string;
  level: number;
};

const VoyagePassPage = () => {
  const router = useRouter();
  const pb = new PocketBase('http://127.0.0.1:8090');

  // User state
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<string[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [claimedItem, setClaimedItem] = useState<Reward | null>(null);
  
  const handleLogout = async () => {
    try {
      pb.authStore.clear();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Function to determine user level
  const getLevel = (points: number) => {
    if (points >= 4000) return 7;
    if (points >= 2000) return 6;
    if (points >= 1000) return 5;
    if (points >= 500) return 4;
    if (points >= 250) return 3;
    if (points >= 100) return 2;
    return 1;
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = pb.authStore.model;
        if (!user) {
          router.push('/login');
          return;
        }
        setTotalPoints(user.totalPoints || 0);
        setUserLevel(getLevel(user.totalPoints || 0));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [router]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const itemsData = await pb.collection('items').getFullList({
          sort: 'level',
        });
  
        // Generate full PocketBase file URLs
        const formattedItems = itemsData.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          image_url: item.image ? `${pb.baseUrl}/api/files/items/${item.id}/${item.image}` : "/default-placeholder.png",
          level: item.level,
        }));
  
        setRewards(formattedItems);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    };
  
    fetchRewards();
  }, []);
  
  
  


  // Fetch user's claimed rewards
  useEffect(() => {
    const fetchClaimedRewards = async () => {
      try {
        const user = pb.authStore.model;
        if (!user) return;

        const claimedItems = await pb.collection('user_inventory').getFullList({
          filter: `user_id="${user.id}"`,
        });

        setClaimedRewards(claimedItems.map(item => item.item_id)); // Store claimed reward IDs
      } catch (error) {
        console.error("Error fetching claimed rewards:", error);
      }
    };
    fetchClaimedRewards();
  }, []);

  // Claim Reward Function
  const claimReward = async (reward: Reward) => {
    try {
      const user = pb.authStore.model;
      if (!user) return;
  
      if (claimedRewards.includes(reward.id)) {
        alert("You have already claimed this reward!");
        return;
      }
  
      await pb.collection('user_inventory').create({
        user_id: user.id,
        item_id: reward.id,
        item_name: reward.name,
        item_type: reward.type,
        image_url: reward.image_url,
      });
  
      // Show modal with claimed item
      setClaimedItem(reward);
      setShowModal(true);
  
      // Update claimed rewards state
      setClaimedRewards((prev) => [...prev, reward.id]);
    } catch (error) {
      console.error("Error claiming reward:", error);
    }
  };
  

  return (
    <>

    
      <Head>
        <title>VoyagePass</title>
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

          {/* Main VoyagePass Section */}
          {showModal && claimedItem && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
    <div className="bg-white rounded-lg shadow-2xl p-6 text-center max-w-sm w-[300px] border-4 border-green-500 relative">
      <h2 className="text-2xl font-bold text-green-600 flex items-center justify-center space-x-2">
        🎉 <span>Reward Claimed!</span>
      </h2>
      
      {/* Centered and Resized Image */}
      <div className="flex justify-center mt-4">
        <img 
          src={claimedItem.image_url} 
          alt={claimedItem.name} 
          className="w-28 h-28 object-contain rounded-md border-2 border-gray-300 shadow-md"
        />
      </div>

      {/* Reward Name & Level */}
      <p className="text-lg font-semibold mt-4">{claimedItem.name}</p>
      <p className="text-gray-600">Level {claimedItem.level}</p>

      {/* Close Button */}
      <button 
        onClick={() => setShowModal(false)} 
        className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        OK
      </button>
    </div>
  </div>
)}

          <div className="bg-[#F0F8E1] p-8 flex-1 overflow-hidden rounded-r-lg flex flex-col">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#007C55]">🚀 VoyagePass</h1>
              <p className="mt-2 text-xl text-[#007C55]">Unlock exclusive rewards as you level up!</p>
              <p className="text-lg text-gray-700 mt-2">Your Level: <span className="font-bold">{userLevel}</span></p>
            </div>
            <div className="relative w-[90%] mx-auto mt-4">
  <div className="w-full h-4 bg-gray-300 rounded-full relative">
    <div 
      className="h-4 bg-blue-500 rounded-full transition-all duration-500" 
      style={{ width: `${(userLevel / 7) * 100}%` }} 
    />

    {/* Progress Markers for Each Level */}
    {rewards.map((reward) => (
      <div 
        key={reward.id} 
        className="absolute w-2 h-6 bg-gray-500 bottom-[-6px]" 
        style={{ 
          left: `${(reward.level / 7) * 100}%`, 
          transform: 'translateX(-50%)' 
        }}
      />
    ))}
  </div>
</div>


<div className="relative w-full overflow-x-auto flex items-center space-x-6 px-6 py-4">
  {rewards.length > 0 ? (
    rewards.map((reward) => (
      <div key={reward.id} className="relative flex flex-col items-center w-[150px]">
        {/* Clickable Reward Box */}
        <button 
          onClick={() => userLevel >= reward.level && !claimedRewards.includes(reward.id) ? claimReward(reward) : null}
          className={`w-32 h-32 p-4 border-4 rounded-lg transition-all duration-300 ${
            userLevel >= reward.level ? (claimedRewards.includes(reward.id) ? 'border-gray-400 opacity-50 cursor-not-allowed' : 'border-green-500 cursor-pointer hover:scale-105') : 'border-gray-400 opacity-50'
          }`}
        >
          <img src={reward.image_url} alt={reward.name} className="w-full h-full object-cover rounded-md" />
        </button>

        {/* Reward Name */}
        <span className="mt-2 text-gray-800 font-semibold">{reward.name}</span>
        <span className="text-sm text-gray-600">Level {reward.level}</span>
      </div>
    ))
  ) : (
    <p className="text-gray-500 text-center">No rewards available.</p>
  )}
</div>




          </div>
        </div>
      </div>
    </>
  );
};

export default VoyagePassPage;
