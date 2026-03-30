
"use server";

import { createClient } from "@/utils/supabase/server";

export async function forgotPassword(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { message: "Email is required." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { message: `Error sending reset link: ${error.message}` };
  }

  return { message: "Password reset link sent successfully!" };
}
