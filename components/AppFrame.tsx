"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import userService from "@/services/UserService";
import type { User } from "@/lib/types";
import Avatar from "./Avatar";
import Icon from "./Icon";
import Navbar from "./Navbar";
import RightSidebar from "./RightSidebar";

const publicRoutes = ["/", "/login", "/register"];

export default function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = publicRoutes.includes(pathname);
  const [user, setUser] = useState<User | null>(null);
  const [profileUnavailable, setProfileUnavailable] = useState(false);

  useEffect(() => {
    if (isPublic) return;
    let active = true;
    userService.getProfile().then((profile) => {
      if (active) {
        setUser(profile);
        setProfileUnavailable(false);
      }
    }).catch(() => {
      if (active) {
        setUser(null);
        setProfileUnavailable(true);
      }
    });
    return () => {
      active = false;
    };
  }, [isPublic]);

  return (
    <>
      <Navbar />
      <div className={isPublic ? "public-layout" : "app-workspace"}>
        {!isPublic && (
          <aside className="left-rail">
            <section className="rail-profile">
              <div className="rail-profile-cover" />
              <Link href="/profile" className="rail-profile-person">
                <Avatar user={user} size="medium" />
                <strong>{user ? `${user.firstName} ${user.lastName}` : "Your profile"}</strong>
                <span>{profileUnavailable ? "Profile details unavailable" : "View your profile"}</span>
              </Link>
            </section>
            <nav className="side-nav" aria-label="Your space">
              <Link className={pathname === "/feed" ? "side-nav-link active" : "side-nav-link"} href="/feed">
                <Icon name="home" /><span>Feed</span>
              </Link>
              <Link className={pathname === "/friends" ? "side-nav-link active" : "side-nav-link"} href="/friends">
                <Icon name="users" /><span>Connections</span>
              </Link>
              <Link className={pathname.startsWith("/search") ? "side-nav-link active" : "side-nav-link"} href="/search">
                <Icon name="search" /><span>Discover people</span>
              </Link>
            </nav>
            <div className="sidebar-footer">
              <span>Personal and professional, together.</span>
            </div>
          </aside>
        )}
        <main className={isPublic ? "public-main" : "app-main"}>{children}</main>
        {!isPublic && <RightSidebar />}
      </div>
    </>
  );
}
