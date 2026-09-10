"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const TOKEN_KEY = "rdiCollectionToken";
const USER_KEY = "rdiCollectionUser";

const ICONS = {
  arrow: "M4 12h15M14 5l7 7-7 7",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z",
  loupe: "M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15ZM16 16l5 5",
  material: "M5 7c4-4 10-4 14 0M5 12c4-4 10-4 14 0M5 17c4-4 10-4 14 0",
  origin: "M12 21s7-5.2 7-12A7 7 0 0 0 5 9c0 6.8 7 12 7 12ZM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  palette: "M12 3a9 9 0 1 0 0 18h1.5a1.8 1.8 0 0 0 .4-3.55 1.65 1.65 0 0 1 .4-3.25H16a5 5 0 0 0 0-10h-4ZM7.5 11.5h.01M9.5 7.5h.01M14 7h.01",
  ruler: "M4 17 17 4l3 3L7 20l-3-3ZM14 7l3 3M11 10l2 2M8 13l3 3",
  spark: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z",
  technique: "M4 8h16M4 16h16M8 4v16M16 4v16",
  time: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2"
};

const STATIC_PORTAL = {
  heading: "Private Collection Portal",
  intro: "A protected preview of selected Rugs De Indiska collections, prepared for private viewing and client presentation.",
  stats: [
    { label: "Curated volumes", value: "4" },
    { label: "Primary materials", value: "Wool / Silk" },
    { label: "Viewing status", value: "Private" }
  ],
  collections: [
    {
      slug: "heritage-revived",
      title: "Heritage Revived",
      image: "/images/heritage.webp",
      hero: "/images/Temple%20Gold%20Collection.webp",
      summary: "Madder reds, Persian geometry, and traditional Senneh knotting for formal rooms.",
      details: "Hand-spun wool, natural madder dye, and a deep border layout inspired by archival Persian patterns.",
      palette: "Madder, walnut, antique ivory",
      size: "8 x 10 ft",
      origin: "Bhadohi, India",
      technique: "Traditional Senneh knotting",
      materials: "Hand-spun wool with silk accents",
      lead_time: "10-12 weeks",
      availability: "Private preview"
    },
    {
      slug: "jaipur",
      title: "Jaipur",
      image: "/images/jaipur.webp",
      hero: "/images/collection_banner.webp",
      summary: "Saffron, ochre, and indigo motifs shaped by royal courtyard architecture.",
      details: "A luminous city palette with high-contrast motifs for hospitality suites and residential salons.",
      palette: "Saffron, ochre, indigo",
      size: "9 x 12 ft",
      origin: "Rajasthan, India",
      technique: "Hand-knotted geometric field",
      materials: "Highland wool and mulberry silk",
      lead_time: "12-14 weeks",
      availability: "Private preview"
    },
    {
      slug: "riverstone",
      title: "Riverstone",
      image: "/images/Riverstone%20Collection.webp",
      hero: "/images/Riverbank%20finishing.webp",
      summary: "Quiet mineral tones and soft geometry for calm, contemporary interiors.",
      details: "Layered stone neutrals with silk highlights and a low-contrast field pattern.",
      palette: "Stone, fog, warm grey",
      size: "Custom sizing",
      origin: "Bhadohi, India",
      technique: "Low-contrast carved pile",
      materials: "Wool ground with silk relief",
      lead_time: "8-10 weeks",
      availability: "Sampling ready"
    },
    {
      slug: "temple-gold",
      title: "Temple Gold",
      image: "/images/Temple%20Gold%20Collection.webp",
      hero: "/images/Macro%20texture%20of%20wool%20and%20silk.webp",
      summary: "Gold-washed accents and ceremonial symmetry for statement spaces.",
      details: "Temple-inspired borders, warm metallic tones, and refined silk sheen for statement rooms.",
      palette: "Temple gold, sand, charcoal",
      size: "10 x 14 ft",
      origin: "Bhadohi, India",
      technique: "Symmetric hand-knotting",
      materials: "Wool, silk, natural dye accents",
      lead_time: "14-16 weeks",
      availability: "Concept preview"
    }
  ]
};

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

function paletteSwatches(palette = "") {
  const colors = {
    madder: "#8b2f26",
    walnut: "#5c4331",
    antique: "#eee3cf",
    saffron: "#c88732",
    ochre: "#b58b49",
    indigo: "#263f67",
    stone: "#8c887f",
    fog: "#d8d5cc",
    grey: "#77736a",
    gold: "#b08d4f",
    sand: "#d6c2a0",
    charcoal: "#2f2d2a"
  };

  return palette
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((label) => {
      const key = Object.keys(colors).find((name) => label.toLowerCase().includes(name));
      return { label, color: colors[key] || "#b08d4f" };
    });
}

function Icon({ name }) {
  return (
    <svg className="portal-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function fallbackText(value, fallback = "Available by private request") {
  return value || fallback;
}

export default function CollectionPortalPro({ detailSlug = "" }) {
  const [status, setStatus] = useState("loading");
  const [payload, setPayload] = useState(null);
  const [detail, setDetail] = useState(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPortal() {
      await Promise.resolve();
      if (controller.signal.aborted) return;

      const session = getStoredSession();

      if (!session.token) {
        setStatus("locked");
        return;
      }

      setStatus("loading");
      setMessage("");

      if (detailSlug) {
        const collection = STATIC_PORTAL.collections.find((item) => item.slug === detailSlug);
        if (!collection) {
          setMessage("This private collection is no longer available.");
          setStatus("error");
          return;
        }

        setDetail(collection);
      } else {
        setPayload(STATIC_PORTAL);
      }

      if (controller.signal.aborted) return;
      setStatus("ready");
    }

    loadPortal().catch((error) => {
      if (error.name !== "AbortError") {
        setMessage(error.message || "Unable to load collection portal.");
        setStatus("error");
      }
    });

    return () => controller.abort();
  }, [detailSlug]);

  const filteredCollections = useMemo(() => {
    const collections = payload?.collections || [];
    const needle = query.trim().toLowerCase();
    if (!needle) return collections;

    return collections.filter((item) => {
      return [item.title, item.summary, item.palette, item.origin, item.availability, item.technique]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [payload, query]);

  if (status === "locked") {
    return <PortalMessage title="Collection Access Required" message="Enter your email, phone number, and access details from the collections page before opening the private catalogue." />;
  }

  if (status === "loading") {
    return <PortalMessage title="Opening Private Catalogue" message="Checking your access before loading the collection." />;
  }

  if (status === "error") {
    return <PortalMessage title="Portal Unavailable" message={message} />;
  }

  if (detailSlug) {
    return <CollectionDetail collection={detail} />;
  }

  return <CollectionDashboard payload={payload} collections={filteredCollections} query={query} onQuery={setQuery} />;
}

function PortalMessage({ title, message }) {
  return (
    <>
      <PortalHeader />
      <main className="portal-lock">
        <section className="portal-lock__panel">
        <div className="portal-lock__copy">
          <span className="portal-mark"><Icon name={title.includes("Access") ? "lock" : "spark"} /></span>
          <p className="portal-eyebrow">Private Portal</p>
          <h1>{title}</h1>
          <p>{message}</p>
          <Link className="portal-btn" href="/collections">
            Go to Login
            <Icon name="arrow" />
          </Link>
        </div>
      </section>
    </main>
    </>
  );
}

function PortalHeader() {
  return (
    <header className="site-header portal-site-header" id="siteHeader">
      <div className="shell header-inner">
        <Link href="/" className="brand">
          <Image src="/images/Rugs%20de%20indiska%20baize%202.svg" alt="" className="brand__mark" width={86} height={61} priority />
        </Link>

        <nav className="nav" id="primaryNav" aria-label="Primary">
          <ul className="nav__list">
            <li><Link href="/collections">Collections</Link></li>
            <li><Link href="/craftsmanship">Craftsmanship</Link></li>
            <li><Link href="/our-world">Our World</Link></li>
            <li><Link href="/journal">Journal</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
          <div className="nav__actions-mobile">
            <Link href="/contact" className="nav__bespoke">Bespoke</Link>
            <Link href="/contact" className="btn btn--outline btn--sm">Enquire</Link>
          </div>
        </nav>

        <div className="header-actions">
          <Link href="/contact" className="nav__bespoke">Bespoke</Link>
          <Link href="/contact" className="btn btn--outline btn--sm">Enquire</Link>
        </div>

        <button className="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="primaryNav" type="button">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}

function CollectionDashboard({ payload, collections, query, onQuery }) {
  return (
    <>
      <PortalHeader />
      <main className="portal-shell portal-page">
        <section className="portal-intro" id="catalogue">
          <div>
            <p className="portal-eyebrow">Private Catalogue</p>
            <h1>{payload?.heading || "Collection Portal"}</h1>
          </div>
          <div className="portal-intro__aside">
            <p>{payload?.intro}</p>
            <div className="portal-search">
              <label htmlFor="portalSearch"><Icon name="loupe" /> Search Catalogue</label>
              <input
                id="portalSearch"
                type="search"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
                placeholder="Name, palette, origin, technique"
              />
            </div>
          </div>
        </section>

      <section className="portal-grid-head portal-catalogue-head">
        <div>
          <p className="portal-eyebrow">Collection Index</p>
          <h2>{collections.length} collection previews</h2>
        </div>
      </section>

      <section className="portal-card-grid" aria-label="Collection list">
        {collections.map((item, index) => (
          <CollectionCard collection={item} index={index} key={item.slug} />
        ))}
        {!collections.length && (
          <div className="portal-empty">No collection previews match this search.</div>
        )}
      </section>
    </main>
    </>
  );
}

function CollectionCard({ collection, index }) {
  return (
    <article className="portal-collection-card">
      <Link href={collectionUrl(collection.slug)} className="portal-collection-card__media">
        <Image src={collection.image} alt={`${collection.title} collection preview`} fill sizes="(max-width: 760px) 100vw, (max-width: 1180px) 50vw, 33vw" />
      </Link>
      <div className="portal-collection-card__body">
        <div className="portal-collection-card__top">
          <p className="portal-card__meta">Volume {String(index + 1).padStart(2, "0")}</p>
          <span>{collection.availability}</span>
        </div>
        <h2>{collection.title}</h2>
        <p>{collection.summary}</p>
        <div className="portal-swatches" aria-label={`${collection.title} palette`}>
          {paletteSwatches(collection.palette).map((swatch) => (
            <span key={swatch.label} style={{ "--swatch": swatch.color }} title={swatch.label} />
          ))}
        </div>
        <dl className="portal-collection-card__specs">
          <div><dt>Palette</dt><dd>{fallbackText(collection.palette, "To be confirmed")}</dd></div>
          <div><dt>Origin</dt><dd>{fallbackText(collection.origin, "Bhadohi, India")}</dd></div>
          <div><dt>Technique</dt><dd>{fallbackText(collection.technique, "Hand-knotted")}</dd></div>
        </dl>
        <Link className="portal-collection-card__link" href={collectionUrl(collection.slug)}>
          View Detail
          <Icon name="arrow" />
        </Link>
      </div>
    </article>
  );
}

function CollectionDetail({ collection }) {
  return (
    <>
      <PortalHeader />
      <main className="portal-shell portal-page portal-page--detail">

      <section className="portal-detail">
        <div className="portal-detail__media">
          <Image src={collection?.hero || collection?.image || "/images/heritage.webp"} alt={`${collection?.title || "Collection"} detail preview`} fill priority sizes="(max-width: 980px) 100vw, 56vw" />
        </div>
        <aside className="portal-detail__panel">
          <Link className="portal-back" href="/collections/portal">Back to portal</Link>
          <p className="portal-eyebrow">{collection?.availability || "Private preview"}</p>
          <h1>{collection?.title}</h1>
          <p>{fallbackText(collection?.details, collection?.summary)}</p>
          <div className="portal-swatches" aria-label={`${collection?.title || "Collection"} palette`}>
            {paletteSwatches(collection?.palette).map((swatch) => (
              <span key={swatch.label} style={{ "--swatch": swatch.color }} title={swatch.label} />
            ))}
          </div>
          <dl className="portal-detail__quick-specs">
            <div><dt>Palette</dt><dd>{fallbackText(collection?.palette, "To be confirmed")}</dd></div>
            <div><dt>Origin</dt><dd>{fallbackText(collection?.origin, "Bhadohi, India")}</dd></div>
            <div><dt>Size</dt><dd>{fallbackText(collection?.size, "Custom sizing")}</dd></div>
          </dl>
          <div className="portal-actions">
            <Link className="portal-btn" href="/contact#inquiry">
              Request Viewing
              <Icon name="arrow" />
            </Link>
            <Link className="portal-btn portal-btn--outline" href="/commission">Start Bespoke Brief</Link>
          </div>
        </aside>
      </section>

      <section className="portal-detail-grid">
        <div className="portal-detail-note">
          <p className="portal-eyebrow">Atelier Note</p>
          <h2>Prepared for private client presentation.</h2>
          <p>This record is managed from the Laravel admin, so product imagery, specifications, and availability can be updated without changing the frontend.</p>
        </div>
        <dl className="portal-specs">
          <div><dt><Icon name="palette" /> Palette</dt><dd>{fallbackText(collection?.palette, "To be confirmed")}</dd></div>
          <div><dt><Icon name="ruler" /> Size</dt><dd>{fallbackText(collection?.size, "Custom sizing")}</dd></div>
          <div><dt><Icon name="origin" /> Origin</dt><dd>{fallbackText(collection?.origin, "Bhadohi, India")}</dd></div>
          <div><dt><Icon name="technique" /> Technique</dt><dd>{fallbackText(collection?.technique, "Hand-knotted")}</dd></div>
          <div><dt><Icon name="material" /> Materials</dt><dd>{fallbackText(collection?.materials, "Wool and silk")}</dd></div>
          <div><dt><Icon name="time" /> Lead time</dt><dd>{fallbackText(collection?.lead_time, "Shared after consultation")}</dd></div>
        </dl>
      </section>
    </main>
    </>
  );
}
