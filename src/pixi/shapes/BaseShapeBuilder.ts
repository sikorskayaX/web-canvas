import { Graphics } from 'pixi.js-legacy'
import { RANDOM_SHAPE_RANGES } from '../../config/random-shape.config.ts'
import type { ShapeBuildContext } from './ShapeBuildContext.ts'
import type { IShapeBuilder } from './IShapeBuilder.ts'

export abstract class BaseShapeBuilder implements IShapeBuilder {
  abstract readonly type: IShapeBuilder['type']

  build(context: ShapeBuildContext): Graphics {
    const graphics = new Graphics()
    const color = context.random.nextColor()

    graphics.position.set(
      context.random.nextNumberInRange(0, context.bounds.width),
      context.random.nextNumberInRange(0, context.bounds.height),
    )
    graphics.angle = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.rotation.min,
      RANDOM_SHAPE_RANGES.rotation.max,
    )

    this.draw(graphics, color, context)
    context.container.addChild(graphics)

    return graphics
  }

  protected abstract draw(
    graphics: Graphics,
    color: number,
    context: ShapeBuildContext,
  ): void
}
