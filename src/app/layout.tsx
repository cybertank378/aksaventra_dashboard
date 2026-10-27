import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import AppToastProvider from "@/libs/providers/AppToastProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aksaventra Dashboard",
  description: "Aksaventra Engine Monitoring and Validation Dashboard",
};
type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`
          ${plusJakartaSans.variable}
          ${jetbrainsMono.variable}
          bg-background
          text-foreground
          antialiased
        `}
      >
        <AppToastProvider>{children}</AppToastProvider>
      </body>
    </html>
  );
}
