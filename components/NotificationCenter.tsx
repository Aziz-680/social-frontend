"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import notificationService from "@/services/NotificationService";
import type { NotificationItem, ReactionType } from "@/lib/types";
import { getUserName } from "@/lib/types";
import { notifyError } from "@/lib/notifications";
import Avatar from "./Avatar";
import Icon from "./Icon";
import UserStatus from "./UserStatus";

const reactionLabels: Record<ReactionType, string> = {
  like: "liked",
  love: "loved",
  haha: "laughed at",
  wow: "reacted to",
  sad: "felt sad about",
  angry: "reacted to",
};

function getNotificationMessage(notification: NotificationItem) {
  switch (notification.type) {
    case "reaction":
      return `${reactionLabels[notification.reactionType ?? "like"]} your post`;
    case "comment":
      return "commented on your post";
    case "share":
      return "shared your post";
    case "message":
      return "sent you a message";
  }
}

function getPostId(notification: NotificationItem) {
  if (!notification.postId) return "";
  return typeof notification.postId === "string" ? notification.postId : notification.postId._id;
}

function formatNotificationDate(value?: string) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshNotifications = useCallback(async (showError = false) => {
    try {
      const result = await notificationService.getNotifications();
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      if (showError) setError("");
    } catch {
      if (showError) setError("Notifications couldn't be loaded. Please try again.");
    }
  }, []);

  useEffect(() => {
    const initialRefreshId = window.setTimeout(() => void refreshNotifications(), 0);
    const openFromMobileNav = () => {
      setIsLoading(true);
      setError("");
      setIsOpen(true);
    };
    const refreshFromChat = () => void refreshNotifications();
    const intervalId = window.setInterval(() => void refreshNotifications(), 30_000);
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") void refreshNotifications();
    };
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    window.addEventListener("social:open-notifications", openFromMobileNav);
    window.addEventListener("social:chat-inbox-updated", refreshFromChat);
    return () => {
      window.clearTimeout(initialRefreshId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      window.removeEventListener("social:open-notifications", openFromMobileNav);
      window.removeEventListener("social:chat-inbox-updated", refreshFromChat);
    };
  }, [refreshNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    const refreshId = window.setTimeout(() => {
      void refreshNotifications(true).finally(() => setIsLoading(false));
    }, 0);
    return () => window.clearTimeout(refreshId);
  }, [isOpen, refreshNotifications]);

  const markAsRead = async (notification: NotificationItem) => {
    if (notification.isRead) return;
    try {
      await notificationService.markAsRead(notification._id);
      setNotifications((current) => current.map((item) =>
        item._id === notification._id ? { ...item, isRead: true } : item,
      ));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      notifyError(error, "This notification couldn't be marked as read.");
    }
  };

  const markAllAsRead = async () => {
    setError("");
    try {
      await notificationService.markAllAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      notifyError(error, "Notifications couldn't be marked as read.");
    }
  };

  return (
    <>
      <button
        type="button"
        className="header-link notification-trigger"
        aria-label={unreadCount ? `Activity, ${unreadCount} unread notifications` : "Activity notifications"}
        onClick={() => {
          setIsLoading(true);
          setError("");
          setIsOpen(true);
        }}
      >
        <span className="notification-bell-wrap">
          <Icon name="bell" />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}
        </span>
        <span>Activity</span>
      </button>

      {isOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section className="request-modal notification-modal" role="dialog" aria-modal="true" aria-labelledby="activity-title">
            <div className="modal-heading">
              <div>
                <h2 id="activity-title">Notifications</h2>
                <p>Messages, reactions, comments, and shares.</p>
              </div>
              <div className="notification-heading-actions">
                {unreadCount > 0 && (
                  <button type="button" className="notification-mark-all" onClick={() => void markAllAsRead()}>
                    Mark all read
                  </button>
                )}
                <button className="icon-button" onClick={() => setIsOpen(false)} aria-label="Close notifications">
                  <Icon name="close" />
                </button>
              </div>
            </div>

            <div className="notification-list">
              {error && <p className="form-error" role="alert">{error}</p>}
              {isLoading ? (
                <p className="empty-message">Loading notifications…</p>
              ) : notifications.length === 0 ? (
                <p className="empty-message">No new activity. Messages, reactions, comments, and shares will appear here.</p>
              ) : notifications.map((notification) => {
                const actor = typeof notification.actorId === "string" ? undefined : notification.actorId;
                const post = typeof notification.postId === "string" ? undefined : notification.postId;
                const preview = notification.type === "message"
                  ? notification.messagePreview
                  : notification.type === "comment"
                  ? notification.commentPreview
                  : post?.content;
                const postId = getPostId(notification);
                const notificationHref = notification.type === "message" ? "/messages" : `/feed#post-${postId}`;

                return (
                  <Link
                    className={notification.isRead ? "notification-row" : "notification-row unread"}
                    href={notificationHref}
                    key={notification._id}
                    onClick={() => {
                      void markAsRead(notification);
                      if (notification.type === "message" && notification.conversationId) {
                        window.sessionStorage.setItem("social:open-chat", notification.conversationId);
                        window.dispatchEvent(new CustomEvent("social:open-chat", { detail: notification.conversationId }));
                      }
                      setIsOpen(false);
                    }}
                  >
                    <Avatar user={actor} size="small" />
                    <span className="notification-content">
                      <span><strong>{getUserName(actor)}</strong> <UserStatus status={actor?.status} /> {getNotificationMessage(notification)}</span>
                      {preview && <span className="notification-preview">“{preview}”</span>}
                      <time dateTime={notification.createdAt}>{formatNotificationDate(notification.createdAt)}</time>
                    </span>
                    {!notification.isRead && <span className="notification-unread-dot" aria-label="Unread" />}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
