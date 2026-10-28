"use client";

import Badge from "@/shared-ui/component/Badge";

interface Props {
  serialKey: string;
  hwid?: string | null;
}

export default function SerialKeyBadge({ serialKey, hwid }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xs font-semibold tracking-wide text-slate-900">
        {serialKey}
      </span>
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

