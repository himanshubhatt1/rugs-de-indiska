import CollectionPortalPro from "@/components/CollectionPortalPro";

export const metadata = {
  title: "Collection Portal - Rugs De Indiska",
  description: "Private collection portal for Rugs De Indiska previews."
};

export default function PortalPage() {
  return (
    <>
      <link rel="stylesheet" href="/collection-portal-pro.css" />
      <CollectionPortalPro />
    </>
  );
}
