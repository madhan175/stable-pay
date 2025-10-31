import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface IntroProps {
  autoDismiss?: boolean;
  durationMs?: number;
  onComplete?: () => void;
}

const ExplosiveParticles = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);

  const { geometry, velocities } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = 0;
      positions[i + 1] = 0;
      positions[i + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 2 + Math.random() * 3;

      vels[i] = Math.sin(phi) * Math.cos(theta) * speed;
      vels[i + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vels[i + 2] = Math.cos(phi) * speed;

      const colorChoice = Math.floor(Math.random() * 3);
      if (colorChoice === 0) {
        colors[i] = 0;
        colors[i + 1] = 1;
        colors[i + 2] = 1;
      } else if (colorChoice === 1) {
        colors[i] = 0.6;
        colors[i + 1] = 0.2;
        colors[i + 2] = 0.9;
      } else {
        colors[i] = 1;
        colors[i + 1] = 0;
        colors[i + 2] = 0.4;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return { geometry: geo, velocities: vels };
  }, []);

  velocitiesRef.current = velocities;

  useFrame((state) => {
    if (!particlesRef.current || !velocitiesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocitiesRef.current[i] * 0.02;
      positions[i + 1] += velocitiesRef.current[i + 1] * 0.02;
      positions[i + 2] += velocitiesRef.current[i + 2] * 0.02;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    if (particlesRef.current.material instanceof THREE.PointsMaterial) {
      particlesRef.current.material.opacity = Math.max(0, 1 - time * 1.5);
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const MorphingSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    meshRef.current.rotation.x = time * 2;
    meshRef.current.rotation.y = time * 3;

    const scale = time < 0.5 ? 1 + time * 2 : 2 + (time - 0.5) * 10;
    meshRef.current.scale.setScalar(scale);

    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity = Math.max(0, 1 - time * 2);
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 4]} />
      <meshStandardMaterial
        color="#00ffff"
        wireframe
        transparent
        opacity={1}
        emissive="#00ffff"
        emissiveIntensity={2}
      />
    </mesh>
  );
};

const Intro = ({ autoDismiss = true, durationMs = 1200, onComplete }: IntroProps) => {
  useEffect(() => {
    if (!autoDismiss) return;
    const id = setTimeout(() => onComplete?.(), durationMs);
    return () => clearTimeout(id);
  }, [autoDismiss, durationMs, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: Math.max(0, durationMs / 1000 - 0.4) }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900"
      onClick={() => onComplete?.()}
    >
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 72 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2.2} color="#00ffff" />
          <pointLight position={[-10, -10, -10]} intensity={2} color="#9d4edd" />

          <MorphingSphere />
          <ExplosiveParticles />
        </Canvas>
      </div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2.8, 5.5], opacity: [0, 0.8, 0] }}
        transition={{ duration: durationMs / 1000, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[860px] w-[860px] rounded-full bg-cyan-500/20 blur-[220px]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.3, 1.3, 1.6] }}
        transition={{ duration: durationMs / 1000, times: [0, 0.3, 0.75, 1] }}
        className="relative z-10"
      >
        <div className="text-center">
          <h1 className="holographic-text text-6xl md:text-7xl font-extrabold tracking-wider">
            StablePay
          </h1>
          <div className="mt-3 text-cyan-200/90 text-lg md:text-xl tracking-wide">
            Global INR → USDT payments
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 3], opacity: [0, 0.55, 0] }}
        transition={{ duration: durationMs / 1200 * 0.8, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="h-full w-full rounded-full border-4 border-primary" />
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2.5], opacity: [0, 0.5, 0] }}
        transition={{ duration: durationMs / 1200 * 0.7, delay: 0.1, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="h-full w-full rounded-full border-4 border-secondary" />
      </motion.div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2], opacity: [0, 0.5, 0] }}
        transition={{ duration: durationMs / 1200 * 0.6, delay: 0.2, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="h-full w-full rounded-full border-4 border-accent" />
      </motion.div>
    </motion.div>
  );
};

export default Intro;


