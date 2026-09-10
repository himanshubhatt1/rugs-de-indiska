import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("terms-and-conditions");

export default function TermsAndConditionsPage() {
  return (
    <>
      <link rel="stylesheet" href="/legal.css" />
      <StaticPage page="terms-and-conditions" />
    </>
  );
}
