import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("our-world");

export default function OurWorldPage() {
  return (
    <>
      <link rel="stylesheet" href="/our-world.css" />
      <StaticPage page="our-world" />
    </>
  );
}
