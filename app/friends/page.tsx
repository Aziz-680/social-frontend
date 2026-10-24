"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import friendService from "@/services/FriendService";
import type { User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";

export default function FriendsPage() {
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([friendService.getFriends(), friendService.getPendingRequests()])
      .then(([connectionList, requestList]) => {
        if (!active) return;
        setFriends(connectionList);
        setRequests(requestList);
      })
      .catch((loadError) => {
        if (active) setError(getErrorMessage(loadError, "Your network couldn't be loaded."));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleRequest = async (user: User, action: "accept" | "decline") => {
    const id = getUserId(user);
    setBusyId(id);
    setError("");
    try {
      if (action === "accept") {
        await friendService.acceptRequest(id);
        setFriends((current) => [...current, user]);
      } else {
        await friendService.rejectRequest(id);
      }
      setRequests((current) => current.filter((request) => getUserId(request) !== id));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "That request couldn't be updated."));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="network-column">
      <div className="page-heading">
        <div>
          <h1>Your connections</h1>
          <p>Keep your personal and professional circles close.</p>
        </div>
        <Link className="button button-primary" href="/search"><Icon name="search" /> Find people</Link>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoading ? (
        <div className="loading-card">Loading your network…</div>
      ) : (
        <>
          <section className="network-section">
            <div className="network-section-heading">
              <div>
                <h2>Requests</h2>
                <p>{requests.length ? `${requests.length} waiting for your response` : "New requests will appear here."}</p>
              </div>
              <span className="section-count">{requests.length}</span>
            </div>
            {requests.length === 0 ? (
              <div className="network-empty"><Icon name="bell" /><span>No pending connection requests.</span></div>
            ) : (
              <div className="network-grid">
                {requests.map((request) => {
                  const id = getUserId(request);
                  return (
                    <article className="network-card request-card" key={id}>
                      <Link href={`/profile/${id}`} className="network-person">
                        <Avatar user={request} size="large" />
                        <strong>{getUserName(request)}</strong>
                        <span>Would like to connect</span>
                      </Link>
                      <div className="network-card-actions">
                        <button
                          className="button button-primary button-small"
                          disabled={busyId === id}
                          onClick={() => void handleRequest(request, "accept")}
                        >
                          {busyId === id ? "Saving…" : "Accept"}
                        </button>
                        <button
                          className="button button-quiet button-small"
                          disabled={busyId === id}
                          onClick={() => void handleRequest(request, "decline")}
                        >
                          Decline
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="network-section">
            <div className="network-section-heading">
              <div>
                <h2>People in your network</h2>
                <p>{friends.length} {friends.length === 1 ? "connection" : "connections"}</p>
              </div>
              <Icon name="users" />
            </div>
            {friends.length === 0 ? (
              <div className="network-empty"><Icon name="users" /><span>Your connections will show up here.</span></div>
            ) : (
              <div className="network-grid">
                {friends.map((friend) => {
                  const id = getUserId(friend);
                  return (
                    <Link className="network-card network-person" href={`/profile/${id}`} key={id}>
                      <Avatar user={friend} size="large" />
                      <strong>{getUserName(friend)}</strong>
                      <span>View profile <Icon name="arrow" /></span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
