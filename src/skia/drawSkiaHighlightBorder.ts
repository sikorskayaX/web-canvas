import type { Canvas, CanvasKit } from 'canvaskit-wasm'
import type { DisplayObject } from 'pixi.js-legacy'
import { ColorConverter } from '../utils/ColorConverter.ts'
import { HIGHLIGHT_BORDER, getPaddedHighlightRect } from '../utils/HighlightBorder.ts'
import { applyPixiWorldTransform } from './applyPixiWorldTransform.ts'

export function drawSkiaHighlightBorder(
  target: DisplayObject,
  canvasKit: CanvasKit,
  skCanvas: Canvas,
): void {
  const rect = getPaddedHighlightRect(target.getLocalBounds())

  skCanvas.save()
  applyPixiWorldTransform(skCanvas, target)

  const paint = new canvasKit.Paint()
  paint.setStyle(canvasKit.PaintStyle.Stroke)
  paint.setStrokeWidth(HIGHLIGHT_BORDER.width)
  paint.setColor(
    ColorConverter.toSkiaColor(canvasKit, HIGHLIGHT_BORDER.color, HIGHLIGHT_BORDER.alpha),
  )
  paint.setAntiAlias(true)

  skCanvas.drawRect(
    canvasKit.LTRBRect(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height),
    paint,
  )

  paint.delete()
  skCanvas.restore()
}
