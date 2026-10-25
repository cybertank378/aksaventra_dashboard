import type { BaseUseCase } from "./BaseUseCase";
import type { FileStorageInterface, StoredFileResult } from "./ports/FileStorageInterface";

export interface UploadFileInput {
  file: Buffer | Uint8Array;
  filename: string;
  mimeType: string;
  destinationPath?: string;
}

export abstract class BaseUploadUseCase<TOutput = StoredFileResult>
  implements BaseUseCase<UploadFileInput, TOutput>
{
  protected constructor(protected readonly storage: FileStorageInterface) {}

  abstract execute(input: UploadFileInput): Promise<TOutput>;

  protected validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  protected validateFileSize(sizeBytes: number, maxBytes: number): boolean {
    return sizeBytes <= maxBytes;
  }
}
