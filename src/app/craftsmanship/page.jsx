import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("craftsmanship");

export default function CraftsmanshipPage() {
  return (
    <>
      <link rel="stylesheet" href="/craftsmanship.css" />
      <StaticPage page="craftsmanship" />
    </>
  );
}
