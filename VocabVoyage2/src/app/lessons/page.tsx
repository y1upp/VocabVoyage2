'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://127.0.0.1:8090");

const LessonsPage = () => {
  const [isClient, setIsClient] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const user = pb.authStore.model;
      if (!user) {
        console.error("❌ No authenticated user found.");
        return;
      }

      const userId = user.id;
      console.log("🔥 Fetching completed lessons for UserID:", userId);

      const userLessons = await pb.collection('user_lessons').getFullList({
        filter: `userId="${userId}" && isCompleted=true`,
        fields: 'lessonId',
      });

      const completedLessonIds = new Set(userLessons.map(lesson => lesson.lessonId));
      console.log("✅ Completed Lessons:", Array.from(completedLessonIds)); // Debugging

      setCompletedLessons(completedLessonIds);
    } catch (error) {
      console.error("❌ Error fetching user progress:", error);
    }
  };
  const handleLogout = async () => {
    try {
      pb.authStore.clear();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  // ✅ Complete Lesson List (All Modules)
  const lessons = [
    { id: 'kk4cu8sf4tc0580', moduleName: 'Intro', lessonName: 'Lesson 1', description: 'Basic greetings and essential phrases in Lithuanian.' },
    { id: '34l37r61q6lvzip', moduleName: 'Intro', lessonName: 'Lesson 2', description: 'Learn numbers from one to ten in Lithuanian.' },
    
    { id: '7t0583fsmt1zf9b', moduleName: 'Greetings', lessonName: 'Lesson 1', description: 'Learn common greeting phrases in Lithuanian.' },
    { id: '9a78026fx9v1h09', moduleName: 'Greetings', lessonName: 'Lesson 2', description: 'Master polite expressions and formal greetings.' },
    { id: 'kvmti95y933dr85', moduleName: 'Greetings', lessonName: 'Lesson 3', description: 'Learn common questions to ask in conversations.' },
    { id: '69r236671i443rk', moduleName: 'Greetings', lessonName: 'Lesson 4', description: 'Learn how to say goodbye and farewell properly.' },
    { id: '46x30klb07vjx20', moduleName: 'Greetings', lessonName: 'Lesson 5', description: 'Formal and professional greeting etiquette.' },
  
    { id: 'g61n8a57188oyxl', moduleName: 'Introductions', lessonName: 'Lesson 1', description: 'Introduce yourself and ask for names in Lithuanian.' },
    { id: '7ie60omtn8uob7i', moduleName: 'Introductions', lessonName: 'Lesson 2', description: 'Learn how to introduce others in conversations.' },
    { id: 'av9yn1ms57349n9', moduleName: 'Introductions', lessonName: 'Lesson 3', description: 'Practice basic self-introductions with confidence.' },
  
    { id: '5um4ba9a1qhis47', moduleName: 'Food', lessonName: 'Lesson 1', description: 'Learn essential food-related phrases and ordering etiquette.' },
    { id: 'z417b95816vapxs', moduleName: 'Food', lessonName: 'Lesson 2', description: 'Common Lithuanian dishes and how to order them.' },
    { id: '86r4kw4f95xh868', moduleName: 'Food', lessonName: 'Lesson 3', description: 'Asking for the bill and complimenting the food.' },
  
    { id: 'zid81656a163vm3', moduleName: 'Places', lessonName: 'Lesson 1', description: 'Learn how to ask for directions and find landmarks.' },
    { id: '2455439j17ztd9k', moduleName: 'Places', lessonName: 'Lesson 2', description: 'Navigating through public transportation and travel tips.' },
    { id: '08ve126is5d1605', moduleName: 'Places', lessonName: 'Lesson 3', description: 'Essential phrases for asking about travel distances and routes.' },
  
    { id: '5w5wwn279u9dh35', moduleName: 'Shopping', lessonName: 'Lesson 1', description: 'Learn essential shopping phrases and how to ask for prices.' },
    { id: 'ss039592xyg0306', moduleName: 'Shopping', lessonName: 'Lesson 2', description: 'How to try on clothes, ask about sizes, and return items.' },
    { id: '96mz4r6ga6j841g', moduleName: 'Shopping', lessonName: 'Lesson 3', description: 'Negotiating prices, asking for discounts, and making payments.' }
  ];

  const modules = [...new Set(lessons.map(lesson => lesson.moduleName))];
  const groupedModules = modules.map(module => ({
    name: module,
    lessons: lessons.filter(lesson => lesson.moduleName === module),
  }));

  const handleModuleClick = async (moduleName: string) => {
    setActiveModule(activeModule === moduleName ? null : moduleName);
  
    console.log(`🔄 Switching to Module: ${moduleName}`);
    await fetchUserProgress(); // 🔥 Re-fetch completed lessons when switching modules
  };

  // ✅ Ensure correct lesson path
  const formatLessonPath = (moduleName: string, lessonName: string) => {
    const lessonNumber = lessonName.split(' ')[1]; // Extract lesson number
    return `/lessons/${moduleName}/lesson${lessonNumber}`;
  };

  if (!isClient) return null;

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
        <div className="bg-[#F0F8E1] p-8 flex-1 overflow-y-auto rounded-r-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#007C55]">Lessons</h1>
            <img src="/images/FlagLithuanian.png" alt="Lithuanian Flag" width="125" height="125" />
          </div>

          <hr className="my-6 border-gray-300" />

          <div className="space-y-8 max-h-[60vh] overflow-y-auto lessons-scrollbar">
            {groupedModules.map(module => (
              <div key={module.name}>
                <button 
                  onClick={() => handleModuleClick(module.name)} 
                  className="w-full bg-[#006744] text-white py-6 px-8 rounded-lg shadow-lg text-lg hover:bg-[#009974] transition-all">
                  {module.name}
                </button>
                
                {/* Display lessons when a module is active */}
                {activeModule === module.name && (
                  <div className="mt-4 space-y-2">
                    {module.lessons.map(lesson => {
                      const cleanedLessonId = lesson.id.trim().toLowerCase(); // ✅ Trim & lowercase
                      const isCompleted = completedLessons.has(cleanedLessonId); // ✅ Now matching correctly
                      console.log(`🟢 Checking Lesson: ${lesson.id} - Trimmed: ${cleanedLessonId} - Completed: ${isCompleted}`);
                      return (
                      <Link 
                      key={lesson.id} 
                      href={formatLessonPath(module.name, lesson.lessonName)} 
                      className={`block p-4 rounded-lg shadow-md transition flex items-center justify-between
                        ${isCompleted ? 'bg-green-500 text-white' : 'bg-white text-[#006744] hover:bg-gray-200'}`}
                        >
                          <span>
                            {lesson.lessonName} - {lesson.description || 'No description available'}
                            </span>
                            {isCompleted && <span className="ml-2 text-xl">✅</span>}
                            </Link>
                            );
                            })}
                            </div>
                          )}
                          </div>
                        ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                };

export default LessonsPage;
