import { getStaticPage } from "@/lib/static-pages";

export default function StaticPage({ page }) {
  const { className, html } = getStaticPage(page);

  if (className) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
