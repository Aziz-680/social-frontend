"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import chatService from "@/services/ChatService";
import type { ChatMessage, User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";

export default function ChatNotifications({ user, active }: { user: User | null; active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const activeConversationRef = useRef("");

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const handleActiveConversation = (event: Event) => {
      activeConversationRef.current = (event as CustomEvent<string>).detail ?? "";
    };
    window.addEventListener("social:chat-active-conversation", handleActiveConversation);
    return () => window.removeEventListener("social:chat-active-conversation", handleActiveConversation);
  }, []);

  useEffect(() => {
    const socket = chatService.socket;
    if (!active || !user) {
      socket.disconnect();
      return;
    }

    const handleMessage = (message: ChatMessage) => {
      window.dispatchEvent(new CustomEvent("social:chat-inbox-updated", { detail: message }));
      const senderId = getUserId(message.senderId);
      if (senderId === user._id || activeConversationRef.current === message.conversationId) return;

      const sender = typeof message.senderId === "object" ? getUserName(message.senderId) : "New message";
      const preview = message.text || message.attachments?.[0]?.name || "Sent an attachment";
      const openChat = () => {
        if (pathnameRef.current.startsWith("/messages")) {
          window.dispatchEvent(new CustomEvent("social:open-chat", { detail: message.conversationId }));
        } else {
          window.sessionStorage.setItem("social:open-chat", message.conversationId);
          router.push("/messages");
        }
      };

      if (document.visibilityState === "hidden" && "Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(sender, { body: preview, tag: `chat-${message.conversationId}` });
        notification.onclick = () => {
          window.focus();
          openChat();
          notification.close();
        };
      } else {
        toast(sender, {
          description: preview,
          duration: 6000,
          action: { label: "Open", onClick: openChat },
        });
      }
    };

    socket.on("chat:inbox:new-message", handleMessage);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("chat:inbox:new-message", handleMessage);
      socket.disconnect();
    };
  }, [active, router, user]);

  return null;
}
