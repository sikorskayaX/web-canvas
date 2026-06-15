import {
  Container,
  DisplayObject,
  Point,
  type Application,
  type FederatedPointerEvent,
} from 'pixi.js-legacy'
import type { SkiaRenderer } from './SkiaRenderer.ts'

export class SkiaCanvasPointerBinder {
  private readonly point = new Point()
  private pointerDownTarget: Container | null = null

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly pixiApp: Application,
    private readonly skiaRenderer: SkiaRenderer,
  ) {}

  bind(): void {
    this.canvas.style.touchAction = 'none'
    this.canvas.addEventListener('contextmenu', this.onContextMenu)
    this.canvas.addEventListener('pointerdown', this.onPointerDown)
    this.canvas.addEventListener('pointerup', this.onPointerUp)
    this.canvas.addEventListener('pointercancel', this.onPointerUp)
  }

  private onContextMenu = (event: Event): void => {
    event.preventDefault()
  }

  private onPointerDown = (nativeEvent: PointerEvent): void => {
    const target = this.hitTest(nativeEvent)
    if (!(target instanceof Container) || target === this.pixiApp.stage) return

    this.pointerDownTarget = target
    console.log('Pointer down on:', target)
    this.skiaRenderer.setHighlight(target)
    this.skiaRenderer.renderFromPixi(this.pixiApp.stage)
    this.emitPointerEvent(target, 'pointerdown')
  }

  private onPointerUp = (nativeEvent: PointerEvent): void => {
    const releaseTarget = this.hitTest(nativeEvent)
    const pressedTarget = this.pointerDownTarget
    this.pointerDownTarget = null

    if (releaseTarget instanceof Container && releaseTarget !== this.pixiApp.stage) {
      console.log('Pointer up on:', releaseTarget)
      this.emitPointerEvent(releaseTarget, 'pointerup')
    }

    if (
      pressedTarget &&
      pressedTarget !== releaseTarget &&
      pressedTarget !== this.pixiApp.stage
    ) {
      this.emitPointerEvent(pressedTarget, 'pointerupoutside')
    }

    this.skiaRenderer.clearHighlight()
    this.skiaRenderer.renderFromPixi(this.pixiApp.stage)
  }

  private hitTest(nativeEvent: PointerEvent): DisplayObject | null {
    this.pixiApp.renderer.render(this.pixiApp.stage)

    const rect = this.canvas.getBoundingClientRect()
    const x = ((nativeEvent.clientX - rect.left) / rect.width) * this.canvas.width
    const y = ((nativeEvent.clientY - rect.top) / rect.height) * this.canvas.height
    this.point.set(x, y)

    return this.pixiApp.renderer.events.rootBoundary.hitTest(this.point.x, this.point.y)
  }

  private emitPointerEvent(
    target: Container,
    type: 'pointerdown' | 'pointerup' | 'pointerupoutside',
  ): void {
    const event = { type, target } as unknown as FederatedPointerEvent
    target.emit(type, event)
  }
}
