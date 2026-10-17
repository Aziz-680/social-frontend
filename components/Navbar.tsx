/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import authService from "../services/AuthService";
import StatusSelector from "./StatusSelector";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const data = await authService.checkSession();
      if (data?.user) setUser(data.user);
    };

    const publicRoutes = ["/", "/login", "/register"];
    if (!publicRoutes.includes(pathname)) {
      fetchUser();
    }
  }, [pathname]);

  const publicRoutes = ["/", "/login", "/register"];
  if (publicRoutes.includes(pathname)) {
    return null;
  }

  const handleStatusUpdate = (newStatus: string) => {
    if (user) {
      setUser({ ...user, status: newStatus });
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // TODO: Route to search results page or filter posts/users
    console.log("Searching for:", searchQuery);
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300 gap-4">
      {/* 1. Brand Logo */}
      <Link
        href="/feed"
        className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors shrink-0"
      >
        Social App
      </Link>

      {/* 2. Middle Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users or posts..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
          />
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm pointer-events-none">
            🔍
          </span>
        </div>
      </form>

      {/* 3. Right Menu (Status, Profile & Logout) */}
      <div className="flex gap-4 items-center shrink-0">
        {user && (
          <div className="flex items-center gap-4">
            {/* Status Selector */}
            <StatusSelector
              currentStatus={user.status}
              onStatusChange={handleStatusUpdate}
            />

            {/* Clickable User Avatar & Name -> Redirects to Profile */}
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <img
                src={user.profilePicture || "https://via.placeholder.com/32"}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-700"
              />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 pr-2">
                {user.firstName}
              </span>
            </Link>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-gray-100 hover:bg-red-500 text-gray-700 hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
