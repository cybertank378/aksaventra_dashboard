"use client";

import clsx from "clsx";

interface Props {
  statusCode: number;
  className?: string;
}

export const HttpStatusChip = ({ statusCode, className }: Props) => {
  const is2xx = statusCode >= 200 && statusCode < 300;
  const is403 = statusCode === 403;
  const is4xx = statusCode >= 400 && statusCode < 500;
  const is5xx = statusCode >= 500;

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-semibold",
        is2xx && "bg-emerald-100/70 text-emerald-800",
        is403 && "bg-rose-100 text-rose-800",
        !is403 && is4xx && "bg-amber-100 text-amber-800",
        is5xx && "bg-red-200 text-red-900",
        className,
      )}
    >
      {statusCode}
    </span>
  );
};
