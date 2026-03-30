
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
import { useActionState } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

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
              Don't have an account? Register here
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
    </div>
  );
}
