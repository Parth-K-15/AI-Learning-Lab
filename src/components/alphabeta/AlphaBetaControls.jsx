import React from 'react';
import { motion } from 'framer-motion';

export default function AlphaBetaControls({
  onNextStep,
  onAutoRun,
  onReset,
  onSolveAll,
  isRunning,
  isComplete,
  isSolving,
  animationSpeed,
  onSpeedChange
}) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200">🎮 Controls</h3>
      
      <div className="flex flex-wrap gap-3 items-end">
        {/* Step Button */}
        <button
          onClick={onNextStep}
          disabled={isRunning || isComplete}
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold 
            hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          <span>⏭️</span> Next Step
        </button>

        {/* Auto Run / Pause */}
        <button
          onClick={onAutoRun}
          disabled={isComplete}
          className={`px-6 py-3 text-white rounded-lg font-semibold transition-colors 
            flex items-center justify-center gap-2
            ${isRunning 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'bg-green-600 hover:bg-green-700'
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span>{isRunning ? '⏸️' : '▶️'}</span>
          {isRunning ? 'Pause' : 'Auto Run'}
        </button>

        {/* Solve All Button */}
        <button
          onClick={onSolveAll}
          disabled={isRunning || isComplete || isSolving}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold 
            hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          <span>⚡</span>
          {isSolving ? 'Solving...' : 'Solve All'}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold 
            hover:bg-red-700 transition-colors
            flex items-center justify-center gap-2"
        >
          <span>🔄</span> Reset
        </button>

        {/* Speed Control */}
        <div className="flex flex-col gap-2 ml-4">
          <label className="text-sm text-gray-300 font-medium">Animation Speed</label>
          <div className="flex gap-2">
            {[
              { label: 'Slow', value: 1500 },
              { label: 'Normal', value: 800 },
              { label: 'Fast', value: 400 }
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => onSpeedChange(value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${animationSpeed === value
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
