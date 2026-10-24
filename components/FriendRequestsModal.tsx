"use client";

import { useEffect, useState } from "react";
import friendService from "@/services/FriendService";
import type { User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";
import Avatar from "./Avatar";
import Icon from "./Icon";

type FriendRequestsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRequestAction?: () => void;
};

export default function FriendRequestsModal({
  isOpen,
  onClose,
  onRequestAction,
}: FriendRequestsModalProps) {
  const [requests, setRequests] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    friendService
      .getPendingRequests()
      .then(setRequests)
      .catch(() => setError("Friend requests couldn't be loaded. Please try again."))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = async (senderId: string, action: "accept" | "decline") => {
    setError("");
    try {
      if (action === "accept") {
        await friendService.acceptRequest(senderId);
        onRequestAction?.();
      } else {
        await friendService.rejectRequest(senderId);
      }
      setRequests((current) =>
        current.filter((request) => getUserId(request) !== senderId),
      );
    } catch {
      setError(
        action === "accept"
          ? "That request couldn't be accepted. Please try again."
          : "That request couldn't be declined. Please try again.",
      );
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="request-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="requests-title"
      >
        <div className="modal-heading">
          <div>
            <h2 id="requests-title">Connection requests</h2>
            <p>Choose who to add to your network.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close requests">
            <Icon name="close" />
          </button>
        </div>

        <div className="request-list">
          {error && <p className="form-error" role="alert">{error}</p>}
          {isLoading ? (
            <p className="empty-message">Loading your requests…</p>
          ) : requests.length === 0 ? (
            <p className="empty-message">You’re all caught up. New requests will appear here.</p>
          ) : requests.map((request) => {
            const senderId = getUserId(request);
            return (
              <article className="request-row" key={senderId}>
                <Avatar user={request} />
                <div className="request-person">
                  <strong>{getUserName(request)}</strong>
                  <span>Would like to connect</span>
                </div>
                <div className="request-actions">
                  <button
                    className="button button-primary button-small"
                    onClick={() => handleAction(senderId, "accept")}
                  >
                    Accept
                  </button>
                  <button
                    className="button button-quiet button-small"
                    onClick={() => handleAction(senderId, "decline")}
                  >
                    Decline
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
