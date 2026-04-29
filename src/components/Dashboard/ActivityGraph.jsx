import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { useStore } from '../../store/useStore';
export function ActivityGraph() {
    const stats = useStore((s) => s.stats);
    const data = useMemo(() => {
        const months = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toISOString().slice(0, 7);
            const monthShort = d.toLocaleDateString('uk-UA', { month: 'short' });
            const count = stats?.commitsByMonth[key] ?? 0;
            months.push({ name: monthShort, key, commits: count });
        }
        return months;
    }, [stats]);
    return (<div className="h-64">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ffff" stopOpacity={0.9}/>
              <stop offset="50%" stopColor="#a855f7" stopOpacity={0.5}/>
              <stop offset="100%" stopColor="#ff00ff" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="strokeActivity" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00ffff"/>
              <stop offset="50%" stopColor="#a855f7"/>
              <stop offset="100%" stopColor="#ff00ff"/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3"/>
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fontFamily: 'Orbitron' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}/>
          <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 11, fontFamily: 'Orbitron' }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} width={32}/>
          <Tooltip contentStyle={{
            background: 'rgba(10,10,15,0.95)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 12,
            color: '#fff',
            backdropFilter: 'blur(12px)',
        }} labelStyle={{ color: '#00ffff', fontFamily: 'Orbitron' }} formatter={(v) => [`${v} коммітів`, '']}/>
          <Area type="monotone" dataKey="commits" stroke="url(#strokeActivity)" strokeWidth={3} fill="url(#colorActivity)" animationDuration={1400} dot={{ stroke: '#00ffff', fill: '#0a0a0f', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, stroke: '#ff00ff', fill: '#0a0a0f' }}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>);
}
