"use client";

import { RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useEngineMonitorApi } from "@/modules/engine-validation/presentation/hooks/useEngineMonitorApi";
import BinaryIntegrityTableView from "@/sections/engine-validation/molecules/BinaryIntegrityTableView";
import EngineValidationSimulatorModal, {
  type SimulatorInitialValues,
} from "@/sections/engine-validation/molecules/EngineValidationSimulatorModal";
import Button from "@/shared-ui/component/Button";

interface EngineIntegrityOrganismProps {
  isAdmin?: boolean;
}

export default function EngineIntegrityOrganism({ isAdmin = true }: EngineIntegrityOrganismProps) {
  const {
    loading,
    integrityList,
    listIntegrity,
    verifyChecksum,
    patchBinaryStatus,
    simulateValidation,
  } = useEngineMonitorApi();

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorValues, setSimulatorValues] = useState<SimulatorInitialValues | null>(null);

  useEffect(() => {
    listIntegrity();
  }, [listIntegrity]);

  const handleVerifyChecksumClick = (version: string, hash: string) => {
    setSimulatorValues({
      tab: "CHECKSUM_INTEGRITY",
      checksumVersion: version,
      sha256Hash: hash,
    });
    setIsSimulatorOpen(true);
  };

  const handleOpenGeneralSimulator = () => {
    setSimulatorValues(null);
    setIsSimulatorOpen(true);
  };

  const handleManualRefresh = () => {
    listIntegrity();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Registri Integritas Kriptografis Engine
          </h2>
          <p className="text-xs text-slate-500">
            Pemastian keaslian biner aksaventra_engine.exe melalui pencocokan nilai SHA-256
            (Kepatuhan Isu #39)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={RefreshCw}
            loading={loading}
            onClick={handleManualRefresh}
          >
            Segarkan
          </Button>

          <Button
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={ShieldCheck}
            onClick={handleOpenGeneralSimulator}
          >
            Simulator &amp; Verifikator Checksum
          </Button>
        </div>
      </div>

      {/* Binary Integrity Table View */}
      <BinaryIntegrityTableView
        items={integrityList}
        loading={loading}
        isAdmin={isAdmin}
        onVerifyChecksumClick={handleVerifyChecksumClick}
        onPatchStatus={(id, isActive, reason) => patchBinaryStatus({ id, isActive, reason })}
      />

      {/* Simulator Modal */}
      <EngineValidationSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        initialValues={simulatorValues}
        onSimulateValidate={simulateValidation}
        onVerifyChecksum={verifyChecksum}
      />
    </div>
  );
}
