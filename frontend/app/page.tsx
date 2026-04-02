import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  // クッキーからJWTトークンを取得
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // 認証がある場合は /home へ、ない場合は /login へリダイレクト
  if (token) {
    redirect("/home");
  } else {
    redirect("/login");
  }

  // リダイレクトが実行されたため、以下のコードは実行されない
  return null;
}
