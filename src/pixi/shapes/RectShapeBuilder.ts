import type { Graphics } from 'pixi.js-legacy'
import { RANDOM_SHAPE_RANGES } from '../../config/random-shape.config.ts'
import { BaseShapeBuilder } from './BaseShapeBuilder.ts'
import type { ShapeBuildContext } from './ShapeBuildContext.ts'
import { ShapeType } from './ShapeType.ts'

export class RectShapeBuilder extends BaseShapeBuilder {
  readonly type = ShapeType.Rect

  protected draw(graphics: Graphics, color: number, context: ShapeBuildContext): void {
    const w = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.rect.width.min,
      RANDOM_SHAPE_RANGES.rect.width.max,
    )
    const h = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.rect.height.min,
      RANDOM_SHAPE_RANGES.rect.height.max,
    )
    const r = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.rect.radius.min,
      RANDOM_SHAPE_RANGES.rect.radius.max,
    )

    // Fill
    graphics.beginFill(color)

    // Rounded rect or sharp rect
    if (r > 2) {
      graphics.drawRoundedRect(-w / 2, -h / 2, w, h, r)
    } else {
      graphics.drawRect(-w / 2, -h / 2, w, h)
    }

    graphics.endFill()

    // Stroke (if rolls high enough)
    const sw = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.rect.strokeWidth.min,
      RANDOM_SHAPE_RANGES.rect.strokeWidth.max,
    )
    if (sw > 1) {
      const strokeColor = this.complementaryColor(color)
      graphics.lineStyle(sw, strokeColor, 0.6)
      if (r > 2) {
        graphics.drawRoundedRect(-w / 2, -h / 2, w, h, r)
      } else {
        graphics.drawRect(-w / 2, -h / 2, w, h)
      }
    }
  }

  private complementaryColor(color: number): number {
    return 0xffffff ^ color
  }
}
