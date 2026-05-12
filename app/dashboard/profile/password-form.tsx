"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormButton } from "@/components/ui/form-button";
import { updatePassword } from "@/app/dashboard/profile/action";

export default function PasswordForm({ csrfToken }: { csrfToken: string }) {
  const [state, action] = useActionState(updatePassword, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          placeholder="••••••••"
          required
          minLength={6}
          className="border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input 
          id="confirmPassword" 
          name="confirmPassword" 
          type="password" 
          placeholder="••••••••"
          required
          minLength={6}
          className="border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      {state?.message && (
        <div className={`p-3 rounded-lg text-sm ${state.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {state.message}
        </div>
      )}

      <FormButton className="bg-emerald-600 hover:bg-emerald-700 text-white">
        Update Password
      </FormButton>
    </form>
  );
}
