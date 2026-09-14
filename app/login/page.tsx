import { LoginScreen } from "@/components/auth/LoginScreen";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginScreen next={next} />;
}
