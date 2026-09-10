"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = "https://rugs-backend.heyprachar.com/api";
const TOKEN_KEY = "rdiCollectionToken";
const USER_KEY = "rdiCollectionUser";

function getStoredSession() {
  if (typeof window === "undefined") return { token: "", user: null };

  let user = null;
  try {
    user = JSON.parse(window.localStorage.getItem(USER_KEY) || "null");
  } catch {
    user = null;
  }

  return {
    token: window.localStorage.getItem(TOKEN_KEY) || "",
    user
  };
}

function collectionUrl(slug) {
  return `/collections/portal/${encodeURIComponent(slug)}`;
}

export default function CollectionPortal({ detailSlug = "" }) {
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [user, setUser] = useState(null);
  const [payload, setPayload] = useState(null);
  const [detail, setDetail] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPortal() {
      const session = getStoredSession();
      setUser(session.user);

      if (!session.token) {
        setStatus("locked");
        return;
      }

      const path = detailSlug ? `/collections/${encodeURIComponent(detailSlug)}` : "/collections";

      setStatus("loading");
      setMessage("");

      try {
        const response = await fetch(`${API_BASE}${path}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${session.token}`
          },
          signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401) {
          window.localStorage.removeItem(TOKEN_KEY);
          window.localStorage.removeItem(USER_KEY);
          setStatus("locked");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load collection portal.");
        }

        if (detailSlug) {
          setDetail(data.collection);
        } else {
          setPayload(data);
        }
        setStatus("ready");
      } catch (error) {
        if (error.name === "AbortError") return;
        setMessage(error.message || "Unable to load collection portal.");
        setStatus("error");
      }
    }

    loadPortal();

    return () => controller.abort();
  }, [detailSlug]);

  const filteredCollections = useMemo(() => {
    const collections = payload?.collections || [];
    const needle = query.trim().toLowerCase();
    if (!needle) return collections;

    return collections.filter((item) => {
      return [item.title, item.summary, item.palette, item.origin, item.availability]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [payload, query]);

  const signOut = () => {
    const token = getStoredSession().token;
    if (token) {
      fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      }).catch(() => {});
    }

    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    router.push("/collections");
  };

  if (status === "locked") {
    return (
      <main className="portal-lock">
        <section className="portal-lock__panel">
          <p className="portal-eyebrow">Private Portal</p>
          <h1>Collection Access Required</h1>
          <p>
            Login or create access from the collections page to view the protected collection portal.
          </p>
          <Link className="portal-btn" href="/collections">Go to Collection Login</Link>
        </section>
      </main>
    );
  }

  if (status === "loading") {
    return (
      <main className="portal-shell">
        <section className="portal-loading">
          <p className="portal-eyebrow">Private Portal</p>
          <h1>Loading collection access</h1>
        </section>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="portal-lock">
        <section className="portal-lock__panel">
          <p className="portal-eyebrow">Private Portal</p>
          <h1>Portal Unavailable</h1>
          <p>{message}</p>
          <Link className="portal-btn" href="/collections">Back to Collections</Link>
        </section>
      </main>
    );
  }

  if (detailSlug) {
    return (
      <main className="portal-shell">
        <PortalHeader user={user} onSignOut={signOut} eyebrow="Collection Detail" title={detail?.title || "Collection Detail"} />

        <section className="portal-detail">
          <div className="portal-detail__media">
            <Image
              src={detail?.hero || detail?.image || "/images/heritage.webp"}
              alt={`${detail?.title || "Collection"} detail preview`}
              fill
              sizes="(max-width: 1040px) 100vw, 48vw"
            />
          </div>
          <div className="portal-detail__body">
            <Link className="portal-back" href="/collections/portal">Back to portal</Link>
            <p className="portal-eyebrow">{detail?.availability || "Private preview"}</p>
            <h2>{detail?.title}</h2>
            <p className="portal-detail__copy">{detail?.details}</p>

            <dl className="portal-specs">
              <div><dt>Palette</dt><dd>{detail?.palette}</dd></div>
              <div><dt>Size</dt><dd>{detail?.size}</dd></div>
              <div><dt>Origin</dt><dd>{detail?.origin}</dd></div>
              <div><dt>Technique</dt><dd>{detail?.technique}</dd></div>
              <div><dt>Materials</dt><dd>{detail?.materials}</dd></div>
              <div><dt>Lead time</dt><dd>{detail?.lead_time}</dd></div>
            </dl>

            <div className="portal-actions">
              <Link className="portal-btn" href="/contact#inquiry">Request Swatches</Link>
              <Link className="portal-btn portal-btn--outline" href="/commission">Start Bespoke Brief</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="portal-shell">
      <PortalHeader user={user} onSignOut={signOut} eyebrow="Private Portal" title={payload?.heading || "Collection Portal"} />

      <section className="portal-hero">
        <div>
          <p className="portal-eyebrow">Collection Management</p>
          <h2>Private previews for selected rugs.</h2>
          <p>{payload?.intro}</p>
        </div>
        <div className="portal-search">
          <label htmlFor="portalSearch">Search Collection</label>
          <input
            id="portalSearch"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, palette, origin"
          />
        </div>
      </section>

      <section className="portal-stats" aria-label="Collection summary">
        {(payload?.stats || []).map((stat) => (
          <article key={stat.label}>
            <span>{stat.value}</span>
            <p>{stat.label}</p>
          </article>
        ))}
      </section>

      <section className="portal-grid" aria-label="Collection list">
        {filteredCollections.map((item) => (
          <article className="portal-card" key={item.slug}>
            <Link href={collectionUrl(item.slug)} className="portal-card__media">
              <Image
                src={item.image}
                alt={`${item.title} collection preview`}
                fill
                sizes="(max-width: 1040px) 100vw, 34vw"
              />
            </Link>
            <div className="portal-card__body">
              <p className="portal-card__meta">{item.palette}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="portal-card__footer">
                <span>{item.availability}</span>
                <Link href={collectionUrl(item.slug)}>View Detail</Link>
              </div>
            </div>
          </article>
        ))}
        {!filteredCollections.length && (
          <div className="portal-empty">No collection previews match this search.</div>
        )}
      </section>
    </main>
  );
}

function PortalHeader({ user, onSignOut, eyebrow, title }) {
  return (
    <header className="portal-header">
      <Link className="portal-brand" href="/">Rugs De Indiska</Link>
      <div>
        <p className="portal-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="portal-session">
        <span>{user?.name ? `Signed in as ${user.name}` : "Signed in"}</span>
        <button type="button" onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}
