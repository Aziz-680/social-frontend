"use client";

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-500 p-6">
      
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-pulse">
          Connect the World
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto transition-colors duration-300">
          Share your moments, meet new friends, and explore the feed. Join our community and start your journey today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          
          <button 
            onClick={() => router.push('/login')}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-blue-600 text-white font-semibold text-lg transform hover:-translate-y-1 hover:scale-105 hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
          >
            Log In
          </button>

          <button 
            onClick={() => router.push('/register')}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-transparent border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold text-lg transform hover:-translate-y-1 hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300"
          >
            Sign Up
          </button>

        </div>
      </div>
    </div>
  );
}