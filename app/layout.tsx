import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "SharedGround",
  description:
    "A shared research workspace where humans and AI agents collaborate on complex research tasks through structured actions, explicit control handoffs, and auditable evidence chains.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
