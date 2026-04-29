import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AchievementCard } from '../components/Achievements/AchievementCard';
import { GlassCard } from '../components/UI/GlassCard';
import { useStore } from '../store/useStore';
import { useAutoLoad } from '../hooks/useGitHub';
import { evaluateAchievements } from '../utils/achievements';
const FILTERS = [
    { id: 'all', label: 'Усі' },
    { id: 'unlocked', label: 'Розблоковані' },
    { id: 'locked', label: 'Заблоковані' },
    { id: 'common', label: 'Common' },
    { id: 'rare', label: 'Rare' },
    { id: 'epic', label: 'Epic' },
    { id: 'legendary', label: 'Legendary' },
];
export function AchievementsPage() {
    useAutoLoad();
    const username = useStore((s) => s.username);
    const stats = useStore((s) => s.stats);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    useEffect(() => {
        if (!username)
            navigate('/');
    }, [username, navigate]);
    const evals = useMemo(() => (stats ? evaluateAchievements(stats) : []), [stats]);
    const filtered = evals.filter((e) => {
        if (filter === 'all')
            return true;
        if (filter === 'unlocked')
            return e.unlocked;
        if (filter === 'locked')
            return !e.unlocked;
        return e.achievement.rarity === filter;
    });
    const unlocked = evals.filter((e) => e.unlocked).length;
    const total = evals.length;
    const percent = total ? Math.round((unlocked / total) * 100) : 0;
    if (!stats)
        return null;
    return (<div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40 font-display">
            Achievements
          </p>
          <h1 className="font-display font-black text-3xl md:text-4xl">
            <span className="text-gradient">Зал слави</span>
          </h1>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-white/40 font-display">
            Прогрес
          </div>
          <div className="font-display font-black text-3xl text-gradient">
            {unlocked}/{total}
          </div>
        </div>
      </motion.div>

      <GlassCard hoverable={false} glow="purple">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Загальний прогрес</span>
            <span className="font-mono text-neon-cyan">{percent}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1.4, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" style={{
            boxShadow: '0 0 14px rgba(0,255,255,0.6), 0 0 28px rgba(255,0,255,0.4)',
        }}/>
          </div>
        </div>
      </GlassCard>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (<button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-full border text-xs font-display uppercase tracking-widest transition-all ${filter === f.id
                ? 'bg-neon-cyan/15 border-neon-cyan/60 text-white shadow-[0_0_14px_rgba(0,255,255,0.3)]'
                : 'border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/30'}`}>
            {f.label}
          </button>))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e, i) => (<AchievementCard key={e.achievement.id} achievement={e.achievement} unlocked={e.unlocked} progress={e.progress} index={i}/>))}
        {filtered.length === 0 && (<div className="col-span-full text-center text-white/40 py-12">
            Нічого не знайдено
          </div>)}
      </div>
    </div>);
}
