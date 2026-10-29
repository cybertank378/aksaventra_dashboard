"use client";

import { FileUp, Info } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { SemVer } from "@/modules/releases/domain/value-object/SemVer";
import Checkbox from "@/shared-ui/component/Checkbox";
import { Modal } from "@/shared-ui/component/Modal";
import SelectField from "@/shared-ui/component/SelectField";
import TextAreaField from "@/shared-ui/component/TextAreaField";
import TextField from "@/shared-ui/component/TextField";

interface ReleaseUploadModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}

export const ReleaseUploadModal: React.FC<ReleaseUploadModalProps> = ({
  open,
  loading,
  onClose,
  onSubmit,
}) => {
  const [version, setVersion] = useState("");
  const [channel, setChannel] = useState("STABLE");
  const [minSupportedVersion, setMinSupportedVersion] = useState("");
  const [mandatory, setMandatory] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [checksumSha256, setChecksumSha256] = useState("");
  const [fileSize, setFileSize] = useState(12582912);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileSize(file.size);
    }
  };

  const handleSubmit = async () => {
    setValidationError(null);

    const trimmedVersion = version.trim();
    if (!trimmedVersion) {
      setValidationError("Nomor versi rilis wajib diisi");
      return;
    }

    if (!SemVer.isValid(trimmedVersion)) {
      setValidationError("Format versi tidak valid. Gunakan format SemVer seperti v2.2.2");
      return;
    }

    if (minSupportedVersion.trim() && !SemVer.isValid(minSupportedVersion.trim())) {
      setValidationError("Format versi minimal tidak valid. Gunakan format SemVer seperti v2.0.0");
      return;
    }

    const formData = new FormData();
    formData.append("version", trimmedVersion);
    formData.append("channel", channel);
    if (minSupportedVersion.trim()) {
      formData.append("minSupportedVersion", minSupportedVersion.trim());
    }
    formData.append("mandatory", String(mandatory));
    formData.append("releaseNotes", releaseNotes);
    if (downloadUrl.trim()) {
      formData.append("downloadUrl", downloadUrl.trim());
    }

    if (selectedFile) {
      formData.append("file", selectedFile);
    } else {
      // If manual hash entry
      formData.append(
        "checksumSha256",
        checksumSha256.trim() || "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
      );
      formData.append("fileSize", String(fileSize));
    }

    try {
      await onSubmit(formData);
      // Reset form
      setVersion("");
      setMinSupportedVersion("");
      setMandatory(false);
      setReleaseNotes("");
      setSelectedFile(null);
      setDownloadUrl("");
      setChecksumSha256("");
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setValidationError(err.message);
      } else {
        setValidationError("Gagal menambahkan rilis biner");
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Unggah Rilis Biner Engine Baru"
      subtitle="Publikasikan versi baru aksaventra_engine.exe untuk distribusi auto-updater"
      size="lg"
      submitText={loading ? "Menyimpan..." : "Publikasikan Rilis"}
      cancelText="Batal"
      submitDisabled={loading}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4 py-2">
        {validationError && (
          <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Nomor Versi Rilis (SemVer)*"
            placeholder="misal: v2.2.2"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            helperText="Gunakan format vX.Y.Z (standar Semantic Versioning)"
          />

          <SelectField
            label="Channel Distribusi*"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            <option value="STABLE">Stable (Produksi - Rekomendasi)</option>
            <option value="BETA">Beta (Uji Coba Pengguna)</option>
            <option value="NIGHTLY">Nightly (Pengembangan Aktif)</option>
          </SelectField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <TextField
            label="Versi Minimum Didukung (Opsional)"
            placeholder="misal: v2.0.0"
            value={minSupportedVersion}
            onChange={(e) => setMinSupportedVersion(e.target.value)}
            helperText="Klien dengan versi di bawah ini akan dipaksa update"
          />

          <div className="pt-2">
            <Checkbox
              name="mandatory"
              checked={mandatory}
              onChange={(e) => setMandatory(e.target.checked)}
              label="Tandai Sebagai Update Wajib (Mandatory)"
            />
            <p className="text-xs text-slate-400 pl-6 mt-1">
              Engine klien tidak dapat melanjutkan tanpa mengunduh pembaruan ini
            </p>
          </div>
        </div>

        <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/50">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Berkas Biner Mesin (aksaventra_engine.exe)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer">
              <FileUp className="w-4 h-4 text-blue-600" />
              <span>{selectedFile ? selectedFile.name : "Pilih Berkas Biner (.exe)"}</span>
              <input
                type="file"
                className="hidden"
                accept=".exe,.bin,application/octet-stream"
                onChange={handleFileChange}
              />
            </label>
            {selectedFile && (
              <span className="text-xs text-slate-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Checksum SHA-256 dan ukuran biner akan dihitung otomatis saat file diunggah.
          </p>
        </div>

        {!selectedFile && (
          <div className="space-y-4">
            <TextField
              label="URL Unduhan Biner (Opsional jika file di-host di S3 / CDN)"
              placeholder="misal: https://s3.amazonaws.com/aksaventra-releases/aksaventra_engine.exe"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              helperText="Tautan langsung unduhan biner"
            />

            <TextField
              label="Checksum SHA-256 Manual (Jika biner di-host di CDN eksternal)"
              placeholder="misal: 4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945"
              value={checksumSha256}
              onChange={(e) => setChecksumSha256(e.target.value)}
              helperText="64 karakter hex sha256 hash"
            />
          </div>
        )}

        <TextAreaField
          label="Catatan Rilis (Changelog / Release Notes)"
          placeholder="Jelaskan fitur baru, perbaikan bug, atau instruksi pembaruan..."
          rows={3}
          value={releaseNotes}
          onChange={(e) => setReleaseNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
};
