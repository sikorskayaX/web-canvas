import { DOM_IDS } from '../config/dom.config.ts'
import type { ControlActions } from './ControlActions.ts'

export class ControlsBinder {
  private readonly actions: ControlActions

  constructor(actions: ControlActions) {
    this.actions = actions
  }

  bind(): void {
    const randomShapeButton = this.requireButton(DOM_IDS.randomShapeButton)
    const clearCanvasButton = this.requireButton(DOM_IDS.clearCanvasButton)
    const exportPdfButton = this.requireButton(DOM_IDS.exportPdfButton)

    randomShapeButton.addEventListener('click', () => {
      this.actions.onRandomShape()
    })

    clearCanvasButton.addEventListener('click', () => {
      this.actions.onClearCanvas()
    })

    exportPdfButton.addEventListener('click', () => {
      void this.actions.onExportPdf()
    })
  }

  private requireButton(id: string): HTMLButtonElement {
    const button = document.getElementById(id)
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error(`Button #${id} not found`)
    }
    return button
  }
}
