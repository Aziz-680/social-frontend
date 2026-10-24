"use client";

import { useState } from "react";
<<<<<<< HEAD
=======
import type { FormEvent } from "react";
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
import Link from "next/link";
import postService from "@/services/PostService";
import type { Post, ReactionType, User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import Avatar from "./Avatar";
import Icon from "./Icon";

type PostCardProps = {
  post: Post;
  currentUser: User | null;
  onPostUpdate: (updatedPost: Post) => void;
  onPostDelete?: (postId: string) => void;
  onPostShared?: () => void;
};

const reactionTypes: Array<{ type: ReactionType; label: string }> = [
  { type: "like", label: "Like" },
  { type: "love", label: "Love" },
  { type: "haha", label: "Haha" },
  { type: "wow", label: "Wow" },
  { type: "sad", label: "Sad" },
  { type: "angry", label: "Angry" },
];

const reactionMarks: Record<ReactionType, string> = {
  like: "↑",
  love: "♥",
  haha: "☺",
  wow: "!",
  sad: "·",
  angry: "×",
};

export default function PostCard({
  post,
  currentUser,
  onPostUpdate,
  onPostDelete,
  onPostShared,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content ?? "");
  const [editPrivacy, setEditPrivacy] = useState<Post["privacy"]>(post.privacy);
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

<<<<<<< HEAD
  const author = typeof post.userId === "object" ? post.userId : currentUser;
  const authorId = author?._id || post.userId;
  const isPostOwner = authorId === currentUser?._id;
  const userReaction = post.reactions?.find((r: any) => r.userId === currentUser?._id)?.type;

  // Profile link routing logic
  const profileLink = isPostOwner ? "/profile" : `/user/${authorId}`;

  // Post Actions
  const handleEditPost = async () => {
    if (!editPostContent.trim()) return;
=======
  const author = typeof post.userId === "object" ? post.userId : undefined;
  const isOwner = getUserId(post.userId) === currentUser?._id;
  const currentReaction = post.reactions?.find(
    (reaction) => getUserId(reaction.userId) === currentUser?._id,
  )?.type;
  const reactionCount = post.reactions?.length ?? post.likes?.length ?? 0;
  const comments = post.comments ?? [];
  const original = typeof post.originalPostId === "object" ? post.originalPostId : undefined;
  const date = new Date(post.createdAt);
  const timestamp = Number.isNaN(date.getTime())
    ? "Recently"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);

  const savePost = async () => {
    setError("");
    if (post.content.trim() && !editContent.trim()) {
      setError("Post text can't be cleared. Add text before saving.");
      return;
    }

    setIsSaving(true);
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
    try {
      const updated = await postService.editPost(
        post._id,
        editContent.trim() ? editContent : undefined,
        editPrivacy,
      );
      onPostUpdate(updated);
      setIsEditing(false);
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Your post couldn't be updated."));
    } finally {
      setIsSaving(false);
    }
  };

  const deletePost = async () => {
    setError("");
    setIsSaving(true);
    try {
      await postService.deletePost(post._id);
      onPostDelete?.(post._id);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Your post couldn't be deleted."));
    } finally {
      setIsSaving(false);
    }
  };

  const react = async (type: ReactionType) => {
    setError("");
    try {
      onPostUpdate(await postService.reactToPost(post._id, type));
    } catch (reactionError) {
      setError(getErrorMessage(reactionError, "Your reaction couldn't be saved."));
    }
  };

  const addComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    setError("");
    try {
      onPostUpdate(await postService.addComment(post._id, commentText.trim()));
      setCommentText("");
      setCommentsOpen(true);
    } catch (commentError) {
      setError(getErrorMessage(commentError, "Your comment couldn't be added."));
    }
  };

  const updateComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    setError("");
    try {
      onPostUpdate(await postService.editComment(post._id, commentId, editingCommentText.trim()));
      setEditingComment(null);
    } catch (commentError) {
      setError(getErrorMessage(commentError, "Your comment couldn't be updated."));
    }
  };

  const removeComment = async (commentId: string) => {
    setError("");
    try {
      onPostUpdate(await postService.deleteComment(post._id, commentId));
    } catch (commentError) {
      setError(getErrorMessage(commentError, "Your comment couldn't be deleted."));
    }
  };

  const reactToComment = async (commentId: string, type: ReactionType) => {
    setError("");
    try {
      onPostUpdate(await postService.reactToComment(post._id, commentId, type));
    } catch (reactionError) {
      setError(getErrorMessage(reactionError, "Your reaction couldn't be saved."));
    }
  };

  const repost = async () => {
    setError("");
    setNotice("");
    try {
      await postService.repost(post._id);
      setNotice("Shared to your profile.");
      onPostShared?.();
    } catch (repostError) {
      setError(getErrorMessage(repostError, "This post couldn't be shared."));
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <article className="post-card">
      {post.isRepost && (
        <p className="repost-label"><Icon name="share" /> Shared by {getUserName(author)}</p>
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
      )}
      <header className="post-heading">
        <Link href={author?._id ? `/profile/${author._id}` : "/profile"} className="post-author">
          <Avatar user={author} />
          <span>
            <strong>{getUserName(author)}</strong>
            <small>{timestamp} <span aria-hidden="true">·</span> {post.privacy.replace("_", " ")}</small>
          </span>
        </Link>
        {isOwner && !isEditing && (
          <details className="post-menu">
            <summary aria-label="Post options"><Icon name="menu" /></summary>
            <div className="post-menu-options">
              <button onClick={() => {
                setEditContent(post.content);
                setEditPrivacy(post.privacy);
                setIsEditing(true);
              }}>Edit post</button>
              <button onClick={deletePost} disabled={isSaving}>Delete post</button>
            </div>
          </details>
        )}
      </header>

      {isEditing ? (
        <div className="edit-post">
          <textarea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            aria-label="Edit post"
            rows={4}
          />
          <div className="edit-actions">
            <label>
              Visibility
              <select
                value={editPrivacy}
                onChange={(event) => setEditPrivacy(event.target.value as Post["privacy"])}
              >
                <option value="public">Anyone</option>
                <option value="friends">Connections</option>
                <option value="only_me">Only me</option>
              </select>
            </label>
            <button className="button button-quiet button-small" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className="button button-primary button-small" onClick={savePost} disabled={isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : post.isRepost && original ? (
        <div className="shared-post">
          <div className="shared-post-author">
            <Avatar user={typeof original.userId === "object" ? original.userId : undefined} size="small" />
            <strong>{getUserName(typeof original.userId === "object" ? original.userId : undefined)}</strong>
          </div>
          <p>{original.content}</p>
          {original.media?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="post-media" src={original.media[0]} alt="Shared post attachment" />
          )}
        </div>
      ) : (
        <>
          {post.content && <p className="post-content">{post.content}</p>}
          {post.media?.map((media, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="post-media" src={media} alt="Post attachment" key={`${media}-${index}`} />
          ))}
        </>
      )}

      <div className="post-stats">
        <span>{reactionCount} {reactionCount === 1 ? "reaction" : "reactions"}</span>
        <button onClick={() => setCommentsOpen((open) => !open)}>
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </button>
      </div>

      <div className="post-actions">
        <label className={currentReaction ? "reaction-action selected" : "reaction-action"}>
          <Icon name="heart" />
          <span>{currentReaction ? reactionTypes.find(({ type }) => type === currentReaction)?.label : "React"}</span>
          <select
            aria-label="Choose a reaction"
            value={currentReaction ?? ""}
            onChange={(event) => {
              if (event.target.value) void react(event.target.value as ReactionType);
            }}
          >
            <option value="">Choose reaction</option>
            {reactionTypes.map((reaction) => (
              <option key={reaction.type} value={reaction.type}>{reaction.label}</option>
            ))}
          </select>
          <span className="reaction-mark" aria-hidden="true">{currentReaction ? reactionMarks[currentReaction] : "+"}</span>
        </label>
        <button className="post-action" onClick={() => setCommentsOpen((open) => !open)}>
          <Icon name="comment" /><span>Comment</span>
        </button>
        <button
          className="post-action"
          onClick={repost}
          disabled={post.privacy !== "public"}
          title={post.privacy !== "public" ? "Only public posts can be shared" : "Share this post"}
        >
          <Icon name="share" /><span>Share</span>
        </button>
      </div>

      {notice && <p className="inline-success" role="status">{notice}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

<<<<<<< HEAD
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
=======
      {commentsOpen && (
        <section className="comment-section" aria-label="Comments">
          <form className="comment-form" onSubmit={addComment}>
            <Avatar user={currentUser} size="small" />
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment…"
              aria-label="Write a comment"
            />
            <button type="submit" aria-label="Send comment" disabled={!commentText.trim()}>
              <Icon name="send" />
            </button>
          </form>
          <div className="comment-list">
            {comments.map((comment) => {
              const commenter = typeof comment.userId === "object" ? comment.userId : undefined;
              const isCommentOwner = getUserId(comment.userId) === currentUser?._id;
              const commentReaction = comment.reactions?.find(
                (reaction) => getUserId(reaction.userId) === currentUser?._id,
              );

              return (
                <article className="comment-row" key={comment._id}>
                  <Avatar user={commenter} size="small" />
                  <div className="comment-body">
                    <div className="comment-bubble">
                      <strong>{getUserName(commenter)}</strong>
                      {editingComment === comment._id ? (
                        <textarea
                          value={editingCommentText}
                          onChange={(event) => setEditingCommentText(event.target.value)}
                          aria-label="Edit comment"
                          rows={2}
                        />
                      ) : (
                        <p>{comment.content}</p>
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
                      )}
                    </div>
                    <div className="comment-actions">
                      {isCommentOwner && (editingComment === comment._id ? (
                        <>
                          <button onClick={() => void updateComment(comment._id)}>Save</button>
                          <button onClick={() => setEditingComment(null)}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => {
                          setEditingComment(comment._id);
                          setEditingCommentText(comment.content);
                        }}>Edit</button>
                      ))}
                      {(isCommentOwner || isOwner) && editingComment !== comment._id && (
                        <button onClick={() => void removeComment(comment._id)}>Delete</button>
                      )}
                      <button
                        onClick={() => void reactToComment(comment._id, commentReaction?.type ?? "like")}
                        aria-label={commentReaction ? "Remove your comment reaction" : "Like this comment"}
                      >
                        {commentReaction ? "Liked" : "Like"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
