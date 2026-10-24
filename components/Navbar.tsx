/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import authService from "../services/AuthService";
import userService from "../services/UserService";
import friendService from "../services/FriendService";
import StatusSelector from "./StatusSelector";
import FriendRequestsModal from "./FriendRequestsModal";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Friend Requests Modal State
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingRequestsCount = async () => {
    try {
      const requests = await friendService.getPendingRequests();
      setPendingCount(requests?.length || 0);
    } catch (error) {
      console.error("Failed to fetch pending requests count");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const data = await authService.checkSession();
      if (data?.user) {
        setUser(data.user);
        fetchPendingRequestsCount();
      }
    };

    const publicRoutes = ["/", "/login", "/register"];
    if (!publicRoutes.includes(pathname)) {
      fetchUser();
    }
  }, [pathname]);

  // Debouncing search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const results = await userService.searchUsers(searchQuery);
          setSearchResults(results || []);
          setIsSearchOpen(true);
        } catch (error) {
          console.error("Search failed", error);
        }
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSendFriendRequest = async (targetUserId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await friendService.sendRequest(targetUserId);
      setSearchResults((prev) =>
        prev.map((u) => (u._id === targetUserId ? { ...u, friendshipStatus: "pending" } : u))
      );
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send friend request");
    }
  };

  return (
    <>
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex justify-between items-center sticky top-0 z-50 transition-colors duration-300 gap-4">
        {/* 1. Brand Logo */}
        <Link
          href="/feed"
          className="text-2xl font-bold text-blue-600 dark:text-blue-400 transition-colors shrink-0"
        >
          Social App
        </Link>

        {/* 2. Middle Search Bar with Dropdown Preview */}
        <div ref={searchRef} className="flex-1 max-w-md mx-4 relative">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all"
            />
            <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm pointer-events-none">
              🔍
            </span>
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 space-y-1 p-2">
              {searchResults.map((searchUser) => (
                <div
                  key={searchUser._id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <Link
                    href={`/user/${searchUser._id}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <img
                      src={searchUser.profilePicture || "https://via.placeholder.com/32"}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {searchUser.firstName} {searchUser.lastName}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">{searchUser.email}</p>
                    </div>
                  </Link>

                  {/* Friendship Action Status */}
                  <div className="ml-2 shrink-0">
                    {searchUser.friendshipStatus === "friends" ? (
                      <span className="text-[10px] font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-lg">
                        ✓ Friends
                      </span>
                    ) : searchUser.friendshipStatus === "pending" ? (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
                        ⏳ Pending
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleSendFriendRequest(searchUser._id, e)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Right Menu (Friend Requests, Status, Profile & Logout) */}
        <div className="flex gap-4 items-center shrink-0">
          {user && (
            <div className="flex items-center gap-3">
              {/* Friend Requests Notification Icon */}
              <button
                onClick={() => setIsRequestsModalOpen(true)}
                className="relative p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-sm"
                title="Friend Requests"
              >
                👥
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Status Selector */}
              <StatusSelector
                currentStatus={user.status}
                onStatusChange={handleStatusUpdate}
              />

              {/* Clickable User Avatar & Name */}
              <Link
                href={`/user/${user._id}`}
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

      {/* Friend Requests Modal */}
      <FriendRequestsModal
        isOpen={isRequestsModalOpen}
        onClose={() => setIsRequestsModalOpen(false)}
        onRequestAction={fetchPendingRequestsCount}
      />
    </>
  );
}