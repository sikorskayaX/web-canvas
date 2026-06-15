import { Application } from 'pixi.js-legacy'
import {
  CANVAS_BACKGROUND_COLOR,
  type CanvasSize,
  DOM_IDS,
  PIXI_APP_OPTIONS,
} from '../config/index.ts'
import { CanvasSizeCalculator, MathRandomProvider } from '../utils/index.ts'
import { PdfExporter } from '../pdf/index.ts'
import { createDemoScene, StagePointerBinder } from '../pixi/index.ts'
import { RandomShapeFactory } from '../pixi/shapes/index.ts'
import { loadCanvasKit, SkiaRenderer, SkiaCanvasPointerBinder } from '../skia/index.ts'
import { ControlsBinder } from '../ui/index.ts'

export class App {
  private readonly canvasSize: CanvasSize
  private readonly randomShapeFactory: RandomShapeFactory
  private pdfExporter!: PdfExporter

  constructor() {
    this.canvasSize = CanvasSizeCalculator.compute()
    this.randomShapeFactory = new RandomShapeFactory(new MathRandomProvider(), this.canvasSize)
  }

  async run(): Promise<void> {
    // --- Pixi canvas ---
    const pixiRoot = this.requireElement(DOM_IDS.pixiRoot)
    const pixiApp = this.createPixiApp()
    this.mountCanvas(pixiRoot, pixiApp.view as HTMLCanvasElement)
    pixiApp.stage.addChild(createDemoScene(this.canvasSize))
    new StagePointerBinder().bind(pixiApp.stage)

    // PDF exporter (needs a reference to the scene)
    this.pdfExporter = new PdfExporter(pixiApp.stage, this.canvasSize)

    // --- Skia canvas ---
    const skiaRoot = this.requireElement(DOM_IDS.skiaRoot)
    const skiaCanvas = this.createSkiaCanvas()
    this.mountCanvas(skiaRoot, skiaCanvas)
    const canvasKit = await loadCanvasKit()
    const skiaRenderer = new SkiaRenderer(canvasKit, skiaCanvas)

    // Render both canvases
    const syncSkiaFromPixi = (): void => {
      pixiApp.renderer.render(pixiApp.stage)
      skiaRenderer.renderFromPixi(pixiApp.stage)
    }

    syncSkiaFromPixi()

    // Bind pointer events on Skia canvas (hit-test delegates to Pixi)
    new SkiaCanvasPointerBinder(skiaCanvas, pixiApp, skiaRenderer).bind()

    // Wire up control buttons
    new ControlsBinder({
      onRandomShape: () => {
        this.randomShapeFactory.createAndAddTo(pixiApp.stage)
        syncSkiaFromPixi()
      },
      onClearCanvas: () => {
        this.clearPixiStage(pixiApp)
        skiaRenderer.clear()
      },
      onExportPdf: () => {
        void this.pdfExporter.export()
      },
    }).bind()
  }

  private clearPixiStage(pixiApp: Application): void {
    pixiApp.stage.removeChildren().forEach((child) => {
      child.destroy({ children: true })
    })
  }

  private createPixiApp(): Application {
    return new Application({
      width: this.canvasSize.width,
      height: this.canvasSize.height,
      backgroundColor: CANVAS_BACKGROUND_COLOR,
      forceCanvas: PIXI_APP_OPTIONS.forceCanvas,
      antialias: PIXI_APP_OPTIONS.antialias,
    })
  }

  private createSkiaCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = this.canvasSize.width
    canvas.height = this.canvasSize.height
    canvas.className = 'skia-canvas'
    return canvas
  }

  private mountCanvas(root: HTMLElement, canvas: HTMLCanvasElement): void {
    root.appendChild(canvas)
  }

  private requireElement(id: string): HTMLElement {
    const element = document.getElementById(id)
    if (!element) {
      throw new Error(`Element #${id} not found`)
    }
    return element
  }
}
