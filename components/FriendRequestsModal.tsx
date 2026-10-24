/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import friendService from "@/services/FriendService";

type FriendRequestSender = {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string | null;
};

type FriendRequest = {
  _id: string;
  senderId: FriendRequestSender;
};

type FriendRequestsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRequestAction?: () => void;
};

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
  }, [isOpen]);

  if (!isOpen) return null;

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
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Friend Requests</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-xl font-bold">
            &times;
          </button>
        </div>

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
        </div>
      </div>
    </div>
  );
}