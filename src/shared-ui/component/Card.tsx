// File: src/shared-ui/component/Card.tsx

import type React from "react";

interface Props {
  children: React.ReactNode;

  className?: string;
}

export default function Card({ children, className }: Props) {
  return (
    <div
      className={`
        rounded-xl
        shadow-sm
        p-6
        ${className ?? ""}
      `}
    >
      {children}
    </div>
  );
}
