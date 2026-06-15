import type { Canvas } from 'canvaskit-wasm'
import type { DisplayObject } from 'pixi.js-legacy'

export function applyPixiWorldTransform(skCanvas: Canvas, obj: DisplayObject): void {
  const matrix = obj.worldTransform

  skCanvas.concat([
    matrix.a,
    matrix.c,
    matrix.tx,
    matrix.b,
    matrix.d,
    matrix.ty,
    0,
    0,
    1,
  ])
}
