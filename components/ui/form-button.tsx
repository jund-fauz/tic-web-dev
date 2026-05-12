"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { cn } from "@/lib/utils";

interface FormButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function FormButton({ 
  children, 
  loadingText = "Saving...", 
  className, 
  variant = "default",
  ...props 
}: FormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || props.disabled}
      variant={variant}
      className={cn("min-w-[100px]", className)}
      {...props}
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <Spinner className="w-4 h-4" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
