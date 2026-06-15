import type { Graphics } from 'pixi.js-legacy'
import { RANDOM_SHAPE_RANGES } from '../../config/random-shape.config.ts'
import { drawLineSegment } from './drawLineSegment.ts'
import { BaseShapeBuilder } from './BaseShapeBuilder.ts'
import type { ShapeBuildContext } from './ShapeBuildContext.ts'
import { ShapeType } from './ShapeType.ts'

export class LineShapeBuilder extends BaseShapeBuilder {
  readonly type = ShapeType.Line

  protected draw(graphics: Graphics, _color: number, context: ShapeBuildContext): void {
    const endX = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.line.endX.min,
      RANDOM_SHAPE_RANGES.line.endX.max,
    )
    const endY = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.line.endY.min,
      RANDOM_SHAPE_RANGES.line.endY.max,
    )
    const lw = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.line.width.min,
      RANDOM_SHAPE_RANGES.line.width.max,
    )

    // Main line
    const color = context.random.nextColor()
    drawLineSegment({
      graphics,
      x1: 0,
      y1: 0,
      x2: endX,
      y2: endY,
      lineWidth: lw,
      color,
      alpha: 0.9,
    })

    // Thin companion line (parallel-ish accent)
    const thinColor = context.random.nextColor()
    const offsetX = lw * 1.4 * (context.random.nextNumber() > 0.5 ? 1 : -1)
    const offsetY = lw * 1.4 * (context.random.nextNumber() > 0.5 ? 1 : -1)
    drawLineSegment({
      graphics,
      x1: offsetX,
      y1: offsetY,
      x2: endX + offsetX,
      y2: endY + offsetY,
      lineWidth: Math.max(2, lw * 0.3),
      color: thinColor,
      alpha: 0.4,
    })
  }
}
