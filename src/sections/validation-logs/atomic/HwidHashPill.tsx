"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { truncateHash } from "@/modules/validation-logs/presentation/helpers/validationLogFormatters";
import { showSuccessToast } from "@/shared-ui/component/Toast";

interface Props {
  hwidHash: string | null | undefined;
  className?: string;
}

export const HwidHashPill = ({ hwidHash, className }: Props) => {
  const [copied, setCopied] = useState(false);

  if (!hwidHash) {
    return <span className="text-xs text-slate-400">-</span>;
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(hwidHash);
      setCopied(true);
      showSuccessToast("Hash HWID berhasil disalin ke clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/70 px-2.5 py-1 text-xs font-mono text-slate-600 ${className ?? ""}`}
      title={`HWID Hash SHA-256: ${hwidHash}`}
    >
      <span className="truncate">{truncateHash(hwidHash, 8, 6)}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Salin Hash HWID"
        className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
      >
        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
      </button>
    </div>
  );
};
