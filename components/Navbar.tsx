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
    window.addEventListener("social:session-expired", handleSessionExpired);

    return () => {
      active = false;
      window.removeEventListener("social:session-expired", handleSessionExpired);
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
            <button className="header-link" onClick={() => setRequestOpen(true)}>
              <Icon name="bell" />
              <span>Requests</span>
            </button>
          </nav>

          <div className="header-account">
            <ThemeToggle />
            {user && (
              <Link href="/profile" className="account-link" aria-label="Open your profile">
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

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/feed" aria-label="Home"><Icon name="home" /></Link>
        <Link href="/search" aria-label="Search"><Icon name="search" /></Link>
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
