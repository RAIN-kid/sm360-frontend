import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Font ya kisasa kabisa inayotumika kwenye mifumo ya kifedha
const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'] 
});

export const metadata: Metadata = {
  title: "SM360 | Smart Waste Management",
  description: "Enterprise Waste Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} antialiased bg-[#f4f7f4]`}>
        {children}
      </body>
    </html>
  );
}