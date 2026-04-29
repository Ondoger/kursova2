import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character3D } from '../components/Character/Character3D';
import { StatsCards } from '../components/Dashboard/StatsCards';
import { CommitHeatmap } from '../components/Dashboard/CommitHeatmap';
import { LanguageChart } from '../components/Dashboard/LanguageChart';
import { ActivityGraph } from '../components/Dashboard/ActivityGraph';
import { Leaderboard } from '../components/Dashboard/Leaderboard';
import { TopRepos } from '../components/Dashboard/TopRepos';
import { useStore } from '../store/useStore';
import { useAutoLoad } from '../hooks/useGitHub';
import { useCharacterLevel } from '../hooks/useCharacterLevel';
import { evaluateAchievements } from '../utils/achievements';
import { GlassCard } from '../components/UI/GlassCard';
import { AnimatedNumber } from '../components/UI/AnimatedNumber';
export function Dashboard() {
    useAutoLoad();
    const username = useStore((s) => s.username);
    const stats = useStore((s) => s.stats);
    const loading = useStore((s) => s.loading);
    const error = useStore((s) => s.error);
    const characterName = useStore((s) => s.characterName);
    const data = useCharacterLevel();
    const navigate = useNavigate();
    useEffect(() => {
        if (!username)
            navigate('/');
    }, [username, navigate]);
    if (!stats) {
        return (<div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[minmax(320px,30%)_1fr] gap-6">
          <div className="h-[60vh] rounded-2xl skeleton"/>
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-28 rounded-2xl skeleton"/>))}
            </div>
            <div className="h-48 rounded-2xl skeleton"/>
            <div className="h-64 rounded-2xl skeleton"/>
          </div>
        </div>
        {loading && (<div className="text-center mt-6 text-white/50">
            Прокидаємо вайфу... 
          </div>)}
        {error && (<div className="mt-6 text-center text-neon-pink">{error}</div>)}
      </div>);
    }
    const evals = evaluateAchievements(stats);
    const unlockedCount = evals.filter((e) => e.unlocked).length;
    return (<div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40 font-display">
            Привіт, {stats.user.name ?? stats.user.login}
          </p>
          <h1 className="font-display font-black text-3xl md:text-4xl">
            <span className="text-gradient">{characterName}</span> готова до бою
          </h1>
        </div>
        {data && (<div className="text-right">
            <div className="text-xs text-white/40 uppercase tracking-widest">XP</div>
            <div className="font-display text-2xl font-bold text-gradient">
              <AnimatedNumber value={data.xp} format="compact"/>
            </div>
          </div>)}
      </motion.div>

      <div className="grid lg:grid-cols-[minmax(320px,30%)_1fr] gap-6">
        {/* LEFT: Character */}
        <div className="space-y-4">
          <Character3D height="50vh"/>

          {/* Level + XP bar */}
          {data && (<GlassCard glow="purple">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/40 font-display">
                    Рівень
                  </div>
                  <div className="font-display font-black text-3xl text-gradient">
                    {data.level}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-widest text-white/40 font-display">
                    Тір
                  </div>
                  <div className="font-display font-bold text-lg" style={{
                color: data.tier.color,
                textShadow: `0 0 8px ${data.tier.color}`,
            }}>
                    {data.tier.name}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/40 font-mono">
                  <span>{data.progress.into} XP</span>
                  <span>{data.progress.span} XP до Lvl {data.level + 1}</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${data.progress.percent}%` }} transition={{ duration: 1.4, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink" style={{
                boxShadow: '0 0 12px rgba(0,255,255,0.6), 0 0 24px rgba(255,0,255,0.4)',
                backgroundSize: '200% 100%',
                animation: 'gradientX 4s linear infinite',
            }}/>
                </div>
                <div className="text-[11px] text-white/50 mt-2 leading-snug">
                  {data.tier.description}
                </div>
              </div>
            </GlassCard>)}

          <GlassCard glow="cyan">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-sm uppercase tracking-widest">
                Ачівменти
              </h3>
              <span className="text-xs text-white/40">
                {unlockedCount} / {evals.length}
              </span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {evals.map((e) => (<div key={e.achievement.id} title={`${e.achievement.title}  ${e.achievement.description}`} className={`aspect-square rounded-md flex items-center justify-center text-sm transition-all ${e.unlocked
                ? 'bg-neon-cyan/15 border border-neon-cyan/40 shadow-[0_0_10px_rgba(0,255,255,0.4)]'
                : 'bg-white/5 border border-white/5 grayscale opacity-50'}`}>
                  {e.achievement.icon && (<img src={e.achievement.icon} alt={e.achievement.title} className={`w-full h-full rounded-[4px] object-cover ${e.unlocked ? '' : 'opacity-50'}`}/>)}
                </div>))}
            </div>
            <button onClick={() => navigate('/achievements')} className="text-xs text-neon-cyan hover:text-white mt-3 inline-flex items-center gap-1 transition-colors">
              Дивитись усі 
            </button>
          </GlassCard>
        </div>

        {/* RIGHT: Stats */}
        <div className="space-y-6">
          <StatsCards />

          <GlassCard glow="purple" hoverable={false}>
            <CommitHeatmap />
          </GlassCard>

          <div className="grid lg:grid-cols-2 gap-6">
            <GlassCard glow="cyan" hoverable={false}>
              <h3 className="font-display font-bold text-lg neon-text mb-3">
                Активність  останні 12 місяців
              </h3>
              <ActivityGraph />
            </GlassCard>
            <GlassCard glow="pink" hoverable={false}>
              <h3 className="font-display font-bold text-lg neon-text-pink mb-3">
                Мови програмування
              </h3>
              <LanguageChart />
            </GlassCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <GlassCard glow="gold" hoverable={false}>
              <h3 className="font-display font-bold text-lg mb-3">
                <span style={{ color: '#fbbf24', textShadow: '0 0 10px #fbbf24' }}>
                   Топ-репозиторії
                </span>
              </h3>
              <TopRepos />
            </GlassCard>
            <GlassCard glow="purple" hoverable={false}>
              <h3 className="font-display font-bold text-lg neon-text mb-3">
                 Світовий лідерборд
              </h3>
              <Leaderboard />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>);
}
