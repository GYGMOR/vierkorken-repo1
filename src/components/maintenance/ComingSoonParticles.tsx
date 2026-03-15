'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Wine Cork Particle System
function WineCorks({ count = 15 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Generate random positions for corks
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10,
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ] as [number, number, number],
        speed: 0.1 + Math.random() * 0.2,
        rotationSpeed: [
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ] as [number, number, number],
      });
    }
    return temp;
  }, [count]);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      const matrix = new THREE.Matrix4();

      // Update position (floating motion)
      particle.position[1] += Math.sin(state.clock.elapsedTime + i) * 0.001;

      // Update rotation
      particle.rotation[0] += particle.rotationSpeed[0];
      particle.rotation[1] += particle.rotationSpeed[1];
      particle.rotation[2] += particle.rotationSpeed[2];

      // Apply transforms
      matrix.makeRotationFromEuler(new THREE.Euler(...particle.rotation));
      matrix.setPosition(...particle.position);

      meshRef.current!.setMatrixAt(i, matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Cork geometry: cylinder */}
      <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
      {/* Cork material: beige/tan color */}
      <meshStandardMaterial color="#D4A574" roughness={0.8} metalness={0.1} />
    </instancedMesh>
  );
}

// Grape Particle System
function Grapes({ count = 20 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 8,
        ] as [number, number, number],
        scale: 0.6 + Math.random() * 0.5,
        speed: 0.05 + Math.random() * 0.1,
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      const matrix = new THREE.Matrix4();

      // Gentle floating motion
      particle.position[0] += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.002;
      particle.position[1] += Math.cos(state.clock.elapsedTime * 0.3 + i) * 0.002;

      matrix.setPosition(...particle.position);
      matrix.scale(new THREE.Vector3(particle.scale, particle.scale, particle.scale));

      meshRef.current!.setMatrixAt(i, matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Grape geometry: sphere */}
      <sphereGeometry args={[0.3, 16, 16]} />
      {/* Grape material: deep burgundy/purple */}
      <meshStandardMaterial
        color="#6D2932"
        roughness={0.3}
        metalness={0.2}
        emissive="#6D2932"
        emissiveIntensity={0.1}
      />
    </instancedMesh>
  );
}

// Main Particle Scene
export function ComingSoonParticles() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} color="#FAF8F5" />
        <pointLight position={[-10, -10, -5]} intensity={0.4} color="#C9A961" />

        {/* Particles */}
        <WineCorks count={15} />
        <Grapes count={20} />
      </Canvas>
    </div>
  );
}
