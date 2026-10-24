"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import friendService from "@/services/FriendService";
import type { User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";
import Avatar from "./Avatar";
import Icon from "./Icon";

export default function RightSidebar() {
  const [friends, setFriends] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    friendService
      .getFriends()
      .then(setFriends)
      .catch(() => setError("Connections are temporarily unavailable."));
  }, []);

  return (
    <aside className="right-rail" aria-label="Your network">
      <section className="rail-card">
        <div className="rail-heading">
          <h2>Your connections</h2>
          <Link href="/friends" aria-label="View all connections"><Icon name="arrow" /></Link>
        </div>
        {error ? (
          <p className="rail-message" role="status">{error}</p>
        ) : friends.length === 0 ? (
          <div className="rail-empty">
            <span className="rail-empty-icon"><Icon name="users" /></span>
            <p>Your network starts with a connection.</p>
            <Link href="/search">Find people</Link>
          </div>
        ) : (
          <ul className="connection-list">
            {friends.slice(0, 6).map((friend) => (
              <li key={getUserId(friend)}>
                <Link href={`/profile/${getUserId(friend)}`} className="connection-link">
                  <Avatar user={friend} size="small" />
                  <span>{getUserName(friend)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rail-note">
        <span className="rail-note-icon"><Icon name="briefcase" /></span>
        <div>
          <h2>One network, many sides of life</h2>
          <p>Keep up with friends, colleagues, and the ideas you share.</p>
        </div>
      </section>
    </aside>
  );
}
