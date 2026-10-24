/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
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

<<<<<<< HEAD
export default function FriendRequestsModal({ isOpen, onClose, onRequestAction }: FriendRequestsModalProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      friendService
        .getPendingRequests()
        .then((data) => setRequests(data || []))
        .catch((err) => console.error("Failed to load friend requests", err))
        .finally(() => setLoading(false));
    }
=======
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
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
  }, [isOpen]);

  if (!isOpen) return null;

<<<<<<< HEAD
  const handleAccept = async (senderId: string) => {
    try {
      await friendService.acceptRequest(senderId);
      setRequests((prev) => prev.filter((r) => (r.senderId?._id || r.senderId) !== senderId));
      if (onRequestAction) onRequestAction();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to accept friend request");
    }
  };

  const handleReject = async (senderId: string) => {
    try {
      await friendService.rejectRequest(senderId);
      setRequests((prev) => prev.filter((r) => (r.senderId?._id || r.senderId) !== senderId));
      if (onRequestAction) onRequestAction();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to reject friend request");
=======
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
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
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

<<<<<<< HEAD
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <p className="text-center text-blue-500 font-bold py-4 animate-pulse">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No pending friend requests.</p>
          ) : (
            requests.map((req) => {
              const sender = req.senderId;
              if (!sender) return null;

              return (
                <div key={req._id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={sender.profilePicture || "https://via.placeholder.com/40"}
                      alt="Sender"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {sender.firstName} {sender.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(sender._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(sender._id)}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-500 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
=======
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
>>>>>>> d3e7f0d353f05636cd59e220ee0229a842894460
        </div>
      </section>
    </div>
  );
}
