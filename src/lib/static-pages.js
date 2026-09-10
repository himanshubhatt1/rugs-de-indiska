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
  admin: "admin.html",
  contact: "contact.html",
  "privacy-policy": "privacy-policy.html",
  "terms-and-conditions": "terms-and-conditions.html"
};

const ROUTE_BY_FILE = {
  "index.html": "/",
  "collections.html": "/collections",
  "craftsmanship.html": "/craftsmanship",
  "our-world.html": "/our-world",
  "journal.html": "/journal",
  "project.html": "/project",
  "commission.html": "/commission",
  "admin.html": "/admin",
  "contact.html": "/contact",
  "privacy-policy.html": "/privacy-policy",
  "terms-and-conditions.html": "/terms-and-conditions"
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
  return markup
    .replace(/\bhref=["']#["']/gi, 'href="contact.html"')
    .replace(
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

function applySharedHeader(markup) {
  const homeMarkup = extractBody(readHtml("home")).html;
  const sharedHeader = homeMarkup.match(/<header\b[\s\S]*?<\/header>/i)?.[0];
  if (!sharedHeader) throw new Error("The shared header is missing from the home page.");

  return markup.replace(/<header\b[\s\S]*?<\/header>/i, sharedHeader);
}

function applySharedFooter(markup) {
  const homeMarkup = extractBody(readHtml("home")).html;
  const sharedFooter = homeMarkup.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0];
  if (!sharedFooter) throw new Error("The shared footer is missing from the home page.");

  return markup.replace(/<footer\b[\s\S]*?<\/footer>/i, sharedFooter);
}

function addFooterNavigation(markup) {
  return markup.replace(
    /(<nav\b[^>]*aria-label=["']Atelier["'][\s\S]*?<ul>)([\s\S]*?)(<\/ul>)/i,
    (nav, opening, links, closing) => {
      if (/project\.html|commission\.html/i.test(links)) return nav;

      return `${opening}${links}
        <li><a href="project.html">Projects</a></li>
        <li><a href="commission.html">Commission</a></li>${closing}`;
    }
  );
}

function getImageDimensions(src) {
  if (!src.startsWith("/images/")) return null;

  let fileName;
  try {
    fileName = decodeURIComponent(src.slice("/images/".length));
  } catch {
    return null;
  }

  const imagesDirectory = path.join(process.cwd(), "public", "images");
  const filePath = path.join(imagesDirectory, fileName);
  if (!filePath.startsWith(`${imagesDirectory}${path.sep}`) || !fs.existsSync(filePath)) return null;

  const extension = path.extname(filePath).toLowerCase();
  const file = fs.readFileSync(filePath);

  if (extension === ".png" && file.length >= 24) {
    return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
  }

  if (extension === ".svg") {
    const svgTag = file.toString("utf8").match(/<svg\b[^>]*>/i)?.[0] || "";
    const width = Number.parseFloat(svgTag.match(/\bwidth=["']([\d.]+)/i)?.[1]);
    const height = Number.parseFloat(svgTag.match(/\bheight=["']([\d.]+)/i)?.[1]);

    if (width > 0 && height > 0) return { width, height };

    const viewBox = svgTag.match(/\bviewBox=["'][^"']*?([\d.]+)\s+([\d.]+)["']/i);
    if (viewBox) return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
  }

  return null;
}

function addImageDimensions(markup) {
  return markup.replace(/<img\b([^>]*\bsrc=["']([^"']+)["'][^>]*)>/gi, (tag, attributes, src) => {
    if (/\bwidth\s*=|\bheight\s*=/i.test(attributes)) return tag;

    const dimensions = getImageDimensions(src);
    if (!dimensions) return tag;

    return `<img${attributes} width="${dimensions.width}" height="${dimensions.height}">`;
  });
}

function preferOptimizedImages(markup) {
  return markup.replace(/(<img\b[^>]*\bsrc=["']\/images\/)([^"']+)\.png(["'][^>]*>)/gi, (
    tag,
    prefix,
    fileName,
    suffix
  ) => {
    let decodedName;
    try {
      decodedName = decodeURIComponent(fileName);
    } catch {
      return tag;
    }

    const webpPath = path.join(process.cwd(), "public", "images", `${decodedName}.webp`);
    return fs.existsSync(webpPath) ? `${prefix}${fileName}.webp${suffix}` : tag;
  });
}

function stripOriginalScripts(markup) {
  return markup.replace(/<script\s+src=["']script\.js["']\s*><\/script>/gi, "");
}

export function getStaticPage(pageKey) {
  const body = extractBody(readHtml(pageKey));
  const html = preferOptimizedImages(
    addImageDimensions(
      stripOriginalScripts(
        rewriteAssetPaths(
          rewriteRoutes(addFooterNavigation(applySharedFooter(applySharedHeader(body.html))))
        )
      )
    )
  );

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
