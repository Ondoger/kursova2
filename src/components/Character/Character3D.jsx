import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense } from 'react';
import { ModelWaifu } from '../../three/ModelWaifu';
import { moodToAnimation } from '../../three/animationMap';
import { useStore } from '../../store/useStore';
import { useCharacterLevel } from '../../hooks/useCharacterLevel';
import { CHARACTER_TIERS } from '../../utils/gamification';
export function Character3D({ height = '40vh', interactive = false, showHud = true }) {
    const mood = useStore((s) => s.mood);
    const loading = useStore((s) => s.loading);
    const characterName = useStore((s) => s.characterName);
    const data = useCharacterLevel();
    const tier = data?.tier ?? CHARACTER_TIERS[0];
    const level = data?.level ?? 1;
    const animation = loading ? 'idle' : moodToAnimation(mood);
    return (<div className="relative w-full overflow-hidden rounded-2xl" style={{ height }}>
      {/* Backdrop gradient */}
      <div className="absolute inset-0 -z-10" style={{
            background: `radial-gradient(ellipse at center, ${tier.accent}25, transparent 60%), linear-gradient(180deg, #060614 0%, #0a0a0f 100%)`,
        }}/>
      <div className="absolute inset-0 grid-bg opacity-40 -z-10"/>

      <Canvas camera={{ position: [0, 0.3, 4.4], fov: 35 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={0.55}/>
          <directionalLight position={[3, 5, 4]} intensity={1.4} color="#ffffff" castShadow/>
          <pointLight position={[-3, 2, 2]} intensity={1.2} color={tier.color}/>
          <pointLight position={[3, -1, 2]} intensity={0.9} color={tier.accent}/>
          <pointLight position={[0, 2, -2]} intensity={0.7} color="#a855f7"/>

          <ModelWaifu tier={tier} mood={mood} level={level} animation={animation}/>

          <Environment preset="night"/>

          {interactive && (<OrbitControls enablePan={false} enableZoom minDistance={2.6} maxDistance={7} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 1.6} autoRotate autoRotateSpeed={0.4}/>)}

          <EffectComposer>
            <Bloom intensity={1.1} luminanceThreshold={0.25} luminanceSmoothing={0.6} mipmapBlur/>
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* HUD overlay */}
      {showHud && (<div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between gap-3">
          <div className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-xs font-display tracking-widest uppercase">
            <span className="text-white/60">Tier</span>{' '}
            <span style={{ color: tier.color }} className="font-bold">
              {tier.name}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-xs font-display tracking-widest uppercase truncate">
            <span className="text-white/60">Name</span>{' '}
            <span className="font-bold text-gradient">{characterName}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-xs font-display tracking-widest uppercase">
            <span className="text-white/60">Lvl</span>{' '}
            <span className="font-bold text-gradient">{level}</span>
          </div>
        </div>)}
    </div>);
}
