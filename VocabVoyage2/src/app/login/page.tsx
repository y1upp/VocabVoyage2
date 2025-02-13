"use client"; // Ensure this is a client component in Next.js

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PocketBase from 'pocketbase';

const LogIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pb = new PocketBase('http://127.0.0.1:8090');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const user = await pb.collection('users').authWithPassword(username, password);
      console.log('Logged in:', user);

      // Redirect to BlankPage and pass the username as a query parameter
      router.push(`/blank?username=${encodeURIComponent(username)}`);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid username or password.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center font-[family-name:var(--font-geist-sans)]">
      <div className="p-8 rounded-lg shadow-lg max-w-4xl w-full mx-auto flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold mb-4 text-black">Log In</h1>
        {error && <p className="text-red-500">{error}</p>}

        <div className="w-full max-w-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-lg text-black">Username or Email</label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-2 border rounded-lg text-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-lg text-black">Password</label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border rounded-lg text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full px-6 py-3 w-full text-lg"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/')} // Redirect to the homepage
          className="mt-4 bg-gray-300 text-black rounded-full px-6 py-3"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LogIn;