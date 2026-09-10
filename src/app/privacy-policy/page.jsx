import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("privacy-policy");

export default function PrivacyPolicyPage() {
  return (
    <>
      <link rel="stylesheet" href="/legal.css" />
      <StaticPage page="privacy-policy" />
    </>
  );
}
