import { AuthSessionProvider } from "@/components/features/AuthSessionProvider";
import { Footer, Header } from "@/components/Layout";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";
import { ReactNode } from "react";

export default async function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return (
    <AuthSessionProvider messages={messages}>
      <Header />
      {children}
      <Footer />
    </AuthSessionProvider>
  );
}
