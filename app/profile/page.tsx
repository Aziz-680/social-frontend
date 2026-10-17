/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import authService from "@/services/AuthService";
import postService from "@/services/PostService";
import PostCard from "@/components/PostCard";
import StatusSelector from "@/components/StatusSelector";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await authService.checkSession();
        if (data?.user) setUser(data.user);
      } catch (error) {
        console.error("Session check failed");
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const fetchUserPosts = async () => {
      setIsLoadingPosts(true);
      try {
        const response = await postService.getUserPosts(user._id, page, 5);
        const userPosts = Array.isArray(response) ? response : [];

        setPosts((prev) => (page === 1 ? userPosts : [...prev, ...userPosts]));
        if (userPosts.length < 5) setHasMore(false);
      } catch (error: any) {
        console.error("Failed to load user posts");
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [user?._id, page]);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 pb-12">
      {/* Header Info */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 w-full"></div>
        <div className="px-8 pb-8 flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-16">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 shadow-md flex items-center justify-center bg-gray-200 dark:bg-gray-800 cursor-pointer group overflow-hidden shrink-0"
          >
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-gray-500">{user?.firstName?.[0] || "U"}</span>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {user?.fullName || `${user?.firstName} ${user?.lastName}`}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Status</p>
              <p className="text-lg font-bold mt-1 capitalize">{user?.status}</p>
            </div>
            {user?.status && (
              <StatusSelector
                currentStatus={user.status}
                onStatusChange={(newStatus) => setUser({ ...user, status: newStatus })}
              />
            )}
          </div>
        </div>
      </div>

      {/* Global PostCards for Profile Page */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold mb-4">Your Posts</h3>
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={user}
            onPostUpdate={(updated: { _id: any; }) =>
              setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
            }
            onPostDelete={(deletedId: any) =>
              setPosts((prev) => prev.filter((p) => p._id !== deletedId))
            }
          />
        ))}
      </div>
    </div>
  );
}