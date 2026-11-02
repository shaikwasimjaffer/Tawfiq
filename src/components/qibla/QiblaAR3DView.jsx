import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Sliders, ChevronDown, ChevronUp } from "lucide-react";

/**
 * QiblaAR3DView
 *
 * Highly intuitive 3D AR Directional Arrow for Qibla Navigation.
 *
 * Key Design Principles:
 * 1. Unambiguous 3D Directional Geometry:
 *    - A sculpted 3D arrowhead pointing clearly along the forward trajectory towards the Kaaba.
 *    - Sleek tapered 3D body + aerodynamic chevron wings that provide immediate depth perspective.
 *    - Elevated slightly upward on a floating ground compass ring so the user can easily see which
 *      direction to turn in real 3D space, whether facing upright, tilted, or turning around.
 * 2. Visual Clarity & Friendly AR Interface:
 *    - Premium Islamic emerald-green color palette with metallic reflection and subtle glow.
 *    - Floating horizon target beacon at the head of the arrow indicating the Kaaba horizon.
 *    - Unobtrusive positioning: doesn't block the user's face or camera feed.
 * 3. Hysteresis & Smooth Quaternion Tracking:
 *    - Smooth slerp rotation without gimbal lock or erratic jumps.
 *    - Active glow feedback when aligned with Qibla.
 * 4. Clean Controls:
 *    - "Align Kaaba" artificial override button removed as requested.
 *    - Clean responsive slider/preset simulation controls for desktop testing.
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
  const arrowGroupRef = useRef(null);
  const animFrameRef = useRef(null);
  const targetQuatRef = useRef(new THREE.Quaternion());
  const forwardVecRef = useRef(new THREE.Vector3(0, 0, -1));
  const materialsRef = useRef([]);

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
    materialsRef.current.forEach(({ mat, baseColor, alignedColor, baseEmissive, alignedEmissive, baseIntensity, alignedIntensity }) => {
      if (!mat) return;
      if (isAlignedState) {
        if (alignedColor && mat.color) mat.color.setHex(alignedColor);
        if (mat.emissive) {
          mat.emissive.setHex(alignedEmissive || 0x10b981);
          mat.emissiveIntensity = alignedIntensity ?? 0.9;
        }
      } else {
        if (baseColor && mat.color) mat.color.setHex(baseColor);
        if (mat.emissive) {
          mat.emissive.setHex(baseEmissive || 0x064e3b);
          mat.emissiveIntensity = baseIntensity ?? 0.35;
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

    // 2. Camera: 50° FOV, comfortable distance
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer (Transparent background for camera view)
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

    // 4. Balanced 3D Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(3, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x34d399, 1.4);
    dirLight2.position.set(-3, -2, 2);
    scene.add(dirLight2);

    // ============================================================
    // BUILD USER-FRIENDLY 3D AR DIRECTIONAL ARROW
    // ============================================================
    const arrowGroup = new THREE.Group();
    // Position comfortably in center of viewport, slightly lower
    arrowGroup.position.set(0, -0.15, 0);
    scene.add(arrowGroup);
    arrowGroupRef.current = arrowGroup;

    materialsRef.current = [];

    // --- Material A: Primary Emerald Metallic Finish ---
    const primaryMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.6,
      roughness: 0.2,
      emissive: 0x064e3b,
      emissiveIntensity: 0.4,
    });
    materialsRef.current.push({
      mat: primaryMat,
      baseColor: 0x10b981,
      alignedColor: 0x34d399,
      baseEmissive: 0x064e3b,
      alignedEmissive: 0x10b981,
      baseIntensity: 0.4,
      alignedIntensity: 1.0,
    });

    // --- Material B: Warm Gold Accent Trim ---
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x78350f,
      emissiveIntensity: 0.3,
    });

    // --- Material C: Translucent Radiant Base Compass Disc ---
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    materialsRef.current.push({
      mat: ringMat,
      baseColor: 0x34d399,
      alignedColor: 0x6ee7b7,
    });

    // Sub-part 1: Sculpted 3D Arrowhead (Sharp pyramid/cone pointing forward along -Z)
    // Tip at Z = -0.95, base at Z = -0.42
    const headGeom = new THREE.ConeGeometry(0.26, 0.55, 4); // 4-sided faceted diamond pyramid
    headGeom.rotateY(Math.PI / 4); // Turn 45° so flat ridge faces top
    headGeom.rotateX(-Math.PI / 2); // Point towards -Z
    headGeom.translate(0, 0, -0.7);
    const headMesh = new THREE.Mesh(headGeom, primaryMat);
    arrowGroup.add(headMesh);

    // Sub-part 2: Golden Collar Ring at Head Junction (Z = -0.42)
    const collarGeom = new THREE.TorusGeometry(0.14, 0.022, 12, 24);
    collarGeom.translate(0, 0, -0.42);
    const collarMesh = new THREE.Mesh(collarGeom, goldMat);
    arrowGroup.add(collarMesh);

    // Sub-part 3: Tapered 3D Arrow Shaft (Extending back to Z = 0.38)
    const shaftGeom = new THREE.CylinderGeometry(0.08, 0.11, 0.8, 16);
    shaftGeom.rotateX(-Math.PI / 2);
    shaftGeom.translate(0, 0, -0.02);
    const shaftMesh = new THREE.Mesh(shaftGeom, primaryMat);
    arrowGroup.add(shaftMesh);

    // Sub-part 4: Dual Swept Aerodynamic Guide Wings / Chevrons
    // Clear horizontal visual fins telling the user which direction the arrow is pointing
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.36, -0.22);
    wingShape.lineTo(0.36, -0.34);
    wingShape.lineTo(0, -0.15);
    wingShape.lineTo(-0.36, -0.34);
    wingShape.lineTo(-0.36, -0.22);
    wingShape.closePath();

    const wingExtrude = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    wingExtrude.rotateX(Math.PI / 2);
    wingExtrude.translate(0, 0, 0.12);
    const wingMesh = new THREE.Mesh(wingExtrude, goldMat);
    arrowGroup.add(wingMesh);

    // Sub-part 5: Tail Fin (Vertical stabilizer)
    const tailFinGeom = new THREE.BoxGeometry(0.024, 0.28, 0.24);
    tailFinGeom.translate(0, 0.04, 0.28);
    const tailFinMesh = new THREE.Mesh(tailFinGeom, primaryMat);
    arrowGroup.add(tailFinMesh);

    // Sub-part 6: Floating Compass Horizon Ring (Gives 3D spatial grounding)
    const baseDiscGeom = new THREE.RingGeometry(0.65, 0.72, 40);
    baseDiscGeom.rotateX(-Math.PI / 2);
    baseDiscGeom.translate(0, -0.16, -0.1);
    const baseDiscMesh = new THREE.Mesh(baseDiscGeom, ringMat);
    arrowGroup.add(baseDiscMesh);

    // Sub-part 7: Front Direction Indicator Beacon / Dot (at tip)
    const beaconGeom = new THREE.SphereGeometry(0.045, 16, 16);
    beaconGeom.translate(0, 0, -1.02);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
    arrowGroup.add(beaconMesh);

    // ============================================================
    // ANIMATION LOOP (Smooth 60 FPS Slerp tracking & subtle breathing)
    // ============================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smoothly slerp arrow quaternion towards target
      if (arrowGroupRef.current) {
        arrowGroupRef.current.quaternion.slerp(targetQuatRef.current, 0.20);
      }

      // Gentle floating forward momentum wave (0.02 unit translation)
      const forwardPulse = Math.sin(elapsed * 2.5) * 0.025;
      headMesh.position.z = forwardPulse;
      beaconMesh.position.z = forwardPulse;

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
      headGeom.dispose();
      collarGeom.dispose();
      shaftGeom.dispose();
      wingExtrude.dispose();
      tailFinGeom.dispose();
      baseDiscGeom.dispose();
      beaconGeom.dispose();
      primaryMat.dispose();
      goldMat.dispose();
      ringMat.dispose();
      beaconMat.dispose();
      scene.clear();
    };
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
              {/* Preset Buttons Grid (Align Kaaba button removed) */}
              <div className="grid grid-cols-3 gap-1.5 text-[10.5px]">
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
