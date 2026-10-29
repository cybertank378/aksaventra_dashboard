export interface PdfDocumentOptions {
  title: string;
  author?: string;
  content: string;
}

export class PdfAdapter {
  /**
   * PDF Document adapter interface.
   * Can be integrated with pdfkit or @react-pdf/renderer.
   */
  public static async generateMockPdfBuffer(options: PdfDocumentOptions): Promise<Buffer> {
    const rawContent = `%PDF-1.4\n% Title: ${options.title}\n% Author: ${options.author ?? "Aksaventra"}\n${options.content}\n%%EOF`;
    return Buffer.from(rawContent, "utf-8");
  }
}
