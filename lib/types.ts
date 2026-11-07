export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string | null;
  status?: string;
  age?: number;
  phoneNumber?: string;
  gender?: string;
  friends?: Array<string | User>;
  workExperience?: WorkExperience[];
};

export type WorkExperience = {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
};

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export type Reaction = {
  userId: string | User;
  type: ReactionType;
};

export type NotificationItem = {
  _id: string;
  recipientId: string;
  actorId: string | User;
  postId?: string | Pick<Post, "_id" | "content" | "media" | "isRepost" | "originalPostId">;
  conversationId?: string;
  type: "reaction" | "comment" | "share" | "message";
  reactionType?: ReactionType;
  commentPreview?: string;
  messagePreview?: string;
  isRead: boolean;
  createdAt?: string;
};

export type ChatMessage = {
  _id: string;
  conversationId: string;
  senderId: string | User;
  text: string;
  attachments?: ChatAttachment[];
  readAt: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type ChatAttachment = {
  url: string;
  name: string;
  mimeType: string;
  size: number;
};

export type ChatConversation = {
  _id: string;
  participants: Array<string | User>;
  lastMessage?: string | ChatMessage | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  updatedAt?: string;
};

export type Comment = {
  _id: string;
  userId: string | User;
  content: string;
  createdAt?: string;
  reactions?: Reaction[];
};

export type Post = {
  _id: string;
  userId: string | User;
  content: string;
  createdAt: string;
  privacy: "public" | "friends" | "only_me";
  media?: string[];
  reactions?: Reaction[];
  likes?: Array<string | User>;
  comments?: Comment[];
  isRepost?: boolean;
  originalPostId?: string | Post;
};

export type Pagination = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
};

export type PaginatedPosts = {
  posts: Post[];
  pagination: Pagination;
};

export function getUserId(user: string | User | undefined): string {
  return typeof user === "string" ? user : user?._id ?? "";
}

export function getUserName(user: User | undefined): string {
  return user ? `${user.firstName} ${user.lastName}`.trim() : "Unknown member";
}
