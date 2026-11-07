"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import postService from "@/services/PostService";
import type { Post, ReactionType, User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";
import { notifyError, notifySuccess } from "@/lib/notifications";
import Avatar from "./Avatar";
import Icon from "./Icon";
import UserStatus from "./UserStatus";

type PostCardProps = {
  post: Post;
  currentUser: User | null;
  onPostUpdate: (updatedPost: Post) => void;
  onPostDelete?: (postId: string) => void;
  onPostShared?: () => void;
};

const reactionTypes: Array<{ type: ReactionType; label: string; emoji: string }> = [
  { type: "like", label: "Like", emoji: "👍" },
  { type: "love", label: "Love", emoji: "❤️" },
  { type: "haha", label: "Haha", emoji: "😂" },
  { type: "wow", label: "Wow", emoji: "😮" },
  { type: "sad", label: "Sad", emoji: "😢" },
  { type: "angry", label: "Angry", emoji: "😡" },
];

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
  const [isReactionMenuOpen, setIsReactionMenuOpen] = useState(false);
  const [isPrivacyMenuOpen, setIsPrivacyMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const privacyControlRef = useRef<HTMLDivElement>(null);

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
  const privacyOptions: Array<{ value: Post["privacy"]; label: string; detail: string; icon: "globe" | "users" | "lock" }> = [
    { value: "public", label: "Anyone", detail: "Anyone can see this post", icon: "globe" },
    { value: "friends", label: "Connections", detail: "Only your connections can see this", icon: "users" },
    { value: "only_me", label: "Only me", detail: "Only you can see this post", icon: "lock" },
  ];
  const selectedPrivacy = privacyOptions.find((option) => option.value === editPrivacy) ?? privacyOptions[0];

  useEffect(() => {
    if (!isPrivacyMenuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!privacyControlRef.current?.contains(event.target as Node)) setIsPrivacyMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPrivacyMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isPrivacyMenuOpen]);

  const savePost = async () => {
    setError("");
    if (post.content.trim() && !editContent.trim()) {
      setError("Post text can't be cleared. Add text before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await postService.editPost(
        post._id,
        editContent.trim() ? editContent : undefined,
        editPrivacy,
      );
      onPostUpdate(updated);
      setIsEditing(false);
      notifySuccess("Your post has been updated.");
    } catch (saveError) {
      notifyError(saveError, "Your post couldn't be updated.");
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
      notifySuccess("Your post has been deleted.");
    } catch (deleteError) {
      notifyError(deleteError, "Your post couldn't be deleted.");
    } finally {
      setIsSaving(false);
    }
  };

  const react = async (type: ReactionType) => {
    setError("");
    try {
      onPostUpdate(await postService.reactToPost(post._id, type));
    } catch (reactionError) {
      notifyError(reactionError, "Your reaction couldn't be saved.");
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
      notifySuccess("Your comment has been added.");
    } catch (commentError) {
      notifyError(commentError, "Your comment couldn't be added.");
    }
  };

  const updateComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    setError("");
    try {
      onPostUpdate(await postService.editComment(post._id, commentId, editingCommentText.trim()));
      setEditingComment(null);
    } catch (commentError) {
      notifyError(commentError, "Your comment couldn't be updated.");
    }
  };

  const removeComment = async (commentId: string) => {
    setError("");
    try {
      onPostUpdate(await postService.deleteComment(post._id, commentId));
    } catch (commentError) {
      notifyError(commentError, "Your comment couldn't be deleted.");
    }
  };

  const reactToComment = async (commentId: string, type: ReactionType) => {
    setError("");
    try {
      onPostUpdate(await postService.reactToComment(post._id, commentId, type));
    } catch (reactionError) {
      notifyError(reactionError, "Your reaction couldn't be saved.");
    }
  };

  const repost = async () => {
    setError("");
    try {
      await postService.repost(post._id);
      notifySuccess("Shared to your profile.");
      onPostShared?.();
    } catch (repostError) {
      notifyError(repostError, "This post couldn't be shared.");
    }
  };

  return (
    <article className="post-card" id={`post-${post._id}`}>
      {post.isRepost && (
        <p className="repost-label"><Icon name="share" /> Shared by {getUserName(author)}</p>
      )}
      <header className="post-heading">
        <Link href={author?._id ? `/profile/${author._id}` : "/profile"} className="post-author">
          <Avatar user={author} />
          <span>
            <strong>{getUserName(author)}</strong>
            <UserStatus status={author?.status} />
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
            <div className="edit-privacy-control" ref={privacyControlRef}>
              <span className="edit-privacy-label">Visibility</span>
              <button
                type="button"
                className="edit-privacy-trigger"
                aria-haspopup="listbox"
                aria-expanded={isPrivacyMenuOpen}
                onClick={() => setIsPrivacyMenuOpen((open) => !open)}
              >
                <Icon name={selectedPrivacy.icon} />
                <span>{selectedPrivacy.label}</span>
                <Icon name="chevron" />
              </button>
              {isPrivacyMenuOpen && (
                <div className="edit-privacy-menu" role="listbox" aria-label="Post visibility">
                  {privacyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={editPrivacy === option.value}
                      className={editPrivacy === option.value ? "edit-privacy-option selected" : "edit-privacy-option"}
                      onClick={() => {
                        setEditPrivacy(option.value);
                        setIsPrivacyMenuOpen(false);
                      }}
                    >
                      <span className="edit-privacy-option-icon"><Icon name={option.icon} /></span>
                      <span className="edit-privacy-option-copy"><strong>{option.label}</strong><small>{option.detail}</small></span>
                      {editPrivacy === option.value && <Icon name="check" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
        <div
          className="reaction-picker"
          onMouseEnter={() => setIsReactionMenuOpen(true)}
          onMouseLeave={() => setIsReactionMenuOpen(false)}
        >
          <button
            type="button"
            className={currentReaction ? "reaction-action selected" : "reaction-action"}
            aria-label={currentReaction ? `Your reaction: ${reactionTypes.find(({ type }) => type === currentReaction)?.label}` : "React to this post"}
            aria-expanded={isReactionMenuOpen}
            onFocus={() => setIsReactionMenuOpen(true)}
            onClick={() => {
              if (currentReaction) {
                void react(currentReaction);
                setIsReactionMenuOpen(false);
              } else {
                setIsReactionMenuOpen(true);
              }
            }}
          >
            <span className="reaction-trigger-emoji" aria-hidden="true">
              {reactionTypes.find(({ type }) => type === currentReaction)?.emoji ?? "👍"}
            </span>
            <span>{currentReaction ? reactionTypes.find(({ type }) => type === currentReaction)?.label : "React"}</span>
          </button>
          {isReactionMenuOpen && (
            <div className="reaction-menu" role="menu" aria-label="Choose a reaction">
              {reactionTypes.map((reaction) => (
                <button
                  key={reaction.type}
                  type="button"
                  className="reaction-option"
                  role="menuitem"
                  aria-label={reaction.label}
                  title={reaction.label}
                  onClick={() => {
                    void react(reaction.type);
                    setIsReactionMenuOpen(false);
                  }}
                >
                  <span aria-hidden="true">{reaction.emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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

      {error && <p className="form-error" role="alert">{error}</p>}

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
                      <UserStatus status={commenter?.status} />
                      {editingComment === comment._id ? (
                        <textarea
                          value={editingCommentText}
                          onChange={(event) => setEditingCommentText(event.target.value)}
                          aria-label="Edit comment"
                          rows={2}
                        />
                      ) : (
                        <p>{comment.content}</p>
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
