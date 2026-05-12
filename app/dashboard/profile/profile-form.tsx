"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormButton } from "@/components/ui/form-button";
import { updateProfile } from "@/app/dashboard/profile/action";
import { User } from "@supabase/supabase-js";

export default function ProfileForm({ user, csrfToken }: { user: User, csrfToken: string }) {
  const [state, action] = useActionState(updateProfile, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input 
          id="displayName" 
          name="displayName" 
          defaultValue={user.user_metadata?.display_name || ""} 
          placeholder="Your Name"
          className="border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          defaultValue={user.email} 
          className="border-emerald-100 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>
      
      {state?.message && (
        <div className={`p-3 rounded-lg text-sm ${state.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {state.message}
        </div>
      )}

      <FormButton className="bg-emerald-600 hover:bg-emerald-700 text-white">
        Save Changes
      </FormButton>
    </form>
  );
}
