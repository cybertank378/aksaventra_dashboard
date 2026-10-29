"use client";

import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import TextField from "@/shared-ui/component/TextField";

export interface AuthTextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;
  helperText?: string;
  error?: boolean | string;
  success?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightIconClick?: () => void;
  enablePasswordToggle?: boolean;
  maxLengthValue?: number;
  minLengthValue?: number;
  showCounter?: boolean;
}

const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(
  ({ type = "text", enablePasswordToggle, className, ...props }, ref) => {
    const shouldTogglePassword = enablePasswordToggle ?? type === "password";

    return (
      <TextField
        ref={ref}
        type={type}
        variant="custom"
        size="lg"
        enablePasswordToggle={shouldTogglePassword}
        className={clsx(
          "rounded-xl border-slate-300 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-100",
          className,
        )}
        {...props}
      />
    );
  },
);

AuthTextField.displayName = "AuthTextField";

export default AuthTextField;
