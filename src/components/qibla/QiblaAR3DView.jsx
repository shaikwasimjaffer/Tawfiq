import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";

/**
 * QiblaAR3DView
 *
 * Streamlined, high-performance 3D AR Directional Arrow for Qibla Navigation.
 *
 * Characteristics:
 * - 100% clean, distraction-free AR camera view with ZERO bottom sensor control drawers.
 * - Bold, unmistakable 3D directional arrow pointing directly forward towards the true Qibla (Kaaba).
 * - Sculpted emerald green aerodynamic body with gold centerline spine and forward tip beacon.
 * - Perfectly oriented in 3D camera space:
 *     * When aligned, the arrow points straight forward into the horizon towards the Kaaba.
 *     * When the user turns left or right, the arrow stays fixed in real-world direction,
 *       clearly showing the user which way to rotate their phone and body to face the Kaaba.
 * - Active mint-emerald glow pulse upon reaching alignment.
 */
export default function QiblaAR3DView({
  qiblaBearing,
  heading,
  pitch = 90,
  roll = 0,
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const arrowGroupRef = useRef(null);
  const animFrameRef = useRef(null);
  const targetQuatRef = useRef(new THREE.Quaternion());
  const forwardVecRef = useRef(new THREE.Vector3(0, 0, -1));
  const materialsRef = useRef([]);

  // Target angle difference normalized to [-180, 180]
  // deltaYawDeg > 0 means Qibla is to the right of current heading
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

  // Update target orientation quaternion whenever sensors update
  useEffect(() => {
    const deltaYawDeg = shortestDiff;
    const yawRad = (deltaYawDeg * Math.PI) / 180;

    // Pitch angle relative to portrait upright (90°)
    const safePitch = typeof pitch === "number" && !Number.isNaN(pitch) ? pitch : 90;
    const pitchRad = -((safePitch - 90) * Math.PI) / 180;

    // Roll angle
    const safeRoll = typeof roll === "number" && !Number.isNaN(roll) ? roll : 0;
    const rollRad = -(safeRoll * Math.PI) / 180;

    // Compute target 3D direction vector in camera space:
    // +X is camera right, +Y is camera up, -Z is camera forward (into the screen)
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

    const width = container.clientWidth || window.innerWidth || 360;
    const height = container.clientHeight || window.innerHeight || 640;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera: 50° FOV, balanced depth
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);
    camera.lookAt(0, 0, 0);

    // 3. WebGL Renderer with alpha transparency for camera feed
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.4);
    dirLight1.position.set(3, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x34d399, 1.4);
    dirLight2.position.set(-3, -2, 2);
    scene.add(dirLight2);

    // ============================================================
    // BUILD CLEAN, HIGH-CLARITY 3D AR DIRECTIONAL ARROW
    // ============================================================
    const arrowGroup = new THREE.Group();
    arrowGroup.position.set(0, -0.1, 0);
    scene.add(arrowGroup);
    arrowGroupRef.current = arrowGroup;

    materialsRef.current = [];

    // Metallic Islamic Emerald Material
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x064e3b,
      emissiveIntensity: 0.4,
    });
    materialsRef.current.push({
      mat: emeraldMat,
      baseColor: 0x10b981,
      alignedColor: 0x34d399,
      baseEmissive: 0x064e3b,
      alignedEmissive: 0x10b981,
      baseIntensity: 0.4,
      alignedIntensity: 1.0,
    });

    // Warm Gold Accent Material
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x78350f,
      emissiveIntensity: 0.35,
    });

    // Glowing Compass Horizon Ring Material
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

    // -------------------------------------------------------------
    // 1. Classical 3D Arrow Shape (Extruded clean chevron arrow)
    // -------------------------------------------------------------
    // Tip at (0, 0.72) pointing up in 2D (+Y).
    // When rotated around X by -PI/2: +Y rotates directly to -Z (FORWARD into the horizon)
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.72);
    arrowShape.lineTo(0.38, 0.16);
    arrowShape.lineTo(0.14, 0.16);
    arrowShape.lineTo(0.14, -0.52);
    arrowShape.lineTo(0, -0.38);
    arrowShape.lineTo(-0.14, -0.52);
    arrowShape.lineTo(-0.14, 0.16);
    arrowShape.lineTo(-0.38, 0.16);
    arrowShape.closePath();

    const extrudeSettings = {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };

    const arrowGeom = new THREE.ExtrudeGeometry(arrowShape, extrudeSettings);
    // Rotate so top (+Y tip) points directly forward along -Z towards destination
    arrowGeom.rotateX(-Math.PI / 2);
    arrowGeom.translate(0, 0, 0);

    const arrowMesh = new THREE.Mesh(arrowGeom, emeraldMat);
    arrowGroup.add(arrowMesh);

    // -------------------------------------------------------------
    // 2. Beveled Golden Spine / Ridge down the center of the arrow
    // -------------------------------------------------------------
    const spineGeom = new THREE.BoxGeometry(0.04, 0.035, 1.15);
    spineGeom.translate(0, 0.05, 0.06);
    const spineMesh = new THREE.Mesh(spineGeom, goldMat);
    arrowGroup.add(spineMesh);

    // -------------------------------------------------------------
    // 3. Radiant Guidance Tip Beacon (Bright pearl sphere at tip)
    // -------------------------------------------------------------
    const tipGeom = new THREE.SphereGeometry(0.05, 20, 20);
    // Tip is at Z = -0.74 along -Z
    tipGeom.translate(0, 0, -0.74);
    const tipMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const tipMesh = new THREE.Mesh(tipGeom, tipMat);
    arrowGroup.add(tipMesh);

    // -------------------------------------------------------------
    // 4. Ground Plane Spatial Horizon Ring (clean, floating below arrow)
    // -------------------------------------------------------------
    const baseDiscGeom = new THREE.RingGeometry(0.68, 0.74, 48);
    baseDiscGeom.rotateX(-Math.PI / 2);
    baseDiscGeom.translate(0, -0.16, 0);
    const baseDiscMesh = new THREE.Mesh(baseDiscGeom, ringMat);
    arrowGroup.add(baseDiscMesh);

    // ============================================================
    // ANIMATION LOOP (Smooth 60 FPS Slerp tracking & gentle breath)
    // ============================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smoothly slerp arrow quaternion towards target (responsive 60fps tracking)
      if (arrowGroupRef.current) {
        arrowGroupRef.current.quaternion.slerp(targetQuatRef.current, 0.22);
      }

      // Subtle forward momentum floating wave
      const floatWave = Math.sin(elapsed * 2.8) * 0.03;
      arrowMesh.position.z = -floatWave;
      spineMesh.position.z = -floatWave;
      tipMesh.position.z = -floatWave;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth || 360;
      const h = container.clientHeight || window.innerHeight || 640;
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
      arrowGeom.dispose();
      spineGeom.dispose();
      tipGeom.dispose();
      baseDiscGeom.dispose();
      emeraldMat.dispose();
      goldMat.dispose();
      ringMat.dispose();
      tipMat.dispose();
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
    </div>
  );
}
