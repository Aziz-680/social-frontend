"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import chatService from "@/services/ChatService";
import authService from "@/services/AuthService";
import userService from "@/services/UserService";
import type { ChatConversation, ChatMessage, User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";
import { notifyError } from "@/lib/notifications";
import Avatar from "./Avatar";
import Icon from "./Icon";
import UserStatus from "./UserStatus";

type ConnectionState = "connecting" | "connected" | "disconnected";

function getOtherParticipant(conversation: ChatConversation, userId: string) {
  const other = conversation.participants.find((participant) => getUserId(participant) !== userId);
  return typeof other === "object" ? other : undefined;
}

function getLastMessage(conversation: ChatConversation) {
  return conversation.lastMessage && typeof conversation.lastMessage === "object"
    ? conversation.lastMessage
    : undefined;
}

function formatTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

function addMessage(messages: ChatMessage[], incoming: ChatMessage) {
  if (messages.some((message) => message._id === incoming._id)) return messages;
  return [...messages, incoming].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

function markConversationRead(conversationId: string) {
  const notifyInbox = () => window.dispatchEvent(new Event("social:chat-inbox-updated"));
  const socket = chatService.socket;
  if (socket.connected) {
    socket.emit("chat:read", { conversationId }, (result: { success: boolean }) => {
      if (result.success) notifyInbox();
    });
    return;
  }
  void chatService.markRead(conversationId).then(notifyInbox).catch(() => undefined);
}

export default function Messenger() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inboxSearch, setInboxSearch] = useState("");
  const [searchPeople, setSearchPeople] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [typingUserId, setTypingUserId] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [pageError, setPageError] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const isNearBottomRef = useRef(true);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedId),
    [conversations, selectedId],
  );
  const selectedPerson = selectedConversation && currentUser
    ? getOtherParticipant(selectedConversation, currentUser._id)
    : undefined;
  const filteredConversations = useMemo(() => {
    const query = inboxSearch.trim().toLocaleLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) => {
      const person = currentUser ? getOtherParticipant(conversation, currentUser._id) : undefined;
      return person && getUserName(person).toLocaleLowerCase().includes(query);
    });
  }, [conversations, currentUser, inboxSearch]);

  const refreshConversations = useCallback(async () => {
    const result = await chatService.listConversations();
    setConversations(result);
    return result;
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([authService.checkSession(), chatService.listConversations()])
      .then(([session, list]) => {
        if (!active) return;
        setCurrentUser(session.user);
        setConversations(list);
        const requestedConversation = window.sessionStorage.getItem("social:open-chat");
        window.sessionStorage.removeItem("social:open-chat");
        if (requestedConversation && list.some((item) => item._id === requestedConversation)) {
          setIsLoadingMessages(true);
          setSelectedId(requestedConversation);
        } else if (list.length) {
          setIsLoadingMessages(true);
          setSelectedId(list[0]._id);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setPageError("We couldn't load your messages.");
        notifyError(error, "We couldn't load your messages.");
      })
      .finally(() => {
        if (active) setIsLoadingInbox(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const socket = chatService.socket;
    const handleConnect = () => {
      setConnectionState("connected");
      if (selectedId) socket.emit("chat:join", { conversationId: selectedId });
    };
    const handleDisconnect = () => setConnectionState("disconnected");
    const handleConnectError = () => setConnectionState("disconnected");
    const handleMessage = (message: ChatMessage) => {
      setConversations((current) => current.map((conversation) => conversation._id === message.conversationId
        ? { ...conversation, lastMessage: message, lastMessageAt: message.createdAt }
        : conversation).sort((a, b) => Date.parse(b.lastMessageAt ?? "") - Date.parse(a.lastMessageAt ?? "")));
      if (message.conversationId === selectedId) {
        setMessages((current) => addMessage(current, message));
        if (getUserId(message.senderId) !== currentUser._id) {
          markConversationRead(message.conversationId);
          setConversations((current) => current.map((conversation) => conversation._id === message.conversationId
            ? { ...conversation, unreadCount: 0 }
            : conversation));
        }
      } else if (getUserId(message.senderId) !== currentUser._id) {
        setConversations((current) => current.map((conversation) => conversation._id === message.conversationId
          ? { ...conversation, unreadCount: (conversation.unreadCount ?? 0) + 1 }
          : conversation));
      }
      void refreshConversations();
    };
    const handleTyping = (payload: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (payload.conversationId !== selectedId || payload.userId === currentUser._id) return;
      setTypingUserId(payload.isTyping ? payload.userId : "");
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
      if (payload.isTyping) {
        typingTimeoutRef.current = window.setTimeout(() => setTypingUserId(""), 2500);
      }
    };
    const handleRead = (receipt: { conversationId: string; userId: string; readAt: string }) => {
      if (receipt.conversationId !== selectedId || receipt.userId === currentUser._id) return;
      setMessages((current) => current.map((message) => getUserId(message.senderId) === currentUser._id
        ? { ...message, readAt: receipt.readAt }
        : message));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("chat:message", handleMessage);
    socket.on("chat:inbox:new-message", handleMessage);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:read", handleRead);
    if (socket.connected) handleConnect();
    else socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("chat:message", handleMessage);
      socket.off("chat:inbox:new-message", handleMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:read", handleRead);
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    };
  }, [currentUser, refreshConversations, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    const socket = chatService.socket;
    socket.emit("chat:join", { conversationId: selectedId });
    chatService.getMessages(selectedId)
      .then((result) => {
        if (!active) return;
        setMessages(result.messages);
        setHasMore(result.hasMore);
        isNearBottomRef.current = true;
        void bottomRef.current?.scrollIntoView({ behavior: "instant" });
        setConversations((current) => current.map((conversation) => conversation._id === selectedId
          ? { ...conversation, unreadCount: 0 }
          : conversation));
        markConversationRead(selectedId);
      })
      .catch((error: unknown) => {
        if (active) notifyError(error, "This conversation couldn't be loaded.");
      })
      .finally(() => { if (active) setIsLoadingMessages(false); });
    return () => { active = false; };
  }, [selectedId]);

  useEffect(() => {
    const query = inboxSearch.trim();
    if (query.length < 2) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      setIsSearching(true);
      userService.search(query)
        .then((people) => {
          if (active) setSearchPeople(people.filter((person) => person._id !== currentUser?._id));
        })
        .catch((error: unknown) => {
          if (active) notifyError(error, "People couldn't be searched right now.");
        })
        .finally(() => { if (active) setIsSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [inboxSearch, currentUser]);

  useEffect(() => {
    if (isNearBottomRef.current) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const selectConversation = (conversationId: string) => {
    setIsLoadingMessages(true);
    setHasMore(false);
    setMessages([]);
    setSelectedId(conversationId);
    setMobileShowChat(true);
    setTypingUserId("");
  };

  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const conversationId = (event as CustomEvent<string>).detail;
      if (!conversationId) return;
      setIsLoadingMessages(true);
      setHasMore(false);
      setMessages([]);
      setSelectedId(conversationId);
      setMobileShowChat(true);
      setTypingUserId("");
    };
    window.addEventListener("social:open-chat", handleOpenChat);
    return () => {
      window.removeEventListener("social:open-chat", handleOpenChat);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("social:chat-active-conversation", { detail: selectedId }));
    return () => {
      window.dispatchEvent(new CustomEvent("social:chat-active-conversation", { detail: "" }));
    };
  }, [selectedId]);

  const startConversation = async (person: User) => {
    setIsStartingConversation(true);
    try {
      const conversation = await chatService.createConversation(person._id);
      const list = await refreshConversations();
      if (!list.some((item) => item._id === conversation._id)) {
        setConversations((current) => [conversation, ...current]);
      }
      selectConversation(conversation._id);
      setInboxSearch("");
      setSearchPeople([]);
    } catch (error: unknown) {
      notifyError(error, "We couldn't start a conversation.");
    } finally {
      setIsStartingConversation(false);
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedId || !messages.length || isLoadingOlder) return;
    const container = messagesRef.current;
    const oldHeight = container?.scrollHeight ?? 0;
    const oldTop = container?.scrollTop ?? 0;
    setIsLoadingOlder(true);
    try {
      const page = await chatService.getMessages(selectedId, messages[0].createdAt);
      setMessages((current) => [...page.messages, ...current]);
      setHasMore(page.hasMore);
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - oldHeight + oldTop;
      });
    } catch (error: unknown) {
      notifyError(error, "Older messages couldn't be loaded.");
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const emitTyping = (isTyping: boolean) => {
    if (!selectedId || !chatService.socket.connected) return;
    chatService.socket.emit("chat:typing", { conversationId: selectedId, isTyping });
  };

  const handleDraftChange = (value: string) => {
    setDraft(value.slice(0, 2000));
    emitTyping(Boolean(value.trim()));
  };

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!selectedId || (!text && !attachment) || isSending) return;
    setIsSending(true);
    emitTyping(false);
    try {
      const message = await chatService.sendMessage(selectedId, text, attachment ?? undefined);
      setMessages((current) => addMessage(current, message));
      setDraft("");
      setAttachment(null);
      if (attachmentInputRef.current) attachmentInputRef.current.value = "";
      isNearBottomRef.current = true;
      void refreshConversations();
    } catch (error: unknown) {
      notifyError(error, "Your message couldn't be sent.");
    } finally {
      setIsSending(false);
    }
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const chooseAttachment = (file?: File) => {
    if (!file) return;
    const allowedTypes = new Set([
      "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "text/plain", "text/csv",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]);
    if (!allowedTypes.has(file.type)) {
      notifyError(new Error("Choose an image, PDF, text, CSV, Word, or Excel file."), "This file type isn't supported.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      notifyError(new Error("Attachments must be 10 MB or smaller."), "This file is too large.");
      return;
    }
    setAttachment(file);
  };

  const insertEmoji = (emoji: string) => {
    setDraft((current) => `${current}${emoji}`);
    setIsEmojiPickerOpen(false);
  };

  return (
    <section className={`messenger-shell${mobileShowChat ? " messenger-chat-open" : ""}`} aria-label="Messages">
      <aside className="messenger-inbox">
        <div className="messenger-inbox-heading">
          <div>
            <h1>Messages</h1>
            <span className={`chat-connection-state ${connectionState}`}>
              <i />{connectionState === "connected" ? "Connected" : connectionState === "connecting" ? "Connecting…" : "Reconnecting…"}
            </span>
          </div>
          <button className="messenger-icon-button" type="button" aria-label="Start a message" onClick={() => document.getElementById("messenger-search")?.focus()}>
            <Icon name="chat" />
          </button>
        </div>
        <label className="messenger-search">
          <Icon name="search" />
          <input
            id="messenger-search"
            value={inboxSearch}
            onChange={(event) => setInboxSearch(event.target.value)}
            placeholder="Search people or chats"
            aria-label="Search people or conversations"
          />
          {inboxSearch && <button type="button" onClick={() => setInboxSearch("")} aria-label="Clear search"><Icon name="close" /></button>}
        </label>
        {pageError && <p className="messenger-inline-error" role="alert">{pageError}</p>}
        <div className="messenger-inbox-list">
          {inboxSearch.trim().length >= 2 && (
            <section className="messenger-search-results">
              <h2>Start a conversation</h2>
              {isSearching ? <p className="messenger-list-note">Searching…</p> : searchPeople.length === 0 ? <p className="messenger-list-note">No people found.</p> : searchPeople.map((person) => (
                <button className="messenger-person-result" key={person._id} onClick={() => void startConversation(person)} disabled={isStartingConversation}>
                  <Avatar user={person} size="medium" />
                  <span><strong>{getUserName(person)}</strong><small>Start a new chat</small></span>
                  <Icon name="arrow" />
                </button>
              ))}
            </section>
          )}
          {isLoadingInbox ? <div className="messenger-list-note">Loading conversations…</div> : filteredConversations.length === 0 ? (
            <div className="messenger-empty-inbox">
              <span><Icon name="chat" /></span>
              <strong>{inboxSearch ? "No matching chats" : "No conversations yet"}</strong>
              <p>Search for someone above to say hello.</p>
            </div>
          ) : filteredConversations.map((conversation) => {
            const person = currentUser ? getOtherParticipant(conversation, currentUser._id) : undefined;
            const lastMessage = getLastMessage(conversation);
            const isOwnLastMessage = Boolean(lastMessage && currentUser && getUserId(lastMessage.senderId) === currentUser._id);
            return (
              <button
                className={`messenger-conversation${selectedId === conversation._id ? " selected" : ""}`}
                key={conversation._id}
                onClick={() => selectConversation(conversation._id)}
              >
                <span className="messenger-avatar-wrap"><Avatar user={person} size="large" /></span>
                <span className="messenger-conversation-copy">
                  <span className="messenger-conversation-title"><strong>{getUserName(person)}</strong><time>{formatTime(conversation.lastMessageAt)}</time></span>
                  <UserStatus status={person?.status} />
                  <span className="messenger-conversation-preview">
                    {isOwnLastMessage ? "You: " : ""}{lastMessage?.text || (lastMessage?.attachments?.length ? "Attachment" : "Start a conversation")}
                  </span>
                </span>
                {conversation.unreadCount > 0 && <span className="messenger-unread-badge">{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}</span>}
              </button>
            );
          })}
        </div>
        <div className="messenger-inbox-footer"><Avatar user={currentUser} size="small" /><span>Signed in as <strong>{currentUser?.firstName ?? "you"}</strong></span></div>
      </aside>

      <section className="messenger-thread" aria-label={selectedPerson ? `Chat with ${getUserName(selectedPerson)}` : "Conversation"}>
        {selectedConversation && selectedPerson ? (
          <>
            <header className="messenger-thread-header">
              <button type="button" className="messenger-back-button" onClick={() => setMobileShowChat(false)} aria-label="Back to conversations"><Icon name="back" /></button>
              <Avatar user={selectedPerson} size="medium" />
              <div className="messenger-thread-person">
                <strong>{getUserName(selectedPerson)}</strong>
                {typingUserId ? <span>Typing…</span> : <UserStatus status={selectedPerson.status} />}
              </div>
              <button type="button" className="messenger-icon-button" aria-label="Open profile" onClick={() => router.push(`/profile/${selectedPerson._id}`)}><Icon name="user" /></button>
            </header>
            <div className="messenger-messages" ref={messagesRef} onScroll={(event) => {
              const element = event.currentTarget;
              isNearBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
            }}>
              {hasMore && <button className="messenger-load-older" onClick={() => void loadOlderMessages()} disabled={isLoadingOlder}>{isLoadingOlder ? "Loading…" : "Load earlier messages"}</button>}
              {isLoadingMessages ? <div className="messenger-thread-note">Loading messages…</div> : messages.length === 0 ? (
                <div className="messenger-first-message"><Avatar user={selectedPerson} size="large" /><h2>Say hello to {selectedPerson.firstName}</h2><p>This is the beginning of your conversation.</p></div>
              ) : messages.map((message, index) => {
                const own = getUserId(message.senderId) === currentUser?._id;
                const previous = messages[index - 1];
                const showAvatar = !own && (!previous || getUserId(previous.senderId) !== getUserId(message.senderId));
                return (
                  <div className={`messenger-message-row${own ? " own" : ""}`} key={message._id}>
                    {!own && <span className="messenger-message-avatar">{showAvatar ? <Avatar user={selectedPerson} size="small" /> : null}</span>}
                    <div className="messenger-message-content">
                      {(message.text || message.attachments?.length) && <div className="messenger-bubble">
                        {message.text && <span>{message.text}</span>}
                        {message.attachments?.map((item) => (
                          <a className="messenger-attachment" href={item.url} key={item.url} target="_blank" rel="noreferrer" download={item.name}>
                            {item.mimeType.startsWith("image/") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.url} alt={item.name} />
                            ) : <Icon name="file" />}
                            <span><strong>{item.name}</strong><small>{(item.size / (1024 * 1024)).toFixed(2)} MB · Open file</small></span>
                          </a>
                        ))}
                      </div>}
                      {own && index === messages.length - 1 && <span className="messenger-message-status">{message.readAt ? "Seen" : "Sent"}</span>}
                    </div>
                    <time className="messenger-message-time" title={new Date(message.createdAt).toLocaleString()}>{formatTime(message.createdAt)}</time>
                  </div>
                );
              })}
              {typingUserId && <div className="messenger-typing-indicator"><span /><span /><span /></div>}
              <div ref={bottomRef} />
            </div>
            <form className="messenger-composer" onSubmit={(event) => void sendMessage(event)}>
              <input
                ref={attachmentInputRef}
                className="visually-hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,text/csv,.doc,.docx,.xls,.xlsx"
                onChange={(event) => chooseAttachment(event.target.files?.[0])}
                aria-label="Attach a file"
              />
              <div className="messenger-composer-tools">
                <button type="button" className="messenger-tool-button" aria-label="Attach a file" title="Attach a file" onClick={() => attachmentInputRef.current?.click()}>
                  <Icon name="paperclip" />
                </button>
                <div className="messenger-emoji-wrap">
                  <button type="button" className="messenger-tool-button" aria-label="Choose an emoji" aria-expanded={isEmojiPickerOpen} onClick={() => setIsEmojiPickerOpen((value) => !value)}>
                    <Icon name="smile" />
                  </button>
                  {isEmojiPickerOpen && <div className="messenger-emoji-picker" role="group" aria-label="Choose an emoji">
                    {["😀", "😂", "🥰", "😍", "😊", "😉", "😎", "😭", "😮", "😢", "😡", "👍", "👎", "👏", "🙌", "🙏", "❤️", "💙", "🔥", "🎉", "✨", "💯", "🤝", "☕"].map((emoji) => (
                      <button key={emoji} type="button" onClick={() => insertEmoji(emoji)} aria-label={`Insert ${emoji}`}>{emoji}</button>
                    ))}
                  </div>}
                </div>
              </div>
              {attachment && <div className="messenger-attachment-preview"><Icon name={attachment.type.startsWith("image/") ? "image" : "file"} /><span>{attachment.name}</span><button type="button" onClick={() => { setAttachment(null); if (attachmentInputRef.current) attachmentInputRef.current.value = ""; }} aria-label="Remove attachment"><Icon name="close" /></button></div>}
              <textarea
                value={draft}
                onChange={(event) => handleDraftChange(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder={`Message ${selectedPerson.firstName}…`}
                aria-label="Write a message"
                rows={1}
                maxLength={2000}
              />
              <span className="messenger-composer-hint">Enter to send · Shift + Enter for a new line</span>
              <button type="submit" className="messenger-send-button" disabled={(!draft.trim() && !attachment) || isSending} aria-label="Send message">
                <Icon name="send" />
              </button>
            </form>
          </>
        ) : (
          <div className="messenger-welcome">
            <span className="messenger-welcome-icon"><Icon name="chat" /></span>
            <h2>Your conversations</h2>
            <p>Choose a chat or search for someone to start a new conversation.</p>
          </div>
        )}
      </section>
    </section>
  );
}
