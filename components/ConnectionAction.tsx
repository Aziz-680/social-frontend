"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import friendService from "@/services/FriendService";

type ConnectionActionProps = {
  userId: string;
};

export default function ConnectionAction({ userId }: ConnectionActionProps) {
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    friendService.getFriendStatus(userId)
      .then((friendStatus) => {
        if (active) setStatus(friendStatus);
      })
      .catch(() => {
        if (active) setError("Connection status unavailable.");
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const sendRequest = async () => {
    setError("");
    setIsSending(true);
    try {
      await friendService.sendRequest(userId);
      setStatus("request_sent");
    } catch {
      setError("Your request couldn't be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (status === "self") return null;
  if (status === "friends") {
    return <span className="connection-status"><span className="status-dot status-active" />Connected</span>;
  }
  if (status === "request_sent") {
    return <button className="button button-secondary button-small" disabled>Request sent</button>;
  }
  if (status === "request_received") {
    return <Link className="button button-secondary button-small" href="/friends">Respond to request</Link>;
  }

  return (
    <div className="connection-action">
      <button className="button button-primary button-small" onClick={sendRequest} disabled={!status || isSending}>
        {isSending ? "Sending…" : "Connect"}
      </button>
      {error && <span className="connection-error" role="status">{error}</span>}
    </div>
  );
}
