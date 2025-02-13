"use client"; // Client-side directive to handle hooks like useState

import React, { useState } from 'react';
import { createUser } from '../../lib/pocketbase'; // Correct path for creating user
import { useRouter } from 'next/navigation'; // Use useRouter for navigation

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Use router for navigation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setError('');

    // Basic validation
    if (!username || !email || !password || !repeatPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (password !== repeatPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Create user using PocketBase
      const newUser = await createUser(username, email, password);
      console.log('User created:', newUser);

      // Optionally redirect or show success message
      alert('User created successfully!');
      // You can redirect the user or clear the form for a new user to sign up
    } catch (error) {
      console.error('Failed to create user:', error);
      setError('Error creating user. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 flex items-center justify-center font-[family-name:var(--font-geist-sans)]">
      <div className="p-8 rounded-lg shadow-lg max-w-4xl w-full mx-auto flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold mb-4 text-black">Sign Up</h1>
        {error && <p className="text-red-500">{error}</p>}
        <div className="w-full max-w-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-lg text-black">Username</label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-2 border rounded-lg text-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-lg text-black">Email</label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border rounded-lg text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
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

            {/* Repeat Password Input */}
            <div>
              <label htmlFor="repeatPassword" className="block text-lg text-black">Repeat Password</label>
              <input
                type="password"
                id="repeatPassword"
                className="w-full px-4 py-2 border rounded-lg text-black"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-500 text-white rounded-full px-6 py-3 w-full text-lg"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/')} // Redirect to home page
          className="mt-4 bg-gray-300 text-black rounded-full px-6 py-3"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default SignUp;