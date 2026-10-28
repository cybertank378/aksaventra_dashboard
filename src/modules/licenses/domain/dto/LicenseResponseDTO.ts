/**
 * Response DTO contract expected by aksaventra_engine client binary
 */
export interface ValidateLicenseSuccessResponseDTO {
  valid: true;
  message: string;
  client_name: string;
  vault_secret: string;
  expires_at?: number; // UNIX epoch timestamp in seconds
}

export interface ValidateLicenseErrorResponseDTO {
  valid: false;
  message: string;
}

export type ValidateLicenseResponseDTO =
  | ValidateLicenseSuccessResponseDTO
  | ValidateLicenseErrorResponseDTO;
