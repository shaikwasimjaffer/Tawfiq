import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Sliders, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

/**
 * QiblaAR3DView
 *
 * Minimalist, high-clarity AR directional navigation indicator for Qibla.
 * Uses clean chevron / tapered directional geometry in refined emerald green with
 * subtle depth, clean ambient lighting, and elegant AR presence.
 *
 * Features:
 * - Immediate visual clarity: intuitive chevron / forward arrow indicating "Move this way".
 * - Fully maintains quaternion-based smooth slerp rotation without gimbal lock.
 * - Perfectly responsive to phone heading, pitch, and roll in real AR 3D space.
 * - Aligned state feedback with soft emerald glow and gentle pulse.
 * - Minimal, unobtrusive footprint so real-world camera view remains clear.
 */
export default function QiblaAR3DView({
  qiblaBearing,
  heading,
  pitch = 90,
  roll = 0,
  sensorAvailable = false,
  onSimulateHeading,
  onSimulatePitch,
  onSimulateRoll,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const indicatorGroupRef = useRef(null);
  const animFrameRef = useRef(null);
  const targetQuatRef = useRef(new THREE.Quaternion());
  const forwardVecRef = useRef(new THREE.Vector3(0, 0, -1));
  const chevronMeshesRef = useRef([]);

  // Desktop simulation controls drawer
  const [showControls, setShowControls] = useState(false);

  // Target angle diff normalized to [-180, 180]
  const shortestDiff = useMemo(() => {
    return ((qiblaBearing - heading + 540) % 360) - 180;
  }, [qiblaBearing, heading]);

  const absDiff = Math.abs(shortestDiff);

  // Alignment state with Hysteresis (enter at 4°, exit at 6°)
  const [isAlignedState, setIsAlignedState] = useState(false);

  useEffect(() => {
    setIsAlignedState((prev) => {
      if (!prev && absDiff <= 4.0) return true;
      if (prev && absDiff > 6.0) return false;
      return prev;
    });
  }, [absDiff]);

  // Update target orientation quaternion whenever sensors change
  useEffect(() => {
    const deltaYawDeg = shortestDiff;
    const yawRad = (deltaYawDeg * Math.PI) / 180;

    // Pitch angle relative to portrait upright (90°)
    const safePitch = typeof pitch === "number" && !Number.isNaN(pitch) ? pitch : 90;
    const pitchRad = -((safePitch - 90) * Math.PI) / 180;

    // Roll angle
    const safeRoll = typeof roll === "number" && !Number.isNaN(roll) ? roll : 0;
    const rollRad = -(safeRoll * Math.PI) / 180;

    // Compute target 3D direction vector in camera space
    const targetDir = new THREE.Vector3(
      Math.sin(yawRad) * Math.cos(pitchRad),
      Math.sin(pitchRad),
      -Math.cos(yawRad) * Math.cos(pitchRad)
    );

    // Apply roll around camera view axis (+Z)
    targetDir.applyAxisAngle(new THREE.Vector3(0, 0, 1), rollRad);
    targetDir.normalize();

    // Compute target quaternion from default forward (0, 0, -1) to targetDir
    targetQuatRef.current.setFromUnitVectors(forwardVecRef.current, targetDir);
  }, [shortestDiff, pitch, roll]);

  // Update visual materials on alignment state change
  useEffect(() => {
    chevronMeshesRef.current.forEach(({ mesh, baseColor, alignedColor }) => {
      if (!mesh?.material) return;
      if (isAlignedState) {
        mesh.material.color.setHex(alignedColor || 0x34d399);
        if (mesh.material.emissive) {
          mesh.material.emissive.setHex(0x10b981);
          mesh.material.emissiveIntensity = 0.9;
        }
      } else {
        mesh.material.color.setHex(baseColor || 0x10b981);
        if (mesh.material.emissive) {
          mesh.material.emissive.setHex(0x064e3b);
          mesh.material.emissiveIntensity = 0.35;
        }
      }
    });
  }, [isAlignedState]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);

    // 3. Transparent WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting - Balanced, clean studio lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(2, 4, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x34d399, 1.4);
    dirLight2.position.set(-2, -1, 2);
    scene.add(dirLight2);

    // ============================================================
    // BUILD CLEAN, INTUITIVE AR DIRECTIONAL NAVIGATION INDICATOR
    // ============================================================
    const indicatorGroup = new THREE.Group();
    // Position comfortably in center of view, slightly lowered to keep center clear
    indicatorGroup.position.set(0, -0.1, 0);
    scene.add(indicatorGroup);
    indicatorGroupRef.current = indicatorGroup;

    chevronMeshesRef.current = [];

    // Helper: Build a sleek extruded chevron shape pointing along -Z
    // X is horizontal width, Z is depth along direction of travel
    function createChevronGeometry(width, length, thickness, angleOffset = 0.35) {
      const shape = new THREE.Shape();
      const halfW = width / 2;
      const t = thickness;

      // Draw 2D V-shape in X-Y plane, which we will later rotate to lie on X-Z plane
      // Tip at (0, length)
      shape.moveTo(0, length);
      shape.lineTo(halfW, angleOffset);
      shape.lineTo(halfW - t * 0.7, 0);
      shape.lineTo(0, length - t * 1.3);
      shape.lineTo(-(halfW - t * 0.7), 0);
      shape.lineTo(-halfW, angleOffset);
      shape.closePath();

      const extrudeSettings = {
        depth: 0.04,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.012,
        bevelThickness: 0.012,
      };

      const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      // Rotate so it points forward towards -Z (into horizon)
      geom.rotateX(Math.PI / 2);
      // Center vertical extrusion
      geom.translate(0, 0, 0);
      return geom;
    }

    // --- Chevron 1: Primary Lead Chevron (Front, Sharp & Bright) ---
    const primaryChevronGeom = createChevronGeometry(0.72, 0.44, 0.16, 0.14);
    // Position lead chevron at forward position (Z = -0.45)
    primaryChevronGeom.translate(0, 0, -0.45);

    const primaryMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.5,
      roughness: 0.25,
      emissive: 0x064e3b,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.95,
    });
    const primaryChevronMesh = new THREE.Mesh(primaryChevronGeom, primaryMat);
    indicatorGroup.add(primaryChevronMesh);
    chevronMeshesRef.current.push({
      mesh: primaryChevronMesh,
      baseColor: 0x10b981,
      alignedColor: 0x34d399,
    });

    // --- Chevron 2: Supporting Mid Chevron ---
    const midChevronGeom = createChevronGeometry(0.58, 0.36, 0.14, 0.12);
    // Position mid chevron slightly behind lead (Z = -0.15)
    midChevronGeom.translate(0, 0, -0.15);

    const midMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0x064e3b,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.75,
    });
    const midChevronMesh = new THREE.Mesh(midChevronGeom, midMat);
    indicatorGroup.add(midChevronMesh);
    chevronMeshesRef.current.push({
      mesh: midChevronMesh,
      baseColor: 0x059669,
      alignedColor: 0x10b981,
    });

    // --- Chevron 3: Trailing Subtle Chevron ---
    const trailChevronGeom = createChevronGeometry(0.46, 0.28, 0.12, 0.1);
    // Position trail chevron at tail (Z = 0.1)
    trailChevronGeom.translate(0, 0, 0.1);

    const trailMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      metalness: 0.3,
      roughness: 0.35,
      emissive: 0x064e3b,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.5,
    });
    const trailChevronMesh = new THREE.Mesh(trailChevronGeom, trailMat);
    indicatorGroup.add(trailChevronMesh);
    chevronMeshesRef.current.push({
      mesh: trailChevronMesh,
      baseColor: 0x047857,
      alignedColor: 0x059669,
    });

    // --- Elegant Minimal Horizon Ring on the Ground Plane ---
    const horizonRingGeom = new THREE.RingGeometry(0.65, 0.68, 48);
    horizonRingGeom.rotateX(-Math.PI / 2);
    const horizonRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const horizonRingMesh = new THREE.Mesh(horizonRingGeom, horizonRingMat);
    horizonRingMesh.position.set(0, -0.04, -0.15);
    indicatorGroup.add(horizonRingMesh);

    // ============================================================
    // ANIMATION & RENDER LOOP WITH SMOOTH SLERP
    // ============================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smoothly slerp navigation indicator quaternion towards target (buttery smooth 60fps tracking)
      if (indicatorGroupRef.current) {
        indicatorGroupRef.current.quaternion.slerp(targetQuatRef.current, 0.20);
      }

      // Subtle, gentle forward floating / breathing motion to convey forward momentum
      const wave = Math.sin(elapsed * 2.8);
      primaryChevronMesh.position.z = wave * 0.035;
      midChevronMesh.position.z = Math.sin(elapsed * 2.8 - 0.4) * 0.025;
      trailChevronMesh.position.z = Math.sin(elapsed * 2.8 - 0.8) * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 640;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      primaryGeomDispose();
      scene.clear();
    };

    function primaryGeomDispose() {
      primaryChevronGeom.dispose();
      midChevronGeom.dispose();
      trailChevronGeom.dispose();
      horizonRingGeom.dispose();
      primaryMat.dispose();
      midMat.dispose();
      trailMat.dispose();
      horizonRingMat.dispose();
    }
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-10 flex flex-col justify-between">
      {/* Three.js 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Alignment Center Pulse Glow (Active only when facing Qibla) */}
      {isAlignedState && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-emerald-400/50 shadow-[0_0_40px_rgba(52,211,153,0.35)] animate-pulse" />
        </div>
      )}

      {/* Spacer to push controls to bottom */}
      <div className="flex-1 pointer-events-none" />

      {/* Responsive Bottom Sensor Controls Drawer */}
      <div className="relative z-30 px-3 pb-3 pointer-events-auto">
        <div className="bg-black/85 backdrop-blur-lg border border-white/20 rounded-2xl p-2.5 sm:p-3 shadow-2xl text-white">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowControls((prev) => !prev)}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-semibold text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer"
              aria-expanded={showControls}
            >
              <Sliders size={14} className="shrink-0 text-emerald-400" />
              <span>3D Orientation & Sensor Controls</span>
              {showControls ? (
                <ChevronDown size={14} className="shrink-0 text-stone-300" />
              ) : (
                <ChevronUp size={14} className="shrink-0 text-stone-300" />
              )}
            </button>

            {/* Sensor Verification Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 shrink-0 text-[11px] font-medium">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  sensorAvailable ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="text-stone-200">
                {sensorAvailable ? "Hardware Gyro Active" : "Manual / Simulation"}
              </span>
            </div>
          </div>

          {showControls && (
            <div className="mt-2.5 pt-2.5 border-t border-white/15 space-y-2 text-xs animate-in fade-in duration-150">
              {/* Preset Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10.5px]">
                <button
                  type="button"
                  onClick={() => {
                    onSimulatePitch?.(90);
                    onSimulateRoll?.(0);
                  }}
                  className={`px-2 py-1 rounded-lg border text-center font-medium cursor-pointer transition-all ${
                    Math.abs(pitch - 90) < 5
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
                      : "bg-white/5 border-white/15 hover:bg-white/10"
                  }`}
                >
                  📱 Upright (90°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSimulatePitch?.(65);
                    onSimulateRoll?.(0);
                  }}
                  className={`px-2 py-1 rounded-lg border text-center font-medium cursor-pointer transition-all ${
                    Math.abs(pitch - 65) < 5
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
                      : "bg-white/5 border-white/15 hover:bg-white/10"
                  }`}
                >
                  📐 Tilted (65°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSimulatePitch?.(0);
                    onSimulateRoll?.(0);
                  }}
                  className={`px-2 py-1 rounded-lg border text-center font-medium cursor-pointer transition-all ${
                    Math.abs(pitch) < 5
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
                      : "bg-white/5 border-white/15 hover:bg-white/10"
                  }`}
                >
                  🛏️ Flat (0°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSimulateHeading?.(qiblaBearing);
                    onSimulatePitch?.(90);
                    onSimulateRoll?.(0);
                  }}
                  className="px-2 py-1 rounded-lg bg-[#134D37] border border-emerald-400/60 text-emerald-100 font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} className="text-amber-300" />
                  <span>Align Kaaba</span>
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-stone-300 shrink-0 w-24">Heading:</span>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={heading}
                    onChange={(e) => onSimulateHeading?.(Number(e.target.value))}
                    className="flex-1 accent-emerald-400 cursor-pointer h-1.5"
                  />
                  <span className="font-mono text-emerald-300 w-10 text-right tabular-nums">
                    {Math.round(heading)}°
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-stone-300 shrink-0 w-24">Pitch / Tilt:</span>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={pitch}
                    onChange={(e) => onSimulatePitch?.(Number(e.target.value))}
                    className="flex-1 accent-emerald-400 cursor-pointer h-1.5"
                  />
                  <span className="font-mono text-emerald-300 w-10 text-right tabular-nums">
                    {Math.round(pitch)}°
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-stone-300 shrink-0 w-24">Roll:</span>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={roll}
                    onChange={(e) => onSimulateRoll?.(Number(e.target.value))}
                    className="flex-1 accent-emerald-400 cursor-pointer h-1.5"
                  />
                  <span className="font-mono text-emerald-300 w-10 text-right tabular-nums">
                    {Math.round(roll)}°
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
