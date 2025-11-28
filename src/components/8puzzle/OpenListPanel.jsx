import React from 'react';
import { motion } from 'framer-motion';
import PuzzleBoard from './PuzzleBoard';

export default function OpenListPanel({ openList }) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200 flex items-center gap-2">
        <span>📊</span> Open List
        <span className="text-xs text-gray-500 ml-auto">
          {openList.length} states
        </span>
      </h3>

      <div className="max-h-[600px] overflow-y-auto space-y-4">
        {openList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Open list is empty
          </div>
        ) : (
          openList.map((state, idx) => (
            <motion.div
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-cyan-400">
                  State #{idx + 1}
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-green-400">g: {state.g}</span>
                  <span className="text-purple-400">h: {state.h}</span>
                  <span className="text-yellow-400 font-bold">f: {state.f}</span>
                </div>
              </div>
              
              <div className="flex justify-center scale-75">
                <PuzzleBoard board={state.board} highlightCorrect={false} />
              </div>

              {state.move && (
                <div className="text-xs text-gray-400 text-center mt-2">
                  Move: <span className="text-cyan-300 font-semibold">{state.move}</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
