import { Container, DisplayObject, Graphics, type FederatedPointerEvent } from 'pixi.js-legacy'
import { HIGHLIGHT_BORDER, getPaddedHighlightRect } from '../utils/HighlightBorder.ts'

export class StagePointerBinder {
  private highlightedTarget: Container | null = null
  private highlightBorder: Graphics | null = null

  bind(stage: Container): void {
    stage.eventMode = 'static'
    this.enableHitTesting(stage)

    stage.on('childAdded', (child: DisplayObject) => {
      this.enableHitTestingOnBranch(child)
    })

    stage.on('pointerdown', (event: FederatedPointerEvent) => {
      const target = event.target
      if (target === stage || !(target instanceof Container)) return

      this.handlePointerDown(target)
    })

    stage.on('pointerup', () => this.handlePointerUp())
    stage.on('pointerupoutside', () => this.handlePointerUp())
  }

  handlePointerDown(target: Container): void {
    console.log('Pointer down on:', target)
    this.applyHighlight(target)
  }

  handlePointerUp(): void {
    this.clearHighlight()
  }

  private applyHighlight(target: Container): void {
    this.clearHighlight()

    const rect = getPaddedHighlightRect(target.getLocalBounds())
    const border = new Graphics()
    border.eventMode = 'none'
    border.lineStyle(HIGHLIGHT_BORDER.width, HIGHLIGHT_BORDER.color, HIGHLIGHT_BORDER.alpha)
    border.drawRect(rect.x, rect.y, rect.width, rect.height)

    target.addChild(border)
    this.highlightedTarget = target
    this.highlightBorder = border
  }

  private clearHighlight(): void {
    if (!this.highlightedTarget || !this.highlightBorder) return

    this.highlightedTarget.removeChild(this.highlightBorder)
    this.highlightBorder.destroy()

    this.highlightedTarget = null
    this.highlightBorder = null
  }

  private enableHitTesting(root: Container): void {
    for (const child of root.children) {
      this.enableHitTestingOnBranch(child)
    }
  }

  private enableHitTestingOnBranch(obj: DisplayObject): void {
    obj.eventMode = 'static'
    obj.cursor = 'pointer'

    if (obj instanceof Container) {
      for (const child of obj.children) {
        this.enableHitTestingOnBranch(child)
      }
    }
  }
}
