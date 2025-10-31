import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Download, Smartphone } from 'lucide-react';

interface IntroProps {
  autoDismiss?: boolean;
  durationMs?: number;
  onComplete?: () => void;
}

// Type for the beforeinstallprompt event (not in lib.dom by default)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
}

const ExplosiveParticles = ({ count = 600 }: { count?: number }) => {
  const particlesRef = useRef<THREE.Points | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // create geometry + velocities once
  const { geometry, velocities } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      // start at origin
      positions[idx] = 0;
      positions[idx + 1] = 0;
      positions[idx + 2] = 0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.6 + Math.random() * 2.2;

      vels[idx] = Math.sin(phi) * Math.cos(theta) * speed;
      vels[idx + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vels[idx + 2] = Math.cos(phi) * speed;

      const colorChoice = Math.floor(Math.random() * 3);
      if (colorChoice === 0) {
        colors[idx] = 0;
        colors[idx + 1] = 1;
        colors[idx + 2] = 1;
      } else if (colorChoice === 1) {
        colors[idx] = 0.6;
        colors[idx + 1] = 0.2;
        colors[idx + 2] = 0.9;
      } else {
        colors[idx] = 1;
        colors[idx + 1] = 0;
        colors[idx + 2] = 0.4;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    // don't frustum cull for fullscreen effect
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);

    return { geometry: geo, velocities: vels };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // set velocitiesRef once
  useEffect(() => {
    velocitiesRef.current = velocities;
  }, [velocities]);

  // set start time at mount
  useEffect(() => {
    startTimeRef.current = performance.now() / 1000;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current || !velocitiesRef.current) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const delta = state.clock.getDelta(); // use delta for frame-rate independent movement

    // small multiplier to control spread speed
    const speedFactor = 1.0;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += velocitiesRef.current[i] * delta * speedFactor;
      positions[i + 1] += velocitiesRef.current[i + 1] * delta * speedFactor;
      positions[i + 2] += velocitiesRef.current[i + 2] * delta * speedFactor;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // fade whole particles over time (from mount)
    const start = startTimeRef.current ?? 0;
    const elapsed = state.clock.elapsedTime - (start - 0); // safe fallback
    const fade = Math.max(0, 1 - elapsed * 0.8);

    // Ensure material exists and set opacity
    const mat = particlesRef.current.material as THREE.PointsMaterial | undefined;
    if (mat) {
      mat.opacity = fade;
      mat.size = Math.max(0.02, 0.12 * fade); // shrink with fade
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.12}
        vertexColors={true}
        transparent={true}
        opacity={1}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const MorphingSphere = () => {
  const meshRef = useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    meshRef.current.rotation.x = time * 0.9;
    meshRef.current.rotation.y = time * 1.35;

    // smoother scale curve
    const scale = 1 + Math.min(3.5, time * 1.2);
    meshRef.current.scale.setScalar(scale);

    const mat = meshRef.current.material as THREE.MeshStandardMaterial | undefined;
    if (mat) {
      mat.transparent = true;
      mat.opacity = Math.max(0, 1 - time * 0.9);
      mat.emissiveIntensity = 1.8 + Math.sin(time * 2) * 0.6;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.9, 4]} />
      <meshStandardMaterial
        color="#00ffff"
        wireframe={true}
        transparent={true}
        opacity={1}
        emissive="#00ffff"
        emissiveIntensity={2}
      />
    </mesh>
  );
};

const Intro = ({ autoDismiss = true, durationMs = 2400, onComplete }: IntroProps) => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode || false);

    // listen for PWA install prompt
    const handler = (e: Event) => {
      // prevent the browser from showing the prompt immediately
      e.preventDefault?.();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!autoDismiss) return;
    const id = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate('/onboarding', { replace: true });
      }
    }, durationMs);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDismiss, durationMs, onComplete, navigate]);

  const handleClick = () => {
    if (onComplete) {
      onComplete();
    } else {
      navigate('/onboarding', { replace: true });
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      // show prompt
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (err) {
      console.warn('Install prompt failed', err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: Math.max(0, durationMs / 1000 - 0.4) }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      role="button"
      tabIndex={0}
    >
      {/* Canvas is purely decorative for this screen; let clicks pass through */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 72 }} style={{ width: '100%', height: '100%' }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={2.2} color="#00ffff" />
          <pointLight position={[-10, -10, -10]} intensity={2} color="#9d4edd" />

          <MorphingSphere />
          <ExplosiveParticles count={700} />
        </Canvas>
      </div>

      {/* big cyan blur */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2.8, 5.5], opacity: [0, 0.8, 0] }}
        transition={{ duration: durationMs / 1000, ease: 'easeOut' }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="h-[860px] w-[860px] max-w-full rounded-full bg-cyan-500/20 blur-[220px] overflow-hidden" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.3, 1.3, 1.6] }}
        transition={{ duration: durationMs / 1000, times: [0, 0.3, 0.75, 1] }}
        className="relative z-10 pointer-events-none"
      >
        <div className="text-center select-none">
          <h1 className="holographic-text text-6xl md:text-7xl font-extrabold tracking-wider">
            StablePay
          </h1>
          <div className="mt-3 text-cyan-200/90 text-lg md:text-xl tracking-wide">
            Global INR → USDT payments
          </div>
        </div>
      </motion.div>

      {/* decorative rings */}
      {[
        { delay: 0, scale: [0, 3], opacity: [0, 0.55, 0], durFactor: 0.8, cls: 'border-primary' },
        { delay: 0.1, scale: [0, 2.5], opacity: [0, 0.5, 0], durFactor: 0.7, cls: 'border-secondary' },
        { delay: 0.2, scale: [0, 2], opacity: [0, 0.5, 0], durFactor: 0.6, cls: 'border-accent' },
      ].map((r, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: r.scale, opacity: r.opacity }}
          transition={{
            duration: (durationMs / 1200) * r.durFactor,
            delay: r.delay,
            ease: 'easeOut',
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className={`h-full w-full rounded-full border-4 ${r.cls}`} />
        </motion.div>
      ))}

      {/* Install button - always visible for better UX */}
      {!isStandalone && (
        <div className="absolute bottom-10 z-20 w-full flex items-center justify-center pointer-events-auto px-4">
          {deferredPrompt ? (
            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent dismiss
                handleInstallClick();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:from-cyan-500 hover:to-blue-500 transition-all"
              aria-label="Install StablePay"
            >
              <Download size={20} />
              Install StablePay
            </button>
          ) : isIOS ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 max-w-sm border border-cyan-200">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg flex-shrink-0">
                  <Smartphone size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Install StablePay</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Tap <strong>Share</strong> <Download size={14} className="inline mx-1" /> then <strong>Add to Home Screen</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 max-w-sm border border-cyan-200">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-2 rounded-lg flex-shrink-0">
                  <Smartphone size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Install StablePay</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Tap the menu <strong>⋮</strong> and select <strong>Install app</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Intro;
