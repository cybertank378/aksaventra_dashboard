"use client";

import { type FC, useEffect, useMemo, useState } from "react";
import type { SessionItemDTO } from "@/modules/auth/domain/dto/ProfileDTO";
import Card from "@/shared-ui/component/Card";
import Pagination from "@/shared-ui/component/Pagination";
import { SessionDeviceItem } from "../atomic/SessionDeviceItem";

interface ProfileActiveSessionsCardProps {
  sessions: SessionItemDTO[];
  onRevokeSession: (sessionId: string) => void;
  revokingSessionId?: string | null;
}

const ITEMS_PER_PAGE = 5;

export const ProfileActiveSessionsCard: FC<ProfileActiveSessionsCardProps> = ({
  sessions,
  onRevokeSession,
  revokingSessionId = null,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(sessions.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedSessions = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
    return sessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sessions, activePage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className="p-6 border border-slate-200/90 shadow-xs bg-white rounded-2xl">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          3. Sesi Perangkat Saya yang Sedang Aktif (UserSession)
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          Total: {sessions.length} Perangkat
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-5">
        Daftar browser dan perangkat yang saat ini memiliki token akses aktif ke akun Anda
      </p>

      {sessions.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
          Tidak ada sesi perangkat lain yang terdeteksi
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedSessions.map((sess) => (
              <SessionDeviceItem
                key={sess.id}
                session={sess}
                onRevoke={onRevokeSession}
                isRevoking={revokingSessionId === sess.id}
              />
            ))}
          </div>

          {sessions.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <Pagination
                currentPage={activePage}
                totalItems={sessions.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChangeAction={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
