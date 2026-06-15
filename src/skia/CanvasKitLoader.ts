import CanvasKitInit from 'canvaskit-wasm'
import wasmUrl from 'canvaskit-wasm/bin/canvaskit.wasm?url'
import type { CanvasKit as CanvasKitType } from 'canvaskit-wasm'

let canvasKitPromise: Promise<CanvasKitType> | null = null

export function loadCanvasKit(): Promise<CanvasKitType> {
  if (!canvasKitPromise) {
    canvasKitPromise = CanvasKitInit({
      locateFile: () => wasmUrl,
    })
  }
  return canvasKitPromise
}