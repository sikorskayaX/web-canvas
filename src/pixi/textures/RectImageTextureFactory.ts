import { Texture } from 'pixi.js-legacy'
import { RECT_IMAGE_TEXTURE_STYLE } from '../../config/random-shape.config.ts'
import type { IRandomProvider } from '../../utils/IRandomProvider.ts'

export class RectImageTextureFactory {
  create(width: number, height: number, _baseColor: number, random: IRandomProvider): Texture {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    const accent = random.pickOne(RECT_IMAGE_TEXTURE_STYLE.accentColors)

    // Fill with soft tinted background
    ctx.fillStyle = this.randomPastel(random)
    ctx.beginPath()
    ctx.roundRect(0, 0, width, height, 6)
    ctx.fill()

    // Gradient overlay streak
    const grad = ctx.createLinearGradient(
      random.nextNumberInRange(0, width),
      random.nextNumberInRange(0, height),
      random.nextNumberInRange(0, width),
      random.nextNumberInRange(0, height),
    )
    grad.addColorStop(0, this.withAlpha(accent, 0))
    grad.addColorStop(0.4, this.withAlpha(accent, 0.35))
    grad.addColorStop(0.6, this.withAlpha(accent, 0.35))
    grad.addColorStop(1, this.withAlpha(accent, 0))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, width, height)

    // Decorative layer — random blobs / lines
    const layerCount = Math.floor(random.nextNumberInRange(2, 5))
    for (let i = 0; i < layerCount; i++) {
      this.drawDecoLayer(ctx, width, height, accent, random)
    }

    // Subtle border
    ctx.strokeStyle = RECT_IMAGE_TEXTURE_STYLE.strokeColor
    ctx.lineWidth = RECT_IMAGE_TEXTURE_STYLE.strokeWidth
    ctx.beginPath()
    ctx.roundRect(1, 1, width - 2, height - 2, 5)
    ctx.stroke()

    return Texture.from(canvas)
  }

  private drawDecoLayer(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    accent: string,
    random: IRandomProvider,
  ): void {
    const kind = Math.floor(random.nextNumberInRange(0, 4))

    switch (kind) {
      case 0: {
        //soft circle blob
        const r = random.nextNumberInRange(6, Math.min(w, h) * 0.35)
        const x = random.nextNumberInRange(0, w)
        const y = random.nextNumberInRange(0, h)
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0, this.withAlpha(accent, 0.5))
        grad.addColorStop(1, this.withAlpha(accent, 0))
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        break
      }

      case 1: {
        // thin accent line
        const x1 = random.nextNumberInRange(0, w)
        const y1 = random.nextNumberInRange(0, h)
        const x2 = random.nextNumberInRange(0, w)
        const y2 = random.nextNumberInRange(0, h)
        ctx.strokeStyle = this.withAlpha(accent, 0.25)
        ctx.lineWidth = random.nextNumberInRange(1, 4)
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        break
      }

      case 2: {
        // small dot cluster
        const count = Math.floor(random.nextNumberInRange(3, 9))
        ctx.fillStyle = this.withAlpha(accent, 0.4)
        for (let i = 0; i < count; i++) {
          const x = random.nextNumberInRange(0, w)
          const y = random.nextNumberInRange(0, h)
          const r = random.nextNumberInRange(1.5, 4)
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.fill()
        }
        break
      }

      case 3: {
        // rounded accent shape
        const sw = w * random.nextNumberInRange(0.2, 0.6)
        const sh = h * random.nextNumberInRange(0.2, 0.6)
        const sx = random.nextNumberInRange(0, w - sw)
        const sy = random.nextNumberInRange(0, h - sh)
        ctx.fillStyle = this.withAlpha(accent, 0.12)
        ctx.beginPath()
        ctx.roundRect(sx, sy, sw, sh, 4)
        ctx.fill()
        break
      }
    }
  }

  private randomPastel(random: IRandomProvider): string {
    const hue = Math.floor(random.nextNumberInRange(0, 360))
    return `hsl(${hue}, 30%, 92%)`
  }

  private withAlpha(color: string, alpha: number): string {
    const hex = color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
}
