"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import friendService from "@/services/FriendService";
import type { User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";
import Avatar from "./Avatar";
import Icon from "./Icon";
import UserStatus from "./UserStatus";
import ChatMiniMenu from "./ChatMiniMenu";

export default function RightSidebar({ user }: { user: User | null }) {
  const [friends, setFriends] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadFriends = () => {
      friendService.getFriends()
        .then((people) => {
          if (!active) return;
          setFriends([...people].sort((a, b) => Number(b.status === "active") - Number(a.status === "active")));
          setError("");
        })
        .catch(() => {
          if (active) setError("Connections are temporarily unavailable.");
        });
    };
    loadFriends();
    window.addEventListener("social:connections-updated", loadFriends);
    return () => {
      active = false;
      window.removeEventListener("social:connections-updated", loadFriends);
    };
  }, []);

  return (
    <aside className="right-rail" aria-label="Your network">
      <section className="rail-card contacts-card">
        <div className="rail-heading contacts-heading">
          <div>
            <h2>Contacts</h2>
            <span>{friends.length ? `${friends.length} connections` : "Your network"}</span>
          </div>
          <div className="rail-heading-actions">
            <ChatMiniMenu user={user} />
            <Link href="/friends" aria-label="View all connections" title="View all connections"><Icon name="arrow" /></Link>
          </div>
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
          <>
            <ul className="connection-list contacts-list">
              {friends.slice(0, 8).map((friend) => (
                <li className="contact-row" key={getUserId(friend)}>
                  <Link href={`/profile/${getUserId(friend)}`} className="connection-link">
                    <span className="contact-avatar"><Avatar user={friend} size="small" /><i className={`contact-presence${friend.status === "active" ? " online" : ""}`} /></span>
                    <span className="connection-link-details"><span>{getUserName(friend)}</span><UserStatus status={friend.status} /></span>
                  </Link>
                  <button
                    type="button"
                    className="contact-message-button"
                    aria-label={`Message ${getUserName(friend)}`}
                    title={`Message ${getUserName(friend)}`}
                    onClick={() => window.dispatchEvent(new CustomEvent("social:start-mini-chat", { detail: getUserId(friend) }))}
                  >
                    <Icon name="chat" />
                  </button>
                </li>
              ))}
            </ul>
            <Link className="contacts-see-all" href="/friends">See all connections <Icon name="arrow" /></Link>
          </>
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
