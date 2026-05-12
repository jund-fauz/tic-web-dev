import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm from "@/app/dashboard/profile/profile-form";
import PasswordForm from "@/app/dashboard/profile/password-form";
import { generateCsrfToken } from "@/lib/csrf";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const csrfToken = await generateCsrfToken();

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-emerald-900">Profile Settings</h1>
        <p className="text-emerald-600">Update your personal information and security settings</p>
      </div>

      <Card className="border-emerald-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-emerald-900">Personal Information</CardTitle>
          <CardDescription>Update your name and email address</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} csrfToken={csrfToken} />
        </CardContent>
      </Card>

      <Card className="border-emerald-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-emerald-900">Security</CardTitle>
          <CardDescription>Change your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm csrfToken={csrfToken} />
        </CardContent>
      </Card>
    </div>
  );
}
