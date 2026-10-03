import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { memories } from '../../memories'
import { createFaceMaterial } from './faceMaterial'
import { createFaceTexture } from './textures'
import { PHASES, type Stage } from './stage'

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

const FOV = 30
const CAMERA_Z = 10
const FACE_INSET = 0.95 // photo size relative to the cube; the white rounded body shows around it
const BODY_RADIUS = 0.06

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
    () => memories.cube.slice(0, 6).map(() => ({ material: createFaceMaterial(new THREE.Texture()) })),
    [],
  )
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  // Picked once, so dropping to lite mode later doesn't reload every photo.
  const [texSize] = useState(lite ? 512 : 1024)

  useEffect(() => {
    const loaded = memories.cube.slice(0, 6).map((item, i) => {
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

  // ── Resting motion: slow spin, tilt toward the cursor, finger drag ──
  const rest = useRef({ spin: -0.6, tiltX: 0, tiltY: 0, targetX: 0, targetY: 0, dragX: 0, velocity: 0, dragging: false })

  useEffect(() => {
    const r = rest.current
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      r.targetY = (e.clientX / window.innerWidth - 0.5) * 0.7
      r.targetX = (e.clientY / window.innerHeight - 0.5) * 0.45
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const slot = stage.slot
    let lastX = 0
    let lastY = 0
    const down = (e: PointerEvent) => {
      r.dragging = true
      lastX = e.clientX
      lastY = e.clientY
      slot?.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!r.dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      r.spin += dx * 0.01
      r.velocity = dx * 0.01
      r.dragX = THREE.MathUtils.clamp(r.dragX + dy * 0.006, -0.6, 0.6)
    }
    const up = () => {
      r.dragging = false
    }
    slot?.addEventListener('pointerdown', down)
    slot?.addEventListener('pointermove', move)
    slot?.addEventListener('pointerup', up)
    slot?.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', onMove)
      slot?.removeEventListener('pointerdown', down)
      slot?.removeEventListener('pointermove', move)
      slot?.removeEventListener('pointerup', up)
      slot?.removeEventListener('pointercancel', up)
    }
  }, [stage])

  // Scratch objects reused every frame (no garbage while scrolling).
  const tmp = useMemo(
    () => ({
      qRest: new THREE.Quaternion(),
      qScript: new THREE.Quaternion(),
      qCube: new THREE.Quaternion(),
      qFace: new THREE.Quaternion(),
      identity: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      center: new THREE.Vector3(),
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

  useFrame((state, delta) => {
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
    // A turned cube looks about 1.35× wider than its edge, so size the edge
    // to make its outline fill the slot (≈380px desktop, 240px mobile).
    const restPx = slot.width * 0.74
    const centrePx = mobile ? Math.min(vw * 0.52, 240) : restPx * 1.12

    const turn = ease(range(p, PHASES.turn))
    const sep = range(p, PHASES.separate)
    const settle = range(p, PHASES.settle)

    const cubePx = THREE.MathUtils.lerp(restPx, centrePx, turn)
    const S = cubePx * k
    toWorld(
      THREE.MathUtils.lerp(slot.left + slot.width / 2, vw / 2, turn),
      THREE.MathUtils.lerp(slot.top + slot.height / 2, vh / 2, turn),
      tmp.center,
    )
    const bob = Math.sin(t * 1.1) * 0.025 * S * (1 - turn)
    tmp.center.y += bob

    // Resting rotation.
    const r = rest.current
    const restWeight = 1 - smooth(0, 0.1, p)
    if (!r.dragging) {
      r.velocity *= Math.pow(0.04, dt)
      r.spin += (0.22 * restWeight + r.velocity * 8) * dt
      r.dragX *= Math.pow(0.3, dt)
    }
    r.tiltX = THREE.MathUtils.damp(r.tiltX, r.targetX, 3, dt)
    r.tiltY = THREE.MathUtils.damp(r.tiltY, r.targetY, 3, dt)
    tmp.qRest.setFromEuler(tmp.euler.set(0.42 + r.tiltX + r.dragX, r.spin + r.tiltY, 0, 'XYZ'))

    // Scripted full turn: around once, dipping to show the top and the bottom.
    tmp.qScript.setFromEuler(tmp.euler.set(0.55 * Math.sin(turn * Math.PI * 2), -Math.PI * 2 * turn, 0, 'XYZ'))
    tmp.qCube.slerpQuaternions(tmp.qRest, tmp.qScript, 1 - restWeight)

    // Grid card centres (for the explode direction and final positions).
    const rects = stage.cards.map((el) => el?.getBoundingClientRect())
    tmp.gridCenter.set(0, 0, 0)
    rects.forEach((rc) => rc && tmp.gridCenter.add(toWorld(rc.left + rc.width / 2, rc.top + rc.height / 2, tmp.grid)))
    tmp.gridCenter.multiplyScalar(1 / 6)

    for (let i = 0; i < 6; i++) {
      const mesh = faceRefs.current[i]
      const rc = rects[i]
      if (!mesh || !rc) continue
      const face = FACES[i]
      const u = ease(stagger(sep, i))
      const v = ease(stagger(settle, i))

      // A: sitting on the cube.
      tmp.onCube.copy(face.normal).multiplyScalar(S / 2 + S * 0.004).applyQuaternion(tmp.qCube).add(tmp.center)
      tmp.qFace.multiplyQuaternions(tmp.qCube, face.quat)

      // B: drifted apart, gaps opening, already leaning toward its grid spot.
      toWorld(rc.left + rc.width / 2, rc.top + rc.height / 2, tmp.grid)
      tmp.apart
        .copy(face.normal)
        .multiplyScalar(S * 0.85)
        .add(tmp.center)
        .addScaledVector(tmp.offset.subVectors(tmp.grid, tmp.gridCenter), 0.35)

      // C: flat card in the grid.
      tmp.pos.lerpVectors(tmp.onCube, tmp.apart, u).lerp(tmp.grid, v)
      mesh.position.copy(tmp.pos)
      mesh.quaternion.slerpQuaternions(tmp.qFace, tmp.identity, u)

      tmp.hover[i] = THREE.MathUtils.damp(tmp.hover[i], stage.hover === i && p > 0.97 ? 1 : 0, 10, dt)
      const faceWorld = S * FACE_INSET
      const scale = THREE.MathUtils.lerp(faceWorld, rc.width * k, v) * (1 + tmp.hover[i] * 0.03)
      mesh.scale.setScalar(scale)

      const px = Math.max(scale / k, 1)
      const uniforms = faces[i].material.uniforms
      uniforms.uRadius.value = THREE.MathUtils.lerp(0.035, Math.min(24 / px, 0.2), v)
      uniforms.uBorder.value = Math.max(1.5 / px, 0.003)
      uniforms.uLight.value = 1 - v
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

    // Floating shadow, fading as the faces separate.
    const shadow = shadowRef.current
    if (shadow) {
      const lift = (bob / (0.025 * S || 1)) * 0.5 + 0.5
      shadow.position.set(tmp.center.x, tmp.center.y - bob - S * 1.02, -S * 0.3)
      shadow.scale.set(S * (1.45 - lift * 0.12), S * 0.32, 1)
      ;(shadow.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - smooth(0, 0.3, sep)) * (1 - lift * 0.15)
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
