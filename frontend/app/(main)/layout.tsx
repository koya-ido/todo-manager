import { AuthSessionProvider } from "@/components/features/AuthSessionProvider";
import { Footer, Header, BreadCrumbs } from "@/components/Layout";
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
      <div className="w-full flex flex-col">
        <BreadCrumbs messages={messages} />
        {children}
      </div>
      <Footer />
    </AuthSessionProvider>
  );
}
