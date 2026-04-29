import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
export function TopRepos() {
    const stats = useStore((s) => s.stats);
    const repos = useMemo(() => {
        if (!stats)
            return [];
        return [...stats.repos]
            .filter((r) => !r.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5);
    }, [stats]);
    if (!repos.length)
        return <div className="text-xs text-white/40">Немає репозиторіїв</div>;
    return (<ul className="space-y-2">
      {repos.map((r, i) => (<motion.li key={r.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
          <a href={r.html_url} target="_blank" rel="noreferrer" className="block p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-neon-purple/50 hover:bg-white/[0.05] transition-all group">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold truncate group-hover:text-neon-cyan transition-colors">
                {r.name}
              </span>
              <span className="text-xs text-neon-gold font-mono ml-2">
                 {r.stargazers_count}
              </span>
            </div>
            {r.description && (<p className="text-xs text-white/50 line-clamp-2">{r.description}</p>)}
            <div className="flex items-center gap-3 mt-2 text-[11px] text-white/40">
              {r.language && (<span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-neon-cyan"/>
                  {r.language}
                </span>)}
              <span> {r.forks_count}</span>
            </div>
          </a>
        </motion.li>))}
    </ul>);
}
