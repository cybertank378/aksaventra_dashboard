import type { FC } from "react";
import Badge from "@/shared-ui/component/Badge";

interface ProfilePermissionChipProps {
  permission: string;
}

export const ProfilePermissionChip: FC<ProfilePermissionChipProps> = ({ permission }) => {
  return (
    <Badge
      color="secondary"
      variant="soft"
      className="font-mono text-[10px] uppercase tracking-wider py-1 px-2.5 bg-slate-100 text-slate-700 border border-slate-200"
    >
      {permission}
    </Badge>
  );
};
