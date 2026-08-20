import fs from "node:fs";
import path from "node:path";

const PAGE_FILES = {
  home: "index.html",
  collections: "collections.html",
  craftsmanship: "craftsmanship.html",
  "our-world": "our-world.html",
  journal: "journal.html",
  project: "project.html",
  commission: "commission.html",
  contact: "contact.html"
};

const ROUTE_BY_FILE = {
  "index.html": "/",
  "collections.html": "/collections",
  "craftsmanship.html": "/craftsmanship",
  "our-world.html": "/our-world",
  "journal.html": "/journal",
  "project.html": "/project",
  "commission.html": "/commission",
  "contact.html": "/contact"
};

function readHtml(pageKey) {
  const fileName = PAGE_FILES[pageKey];
  if (!fileName) {
    throw new Error(`Unknown static page key: ${pageKey}`);
  }

  return fs.readFileSync(path.join(process.cwd(), "content", "pages", fileName), "utf8");
}

function extractBody(html) {
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) {
    throw new Error("Static page is missing a body element.");
  }

  const classMatch = bodyMatch[1].match(/\bclass=["']([^"']+)["']/i);

  return {
    className: classMatch ? classMatch[1] : "",
    html: bodyMatch[2]
  };
}

function rewriteRoutes(markup) {
  return markup.replace(
    /\b(href)=["']([^"']+\.html(?:#[^"']*)?)["']/gi,
    (match, attr, href) => {
      const [fileName, hash = ""] = href.split("#");
      const route = ROUTE_BY_FILE[fileName];

      return route ? `${attr}="${route}${hash ? `#${hash}` : ""}"` : match;
    }
  );
}

function rewriteAssetPaths(markup) {
  return markup
    .replace(/\b(src)=["']images\//gi, '$1="/images/')
    .replace(/\b(href)=["']images\//gi, '$1="/images/')
    .replace(/url\(["']?images\//gi, 'url("/images/');
}

function stripOriginalScripts(markup) {
  return markup.replace(/<script\s+src=["']script\.js["']\s*><\/script>/gi, "");
}

export function getStaticPage(pageKey) {
  const body = extractBody(readHtml(pageKey));
  const html = stripOriginalScripts(rewriteAssetPaths(rewriteRoutes(body.html)));

  return {
    className: body.className,
    html
  };
}

export function getStaticPageMetadata(pageKey) {
  const html = readHtml(pageKey);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html
    .match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i)?.[1]
    ?.trim();

  return {
    title: title || "Rugs De Indiska",
    description:
      description ||
      "Handcrafted rugs by Rugs De Indiska, rooted in heritage, craft, and bespoke interiors."
  };
}
