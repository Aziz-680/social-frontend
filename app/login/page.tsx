"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import authService from "@/services/AuthService";
import { getErrorMessage } from "@/lib/errors";
import Icon from "@/components/Icon";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authService.login(email, password);
      router.replace("/feed");
      router.refresh();
    } catch (loginError) {
      setError(getErrorMessage(loginError, "We couldn't sign you in. Check your details and try again."));
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link href="/" className="app-brand auth-brand"><span className="brand-mark">s</span><span>social</span></Link>
      <section className="auth-card">
        <div className="auth-heading">
          <span className="auth-symbol"><Icon name="users" /></span>
          <h1>Good to see you</h1>
          <p>Sign in and pick up where your network left off.</p>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={handleLogin}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
          </label>
          <button className="button button-primary button-large auth-submit" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign in"} <Icon name="arrow" />
          </button>
        </form>
        <p className="auth-switch">New here? <Link href="/register">Create an account</Link></p>
      </section>
      <p className="auth-footer">One network, many sides of life.</p>
    </div>
  );
}
