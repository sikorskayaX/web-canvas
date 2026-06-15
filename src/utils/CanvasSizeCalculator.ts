import { CANVAS_LAYOUT, type CanvasSize } from '../config/canvas.config.ts'

export class CanvasSizeCalculator {
  static compute(): CanvasSize {
    const { pagePaddingX, gapBetweenCanvases, aspectWidth, aspectHeight } = CANVAS_LAYOUT

    const root = document.documentElement
    root.style.setProperty('--page-padding-x', `${pagePaddingX}px`)
    root.style.setProperty('--canvas-gap', `${gapBetweenCanvases}px`)

    const availableWidth = window.innerWidth - pagePaddingX * 2
    const width = Math.floor((availableWidth - gapBetweenCanvases) / 2)
    const height = Math.floor((width * aspectHeight) / aspectWidth)

    return { width, height }
  }
}
