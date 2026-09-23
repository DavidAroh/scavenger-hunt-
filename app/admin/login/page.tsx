import { redirect } from "next/navigation";
import { Shell } from "@/components/Shell";
import { LoginForm } from "@/components/admin/LoginForm";
import { adminPassword, isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function Login() {
  if (await isAdmin()) redirect("/admin");
  return (
    <Shell>
      <p className="label text-sky">Staff only</p>
      <h1 className="display mt-3 mb-8">Admin</h1>
      {adminPassword() ? (
        <LoginForm />
      ) : (
        <p className="border-3 border-coral p-4 font-semibold">
          Set <span className="font-mono">ADMIN_PASSWORD</span> in your environment to enable the admin area.
        </p>
      )}
    </Shell>
  );
}
