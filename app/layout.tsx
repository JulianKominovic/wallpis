import * as _initials from "@/initial";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Wallpis",
  description: "4K AI generated wallpapers for your desktop.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-[var(--background)] font-sans antialiased font-medium  transition-colors ease-in-out",
          fontSans.variable
        )}
        style={
          {
            "--background": "#000000",
            transitionDuration: "1000ms",
          } as any
        }
        // style={
        //   {
        //     "--tw-gradient-from": "var(--body-gradient-from)",
        //     "--tw-gradient-to": "var(--body-gradient-to)",
        //     "--tw-gradient-stops":
        //       "var(--tw-gradient-from), var(--tw-gradient-to)",
        //   } as any
        // }
      >
        {children}
      </body>
    </html>
  );
}
