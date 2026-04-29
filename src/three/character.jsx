import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { seededRandom } from '../utils/random';
/**
 * Procedural anime-style "code waifu" built from primitive geometries.
 * - Uses MeshStandardMaterial for soft toon-ish look
 * - Animates idle breathing, hair, sway, and reactive moods (victory / levelup / sad / working)
 * - Adds aura, particles, and wings depending on tier
 */
export function CodeWaifu({ tier, mood, level }) {
    const root = useRef(null);
    const head = useRef(null);
    const torso = useRef(null);
    const armL = useRef(null);
    const armR = useRef(null);
    const hairBack = useRef(null);
    const hairTwinL = useRef(null);
    const hairTwinR = useRef(null);
    const aura = useRef(null);
    const wings = useRef(null);
    const particlesRef = useRef(null);
    const eyeL = useRef(null);
    const eyeR = useRef(null);
    // Color palette derived from tier.
    const skin = '#ffe6d5';
    const hairColor = tier.color;
    const accent = tier.accent;
    const outfitMain = useMemo(() => {
        const c = new THREE.Color(tier.accent);
        c.offsetHSL(0, 0, -0.18);
        return `#${c.getHexString()}`;
    }, [tier.accent]);
    const outfitTrim = tier.color;
    // Particle system around character
    const { positions, colors } = useMemo(() => {
        const count = tier.hasParticles ? 220 : 0;
        const pos = new Float32Array(Math.max(count, 1) * 3);
        const col = new Float32Array(Math.max(count, 1) * 3);
        const palette = [new THREE.Color(tier.color), new THREE.Color(tier.accent), new THREE.Color('#ffffff')];
        for (let i = 0; i < count; i++) {
            const r = 1.4 + seededRandom(i + 17) * 1.6;
            const theta = seededRandom(i + 29) * Math.PI * 2;
            const y = (seededRandom(i + 41) - 0.5) * 3;
            pos[i * 3] = Math.cos(theta) * r;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = Math.sin(theta) * r;
            const c = palette[Math.floor(seededRandom(i + 53) * palette.length)];
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;
        }
        return { positions: pos, colors: col };
    }, [tier]);
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (!root.current)
            return;
        // === Idle base animation ===
        const breath = Math.sin(t * 1.6) * 0.04;
        if (torso.current)
            torso.current.scale.y = 1 + breath * 0.5;
        if (head.current) {
            head.current.position.y = 1.55 + breath * 0.5;
            head.current.rotation.y = Math.sin(t * 0.7) * 0.08;
            head.current.rotation.z = Math.sin(t * 0.5) * 0.03;
        }
        // Hair floating
        if (hairBack.current)
            hairBack.current.rotation.x = Math.sin(t * 1.2) * 0.05;
        if (hairTwinL.current)
            hairTwinL.current.rotation.z = 0.35 + Math.sin(t * 1.4) * 0.08;
        if (hairTwinR.current)
            hairTwinR.current.rotation.z = -0.35 - Math.sin(t * 1.4 + 0.5) * 0.08;
        // Default arm rest
        if (armL.current)
            armL.current.rotation.z = 0.18 + Math.sin(t * 1.2) * 0.04;
        if (armR.current)
            armR.current.rotation.z = -0.18 - Math.sin(t * 1.2 + 0.6) * 0.04;
        if (armL.current)
            armL.current.rotation.x = 0;
        if (armR.current)
            armR.current.rotation.x = 0;
        // Subtle sway
        root.current.rotation.y = Math.sin(t * 0.4) * 0.12;
        root.current.position.y = -0.2 + Math.sin(t * 1.2) * 0.04;
        // Eyes blink
        if (eyeL.current && eyeR.current) {
            const blink = Math.max(0.15, Math.min(1, Math.abs(Math.sin(t * 0.6) * 8 - 7)));
            eyeL.current.scale.y = blink;
            eyeR.current.scale.y = blink;
        }
        // === Mood overlays ===
        if (mood === 'victory') {
            const k = Math.min(1, (Math.sin(t * 6) + 1) / 2);
            if (armL.current)
                armL.current.rotation.z = 1.4 + k * 0.2;
            if (armR.current)
                armR.current.rotation.z = -1.4 - k * 0.2;
            if (root.current)
                root.current.position.y += Math.abs(Math.sin(t * 8)) * 0.2;
        }
        else if (mood === 'levelup') {
            const spin = Math.min(1, (t % 3) / 3);
            if (root.current) {
                root.current.rotation.y += 0.18;
                root.current.position.y += Math.abs(Math.sin(t * 6)) * 0.35;
                root.current.scale.setScalar(1 + Math.sin(t * 5) * 0.05);
            }
            if (armL.current)
                armL.current.rotation.z = 1.7;
            if (armR.current)
                armR.current.rotation.z = -1.7;
            void spin;
        }
        else if (mood === 'sad') {
            if (head.current) {
                head.current.rotation.x = 0.45;
                head.current.position.y = 1.45;
            }
            if (armL.current)
                armL.current.rotation.z = 0.05;
            if (armR.current)
                armR.current.rotation.z = -0.05;
            if (root.current)
                root.current.position.y -= 0.05;
        }
        else if (mood === 'working') {
            const k = Math.sin(t * 9);
            if (armL.current) {
                armL.current.rotation.z = 0.7;
                armL.current.rotation.x = -0.9 + k * 0.15;
            }
            if (armR.current) {
                armR.current.rotation.z = -0.7;
                armR.current.rotation.x = -0.9 - k * 0.15;
            }
            if (head.current)
                head.current.rotation.x = 0.18;
        }
        else {
            if (root.current)
                root.current.scale.setScalar(1);
        }
        // Aura pulse
        if (aura.current) {
            const m = aura.current.material;
            m.opacity = 0.18 + Math.sin(t * 2) * 0.08;
            aura.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);
            aura.current.rotation.y += 0.005;
        }
        if (wings.current) {
            wings.current.rotation.z = Math.sin(t * 2.2) * 0.18;
            wings.current.children[0].rotation.y = -0.5 + Math.sin(t * 4) * 0.25;
            wings.current.children[1].rotation.y = 0.5 - Math.sin(t * 4) * 0.25;
        }
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.005;
            const arr = particlesRef.current.geometry.attributes.position
                .array;
            for (let i = 0; i < arr.length; i += 3) {
                arr[i + 1] += 0.005;
                if (arr[i + 1] > 1.7)
                    arr[i + 1] = -1.5;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });
    return (<group ref={root} position={[0, -0.2, 0]}>
      {/* Soft floor disc */}
      <mesh position={[0, -1.55, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.5, 64]}/>
        <meshBasicMaterial color={accent} transparent opacity={0.35} side={THREE.DoubleSide}/>
      </mesh>
      <mesh position={[0, -1.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 64]}/>
        <meshBasicMaterial color={hairColor} transparent opacity={0.6} side={THREE.DoubleSide}/>
      </mesh>

      {/* Aura sphere */}
      {tier.hasAura && (<mesh ref={aura} position={[0, 0.2, 0]}>
          <sphereGeometry args={[2.0, 32, 32]}/>
          <meshBasicMaterial color={accent} transparent opacity={0.18} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false}/>
        </mesh>)}

      {/* Wings */}
      {tier.hasWings && (<group ref={wings} position={[0, 0.5, -0.25]}>
          <Wing side="left" color={accent} accent={hairColor}/>
          <Wing side="right" color={accent} accent={hairColor}/>
        </group>)}

      {/* Torso */}
      <group ref={torso} position={[0, 0.45, 0]}>
        {/* Upper body / dress */}
        <mesh castShadow position={[0, 0, 0]}>
          <capsuleGeometry args={[0.42, 0.7, 8, 24]}/>
          <meshStandardMaterial color={outfitMain} roughness={0.5} metalness={0.3}/>
        </mesh>
        {/* Trim collar */}
        <mesh position={[0, 0.45, 0]}>
          <torusGeometry args={[0.36, 0.05, 12, 32]}/>
          <meshStandardMaterial color={outfitTrim} emissive={outfitTrim} emissiveIntensity={0.6} roughness={0.3}/>
        </mesh>
        {/* Belt */}
        <mesh position={[0, -0.35, 0]}>
          <torusGeometry args={[0.42, 0.06, 12, 32]}/>
          <meshStandardMaterial color={outfitTrim} emissive={outfitTrim} emissiveIntensity={0.5}/>
        </mesh>
        {/* Skirt */}
        <mesh position={[0, -0.55, 0]}>
          <coneGeometry args={[0.6, 0.55, 24, 1, true]}/>
          <meshStandardMaterial color={outfitMain} roughness={0.55} metalness={0.25} side={THREE.DoubleSide}/>
        </mesh>
        {/* Skirt trim */}
        <mesh position={[0, -0.82, 0]}>
          <torusGeometry args={[0.55, 0.04, 8, 32]}/>
          <meshStandardMaterial color={outfitTrim} emissive={outfitTrim} emissiveIntensity={0.55}/>
        </mesh>
        {/* Glowing chest gem (level indicator) */}
        <mesh position={[0, 0.15, 0.42]}>
          <octahedronGeometry args={[0.08, 0]}/>
          <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={1.5}/>
        </mesh>

        {/* Legs */}
        <mesh position={[-0.18, -0.95, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.6, 16]}/>
          <meshStandardMaterial color={skin} roughness={0.6}/>
        </mesh>
        <mesh position={[0.18, -0.95, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.6, 16]}/>
          <meshStandardMaterial color={skin} roughness={0.6}/>
        </mesh>
        {/* Boots */}
        <mesh position={[-0.18, -1.3, 0.04]}>
          <boxGeometry args={[0.18, 0.14, 0.28]}/>
          <meshStandardMaterial color={outfitTrim} emissive={outfitTrim} emissiveIntensity={0.4}/>
        </mesh>
        <mesh position={[0.18, -1.3, 0.04]}>
          <boxGeometry args={[0.18, 0.14, 0.28]}/>
          <meshStandardMaterial color={outfitTrim} emissive={outfitTrim} emissiveIntensity={0.4}/>
        </mesh>
      </group>

      {/* Arm Left */}
      <group ref={armL} position={[-0.5, 0.55, 0]}>
        <mesh position={[-0.05, -0.35, 0]}>
          <capsuleGeometry args={[0.085, 0.55, 6, 16]}/>
          <meshStandardMaterial color={skin} roughness={0.55}/>
        </mesh>
        {/* Sleeve */}
        <mesh position={[-0.05, -0.05, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.18, 16]}/>
          <meshStandardMaterial color={outfitMain}/>
        </mesh>
      </group>

      {/* Arm Right */}
      <group ref={armR} position={[0.5, 0.55, 0]}>
        <mesh position={[0.05, -0.35, 0]}>
          <capsuleGeometry args={[0.085, 0.55, 6, 16]}/>
          <meshStandardMaterial color={skin} roughness={0.55}/>
        </mesh>
        <mesh position={[0.05, -0.05, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.18, 16]}/>
          <meshStandardMaterial color={outfitMain}/>
        </mesh>
      </group>

      {/* Head */}
      <group ref={head} position={[0, 1.55, 0]}>
        {/* Neck */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.085, 0.1, 0.18, 16]}/>
          <meshStandardMaterial color={skin} roughness={0.55}/>
        </mesh>
        {/* Face sphere */}
        <mesh>
          <sphereGeometry args={[0.42, 32, 32]}/>
          <meshStandardMaterial color={skin} roughness={0.55}/>
        </mesh>

        {/* Eyes */}
        <mesh ref={eyeL} position={[-0.14, 0.04, 0.36]}>
          <sphereGeometry args={[0.06, 16, 16]}/>
          <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={1.2}/>
        </mesh>
        <mesh ref={eyeR} position={[0.14, 0.04, 0.36]}>
          <sphereGeometry args={[0.06, 16, 16]}/>
          <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={1.2}/>
        </mesh>
        {/* Eye highlights */}
        <mesh position={[-0.12, 0.06, 0.41]}>
          <sphereGeometry args={[0.018, 8, 8]}/>
          <meshBasicMaterial color="#ffffff"/>
        </mesh>
        <mesh position={[0.16, 0.06, 0.41]}>
          <sphereGeometry args={[0.018, 8, 8]}/>
          <meshBasicMaterial color="#ffffff"/>
        </mesh>

        {/* Cheek blush */}
        <mesh position={[-0.22, -0.05, 0.32]}>
          <sphereGeometry args={[0.045, 12, 12]}/>
          <meshBasicMaterial color="#ff8aa8" transparent opacity={0.45}/>
        </mesh>
        <mesh position={[0.22, -0.05, 0.32]}>
          <sphereGeometry args={[0.045, 12, 12]}/>
          <meshBasicMaterial color="#ff8aa8" transparent opacity={0.45}/>
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.16, 0.39]}>
          <boxGeometry args={[0.06, 0.012, 0.01]}/>
          <meshBasicMaterial color="#ff7090"/>
        </mesh>

        {/* Hair: front fringe */}
        <mesh position={[0, 0.32, 0.18]}>
          <sphereGeometry args={[0.45, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]}/>
          <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={tier.hasAura ? 0.4 : 0.15} roughness={0.4}/>
        </mesh>
        {/* Side bangs */}
        <mesh position={[-0.32, 0.05, 0.2]} rotation={[0, 0.3, 0.3]}>
          <coneGeometry args={[0.13, 0.45, 12]}/>
          <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={tier.hasAura ? 0.4 : 0.15} roughness={0.4}/>
        </mesh>
        <mesh position={[0.32, 0.05, 0.2]} rotation={[0, -0.3, -0.3]}>
          <coneGeometry args={[0.13, 0.45, 12]}/>
          <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={tier.hasAura ? 0.4 : 0.15} roughness={0.4}/>
        </mesh>

        {/* Hair back */}
        <group ref={hairBack} position={[0, 0.05, -0.05]}>
          <mesh position={[0, -0.05, -0.18]}>
            <sphereGeometry args={[0.46, 24, 24]}/>
            <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={tier.hasAura ? 0.4 : 0.15} roughness={0.4}/>
          </mesh>
          <mesh position={[0, -0.45, -0.18]}>
            <coneGeometry args={[0.42, 0.7, 16]}/>
            <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={tier.hasAura ? 0.35 : 0.1} roughness={0.5}/>
          </mesh>
        </group>

        {/* Hair twin tails */}
        <group ref={hairTwinL} position={[-0.42, 0.1, -0.05]}>
          <mesh position={[0, -0.4, 0]} rotation={[0, 0, 0.35]}>
            <coneGeometry args={[0.1, 0.85, 12]}/>
            <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={tier.hasAura ? 0.4 : 0.12} roughness={0.45}/>
          </mesh>
          <mesh position={[0.05, 0.05, 0.05]}>
            <torusGeometry args={[0.09, 0.018, 8, 24]}/>
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6}/>
          </mesh>
        </group>
        <group ref={hairTwinR} position={[0.42, 0.1, -0.05]}>
          <mesh position={[0, -0.4, 0]} rotation={[0, 0, -0.35]}>
            <coneGeometry args={[0.1, 0.85, 12]}/>
            <meshStandardMaterial color={hairColor} emissive={hairColor} emissiveIntensity={tier.hasAura ? 0.4 : 0.12} roughness={0.45}/>
          </mesh>
          <mesh position={[-0.05, 0.05, 0.05]}>
            <torusGeometry args={[0.09, 0.018, 8, 24]}/>
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6}/>
          </mesh>
        </group>

        {/* Crown / halo for legendary */}
        {tier.hasWings && (<mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.025, 12, 32]}/>
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.6}/>
          </mesh>)}
      </group>

      {/* Floating particles */}
      {tier.hasParticles && (<points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]}/>
            <bufferAttribute attach="attributes-color" args={[colors, 3]}/>
          </bufferGeometry>
          <pointsMaterial size={0.05} sizeAttenuation vertexColors transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false}/>
        </points>)}

      {/* Level number floats above */}
      <group position={[0, 2.4, 0]}>
        <mesh>
          <ringGeometry args={[0.28, 0.32, 32]}/>
          <meshBasicMaterial color={hairColor} transparent opacity={0.7}/>
        </mesh>
      </group>
      {/* Decorative orb above for levelup mood */}
      {mood === 'levelup' && (<mesh position={[0, 2.6, 0]}>
          <sphereGeometry args={[0.18, 16, 16]}/>
          <meshBasicMaterial color={hairColor}/>
        </mesh>)}

      <group visible={false}>
        <mesh>
          <boxGeometry args={[0.01, 0.01, 0.01]}/>
          <meshBasicMaterial color={`hsl(${level}, 100%, 50%)`}/>
        </mesh>
      </group>
    </group>);
}
function Wing({ side, color, accent }) {
    const sign = side === 'left' ? -1 : 1;
    return (<group position={[sign * 0.55, 0, -0.35]} rotation={[0, sign * 0.5, 0]}>
      <mesh rotation={[0, 0, sign * 0.4]}>
        <coneGeometry args={[0.6, 1.6, 8]}/>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.7} side={THREE.DoubleSide}/>
      </mesh>
      <mesh position={[sign * 0.4, -0.4, 0]} rotation={[0, 0, sign * 0.6]}>
        <coneGeometry args={[0.4, 1.0, 6]}/>
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} transparent opacity={0.65} side={THREE.DoubleSide}/>
      </mesh>
    </group>);
}
