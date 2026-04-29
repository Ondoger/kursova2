import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { AnimatedNumber } from '../UI/AnimatedNumber';
export function StatsCards() {
    const stats = useStore((s) => s.stats);
    if (!stats)
        return null;
    const cards = [
        {
            label: 'Total Commits',
            value: stats.totalCommits,
            color: '#00ffff',
            icon: '',
            caption: 'усього',
        },
        {
            label: 'Current Streak',
            value: stats.currentStreak,
            color: '#ff7e29',
            icon: '',
            caption: `рекорд: ${stats.longestStreak} днів`,
        },
        {
            label: 'Languages',
            value: stats.languagesCount,
            color: '#a855f7',
            icon: '',
            caption: 'мов програмування',
        },
        {
            label: 'Repositories',
            value: stats.totalRepos,
            color: '#10ffa5',
            icon: '',
            caption: `${stats.publicRepos} публічних`,
        },
        {
            label: 'Stars Earned',
            value: stats.totalStars,
            color: '#fbbf24',
            icon: '',
            caption: `${stats.totalForks} форків`,
        },
        {
            label: 'Followers',
            value: stats.followers,
            color: '#ff00ff',
            icon: '',
            caption: `${stats.following} підписок`,
        },
    ];
    return (<div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((c, i) => (<motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass p-4 relative overflow-hidden group" whileHover={{ y: -3, scale: 1.02 }}>
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-30 blur-2xl group-hover:opacity-60 transition-opacity" style={{ background: c.color }}/>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-white/50 font-display">
              {c.label}
            </span>
            <span className="text-xl" style={{ filter: `drop-shadow(0 0 6px ${c.color})` }}>
              {c.icon}
            </span>
          </div>
          <div className="font-display font-black text-3xl" style={{ color: c.color, textShadow: `0 0 14px ${c.color}80` }}>
            <AnimatedNumber value={c.value} format="compact"/>
          </div>
          {c.caption && (<div className="text-[11px] text-white/40 mt-1">{c.caption}</div>)}
        </motion.div>))}
    </div>);
}
