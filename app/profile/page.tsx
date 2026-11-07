"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import postService from "@/services/PostService";
import userService from "@/services/UserService";
import type { Pagination, Post, User } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import { notifyError, notifySuccess } from "@/lib/notifications";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
import PostCard from "@/components/PostCard";
import StatusSelector from "@/components/StatusSelector";
import UserStatus from "@/components/UserStatus";

const emptyPagination: Pagination = { totalItems: 0, currentPage: 0, totalPages: 0, limit: 5 };

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
  const [postContent, setPostContent] = useState("");
  const [postPrivacy, setPostPrivacy] = useState<Post["privacy"]>("public");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingExperience, setIsSavingExperience] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    userService
      .getProfile()
      .then((profile) => {
        setUser(profile);
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
      })
      .catch((profileError) => setError(getErrorMessage(profileError, "Your profile couldn't be loaded.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    postService
      .getUserPosts(user._id, 1, 5)
      .then((result) => {
        setPosts(result.posts);
        setPagination(result.pagination);
      })
      .catch((postError) => setError(getErrorMessage(postError, "Your posts couldn't be loaded.")));
  }, [user?._id]);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const choosePostImage = (file?: File) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file ?? null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const createPost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!postContent.trim() && !selectedImage) return;

    const formData = new FormData();
    formData.append("content", postContent.trim());
    formData.append("privacy", postPrivacy);
    if (selectedImage) formData.append("image", selectedImage);

    setIsPosting(true);
    try {
      const created = await postService.createPost(formData);
      setPosts((current) => [created, ...current]);
      setPagination((current) => ({
        ...current,
        totalItems: current.totalItems + 1,
        totalPages: Math.ceil((current.totalItems + 1) / current.limit),
        currentPage: Math.max(1, current.currentPage),
      }));
      setPostContent("");
      setPostPrivacy("public");
      choosePostImage();
      if (postImageInputRef.current) postImageInputRef.current.value = "";
      notifySuccess("Your post has been shared.");
    } catch (postError) {
      notifyError(postError, "Your post couldn't be published.");
    } finally {
      setIsPosting(false);
    }
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const updated = await userService.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      setUser(updated);
      setIsEditing(false);
      notifySuccess("Your profile has been updated.");
    } catch (saveError) {
      notifyError(saveError, "Your profile couldn't be updated.");
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    setError("");
    try {
      const updated = await userService.uploadAvatar(file);
      setUser(updated);
      window.dispatchEvent(new CustomEvent("social:profile-updated", { detail: updated }));
      notifySuccess("Your profile photo has been updated.");
    } catch (uploadError) {
      notifyError(uploadError, "Your profile photo couldn't be updated.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAvatar = async () => {
    setIsUploading(true);
    setError("");
    try {
      const updated = await userService.removeAvatar();
      setUser(updated);
      window.dispatchEvent(new CustomEvent("social:profile-updated", { detail: updated }));
      notifySuccess("Your profile photo has been removed.");
    } catch (removeError) {
      notifyError(removeError, "Your profile photo couldn't be removed.");
    } finally {
      setIsUploading(false);
    }
  };

  const addExperience = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setIsSavingExperience(true);
    setError("");
    try {
      const updated = await userService.updateProfile({
        workExperience: [...(user.workExperience ?? []), { title: jobTitle.trim(), company: company.trim() }],
      });
      setUser(updated);
      setJobTitle("");
      setCompany("");
      notifySuccess("Work experience has been added.");
    } catch (experienceError) {
      notifyError(experienceError, "Work experience couldn't be saved.");
    } finally {
      setIsSavingExperience(false);
    }
  };

  const loadMorePosts = async () => {
    if (!user || pagination.currentPage >= pagination.totalPages) return;
    setIsLoading(true);
    try {
      const result = await postService.getUserPosts(user._id, pagination.currentPage + 1, 5);
      setPosts((current) => [...current, ...result.posts]);
      setPagination(result.pagination);
    } catch (postError) {
      notifyError(postError, "More posts couldn't be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = (updated: Post) => {
    setPosts((current) => current.map((post) => post._id === updated._id ? updated : post));
  };

  if (isLoading && !user) {
    return <div className="profile-column"><div className="loading-card">Loading your profile…</div></div>;
  }

  return (
    <div className="profile-column">
      {error && <p className="form-error" role="alert">{error}</p>}
      <section className="profile-card">
        <div className="profile-cover">
          <span className="cover-orbit cover-orbit-one" />
          <span className="cover-orbit cover-orbit-two" />
          <span className="cover-caption">Your network, in one place</span>
        </div>
        <div className="profile-identity">
          <div className="profile-avatar-actions">
            <button
              className="profile-avatar-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label="Change profile photo"
            >
              <Avatar user={user} size="large" />
              <span>{isUploading ? "Uploading…" : "Change photo"}</span>
            </button>
            {user?.profilePicture && (
              <button
                type="button"
                className="profile-avatar-remove-button"
                onClick={() => void removeAvatar()}
                disabled={isUploading}
              >
                Remove photo
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="image/*"
            onChange={(event) => void uploadAvatar(event.target.files?.[0])}
            aria-label="Choose a profile photo"
          />
          <div className="profile-details">
            {isEditing ? (
              <form className="profile-edit-form" onSubmit={saveProfile}>
                <label>
                  First name
                  <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required minLength={2} />
                </label>
                <label>
                  Last name
                  <input value={lastName} onChange={(event) => setLastName(event.target.value)} required minLength={2} />
                </label>
                <div className="profile-edit-actions">
                  <button type="button" className="button button-quiet button-small" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button className="button button-primary button-small" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save profile"}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1>{user ? `${user.firstName} ${user.lastName}` : "Your profile"}</h1>
                <UserStatus status={user?.status} />
                <p>{user?.email}</p>
                <span className="profile-network-note"><Icon name="users" /> A profile for every side of you</span>
              </>
            )}
          </div>
          {!isEditing && (
            <button className="button button-secondary edit-profile-button" onClick={() => setIsEditing(true)}>
              Edit profile
            </button>
          )}
        </div>
        <div className="profile-subnav">
          <span className="profile-subnav-active">Posts</span>
          <div className="profile-status">
            <span>Profile status</span>
            <StatusSelector
              currentStatus={user?.status}
              onStatusChange={(status) => setUser((current) => current ? { ...current, status } : current)}
            />
          </div>
        </div>
      </section>

      <section className="experience-section">
        <div className="profile-section-title">
          <div><h2>Work experience</h2><p>Share a little about your professional path.</p></div>
          <Icon name="briefcase" />
        </div>
        {user?.workExperience?.length ? (
          <ul className="experience-list">
            {user.workExperience.map((experience, index) => (
              <li key={`${experience.company}-${index}`}>
                <span className="experience-icon"><Icon name="briefcase" /></span>
                <span>
                  <strong>{experience.title}</strong>
                  <small>{experience.company}</small>
                  {(experience.startDate || experience.endDate) && (
                    <small className="experience-dates">
                      {experience.startDate ? new Date(experience.startDate).getFullYear() : ""}
                      {experience.startDate && experience.endDate ? " – " : ""}
                      {experience.endDate ? new Date(experience.endDate).getFullYear() : "Present"}
                    </small>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="experience-empty">Add a role to show your professional experience.</p>
        )}
        <form className="experience-form" onSubmit={addExperience}>
          <label>
            Role
            <input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} required minLength={2} placeholder="e.g. Product designer" />
          </label>
          <label>
            Company
            <input value={company} onChange={(event) => setCompany(event.target.value)} required minLength={2} placeholder="Company name" />
          </label>
          <button className="button button-secondary button-small" disabled={isSavingExperience}>
            {isSavingExperience ? "Saving…" : "Add experience"}
          </button>
        </form>
      </section>

      <section className="composer-card profile-composer" aria-labelledby="profile-composer-title">
        <h2 className="visually-hidden" id="profile-composer-title">Create a post</h2>
        <div className="composer-top">
          <Avatar user={user} />
          <button className="composer-prompt" type="button" onClick={() => document.getElementById("profile-post-content")?.focus()}>
            Share an update with your network
          </button>
        </div>
        <form onSubmit={createPost}>
          <textarea
            id="profile-post-content"
            value={postContent}
            onChange={(event) => setPostContent(event.target.value)}
            placeholder={`What would you like to share${user?.firstName ? `, ${user.firstName}` : ""}?`}
            rows={3}
            aria-labelledby="profile-composer-title"
          />
          {imagePreview && (
            <div className="image-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Selected post preview" />
              <button type="button" className="icon-button" onClick={() => choosePostImage()} aria-label="Remove image">
                <Icon name="close" />
              </button>
            </div>
          )}
          <div className="composer-actions">
            <div className="composer-options">
              <input
                ref={postImageInputRef}
                type="file"
                accept="image/*"
                className="visually-hidden"
                onChange={(event) => choosePostImage(event.target.files?.[0])}
                aria-label="Choose an image to attach"
              />
              <button type="button" className="composer-image" onClick={() => postImageInputRef.current?.click()}>
                <Icon name="image" /><span>Photo</span>
              </button>
              <label className="privacy-select">
                <Icon name="users" />
                <select aria-label="Who can see this post" value={postPrivacy} onChange={(event) => setPostPrivacy(event.target.value as Post["privacy"])}>
                  <option value="public">Anyone</option>
                  <option value="friends">Connections</option>
                  <option value="only_me">Only me</option>
                </select>
                <Icon name="chevron" />
              </label>
            </div>
            <button className="button button-primary" type="submit" disabled={isPosting || (!postContent.trim() && !selectedImage)}>
              {isPosting ? "Sharing…" : "Share"}
            </button>
          </div>
        </form>
      </section>

      <section className="profile-posts">
        <div className="profile-section-title">
          <div>
            <h2>Your posts</h2>
            <p>Updates you’ve shared with your network.</p>
          </div>
          <Icon name="briefcase" />
        </div>
        {posts.length === 0 && !isLoading ? (
          <div className="empty-feed">
            <span className="empty-feed-icon"><Icon name="image" /></span>
            <h2>Your story starts with a post</h2>
            <p>Share an update and it will live here on your profile.</p>
            <Link className="button button-primary" href="/feed">Write a post</Link>
          </div>
        ) : (
          <div className="post-list">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onPostUpdate={updatePost}
                onPostDelete={(postId) => setPosts((current) => current.filter((item) => item._id !== postId))}
              />
            ))}
          </div>
        )}
        {pagination.currentPage < pagination.totalPages && (
          <button className="button button-secondary load-more" disabled={isLoading} onClick={() => void loadMorePosts()}>
            {isLoading ? "Loading…" : "Show more posts"}
          </button>
        )}
      </section>
    </div>
  );
}
