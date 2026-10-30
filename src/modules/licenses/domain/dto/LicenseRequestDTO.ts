/**
 * Request DTO for validating engine license from aksaventra_engine
 */
export interface ValidateLicenseRequestDTO {
  serial_key: string;
  hwid: string;
  engine_version?: string;
  public_ip?: string;
  clientIp?: string;
  userAgent?: string;
}
