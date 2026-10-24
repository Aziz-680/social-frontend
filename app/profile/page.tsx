/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import authService from "@/services/AuthService";
import postService from "@/services/PostService";
import userService from "@/services/UserService";
import PostCard from "@/components/PostCard";
import StatusSelector from "@/components/StatusSelector";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserDataAndPosts = async () => {
      try {
        const session = await authService.checkSession();
        if (session?.user) {
          setUser(session.user);
          const response = await postService.getUserPosts(session.user._id, 1, 10);
          const userPosts = (response as any)?.posts ?? response;
          setPosts(Array.isArray(userPosts) ? userPosts : []);
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchUserDataAndPosts();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const updatedUser = await userService.uploadAvatar(formData);
      setUser(updatedUser);
    } catch (error) {
      alert("Failed to upload avatar");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600 font-bold text-lg">Loading Profile...</div>
      </div>
    );
  }

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
            <div className="absolute inset-0 bg-black/40 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              Change Photo
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 dark:border-gray-800">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-semibold uppercase">Status</p>
              <p className="text-lg font-bold mt-1 capitalize">{user?.status}</p>
            </div>
            <StatusSelector
              currentStatus={user?.status}
              onStatusChange={(newStatus) => setUser({ ...user, status: newStatus })}
            />
          </div>
        </div>
      </div>

      {/* User Timeline */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold mb-4">Your Posts</h3>
        {isLoadingPosts ? (
          <p className="text-center text-gray-500 py-4">Loading your posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500 py-8">You have not posted anything yet.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={user}
              onPostUpdate={(updated) =>
                setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
              }
              onPostDelete={(deletedId) =>
                setPosts((prev) => prev.filter((p) => p._id !== deletedId))
              }
            />
          ))
        )}
      </div>
    </div>
  );
}