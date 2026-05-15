
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
import { register } from "./action";
import { useActionState } from "react";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, { message: "" });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state?.message) {
      setIsOpen(true);
    }
  }, [state]);

  return (
    <div className="flex justify-center items-center h-screen">
      <form action={formAction} className="p-6 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <div className="mb-4">
          <Label htmlFor="first_name">Nama</Label>
          <Input id="first_name" name="first_name" type="text" required />
        </div>
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit">Register</Button>
      </form>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registration Status</DialogTitle>
            <DialogDescription>{state?.message}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
