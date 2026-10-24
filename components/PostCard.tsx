/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Link from "next/link";
import postService from "@/services/PostService";

const REACTION_EMOJIS: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

interface PostCardProps {
  post: any;
  currentUser: any;
  onPostUpdate: (updatedPost: any) => void;
  onPostDelete?: (postId: string) => void;
}

export default function PostCard({ post, currentUser, onPostUpdate, onPostDelete }: PostCardProps) {
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState(post.content || "");
  const [openComments, setOpenComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const author = typeof post.userId === "object" ? post.userId : currentUser;
  const authorId = author?._id || post.userId;
  const isPostOwner = authorId === currentUser?._id;
  const userReaction = post.reactions?.find((r: any) => r.userId === currentUser?._id)?.type;

  // Profile link routing logic
  const profileLink = isPostOwner ? "/profile" : `/user/${authorId}`;

  // Post Actions
  const handleEditPost = async () => {
    if (!editPostContent.trim()) return;
    try {
      const updated = await postService.editPost(post._id, editPostContent);
      onPostUpdate(updated);
      setIsEditingPost(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update post");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await postService.deletePost(post._id);
      if (onPostDelete) onPostDelete(post._id);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete post");
    }
  };

  const handleReactPost = async (type: string) => {
    try {
      const updated = await postService.reactToPost(post._id, type);
      onPostUpdate(updated);
    } catch (error) {
      console.error("Failed to react", error);
    }
  };

  const handleRepost = async () => {
    if (!confirm("Repost this to your timeline?")) return;
    try {
      await postService.repost(post._id);
      alert("Post shared to your profile!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to repost");
    }
  };

  // Comment Actions
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const updated = await postService.addComment(post._id, commentText);
      onPostUpdate(updated);
      setCommentText("");
    } catch (error) {
      alert("Failed to add comment");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm space-y-4">
      {/* Post Header */}
      <div className="flex justify-between items-center">
        <Link href={profileLink} className="flex items-center gap-3 group">
          <img
            src={author?.profilePicture || "https://via.placeholder.com/40"}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover group-hover:opacity-80 transition-opacity"
          />
          <div>
            <p className="font-bold text-gray-900 dark:text-white group-hover:underline">
              {author?.firstName} {author?.lastName}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {new Date(post.createdAt).toLocaleDateString()} •{" "}
              {post.privacy === "public" ? "🌐 Public" : post.privacy === "friends" ? "👥 Friends" : "🔒 Only Me"}
            </p>
          </div>
        </Link>

        {/* Post Owner Controls */}
        {isPostOwner && !isEditingPost && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditingPost(true);
                setEditPostContent(post.content);
              }}
              className="text-xs text-blue-500 hover:underline font-semibold"
            >
              Edit
            </button>
            <button
              onClick={handleDeletePost}
              className="text-xs text-red-500 hover:underline font-semibold"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Repost Header Banner */}
      {post.isRepost && post.originalPostId && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
          <p className="text-gray-500 text-xs mb-1">
            🔁 Reposted from{" "}
            <Link
              href={
                post.originalPostId.userId?._id === currentUser?._id
                  ? "/profile"
                  : `/profile/${post.originalPostId.userId?._id}`
              }
              className="font-bold hover:underline"
            >
              {post.originalPostId.userId?.firstName} {post.originalPostId.userId?.lastName}
            </Link>
          </p>
          <p>{post.originalPostId.content}</p>
        </div>
      )}

      {/* Inline Post Editor or Post Content */}
      {isEditingPost ? (
        <div className="space-y-2">
          <textarea
            value={editPostContent}
            onChange={(e) => setEditPostContent(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditingPost(false)}
              className="px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleEditPost}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        !post.isRepost && <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{post.content}</p>
      )}

      {/* Media Attachment */}
      {post.media?.length > 0 && !isEditingPost && (
        <img src={post.media[0]} alt="Media" className="w-full max-h-96 object-cover rounded-xl" />
      )}

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
        <span>{post.reactions?.length || 0} Reactions</span>
        <span>{post.comments?.length || 0} Comments</span>
      </div>

      {/* Interactive Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {/* Post Reaction Popover */}
        <div className="relative group flex justify-center">
          <button className="w-full py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center gap-1">
            {userReaction ? REACTION_EMOJIS[userReaction] : "👍"} React
          </button>
          <div className="absolute bottom-full mb-1 hidden group-hover:flex gap-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-xl border border-gray-200 dark:border-gray-700">
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <button
                key={type}
                onClick={() => handleReactPost(type)}
                className="hover:scale-125 transition-transform text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Drawer Toggle */}
        <button
          onClick={() => setOpenComments(!openComments)}
          className="py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          💬 Comment
        </button>

        {/* Repost Button */}
        <button
          onClick={handleRepost}
          className="py-2 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          🔁 Repost
        </button>
      </div>

      {/* Comment Thread */}
      {openComments && (
        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm outline-none"
            />
            <button
              onClick={handleAddComment}
              className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {post.comments?.map((c: any) => {
              const commenterId = c.userId?._id || c.userId;
              const isCommentOwner = commenterId === currentUser?._id;
              const commentReaction = c.reactions?.find((r: any) => r.userId === currentUser?._id)?.type;
              const commentAuthorLink = isCommentOwner ? "/profile" : `/profile/${commenterId}`;

              return (
                <div key={c._id} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <Link href={commentAuthorLink} className="flex items-center gap-2 group">
                      <img
                        src={c.userId?.profilePicture || "https://via.placeholder.com/32"}
                        alt="Commenter"
                        className="w-6 h-6 rounded-full object-cover group-hover:opacity-80 transition-opacity"
                      />
                      <span className="font-bold text-xs group-hover:underline">
                        {c.userId?.firstName} {c.userId?.lastName}
                      </span>
                    </Link>

                    {/* Comment Permissions: Delete (Comment OR Post Owner), Edit (Comment Owner) */}
                    <div className="flex items-center gap-2 text-xs">
                      {isCommentOwner && (
                        <button
                          onClick={async () => {
                            const text = prompt("Edit comment:", c.content);
                            if (text?.trim()) {
                              const updated = await postService.editComment(post._id, c._id, text);
                              onPostUpdate(updated);
                            }
                          }}
                          className="text-blue-500 hover:underline"
                        >
                          Edit
                        </button>
                      )}
                      {(isCommentOwner || isPostOwner) && (
                        <button
                          onClick={async () => {
                            if (confirm("Delete comment?")) {
                              const updated = await postService.deleteComment(post._id, c._id);
                              onPostUpdate(updated);
                            }
                          }}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-800 dark:text-gray-200">{c.content}</p>

                  {/* Comment Reaction Controls */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
                    <div className="relative group">
                      <button className="hover:text-blue-500 font-medium">
                        {commentReaction ? REACTION_EMOJIS[commentReaction] : "👍"} React
                      </button>
                      <div className="absolute bottom-full mb-1 hidden group-hover:flex gap-1 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
                        {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
                          <button
                            key={type}
                            onClick={async () => {
                              const updated = await postService.reactToComment(post._id, c._id, type);
                              onPostUpdate(updated);
                            }}
                            className="hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <span>{c.reactions?.length || 0} reactions</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}