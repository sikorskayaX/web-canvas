import type { Container, DisplayObject } from 'pixi.js-legacy'
import type { CanvasKit, Surface } from 'canvaskit-wasm'
import { CANVAS_BACKGROUND_COLOR } from '../config/canvas.config.ts'
import { ColorConverter } from '../utils/ColorConverter.ts'
import { convertPixiContainerToSkia } from './convertPixiContainerToSkia.ts'
import { drawSkiaHighlightBorder } from './drawSkiaHighlightBorder.ts'

export class SkiaRenderer {
  private readonly canvasKit: CanvasKit
  private surface: Surface | null = null
  private highlightTarget: DisplayObject | null = null

  constructor(
    canvasKit: CanvasKit,
    canvas: HTMLCanvasElement,
  ) {
    this.canvasKit = canvasKit
    this.surface = canvasKit.MakeWebGLCanvasSurface(canvas) // Bind Skia surface to the DOM canvas
    if (!this.surface) {
      throw new Error('Failed to create Skia surface')
    }
  }

  setHighlight(target: DisplayObject | null): void {
    this.highlightTarget = target
  }

  clearHighlight(): void {
    this.highlightTarget = null
  }

  renderFromPixi(container: Container): void {
    if (!this.surface) return

    const skCanvas = this.surface.getCanvas()
    skCanvas.clear(
      ColorConverter.toSkiaColor(this.canvasKit, CANVAS_BACKGROUND_COLOR, 1),
    )
    convertPixiContainerToSkia(container, this.canvasKit, skCanvas)

    if (this.highlightTarget) {
      drawSkiaHighlightBorder(this.highlightTarget, this.canvasKit, skCanvas)
    }

    this.surface.flush()
  }

  clear(): void {
    if (!this.surface) return
    this.highlightTarget = null
    this.surface
      .getCanvas()
      .clear(ColorConverter.toSkiaColor(this.canvasKit, CANVAS_BACKGROUND_COLOR, 1))
    this.surface.flush()
  }

}
