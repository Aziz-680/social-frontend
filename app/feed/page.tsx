"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import postService from "@/services/PostService";
import userService from "@/services/UserService";
import type { Pagination, Post, User } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import PostCard from "@/components/PostCard";

const firstPage: Pagination = { totalItems: 0, currentPage: 0, totalPages: 0, limit: 10 };

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState(firstPage);
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<Post["privacy"]>("public");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFeed = useCallback(async (page: number, append: boolean) => {
    setError("");
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);
    try {
      const result = await postService.getFeed(page, 10);
      setPosts((current) => append ? [...current, ...result.posts] : result.posts);
      setPagination(result.pagination);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Your feed couldn't be loaded."));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    userService
      .getProfile()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch((profileError) => {
        if (active) setError(getErrorMessage(profileError, "Your profile couldn't be loaded."));
      });
    postService
      .getFeed(1, 10)
      .then((result) => {
        if (!active) return;
        setPosts(result.posts);
        setPagination(result.pagination);
      })
      .catch((loadError) => {
        if (active) setError(getErrorMessage(loadError, "Your feed couldn't be loaded."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const chooseImage = (file?: File) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file ?? null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const createPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim() && !selectedImage) return;

    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("privacy", privacy);
    if (selectedImage) formData.append("image", selectedImage);

    setIsPosting(true);
    setError("");
    try {
      const created = await postService.createPost(formData);
      setPosts((current) => [created, ...current]);
      setContent("");
      setPrivacy("public");
      chooseImage();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (postError) {
      setError(getErrorMessage(postError, "Your post couldn't be published."));
    } finally {
      setIsPosting(false);
    }
  };

  const updatePost = (updated: Post) => {
    setPosts((current) => current.map((post) => post._id === updated._id ? updated : post));
  };

  const deletePost = (postId: string) => {
    setPosts((current) => current.filter((post) => post._id !== postId));
  };

  return (
    <div className="feed-column">
      <div className="feed-intro">
        <div>
          <h1>Your feed</h1>
          <p>A little from every part of your network.</p>
        </div>
        <span className="feed-intro-mark"><Icon name="home" /></span>
      </div>

      <section className="composer-card" aria-labelledby="composer-title">
        <h2 className="visually-hidden" id="composer-title">Create a post</h2>
        <div className="composer-top">
          <Avatar user={user} />
          <button className="composer-prompt" onClick={() => document.getElementById("post-content")?.focus()}>
            Share an update with your network
          </button>
        </div>
        <form onSubmit={createPost}>
          <textarea
            id="post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={`What would you like to share${user?.firstName ? `, ${user.firstName}` : ""}?`}
            rows={3}
            aria-labelledby="composer-title"
          />
          {imagePreview && (
            <div className="image-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Selected post preview" />
              <button type="button" className="icon-button" onClick={() => chooseImage()} aria-label="Remove image">
                <Icon name="close" />
              </button>
            </div>
          )}
          <div className="composer-actions">
            <div className="composer-options">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="visually-hidden"
                onChange={(event) => chooseImage(event.target.files?.[0])}
                aria-label="Choose an image to attach"
              />
              <button type="button" className="composer-image" onClick={() => fileInputRef.current?.click()}>
                <Icon name="image" /><span>Photo</span>
              </button>
              <label className="privacy-select">
                <Icon name="users" />
                <select
                  aria-label="Who can see this post"
                  value={privacy}
                  onChange={(event) => setPrivacy(event.target.value as Post["privacy"])}
                >
                  <option value="public">Anyone</option>
                  <option value="friends">Connections</option>
                  <option value="only_me">Only me</option>
                </select>
                <Icon name="chevron" />
              </label>
            </div>
            <button className="button button-primary" type="submit" disabled={isPosting || (!content.trim() && !selectedImage)}>
              {isPosting ? "Sharing…" : "Share"}
            </button>
          </div>
        </form>
      </section>

      <div className="feed-section-heading">
        <h2>Latest updates</h2>
        <span>Most recent</span>
      </div>

      {error && <p className="form-error feed-error" role="alert">{error}</p>}
      {isLoading ? (
        <div className="loading-card" role="status">Loading your feed…</div>
      ) : posts.length === 0 ? (
        <section className="empty-feed">
          <span className="empty-feed-icon"><Icon name="users" /></span>
          <h2>Your feed begins here</h2>
          <p>Share an update or find people to start building your network.</p>
          <Link className="button button-primary" href="/search">Find people</Link>
        </section>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={user}
              onPostUpdate={updatePost}
              onPostDelete={deletePost}
              onPostShared={() => void loadFeed(1, false)}
            />
          ))}
        </div>
      )}

      {!isLoading && pagination.currentPage < pagination.totalPages && (
        <button
          className="button button-secondary load-more"
          onClick={() => void loadFeed(pagination.currentPage + 1, true)}
          disabled={isLoadingMore}
        >
          {isLoadingMore ? "Loading…" : "Show older updates"}
        </button>
      )}
    </div>
  );
}
