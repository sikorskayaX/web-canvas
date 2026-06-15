import { Container, Graphics, Sprite, Text, Texture } from 'pixi.js-legacy'
import type { CanvasSize } from '../config/canvas.config.ts'
import { drawLineSegment } from './shapes/drawLineSegment.ts'

function regularPolygon(sides: number, radius: number): number[] {
  const pts: number[] = []
  const step = (Math.PI * 2) / sides
  const start = -Math.PI / 2
  for (let i = 0; i < sides; i++) {
    const a = start + step * i
    pts.push(Math.cos(a) * radius, Math.sin(a) * radius)
  }
  return pts
}

function starVertices(spikes: number, outerR: number, innerR: number): number[] {
  const pts: number[] = []
  const step = Math.PI / spikes
  const start = -Math.PI / 2
  for (let i = 0; i < spikes; i++) {
    const oa = start + step * 2 * i
    pts.push(Math.cos(oa) * outerR, Math.sin(oa) * outerR)
    const ia = start + step * (2 * i + 1)
    pts.push(Math.cos(ia) * innerR, Math.sin(ia) * innerR)
  }
  return pts
}

export function createDemoScene(bounds: CanvasSize): Container {
  const scene = new Container()
  const { width, height } = bounds

  // ── Floating label (top-left) ──
  const label = new Text('Демо-сцена', {
    fill: 0x475569,
    fontSize: 26,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: '700',
    letterSpacing: -0.3,
  })
  label.position.set(width * 0.025, height * 0.025)
  scene.addChild(label)

  // ── Sub-label ──
  const subLabel = new Text('PixiJS → PDF via Skia', {
    fill: 0x94a3b8,
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    fontWeight: '500',
    letterSpacing: 0.6,
  })
  subLabel.position.set(width * 0.025, height * 0.025 + 34)
  scene.addChild(subLabel)

  // ═══════════════════════════════════════════════════
  //  LAYER 1 — Background decorative elements
  // ═══════════════════════════════════════════════════

  // Big faint circle (background anchor)
  const bgCircle = new Graphics()
  bgCircle.beginFill(0xf1f5f9)
  bgCircle.drawCircle(width * 0.5, height * 0.5, Math.min(width, height) * 0.32)
  bgCircle.endFill()
  scene.addChild(bgCircle)

  // ═══════════════════════════════════════════════════
  //  LAYER 2 — Primary shapes (top band)
  // ═══════════════════════════════════════════════════

  // Star (indigo) — top-left area
  const star = new Graphics()
  star.beginFill(0x6366f1)
  star.drawPolygon(starVertices(5, 44, 22))
  star.endFill()
  // inner ghost
  star.beginFill(0xffffff, 0.15)
  star.drawPolygon(starVertices(5, 22, 11))
  star.endFill()
  // stroke
  star.lineStyle(2.5, 0x818cf8, 0.6)
  star.drawPolygon(starVertices(5, 44, 22))
  star.position.set(width * 0.15, height * 0.25)
  star.angle = 10
  scene.addChild(star)

  // Rounded rectangle (rose) — center-top
  const rr = new Graphics()
  rr.beginFill(0xf43f5e)
  rr.drawRoundedRect(-52, -28, 104, 56, 18)
  rr.endFill()
  // inner accent bar
  rr.beginFill(0xffffff, 0.18)
  rr.drawRoundedRect(-36, -14, 72, 8, 4)
  rr.endFill()
  // stroke
  rr.lineStyle(2, 0xff6b7a, 0.5)
  rr.drawRoundedRect(-52, -28, 104, 56, 18)
  rr.position.set(width * 0.45, height * 0.22)
  rr.angle = -5
  scene.addChild(rr)

  // Circle (emerald) — top-right
  const circle = new Graphics()
  circle.beginFill(0x10b981)
  circle.drawCircle(0, 0, 36)
  circle.endFill()
  // inner highlight
  circle.beginFill(0xffffff, 0.2)
  circle.drawCircle(-8, -10, 14)
  circle.endFill()
  // stroke
  circle.lineStyle(2.5, 0x34d399, 0.55)
  circle.drawCircle(0, 0, 36)
  circle.position.set(width * 0.75, height * 0.25)
  scene.addChild(circle)

  // ═══════════════════════════════════════════════════
  //  LAYER 3 — Sub-container: nested composition (centre)
  // ═══════════════════════════════════════════════════

  const group = new Container()
  group.position.set(width * 0.33, height * 0.55)
  group.angle = 8

  // Underlying card
  const card = new Graphics()
  card.beginFill(0xffffff, 0.7)
  card.drawRoundedRect(-70, -50, 140, 100, 16)
  card.endFill()
  card.lineStyle(1, 0xe2e8f0, 1)
  card.drawRoundedRect(-70, -50, 140, 100, 16)
  group.addChild(card)

  // 5-pointed star inside card
  const innerStar = new Graphics()
  innerStar.beginFill(0xf59e0b)
  innerStar.drawPolygon(regularPolygon(5, 28))
  innerStar.endFill()
  innerStar.lineStyle(1.5, 0xfbbf24, 0.5)
  innerStar.drawPolygon(regularPolygon(5, 28))
  innerStar.position.set(-20, 0)
  innerStar.angle = 25
  group.addChild(innerStar)

  // Small circle inside card
  const dot = new Graphics()
  dot.beginFill(0xef4444)
  dot.drawCircle(26, -16, 10)
  dot.endFill()
  dot.lineStyle(1.5, 0xfca5a5, 0.5)
  dot.drawCircle(26, -16, 10)
  group.addChild(dot)

  // Tiny polygon inside card
  const tinyPoly = new Graphics()
  tinyPoly.beginFill(0x8b5cf6)
  tinyPoly.drawPolygon(regularPolygon(6, 14))
  tinyPoly.endFill()
  tinyPoly.beginFill(0xffffff, 0.15)
  tinyPoly.drawPolygon(regularPolygon(6, 8))
  tinyPoly.endFill()
  tinyPoly.position.set(30, 22)
  group.addChild(tinyPoly)

  scene.addChild(group)

  // ═══════════════════════════════════════════════════
  //  LAYER 4 — Diagonal line & triangle (lower area)
  // ═══════════════════════════════════════════════════

  // Line (pink) — sweeping across
  const line = new Graphics()
  drawLineSegment({
    graphics: line,
    x1: 0, y1: 0,
    x2: 240, y2: -40,
    lineWidth: 7,
    color: 0xec4899,
    alpha: 0.8,
  })
  line.position.set(width * 0.08, height * 0.78)
  scene.addChild(line)

  // Thin companion line
  drawLineSegment({
    graphics: line,
    x1: -6, y1: 8,
    x2: 234, y2: -32,
    lineWidth: 2.5,
    color: 0xf472b6,
    alpha: 0.35,
  })
  line.position.set(width * 0.08, height * 0.78)

  // Triangle (cyan) — lower-right
  const tri = new Graphics()
  tri.beginFill(0x06b6d4)
  tri.drawPolygon([0, -36, -36, 30, 36, 30])
  tri.endFill()
  tri.beginFill(0xffffff, 0.15)
  tri.drawPolygon([0, -12, -12, 18, 12, 18])
  tri.endFill()
  tri.lineStyle(2, 0x22d3ee, 0.45)
  tri.drawPolygon([0, -36, -36, 30, 36, 30])
  tri.position.set(width * 0.78, height * 0.72)
  tri.angle = -15
  scene.addChild(tri)

  // ═══════════════════════════════════════════════════
  //  LAYER 5 — Texture sprite (lower-left)
  // ═══════════════════════════════════════════════════

  const sprite = new Sprite(createDemoTexture())
  sprite.anchor.set(0.5)
  sprite.scale.set(0.45)
  sprite.position.set(width * 0.68, height * 0.78)
  sprite.angle = 6
  scene.addChild(sprite)

  // ═══════════════════════════════════════════════════
  //  LAYER 6 — Accent ellipse (far bottom-right)
  // ═══════════════════════════════════════════════════

  const ell = new Graphics()
  ell.beginFill(0x8b5cf6, 0.85)
  ell.drawEllipse(0, 0, 58, 24)
  ell.endFill()
  ell.beginFill(0xffffff, 0.15)
  ell.drawEllipse(6, -4, 22, 10)
  ell.endFill()
  ell.lineStyle(1.5, 0xa78bfa, 0.45)
  ell.drawEllipse(0, 0, 58, 24)
  ell.position.set(width * 0.42, height * 0.82)
  ell.angle = 22
  scene.addChild(ell)

  return scene
}

function createDemoTexture(): Texture {
  const w = 200, h = 150
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Pastel wash
  ctx.fillStyle = '#f0edff'
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, 8)
  ctx.fill()

  // Gradient streak
  const g = ctx.createLinearGradient(40, 10, 160, 130)
  g.addColorStop(0, 'rgba(134,59,255,0)')
  g.addColorStop(0.35, 'rgba(134,59,255,0.3)')
  g.addColorStop(0.55, 'rgba(134,59,255,0.3)')
  g.addColorStop(1, 'rgba(134,59,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // Blobs
  ;[
    { x: 150, y: 32, r: 38, a: 0.22 },
    { x: 52, y: 108, r: 28, a: 0.16 },
    { x: 20, y: 28, r: 18, a: 0.12 },
    { x: 110, y: 70, r: 22, a: 0.10 },
    { x: 170, y: 110, r: 14, a: 0.14 },
  ].forEach(({ x, y, r, a }) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r)
    rg.addColorStop(0, `rgba(134,59,255,${a * 2.5})`)
    rg.addColorStop(1, `rgba(134,59,255,0)`)
    ctx.fillStyle = rg
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  })

  // Thin accent lines
  ctx.strokeStyle = 'rgba(134,59,255,0.15)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(18, 42)
  ctx.lineTo(88, 128)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(130, 18)
  ctx.lineTo(185, 85)
  ctx.stroke()

  // White border
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(1, 1, w - 2, h - 2, 7)
  ctx.stroke()

  return Texture.from(canvas)
}
