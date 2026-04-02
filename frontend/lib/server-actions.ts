"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function setLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set("LOCALE", locale, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  // すべてのページをリバリデート
  revalidatePath("/", "layout");
}
