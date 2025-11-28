import React from 'react';
import { motion } from 'framer-motion';

export default function GoalStackPanel({ stack }) {
  const getItemColor = (item) => {
    if (item.type === 'conjunction') return 'bg-purple-900/50 border-purple-500';
    if (item.type === 'goal') return 'bg-blue-900/50 border-blue-500';
    if (item.type === 'operator') return 'bg-green-900/50 border-green-500';
    return 'bg-slate-800 border-slate-600';
  };

  const getItemIcon = (item) => {
    if (item.type === 'conjunction') return '🎯';
    if (item.type === 'goal') return '📍';
    if (item.type === 'operator') return '⚡';
    return '•';
  };

  const getItemText = (item) => {
    if (item.type === 'conjunction') {
      return `Goals: [${item.goals.join(', ')}]`;
    }
    if (item.type === 'goal') {
      return item.goal;
    }
    if (item.type === 'operator') {
      return item.operator;
    }
    return '';
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 flex flex-col min-h-[600px]">
      <h3 className="text-lg font-bold mb-3 text-gray-200 flex items-center gap-2">
        <span>📚</span> Goal Stack
      </h3>
      
      <div className="space-y-2 flex-1 overflow-y-auto">{stack.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">✅</div>
            <div>Stack Empty</div>
            <div className="text-sm">All goals processed</div>
          </div>
        ) : (
          <>
            {/* Stack indicator */}
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
              <span>Top ↓</span>
              <span className="text-cyan-400">({stack.length} items)</span>
            </div>

            {/* Stack items (reverse to show top at top visually) */}
            {[...stack].reverse().map((item, idx) => (
              <motion.div
                key={stack.length - idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-lg border-2 ${getItemColor(item)} backdrop-blur-sm`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{getItemIcon(item)}</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 uppercase mb-1">
                      {item.type}
                    </div>
                    <div className="text-sm text-white font-mono break-all">
                      {getItemText(item)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    #{stack.length - idx}
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
