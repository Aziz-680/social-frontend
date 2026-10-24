import type { User } from "@/lib/types";

type AvatarProps = {
  user?: Partial<User> | null;
  size?: "small" | "medium" | "large";
  className?: string;
};

export default function Avatar({ user, size = "medium", className = "" }: AvatarProps) {
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}` || "S";

  return (
    <span className={`avatar avatar-${size} ${className}`} aria-hidden="true">
      {user?.profilePicture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.profilePicture} alt="" />
      ) : (
        initials.toUpperCase()
      )}
    </span>
  );
}
