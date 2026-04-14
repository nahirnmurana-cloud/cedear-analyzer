import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/header";
import { Disclaimer } from "@/components/disclaimer";
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
  title: "CEDEAR Analyzer - Analisis Tecnico de CEDEARs",
  description:
    "Analiza indicadores tecnicos de CEDEARs, obtene recomendaciones de compra/venta y encontra las mejores oportunidades.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Disclaimer />
        </ClerkProvider>
      </body>
    </html>
  );
}
