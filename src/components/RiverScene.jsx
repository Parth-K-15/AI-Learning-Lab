import React from 'react';
import { motion } from 'framer-motion';

const Missionary = ({ x, y, delay = 0 }) => (
  <motion.g
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1, x, y }}
    transition={{ duration: 0.3, delay }}
  >
    <circle cx="0" cy="0" r="15" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
    <text x="0" y="5" textAnchor="middle" fontSize="20" fill="white">👨</text>
  </motion.g>
);

const Cannibal = ({ x, y, delay = 0 }) => (
  <motion.g
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1, x, y }}
    transition={{ duration: 0.3, delay }}
  >
    <circle cx="0" cy="0" r="15" fill="#ef4444" stroke="#991b1b" strokeWidth="2" />
    <text x="0" y="5" textAnchor="middle" fontSize="20" fill="white">👹</text>
  </motion.g>
);

const Boat = ({ x, y, isMoving }) => (
  <motion.g
    animate={{ x, y }}
    transition={{ duration: 1, ease: "easeInOut" }}
  >
    <motion.path
      d="M -40 -10 L -40 10 L 40 10 L 40 -10 L 30 -20 L -30 -20 Z"
      fill="#FBBF24"
      stroke="#F59E0B"
      strokeWidth="2"
      animate={isMoving ? {
        y: [0, -5, 0],
      } : {}}
      transition={{
        duration: 0.5,
        repeat: isMoving ? Infinity : 0,
        ease: "easeInOut"
      }}
    />
    <text x="0" y="5" textAnchor="middle" fontSize="24" fill="#fff">🚤</text>
  </motion.g>
);

export default function RiverScene({ state, totalM, totalC, isAnimating }) {
  if (!state) return null;

  const leftM = state.missionaries;
  const leftC = state.cannibals;
  const rightM = totalM - state.missionaries;
  const rightC = totalC - state.cannibals;
  const boatSide = state.boat;

  // Positions
  const leftBankX = 150;
  const rightBankX = 650;
  const riverCenterX = 400;
  const boatY = 200;

  const boatX = boatSide === 0 ? leftBankX : rightBankX;

  return (
    <div className="w-full bg-gradient-to-b from-gray-900 to-slate-800 rounded-lg shadow-xl p-4 border-2 border-slate-700">
      <svg width="100%" height="400" viewBox="0 0 800 400">
        {/* River */}
        <defs>
          <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1D4ED8', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: '#1e3a8a', stopOpacity: 0.9 }} />
          </linearGradient>
          <pattern id="waves" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q10 5 20 10 T40 10" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
          </pattern>
        </defs>

        {/* River */}
        <rect x="250" y="0" width="300" height="400" fill="url(#riverGradient)" />
        <rect x="250" y="0" width="300" height="400" fill="url(#waves)" />

        {/* Left Bank */}
        <rect x="0" y="0" width="250" height="400" fill="#10B981" />
        <text x="125" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#F1F5F9">
          LEFT BANK
        </text>
        <text x="125" y="380" textAnchor="middle" fontSize="18" fill="#F1F5F9">
          {leftM}M / {leftC}C
        </text>

        {/* Right Bank */}
        <rect x="550" y="0" width="250" height="400" fill="#E11D48" />
        <text x="675" y="30" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#F1F5F9">
          RIGHT BANK
        </text>
        <text x="675" y="380" textAnchor="middle" fontSize="18" fill="#F1F5F9">
          {rightM}M / {rightC}C
        </text>

        {/* Missionaries on Left */}
        {[...Array(leftM)].map((_, i) => (
          <Missionary key={`left-m-${i}`} x={leftBankX - 60 + (i % 3) * 30} y={100 + Math.floor(i / 3) * 40} delay={i * 0.1} />
        ))}

        {/* Cannibals on Left */}
        {[...Array(leftC)].map((_, i) => (
          <Cannibal key={`left-c-${i}`} x={leftBankX + 30 + (i % 3) * 30} y={100 + Math.floor(i / 3) * 40} delay={i * 0.1} />
        ))}

        {/* Missionaries on Right */}
        {[...Array(rightM)].map((_, i) => (
          <Missionary key={`right-m-${i}`} x={rightBankX - 60 + (i % 3) * 30} y={100 + Math.floor(i / 3) * 40} delay={i * 0.1} />
        ))}

        {/* Cannibals on Right */}
        {[...Array(rightC)].map((_, i) => (
          <Cannibal key={`right-c-${i}`} x={rightBankX + 30 + (i % 3) * 30} y={100 + Math.floor(i / 3) * 40} delay={i * 0.1} />
        ))}

        {/* Boat */}
        <Boat x={boatX} y={boatY} isMoving={isAnimating} />
      </svg>
    </div>
  );
}
