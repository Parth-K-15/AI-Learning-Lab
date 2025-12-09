import React from 'react';

export default function AStarControls({
  mode,
  onModeChange,
  onNextStep,
  onAutoRun,
  onReset,
  onFindPath,
  isRunning,
  isComplete,
  isSolving,
  animationSpeed,
  onSpeedChange,
  canRunSearch
}) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200">🎮 Controls</h3>
      
      {/* Mode Selection */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onModeChange('select')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'select'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Select Nodes
          </button>
          <button
            onClick={() => onModeChange('add-node')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'add-node'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Add Node
          </button>
          <button
            onClick={() => onModeChange('add-edge')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'add-edge'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Add Edge
          </button>
          <button
            onClick={() => onModeChange('edit-heuristic')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'edit-heuristic'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Edit Heuristic
          </button>
        </div>
      </div>

      {/* Search Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Step Button */}
        <button
          onClick={onNextStep}
          disabled={!canRunSearch || isRunning || isComplete}
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold 
            hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          <span>⏭️</span> Next Step
        </button>

        {/* Auto Run / Pause */}
        <button
          onClick={onAutoRun}
          disabled={!canRunSearch || isComplete}
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

        {/* Find Path Button */}
        <button
          onClick={onFindPath}
          disabled={!canRunSearch || isRunning || isComplete || isSolving}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold 
            hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isSolving ? (
            <>
              <span className="animate-spin">⏳</span> Finding...
            </>
          ) : (
            <>
              <span>🎯</span> Find Path
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

        {/* Status */}
        {isComplete && (
          <div className="px-4 py-2 bg-green-900/30 border border-green-600 rounded-lg text-center flex items-center justify-center gap-2">
            <span>✅</span>
            <span className="text-green-400 font-bold">Path Found!</span>
          </div>
        )}
      </div>

      {/* Speed Slider */}
      <div className="pt-4 border-t border-slate-700">
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
