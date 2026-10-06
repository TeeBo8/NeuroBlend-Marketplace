import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { Chatbot } from "@/components/ai/chatbot";
import { CookieBanner } from "@/components/cookie-banner";
import { AnalyticsLoader } from "@/components/analytics-loader";
import { ThemeProvider } from "next-themes";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema } from "@/lib/schemas";
import { siteUrl } from "@/lib/site-url";
import { isDemo } from "@/lib/demo";
import { DemoBanner } from "@/components/demo/demo-banner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_NAME} - Café pour esprits neuroatypiques`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "café",
    "capsules",
    "HPI",
    "ADHD",
    "hypersensible",
    "neuroatypique",
    "marketplace",
    "torréfacteur",
    "café artisanal",
    "capsules compatibles",
    "neurodiversité",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: APP_NAME,
    title: `${APP_NAME} - Café pour esprits neuroatypiques`,
    description: APP_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Café pour esprits neuroatypiques`,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://utfs.io" />
        <link rel="dns-prefetch" href="https://eu.i.posthog.com" />
        <link rel="preconnect" href="https://utfs.io" crossOrigin="anonymous" />
        <JsonLd data={organizationSchema()} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TRPCProvider>
            {isDemo && <DemoBanner />}
            <Header />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
            <Chatbot />
            <CookieBanner />
            <AnalyticsLoader />
            <Toaster richColors position="top-right" />
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
