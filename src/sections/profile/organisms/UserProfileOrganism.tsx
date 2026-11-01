"use client";

import { type FC, useEffect, useState } from "react";
import { useProfileApi } from "@/modules/auth/presentation/hooks/useProfileApi";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";
import { ProfileActiveSessionsCard } from "../molecules/ProfileActiveSessionsCard";
import { ProfileBasicInfoForm } from "../molecules/ProfileBasicInfoForm";
import { ProfileIdentityCard } from "../molecules/ProfileIdentityCard";
import { ProfilePasswordCard } from "../molecules/ProfilePasswordCard";

export const UserProfileOrganism: FC = () => {
  const { profile, loading, getProfile, updateProfile, revokeSession, revokeAllOtherSessions } =
    useProfileApi();

  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    getProfile().catch((err) => {
      console.error("[UserProfileOrganism] Failed to load profile:", err);
    });
  }, [getProfile]);

  const handleSaveName = async (name: string) => {
    try {
      setIsUpdatingProfile(true);
      await updateProfile(name);
      showSuccessToast("Profil berhasil diperbarui");
    } catch (err: unknown) {
      showErrorToast(err instanceof Error ? err.message : "Gagal memperbarui profil");
      throw err;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevokingSessionId(sessionId);
      await revokeSession(sessionId);
      showSuccessToast("Sesi perangkat berhasil dicabut");
    } catch (err: unknown) {
      showErrorToast(err instanceof Error ? err.message : "Gagal mencabut sesi perangkat");
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      setIsRevokingAll(true);
      await revokeAllOtherSessions();
      showSuccessToast("Seluruh sesi perangkat lain berhasil diputuskan");
    } catch (err: unknown) {
      showErrorToast(err instanceof Error ? err.message : "Gagal memutuskan sesi");
    } finally {
      setIsRevokingAll(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
        <div className="lg:col-span-4 h-96 rounded-2xl bg-slate-200" />
        <div className="lg:col-span-8 space-y-6">
          <div className="h-44 rounded-2xl bg-slate-200" />
          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        Data profil pengguna tidak dapat dimuat. Silakan muat ulang halaman.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Kolom Kiri: Identitas Pengguna & Izin RBAC */}
      <div className="lg:col-span-4">
        <ProfileIdentityCard
          profile={profile}
          onRevokeAllOtherSessions={handleRevokeAllOtherSessions}
          isRevokingAll={isRevokingAll}
        />
      </div>

      {/* Kolom Kanan: Formulir Edit Profil, Sesi Aktif, & Kata Sandi */}
      <div className="lg:col-span-8 space-y-6">
        <ProfileBasicInfoForm
          initialName={profile.name || ""}
          email={profile.email}
          onSaveName={handleSaveName}
          isLoading={isUpdatingProfile}
        />

        <ProfileActiveSessionsCard
          sessions={profile.sessions}
          onRevokeSession={handleRevokeSession}
          revokingSessionId={revokingSessionId}
        />

        <ProfilePasswordCard userId={profile.id} />
      </div>
    </div>
  );
};
