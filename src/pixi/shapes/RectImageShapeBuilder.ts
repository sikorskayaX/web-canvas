import { Sprite } from 'pixi.js-legacy'
import { RANDOM_SHAPE_RANGES } from '../../config/random-shape.config.ts'
import { RectImageTextureFactory } from '../textures/RectImageTextureFactory.ts'
import type { ShapeBuildContext } from './ShapeBuildContext.ts'
import type { IShapeBuilder } from './IShapeBuilder.ts'
import { ShapeType } from './ShapeType.ts'

export class RectImageShapeBuilder implements IShapeBuilder {
  readonly type = ShapeType.Image
  private readonly textureFactory: RectImageTextureFactory

  constructor(textureFactory: RectImageTextureFactory) {
    this.textureFactory = textureFactory
  }

  build(context: ShapeBuildContext): Sprite {
    const color = context.random.nextColor()
    const width = Math.round(
      context.random.nextNumberInRange(
        RANDOM_SHAPE_RANGES.image.width.min,
        RANDOM_SHAPE_RANGES.image.width.max,
      ),
    )
    const height = Math.round(
      context.random.nextNumberInRange(
        RANDOM_SHAPE_RANGES.image.height.min,
        RANDOM_SHAPE_RANGES.image.height.max,
      ),
    )

    const sprite = new Sprite(this.textureFactory.create(width, height, color, context.random))
    sprite.anchor.set(0.5)
    sprite.position.set(
      context.random.nextNumberInRange(0, context.bounds.width),
      context.random.nextNumberInRange(0, context.bounds.height),
    )
    sprite.angle = context.random.nextNumberInRange(
      RANDOM_SHAPE_RANGES.rotation.min,
      RANDOM_SHAPE_RANGES.rotation.max,
    )

    context.container.addChild(sprite)
    return sprite
  }
}
