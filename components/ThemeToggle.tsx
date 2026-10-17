"use client";

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Check the initial theme on load
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 px-2 py-1 rounded-full bg-black dark:bg-white text-gray-900 dark:text-gray-100 font-semibold shadow-md hover:scale-105 transition-transform duration-200 z-50"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}