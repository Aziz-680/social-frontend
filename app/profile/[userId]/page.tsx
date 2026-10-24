"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import postService from "@/services/PostService";
import userService from "@/services/UserService";
import friendService from "@/services/FriendService";
import type { Post, User } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import { getUserName } from "@/lib/types";
import Avatar from "@/components/Avatar";
import ConnectionAction from "@/components/ConnectionAction";
import Icon from "@/components/Icon";
import PostCard from "@/components/PostCard";

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const [profile, setProfile] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      userService.getPublicProfile(userId),
      userService.getProfile(),
      postService.getUserPosts(userId, 1, 10),
      friendService.getFriendsForUser(userId),
    ])
      .then(([publicProfile, me, postPage, connections]) => {
        if (!active) return;
        setProfile(publicProfile);
        setCurrentUser(me);
        setPosts(postPage.posts);
        setFriendCount(connections.length);
      })
      .catch((loadError) => {
        if (active) setError(getErrorMessage(loadError, "This profile couldn't be loaded."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (isLoading) return <div className="profile-column"><div className="loading-card">Loading profile…</div></div>;
  if (error || !profile) {
    return (
      <div className="profile-column">
        <p className="form-error" role="alert">{error || "This profile is unavailable."}</p>
      </div>
    );
  }

  return (
    <div className="profile-column">
      <section className="profile-card">
        <div className="profile-cover">
          <span className="cover-orbit cover-orbit-one" />
          <span className="cover-orbit cover-orbit-two" />
          <span className="cover-caption">A little of everything that makes you, you</span>
        </div>
        <div className="profile-identity">
          <Avatar user={profile} size="large" />
          <div className="profile-details">
            <h1>{getUserName(profile)}</h1>
            <p className="profile-network-note"><Icon name="users" /> {friendCount} {friendCount === 1 ? "connection" : "connections"}</p>
          </div>
          <ConnectionAction userId={userId} />
        </div>
        <div className="profile-subnav">
          <span className="profile-subnav-active">Posts</span>
        </div>
      </section>

      {profile.workExperience?.length ? (
        <section className="experience-section">
          <div className="profile-section-title">
            <div><h2>Work experience</h2><p>A little about {profile.firstName}’s professional path.</p></div>
            <Icon name="briefcase" />
          </div>
          <ul className="experience-list">
            {profile.workExperience.map((experience, index) => (
              <li key={`${experience.company}-${index}`}>
                <span className="experience-icon"><Icon name="briefcase" /></span>
                <span><strong>{experience.title}</strong><small>{experience.company}</small></span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="profile-posts">
        <div className="profile-section-title">
          <div><h2>Recent posts</h2><p>Updates shared with their network.</p></div>
          <Icon name="briefcase" />
        </div>
        {posts.length === 0 ? (
          <div className="empty-feed">
            <span className="empty-feed-icon"><Icon name="image" /></span>
            <h2>No posts to show</h2>
            <p>When {profile.firstName} shares an update, it will appear here.</p>
          </div>
        ) : (
          <div className="post-list">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
                onPostUpdate={(updated) => setPosts((current) =>
                  current.map((item) => item._id === updated._id ? updated : item),
                )}
                onPostDelete={(postId) => setPosts((current) =>
                  current.filter((item) => item._id !== postId),
                )}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
