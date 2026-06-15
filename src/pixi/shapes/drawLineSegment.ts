import { Graphics } from 'pixi.js-legacy'

export type LineSegmentOptions = Readonly<{
  graphics: Graphics
  x1: number
  y1: number
  x2: number
  y2: number
  lineWidth: number
  color: number
  alpha?: number
}>

const HIT_TOLERANCE_PX = 2

export function drawLineSegment(options: LineSegmentOptions): void {
  const { graphics, x1, y1, x2, y2, lineWidth, color, alpha = 1 } = options

  graphics.lineStyle(lineWidth, color, alpha).moveTo(x1, y1).lineTo(x2, y2)

  const hitRadius = lineWidth / 2 + HIT_TOLERANCE_PX
  graphics.hitArea = {
    contains(x: number, y: number): boolean {
      return distanceToSegment(x, y, x1, y1, x2, y2) <= hitRadius
    },
  }
}

function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lengthSq = dx * dx + dy * dy

  if (lengthSq === 0) {
    return Math.hypot(px - x1, py - y1)
  }

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq))
  const projX = x1 + t * dx
  const projY = y1 + t * dy

  return Math.hypot(px - projX, py - projY)
}
