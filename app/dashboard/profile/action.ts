"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { verifyCsrfToken } from "@/lib/csrf";

export async function updateProfile(prevState: any, formData: FormData) {
  const csrfToken = formData.get("csrfToken") as string;
  if (!await verifyCsrfToken(csrfToken)) {
    return { message: "Invalid CSRF token.", type: 'error' };
  }

  const supabase = await createClient();
  
  const displayName = formData.get("displayName") as string;
  const email = formData.get("email") as string;

  const { error } = await supabase.auth.updateUser({
    email: email,
    data: { display_name: displayName }
  });

  if (error) {
    return { message: `Error updating profile: ${error.message}`, type: 'error' };
  }

  revalidatePath("/dashboard/profile");
  return { message: "Profile updated successfully! If you changed your email, please check both your old and new email addresses for confirmation links.", type: 'success' };
}

export async function updatePassword(prevState: any, formData: FormData) {
  const csrfToken = formData.get("csrfToken") as string;
  if (!await verifyCsrfToken(csrfToken)) {
    return { message: "Invalid CSRF token.", type: 'error' };
  }

  const supabase = await createClient();
  
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { message: "Passwords do not match.", type: 'error' };
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { message: `Error updating password: ${error.message}`, type: 'error' };
  }

  return { message: "Password updated successfully!", type: 'success' };
}
