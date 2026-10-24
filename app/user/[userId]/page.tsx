/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, use } from "react";
import userService from "@/services/UserService";
import postService from "@/services/PostService";
import authService from "@/services/AuthService";
import friendService from "@/services/FriendService";
import PostCard from "@/components/PostCard";

export default function PublicUserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  useEffect(() => {
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
    if (!userId || !isValidObjectId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const session = await authService.checkSession();
        if (session?.user) setCurrentUser(session.user);

        const [userProfile, userPosts] = await Promise.all([
          userService.getPublicProfile(userId),
          postService.getUserPosts(userId, 1, 10),
        ]);

        setProfileUser(userProfile);
        const postsData: any = userPosts;
        setPosts(postsData?.posts || postsData || []);
      } catch (error: any) {
        console.error("Failed to load user profile:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const handleSendRequest = async () => {
    setIsSendingRequest(true);
    try {
      await friendService.sendRequest(userId);
      setProfileUser((prev: any) => ({ ...prev, friendshipStatus: "pending" }));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send friend request");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleUnfriend = async () => {
    if (!confirm("Are you sure you want to unfriend this user?")) return;
    try {
      await friendService.unfriend(userId);
      setProfileUser((prev: any) => ({ ...prev, friendshipStatus: "none" }));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to unfriend");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-blue-600 font-bold text-lg">Loading Profile...</div>
      </div>
    );
  }

  if (!profileUser) {
    return <div className="text-center py-20 text-gray-500 font-semibold">User profile not found.</div>;
  }

  const isOwnProfile = currentUser?._id === profileUser._id;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 pb-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"></div>
        <div className="px-8 pb-8 flex flex-col sm:flex-row gap-6 items-center sm:items-end -mt-16">
          <img
            src={profileUser.profilePicture || "https://via.placeholder.com/128"}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover shadow-md shrink-0 bg-gray-200"
          />

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {profileUser.firstName} {profileUser.lastName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{profileUser.email}</p>
          </div>

          {!isOwnProfile && (
            <div className="shrink-0">
              {profileUser.friendshipStatus === "friends" ? (
                <button
                  onClick={handleUnfriend}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  ✓ Friends (Unfriend)
                </button>
              ) : profileUser.friendshipStatus === "pending" ? (
                <button
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold px-4 py-2 rounded-xl cursor-not-allowed"
                >
                  ⏳ Request Sent
                </button>
              ) : (
                <button
                  onClick={handleSendRequest}
                  disabled={isSendingRequest}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                >
                  {isSendingRequest ? "Sending..." : "➕ Add Friend"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold">Posts</h3>
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No posts available to display.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
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