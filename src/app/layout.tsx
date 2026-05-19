import type { Metadata } from "next";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import { Geist, Geist_Mono } from "next/font/google";
import FollowerNotifications from "@/components/follow/FollowerNotifications";
import SiteHeader from "@/components/site/SiteHeader";
import { resolveSocialImage, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DSonOfSolomon",
    template: "%s | DSonOfSolomon",
  },
  description: "Essays, ideas, observations and systems.",
  openGraph: {
    title: "DSonOfSolomon",
    description: "Essays, ideas, observations and systems.",
    url: SITE_URL,
    siteName: "DSonOfSolomon",
    type: "website",
    images: [
      {
        url: resolveSocialImage(),
        alt: "DSonOfSolomon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DSonOfSolomon",
    description: "Essays, ideas, observations and systems.",
    images: [resolveSocialImage()],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SiteHeader />
        <PageViewTracker />
        <FollowerNotifications />
        {children}
      </body>
    </html>

    
  );
}
