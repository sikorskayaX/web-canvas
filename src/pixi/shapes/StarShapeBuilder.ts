import type { Graphics } from 'pixi.js-legacy'
import { RANDOM_SHAPE_RANGES } from '../../config/random-shape.config.ts'
import { BaseShapeBuilder } from './BaseShapeBuilder.ts'
import type { ShapeBuildContext } from './ShapeBuildContext.ts'
import { ShapeType } from './ShapeType.ts'

export class StarShapeBuilder extends BaseShapeBuilder {
  readonly type = ShapeType.Star

  protected draw(graphics: Graphics, color: number, context: ShapeBuildContext): void {
    const points = Math.floor(
      context.random.nextNumberInRange(
        RANDOM_SHAPE_RANGES.star.points.min,
        RANDOM_SHAPE_RANGES.star.points.max + 1,
      ),
    )
    const outerR = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.star.outerRadius.min,
      RANDOM_SHAPE_RANGES.star.outerRadius.max,
    )
    const innerR = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.star.innerRadius.min,
      RANDOM_SHAPE_RANGES.star.innerRadius.max,
    )
    const verts = this.buildStarVertices(points, outerR, innerR)

    // Fill
    graphics.beginFill(color)
    graphics.drawPolygon(verts)
    graphics.endFill()

    // Inner ghost star
    const innerVertices = this.buildStarVertices(
      points,
      outerR * 0.5,
      innerR * 0.5,
    )
    graphics.beginFill(0xffffff, 0.12)
    graphics.drawPolygon(innerVertices)
    graphics.endFill()

    // Stroke
    const sw = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.star.strokeWidth.min,
      RANDOM_SHAPE_RANGES.star.strokeWidth.max,
    )
    if (sw > 1) {
      graphics.lineStyle(sw, this.golden(color), 0.55)
      graphics.drawPolygon(verts)
    }
  }

  private buildStarVertices(
    spikes: number,
    outerR: number,
    innerR: number,
  ): number[] {
    const pts: number[] = []
    const step = Math.PI / spikes
    const start = -Math.PI / 2

    for (let i = 0; i < spikes; i++) {
      const outerAngle = start + step * 2 * i
      pts.push(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR)

      const innerAngle = start + step * (2 * i + 1)
      pts.push(Math.cos(innerAngle) * innerR, Math.sin(innerAngle) * innerR)
    }

    return pts
  }

  private golden(color: number): number {
    const r = ((color >> 16) & 0xff) * 0.7 + 80
    const g = ((color >> 8) & 0xff) * 0.7 + 80
    const b = (color & 0xff) * 0.7 + 80
    return (
      (Math.min(255, Math.round(r)) << 16) |
      (Math.min(255, Math.round(g)) << 8) |
      Math.min(255, Math.round(b))
    )
  }
}
