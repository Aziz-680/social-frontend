"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import chatService from "@/services/ChatService";
import type { ChatConversation, ChatMessage, User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";
import { notifyError } from "@/lib/notifications";
import Avatar from "./Avatar";
import Icon from "./Icon";
import UserStatus from "./UserStatus";

function otherUser(conversation: ChatConversation, userId: string): User | undefined {
  const participant = conversation.participants.find((item) => getUserId(item) !== userId);
  return typeof participant === "object" ? participant : undefined;
}

function lastMessage(conversation: ChatConversation): ChatMessage | undefined {
  return conversation.lastMessage && typeof conversation.lastMessage === "object"
    ? conversation.lastMessage
    : undefined;
}

export default function ChatMiniMenu({ user }: { user: User | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() =>
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported",
  );
  const unreadCount = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0),
    [conversations],
  );
  const selectedConversation = conversations.find((conversation) => conversation._id === selectedId);
  const selectedPerson = selectedConversation && user ? otherUser(selectedConversation, user._id) : undefined;

  const startConversationWith = useCallback(async (recipientId: string) => {
    try {
      const conversation = await chatService.createConversation(recipientId);
      const list = await chatService.listConversations();
      setConversations(list);
      setOpen(true);
      setSelectedId(conversation._id);
      setMessages([]);
      setIsLoadingThread(true);
      const page = await chatService.getMessages(conversation._id);
      setMessages(page.messages);
      await chatService.markRead(conversation._id);
      window.dispatchEvent(new Event("social:chat-inbox-updated"));
    } catch (error: unknown) {
      notifyError(error, "We couldn't open a conversation.");
    } finally {
      setIsLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const refresh = () => {
      void chatService.listConversations().then((items) => {
        if (active) setConversations(items);
      }).catch(() => undefined);
    };
    const handleInboxUpdated = (event: Event) => {
      refresh();
      const message = (event as CustomEvent<ChatMessage>).detail;
      if (message?.conversationId === selectedId) {
        setMessages((current) => current.some((item) => item._id === message._id)
          ? current
          : [...current, message].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)));
      }
    };
    const handleStartConversation = (event: Event) => {
      const recipientId = (event as CustomEvent<string>).detail;
      if (recipientId) void startConversationWith(recipientId);
    };
    refresh();
    window.addEventListener("social:chat-inbox-updated", handleInboxUpdated);
    window.addEventListener("social:start-mini-chat", handleStartConversation);
    return () => {
      active = false;
      window.removeEventListener("social:chat-inbox-updated", handleInboxUpdated);
      window.removeEventListener("social:start-mini-chat", handleStartConversation);
    };
  }, [selectedId, startConversationWith, user]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("social:chat-active-conversation", {
      detail: open ? selectedId : "",
    }));
    return () => {
      window.dispatchEvent(new CustomEvent("social:chat-active-conversation", { detail: "" }));
    };
  }, [open, selectedId]);

  const openConversation = (conversationId: string) => {
    setSelectedId(conversationId);
    setMessages([]);
    setDraft("");
    setIsLoadingThread(true);
    void chatService.getMessages(conversationId)
      .then((result) => setMessages(result.messages))
      .catch((error: unknown) => notifyError(error, "This conversation couldn't be loaded."))
      .finally(() => setIsLoadingThread(false));
    void chatService.markRead(conversationId).then(() => {
      setConversations((current) => current.map((conversation) => conversation._id === conversationId
        ? { ...conversation, unreadCount: 0 }
        : conversation));
      window.dispatchEvent(new Event("social:chat-inbox-updated"));
    }).catch(() => undefined);
  };

  const sendMiniMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!selectedId || !text || isSending) return;
    setIsSending(true);
    try {
      const message = await chatService.sendMessage(selectedId, text);
      setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
      setDraft("");
      window.dispatchEvent(new Event("social:chat-inbox-updated"));
    } catch (error: unknown) {
      notifyError(error, "Your message couldn't be sent.");
    } finally {
      setIsSending(false);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const enableDesktopNotifications = async () => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (!user) return null;

  return (
    <div className="chat-mini-menu">
      <button
        type="button"
        className={`chat-mini-trigger${open ? " active" : ""}`}
        aria-label={unreadCount ? `Messages, ${unreadCount} unread` : "Messages"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="chat" />
        {unreadCount > 0 && <span className="chat-mini-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>
      {open && (
        <>
          <button className="chat-mini-dismiss" aria-label="Close messages menu" onClick={() => setOpen(false)} />
          <section className="chat-mini-popover" aria-label="Recent messages">
            <header className="chat-mini-heading">
              {selectedPerson ? (
                <>
                  <button type="button" className="chat-mini-back" onClick={() => setSelectedId("")} aria-label="Back to conversations"><Icon name="back" /></button>
                  <Avatar user={selectedPerson} size="small" />
                  <div className="chat-mini-selected-person"><h2>{getUserName(selectedPerson)}</h2><UserStatus status={selectedPerson.status} /></div>
                </>
              ) : <div><h2>Messages</h2><span>{unreadCount ? `${unreadCount} unread` : "Your recent conversations"}</span></div>}
              <button type="button" className="chat-mini-close" aria-label="Close" onClick={() => setOpen(false)}><Icon name="close" /></button>
            </header>
            {selectedPerson ? (
              <>
                <div className="chat-mini-thread" aria-label={`Conversation with ${getUserName(selectedPerson)}`}>
                  {isLoadingThread ? <p className="chat-mini-empty">Loading messages…</p> : messages.length === 0 ? (
                    <p className="chat-mini-empty">Say hello to {selectedPerson.firstName} to start chatting.</p>
                  ) : messages.slice(-30).map((message) => {
                    const own = getUserId(message.senderId) === user?._id;
                    return <div key={message._id} className={`chat-mini-message${own ? " own" : ""}`}>
                      <span>{message.text || message.attachments?.[0]?.name || "Attachment"}</span>
                    </div>;
                  })}
                </div>
                <form className="chat-mini-composer" onSubmit={(event) => void sendMiniMessage(event)}>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value.slice(0, 2000))}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={`Message ${selectedPerson.firstName}…`}
                    aria-label="Reply to conversation"
                    rows={1}
                  />
                  <button type="submit" disabled={!draft.trim() || isSending} aria-label="Send reply"><Icon name="send" /></button>
                </form>
              </>
            ) : <div className="chat-mini-list">
              {conversations.length === 0 ? (
                <p className="chat-mini-empty">No conversations yet. Search for someone to say hello.</p>
              ) : conversations.slice(0, 6).map((conversation) => {
                const person = otherUser(conversation, user._id);
                const message = lastMessage(conversation);
                const own = Boolean(message && getUserId(message.senderId) === user._id);
                return (
                  <button type="button" className="chat-mini-item" key={conversation._id} onClick={() => openConversation(conversation._id)}>
                    <Avatar user={person} size="medium" />
                    <span className="chat-mini-item-copy">
                      <strong>{getUserName(person)}</strong>
                      <UserStatus status={person?.status} />
                      <small>{own ? "You: " : ""}{message?.text || (message?.attachments?.length ? "Attachment" : "Start a conversation")}</small>
                    </span>
                    {conversation.unreadCount > 0 && <i className="chat-mini-unread-dot" aria-label="Unread" />}
                  </button>
                );
              })}
            </div>}
            <footer className="chat-mini-footer">
              {permission === "default" && <button type="button" onClick={() => void enableDesktopNotifications()}>Enable desktop alerts</button>}
              {permission === "denied" && <span>Desktop alerts are blocked in browser settings.</span>}
              {permission === "unsupported" && <span>In-app alerts are enabled.</span>}
              <button type="button" className="chat-mini-open-all" onClick={() => {
                if (selectedId) window.sessionStorage.setItem("social:open-chat", selectedId);
                setOpen(false);
                router.push("/messages");
              }}>See all messages</button>
            </footer>
          </section>
        </>
      )}
    </div>
  );
}
