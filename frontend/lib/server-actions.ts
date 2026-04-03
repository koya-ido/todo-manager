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

/**
 * JWTアクセストークンをクッキーに保存
 */
export async function setAccessToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15分
    path: "/",
  });

  // すべてのページをリバリデート
  revalidatePath("/", "layout");
}

export async function clearAccessToken() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  revalidatePath("/", "layout");
}
