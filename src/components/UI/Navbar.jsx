import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
const NAV = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/character', label: 'Character' },
    { to: '/achievements', label: 'Achievements' },
];
export function Navbar() {
    const location = useLocation();
    const username = useStore((s) => s.username);
    const stats = useStore((s) => s.stats);
    const characterName = useStore((s) => s.characterName);
    const logout = useStore((s) => s.logout);
    const refresh = useStore((s) => s.refresh);
    const loading = useStore((s) => s.loading);
    if (location.pathname === '/')
        return null;
    return (<motion.header initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="sticky top-0 z-40 backdrop-blur-xl bg-bg-900/60 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center font-display font-black text-sm" style={{
            background: 'linear-gradient(135deg, #00ffff22, #ff00ff22)',
            border: '1px solid rgba(0,255,255,0.4)',
            boxShadow: '0 0 18px rgba(0,255,255,0.4)',
        }}>
            CW
          </span>
          <span className="font-display font-bold text-lg hidden sm:inline">
            <span className="text-gradient">{characterName}</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 ml-auto">
          {NAV.map((n) => (<NavLink key={n.to} to={n.to} className={({ isActive }) => `relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'text-white'
                : 'text-white/60 hover:text-white'}`}>
              {({ isActive }) => (<>
                  <span className="relative z-10">{n.label}</span>
                  {isActive && (<motion.span layoutId="nav-indicator" className="absolute inset-0 rounded-lg bg-white/[0.06] border border-neon-cyan/40" style={{ boxShadow: '0 0 16px rgba(0,255,255,0.25)' }}/>)}
                </>)}
            </NavLink>))}
        </nav>

        {username && (<div className="flex items-center gap-3">
            <button onClick={() => refresh()} disabled={loading} className="text-white/60 hover:text-neon-cyan disabled:opacity-50 transition-colors text-sm" title="Оновити">
              {loading ? '' : ''}
            </button>
            {stats?.user && (<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
                <img src={stats.user.avatar_url} alt={username} className="w-6 h-6 rounded-full"/>
                <span className="text-sm font-medium hidden md:inline">
                  {username}
                </span>
              </div>)}
            <button onClick={logout} className="text-xs text-white/40 hover:text-neon-pink transition-colors">
              Вийти
            </button>
          </div>)}
      </div>
    </motion.header>);
}
