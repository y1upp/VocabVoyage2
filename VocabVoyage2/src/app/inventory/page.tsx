'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import PocketBase from 'pocketbase';

// Define InventoryItem type
type InventoryItem = {
  id: string;
  name: string;
  type: string;
  image_url: string;
};

const InventoryPage = () => {
  const router = useRouter();
  const pb = new PocketBase('http://127.0.0.1:8090');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const handleLogout = async () => {
    try {
      pb.authStore.clear();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  useEffect(() => {
    const fetchUserInventory = async () => {
      try {
        const user = pb.authStore.model;
        if (!user) {
          router.push('/login');
          return;
        }
  
        // Fetch inventory where user_id matches and expand item details
        const userItems = await pb.collection('user_inventory').getFullList({
          filter: `user_id="${user.id}"`,
          expand: "item_id", // Expands related item details
        });
  
        // Map the expanded items to show item details
        const formattedInventory = userItems.map(item => ({
          id: item.id,
          name: item.expand?.item_id?.name || "Unknown Item",
          type: item.expand?.item_id?.type || "Unknown",
          image_url: item.expand?.item_id?.image ? 
            `${pb.baseUrl}/api/files/items/${item.expand.item_id.id}/${item.expand.item_id.image}` 
            : "/default-placeholder.png",
        }));
  
        setInventory(formattedInventory);
      } catch (error) {
        console.error("Error fetching user inventory:", error);
      }
    };
  
    fetchUserInventory();
  }, [router]);
  
  

  return (
    <>
      <Head>
        <title>Inventory</title>
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

          {/* Main Inventory Section */}
          <div className="bg-[#F0F8E1] p-8 flex-1 overflow-y-auto rounded-r-lg">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#007C55]">🎒 Inventory</h1>
              <p className="mt-2 text-xl text-[#007C55]">Here are the items you have collected!</p>
            </div>

            <hr className="my-6 border-gray-300" />

            <div className="grid grid-cols-3 gap-6 mt-6">
  {inventory.length > 0 ? (
    inventory.map((item) => (
      <div key={item.id} className="p-4 bg-gray-200 rounded-lg text-center shadow-md">
        <img 
          src={item.image_url} 
          alt={item.name} 
          className="w-24 h-24 mx-auto mb-2 object-contain rounded-lg border border-gray-300 shadow-md"
        />
        <p className="font-semibold text-gray-800">{item.name}</p>
      </div>
    ))
  ) : (
    <p className="text-gray-500 text-center col-span-3">You haven't collected any items yet.</p>
  )}
</div>


          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryPage;
