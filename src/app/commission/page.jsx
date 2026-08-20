import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("commission");

export default function CommissionPage() {
  return (
    <>
      <link rel="stylesheet" href="/commission.css" />
      <StaticPage page="commission" />
    </>
  );
}
