"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import authService from "@/services/AuthService";
import { getErrorMessage } from "@/lib/errors";
import Icon from "@/components/Icon";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await authService.register(firstName.trim(), lastName.trim(), email, password);
      setRegistered(true);
    } catch (registerError) {
      setError(getErrorMessage(registerError, "Your account couldn't be created. Please try again."));
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link href="/" className="app-brand auth-brand"><span className="brand-mark">s</span><span>social</span></Link>
      <section className="auth-card">
        <div className="auth-heading">
          <span className="auth-symbol"><Icon name="plus" /></span>
          <h1>Make yourself at home</h1>
          <p>Create an account and bring your network together.</p>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {registered ? (
          <div className="registration-success" role="status">
            <span className="success-mark"><Icon name="check" /></span>
            <h2>Your account is ready</h2>
            <p>Sign in to start connecting with your network.</p>
            <Link href="/login" className="button button-primary button-large">Continue to sign in <Icon name="arrow" /></Link>
          </div>
        ) : <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-name-row">
            <label>
              First name
              <input
                type="text"
                autoComplete="given-name"
                required
                minLength={2}
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder="First name"
              />
            </label>
            <label>
              Last name
              <input
                type="text"
                autoComplete="family-name"
                required
                minLength={2}
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder="Last name"
              />
            </label>
          </div>
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
              autoComplete="new-password"
              required
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Choose a secure password"
            />
            <span className="field-hint">8+ characters with uppercase, lowercase, number, and symbol.</span>
          </label>
          <button className="button button-primary button-large auth-submit" disabled={isLoading}>
            {isLoading ? "Creating account…" : "Create account"} <Icon name="arrow" />
          </button>
        </form>}
        {!registered && <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>}
      </section>
      <p className="auth-footer">A space for every side of your social life.</p>
    </div>
  );
}
