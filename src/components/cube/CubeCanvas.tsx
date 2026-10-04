import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { cubeFaces } from '../../lib/deal'
import { createFaceMaterial } from './faceMaterial'
import { createFaceTexture } from './textures'
import { PHASES, type Stage } from './stage'
import { markHeroReady } from '../../lib/ready'

// ── Small maths helpers ────────────────────────────────────────
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const range = (p: number, [a, b]: readonly [number, number]) => clamp01((p - a) / (b - a))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
/** Lets each face start a little after the previous one. */
const stagger = (t: number, i: number, spread = 0.22) => clamp01((t - (i / 5) * spread) / (1 - spread))

/** Ease-out with a gentle overshoot, for the cards' springy landing. */
const springOut = (t: number) => {
  const c = 1.2
  return t === 0 ? 0 : 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
}

const FOV = 30
const CAMERA_Z = 10
const FACE_INSET = 0.95 // photo size relative to the cube; the white rounded body shows around it
const BODY_RADIUS = 0.06

// Resting behaviour.
const SLANT_FORWARD = THREE.MathUtils.degToRad(25) // tipped toward the viewer, so the top shows
const SLANT_SIDE = THREE.MathUtils.degToRad(20) // leaning sideways, as if balanced on a corner
const SPIN_PERIOD = 18 // seconds per full clockwise turn
const LEAN = THREE.MathUtils.degToRad(10) // max lean toward the cursor
const DRIFT_PX = 12 // max drift toward the cursor
const FLOAT_PX = 8 // gentle float up and down…
const FLOAT_PERIOD = 5 // …on a 5 second loop

// The six faces: outward direction and rotation, in cube-1 … cube-6 order.
const FACES = [
  { normal: new THREE.Vector3(0, 0, 1), euler: new THREE.Euler(0, 0, 0) }, // front
  { normal: new THREE.Vector3(1, 0, 0), euler: new THREE.Euler(0, Math.PI / 2, 0) }, // right
  { normal: new THREE.Vector3(0, 0, -1), euler: new THREE.Euler(0, Math.PI, 0) }, // back
  { normal: new THREE.Vector3(-1, 0, 0), euler: new THREE.Euler(0, -Math.PI / 2, 0) }, // left
  { normal: new THREE.Vector3(0, 1, 0), euler: new THREE.Euler(-Math.PI / 2, 0, 0) }, // top
  { normal: new THREE.Vector3(0, -1, 0), euler: new THREE.Euler(Math.PI / 2, 0, 0) }, // bottom
].map((f) => ({ ...f, quat: new THREE.Quaternion().setFromEuler(f.euler) }))

/** A soft round shadow, drawn once into a small canvas. */
function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(70,90,150,0.55)')
    g.addColorStop(0.45, 'rgba(90,110,170,0.22)')
    g.addColorStop(1, 'rgba(111,168,245,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

type Props = { stage: Stage; active: boolean; lite: boolean }

function Scene({ stage, active, lite }: Props) {
  const { size } = useThree()
  const faceRefs = useRef<(THREE.Mesh | null)[]>([])
  const bodyRef = useRef<THREE.Mesh>(null)
  const shadowRef = useRef<THREE.Mesh>(null)
  const shadowTexture = useShadowTexture()

  // One material + texture per face.
  const faces = useMemo(
    () => cubeFaces.map(() => ({ material: createFaceMaterial(new THREE.Texture()) })),
    [],
  )
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  // Picked once, so dropping to lite mode later doesn't reload every photo.
  const [texSize] = useState(lite ? 512 : 1024)

  useEffect(() => {
    const loaded = cubeFaces.map((item, i) => {
      const apply = (f: ReturnType<typeof createFaceTexture>) => {
        faces[i].material.uniforms.uMap.value = f.texture
        faces[i].material.uniforms.uUvScale.value = f.uvScale
        videos.current[i] = f.video
      }
      const f = createFaceTexture(item.media, texSize, apply)
      apply(f)
      return f
    })
    return () => loaded.forEach((f) => f.dispose())
  }, [faces, texSize])

  useEffect(() => () => faces.forEach((f) => f.material.dispose()), [faces])

  // Pause videos while the cube is off screen.
  useEffect(() => {
    videos.current.forEach((v) => {
      if (!v) return
      if (active) v.play().catch(() => {})
      else v.pause()
    })
  }, [active])

  // ── Resting motion: slanted clockwise spin, lean + drift toward the cursor, float ──
  const rest = useRef({
    spin: 0,
    velocity: 0, // extra spin from a finger drag, decays away
    dragging: false,
    pressX: 0,
    lean: new THREE.Vector2(), // current lean/drift direction, -1…1 (damped)
    target: new THREE.Vector2(), // where the cursor is, relative to the cube
    hover: 0,
    cx: 0, // cube centre on screen, for the cursor maths
    cy: 0,
  })

  // Random but fixed phases/speeds for each card's gentle idle drift once opened.
  const idle = useMemo(
    () =>
      Array.from({ length: 6 }, () => ({
        phase: Array.from({ length: 7 }, () => Math.random() * Math.PI * 2),
        speed: Array.from({ length: 7 }, () => 0.35 + Math.random() * 0.4),
      })),
    [],
  )

  useEffect(() => {
    const r = rest.current
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      // Direction from the cube to the cursor, scaled so the far edge of the screen = 1.
      const x = (e.clientX - r.cx) / (window.innerWidth / 2)
      const y = (e.clientY - r.cy) / (window.innerHeight / 2)
      r.target.set(x, y)
      if (r.target.length() > 1) r.target.normalize()
    }
    const onLeave = () => r.target.set(0, 0)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    // Finger (or mouse) drag spins it a little; a short press without moving is a tap.
    const slot = stage.slot
    let lastX = 0
    const down = (e: PointerEvent) => {
      r.dragging = true
      stage.dragged = false
      lastX = r.pressX = e.clientX
    }
    const move = (e: PointerEvent) => {
      if (!r.dragging) return
      const dx = e.clientX - lastX
      lastX = e.clientX
      if (Math.abs(e.clientX - r.pressX) > 8) stage.dragged = true
      if (!stage.dragged) return
      r.spin += dx * 0.01
      r.velocity = dx * 0.6
    }
    const up = () => {
      r.dragging = false
    }
    slot?.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      slot?.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [stage])

  // Scratch objects reused every frame (no garbage while scrolling).
  const tmp = useMemo(
    () => ({
      qSlant: new THREE.Quaternion().setFromEuler(new THREE.Euler(SLANT_FORWARD, 0, -SLANT_SIDE, 'XYZ')),
      qSpin: new THREE.Quaternion(),
      qLean: new THREE.Quaternion(),
      qCube: new THREE.Quaternion(),
      qFace: new THREE.Quaternion(),
      qIdle: new THREE.Quaternion(),
      identity: new THREE.Quaternion(),
      up: new THREE.Vector3(0, 1, 0),
      euler: new THREE.Euler(),
      center: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      onCube: new THREE.Vector3(),
      apart: new THREE.Vector3(),
      grid: new THREE.Vector3(),
      offset: new THREE.Vector3(),
      gridCenter: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      hover: new Array(6).fill(0) as number[],
    }),
    [],
  )

  // Tell the page the cube is ready after a few drawn frames (shaders compiled, textures uploaded).
  const frames = useRef(0)

  useFrame((state, delta) => {
    if (++frames.current === 3) markHeroReady()
    const dt = Math.min(delta, 1 / 20)
    const p = stage.progress
    const t = state.clock.elapsedTime
    const vw = size.width
    const vh = size.height

    // Pixels → world units on the z = 0 plane.
    const k = (2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / vh
    const toWorld = (x: number, y: number, out: THREE.Vector3) => out.set((x - vw / 2) * k, -(y - vh / 2) * k, 0)

    // Where the cube rests (the hero slot) and where it goes (screen centre).
    const slot = stage.slot?.getBoundingClientRect()
    if (!slot) return
    const mobile = vw < 768
    // A slanted cube looks about 1.35× wider than its edge, so size the edge
    // to make its outline fill the slot (≈380px desktop, 240px mobile).
    const restPx = slot.width * (mobile ? 0.7 : 0.74)
    const centrePx = mobile ? Math.min(vw * 0.52, 240) : restPx * 1.12

    const glide = ease(range(p, PHASES.glide))
    const sep = range(p, PHASES.separate)
    const settle = range(p, PHASES.settle)
    // Everything "alive" about the resting cube fades out as it opens.
    const restWeight = 1 - smooth(0, 0.12, p)

    const r = rest.current
    r.cx = slot.left + slot.width / 2
    r.cy = slot.top + slot.height / 2

    // Lean/drift toward the cursor, with smooth damping (glides, never jerks).
    r.lean.x = THREE.MathUtils.damp(r.lean.x, r.target.x, 3.2, dt)
    r.lean.y = THREE.MathUtils.damp(r.lean.y, r.target.y, 3.2, dt)
    r.hover = THREE.MathUtils.damp(r.hover, stage.hoverCube && p < 0.02 ? 1 : 0, 8, dt)

    const driftX = r.lean.x * DRIFT_PX * restWeight
    const driftY = r.lean.y * DRIFT_PX * restWeight
    const floatY = Math.sin((t * Math.PI * 2) / FLOAT_PERIOD) * FLOAT_PX * restWeight

    const cubePx = THREE.MathUtils.lerp(restPx, centrePx, glide) * (1 + 0.04 * r.hover)
    const S = cubePx * k
    toWorld(
      THREE.MathUtils.lerp(r.cx + driftX, vw / 2, glide),
      THREE.MathUtils.lerp(r.cy + driftY - floatY, vh / 2, glide),
      tmp.center,
    )

    // Clockwise spin (seen from above) that eases to a stop as it opens; a drag adds a nudge.
    if (!r.dragging) r.velocity *= Math.pow(0.05, dt)
    r.spin += (-(Math.PI * 2) / SPIN_PERIOD + r.velocity) * dt * restWeight
    tmp.qSpin.setFromAxisAngle(tmp.up, r.spin)
    tmp.qLean.setFromEuler(tmp.euler.set(r.lean.y * LEAN * restWeight, r.lean.x * LEAN * restWeight, 0, 'XYZ'))
    // Lean (toward cursor) × slant (balanced on a corner) × spin (around its own axis).
    tmp.qCube.copy(tmp.qLean).multiply(tmp.qSlant).multiply(tmp.qSpin)

    // Grid card centres (for the separate direction and final positions).
    const rects = stage.cards.map((el) => el?.getBoundingClientRect())
    tmp.gridCenter.set(0, 0, 0)
    rects.forEach((rc) => rc && tmp.gridCenter.add(toWorld(rc.left + rc.width / 2, rc.top + rc.height / 2, tmp.grid)))
    tmp.gridCenter.multiplyScalar(1 / 6)

    // Once fully open, the cards drift and play softly.
    const play = smooth(0.93, 1, p)

    for (let i = 0; i < 6; i++) {
      const mesh = faceRefs.current[i]
      const rc = rects[i]
      if (!mesh || !rc) continue
      const face = FACES[i]
      const u = ease(stagger(sep, i))
      const vRaw = stagger(settle, i)
      const v = springOut(vRaw) // soft spring: a touch past, then settles
      const vc = clamp01(v)

      // A: sitting on the cube.
      tmp.normal.copy(face.normal).applyQuaternion(tmp.qCube)
      tmp.onCube.copy(tmp.normal).multiplyScalar(S / 2 + S * 0.004).add(tmp.center)
      tmp.qFace.multiplyQuaternions(tmp.qCube, face.quat)

      // B: drifted apart in 3D, gaps opening, already leaning toward its grid spot.
      toWorld(rc.left + rc.width / 2, rc.top + rc.height / 2, tmp.grid)
      tmp.apart
        .copy(tmp.normal)
        .multiplyScalar(S * 0.9)
        .add(tmp.center)
        .addScaledVector(tmp.offset.subVectors(tmp.grid, tmp.gridCenter), 0.35)

      // C: flat card in the grid.
      tmp.pos.lerpVectors(tmp.onCube, tmp.apart, u).lerp(tmp.grid, v)
      mesh.quaternion.slerpQuaternions(tmp.qFace, tmp.identity, u)

      tmp.hover[i] = THREE.MathUtils.damp(tmp.hover[i], stage.hover === i && p > 0.97 ? 1 : 0, 10, dt)

      // Idle play: a slow, random-looking float and sway for each card (calmer under the cursor).
      const w = play * (1 - 0.75 * tmp.hover[i])
      if (w > 0) {
        const { phase: ph, speed: sp } = idle[i]
        const wave = (j: number) => Math.sin(t * sp[j] + ph[j])
        tmp.pos.x += (wave(0) + 0.5 * wave(1)) * 5 * k * w
        tmp.pos.y += (wave(2) + 0.5 * wave(3)) * 5 * k * w
        tmp.qIdle.setFromEuler(tmp.euler.set(wave(4) * 0.07 * w, wave(5) * 0.07 * w, wave(6) * 0.035 * w, 'XYZ'))
        mesh.quaternion.multiply(tmp.qIdle)
      }
      mesh.position.copy(tmp.pos)

      const faceWorld = S * FACE_INSET
      const scale = THREE.MathUtils.lerp(faceWorld, rc.width * k, v) * (1 + tmp.hover[i] * 0.03)
      mesh.scale.setScalar(scale)

      const px = Math.max(scale / k, 1)
      const uniforms = faces[i].material.uniforms
      uniforms.uRadius.value = THREE.MathUtils.lerp(0.035, Math.min(24 / px, 0.2), vc)
      uniforms.uBorder.value = Math.max(1.5 / px, 0.003)
      uniforms.uLight.value = 1 - vc
    }

    // The white rounded body shrinks away as the faces separate.
    const body = bodyRef.current
    if (body) {
      const bodyScale = S * 0.995 * (1 - smooth(0, 0.35, sep))
      body.visible = bodyScale > S * 0.01
      body.position.copy(tmp.center)
      body.quaternion.copy(tmp.qCube)
      body.scale.setScalar(Math.max(bodyScale, 0.0001))
    }

    // Floating shadow: smaller and fainter as the cube floats up; fades as it opens.
    const shadow = shadowRef.current
    if (shadow) {
      const lift = (floatY / FLOAT_PX) * 0.5 + 0.5
      shadow.position.set(tmp.center.x, tmp.center.y - floatY * k - S * 1.05, -S * 0.3)
      shadow.scale.set(S * (1.45 - lift * 0.12), S * 0.32, 1)
      ;(shadow.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - smooth(0, 0.3, sep)) * (1 - lift * 0.18)
    }
  })

  return (
    <>
      <ambientLight intensity={1.7} />
      <directionalLight position={[-3, 4, 6]} intensity={1.1} />
      <mesh ref={shadowRef} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} />
      </mesh>
      <RoundedBox ref={bodyRef} args={[1, 1, 1]} radius={BODY_RADIUS} smoothness={lite ? 3 : 5}>
        <meshStandardMaterial color="#fdfcff" roughness={0.55} metalness={0} />
      </RoundedBox>
      {faces.map((f, i) => (
        <mesh key={i} ref={(m) => void (faceRefs.current[i] = m)} material={f.material}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </>
  )
}

/** Full-screen, see-through 3D layer that follows the hero's slot and grid. */
export default function CubeCanvas({ stage, active, lite: liteStart }: Props) {
  const [lite, setLite] = useState(liteStart)
  const [dpr, setDpr] = useState(liteStart ? 1 : Math.min(window.devicePixelRatio, 2))

  return (
    <Canvas
      className="cube-canvas"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 20, visibility: active ? 'visible' : 'hidden' }}
      frameloop={active ? 'always' : 'never'}
      dpr={dpr}
      camera={{ fov: FOV, position: [0, 0, CAMERA_Z], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.NoToneMapping }}
    >
      {/* If frames start dropping, lower the resolution instead of stuttering. */}
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1)
          setLite(true)
          document.documentElement.classList.add('lite')
        }}
      />
      <Scene stage={stage} active={active} lite={lite} />
    </Canvas>
  )
}
