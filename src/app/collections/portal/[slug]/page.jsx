import CollectionPortalPro from "@/components/CollectionPortalPro";

export const metadata = {
  title: "Collection Detail - Rugs De Indiska",
  description: "Private collection detail preview for Rugs De Indiska."
};

export default async function PortalDetailPage({ params }) {
  const { slug } = await params;

  return (
    <>
      <link rel="stylesheet" href="/collection-portal-pro.css" />
      <CollectionPortalPro detailSlug={slug} />
    </>
  );
}
