import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PruningLog({ logs, maxHeight = 500 }) {
  const logRef = React.useRef(null);

  React.useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (type) => {
    switch (type) {
      case 'info':
        return 'bg-blue-900/30 border-blue-600 text-blue-300';
      case 'evaluate':
        return 'bg-green-900/30 border-green-600 text-green-300';
      case 'update':
        return 'bg-cyan-900/30 border-cyan-600 text-cyan-300';
      case 'alpha':
        return 'bg-orange-900/30 border-orange-600 text-orange-300';
      case 'beta':
        return 'bg-pink-900/30 border-pink-600 text-pink-300';
      case 'prune':
        return 'bg-red-900/30 border-red-600 text-red-300';
      default:
        return 'bg-slate-900/30 border-slate-600 text-slate-300';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'info':
        return '📍';
      case 'evaluate':
        return '✅';
      case 'update':
        return '🔄';
      case 'alpha':
        return '🔼';
      case 'beta':
        return '🔽';
      case 'prune':
        return '✂️';
      default:
        return '📝';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200">📋 Evaluation Log</h3>
      
      <div 
        ref={logRef}
        className="space-y-2 overflow-y-auto pr-2 custom-scrollbar"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No steps executed yet</p>
              <p className="text-xs mt-2">Click "Next Step" or "Auto Run" to begin</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-lg border-l-4 ${getLogStyle(log.type)}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{getLogIcon(log.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium break-words">
                      {log.message}
                    </p>
                    {log.reason && (
                      <p className="text-xs mt-1 opacity-80">
                        Reason: {log.reason}
                      </p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs opacity-70">
                      <span>Node: {log.nodeId}</span>
                      {log.value !== undefined && <span>Value: {log.value}</span>}
                      {log.alpha !== undefined && <span>α: {log.alpha === -Infinity ? '-∞' : log.alpha}</span>}
                      {log.beta !== undefined && <span>β: {log.beta === Infinity ? '+∞' : log.beta}</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {logs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-gray-400">
            Total steps: <span className="font-semibold text-cyan-400">{logs.length}</span>
          </p>
        </div>
      )}
    </div>
  );
}
