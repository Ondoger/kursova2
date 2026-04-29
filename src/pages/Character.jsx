import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character3D } from '../components/Character/Character3D';
import { CharacterStats } from '../components/Character/CharacterStats';
import { GlassCard } from '../components/UI/GlassCard';
import { useStore } from '../store/useStore';
import { useAutoLoad } from '../hooks/useGitHub';
import { useCharacterLevel } from '../hooks/useCharacterLevel';
import { CHARACTER_TIERS } from '../utils/gamification';
import { NeonButton } from '../components/UI/NeonButton';
export function CharacterPage() {
    useAutoLoad();
    const username = useStore((s) => s.username);
    const stats = useStore((s) => s.stats);
    const characterName = useStore((s) => s.characterName);
    const setCharacterName = useStore((s) => s.setCharacterName);
    const triggerMood = useStore((s) => s.triggerMood);
    const data = useCharacterLevel();
    const [nameDraft, setNameDraft] = useState(characterName);
    const navigate = useNavigate();
    useEffect(() => {
        if (!username)
            navigate('/');
    }, [username, navigate]);
    if (!stats || !data)
        return null;
    // Skill tree from languages
    const skills = Object.entries(stats.languages)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    const maxSkill = skills[0]?.count ?? 1;
    return (<div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-widest text-white/40 font-display">
          Character profile
        </p>
        <h1 className="font-display font-black text-3xl md:text-4xl">
          <span className="text-gradient">{characterName}</span>
          <span className="text-white/35"> @{stats.user.login}</span>
        </h1>
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        {/* 3D Viewer */}
        <div className="space-y-4">
          <Character3D height="70vh" interactive showHud/>

          <GlassCard glow="cyan" hoverable={false}>
            <h3 className="font-display font-bold text-lg neon-text mb-2">
              Анімації та події
            </h3>
            <p className="text-xs text-white/50 mb-3">
              Перевір реакції персонажа. Ці ж кліпи використовуються для GitHub-подій.
            </p>
            <div className="flex flex-wrap gap-2">
              <NeonButton variant="primary" onClick={() => triggerMood('victory', 2400)}>
                 Clap / Achievement
              </NeonButton>
              <NeonButton variant="pink" onClick={() => triggerMood('levelup', 3500)}>
                 Joyful Jump / Level Up
              </NeonButton>
              <NeonButton variant="ghost" onClick={() => triggerMood('working', 3000)}>
                 Kneeling Pointing / Working
              </NeonButton>
              <NeonButton variant="ghost" onClick={() => triggerMood('sad', 2400)}>
                 Jump Down / Error
              </NeonButton>
              <NeonButton variant="ghost" onClick={() => triggerMood('climbing', 3200)}>
                 Climbing / Loading
              </NeonButton>
              <NeonButton variant="pink" onClick={() => triggerMood('rumbaDancing', 4200)}>
                 Rumba / Login
              </NeonButton>
              <NeonButton variant="primary" onClick={() => triggerMood('sittingLaughing', 3200)}>
                 Sitting Laugh / Refresh
              </NeonButton>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <GlassCard glow="pink" hoverable={false}>
            <h3 className="font-display font-bold text-lg neon-text-pink mb-3">
              Ім'я персонажа
            </h3>
            <div className="flex gap-2">
              <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Назви свого персонажа" className="min-w-0 flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-neon-pink/60 focus:outline-none transition-all"/>
              <NeonButton variant="pink" onClick={() => setCharacterName(nameDraft)} disabled={nameDraft.trim() === characterName} className="disabled:opacity-50 disabled:cursor-not-allowed">
                Save
              </NeonButton>
            </div>
          </GlassCard>

          <GlassCard glow="purple" hoverable={false}>
            <h3 className="font-display font-bold text-lg neon-text mb-3">
              RPG-статистика
            </h3>
            <CharacterStats />
          </GlassCard>

          <GlassCard glow="gold" hoverable={false}>
            <h3 className="font-display font-bold text-lg mb-3" style={{ color: '#fbbf24', textShadow: '0 0 10px #fbbf24' }}>
              Skill Tree
            </h3>
            {skills.length === 0 ? (<p className="text-sm text-white/40">Немає даних</p>) : (<ul className="space-y-2">
                {skills.map((s, i) => {
                const lvl = Math.min(99, Math.round((s.count / maxSkill) * 99));
                return (<motion.li key={s.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium truncate">{s.name}</span>
                          <span className="text-white/40 font-mono">Lv.{lvl}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${lvl}%` }} transition={{ duration: 1, delay: i * 0.05 }} className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" style={{ boxShadow: '0 0 8px rgba(0,255,255,0.5)' }}/>
                        </div>
                      </div>
                    </motion.li>);
            })}
              </ul>)}
          </GlassCard>

          <GlassCard glow="cyan" hoverable={false}>
            <h3 className="font-display font-bold text-lg neon-text mb-3">
              Тіри персонажа
            </h3>
            <ul className="space-y-2">
              {CHARACTER_TIERS.map((tier) => {
            const isCurrent = data.level >= tier.min && data.level <= tier.max;
            return (<li key={tier.name} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${isCurrent
                    ? 'bg-white/[0.06] border border-neon-cyan/40'
                    : 'border border-transparent opacity-70'}`} style={isCurrent
                    ? { boxShadow: `0 0 18px ${tier.color}40` }
                    : undefined}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{
                    background: tier.color,
                    boxShadow: `0 0 8px ${tier.color}`,
                }}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-display font-bold text-sm" style={{ color: tier.color }}>
                          {tier.name}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          Lvl {tier.min}{tier.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-snug">
                        {tier.description}
                      </p>
                    </div>
                  </li>);
        })}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>);
}
