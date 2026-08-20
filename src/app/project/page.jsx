import StaticPage from "@/components/StaticPage";
import { getStaticPageMetadata } from "@/lib/static-pages";

export const metadata = getStaticPageMetadata("project");

export default function ProjectPage() {
  return (
    <>
      <link rel="stylesheet" href="/project.css" />
      <StaticPage page="project" />
    </>
  );
}
