
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
import { forgotPassword } from "./action";
import { useActionState } from "react";
import { useEffect, useState } from "react";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPassword, { message: "" });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state?.message) {
      setIsOpen(true);
    }
  }, [state]);

  return (
    <div className="flex justify-center items-center h-screen">
      <form action={formAction} className="p-4 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <Button type="submit">Send Reset Link</Button>
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
