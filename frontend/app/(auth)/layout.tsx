import { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="px-6 pt-20 pb-16 mb-5 min-h-screen flex justify-center items-start w-full">
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
