import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("home");

export default function HomePage() {
  return <StaticPage page="home" />;
}
