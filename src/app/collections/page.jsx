import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("collections");

export default function CollectionsPage() {
  return (
    <>
      <link rel="stylesheet" href="/collections.css" />
      <StaticPage page="collections" />
    </>
  );
}
