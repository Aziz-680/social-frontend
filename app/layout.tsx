import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";
import Navbar from "../components/Navbar";
import RightSidebar from "../components/RightSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social App",
  description: "Full-stack social media application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-black transition-colors duration-300`}>
        <ThemeToggle />
        <Navbar /> 
        <RightSidebar />
        <main className="flex-grow"></main>
        {children}
      </body>
    </html>
  );
}