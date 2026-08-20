import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("journal");

export default function JournalPage() {
  return (
    <>
      <link rel="stylesheet" href="/journal.css" />
      <StaticPage page="journal" />
    </>
  );
}
