import type { Container, DisplayObject } from 'pixi.js-legacy'
import type { CanvasSize } from '../../config/canvas.config.ts'
import type { IRandomProvider } from '../../utils/IRandomProvider.ts'
import { EllipseShapeBuilder } from './EllipseShapeBuilder.ts'
import { LineShapeBuilder } from './LineShapeBuilder.ts'
import { RectImageShapeBuilder } from './RectImageShapeBuilder.ts'
import { RectShapeBuilder } from './RectShapeBuilder.ts'
import { PolygonShapeBuilder } from './PolygonShapeBuilder.ts'
import { TriangleShapeBuilder } from './TriangleShapeBuilder.ts'
import { StarShapeBuilder } from './StarShapeBuilder.ts'
import type { IShapeBuilder } from './IShapeBuilder.ts'
import { RectImageTextureFactory } from '../textures/RectImageTextureFactory.ts'

export class RandomShapeFactory {
  private readonly builders: readonly IShapeBuilder[]
  private readonly random: IRandomProvider
  private readonly bounds: CanvasSize

  constructor(random: IRandomProvider, bounds: CanvasSize) {
    this.random = random
    this.bounds = bounds
    this.builders = [
      new RectShapeBuilder(),
      new EllipseShapeBuilder(),
      new LineShapeBuilder(),
      new TriangleShapeBuilder(),
      new PolygonShapeBuilder(),
      new StarShapeBuilder(),
      new RectImageShapeBuilder(new RectImageTextureFactory()),
    ]
  }

  createAndAddTo(container: Container): DisplayObject {
    const builder = this.random.pickOne(this.builders)
    return builder.build({
      container,
      random: this.random,
      bounds: this.bounds,
    })
  }
}
