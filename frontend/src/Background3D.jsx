
import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'
import { easing } from 'maath'

function ParticleWave(props) {
  const ref = useRef()

  // Optimization: Reduce count slightly for reliable 60fps, but keep them visible
  // 6000 is a good sweet spot (down from 8000)
  const [sphere] = useMemo(() => {
    const points = random.inSphere(new Float32Array(6000), { radius: 1.8 })
    return [points]
  }, [])

  useFrame((state, delta) => {
    // 1. Continuous rotation
    // We add this to the current rotation in a way that doesn't conflict with the damp
    // Actually, simpler: define a 'base' rotation and a 'target' rotation
    // But to keep it simple with maath:

    // Calculate target rotation based on mouse
    // Smoothness Fix: Use easing.dampE for Framerate-Independent Smoothing
    // This removes the "stutter" caused by irregular frame times
    const targetMoveCX = -state.pointer.y * 0.5
    const targetMoveCY = state.pointer.x * 0.5

    // We dampen the rotation towards the mouse target
    // The last argument is the 'smoothTime' - higher = smoother/slower catchup
    // delta ensures it's framerate independent
    easing.dampE(
      ref.current.rotation,
      [targetMoveCX, targetMoveCY, ref.current.rotation.z - delta / 15], // z rotates continuously
      0.5, // Smooth time (increase for "weightier" feel, less jitter)
      delta
    )

    // Breathing effect smoothed
    const t = state.clock.getElapsedTime()
    // Using simple math for scale is usually fine, no need to damp unless scale jumps
    ref.current.scale.setScalar(1 + Math.sin(t / 2) * 0.15)
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#8b5cf6"
          size={0.012}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
    </group>
  )
}

function FloatingGrid() {
  const ref = useRef()
  // Optimized count
  const [sphere] = useMemo(() => random.inSphere(new Float32Array(4000), { radius: 2.8 }), [])

  useFrame((state, delta) => {
    const targetX = -state.pointer.y * 0.2
    const targetY = state.pointer.x * 0.2

    // Smooth damping for the background layer too
    easing.dampE(
      ref.current.rotation,
      [targetX, targetY, ref.current.rotation.z + delta / 30],
      0.8, // Slower follow for depth
      delta
    )
  })

  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#3b82f6" size={0.008} sizeAttenuation={true} depthWrite={false} opacity={0.6} />
    </Points>
  )
}

function CameraRig() {
  useFrame((state, delta) => {
    // Smooth camera movement
    easing.damp3(
      state.camera.position,
      [
        -state.pointer.x * 0.5, // Target X
        -state.pointer.y * 0.5, // Target Y
        2.2 // Target Z (static)
      ],
      0.5, // Smooth time
      delta
    )
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export default function Background3D() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: -1,
      background: 'linear-gradient(to bottom right, #f8fafc, #eef2ff)'
    }}>
      {/* DPR prop helps with performance on high-res screens */}
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 2.2] }}>
        <CameraRig />
        <ParticleWave />
        <FloatingGrid />
      </Canvas>
    </div>
  )
}
