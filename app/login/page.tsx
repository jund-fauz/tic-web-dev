
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
import { login } from "./action";
import { useActionState, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// Extracted into a separate component because useSearchParams()
// requires a <Suspense> boundary to allow static prerendering.
function LoginToast() {
  const params = useSearchParams();
  const redirectFrom = params.get("redirect_from");

  useEffect(() => {
    if (redirectFrom === "register")
      toast("Registration successful! Check your email for confirmation link!");
  }, [redirectFrom]);

  return null;
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, { message: "" });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state?.message) {
      setIsOpen(true);
    }
  }, [state]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Suspense fallback={null}>
        <LoginToast />
      </Suspense>
      <form action={formAction} className="p-6 border rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="mb-6">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full mb-4">Login</Button>

        <div className="text-center space-y-2">
          <div>
            <Link href="/register" className="text-blue-600 hover:underline text-sm">
              Don&apos;t have an account? Register here
            </Link>
          </div>
          <div>
            <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
              Forgot your password?
            </Link>
          </div>
        </div>
      </form>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Status</DialogTitle>
            <DialogDescription>{state?.message}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
