import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("admin");

export default function AdminPage() {
  return (
    <>
      <link rel="stylesheet" href="/admin.css" />
      <StaticPage page="admin" />
    </>
  );
}
