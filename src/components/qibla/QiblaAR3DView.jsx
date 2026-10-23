import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { CheckCircle2, RotateCw, RotateCcw, Sliders, ChevronDown, ChevronUp, Sparkles, Navigation } from "lucide-react";

/**
 * QiblaAR3DView
 *
 * Implements a true 3D WebGL Augmented Reality view for Qibla direction finder.
 * Renders a high-fidelity 3D metallic green arrow in 3D perspective space that
 * accurately tracks the geodesic direction of the Holy Kaaba in real-time,
 * regardless of whether the mobile is held:
 * - Straight up in the air (portrait camera mode, beta ~ 90°)
 * - Tilted at an angle (casual reading, beta ~ 45°)
 * - Lying flat on a surface (horizontal compass, beta ~ 0°)
 * - Angled, rolled, or pointed at any orientation
 */
export default function QiblaAR3DView({
  qiblaBearing,
  heading,
  pitch = 90,
  roll = 0,
  distanceKm,
  sensorAvailable = false,
  isAligned = false,
  diff = 0,
  onSimulateHeading,
  onSimulatePitch,
  onSimulateRoll,
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const arrowGroupRef = useRef(null);
  const kaabaBeaconRef = useRef(null);
  const laserBeamRef = useRef(null);
  const haloRingRef = useRef(null);
  const arrowMaterialsRef = useRef([]);
  const animFrameRef = useRef(null);

  // Desktop simulation controls drawer
  const [showControls, setShowControls] = useState(false);

  // Target angle diff normalized to [-180, 180]
  const shortestDiff = useMemo(() => {
    return ((qiblaBearing - heading + 540) % 360) - 180;
  }, [qiblaBearing, heading]);

  const absDiff = Math.abs(shortestDiff);
  const alignedNow = absDiff <= 3.5;

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera with 55° FOV matching standard smartphone back cameras
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(3, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x34d399, 1.0);
    dirLight2.position.set(-3, -2, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x10b981, 2.5, 8);
    pointLight.position.set(0, 0, 1);
    scene.add(pointLight);

    // ============================================================
    // BUILD 3D EMERALD GREEN NAVIGATIONAL ARROW
    // ============================================================
    const arrowGroup = new THREE.Group();
    // Position slightly below center so the arrow points into horizon reticle
    arrowGroup.position.set(0, -0.25, 0);
    scene.add(arrowGroup);
    arrowGroupRef.current = arrowGroup;

    // Materials: Rich Emerald Green with metallic sheen
    const greenBodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.65,
      roughness: 0.25,
      emissive: 0x064e3b,
      emissiveIntensity: 0.45,
    });

    const goldAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x78350f,
      emissiveIntensity: 0.3,
    });

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    arrowMaterialsRef.current = [greenBodyMaterial, goldAccentMaterial, haloMaterial, beamMaterial];

    // Sub-part A: Arrow Shaft (Hexagonal cylinder with tapered contour)
    const shaftGeom = new THREE.CylinderGeometry(0.12, 0.16, 1.7, 16);
    shaftGeom.rotateX(-Math.PI / 2); // align along -Z
    shaftGeom.translate(0, 0, -0.85); // start at Z=0, end at Z=-1.7
    const shaftMesh = new THREE.Mesh(shaftGeom, greenBodyMaterial);
    arrowGroup.add(shaftMesh);

    // Sub-part B: 3D Arrowhead (Cone pointing into -Z towards horizon)
    const headGeom = new THREE.ConeGeometry(0.38, 0.85, 24);
    headGeom.rotateX(-Math.PI / 2);
    headGeom.translate(0, 0, -2.125); // base at Z=-1.7, sharp tip at Z=-2.55
    const headMesh = new THREE.Mesh(headGeom, greenBodyMaterial);
    arrowGroup.add(headMesh);

    // Sub-part C: Golden Collar Ring at arrowhead joint
    const collarGeom = new THREE.TorusGeometry(0.19, 0.032, 12, 24);
    collarGeom.translate(0, 0, -1.7);
    const collarMesh = new THREE.Mesh(collarGeom, goldAccentMaterial);
    arrowGroup.add(collarMesh);

    // Sub-part D: Aerodynamic Tail Fins (4 fins radiating from tail)
    const finGeom1 = new THREE.BoxGeometry(0.035, 0.55, 0.45);
    finGeom1.translate(0, 0, -0.25);
    const fin1 = new THREE.Mesh(finGeom1, goldAccentMaterial);
    arrowGroup.add(fin1);

    const finGeom2 = new THREE.BoxGeometry(0.55, 0.035, 0.45);
    finGeom2.translate(0, 0, -0.25);
    const fin2 = new THREE.Mesh(finGeom2, goldAccentMaterial);
    arrowGroup.add(fin2);

    // Sub-part E: Pulsing Halo Ring (around center of arrow)
    const haloGeom = new THREE.TorusGeometry(0.48, 0.02, 12, 32);
    haloGeom.translate(0, 0, -1.0);
    const haloMesh = new THREE.Mesh(haloGeom, haloMaterial);
    arrowGroup.add(haloMesh);
    haloRingRef.current = haloMesh;

    // Sub-part F: Green Targeting Laser Beam towards Kaaba
    const beamGeom = new THREE.CylinderGeometry(0.02, 0.05, 14, 12);
    beamGeom.rotateX(-Math.PI / 2);
    beamGeom.translate(0, 0, -9.5); // extends from arrow tip into distance
    const beamMesh = new THREE.Mesh(beamGeom, beamMaterial);
    beamMesh.visible = false;
    arrowGroup.add(beamMesh);
    laserBeamRef.current = beamMesh;

    // Sub-part G: Horizon Compass Base Ring (subtle reference plane)
    const ringGeom = new THREE.RingGeometry(0.95, 1.0, 32);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
    });
    const baseRing = new THREE.Mesh(ringGeom, ringMat);
    baseRing.position.set(0, -0.2, -0.8);
    arrowGroup.add(baseRing);

    // ============================================================
    // BUILD 3D FLOATING KAABA BEACON (Visible in distance when facing Qibla)
    // ============================================================
    const kaabaBeacon = new THREE.Group();
    // Default position at distance along -Z
    kaabaBeacon.position.set(0, 0.4, -9.0);
    scene.add(kaabaBeacon);
    kaabaBeaconRef.current = kaabaBeacon;

    // Kaaba Cube (Black body)
    const kaabaGeom = new THREE.BoxGeometry(0.7, 0.75, 0.7);
    const kaabaMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      metalness: 0.1,
    });
    const kaabaMesh = new THREE.Mesh(kaabaGeom, kaabaMat);
    kaabaBeacon.add(kaabaMesh);

    // Golden Kiswah Band
    const bandGeom = new THREE.BoxGeometry(0.72, 0.12, 0.72);
    bandGeom.translate(0, 0.15, 0);
    const bandMesh = new THREE.Mesh(bandGeom, goldAccentMaterial);
    kaabaBeacon.add(bandMesh);

    // Kaaba Vertical Light Pillar / Sky Beam
    const pillarGeom = new THREE.CylinderGeometry(0.08, 0.22, 12, 16);
    pillarGeom.translate(0, 6, 0);
    const pillarMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });
    const pillarMesh = new THREE.Mesh(pillarGeom, pillarMat);
    kaabaBeacon.add(pillarMesh);

    // Golden Beacon Halo around Kaaba
    const kaabaHaloGeom = new THREE.RingGeometry(0.65, 0.8, 24);
    kaabaHaloGeom.rotateX(-Math.PI / 2);
    const kaabaHaloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const kaabaHalo = new THREE.Mesh(kaabaHaloGeom, kaabaHaloMat);
    kaabaHalo.position.y = -0.38;
    kaabaBeacon.add(kaabaHalo);

    // ============================================================
    // ANIMATION & RENDER LOOP
    // ============================================================
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle floating animation on Kaaba beacon
      if (kaabaBeaconRef.current) {
        kaabaBeaconRef.current.position.y = 0.4 + Math.sin(elapsed * 2) * 0.08;
        kaabaBeaconRef.current.rotation.y = elapsed * 0.4;
      }

      // Gentle pulse on halo ring
      if (haloRingRef.current) {
        const scale = 1.0 + Math.sin(elapsed * 3) * 0.06;
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

  // ============================================================
  // REAL-TIME 3D SPATIAL ORIENTATION TRANSFORMATION
  //
  // Controls the 3D arrow pose in real time based on:
  // 1. Difference between Qibla bearing and phone's camera heading (yaw)
  // 2. Physical device pitch (beta: 0° flat -> 90° upright in air -> 120° tilted)
  // 3. Physical device roll (gamma)
  // ============================================================
  useEffect(() => {
    if (!arrowGroupRef.current) return;

    // 1. Yaw: Angle difference between Qibla and current camera heading
    // When heading == qiblaBearing, deltaYaw = 0 => arrow points straight forward into -Z
    // When qibla is to the right (+deg), arrow turns right in 3D (rotation around Y = -deltaYaw)
    const deltaYawRad = (shortestDiff * Math.PI) / 180;
    const yawAngle = -deltaYawRad;

    // 2. Pitch: Phone tilt relative to horizon
    // When held straight up in the air (beta ~ 90°):
    // Camera looks horizontal at horizon => pitchOffset = 0 (arrow points straight ahead)
    // If tilted back towards sky (beta > 90°):
    // Arrow pitches downward in 3D towards the horizon
    // If phone is flat on table (beta ~ 0°):
    // Arrow lies along the surface pointing towards the top of the phone
    const safePitch = typeof pitch === "number" && !Number.isNaN(pitch) ? pitch : 90;
    const pitchRad = (safePitch * Math.PI) / 180;

    let pitchAngle = 0;
    if (safePitch >= 45) {
      // In air / AR camera mode: pitch is relative to upright vertical 90°
      // Tilted up (pitch > 90) => arrow dips down (-); tilted down (pitch < 90) => arrow points up (+)
      pitchAngle = -((safePitch - 90) * Math.PI) / 180;
    } else {
      // Transition towards flat on table (beta -> 0°)
      // At beta = 0°, arrow is lying flat (-PI/2) pointing along the phone surface
      const t = safePitch / 45; // 0 to 1
      const flatPitch = -Math.PI / 2;
      pitchAngle = flatPitch * (1 - t);
    }

    // 3. Roll: Phone rotation sideways (gamma)
    const safeRoll = typeof roll === "number" && !Number.isNaN(roll) ? roll : 0;
    const rollAngle = -(safeRoll * Math.PI) / 180;

    // Apply 3D Euler rotations (Order: Z-X-Y for aerospace stability)
    arrowGroupRef.current.rotation.order = "YXZ";
    arrowGroupRef.current.rotation.set(pitchAngle, yawAngle, rollAngle);

    // Position Kaaba beacon along the Qibla bearing in 3D world space
    if (kaabaBeaconRef.current) {
      // Place Kaaba at distance along the relative yaw direction
      const beaconDist = 9.0;
      const bx = Math.sin(deltaYawRad) * beaconDist;
      const bz = -Math.cos(deltaYawRad) * beaconDist;
      const by = 0.4 + Math.sin(pitchAngle) * beaconDist * 0.4;
      kaabaBeaconRef.current.position.set(bx, by, bz);

      // Only show Kaaba beacon when within ±40° field of view
      kaabaBeaconRef.current.visible = absDiff <= 42;
    }

    // Alignment visual feedback
    const [bodyMat, , haloMat, beamMat] = arrowMaterialsRef.current;
    if (bodyMat) {
      if (alignedNow) {
        bodyMat.color.setHex(0x34d399); // Radiant mint-emerald
        bodyMat.emissive.setHex(0x10b981);
        bodyMat.emissiveIntensity = 0.95;
      } else {
        bodyMat.color.setHex(0x10b981); // Solid Islamic green
        bodyMat.emissive.setHex(0x064e3b);
        bodyMat.emissiveIntensity = 0.45;
      }
    }

    if (laserBeamRef.current && beamMat) {
      laserBeamRef.current.visible = alignedNow;
      if (alignedNow) {
        beamMat.opacity = 0.75;
      }
    }

    if (haloMat) {
      haloMat.color.setHex(alignedNow ? 0x6ee7b7 : 0x34d399);
      haloMat.opacity = alignedNow ? 0.9 : 0.45;
    }
  }, [shortestDiff, pitch, roll, absDiff, alignedNow]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-10">
      {/* Three.js 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Dynamic 3D Alignment Reticle in Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {alignedNow ? (
          /* PERFECT ALIGNMENT: Radiant Emerald Targeting Lock */
          <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-48 h-48 rounded-full border-2 border-emerald-400/80 shadow-[0_0_50px_rgba(52,211,153,0.8)] animate-pulse flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border border-emerald-300/60 flex items-center justify-center">
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-emerald-400/50" />
                <div className="absolute h-full w-[1px] bg-emerald-400/50" />
              </div>
            </div>

            <div className="mt-6 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-400/80 text-emerald-200 shadow-xl backdrop-blur-md flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span className="text-xs font-bold tracking-wide">
                ALIGNED WITH KAABA (±{Math.round(absDiff * 10) / 10}°)
              </span>
            </div>
          </div>
        ) : (
          /* GUIDANCE STATE: Dynamic Directional Hints */
          <div className="relative flex flex-col items-center">
            {/* Subtle center crosshair for alignment reference */}
            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/40" />
            </div>

            {/* Turn instruction banner if off-angle */}
            <div className="mt-8 px-4 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-white shadow-xl flex items-center gap-2.5">
              {shortestDiff > 0 ? (
                <>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/25 border border-emerald-400/70 flex items-center justify-center text-emerald-400">
                    <RotateCw size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>Turn Right</span>
                      <span className="text-emerald-400 font-mono">+{Math.round(shortestDiff)}°</span>
                    </div>
                    <span className="text-[10.5px] text-stone-300">Rotate towards Kaaba</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/25 border border-emerald-400/70 flex items-center justify-center text-emerald-400">
                    <RotateCcw size={16} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>Turn Left</span>
                      <span className="text-emerald-400 font-mono">-{Math.round(absDiff)}°</span>
                    </div>
                    <span className="text-[10.5px] text-stone-300">Rotate towards Kaaba</span>
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
          <span>Phone: {heading}°</span>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
          <span>Pitch: {Math.round(pitch)}°</span>
          {pitch >= 70 && pitch <= 110 && (
            <span className="text-emerald-400 font-semibold">(Air/Upright)</span>
          )}
          {pitch < 30 && <span className="text-amber-400 font-semibold">(Flat)</span>}
        </div>
      </div>

      {/* Interactive Desktop / Laptop Simulation Controls Drawer */}
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
              {sensorAvailable ? "🟢 Hardware Gyro Active" : "🟠 Simulation Mode"}
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
                    onSimulatePitch?.(45);
                    onSimulateRoll?.(0);
                  }}
                  className={`px-2 py-0.5 rounded-md border text-[10.5px] cursor-pointer transition-all ${
                    Math.abs(pitch - 45) < 5
                      ? "bg-emerald-500/30 border-emerald-400 text-emerald-200"
                      : "bg-white/10 border-white/20 hover:bg-white/15"
                  }`}
                >
                  📐 Casual Tilt (45°)
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

              {/* Slider 2: Pitch (Tilt: 0° flat to 90° straight up to 120° tilted back) */}
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
