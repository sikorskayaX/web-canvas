export const HIGHLIGHT_BORDER = {
  color: 0xff0000,
  width: 2,
  padding: 3,
  alpha: 1,
} as const

export type BoundsRect = Readonly<{
  x: number
  y: number
  width: number
  height: number
}>

export function getPaddedHighlightRect(bounds: BoundsRect): BoundsRect {
  const padding = HIGHLIGHT_BORDER.padding

  return {
    x: bounds.x - padding,
    y: bounds.y - padding,
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2,
  }
}
