"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import userService from "@/services/UserService";
import type { User } from "@/lib/types";
import { getUserId, getUserName } from "@/lib/types";
import { getErrorMessage } from "@/lib/errors";
import Avatar from "@/components/Avatar";
import ConnectionAction from "@/components/ConnectionAction";
import Icon from "@/components/Icon";

export default function SearchInterface({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(initialQuery));
  const [error, setError] = useState("");
  const hasSearched = Boolean(initialQuery);

  useEffect(() => {
    if (!initialQuery.trim()) return;
    let active = true;
    userService.search(initialQuery)
      .then((people) => {
        if (active) setResults(people);
      })
      .catch((searchError) => {
        if (!active) return;
        setError(getErrorMessage(searchError, "People couldn't be found right now."));
        setResults([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialQuery]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="network-column">
      <div className="page-heading">
        <div>
          <h1>Find your people</h1>
          <p>Search for people and grow your network.</p>
        </div>
        <span className="page-heading-icon"><Icon name="users" /></span>
      </div>

      <form className="people-search" role="search" onSubmit={handleSearch}>
        <Icon name="search" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name"
          aria-label="Search by name"
          required
        />
        <button className="button button-primary" disabled={isLoading}>
          {isLoading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="form-error" role="alert">{error}</p>}
      {isLoading ? (
        <div className="loading-card">Looking for people…</div>
      ) : hasSearched && results.length === 0 && !error ? (
        <div className="empty-feed">
          <span className="empty-feed-icon"><Icon name="search" /></span>
          <h2>No people found</h2>
          <p>Try a different name or check the spelling.</p>
        </div>
      ) : results.length > 0 ? (
        <section className="search-results" aria-label="Search results">
          <h2>{results.length} {results.length === 1 ? "person" : "people"} found</h2>
          {results.map((person) => (
            <article className="search-person" key={getUserId(person)}>
              <Link href={`/profile/${getUserId(person)}`} className="search-person-main">
                <Avatar user={person} size="large" />
                <span><strong>{getUserName(person)}</strong><small>Member of your wider network</small></span>
              </Link>
              <ConnectionAction userId={getUserId(person)} />
            </article>
          ))}
        </section>
      ) : !hasSearched ? (
        <div className="search-invitation">
          <span><Icon name="search" /></span>
          <h2>Who’s on your mind?</h2>
          <p>Search by name to find people you know.</p>
        </div>
      ) : null}
    </div>
  );
}
