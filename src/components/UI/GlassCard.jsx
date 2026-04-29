import { motion } from 'framer-motion';
import { forwardRef } from 'react';
const glowMap = {
    cyan: 'hover:shadow-[0_0_30px_rgba(0,255,255,0.25)]',
    pink: 'hover:shadow-[0_0_30px_rgba(255,0,255,0.25)]',
    purple: 'hover:shadow-[0_0_30px_rgba(124,58,237,0.3)]',
    gold: 'hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]',
    none: '',
};
export const GlassCard = forwardRef(function GlassCard({ className = '', glow = 'cyan', hoverable = true, children, ...props }, ref) {
    return (<motion.div ref={ref} className={`glass p-5 transition-all duration-300 ${hoverable ? glowMap[glow] : ''} ${className}`} {...props}>
      {children}
    </motion.div>);
});
