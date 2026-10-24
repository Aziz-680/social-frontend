import type { Metadata } from "next";
import "./globals.css";
import AppFrame from "@/components/AppFrame";

export const metadata: Metadata = {
  title: "Social | Your network, all together",
  description: "Keep up with friends, colleagues, and the ideas you share.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div
          hidden
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: "<!-- THESIS: A familiar social network that brings personal and professional connections into one feed. OWN-WORLD: Clear white surfaces, deep ink, and a confident blue accent anchor a responsive network UI. STORY: Members discover people, choose post visibility, and share or respond to updates. FIRST VIEWPORT: A compact top bar frames a three-column feed; the composer sits above the latest updates and remains the primary action. FORM: Operate; a conventional social-feed layout adapted to the current blue-and-neutral interface. -->",
          }}
        />
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}