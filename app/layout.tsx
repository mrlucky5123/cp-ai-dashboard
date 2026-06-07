import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI CP Dashboard",
  description: "AI Powered Competitive Programming Mentor Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 min-h-screen ml-64 flex flex-col bg-slate-50/50">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}