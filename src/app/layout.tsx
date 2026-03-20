import type { Metadata } from "next";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/initUser";

export const metadata: Metadata = {
  title: "SnapCart 10 minutes grocery Delivery App",
  description: "10 minutes grocery Delivery App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className=" w-full min-h-screen  bg-gradient-to-br from-neutral-950 via-neutral-900 to-black text-white ">
        <Provider>
          <StoreProvider>
            <InitUser />
            {children}
          </StoreProvider>
        </Provider>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
