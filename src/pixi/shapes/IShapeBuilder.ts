import type { DisplayObject } from 'pixi.js-legacy'
import type { ShapeBuildContext } from './ShapeBuildContext.ts'
import type { ShapeType } from './ShapeType.ts'

export interface IShapeBuilder {
  readonly type: ShapeType
  build(context: ShapeBuildContext): DisplayObject
}
