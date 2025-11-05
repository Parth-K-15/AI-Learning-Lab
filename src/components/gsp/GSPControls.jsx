import React from 'react';

export default function GSPControls({ onStep, onAuto, onReset, isRunning, speed, onSpeedChange, isDone }) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-3 text-gray-200">🎮 Controls</h3>
      
      <div className="flex flex-col gap-2 mb-4">
        <button
          onClick={onStep}
          disabled={isRunning || isDone}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <span>▶️</span> Step
        </button>

        <button
          onClick={onAuto}
          disabled={isDone}
          className={`w-full px-4 py-3 ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2`}
        >
          <span>{isRunning ? '⏸️' : '⏩'}</span> {isRunning ? 'Pause' : 'Run Auto'}
        </button>

        <button
          onClick={onReset}
          className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>🔁</span> Reset
        </button>
      </div>

      <div className="border-t border-slate-700 pt-4">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Speed: <span className="text-cyan-400">{speed}ms</span>
        </label>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      {isDone && (
        <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-600 rounded-lg text-center">
          <span className="text-emerald-400 font-semibold">✅ Planning Complete!</span>
        </div>
      )}
    </div>
  );
}
