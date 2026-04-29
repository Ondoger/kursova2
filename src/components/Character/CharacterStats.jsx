import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { computeRPGStats } from '../../utils/gamification';
const STAT_META = {
    STR: { label: 'STR', color: '#ff5577', description: 'Сила  частота коммітів' },
    INT: { label: 'INT', color: '#22d3ee', description: 'Інтелект  кількість мов' },
    AGI: { label: 'AGI', color: '#10ffa5', description: 'Спритність  швидкість PR' },
    END: { label: 'END', color: '#fbbf24', description: 'Витривалість  стрік' },
    LUK: { label: 'LUK', color: '#a855f7', description: 'Удача  зірки + фолловери' },
    CHA: { label: 'CHA', color: '#ff00ff', description: 'Харизма  фолловери + форки' },
};
export function CharacterStats() {
    const stats = useStore((s) => s.stats);
    const rpg = useMemo(() => (stats ? computeRPGStats(stats) : null), [stats]);
    if (!rpg)
        return null;
    return (<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {Object.entries(rpg).map(([key, value], i) => {
            const meta = STAT_META[key];
            return (<motion.div key={key} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="glass p-4 group">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold tracking-wider" style={{ color: meta.color, textShadow: `0 0 8px ${meta.color}` }}>
                {meta.label}
              </span>
              <span className="font-display text-lg">{value}</span>
            </div>
            <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, delay: i * 0.06, ease: 'easeOut' }} className="absolute inset-y-0 left-0 rounded-full" style={{
                    background: `linear-gradient(90deg, ${meta.color}, ${meta.color}aa)`,
                    boxShadow: `0 0 12px ${meta.color}`,
                }}/>
            </div>
            <p className="text-[11px] text-white/50 mt-2 leading-snug">{meta.description}</p>
          </motion.div>);
        })}
    </div>);
}
