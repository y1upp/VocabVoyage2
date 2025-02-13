'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PocketBase from 'pocketbase';

const TestSelectionPage = () => {
  const router = useRouter();
  const pb = new PocketBase('http://127.0.0.1:8090');

  const [userCompletedLessons, setUserCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the lessons completion status
  useEffect(() => {
    const fetchUserLessonCompletion = async () => {
      try {
        const user = pb.authStore.model;
        if (user) {
          // Fetch lessons that the user has completed
          const userLessons = await pb.collection('user_lessons').getFullList({
            filter: `userId = "${user.id}" && isCompleted = true`,
            fields: 'lessonId', // Fetch only the lesson IDs
          });

          // Collect the completed lesson IDs
          const completedLessons = userLessons.map((lesson) => lesson.lessonId);
          setUserCompletedLessons(completedLessons);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error("Error fetching user lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLessonCompletion();
  }, [router]);

  // Define the lessons and their required IDs for each test
  const lessons = [
    { id: 'kk4cu8sf4tc0580', moduleName: 'Intro', lessonName: 'Lesson 1' },
    { id: '34l37r61q6lvzip', moduleName: 'Intro', lessonName: 'Lesson 2' },
    { id: '7t0583fsmt1zf9b', moduleName: 'Greetings', lessonName: 'Lesson 1' },
    { id: '9a78026fx9v1h09', moduleName: 'Greetings', lessonName: 'Lesson 2' },
    { id: 'kvmti95y933dr85', moduleName: 'Greetings', lessonName: 'Lesson 3' },
    { id: '69r236671i443rk', moduleName: 'Greetings', lessonName: 'Lesson 4' },
    { id: '46x30klb07vjx20', moduleName: 'Greetings', lessonName: 'Lesson 5' },
    { id: 'g61n8a57188oyxl', moduleName: 'Introductions', lessonName: 'Lesson 1' },
    { id: '7ie60omtn8uob7i', moduleName: 'Introductions', lessonName: 'Lesson 2' },
    { id: 'av9yn1ms57349n9', moduleName: 'Introductions', lessonName: 'Lesson 3' },
    { id: '5um4ba9a1qhis47', moduleName: 'Food', lessonName: 'Lesson 1' },
    { id: 'z417b95816vapxs', moduleName: 'Food', lessonName: 'Lesson 2' },
    { id: '86r4kw4f95xh868', moduleName: 'Food', lessonName: 'Lesson 3' },
    { id: 'zid81656a163vm3', moduleName: 'Places', lessonName: 'Lesson 1' },
    { id: '2455439j17ztd9k', moduleName: 'Places', lessonName: 'Lesson 2' },
    { id: '08ve126is5d1605', moduleName: 'Places', lessonName: 'Lesson 3' },
    { id: '5w5wwn279u9dh35', moduleName: 'Shopping', lessonName: 'Lesson 1' },
    { id: 'ss039592xyg0306', moduleName: 'Shopping', lessonName: 'Lesson 2' },
    { id: '96mz4r6ga6j841g', moduleName: 'Shopping', lessonName: 'Lesson 3' }
  ];

  // Check if the required lessons are completed for each test
  const isIntroTestEnabled = lessons.filter((lesson) => lesson.moduleName === 'Intro').every((lesson) => userCompletedLessons.includes(lesson.id));
  
  const isGreetingsTestEnabled = lessons.filter((lesson) => lesson.moduleName === 'Greetings').every((lesson) => userCompletedLessons.includes(lesson.id));
  
  const isIntroductionsTestEnabled = lessons.filter((lesson) => lesson.moduleName === 'Introductions').every((lesson) => userCompletedLessons.includes(lesson.id));
  
  const isFoodTestEnabled = lessons.filter((lesson) => lesson.moduleName === 'Food').every((lesson) => userCompletedLessons.includes(lesson.id));
  
  const isPlacesTestEnabled = lessons.filter((lesson) => lesson.moduleName === 'Places').every((lesson) => userCompletedLessons.includes(lesson.id));
  
  const isShoppingTestEnabled = lessons.filter((lesson) => lesson.moduleName === 'Shopping').every((lesson) => userCompletedLessons.includes(lesson.id));

  // Loading state (while fetching data)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600">
        <div className="text-center text-gray-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-500 via-green-700 to-red-600">
      <div className="w-[90%] max-w-screen-2xl h-[90vh] bg-[#c0d4c2] rounded-lg shadow-lg overflow-hidden flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Select a Module Test</h1>
        <p className="text-xl text-gray-700 mb-4">Choose the test you want to take:</p>

        {/* Test Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/test/intro')}
            disabled={!isIntroTestEnabled}
            className={`w-full py-3 px-6 rounded-lg shadow-md transition-all ${isIntroTestEnabled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
          >
            Intro Test
          </button>
          <button
            onClick={() => router.push('/test/greetings')}
            disabled={!isGreetingsTestEnabled}
            className={`w-full py-3 px-6 rounded-lg shadow-md transition-all ${isGreetingsTestEnabled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
          >
            Greetings Test
          </button>
          <button
            onClick={() => router.push('/test/introductions')}
            disabled={!isIntroductionsTestEnabled}
            className={`w-full py-3 px-6 rounded-lg shadow-md transition-all ${isIntroductionsTestEnabled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
          >
            Introductions Test
          </button>
          <button
            onClick={() => router.push('/test/food')}
            disabled={!isFoodTestEnabled}
            className={`w-full py-3 px-6 rounded-lg shadow-md transition-all ${isFoodTestEnabled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
          >
            Food Test
          </button>
          <button
            onClick={() => router.push('/test/places')}
            disabled={!isPlacesTestEnabled}
            className={`w-full py-3 px-6 rounded-lg shadow-md transition-all ${isPlacesTestEnabled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
          >
            Places Test
          </button>
          <button
            onClick={() => router.push('/test/shopping')}
            disabled={!isShoppingTestEnabled}
            className={`w-full py-3 px-6 rounded-lg shadow-md transition-all ${isShoppingTestEnabled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}
          >
            Shopping Test
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={() => router.push('/blank')}
            className="bg-blue-500 text-white py-3 px-6 rounded-lg shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestSelectionPage;
