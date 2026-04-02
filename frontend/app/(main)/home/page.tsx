import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full items-center justify-center gap-10">
      <h1 className="text-4xl font-bold">TODO Manager</h1>
      <p>Welcome to TODO Manager! Please log in to manage your tasks.</p>
      <Link href="/login" className="text-blue-500 hover:underline">
        Go to Login
      </Link>
    </div>
  );
}
