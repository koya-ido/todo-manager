import { AuthSessionProvider } from "@/components/features/AuthSessionProvider";
import { BreadCrumbs, DesktopSidebar, Footer, Header } from "@/components/Layout";
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
      <div className="flex min-h-screen w-full bg-main">
        {/* PC用サイドバー (PC表示のみ) */}
        <DesktopSidebar className="hidden md:flex" />

        {/* メインエリア */}
        <div className="flex-1 flex flex-col min-h-screen md:pl-64">
          {/* ヘッダー (モバイル表示のみ。PC表示時はHeaderコンポーネントがnullを返します) */}
          <Header />

          {/* メインコンテンツ: モバイル時は上部にpt-20、下部にpb-16、PC時はマージンを調整 */}
          <main className="flex-1 w-full px-6 pt-20 pb-16 md:px-8 md:pt-8 md:pb-12">
            <BreadCrumbs messages={messages} />
            <div className="w-full">
              {children}
            </div>
          </main>

          {/* フッター */}
          <Footer />
        </div>
      </div>
    </AuthSessionProvider>
  );
}
