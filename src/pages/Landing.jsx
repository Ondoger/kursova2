import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Character3D } from '../components/Character/Character3D';
import { ParticleBackground } from '../components/UI/ParticleBackground';
import { FloatingCode } from '../components/UI/FloatingCode';
import { NeonButton } from '../components/UI/NeonButton';
import { useStore } from '../store/useStore';
import { beginGitHubOAuth, isGitHubOAuthConfigured } from '../utils/githubAuth';
export function Landing() {
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [authError, setAuthError] = useState(null);
    const savedCharacterName = useStore((s) => s.characterName);
    const [characterName, setCharacterNameDraft] = useState(savedCharacterName);
    const connect = useStore((s) => s.connect);
    const setCharacterName = useStore((s) => s.setCharacterName);
    const loading = useStore((s) => s.loading);
    const error = useStore((s) => s.error);
    const navigate = useNavigate();
    const oauthConfigured = isGitHubOAuthConfigured();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim())
            return;
        try {
            setCharacterName(characterName);
            await connect(username, token || undefined);
            navigate('/dashboard');
        }
        catch {
            /* error displayed below */
        }
    };
    const handleGitHubSignIn = async () => {
        setAuthError(null);
        setCharacterName(characterName);
        try {
            await beginGitHubOAuth({ characterName });
        }
        catch (e) {
            setAuthError(e instanceof Error ? e.message : 'GitHub OAuth помилка');
        }
    };
    return (<div className="relative min-h-screen overflow-hidden">
      <ParticleBackground density="high"/>
      <FloatingCode count={20}/>

      {/* Subtle grid */}
      <div className="absolute inset-0 grid-bg opacity-30 -z-10"/>

      <div className="relative max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-2 gap-10 items-center min-h-screen">
        {/* Left: hero text */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="space-y-7 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-neon-cyan/30 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_8px_#00ffff]"/>
            <span className="text-xs uppercase tracking-widest text-white/70 font-display">
              GitHub Gamification
            </span>
          </div>

          <h1 className="font-display font-black leading-[0.95] tracking-tight text-5xl md:text-7xl">
            <span className="block text-white/95">Прокачай</span>
            <span className="block text-gradient">свого код-вайфу</span>
            <span className="block text-white/80 text-3xl md:text-4xl mt-3 font-bold">
              кожним коммітом.
            </span>
          </h1>

          <p className="text-white/60 max-w-lg text-base md:text-lg leading-relaxed">
            Підключи свій GitHub  ми перетворимо твою активність на 3D-персонажа,
            який росте, змінює стрій, отримує крила, ауру та хвасти. Ачівменти, рівні,
            RPG-статистика  все, як ти любиш.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                ♡
              </span>
              <input value={characterName} onChange={(e) => setCharacterNameDraft(e.target.value)} placeholder="Ім'я персонажа" className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/[0.04] border border-white/10 focus:border-neon-pink/60 focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-neon-pink/10 transition-all font-medium placeholder:text-white/30"/>
            </div>

            <NeonButton type="button" onClick={handleGitHubSignIn} disabled={loading || !oauthConfigured} variant="primary" className="w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              Увійти через GitHub
            </NeonButton>

            {!oauthConfigured && (<div className="text-xs text-white/45 bg-white/[0.04] border border-white/10 px-3 py-2 rounded-lg leading-relaxed">
                Для GitHub OAuth додай <span className="font-mono">VITE_GITHUB_CLIENT_ID</span> у .env і <span className="font-mono">GITHUB_CLIENT_SECRET</span> на сервері.
                Нижче лишилось ручне підключення по username як fallback.
              </div>)}

            <div className="relative flex items-center py-1">
              <div className="h-px flex-1 bg-white/10"/>
              <span className="px-3 text-[10px] uppercase tracking-widest text-white/35">
                або вручну
              </span>
              <div className="h-px flex-1 bg-white/10"/>
            </div>

            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono">
                @
              </span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="GitHub username (наприклад, torvalds)" className="w-full pl-10 pr-4 py-4 rounded-xl bg-white/[0.04] border border-white/10 focus:border-neon-cyan/60 focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-neon-cyan/10 transition-all font-medium placeholder:text-white/30" autoFocus/>
              <span className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity" style={{ boxShadow: '0 0 30px rgba(0,255,255,0.25)' }}/>
            </div>

            <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="text-xs text-white/40 hover:text-neon-cyan transition-colors">
              {showAdvanced ? '' : ''} Personal access token (опціонально, для лімітів)
            </button>
            {showAdvanced && (<input value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_..." type="password" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-neon-purple/60 focus:outline-none transition-all font-mono text-sm placeholder:text-white/20"/>)}

            <div className="flex items-center gap-3 pt-2">
              <NeonButton type="submit" disabled={loading || !username.trim()} variant="primary" className="disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Завантаження...' : 'Connect GitHub '}
              </NeonButton>
              <button type="button" onClick={() => {
            setUsername('torvalds');
        }} className="text-xs text-white/40 hover:text-neon-cyan transition-colors">
                спробувати з torvalds
              </button>
            </div>

            {(error || authError) && (<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-neon-pink bg-neon-pink/5 border border-neon-pink/30 px-3 py-2 rounded-lg">
                {error || authError}
              </motion.div>)}
          </form>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 max-w-md">
            <Stat label="Рівнів" value="100"/>
            <Stat label="Ачівментів" value="16"/>
            <Stat label="Тірів" value="4"/>
          </div>
        </motion.div>

        {/* Right: 3D character */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative h-[60vh] lg:h-[80vh]">
          <Character3D height="100%" interactive={false}/>
        </motion.div>
      </div>

      {/* Footer note */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] text-white/30 text-center px-4">
        Зроблено як курсова робота  React + Three.js + Tailwind  GitHub OAuth + публічні дані
      </div>
    </div>);
}
function Stat({ label, value }) {
    return (<div>
      <div className="font-display font-black text-2xl text-gradient">{value}</div>
      <div className="text-xs text-white/40 uppercase tracking-widest">{label}</div>
    </div>);
}
