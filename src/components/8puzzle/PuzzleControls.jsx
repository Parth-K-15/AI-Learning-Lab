import React from 'react';

export default function PuzzleControls({
  onNextStep,
  onAutoRun,
  onReset,
  onFindSolution,
  isRunning,
  isComplete,
  isSolving,
  animationSpeed,
  onSpeedChange,
  onViewCode
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

        {/* Auto Run / Stop */}
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
          {isRunning ? 'Pause' : 'Auto Solve'}
        </button>

        {/* Find Solution Button */}
        <button
          onClick={onFindSolution}
          disabled={isRunning || isComplete || isSolving}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold 
            hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isSolving ? (
            <>
              <span className="animate-spin">⏳</span> Solving...
            </>
          ) : (
            <>
              <span>🎯</span> Find Solution
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold 
            hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>🔄</span> Reset
        </button>

        {/* View Code Button */}
        <button
          onClick={onViewCode}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold 
            hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>📝</span> View Code
        </button>

        {/* Status */}
        {isComplete && (
          <div className="px-4 py-2 bg-green-900/30 border border-green-600 rounded-lg text-center flex items-center justify-center gap-2">
            <span>✅</span>
            <span className="text-green-400 font-bold">Puzzle Solved!</span>
          </div>
        )}
      </div>

      {/* Speed Slider */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Animation Speed: {animationSpeed}ms
        </label>
        <input
          type="range"
          min="100"
          max="2000"
          step="100"
          value={animationSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Fast (100ms)</span>
          <span>Slow (2000ms)</span>
        </div>
      </div>
    </div>
  );
}
