export interface StoredFileResult {
  fileId: string;
  filename: string;
  path: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: Date;
}

export interface FileStorageInterface {
  upload(
    file: Buffer | Uint8Array,
    filename: string,
    mimeType: string,
    destinationPath?: string,
  ): Promise<StoredFileResult>;

  delete(filePath: string): Promise<boolean>;

  getUrl(filePath: string): Promise<string>;

  download(filePath: string): Promise<Buffer>;
}
