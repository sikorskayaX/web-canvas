import type { Container, DisplayObject, GraphicsData as PixiGraphicsData } from 'pixi.js-legacy'
import {
  Container as PixiContainer,
  Graphics,
  SHAPES,
  Sprite,
} from 'pixi.js-legacy'
import type { CanvasSize } from '../config/canvas.config.ts'
import type { IPdfExporter } from './IPdfExporter.ts'
import type {
  Circle,
  Ellipse,
  Polygon,
  Rectangle,
  RoundedRectangle,
} from 'pixi.js-legacy'

type GraphicsData = PixiGraphicsData

/**
 * PdfExporter converts a PixiJS scene tree into a vector PDF via jsPDF.
 *
 * - Graphics objects → vector paths (filled / stroked)
 * - Sprite objects   → embedded PNG bitmaps
 * - Containers       → recursion with affine transform
 *
 * Coordinate system:
 *   PixiJS → Y axis points DOWN, origin at top-left
 *   PDF    → Y axis points UP,   origin at bottom-left
 *
 * To reconcile, each leaf node applies a Y-flip transform AFTER all
 * Pixi world-transform matrices are composed. This means:
 *   CTM = Y_flip × M_pixi_gfx × M_pixi_container × … × identity
 *
 * NOTE: This currently uses jsPDF as the PDF backend.
 * To use Skia's native PDF backend (which requires a custom
 * CanvasKit WASM build with skia_enable_pdf=true), replace the
 * drawing logic below with CanvasKit's SkDocument API.
 */
export class PdfExporter implements IPdfExporter {
  constructor(
    private readonly scene: Container,
    private readonly canvasSize: CanvasSize,
  ) {}

  async export(): Promise<void> {
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF({
      orientation: this.canvasSize.width > this.canvasSize.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [this.canvasSize.width, this.canvasSize.height],
      compress: true,
    }) as any

    this.renderNode(doc, this.scene)

    doc.save('canvas-scene.pdf')
  }

  // ── Tree walker ──

  private renderNode(doc: any, obj: DisplayObject): void {
    if (!obj.visible) return

    // Container (non-leaf) — recurse, do NOT apply Y-flip here
    if (obj instanceof PixiContainer && !(obj instanceof Graphics) && !(obj instanceof Sprite)) {
      doc.saveGraphicsState()
      this.applyPixiWorldTransform(doc, obj)
      for (let i = 0; i < obj.children.length; i++) {
        this.renderNode(doc, obj.children[i])
      }
      doc.restoreGraphicsState()
      return
    }

    // Graphics leaf — draw vector paths
    if (obj instanceof Graphics) {
      doc.saveGraphicsState()
      this.applyPixiWorldTransform(doc, obj)
      // Flip Y: Pixi Y-down → PDF Y-up. Applied after the Pixi transform
      // so that world-space coordinates are correctly mapped to the page.
      this.applyYFlipToPage(doc)
      this.renderGraphics(doc, obj)
      doc.restoreGraphicsState()
      return
    }

    // Sprite leaf — embed bitmap
    if (obj instanceof Sprite) {
      doc.saveGraphicsState()
      this.applyPixiWorldTransform(doc, obj)
      this.applyYFlipToPage(doc)
      this.renderSprite(doc, obj)
      doc.restoreGraphicsState()
      return
    }
  }

  // ── Pixi affine transform ──

  private applyPixiWorldTransform(doc: any, obj: DisplayObject): void {
    const m = obj.worldTransform
    doc.setCurrentTransformationMatrix(
      new doc.internal.Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty),
    )
  }

  /** Flip Y so that Pixi coordinates (Y-down) map to PDF (Y-up). */
  private applyYFlipToPage(doc: any): void {
    doc.setCurrentTransformationMatrix(
      new doc.internal.Matrix(1, 0, 0, -1, 0, this.canvasSize.height),
    )
  }

  // ── Graphics → vector paths ──

  private renderGraphics(doc: any, gfx: Graphics): void {
    const dataList: GraphicsData[] = (gfx.geometry as any).graphicsData
    if (!dataList) return

    const globalAlpha = gfx.worldAlpha

    for (const data of dataList) {
      if (data.fillStyle?.visible) {
        const fill = data.fillStyle
        const [r, g, b] = this.hexToRgb(fill.color)
        doc.setFillColor(r, g, b)
        if (fill.alpha * globalAlpha < 0.999) {
          doc.setGState(new doc.GState({ opacity: fill.alpha * globalAlpha }))
        }
        this.drawShape(doc, data, 'F')
      }

      if (data.lineStyle?.visible && data.lineStyle.width > 0) {
        const stroke = data.lineStyle
        const [r, g, b] = this.hexToRgb(stroke.color)
        doc.setDrawColor(r, g, b)
        doc.setLineWidth(stroke.width)
        if (stroke.alpha * globalAlpha < 0.999) {
          doc.setGState(new doc.GState({ opacity: stroke.alpha * globalAlpha }))
        }
        this.drawShape(doc, data, 'S')
      }
    }
  }

  // ── Shape dispatcher ──

  private drawShape(doc: any, data: GraphicsData, style: 'F' | 'S'): void {
    const shape = data.shape

    switch ((shape as any).type) {
      case SHAPES.RECT: {
        const r = shape as Rectangle
        doc.rect(r.x, r.y, r.width, r.height, style)
        doc.discardPath()
        return
      }

      case SHAPES.CIRC: {
        const c = shape as Circle
        doc.circle(c.x, c.y, c.radius, style)
        doc.discardPath()
        return
      }

      case SHAPES.ELIP: {
        const e = shape as Ellipse
        doc.ellipse(e.x, e.y, e.width, e.height, style)
        doc.discardPath()
        return
      }

      case SHAPES.RREC: {
        const rr = shape as RoundedRectangle
        this.drawRoundedRectPath(doc, rr.x, rr.y, rr.width, rr.height, rr.radius, style)
        return
      }

      case SHAPES.POLY: {
        const poly = shape as Polygon
        this.drawPolygonPath(doc, poly.points, poly.closeStroke, style)
        return
      }

      default:
        console.warn('PdfExporter: unsupported shape type', (shape as any).type)
    }
  }

  // ── Custom path builders ──

  private drawRoundedRectPath(
    doc: any,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    style: 'F' | 'S',
  ): void {
    const rClamped = Math.min(r, w / 2, h / 2)

    if (rClamped <= 0) {
      doc.rect(x, y, w, h, style)
      doc.discardPath()
      return
    }

    // Walk the rounded rectangle outline via line segments
    doc.moveTo(x + rClamped, y)
    doc.lineTo(x + w - rClamped, y)
    this.pdfArcSegments(doc, x + w - rClamped, y + rClamped, rClamped, -Math.PI / 2, 0)
    doc.lineTo(x + w, y + h - rClamped)
    this.pdfArcSegments(doc, x + w - rClamped, y + h - rClamped, rClamped, 0, Math.PI / 2)
    doc.lineTo(x + rClamped, y + h)
    this.pdfArcSegments(doc, x + rClamped, y + h - rClamped, rClamped, Math.PI / 2, Math.PI)
    doc.lineTo(x, y + rClamped)
    this.pdfArcSegments(doc, x + rClamped, y + rClamped, rClamped, Math.PI, (3 * Math.PI) / 2)

    // Close back to start
    doc.lineTo(x + rClamped, y)

    if (style === 'F') doc.fill()
    else doc.stroke()
    doc.discardPath()
  }

  /** Approximate a circular arc with small line segments. */
  private pdfArcSegments(
    doc: any,
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ): void {
    const steps = 4
    const angleStep = (endAngle - startAngle) / steps
    for (let i = 1; i <= steps; i++) {
      const a = startAngle + angleStep * i
      doc.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    }
  }

  private drawPolygonPath(
    doc: any,
    points: number[],
    closeStroke: boolean,
    style: 'F' | 'S',
  ): void {
    if (points.length < 2) return

    doc.moveTo(points[0], points[1])
    for (let i = 2; i < points.length; i += 2) {
      doc.lineTo(points[i], points[i + 1])
    }

    if (closeStroke && style === 'S') {
      doc.lineTo(points[0], points[1])
    }

    if (style === 'F') doc.fill()
    else doc.stroke()
    doc.discardPath()
  }

  // ── Sprites → embedded bitmap ──

  private renderSprite(doc: any, sprite: Sprite): void {
    const orig = sprite.texture.orig
    const source = this.getSpriteSource(sprite)
    if (!source) return

    const dw = orig.width * sprite.scale.x
    const dh = orig.height * sprite.scale.y
    const dx = -sprite.anchor.x * orig.width * sprite.scale.x
    const dy = -sprite.anchor.y * orig.height * sprite.scale.y

    // addImage with Y-flip active: the image is drawn in Pixi's local
    // Y-down space and flipped to PDF's Y-up space via the CTM.
    doc.addImage(source, 'PNG', dx, dy, dw, dh, undefined, 'SLOW', sprite.angle)
  }

  private getSpriteSource(sprite: Sprite): HTMLCanvasElement | HTMLImageElement | string | null {
    const bt = sprite.texture.baseTexture
    const res = (bt.resource as any)

    if (res?.source instanceof HTMLCanvasElement) return res.source
    if (res?.source instanceof HTMLImageElement) return res.source

    // Fallback: rasterise to a temporary canvas
    const canvas = document.createElement('canvas')
    canvas.width = sprite.texture.orig.width
    canvas.height = sprite.texture.orig.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    try {
      ctx.drawImage(res?.source as CanvasImageSource, 0, 0)
    } catch {
      return null
    }
    return canvas
  }

  // ── Colour helpers ──

  private hexToRgb(color: number): [number, number, number] {
    return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff]
  }
}
