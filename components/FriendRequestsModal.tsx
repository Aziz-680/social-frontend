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

  useEffect(() => {
    if (isOpen) {
      friendService.getPendingRequests().then((data) => setRequests(data || []));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAccept = async (senderId: string) => {
    await friendService.acceptRequest(senderId);
    setRequests((prev) => prev.filter((r) => r.senderId._id !== senderId));
    if (onRequestAction) onRequestAction();
  };

  const handleReject = async (senderId: string) => {
    await friendService.rejectRequest(senderId);
    setRequests((prev) => prev.filter((r) => r.senderId._id !== senderId));
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
          {requests.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No pending friend requests.</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <img
                    src={req.senderId.profilePicture || "https://via.placeholder.com/40"}
                    alt="Sender"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {req.senderId.firstName} {req.senderId.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.senderId._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(req.senderId._id)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}