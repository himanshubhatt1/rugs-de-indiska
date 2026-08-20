import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("contact");

export default function ContactPage() {
  return (
    <>
      <link rel="stylesheet" href="/contact.css" />
      <StaticPage page="contact" />
    </>
  );
}
