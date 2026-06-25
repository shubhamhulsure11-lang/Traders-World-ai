'use client'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const MARKERS = [
  { lat: 38.9, lng: -77.0, city: 'Washington DC', flag: '🇺🇸', theme: 'Fed Policy', impact: 'Gold Bullish', confidence: 83, color: '#10b981' },
  { lat: 51.5, lng: -0.1, city: 'London', flag: '🇬🇧', theme: 'BOE Decision', impact: 'GBP Volatile', confidence: 71, color: '#0ea5e9' },
  { lat: 35.6, lng: 139.7, city: 'Tokyo', flag: '🇯🇵', theme: 'BOJ Policy', impact: 'JPY Bullish', confidence: 68, color: '#f59e0b' },
  { lat: 39.9, lng: 116.4, city: 'Beijing', flag: '🇨🇳', theme: 'PBOC Reserve', impact: 'Gold Bullish', confidence: 92, color: '#10b981' },
  { lat: 48.9, lng: 2.3, city: 'Frankfurt', flag: '🇪🇺', theme: 'ECB Minutes', impact: 'EUR Bullish', confidence: 74, color: '#0ea5e9' },
  { lat: 55.7, lng: 37.6, city: 'Moscow', flag: '🇷🇺', theme: 'Geopolitical', impact: 'Safe Haven', confidence: 78, color: '#ef4444' },
  { lat: 1.3, lng: 103.8, city: 'Singapore', flag: '🇸🇬', theme: 'Asian Markets', impact: 'Risk On', confidence: 65, color: '#8b5cf6' },
]

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

export default function Globe() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [activeMarker, setActiveMarker] = useState<typeof MARKERS[0] | null>(null)
  const [markerScreenPos, setMarkerScreenPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!mountRef.current) return
    const el = mountRef.current
    const w = el.clientWidth
    const h = el.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000)
    camera.position.z = 2.5

    const ambientLight = new THREE.AmbientLight(0x111133, 2)
    scene.add(ambientLight)
    const dirLight = new THREE.DirectionalLight(0x0ea5e9, 1.5)
    dirLight.position.set(5, 3, 5)
    scene.add(dirLight)
    const rimLight = new THREE.DirectionalLight(0x0369a1, 0.8)
    rimLight.position.set(-5, -3, -5)
    scene.add(rimLight)

    const globeGeo = new THREE.SphereGeometry(1, 64, 64)
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x050d1a,
      emissive: 0x020408,
      specular: 0x0ea5e9,
      shininess: 30,
      transparent: true,
      opacity: 0.95,
      wireframe: false,
    })
    const globe = new THREE.Mesh(globeGeo, globeMat)
    scene.add(globe)

    const wireGeo = new THREE.SphereGeometry(1.002, 28, 28)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.07,
    })
    scene.add(new THREE.Mesh(wireGeo, wireMat))

    const atmosGeo = new THREE.SphereGeometry(1.08, 64, 64)
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
    })
    scene.add(new THREE.Mesh(atmosGeo, atmosMat))

    const markerMeshes: THREE.Mesh[] = []
    MARKERS.forEach(m => {
      const pos = latLngToVec3(m.lat, m.lng, 1.02)
      const color = new THREE.Color(m.color)
      const geo = new THREE.SphereGeometry(0.022, 12, 12)
      const mat = new THREE.MeshBasicMaterial({ color })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.copy(pos)
      scene.add(mesh)
      markerMeshes.push(mesh)

      const ringGeo = new THREE.RingGeometry(0.03, 0.045, 32)
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.copy(pos)
      ring.lookAt(new THREE.Vector3(0, 0, 0))
      scene.add(ring)
    })

    let isDragging = false
    let prevMouse = { x: 0, y: 0 }
    let rotX = 0, rotY = 0
    let velX = 0, velY = 0.002

    const onMouseDown = (e: MouseEvent) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; velX = 0; velY = 0 }
    const onMouseUp = () => { isDragging = false }
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      velY = (e.clientX - prevMouse.x) * 0.005
      velX = (e.clientY - prevMouse.y) * 0.005
      rotX += velX; rotY += velY
      prevMouse = { x: e.clientX, y: e.clientY }
    }
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mouseup', onMouseUp)
    el.addEventListener('mousemove', onMouseMove)

    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    const onCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(markerMeshes)
      if (hits.length > 0) {
        const idx = markerMeshes.indexOf(hits[0].object as THREE.Mesh)
        setActiveMarker(MARKERS[idx])
        setMarkerScreenPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      } else {
        setActiveMarker(null)
      }
    }
    el.addEventListener('click', onCanvasClick)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (!isDragging) { velY *= 0.98; velX *= 0.95; rotY += velY; rotX += velX }
      globe.rotation.y = rotY
      globe.rotation.x = Math.max(-0.5, Math.min(0.5, rotX))
      markerMeshes.forEach((m, i) => {
        m.scale.setScalar(1 + 0.15 * Math.sin(Date.now() * 0.003 + i))
      })
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mouseup', onMouseUp)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('click', onCanvasClick)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{cursor:'grab'}}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-3 left-4">
        <p className="text-xs font-mono text-[#0ea5e9]/70 uppercase tracking-widest">GLOBAL INTELLIGENCE</p>
        <p className="text-[10px] text-slate-600 mt-0.5">{MARKERS.length} active markets monitored</p>
      </div>
      {activeMarker && (
        <div
          className="absolute glass-bright rounded-lg p-3 text-xs z-20 pointer-events-none"
          style={{ left: Math.min(markerScreenPos.x + 12, 260), top: Math.max(markerScreenPos.y - 80, 10), minWidth: '180px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{activeMarker.flag}</span>
            <span className="font-semibold text-white">{activeMarker.city}</span>
          </div>
          <p className="text-[#0ea5e9] font-medium">{activeMarker.theme}</p>
          <p className="text-emerald-400 text-[11px] mt-1">{activeMarker.impact}</p>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1">
              <span>Confidence</span>
              <span className="text-white font-mono">{activeMarker.confidence}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded">
              <div className="confidence-bar h-1 rounded" style={{ width: `${activeMarker.confidence}%` }} />
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-3 right-4 flex flex-col gap-1">
        {MARKERS.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: m.color }} />
            <span className="text-[10px] text-slate-500 font-mono">{m.city}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
