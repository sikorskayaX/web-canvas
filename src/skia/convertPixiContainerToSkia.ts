import type { Canvas, CanvasKit, Image, Paint, Path } from 'canvaskit-wasm'
import type { GraphicsData } from '@pixi/graphics'
import {
  Container,
  Graphics,
  SHAPES,
  Sprite,
  type Circle,
  type DisplayObject,
  type Ellipse,
  type Polygon,
  type Rectangle,
  type RoundedRectangle,
} from 'pixi.js-legacy'
import { ColorConverter } from '../utils/ColorConverter.ts'
import { applyPixiWorldTransform } from './applyPixiWorldTransform.ts'

const imageCache = new Map<number, Image>()

export function convertPixiContainerToSkia(
  container: Container,
  canvasKit: CanvasKit,
  skCanvas: Canvas,
): void {
  for (const child of container.children) {
    convertDisplayObject(child, canvasKit, skCanvas)
  }
}

function convertDisplayObject(
  obj: DisplayObject,
  canvasKit: CanvasKit,
  skCanvas: Canvas,
): void {
  if (!obj.visible) return

  if (obj instanceof Graphics) {
    drawWithWorldTransform(obj, canvasKit, skCanvas, convertGraphics)
    return
  }

  if (obj instanceof Sprite) { // Text rendered as raster bitmap in Pixi v7, handled here as Sprite
    drawWithWorldTransform(obj, canvasKit, skCanvas, convertSprite)
    return
  }


  if (obj instanceof Container) {
    for (const child of obj.children) {
      convertDisplayObject(child, canvasKit, skCanvas)
    }
  }
}

function drawWithWorldTransform<T extends DisplayObject>(
  obj: T,
  canvasKit: CanvasKit,
  skCanvas: Canvas,
  drawFunc: (obj: T, canvasKit: CanvasKit, skCanvas: Canvas) => void,
): void {
  skCanvas.save()
  applyPixiWorldTransform(skCanvas, obj)
  drawFunc(obj, canvasKit, skCanvas)
  skCanvas.restore()
}

function convertGraphics(
  graphics: Graphics,
  canvasKit: CanvasKit,
  skCanvas: Canvas,
): void {
  const graphicsData = graphics.geometry.graphicsData

  for (const data of graphicsData) {
    if (data.fillStyle.visible) {
      const paint = createFillPaint(
        canvasKit,
        data.fillStyle.color,
        data.fillStyle.alpha * graphics.worldAlpha,
      )
      drawShape(canvasKit, skCanvas, data.shape, paint)
      paint.delete()
    }

    if (data.lineStyle.visible && data.lineStyle.width > 0) {
      const paint = createStrokePaint(
        canvasKit,
        data.lineStyle.color,
        data.lineStyle.alpha * graphics.worldAlpha,
        data.lineStyle.width,
      )
      drawShape(canvasKit, skCanvas, data.shape, paint)
      paint.delete()
    }
  }
}

function convertSprite(
  sprite: Sprite,
  canvasKit: CanvasKit,
  skCanvas: Canvas,
): void {
  const skImage = getSkiaImage(canvasKit, sprite)
  if (!skImage) return

  const texture = sprite.texture
  const frame = texture.frame
  const { width: origW, height: origH } = texture.orig
  const paint = new canvasKit.Paint()
  paint.setAlphaf(sprite.worldAlpha)

  skCanvas.drawImageRect(
    skImage,
    canvasKit.XYWHRect(frame.x, frame.y, frame.width, frame.height),
    canvasKit.XYWHRect(
      -sprite.anchor.x * origW,
      -sprite.anchor.y * origH,
      origW,
      origH,
    ),
    paint,
  )

  paint.delete()
}

function getSkiaImage(canvasKit: CanvasKit, sprite: Sprite): Image | null {
  const baseTexture = sprite.texture.baseTexture
  const cached = imageCache.get(baseTexture.uid)
  if (cached) return cached

  const source = (baseTexture.resource as { source?: CanvasImageSource }).source
  if (!source) return null

  const image = canvasKit.MakeImageFromCanvasImageSource(source)
  if (!image) return null

  imageCache.set(baseTexture.uid, image)
  return image
}

function createFillPaint(canvasKit: CanvasKit, color: number, alpha: number): Paint {
  const paint = new canvasKit.Paint()
  paint.setColor(ColorConverter.toSkiaColor(canvasKit, color, alpha))
  paint.setStyle(canvasKit.PaintStyle.Fill)
  paint.setAntiAlias(true)
  return paint
}

function createStrokePaint(
  canvasKit: CanvasKit,
  color: number,
  alpha: number,
  width: number,
): Paint {
  const paint = new canvasKit.Paint()
  paint.setColor(ColorConverter.toSkiaColor(canvasKit, color, alpha))
  paint.setStyle(canvasKit.PaintStyle.Stroke)
  paint.setStrokeWidth(width)
  paint.setAntiAlias(true)
  return paint
}

function drawShape(
  canvasKit: CanvasKit,
  skCanvas: Canvas,
  shape: GraphicsData['shape'],
  paint: Paint,
): void {
  switch (shape.type) {
    case SHAPES.RECT: {
      const rect = shape as Rectangle
      skCanvas.drawRect(
        canvasKit.LTRBRect(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height),
        paint,
      )
      return
    }

    case SHAPES.CIRC: {
      const circle = shape as Circle
      skCanvas.drawCircle(circle.x, circle.y, circle.radius, paint)
      return
    }

    case SHAPES.ELIP: {
      const ellipse = shape as Ellipse
      skCanvas.drawOval(
        canvasKit.LTRBRect(
          ellipse.x - ellipse.width,
          ellipse.y - ellipse.height,
          ellipse.x + ellipse.width,
          ellipse.y + ellipse.height,
        ),
        paint,
      )
      return
    }

    case SHAPES.RREC: {
      const roundRect = shape as RoundedRectangle
      skCanvas.drawRRect(
        canvasKit.RRectXY(
          canvasKit.XYWHRect(roundRect.x, roundRect.y, roundRect.width, roundRect.height),
          roundRect.radius,
          roundRect.radius,
        ),
        paint,
      )
      return
    }

    case SHAPES.POLY: {
      const polygon = shape as Polygon
      const path = createPolygonPath(canvasKit, polygon)
      skCanvas.drawPath(path, paint)
      path.delete()
    }
  }
}

function createPolygonPath(canvasKit: CanvasKit, polygon: Polygon): Path {
  const builder = new canvasKit.PathBuilder()
  builder.addPolygon(polygon.points, polygon.closeStroke)
  const path = builder.detach()
  builder.delete()
  return path
}
