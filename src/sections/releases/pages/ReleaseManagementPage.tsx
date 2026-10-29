"use client";

import type React from "react";
import { ReleaseManagementOrganism } from "@/sections/releases/organisms/ReleaseManagementOrganism";

export const ReleaseManagementPage: React.FC = () => {
  return (
    <div className="w-full max-w-7xl mx-auto py-4">
      <ReleaseManagementOrganism />
    </div>
  );
};

export default ReleaseManagementPage;
