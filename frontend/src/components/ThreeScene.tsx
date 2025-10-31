import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingShapeProps {
  position: [number, number, number];
  mousePosition: { x: number; y: number };
}

const FloatingShape = ({ position, mousePosition }: FloatingShapeProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const shapes = useMemo(() => ['sphere', 'box', 'torus'] as const, []);
  const shapeType = useMemo(() => shapes[Math.floor(Math.random() * shapes.length)], [shapes]);
  const color = useMemo(
    () => ['#00ffff', '#9d4edd', '#ff006e'][Math.floor(Math.random() * 3)],
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.01;

    const targetX = mousePosition.x * 0.5;
    const targetY = mousePosition.y * 0.5;
    meshRef.current.position.x += (position[0] + targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (position[1] - targetY - meshRef.current.position.y) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        {shapeType === 'sphere' && (
          <sphereGeometry args={[1, 32, 32]} />
        )}
        {shapeType === 'box' && (
          <boxGeometry args={[1, 1, 1]} />
        )}
        {shapeType === 'torus' && (
          <torusGeometry args={[1, 0.4, 16, 100]} />
        )}
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
};

const ParticleField = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 2000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 50;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    particlesRef.current.rotation.x = mousePosition.y * 0.2;
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial size={0.05} color="#00ffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
};

interface ThreeSceneProps {
  mousePosition: { x: number; y: number };
}

function ThreeScene({ mousePosition }: ThreeSceneProps): JSX.Element {
  const shapes = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10 - 5,
        ] as [number, number, number],
        key: i,
      })),
    []
  );

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 6], fov: 72 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#9d4edd" />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#ff006e" />

        <ParticleField mousePosition={mousePosition} />

        {shapes.map((shape) => (
          <FloatingShape key={shape.key} position={shape.position} mousePosition={mousePosition} />
        ))}
      </Canvas>
    </div>
  );
}

export default ThreeScene;
