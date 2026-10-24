"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import postService from "@/services/PostService";
import userService from "@/services/UserService";
<<<<<<< HEAD
=======
import type { Pagination, Post, User } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
import PostCard from "@/components/PostCard";
import StatusSelector from "@/components/StatusSelector";

const emptyPagination: Pagination = { totalItems: 0, currentPage: 0, totalPages: 0, limit: 5 };

export default function ProfilePage() {
<<<<<<< HEAD
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
=======
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState(emptyPagination);
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

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const updated = await userService.updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() });
      setUser(updated);
      setIsEditing(false);
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Your profile couldn't be updated."));
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    setIsUploading(true);
    setError("");
    try {
      setUser(await userService.uploadAvatar(file));
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, "Your profile photo couldn't be updated."));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    } catch (experienceError) {
      setError(getErrorMessage(experienceError, "Work experience couldn't be saved."));
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
      setError(getErrorMessage(postError, "More posts couldn't be loaded."));
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = (updated: Post) => {
    setPosts((current) => current.map((post) => post._id === updated._id ? updated : post));
  };

  if (isLoading && !user) {
    return <div className="profile-column"><div className="loading-card">Loading your profile…</div></div>;
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
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
          <button
            className="profile-avatar-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Change profile photo"
          >
<<<<<<< HEAD
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
=======
            <Avatar user={user} size="large" />
            <span>{isUploading ? "Uploading…" : "Change photo"}</span>
          </button>
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
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
    </div>
  );
}
