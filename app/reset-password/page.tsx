
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "./action";
import { useActionState } from "react";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(resetPassword, { message: "" });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state?.message) {
      setIsOpen(true);
    }
  }, [state]);

  return (
    <div className="flex justify-center items-center h-screen">
      <form action={formAction} className="p-6 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <div className="mb-4">
          <Label htmlFor="password">New Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <div className="mb-4">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
          />
        </div>
        <Button type="submit">Reset Password</Button>
      </form>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>{state?.message}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
