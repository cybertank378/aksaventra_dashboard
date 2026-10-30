"use client";

import { Check, Copy, Lock } from "lucide-react";
import { useState } from "react";
import Badge from "@/shared-ui/component/Badge";

interface Props {
  hwid?: string | null;
  className?: string;
}

export default function HwidBindingBadge({ hwid, className }: Props) {
  const [copied, setCopied] = useState(false);

  const isBound = Boolean(hwid && hwid.trim().length > 0);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hwid) return;
    navigator.clipboard.writeText(hwid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isBound || !hwid) {
    return (
      <Badge color="secondary" variant="soft" className={className}>
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Belum Terikat
        </span>
      </Badge>
    );
  }

  const truncated = hwid.length > 16 ? `${hwid.slice(0, 8)}...${hwid.slice(-6)}` : hwid;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <Badge color="success" variant="soft" className="font-mono text-[11px]">
        <Lock size={12} className="mr-1 text-emerald-600" />
        {truncated}
      </Badge>

      <button
        type="button"
        onClick={handleCopy}
        title="Salin HWID lengkap"
        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      </button>
    </div>
  );
}
