import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_SRC = '/mohammad-character.glb'
// Matches the red vignette of the original video.
const BACKGROUND = 'radial-gradient(circle at 68% 42%, #a8181c 0%, #8c1517 45%, #6a0f0d 100%)'

// The model has no rig, so the head is turned in the vertex shader. The chin (front) and
// the back of the collar sit at the same height, so the neck blend runs along a tilted
// plane (y + NECK_TILT * z) that is lower at the back than at the front, and anything
// below BODY_FLOOR (collar and shoulders) never moves.
const NECK_TILT = 0.35
const NECK_BOTTOM = -0.24
const NECK_TOP = -0.08
const BODY_FLOOR = new THREE.Vector2(-0.21, -0.17)
const HEAD_PIVOT = new THREE.Vector3(0, -0.12, -0.08)
const HEAD_CENTER = new THREE.Vector3(0, 0.35, 0)

const MAX_YAW = 0.55 // ~32°
const MAX_PITCH = 0.3 // ~17°
const BODY_SHARE = 0.15 // fraction of the turn taken by the shoulders
const EASE = 6
const TOUCH_LINGER_MS = 1200 // how long the head keeps looking at a lifted finger

const HEAD_ROTATION_GLSL = /* glsl */ `
  uniform float uYaw;
  uniform float uPitch;
  uniform vec3 uPivot;
  uniform vec3 uNeck;
  uniform vec2 uFloor;

  float headWeight(vec3 p) {
    return smoothstep(uNeck.x, uNeck.y, p.y + uNeck.z * p.z) * smoothstep(uFloor.x, uFloor.y, p.y);
  }

  mat3 headRotation(float w) {
    float cy = cos(uYaw * w), sy = sin(uYaw * w);
    float cp = cos(uPitch * w), sp = sin(uPitch * w);
    mat3 rotY = mat3(cy, 0.0, -sy, 0.0, 1.0, 0.0, sy, 0.0, cy);
    mat3 rotX = mat3(1.0, 0.0, 0.0, 0.0, cp, sp, 0.0, -sp, cp);
    return rotY * rotX;
  }
`

type HeadUniforms = {
  uYaw: { value: number }
  uPitch: { value: number }
  uPivot: { value: THREE.Vector3 }
  uNeck: { value: THREE.Vector3 }
  uFloor: { value: THREE.Vector2 }
}

function applyHeadRotation(material: THREE.Material, uniforms: HeadUniforms) {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${HEAD_ROTATION_GLSL}`)
      .replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>
        objectNormal = headRotation(headWeight(position)) * objectNormal;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        transformed = headRotation(headWeight(position)) * (transformed - uPivot) + uPivot;`,
      )
  }
}

export default function HeadScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
    camera.position.set(0, 0.15, 3.9)
    camera.lookAt(0, 0.15, 0)

    scene.add(new THREE.HemisphereLight(0xfff1e6, 0x7a1c14, 1.6))
    const key = new THREE.DirectionalLight(0xffffff, 2.4)
    key.position.set(-2, 2.5, 3)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    key.shadow.bias = -0.0005
    key.shadow.normalBias = 0.02
    key.shadow.camera.left = key.shadow.camera.bottom = -1.2
    key.shadow.camera.right = key.shadow.camera.top = 1.2
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xffc2a8, 1.6)
    rim.position.set(2.5, 1, -2)
    scene.add(rim)

    const uniforms: HeadUniforms = {
      uYaw: { value: 0 },
      uPitch: { value: 0 },
      uPivot: { value: HEAD_PIVOT },
      uNeck: { value: new THREE.Vector3(NECK_BOTTOM, NECK_TOP, NECK_TILT) },
      uFloor: { value: BODY_FLOOR },
    }

    const body = new THREE.Group()
    scene.add(body)

    let disposed = false
    const meshes: THREE.Mesh[] = []
    const disposeMeshes = (items: THREE.Mesh[]) => {
      const materials = new Set<THREE.Material>()
      const textures = new Set<THREE.Texture>()
      for (const mesh of items) {
        mesh.geometry.dispose()
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          materials.add(material)
          for (const value of Object.values(material)) {
            if (value instanceof THREE.Texture) textures.add(value)
          }
        }
        mesh.customDepthMaterial?.dispose()
      }
      textures.forEach((texture) => texture.dispose())
      materials.forEach((material) => material.dispose())
    }
    new GLTFLoader().load(MODEL_SRC, (gltf) => {
      const parts: THREE.Mesh[] = []
      gltf.scene.updateMatrixWorld(true)
      gltf.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) parts.push(object)
      })
      if (disposed) {
        disposeMeshes(parts)
        return
      }
      // Bake Blender's axis transforms into every part so the shared deformation
      // uses the same Y-up coordinates across the face, eyes, hair, and clothing.
      for (const mesh of parts) {
        mesh.geometry.applyMatrix4(mesh.matrixWorld)
        mesh.position.set(0, 0, 0)
        mesh.quaternion.identity()
        mesh.scale.set(1, 1, 1)
        mesh.updateMatrix()
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          applyHeadRotation(material, uniforms)
        }
        const depthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })
        applyHeadRotation(depthMaterial, uniforms)
        mesh.customDepthMaterial = depthMaterial
        mesh.castShadow = true
        mesh.receiveShadow = true
        body.add(mesh)
        meshes.push(mesh)
      }
      setLoaded(true)
    })

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      // Shift the framing so the bust sits right of the copy on desktop, and pull back on
      // mobile so the whole head fits in the space above the bottom-aligned copy.
      if (w >= 768) {
        camera.position.z = 3.9
        camera.setViewOffset(w, h, -w * 0.2, 0, w, h)
      } else {
        camera.position.z = 3.9
        camera.clearViewOffset()
      }
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const pointer = { x: 0, y: 0, active: false }
    let releaseTimer = 0
    const aimAt = (x: number, y: number) => {
      pointer.x = x
      pointer.y = y
      pointer.active = true
      window.clearTimeout(releaseTimer)
    }

    // Mouse and pen. Touch is handled by the touch events below.
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') aimAt(e.clientX, e.clientY)
    }
    const onPointerLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') pointer.active = false
    }

    // Touch events keep firing while the page scrolls (pointer events get cancelled), so the
    // head follows the finger without blocking scroll, then eases back after it lifts.
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch) aimAt(touch.clientX, touch.clientY)
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return
      window.clearTimeout(releaseTimer)
      releaseTimer = window.setTimeout(() => {
        pointer.active = false
      }, TOUCH_LINGER_MS)
    }

    window.addEventListener('pointermove', onPointerMove)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('touchcancel', onTouchEnd)

    const headScreen = new THREE.Vector3()
    const current = { yaw: 0, pitch: 0 }
    const clock = new THREE.Clock()
    let frame = 0

    const tick = () => {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.1)

      let targetYaw = 0
      let targetPitch = 0
      if (pointer.active) {
        // Aim from where the head actually appears on screen, so the offset framing stays accurate.
        headScreen.copy(HEAD_CENTER).project(camera)
        const bounds = container.getBoundingClientRect()
        const hx = bounds.left + ((headScreen.x + 1) / 2) * bounds.width
        const hy = bounds.top + ((1 - headScreen.y) / 2) * bounds.height
        const nx = THREE.MathUtils.clamp((pointer.x - hx) / (window.innerWidth * 0.5), -1, 1)
        const ny = THREE.MathUtils.clamp((pointer.y - hy) / (window.innerHeight * 0.5), -1, 1)
        targetYaw = nx * MAX_YAW
        targetPitch = ny * MAX_PITCH
      }

      const k = 1 - Math.exp(-dt * EASE)
      current.yaw += (targetYaw - current.yaw) * k
      current.pitch += (targetPitch - current.pitch) * k

      body.rotation.y = current.yaw * BODY_SHARE
      uniforms.uYaw.value = current.yaw * (1 - BODY_SHARE)
      uniforms.uPitch.value = current.pitch

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.clearTimeout(releaseTimer)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      disposeMeshes(meshes)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0" style={{ background: BACKGROUND }}>
      <div
        ref={containerRef}
        className="portrait-canvas w-full transition-opacity duration-700 md:h-full"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  )
}
