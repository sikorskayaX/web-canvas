import type { CanvasKit } from 'canvaskit-wasm'

export class ColorConverter {
  static toCssHex(color: number): string {
    return `#${color.toString(16).padStart(6, '0')}`
  }

  static adjustBrightness(color: number, delta: number): string {
    const red = ColorConverter.clampChannel(((color >> 16) & 0xff) + delta)
    const green = ColorConverter.clampChannel(((color >> 8) & 0xff) + delta)
    const blue = ColorConverter.clampChannel((color & 0xff) + delta)

    return ColorConverter.toCssHex((red << 16) | (green << 8) | blue)
  }

  static toSkiaColor(canvasKit: CanvasKit, color: number, alpha: number) {
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff  
    return canvasKit.Color(r, g, b, alpha)
  }

  private static clampChannel(value: number): number {
    return Math.min(255, Math.max(0, value))
  }
}
