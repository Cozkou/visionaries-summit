import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pretty Fly Creative Director",
  description:
    "AI-powered clothing concept generation for Pretty Fly streetwear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
