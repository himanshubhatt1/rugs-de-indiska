import Script from "next/script";
import ClientNavigation from "@/components/ClientNavigation";

export const metadata = {
  title: {
    default: "Rugs De Indiska",
    template: "%s"
  },
  description:
    "Handcrafted in Bhadohi since 1962. Hand-knotted silk and wool rugs by three generations of master weavers.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23241a12'/%3E%3Cpath d='M16 5l11 11-11 11L5 16z' fill='none' stroke='%23b08d4f' stroke-width='1.5'/%3E%3C/svg%3E"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="has-loader">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Public+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        {children}
        <ClientNavigation />
        <Script src="/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
