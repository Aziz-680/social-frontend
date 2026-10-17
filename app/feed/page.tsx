/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import authService from "@/services/AuthService";
import postService from "@/services/PostService";
import PostCard from "../../components/PostCard";

export default function FeedPage() {
  const [user, setUser] = useState<any>(null);
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [posts, setPosts] = useState<any[]>([]);

  const fetchFeed = useCallback(async () => {
    try {
      const feedData = await postService.getFeed(1, 20);
      setPosts(feedData);
    } catch (error) {
      console.error("Failed to fetch feed", error);
    }
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      const data = await authService.checkSession();
      if (data?.user) setUser(data.user);
    };
    fetchSession();
    fetchFeed();
  }, [fetchFeed]);

  const handleCreatePost = async () => {
    if (!content.trim() && !selectedImage) return;

    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("privacy", privacy);
      if (selectedImage) formData.append("image", selectedImage);

      await postService.createPost(formData);
      setContent("");
      setPrivacy("public");
      setSelectedImage(null);
      setImagePreview(null);
      fetchFeed();
    } catch (error) {
      alert("Failed to create post.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <main className="max-w-2xl mx-auto mt-8 px-4 space-y-6">
        {/* Create Post Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Create a Post</h2>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs px-2.5 py-1.5 outline-none"
            >
              <option value="public">🌐 Public</option>
              <option value="friends">👥 Friends</option>
              <option value="only_me">🔒 Only Me</option>
            </select>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none resize-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder={`What's on your mind, ${user?.firstName || ""}?`}
          />

          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-32 rounded-lg object-cover" />
              <button
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) { setSelectedImage(file); setImagePreview(URL.createObjectURL(file)); }
              }}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-blue-500 text-sm font-semibold flex items-center gap-1"
            >
              📷 Attach Image
            </button>

            <button
              onClick={handleCreatePost}
              disabled={isPosting || (!content.trim() && !selectedImage)}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-full"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {/* Global PostCards */}
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
      </main>
    </div>
  );
}