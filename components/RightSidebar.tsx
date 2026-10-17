/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import authService from '../services/AuthService';

export default function RightSidebar() {
  const pathname = usePathname();
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await authService.checkSession();
        // Sets the friends array directly from your database payload
        if (data?.user?.friends) {
          setFriends(data.user.friends);
        }
      } catch (error) {
        console.error("Failed to fetch friends", error);
      } finally {
        setIsLoading(false);
      }
    };

    const publicRoutes = ['/', '/login', '/register'];
    if (!publicRoutes.includes(pathname)) {
      fetchFriends();
    }
  }, [pathname]);

  const publicRoutes = ['/', '/login', '/register'];
  if (publicRoutes.includes(pathname)) {
    return null;
  }

  return (
    <aside className="w-72 fixed right-0 top-[73px] bottom-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-l border-gray-200 dark:border-gray-800 p-4 hidden lg:block overflow-y-auto transition-colors duration-300 z-40">
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">
        Contacts
      </h3>
      
      {isLoading ? (
        <div className="px-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading contacts...</div>
      ) : friends.length === 0 ? (
        <div className="px-2 text-sm text-gray-500 dark:text-gray-400">No friends to show yet.</div>
      ) : (
        <ul className="space-y-2">
          {friends.map((friend: any) => (
            <li key={friend._id || friend.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-xl transition-colors">
              
              <div className="relative flex-shrink-0">
                {friend.profilePicture ? (
                  <img src={friend.profilePicture} alt={friend.firstName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                    {friend.firstName?.[0] || 'U'}
                  </div>
                )}
                
                {/* Temporary offline indicator until WebSockets are implemented */}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 bg-gray-400"></span>
              </div>
              
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {friend.firstName} {friend.lastName}
              </span>
              
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}