import "./globals.css";
import QueryClientProviderWrapper from "../components/QueryClientProviderWrapper";
import { UserProvider } from "@/components/UserContext";
import ToasterProvider from "@/components/ToasterProvider";
import { Metadata } from "next";
import Navigation from "@/components/shared-common/navigation";
import ChatBubble from "@/components/shared-common/ChatBubble";

export const metadata: Metadata = {
  title: "Catur Queue Realtime",
  icons: {
    icon: "/csi-logo.png",
    shortcut: "/csi-logo.png",
    apple: "/csi-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="light">
      <body>
        <QueryClientProviderWrapper>
          <UserProvider>
            <Navigation />
            <ChatBubble />
            <ToasterProvider>{children}</ToasterProvider>
          </UserProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
