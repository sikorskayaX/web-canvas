import type { Graphics } from 'pixi.js-legacy'
import { RANDOM_SHAPE_RANGES } from '../../config/random-shape.config.ts'
import { BaseShapeBuilder } from './BaseShapeBuilder.ts'
import type { ShapeBuildContext } from './ShapeBuildContext.ts'
import { ShapeType } from './ShapeType.ts'

export class PolygonShapeBuilder extends BaseShapeBuilder {
  readonly type = ShapeType.Polygon

  protected draw(graphics: Graphics, color: number, context: ShapeBuildContext): void {
    const vertexCount = Math.floor(
      context.random.nextNumberInRange(
        RANDOM_SHAPE_RANGES.polygon.vertexCount.min,
        RANDOM_SHAPE_RANGES.polygon.vertexCount.max + 1,
      ),
    )
    const radius = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.polygon.radius.min,
      RANDOM_SHAPE_RANGES.polygon.radius.max,
    )
    const points = this.buildVertices(vertexCount, radius)

    // Fill
    graphics.beginFill(color)
    graphics.drawPolygon(points)
    graphics.endFill()

    // Inner ghost polygon
    const innerPoints = this.buildVertices(vertexCount, radius * 0.55)
    graphics.beginFill(0xffffff, 0.12)
    graphics.drawPolygon(innerPoints)
    graphics.endFill()

    // Stroke
    const sw = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.polygon.strokeWidth.min,
      RANDOM_SHAPE_RANGES.polygon.strokeWidth.max,
    )
    if (sw > 1) {
      graphics.lineStyle(sw, this.brightEdge(color), 0.55)
      graphics.drawPolygon(points)
    }
  }

  private buildVertices(count: number, radius: number): number[] {
    const pts: number[] = []
    const step = (Math.PI * 2) / count
    const start = -Math.PI / 2
    for (let i = 0; i < count; i++) {
      const a = start + step * i
      pts.push(Math.cos(a) * radius, Math.sin(a) * radius)
    }
    return pts
  }

  private brightEdge(color: number): number {
    const clamp = (v: number) => Math.min(255, v + 60)
    const r = clamp((color >> 16) & 0xff)
    const g = clamp((color >> 8) & 0xff)
    const b = clamp(color & 0xff)
    return (r << 16) | (g << 8) | b
  }
}
