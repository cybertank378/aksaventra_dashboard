import type React from "react";

export interface MaskedSerialKeyProps {
  serialKeyMasked: string;
}

export function MaskedSerialKey({ serialKeyMasked }: MaskedSerialKeyProps): React.JSX.Element {
  return (
    <code className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-xs font-bold tracking-wider text-slate-800">
      {serialKeyMasked}
    </code>
  );
}

export default MaskedSerialKey;
