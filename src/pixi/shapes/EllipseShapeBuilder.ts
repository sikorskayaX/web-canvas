import type { Graphics } from 'pixi.js-legacy'
import { RANDOM_SHAPE_RANGES } from '../../config/random-shape.config.ts'
import { BaseShapeBuilder } from './BaseShapeBuilder.ts'
import type { ShapeBuildContext } from './ShapeBuildContext.ts'
import { ShapeType } from './ShapeType.ts'

export class EllipseShapeBuilder extends BaseShapeBuilder {
  readonly type = ShapeType.Ellipse

  protected draw(graphics: Graphics, color: number, context: ShapeBuildContext): void {
    const rx = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.ellipse.radiusX.min,
      RANDOM_SHAPE_RANGES.ellipse.radiusX.max,
    )
    const ry = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.ellipse.radiusY.min,
      RANDOM_SHAPE_RANGES.ellipse.radiusY.max,
    )

    // Main fill
    graphics.beginFill(color)
    graphics.drawEllipse(0, 0, rx, ry)
    graphics.endFill()

    // Inner accent ellipse (smaller, complementary colour)
    const innerRx = rx * 0.45
    const innerRy = ry * 0.45
    graphics.beginFill(0xffffff, 0.15)
    graphics.drawEllipse(rx * 0.15, -ry * 0.15, innerRx, innerRy)
    graphics.endFill()

    // Stroke
    const sw = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.ellipse.strokeWidth.min,
      RANDOM_SHAPE_RANGES.ellipse.strokeWidth.max,
    )
    if (sw > 1) {
      graphics.lineStyle(sw, this.darken(color), 0.5)
      graphics.drawEllipse(0, 0, rx, ry)
    }
  }

  private darken(color: number): number {
    const r = Math.max(0, ((color >> 16) & 0xff) - 50)
    const g = Math.max(0, ((color >> 8) & 0xff) - 50)
    const b = Math.max(0, (color & 0xff) - 50)
    return (r << 16) | (g << 8) | b
  }
}
