import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { CheckCircle2, RotateCw, RotateCcw, Sliders, ChevronDown, ChevronUp, Sparkles, Navigation } from "lucide-react";

/**
 * QiblaAR3DView
 *
 * Implements a rock-solid, professional 3D WebGL Augmented Reality view for Qibla direction finder.
 * Renders a sleek 3D metallic emerald green arrow that accurately and smoothly tracks
 * the true geodesic direction of the Holy Kaaba in real-time 3D space.
 *
 * Fixes:
 * - Uses Quaternion-based slerp rotation for 100% stable, gimbal-lock-free orientation.
 * - Perfectly scaled to float in the center viewport without clipping or blocking the camera view.
 * - Compensates accurately for upright air posture (pitch ~ 90°), casual reading tilt (pitch ~ 65°),
 *   and roll without barrel-rolling or twitching.
 * - Stateful alignment hysteresis (enter at 4°, exit at 6°) to eliminate boundary flickering.
 */
export default function QiblaAR3DView({
  qiblaBearing,
  heading,
  pitch = 90,
  roll = 0,
  distanceKm,
  sensorAvailable = false,
  onSimulateHeading,
  onSimulatePitch,
  onSimulateRoll,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const arrowGroupRef = useRef(null);
  const kaabaBeaconRef = useRef(null);
  const laserBeamRef = useRef(null);
  const haloRingRef = useRef(null);
  const arrowMaterialsRef = useRef([]);
  const animFrameRef = useRef(null);
  const targetQuatRef = useRef(new THREE.Quaternion());
  const forwardVecRef = useRef(new THREE.Vector3(0, 0, -1));

  // Desktop simulation controls drawer
  const [showControls, setShowControls] = useState(false);

  // Target angle diff normalized to [-180, 180]
  const shortestDiff = useMemo(() => {
    return ((qiblaBearing - heading + 540) % 360) - 180;
  }, [qiblaBearing, heading]);

  const absDiff = Math.abs(shortestDiff);

  // Alignment state with Hysteresis (prevents flickering at boundary)
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

    // Position Kaaba beacon at distance
    if (kaabaBeaconRef.current) {
      const beaconDist = 7.5;
      const bx = Math.sin(yawRad) * beaconDist;
      const by = Math.sin(pitchRad) * beaconDist + 0.3;
      const bz = -Math.cos(yawRad) * beaconDist;
      kaabaBeaconRef.current.position.set(bx, by, bz);
      // Visible within front 42° FOV
      kaabaBeaconRef.current.visible = Math.abs(deltaYawDeg) <= 42;
    }
  }, [shortestDiff, pitch, roll]);

  // Update visual materials on alignment state change
  useEffect(() => {
    const [bodyMat, , haloMat, beamMat] = arrowMaterialsRef.current;
    if (bodyMat) {
      if (isAlignedState) {
        bodyMat.color.setHex(0x34d399); // Radiant mint-emerald
        bodyMat.emissive.setHex(0x10b981);
        bodyMat.emissiveIntensity = 1.1;
      } else {
        bodyMat.color.setHex(0x10b981); // Rich metallic Islamic green
        bodyMat.emissive.setHex(0x064e3b);
        bodyMat.emissiveIntensity = 0.4;
      }
    }

    if (laserBeamRef.current && beamMat) {
      laserBeamRef.current.visible = isAlignedState;
      if (isAlignedState) {
        beamMat.opacity = 0.8;
      }
    }

    if (haloMat) {
      haloMat.color.setHex(isAlignedState ? 0x6ee7b7 : 0x34d399);
      haloMat.opacity = isAlignedState ? 0.9 : 0.45;
    }
  }, [isAlignedState]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera: 50° FOV, positioned comfortably at (0, 0, 3.2)
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with transparent background to overlay on camera feed
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

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(2, 4, 3);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x34d399, 1.2);
    dirLight2.position.set(-2, -2, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x10b981, 2.0, 6);
    pointLight.position.set(0, 0, 1.5);
    scene.add(pointLight);

    // ============================================================
    // BUILD 3D SLEEK EMERALD GREEN NAVIGATIONAL ARROW
    // ============================================================
    const arrowGroup = new THREE.Group();
    arrowGroup.position.set(0, -0.15, 0);
    scene.add(arrowGroup);
    arrowGroupRef.current = arrowGroup;

    // Materials
    const greenBodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x064e3b,
      emissiveIntensity: 0.4,
    });

    const goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x78350f,
      emissiveIntensity: 0.3,
    });

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });

    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    arrowMaterialsRef.current = [greenBodyMaterial, goldAccentMaterial, haloMaterial, beamMaterial];

    // Sub-part A: Arrow Shaft (Slender cylinder, aligned along -Z)
    // From Z = 0.4 (tail) to Z = -0.5 (head junction)
    const shaftGeom = new THREE.CylinderGeometry(0.075, 0.095, 0.9, 16);
    shaftGeom.rotateX(-Math.PI / 2);
    shaftGeom.translate(0, 0, -0.05);
    const shaftMesh = new THREE.Mesh(shaftGeom, greenBodyMaterial);
    arrowGroup.add(shaftMesh);

    // Sub-part B: 3D Arrowhead (Sharp faceted cone pointing along -Z towards horizon)
    // Base at Z = -0.5, sharp tip at Z = -1.1
    const headGeom = new THREE.ConeGeometry(0.24, 0.6, 24);
    headGeom.rotateX(-Math.PI / 2);
    headGeom.translate(0, 0, -0.8);
    const headMesh = new THREE.Mesh(headGeom, greenBodyMaterial);
    arrowGroup.add(headMesh);

    // Sub-part C: Golden Collar Ring at arrowhead junction (Z = -0.5)
    const collarGeom = new THREE.TorusGeometry(0.12, 0.022, 12, 24);
    collarGeom.translate(0, 0, -0.5);
    const collarMesh = new THREE.Mesh(collarGeom, goldAccentMaterial);
    arrowGroup.add(collarMesh);

    // Sub-part D: Aerodynamic Tail Stabilizer Fins (at Z = 0.35)
    const finGeom1 = new THREE.BoxGeometry(0.025, 0.36, 0.28);
    finGeom1.translate(0, 0, 0.32);
    const fin1 = new THREE.Mesh(finGeom1, goldAccentMaterial);
    arrowGroup.add(fin1);

    const finGeom2 = new THREE.BoxGeometry(0.36, 0.025, 0.28);
    finGeom2.translate(0, 0, 0.32);
    const fin2 = new THREE.Mesh(finGeom2, goldAccentMaterial);
    arrowGroup.add(fin2);

    // Sub-part E: Pulsing Halo Ring (around center of arrow at Z = -0.1)
    const haloGeom = new THREE.TorusGeometry(0.36, 0.016, 12, 32);
    haloGeom.translate(0, 0, -0.1);
    const haloMesh = new THREE.Mesh(haloGeom, haloMaterial);
    arrowGroup.add(haloMesh);
    haloRingRef.current = haloMesh;

    // Sub-part F: Green Targeting Laser Beam towards Kaaba
    const beamGeom = new THREE.CylinderGeometry(0.015, 0.035, 10, 12);
    beamGeom.rotateX(-Math.PI / 2);
    beamGeom.translate(0, 0, -6.1);
    const beamMesh = new THREE.Mesh(beamGeom, beamMaterial);
    beamMesh.visible = false;
    arrowGroup.add(beamMesh);
    laserBeamRef.current = beamMesh;

    // Sub-part G: Subtle Horizon Compass Base Ring
    const baseRingGeom = new THREE.RingGeometry(0.68, 0.72, 32);
    baseRingGeom.rotateX(-Math.PI / 2);
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const baseRing = new THREE.Mesh(baseRingGeom, baseRingMat);
    baseRing.position.set(0, -0.18, 0);
    arrowGroup.add(baseRing);

    // ============================================================
    // BUILD 3D FLOATING KAABA BEACON (Visible in distance when facing Qibla)
    // ============================================================
    const kaabaBeacon = new THREE.Group();
    kaabaBeacon.position.set(0, 0.3, -7.5);
    scene.add(kaabaBeacon);
    kaabaBeaconRef.current = kaabaBeacon;

    // Kaaba Cube (Black body)
    const kaabaGeom = new THREE.BoxGeometry(0.55, 0.6, 0.55);
    const kaabaMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      metalness: 0.1,
    });
    const kaabaMesh = new THREE.Mesh(kaabaGeom, kaabaMat);
    kaabaBeacon.add(kaabaMesh);

    // Golden Kiswah Band
    const bandGeom = new THREE.BoxGeometry(0.57, 0.09, 0.57);
    bandGeom.translate(0, 0.12, 0);
    const bandMesh = new THREE.Mesh(bandGeom, goldAccentMaterial);
    kaabaBeacon.add(bandMesh);

    // Kaaba Vertical Sky Pillar of Light
    const pillarGeom = new THREE.CylinderGeometry(0.06, 0.18, 10, 16);
    pillarGeom.translate(0, 5, 0);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
    });
    const pillarMesh = new THREE.Mesh(pillarGeom, pillarMat);
    kaabaBeacon.add(pillarMesh);

    // Golden Halo Ring around Kaaba
    const kaabaHaloGeom = new THREE.RingGeometry(0.5, 0.65, 24);
    kaabaHaloGeom.rotateX(-Math.PI / 2);
    const kaabaHaloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const kaabaHalo = new THREE.Mesh(kaabaHaloGeom, kaabaHaloMat);
    kaabaHalo.position.y = -0.3;
    kaabaBeacon.add(kaabaHalo);

    // ============================================================
    // ANIMATION & RENDER LOOP WITH SLERP ROTATION
    // ============================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smoothly slerp arrow quaternion towards target (buttery smooth 60fps tracking)
      if (arrowGroupRef.current) {
        arrowGroupRef.current.quaternion.slerp(targetQuatRef.current, 0.20);
      }

      // Gentle floating animation on Kaaba beacon
      if (kaabaBeaconRef.current) {
        kaabaBeaconRef.current.position.y = 0.3 + Math.sin(elapsed * 2.2) * 0.06;
        kaabaBeaconRef.current.rotation.y = elapsed * 0.35;
      }

      // Gentle pulse on halo ring
      if (haloRingRef.current) {
        const scale = 1.0 + Math.sin(elapsed * 3) * 0.05;
        haloRingRef.current.scale.set(scale, scale, scale);
      }

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
      arrowMaterialsRef.current.forEach((m) => m?.dispose?.());
      scene.clear();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-10">
      {/* Three.js 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Dynamic 3D Alignment Reticle in Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isAlignedState ? (
          /* PERFECT ALIGNMENT: Radiant Emerald Targeting Lock */
          <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-40 h-40 rounded-full border-2 border-emerald-400/80 shadow-[0_0_40px_rgba(52,211,153,0.7)] animate-pulse flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border border-emerald-300/60 flex items-center justify-center">
                <div className="absolute w-full h-[1px] bg-emerald-400/50" />
                <div className="absolute h-full w-[1px] bg-emerald-400/50" />
              </div>
            </div>

            <div className="mt-5 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-400/80 text-emerald-200 shadow-xl backdrop-blur-md flex items-center gap-1.5">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-bold tracking-wide">
                ALIGNED WITH KAABA (±{Math.round(absDiff * 10) / 10}°)
              </span>
            </div>
          </div>
        ) : (
          /* GUIDANCE STATE: Dynamic Directional Hints */
          <div className="relative flex flex-col items-center">
            {/* Subtle center crosshair for alignment reference */}
            <div className="w-14 h-14 rounded-full border border-white/25 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            </div>

            {/* Turn instruction banner if off-angle */}
            <div className="mt-6 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white shadow-xl flex items-center gap-2">
              {shortestDiff > 0 ? (
                <>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/25 border border-emerald-400/70 flex items-center justify-center text-emerald-400">
                    <RotateCw size={14} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11.5px] font-bold flex items-center gap-1">
                      <span>Turn Right</span>
                      <span className="text-emerald-400 font-mono">+{Math.round(shortestDiff)}°</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/25 border border-emerald-400/70 flex items-center justify-center text-emerald-400">
                    <RotateCcw size={14} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11.5px] font-bold flex items-center gap-1">
                      <span>Turn Left</span>
                      <span className="text-emerald-400 font-mono">-{Math.round(absDiff)}°</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating 3D HUD Diagnostics & Orientation Info */}
      <div className="absolute top-14 left-3 right-3 flex items-center justify-between text-white text-[11px] font-mono pointer-events-none">
        <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
          <Navigation size={11} className="text-emerald-400" />
          <span>Kaaba: {qiblaBearing}°</span>
          <span className="text-stone-400">•</span>
          <span>Dev: {heading}°</span>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
          <span>Pitch: {Math.round(pitch)}°</span>
          {pitch >= 60 && pitch <= 120 && (
            <span className="text-emerald-400 font-semibold">(Air/Upright)</span>
          )}
          {pitch < 30 && <span className="text-amber-400 font-semibold">(Flat)</span>}
        </div>
      </div>

      {/* Interactive Desktop / Calibration Controls Drawer */}
      <div className="absolute bottom-2 left-3 right-3 pointer-events-auto z-30">
        <div className="bg-black/85 backdrop-blur-lg border border-white/20 rounded-2xl p-2.5 shadow-2xl text-white">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowControls((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 cursor-pointer"
            >
              <Sliders size={13} />
              <span>3D Orientation & Sensor Controls</span>
              {showControls ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>

            <span className="text-[10px] text-stone-400">
              {sensorAvailable ? "🟢 Hardware Gyro Active" : "🟠 Manual / Simulation"}
            </span>
          </div>

          {showControls && (
            <div className="mt-3 pt-2.5 border-t border-white/15 space-y-2.5 animate-in fade-in duration-150">
              {/* Quick Orientation Presets */}
              <div className="flex items-center gap-1.5 text-[10.5px]">
                <span className="text-stone-400 shrink-0">Presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    onSimulatePitch?.(90);
                    onSimulateRoll?.(0);
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[10.5px] cursor-pointer transition-all ${
                    Math.abs(pitch - 90) < 5
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
                      : "bg-white/10 border-white/20 hover:bg-white/15"
                  }`}
                >
                  📱 Straight Up in Air (90°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSimulatePitch?.(65);
                    onSimulateRoll?.(0);
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[10.5px] cursor-pointer transition-all ${
                    Math.abs(pitch - 65) < 5
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
                      : "bg-white/10 border-white/20 hover:bg-white/15"
                  }`}
                >
                  📐 Casual Tilt (65°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSimulatePitch?.(0);
                    onSimulateRoll?.(0);
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[10.5px] cursor-pointer transition-all ${
                    Math.abs(pitch) < 5
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
                      : "bg-white/10 border-white/20 hover:bg-white/15"
                  }`}
                >
                  🛏️ Flat (0°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSimulateHeading?.(qiblaBearing);
                    onSimulatePitch?.(90);
                  }}
                  className="ml-auto px-2 py-0.5 rounded-md bg-[#134D37] border border-emerald-400/60 text-emerald-100 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} className="text-amber-300" />
                  Align Kaaba
                </button>
              </div>

              {/* Slider 1: Heading */}
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-stone-300 w-24 shrink-0">Compass Heading:</span>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={heading}
                  onChange={(e) => onSimulateHeading?.(Number(e.target.value))}
                  className="flex-1 accent-emerald-400 cursor-pointer"
                  aria-label="Simulate compass heading"
                />
                <span className="font-mono text-emerald-300 w-10 text-right">{heading}°</span>
              </div>

              {/* Slider 2: Pitch */}
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-stone-300 w-24 shrink-0">Phone Pitch / Tilt:</span>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={pitch}
                  onChange={(e) => onSimulatePitch?.(Number(e.target.value))}
                  className="flex-1 accent-emerald-400 cursor-pointer"
                  aria-label="Simulate phone pitch tilt"
                />
                <span className="font-mono text-emerald-300 w-10 text-right">{Math.round(pitch)}°</span>
              </div>

              {/* Slider 3: Roll */}
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-stone-300 w-24 shrink-0">Phone Roll:</span>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={roll}
                  onChange={(e) => onSimulateRoll?.(Number(e.target.value))}
                  className="flex-1 accent-emerald-400 cursor-pointer"
                  aria-label="Simulate phone roll"
                />
                <span className="font-mono text-emerald-300 w-10 text-right">{Math.round(roll)}°</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
