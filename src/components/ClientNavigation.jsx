"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const projectCategories = {
  hospitality: {
    number: "01", title: "Hospitality",
    note: "Providing a tactile anchor for the world's most serene retreats, where the silence of the loom meets the luxury of the hotel.",
    story: "Our hospitality projects begin with a deep study of the site's spirit, treating the floor as the fifth wall of an architectural masterpiece. We translate atmosphere, landscape, and local memory into surfaces that feel both ancient and profoundly modern.",
    process: "Built for generous public spaces, each composition is scaled, sampled, and woven with exceptional knot density. Our artisans balance intricate detail with the structural integrity required for years of graceful service.",
    materials: "Highland wool brings resilience and warmth, while hand-reeled Mulberry silk introduces a quiet luminosity. Small-batch natural dyes create nuanced colors that shift as daylight moves through the interior.",
    locations: "Aman New York, The Raffles London, Chalet Mirabelle Zermatt.",
    projects: [
      ["The Raffles London Library.png", "The Raffles London", "A pale rug in The Raffles London gallery interior"],
      ["Aman New York Interior.png", "Aman New York", "Aman New York lounge with a handwoven rug"],
      ["Chalet Mirabelle Zermatt.png", "Chalet Mirabelle", "Chalet Mirabelle Zermatt salon with a mountain view"]
    ]
  },
  residential: {
    number: "02", title: "Residential",
    note: "Personal rugs shaped around the architecture, rituals, and collected stories that make a private home entirely its own.",
    story: "A residential commission begins with listening: to the character of the rooms, the way the family lives, and the objects already held dear. The resulting rug becomes a calm, personal foundation rather than a decorative afterthought.",
    process: "We develop scale drawings and color studies in conversation with the client and designer. Full-size samples are reviewed in the home's light before our weavers translate the approved composition knot by knot.",
    materials: "Soft New Zealand wool, luminous silk, and tactile botanical fibers are selected for the needs of each room. Every palette is mixed by hand to sit naturally beside stone, timber, art, and upholstery.",
    locations: "Private residences in London, New Delhi, Jaipur, and New York.",
    projects: [
      ["Background (2).png", "Courtyard Residence", "A serene private residence grounded by a bespoke rug"],
      ["contact_studio.png", "Bhadohi House", "A handwoven rug in a quiet residential interior"],
      ["Atelier.png", "Collector's Salon", "A richly textured rug created for a private salon"]
    ]
  },
  cultural: {
    number: "03", title: "Cultural",
    note: "Narrative textiles for institutions and heritage spaces, preserving regional memory through material, motif, and handwork.",
    story: "For cultural spaces, we begin in the archive. Architectural geometry, local symbols, and oral histories are distilled into contemporary compositions that respect their source without simply reproducing it.",
    process: "Historians, curators, designers, and master weavers work through a sequence of drawings and woven trials. Every motif is resolved for clarity at scale and documented for future conservation.",
    materials: "Naturally dyed wool and silk connect each piece to India's long textile history. Durable constructions and carefully controlled pigments support demanding public settings while retaining the touch of the hand.",
    locations: "Heritage residences, galleries, cultural foundations, and private archives.",
    projects: [
      ["Shri Ramji, founder of Rugs De Indiska.png", "The Founder's Archive", "Portrait from the Rugs De Indiska heritage archive"],
      ["craft_ghat.png", "River Heritage Study", "Textile traditions inspired by the historic ghats"],
      ["heritage.png", "Bhadohi Legacy", "A cultural commission celebrating Bhadohi craftsmanship"]
    ]
  },
  commercial: {
    number: "04", title: "Commercial",
    note: "Distinctive, durable surfaces that give workplaces, retail spaces, and gathering rooms a memorable sense of identity.",
    story: "Commercial commissions turn a brand's character into a tactile environment. We work with architects to define zones, guide movement, and bring warmth to spaces where people meet, work, and return every day.",
    process: "Layouts are engineered around circulation, furniture, and installation constraints. Prototypes undergo color, wear, and construction reviews before production is coordinated to the project's programme.",
    materials: "Performance-led wool grounds each design, with silk accents reserved for lower-traffic moments of emphasis. Contract-grade finishing and considered pile heights deliver longevity without sacrificing refinement.",
    locations: "Design studios, flagship boutiques, executive offices, and private clubs.",
    projects: [
      ["collection_banner.png", "Atelier Flagship", "A statement rug created for a design-led flagship space"],
      ["Background.png", "The Gallery Office", "A refined commercial interior with a bespoke rug"],
      ["Background (1).png", "Private Members' Club", "A richly layered gathering space with custom textiles"]
    ]
  }
};

export default function ClientNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector("#siteHeader");
    const burger = document.querySelector("#burger");
    const nav = document.querySelector("#primaryNav");
    if (!header) return;

    let lastScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
    let ticking = false;

    const updateHeader = () => {
      const currentScrollY = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const delta = currentScrollY - lastScrollY;
      const navIsOpen = nav?.classList.contains("is-open");

      header.classList.toggle("is-stuck", currentScrollY > 60);

      if (navIsOpen || currentScrollY <= 10) {
        header.classList.remove("is-hidden");
      } else if (delta > 6 && currentScrollY > header.offsetHeight) {
        header.classList.add("is-hidden");
      } else if (delta < -6) {
        header.classList.remove("is-hidden");
      }

      if (Math.abs(delta) > 1) lastScrollY = currentScrollY;
    };

    const scheduleHeaderUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateHeader();
        ticking = false;
      });
    };

    const closeNav = () => {
      nav?.classList.remove("is-open");
      burger?.classList.remove("is-open");
      burger?.setAttribute("aria-expanded", "false");
      burger?.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("nav-open");
    };

    const toggleNav = () => {
      if (!nav || !burger) return;
      const open = nav.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("nav-open", open);
      if (open) header.classList.remove("is-hidden");
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeNav();
    };

    const navLinks = nav ? [...nav.querySelectorAll("a")] : [];
    const primaryNavLinks = nav ? [...nav.querySelectorAll(".nav__list a[href]")] : [];

    const normalizePath = (path) => (path !== "/" ? path.replace(/\/$/, "") : path);
    const currentPath = normalizePath(pathname);
    primaryNavLinks.forEach((link) => {
      let linkPath;
      try {
        linkPath = normalizePath(new URL(link.getAttribute("href"), window.location.origin).pathname);
      } catch {
        link.removeAttribute("aria-current");
        return;
      }

      if (linkPath === currentPath) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    window.addEventListener("scroll", scheduleHeaderUpdate, { passive: true });
    burger?.addEventListener("click", toggleNav);
    navLinks.forEach((link) => link.addEventListener("click", closeNav));
    document.addEventListener("keydown", handleKeyDown);
    updateHeader();

    return () => {
      window.removeEventListener("scroll", scheduleHeaderUpdate);
      burger?.removeEventListener("click", toggleNav);
      navLinks.forEach((link) => link.removeEventListener("click", closeNav));
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("nav-open");
    };
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      router.push(`${url.pathname}${url.search}${url.hash}`);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [router]);

  useEffect(() => {
    let observer;
    const frame = window.requestAnimationFrame(() => {
      const loader = document.querySelector("#loader");
      loader?.classList.add("is-ready", "is-done");
      loader?.classList.remove("is-leaving");

      const revealElements = document.querySelectorAll(".reveal, .reveal-img");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => element.classList.add("is-visible"));
      } else {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );

        revealElements.forEach((element) => observer.observe(element));
      }

      document.documentElement.classList.add("loaded");
      document.body.classList.add("is-loaded");
      window.scrollTo(0, 0);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/project") return;

    const tabs = [...document.querySelectorAll(".project-tabs__link")];
    const section = document.querySelector("#hospitality");
    if (!tabs.length || !section) return;

    const setCategory = (key) => {
      const category = projectCategories[key];
      if (!category) return;

      section.querySelector(".project-kicker").textContent = `Categories / ${category.number}`;
      section.querySelector(".project-intro h2").textContent = category.title;
      section.querySelector(".project-intro__note").textContent = category.note;

      const paragraphs = section.querySelectorAll(".project-text > p");
      [category.story, category.process, category.materials].forEach((copy, index) => {
        paragraphs[index].textContent = copy;
      });
      section.querySelector(".project-locations > p").textContent = category.locations;

      section.querySelectorAll(".project-card").forEach((card, index) => {
        const [image, title, alt] = category.projects[index];
        card.querySelector("img").src = `/images/${encodeURIComponent(image.replace(/\.png$/i, ".webp"))}`;
        card.querySelector("img").alt = alt;
        card.querySelector("h3").textContent = title;
      });

      tabs.forEach((tab) => {
        const active = tab.hash === `#${key}`;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
    };

    const handleTabClick = (event) => {
      event.preventDefault();
      const key = event.currentTarget.hash.slice(1);
      setCategory(key);
      window.history.replaceState(null, "", `#${key}`);
    };

    tabs.forEach((tab) => tab.addEventListener("click", handleTabClick));
    const initialKey = projectCategories[window.location.hash.slice(1)]
      ? window.location.hash.slice(1)
      : "hospitality";
    setCategory(initialKey);

    return () => tabs.forEach((tab) => tab.removeEventListener("click", handleTabClick));
  }, [pathname]);

  useEffect(() => {
    const rails = [
      [document.querySelector("#timeline"), document.querySelector("#timelineFill")],
      [document.querySelector(".stages"), document.querySelector("#stageFill")]
    ].filter(([track, fill]) => track && fill);

    if (!rails.length) return;

    let frame;
    const updateRails = () => {
      frame = undefined;
      rails.forEach(([track, fill]) => {
        const bounds = track.getBoundingClientRect();
        const viewportMark = window.innerHeight * 0.62;
        const progress = (viewportMark - bounds.top) / bounds.height;
        fill.style.height = `${Math.max(0, Math.min(1, progress)) * 100}%`;
      });
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateRails);
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    updateRails();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
