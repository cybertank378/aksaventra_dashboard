"use client";

import { AlertCircle, Check, RotateCcw } from "lucide-react";
import Button from "@/shared-ui/component/Button";

interface UnsavedChangesBannerProps {
  isDirty: boolean;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
}

export function UnsavedChangesBanner({
  isDirty,
  onSave,
  onDiscard,
  isSaving,
}: UnsavedChangesBannerProps) {
  if (!isDirty) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center justify-between gap-4 p-4 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Terdapat Perubahan Belum Disimpan</p>
            <p className="text-xs text-slate-300">
              Simpan perubahan parameter untuk menerapkan kebijakan baru ke sistem.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Batal
          </Button>

          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            onClick={onSave}
            loading={isSaving}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}
