export const CANVAS_BACKGROUND_COLOR = 0xf5f5f5

export const CANVAS_LAYOUT = {
  pagePaddingX: 16,
  gapBetweenCanvases: 16,
  aspectWidth: 3,
  aspectHeight: 2,
} as const

export type CanvasSize = Readonly<{
  width: number
  height: number
}>
