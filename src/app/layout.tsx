import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GymLite",
  description: "Lightweight Gym Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
