import type { Graphics } from 'pixi.js-legacy'
import { RANDOM_SHAPE_RANGES } from '../../config/random-shape.config.ts'
import { BaseShapeBuilder } from './BaseShapeBuilder.ts'
import type { ShapeBuildContext } from './ShapeBuildContext.ts'
import { ShapeType } from './ShapeType.ts'

export class TriangleShapeBuilder extends BaseShapeBuilder {
  readonly type = ShapeType.Triangle

  protected draw(graphics: Graphics, color: number, context: ShapeBuildContext): void {
    const size = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.triangle.size.min,
      RANDOM_SHAPE_RANGES.triangle.size.max,
    )
    const half = size / 2

    // Main triangle
    graphics.beginFill(color)
    graphics.drawPolygon([0, -half, -half, half, half, half])
    graphics.endFill()

    // Inverted inner triangle cut-out
    const inset = half * 0.35
    graphics.beginFill(0xffffff, 0.12)
    graphics.drawPolygon([0, -inset, -inset, half * 0.5, inset, half * 0.5])
    graphics.endFill()

    // Stroke
    const sw = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.triangle.strokeWidth.min,
      RANDOM_SHAPE_RANGES.triangle.strokeWidth.max,
    )
    if (sw > 1) {
      graphics.lineStyle(sw, 0xffffff, 0.35)
      graphics.drawPolygon([0, -half, -half, half, half, half])
    }
  }
}
