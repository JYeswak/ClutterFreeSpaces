import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Professional Organizing Services | Clutter Free Spaces",
    template: "%s | Clutter Free Spaces",
  },
  description:
    "Stress-free, judgment-free home organization services in Montana and North Texas. Garage, closet, kitchen, RV organization & more. Free consultations.",
  keywords: [
    "professional organizer",
    "home organization",
    "decluttering services",
    "garage organization",
    "closet organization",
    "RV organization",
    "Missoula organizer",
    "Montana organizer",
  ],
  authors: [{ name: "Clutter Free Spaces" }],
  creator: "Clutter Free Spaces",
  publisher: "Clutter Free Spaces",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clutter-free-spaces.com/locations/",
    siteName: "Clutter Free Spaces",
    title: "Professional Organizing Services | Clutter Free Spaces",
    description:
      "Stress-free, judgment-free home organization services in Montana and North Texas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Organizing Services | Clutter Free Spaces",
    description:
      "Stress-free, judgment-free home organization services in Montana and North Texas.",
  },
};

const GTM_ID = "GTM-WKXSWZH7";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}
