"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import authService from "@/services/AuthService";
import type { User } from "@/lib/types";
import Avatar from "./Avatar";
import FriendRequestsModal from "./FriendRequestsModal";
import Icon from "./Icon";
import NotificationCenter from "./NotificationCenter";
import StatusSelector from "./StatusSelector";
import ThemeToggle from "./ThemeToggle";

const publicRoutes = ["/", "/login", "/register"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!publicRoutes.includes(pathname)) {
      authService
        .checkSession()
        .then((session) => {
          if (active) setUser(session.user);
        })
        .catch(() => {
          if (active) setError("Your session could not be loaded.");
        });
    }

    const handleSessionExpired = () => router.replace("/login");
    const handleStatusUpdated = (event: Event) => {
      const status = (event as CustomEvent<{ status: string }>).detail?.status;
      if (status) setUser((current) => current ? { ...current, status } : current);
    };
    const handleProfileUpdated = (event: Event) => {
      const updatedUser = (event as CustomEvent<User>).detail;
      if (updatedUser) setUser(updatedUser);
    };

    window.addEventListener("social:session-expired", handleSessionExpired);
    window.addEventListener("social:status-updated", handleStatusUpdated);
    window.addEventListener("social:profile-updated", handleProfileUpdated);

    return () => {
      active = false;
      window.removeEventListener("social:session-expired", handleSessionExpired);
      window.removeEventListener("social:status-updated", handleStatusUpdated);
      window.removeEventListener("social:profile-updated", handleProfileUpdated);
    };
  }, [pathname, router]);

  if (publicRoutes.includes(pathname)) return null;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleLogout = async () => {
    setError("");
    setIsLoggingOut(true);
    try {
      await authService.logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("We couldn't sign you out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <Link href="/feed" className="app-brand" aria-label="Social home">
            <span className="brand-mark">s</span>
            <span>social</span>
          </Link>

          <form className="header-search" onSubmit={handleSearch} role="search">
            <Icon name="search" />
            <input
              aria-label="Search people"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people"
            />
          </form>

          <nav className="header-actions" aria-label="Main navigation">
            <Link className={pathname === "/feed" ? "header-link active" : "header-link"} href="/feed">
              <Icon name="home" />
              <span>Home</span>
            </Link>
            <Link className={pathname === "/friends" ? "header-link active" : "header-link"} href="/friends">
              <Icon name="users" />
              <span>Connections</span>
            </Link>
            <NotificationCenter />
            <button className="header-link" onClick={() => setRequestOpen(true)}>
              <Icon name="user" />
              <span>Requests</span>
            </button>
          </nav>

          <div className="header-account">
            {user && (
              <Link
                href="/profile"
                className="account-link"
                aria-label="Open your profile"
              >
                <Avatar user={user} size="small" />
                <span>{user.firstName}</span>
              </Link>
            )}
            <button
              className="logout-button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              aria-label="Sign out"
            >
              <Icon name="logout" />
              <span>{isLoggingOut ? "Signing out" : "Sign out"}</span>
            </button>
          </div>
        </div>
        {error && <p className="header-error" role="status">{error}</p>}
      </header>

      <div className="floating-theme-control">
        <ThemeToggle />
      </div>
      {user && (
        <div className="floating-status-control" aria-label="Your status">
          <span className="floating-status-label">Status</span>
          <StatusSelector
            currentStatus={user.status}
            onStatusChange={(status) => setUser((current) => current ? { ...current, status } : current)}
          />
        </div>
      )}

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/feed" aria-label="Home"><Icon name="home" /></Link>
        <Link href="/search" aria-label="Search"><Icon name="search" /></Link>
        <button
          type="button"
          aria-label="Activity notifications"
          onClick={() => window.dispatchEvent(new Event("social:open-notifications"))}
        >
          <Icon name="bell" />
        </button>
        <Link href="/friends" aria-label="Connections"><Icon name="users" /></Link>
        <Link href="/profile" aria-label="Profile"><Icon name="user" /></Link>
      </nav>

      <FriendRequestsModal
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
      />
    </>
  );
}