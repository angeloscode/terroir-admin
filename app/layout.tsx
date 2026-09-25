import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Terroir Admin",
  description: "Admin panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <SessionProvider>
          {children}
          <Toaster richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
