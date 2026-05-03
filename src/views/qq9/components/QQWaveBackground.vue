<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface DotTint {
  r: number
  g: number
  b: number
}

interface HalftoneDot {
  baseX: number
  baseY: number
  radius: number
  phase: number
  speed: number
  driftX: number
  driftY: number
  alpha: number
  layer: number
  tint: DotTint
}

interface ClickRipple {
  x: number
  y: number
  startedAt: number
  strength: number
}

const dots: HalftoneDot[] = []
const ripples: ClickRipple[] = []

const pointer = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  normX: 0,
  normY: 0,
  targetNormX: 0,
  targetNormY: 0,
  active: false,
  pulse: 0,
}

const tints: DotTint[] = [
  { r: 72, g: 139, b: 235 },
  { r: 65, g: 184, b: 255 },
  { r: 133, g: 122, b: 221 },
  { r: 68, g: 195, b: 176 },
  { r: 255, g: 124, b: 100 },
]

let animationFrameId = 0
let width = 0
let height = 0
let dpr = 1
let dotSpacing = 24
let reducedMotionQuery: MediaQueryList | null = null
let prefersReducedMotion = false

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1)

  return x * x * (3 - 2 * x)
}

const getTint = () => {
  const roll = Math.random()

  if (roll > 0.975) return tints[4]
  if (roll > 0.94) return tints[3]
  if (roll > 0.84) return tints[2]
  if (roll > 0.48) return tints[1]

  return tints[0]
}

const seedScene = () => {
  dots.length = 0

  dotSpacing = clamp(Math.min(width, height) * 0.009, 6.5, 9.5)

  const rowStep = dotSpacing * 0.88
  const columns = Math.ceil(width / dotSpacing) + 4
  const rows = Math.ceil(height / rowStep) + 4

  for (let row = -2; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : dotSpacing * 0.5

    for (let column = -2; column < columns; column++) {
      const x = column * dotSpacing + offset
      const y = row * rowStep
      const nx = width ? x / width : 0
      const ny = height ? y / height : 0
      const diagonal = Math.sin(nx * 12.4 + ny * 15.8)
      const crossWave = Math.sin((nx - ny) * 24.5)
      const curtain = Math.sin(nx * 52 + ny * 5.5)
      const cornerFocus = 1 - smoothstep(0.16, 0.98, Math.hypot(nx - 0.72, ny - 0.22))
      const density = clamp(
        0.5 + diagonal * 0.16 + crossWave * 0.12 + curtain * 0.1 + cornerFocus * 0.18,
        0.14,
        1,
      )

      if (density < 0.2 && Math.random() > 0.48) {
        continue
      }

      dots.push({
        baseX: x + randomBetween(-dotSpacing * 0.06, dotSpacing * 0.06),
        baseY: y + randomBetween(-rowStep * 0.06, rowStep * 0.06),
        radius: dotSpacing * randomBetween(0.035, 0.1) * (0.72 + density * 0.62),
        phase: Math.random() * Math.PI * 2,
        speed: randomBetween(0.12, 0.38),
        driftX: randomBetween(0.8, 3.8) * density,
        driftY: randomBetween(0.7, 3.2) * density,
        alpha: randomBetween(0.035, 0.14) * (0.72 + density * 0.48),
        layer: randomBetween(0.55, 1.34),
        tint: getTint(),
      })
    }
  }
}

const drawBackdrop = (ctx: CanvasRenderingContext2D) => {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f8fbff')
  gradient.addColorStop(0.42, '#e8f0fb')
  gradient.addColorStop(1, '#d9e3f2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  const coolGlow = ctx.createRadialGradient(
    width * (0.22 + pointer.normX * 0.025),
    height * (0.08 + pointer.normY * 0.02),
    0,
    width * 0.22,
    height * 0.08,
    Math.max(width, height) * 0.52,
  )
  coolGlow.addColorStop(0, 'rgba(255, 255, 255, 0.92)')
  coolGlow.addColorStop(0.38, 'rgba(194, 225, 255, 0.34)')
  coolGlow.addColorStop(1, 'rgba(194, 225, 255, 0)')
  ctx.fillStyle = coolGlow
  ctx.fillRect(0, 0, width, height)

  const warmGlow = ctx.createRadialGradient(
    width * (0.88 - pointer.normX * 0.018),
    height * (0.78 - pointer.normY * 0.018),
    0,
    width * 0.88,
    height * 0.78,
    Math.max(width, height) * 0.42,
  )
  warmGlow.addColorStop(0, 'rgba(255, 158, 124, 0.14)')
  warmGlow.addColorStop(0.44, 'rgba(151, 132, 236, 0.08)')
  warmGlow.addColorStop(1, 'rgba(151, 132, 236, 0)')
  ctx.fillStyle = warmGlow
  ctx.fillRect(0, 0, width, height)
}

const drawLenticularField = (ctx: CanvasRenderingContext2D, time: number) => {
  const motionScale = prefersReducedMotion ? 0.18 : 1
  const lineGap = clamp(width * 0.0042, 4.4, 6.6)
  const verticalSteps = 36

  ctx.save()
  ctx.lineCap = 'round'

  for (let lineX = -lineGap * 2; lineX < width + lineGap * 2; lineX += lineGap) {
    const nx = lineX / width
    const hueWave = Math.sin(nx * 17 + time * 0.12 * motionScale)
    const alpha = 0.028 + Math.max(0, Math.sin(nx * 31 - time * 0.22 * motionScale)) * 0.045
    const lineWidth = 0.62 + Math.max(0, hueWave) * 0.5
    const gradient = ctx.createLinearGradient(lineX, 0, lineX, height)

    gradient.addColorStop(0, `rgba(255, 94, 214, ${alpha * 0.66})`)
    gradient.addColorStop(0.34, `rgba(78, 222, 255, ${alpha})`)
    gradient.addColorStop(0.62, `rgba(108, 255, 213, ${alpha * 0.86})`)
    gradient.addColorStop(1, `rgba(161, 125, 255, ${alpha * 0.58})`)

    ctx.strokeStyle = gradient
    ctx.lineWidth = lineWidth
    ctx.beginPath()

    for (let step = 0; step <= verticalSteps; step++) {
      const y = (height * step) / verticalSteps
      const ny = y / height
      const diagonalWave = Math.sin((ny - nx) * 10.2 + time * 0.22 * motionScale) * 18
      const verticalWave = Math.sin(ny * 8.6 + nx * 12.4 - time * 0.16 * motionScale) * 9
      const pointerBend = pointer.active
        ? (1 - smoothstep(0, 360, Math.hypot(lineX - pointer.x, y - pointer.y))) * pointer.normX * 18
        : 0

      const x = lineX + diagonalWave + verticalWave + pointerBend + pointer.normX * 7

      if (step === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()
  }

  ctx.restore()
}

const drawPointerGlow = (ctx: CanvasRenderingContext2D) => {
  if (!pointer.active) {
    return
  }

  const radius = 210 + pointer.pulse * 90
  const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius)
  glow.addColorStop(0, `rgba(77, 165, 255, ${0.12 + pointer.pulse * 0.05})`)
  glow.addColorStop(0.38, 'rgba(77, 165, 255, 0.048)')
  glow.addColorStop(1, 'rgba(77, 165, 255, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
}

const drawRipples = (ctx: CanvasRenderingContext2D, time: number) => {
  for (let index = ripples.length - 1; index >= 0; index--) {
    const ripple = ripples[index]
    const rawAge = time - ripple.startedAt
    const age = Math.max(0, rawAge)

    if (rawAge > 1.45) {
      ripples.splice(index, 1)
      continue
    }

    const radius = age * 500
    const alpha = (1 - age / 1.45) * 0.18 * ripple.strength

    ctx.strokeStyle = `rgba(47, 134, 239, ${alpha})`
    ctx.lineWidth = 0.7 + age * 2.2
    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = `rgba(255, 124, 100, ${alpha * 0.52})`
    ctx.lineWidth = 0.55
    ctx.beginPath()
    ctx.arc(ripple.x, ripple.y, radius * 0.64, 0, Math.PI * 2)
    ctx.stroke()
  }
}

const drawDots = (ctx: CanvasRenderingContext2D, time: number) => {
  const motionScale = prefersReducedMotion ? 0.22 : 1
  const pointerRadius = 180 + pointer.pulse * 50

  for (const dot of dots) {
    const floatX =
      Math.sin(time * dot.speed * 0.72 * motionScale + dot.phase) * dot.driftX +
      pointer.normX * dot.layer * 2.6
    const floatY =
      Math.cos(time * dot.speed * motionScale + dot.phase * 1.4) * dot.driftY +
      pointer.normY * dot.layer * 2.2
    const dx = pointer.x - dot.baseX
    const dy = pointer.y - dot.baseY
    const pointerDistance = Math.hypot(dx, dy) || 1
    const pointerPull = pointer.active
      ? Math.max(0, 1 - pointerDistance / pointerRadius) ** 2
      : 0
    const wave = clamp(
      (Math.sin(dot.baseX * 0.014 + dot.baseY * 0.008 + time * dot.speed * 1.4 + dot.phase) +
        Math.cos(dot.baseY * 0.017 - time * dot.speed + dot.phase)) *
        0.25 +
        0.5,
      0,
      1,
    )

    let rippleLift = 0
    let ripplePushX = 0
    let ripplePushY = 0

    for (const ripple of ripples) {
      const age = Math.max(0, time - ripple.startedAt)
      const rippleRadius = age * 500
      const rippleDistance = Math.hypot(dot.baseX - ripple.x, dot.baseY - ripple.y) || 1
      const ring = Math.max(0, 1 - Math.abs(rippleDistance - rippleRadius) / (18 + age * 28))

      if (ring <= 0) {
        continue
      }

      const fade = 1 - age / 1.45
      const impact = ring * ring * fade * ripple.strength

      rippleLift += impact
      ripplePushX += ((dot.baseX - ripple.x) / rippleDistance) * impact * 8
      ripplePushY += ((dot.baseY - ripple.y) / rippleDistance) * impact * 8
    }

    const x = dot.baseX + floatX + dx * pointerPull * 0.026 + ripplePushX
    const y = dot.baseY + floatY + dy * pointerPull * 0.026 + ripplePushY
    const radius =
      dot.radius * (0.74 + wave * 0.48) +
      dot.radius * pointerPull * 1.2 +
      rippleLift * dotSpacing * 0.07
    const alpha = clamp(dot.alpha + pointerPull * 0.2 + rippleLift * 0.26, 0.025, 0.58)

    ctx.fillStyle = `rgba(${dot.tint.r}, ${dot.tint.g}, ${dot.tint.b}, ${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

const draw = (timestamp: number) => {
  const canvas = canvasRef.value
  if (!canvas || !width || !height) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const time = timestamp / 1000

  pointer.x += (pointer.targetX - pointer.x) * 0.12
  pointer.y += (pointer.targetY - pointer.y) * 0.12
  pointer.normX += (pointer.targetNormX - pointer.normX) * 0.08
  pointer.normY += (pointer.targetNormY - pointer.normY) * 0.08
  pointer.pulse *= 0.9

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  drawBackdrop(ctx)
  drawLenticularField(ctx, time)
  drawPointerGlow(ctx)
  drawDots(ctx, time)
  drawRipples(ctx, time)
}

const loop = (timestamp: number) => {
  draw(timestamp)
  animationFrameId = requestAnimationFrame(loop)
}

const updatePointerTarget = (clientX: number, clientY: number) => {
  if (!width || !height) return

  pointer.targetX = clientX
  pointer.targetY = clientY
  pointer.targetNormX = (clientX / width - 0.5) * 2
  pointer.targetNormY = (clientY / height - 0.5) * 2
  pointer.active = true
}

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight

  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  if (!pointer.active) {
    pointer.x = width * 0.5
    pointer.y = height * 0.5
    pointer.targetX = pointer.x
    pointer.targetY = pointer.y
  }

  seedScene()
  draw(performance.now())
}

const handlePointerMove = (event: PointerEvent) => {
  updatePointerTarget(event.clientX, event.clientY)
}

const handlePointerDown = (event: PointerEvent) => {
  updatePointerTarget(event.clientX, event.clientY)
  pointer.pulse = 1

  ripples.push({
    x: event.clientX,
    y: event.clientY,
    startedAt: performance.now() / 1000,
    strength: event.pointerType === 'mouse' ? 1 : 0.86,
  })

  if (ripples.length > 5) {
    ripples.shift()
  }
}

const resetPointer = () => {
  pointer.targetX = width * 0.5
  pointer.targetY = height * 0.5
  pointer.targetNormX = 0
  pointer.targetNormY = 0
  pointer.active = false
}

const handleReducedMotionChange = (event: MediaQueryListEvent) => {
  prefersReducedMotion = event.matches
}

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion = reducedMotionQuery.matches

  resize()
  animationFrameId = requestAnimationFrame(loop)
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('pointerdown', handlePointerDown, { passive: true })
  window.addEventListener('pointercancel', resetPointer)
  window.addEventListener('blur', resetPointer)
  reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('pointercancel', resetPointer)
  window.removeEventListener('blur', resetPointer)
  reducedMotionQuery?.removeEventListener('change', handleReducedMotionChange)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="qq-wave-background"
    aria-hidden="true"
  />
</template>

<style scoped>
.qq-wave-background {
  position: fixed;
  inset: 0;
  display: block;
  pointer-events: none;
  z-index: 0;
}
</style>
