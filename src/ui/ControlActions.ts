export type ControlActions = Readonly<{
  onRandomShape: () => void
  onClearCanvas: () => void
  onExportPdf: () => void | Promise<void>
}>
