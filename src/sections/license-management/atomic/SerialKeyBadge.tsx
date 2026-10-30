"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import Badge from "@/shared-ui/component/Badge";

interface Props {
  serialKey: string;
  hwid?: string | null;
}

export default function SerialKeyBadge({ serialKey, hwid }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(serialKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs font-semibold tracking-wide text-slate-900">
          {serialKey}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title="Salin Serial Key"
          className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
        </button>
      </div>

      {hwid ? (
        <Badge color="info" variant="outline" className="w-fit font-mono text-[11px]">
          HWID: {hwid}
        </Badge>
      ) : (
        <Badge color="secondary" variant="soft" className="w-fit text-[11px]">
          Belum Terikat Perangkat
        </Badge>
      )}
    </div>
  );
}
