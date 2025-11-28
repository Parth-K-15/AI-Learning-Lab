import React from 'react';
import { motion } from 'framer-motion';

export default function ActionPanel({ currentStep, plan }) {
  if (!currentStep) {
    return (
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        <h3 className="text-lg font-bold mb-3 text-gray-200 flex items-center gap-2">
          <span>⚡</span> Current Action
        </h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">⏸️</div>
          <div>No action yet</div>
          <div className="text-sm">Start planning to see actions</div>
        </div>
      </div>
    );
  }

  const getActionColor = (action) => {
    if (action === 'choose_operator') return 'from-blue-600 to-blue-700';
    if (action === 'apply_operator') return 'from-green-600 to-green-700';
    if (action === 'push_preconditions') return 'from-yellow-600 to-yellow-700';
    if (action === 'push_unsatisfied') return 'from-purple-600 to-purple-700';
    if (action === 'goal_satisfied') return 'from-emerald-600 to-emerald-700';
    if (action === 'complete') return 'from-cyan-600 to-cyan-700';
    return 'from-slate-600 to-slate-700';
  };

  const getActionIcon = (action) => {
    if (action === 'choose_operator') return '🎯';
    if (action === 'apply_operator') return '✅';
    if (action === 'push_preconditions') return '📌';
    if (action === 'push_unsatisfied') return '🔄';
    if (action === 'goal_satisfied') return '✓';
    if (action === 'complete') return '🎉';
    return '•';
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-3 text-gray-200 flex items-center gap-2">
        <span>⚡</span> Current Action
      </h3>

      <motion.div
        key={currentStep.message}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`p-4 rounded-lg bg-gradient-to-br ${getActionColor(currentStep.action)} text-white mb-4`}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{getActionIcon(currentStep.action)}</span>
          <div className="flex-1">
            <div className="text-xs uppercase opacity-80 mb-1">
              {currentStep.action.replace(/_/g, ' ')}
            </div>
            <div className="font-semibold">{currentStep.message}</div>
          </div>
        </div>

        {currentStep.operator && (
          <div className="mt-3 p-2 bg-black/20 rounded text-sm font-mono">
            Operator: {currentStep.operator}
          </div>
        )}

        {currentStep.goal && (
          <div className="mt-2 p-2 bg-black/20 rounded text-sm font-mono">
            Goal: {currentStep.goal}
          </div>
        )}

        {currentStep.preconditions && currentStep.preconditions.length > 0 && (
          <div className="mt-2 p-2 bg-black/20 rounded text-sm">
            <div className="font-semibold mb-1">Preconditions needed:</div>
            <ul className="list-disc list-inside font-mono">
              {currentStep.preconditions.map((p, idx) => (
                <li key={idx}>{p}</li>
              ))}
            </ul>
          </div>
        )}

        {currentStep.unsatisfied && currentStep.unsatisfied.length > 0 && (
          <div className="mt-2 p-2 bg-black/20 rounded text-sm">
            <div className="font-semibold mb-1">Unsatisfied goals:</div>
            <ul className="list-disc list-inside font-mono">
              {currentStep.unsatisfied.map((g, idx) => (
                <li key={idx}>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Plan so far */}
      <div className="mt-4">
        <div className="text-sm font-semibold text-gray-400 mb-2">
          Plan Generated ({plan.length} actions):
        </div>
        {plan.length === 0 ? (
          <div className="text-gray-500 text-sm italic">No actions yet</div>
        ) : (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {plan.map((action, idx) => (
              <div
                key={idx}
                className="text-sm bg-slate-900/50 p-2 rounded border border-slate-700 font-mono text-gray-300"
              >
                {idx + 1}. {action.toString()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
