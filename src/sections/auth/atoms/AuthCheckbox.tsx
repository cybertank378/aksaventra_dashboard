"use client";

import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";
import Checkbox from "@/shared-ui/component/Checkbox";

export interface AuthCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  indeterminate?: boolean;
}

const AuthCheckbox = forwardRef<HTMLInputElement, AuthCheckboxProps>(
  ({ label = "Ingat perangkat ini selama 30 hari", description, className, ...props }, ref) => {
    if (description) {
      return (
        <div className="space-y-1">
          <Checkbox
            ref={ref}
            label={label}
            className={clsx("rounded-md border-slate-300", className)}
            {...props}
          />
          <p className="pl-7 text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
      );
    }

    return (
      <Checkbox
        ref={ref}
        label={label}
        className={clsx("rounded-md border-slate-300", className)}
        {...props}
      />
    );
  },
);

AuthCheckbox.displayName = "AuthCheckbox";

export default AuthCheckbox;
