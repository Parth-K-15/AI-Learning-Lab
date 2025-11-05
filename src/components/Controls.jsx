import React from 'react';

export default function Controls({ 
  onNextStep, 
  onAutoRun, 
  onReset, 
  isRunning, 
  isComplete,
  animationSpeed,
  onSpeedChange,
  explainMode,
  onExplainModeToggle,
  onViewCode
}) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4 text-gray-200">🎮 Controls</h3>
      
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={onNextStep}
          disabled={isRunning || isComplete}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span>▶️</span> Next Step
        </button>

        <button
          onClick={onAutoRun}
          disabled={isComplete}
          className={`px-6 py-3 ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white rounded-lg font-semibold transition-colors flex items-center gap-2`}
        >
          <span>{isRunning ? '⏸️' : '⏩'}</span> {isRunning ? 'Pause' : 'Auto Run'}
        </button>

        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>🔁</span> Reset
        </button>

        <button
          onClick={onViewCode}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span>💻</span> View Code
        </button>
      </div>

      <div className="space-y-4">
        {/* Speed Control */}
        <div className="border-t border-slate-700 pt-4">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Animation Speed: <span className="text-cyan-400">{animationSpeed}ms</span>
          </label>
          <input
            type="range"
            min="100"
            max="2000"
            step="100"
            value={animationSpeed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Fast</span>
            <span>Slow</span>
          </div>
        </div>

        {/* Explain Mode Toggle */}
        <div className="border-t border-slate-700 pt-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={explainMode}
              onChange={(e) => onExplainModeToggle(e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            />
            <span className="ml-3 text-sm font-semibold text-gray-300">
              🧠 Explain Mode (Show detailed reasoning)
            </span>
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-slate-700 pt-4 mt-4">
        <h4 className="text-sm font-bold text-gray-300 mb-2">Legend:</h4>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-900/50 border border-yellow-500 rounded"></div>
            <span>Current State</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-900/50 border border-green-500 rounded"></div>
            <span>Goal State</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
            <span>Missionary (👨)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
            <span>Cannibal (👹)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
