import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";
import RatAssistant from "@/components/RatAssistant";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infotainment Testing Meets AI | Portfolio",
  description: "Automotive Test Engineer specialized in automation and AI-driven infotainment testing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <NavBar />
        {children}
        <RatAssistant />
      </body>
    </html>
  );
}
