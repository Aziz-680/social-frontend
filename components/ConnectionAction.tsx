"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import friendService from "@/services/FriendService";
import chatService from "@/services/ChatService";
import { notifyError, notifySuccess } from "@/lib/notifications";
import Icon from "./Icon";

type ConnectionActionProps = {
  userId: string;
};

export default function ConnectionAction({ userId }: ConnectionActionProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUnfriending, setIsUnfriending] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    let active = true;
    friendService.getFriendStatus(userId)
      .then((friendStatus) => {
        if (active) setStatus(friendStatus);
      })
      .catch((error: unknown) => {
        if (active) notifyError(error, "Connection status unavailable.");
      });
    return () => {
      active = false;
    };
  }, [userId]);

  const sendRequest = async () => {
    setIsSending(true);
    try {
      await friendService.sendRequest(userId);
      setStatus("request_sent");
      window.dispatchEvent(new Event("social:connections-updated"));
      notifySuccess("Connection request sent.");
    } catch (requestError) {
      notifyError(requestError, "Your request couldn't be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const startChat = async () => {
    setIsStartingChat(true);
    try {
      const conversation = await chatService.createConversation(userId);
      window.sessionStorage.setItem("social:open-chat", conversation._id);
      router.push("/messages");
    } catch (error: unknown) {
      notifyError(error, "We couldn't open a conversation.");
    } finally {
      setIsStartingChat(false);
    }
  };

  const unfriend = async () => {
    if (!window.confirm("Remove this person from your connections?")) return;
    setIsUnfriending(true);
    try {
      await friendService.unfriend(userId);
      setStatus("none");
      window.dispatchEvent(new Event("social:connections-updated"));
      notifySuccess("Connection removed.");
    } catch (error: unknown) {
      notifyError(error, "This person couldn't be removed from your connections.");
    } finally {
      setIsUnfriending(false);
    }
  };

  if (status === "self") return null;
  if (status === "friends") {
    return (
      <div className="profile-connection-actions">
        <button className="button button-primary button-small" onClick={() => void startChat()} disabled={isStartingChat}>
          <Icon name="chat" />{isStartingChat ? "Opening…" : "Message"}
        </button>
        <button className="button button-secondary button-small profile-unfriend-button" onClick={() => void unfriend()} disabled={isUnfriending}>
          {isUnfriending ? "Removing…" : "Unfriend"}
        </button>
      </div>
    );
  }
  if (status === "request_sent") {
    return (
      <div className="profile-connection-actions">
        <button className="button button-secondary button-small" disabled>Request sent</button>
        <button className="button button-primary button-small" onClick={() => void startChat()} disabled={isStartingChat}>
          <Icon name="chat" />{isStartingChat ? "Opening…" : "Message"}
        </button>
      </div>
    );
  }
  if (status === "request_received") {
    return (
      <div className="profile-connection-actions">
        <Link className="button button-secondary button-small" href="/friends">Respond to request</Link>
        <button className="button button-primary button-small" onClick={() => void startChat()} disabled={isStartingChat}>
          <Icon name="chat" />{isStartingChat ? "Opening…" : "Message"}
        </button>
      </div>
    );
  }

  return (
    <div className="profile-connection-actions">
      <button className="button button-primary button-small" onClick={sendRequest} disabled={!status || isSending}>
        {isSending ? "Sending…" : "Add connection"}
      </button>
      <button className="button button-secondary button-small" onClick={() => void startChat()} disabled={!status || isStartingChat}>
        <Icon name="chat" />{isStartingChat ? "Opening…" : "Message"}
      </button>
    </div>
  );
}
