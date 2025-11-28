import React from 'react';
import { motion } from 'framer-motion';

export default function HeuristicPanel({ stats, currentState }) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200 flex items-center gap-2">
        <span>🧠</span> Algorithm Statistics
      </h3>

      <div className="space-y-4">
        {/* Current State Info */}
        {currentState && (
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="text-sm font-semibold text-purple-400 mb-3">
              Current State
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{currentState.g}</div>
                <div className="text-xs text-gray-400 mt-1">Cost (g)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{currentState.h}</div>
                <div className="text-xs text-gray-400 mt-1">Heuristic (h)</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{currentState.f}</div>
                <div className="text-xs text-gray-400 mt-1">Total (f)</div>
              </div>
            </div>
            {currentState.move && (
              <div className="mt-3 text-center">
                <span className="text-xs text-gray-500">Last Move: </span>
                <span className="text-sm text-cyan-300 font-semibold">{currentState.move}</span>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="text-sm font-semibold text-cyan-400 mb-3">
            Search Progress
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Nodes Explored</span>
              <span className="text-white font-bold">{stats.nodesExplored}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Open List Size</span>
              <span className="text-green-400 font-bold">{stats.openListSize}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Closed List Size</span>
              <span className="text-red-400 font-bold">{stats.closedListSize}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Heuristic</span>
              <span className="text-purple-400 font-bold capitalize">{stats.heuristicType}</span>
            </div>
          </div>
        </div>

        {/* Solution Info */}
        {stats.completed && stats.solutionLength !== null && (
          <div className="bg-green-900/30 rounded-lg p-4 border border-green-600">
            <div className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
              <span>✅</span> Solution Found!
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.solutionLength}</div>
              <div className="text-xs text-gray-400 mt-1">Moves Required</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
