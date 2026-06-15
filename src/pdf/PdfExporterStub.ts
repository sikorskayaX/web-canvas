import type { IPdfExporter } from './IPdfExporter.ts'

export class PdfExporterStub implements IPdfExporter {
  async export(): Promise<void> {
    // TODO: implement with Skia PDF backend
    console.warn('PDF export is not yet implemented')
  }
}
