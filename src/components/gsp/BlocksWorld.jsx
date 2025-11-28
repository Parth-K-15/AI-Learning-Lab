import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlocksWorld({ state, blocks, holdingBlock }) {
  // Parse state to determine block positions
  const getBlockPositions = () => {
    const positions = {};
    const onTable = [];
    const stacks = {};

    // Find blocks on table
    blocks.forEach(block => {
      const ontable = state.find(p => 
        p.name === 'ONTABLE' && p.x === block
      );
      if (ontable) {
        onTable.push(block);
        positions[block] = { on: 'table', column: null };
      }
    });

    // Find blocks stacked on others
    blocks.forEach(block => {
      const onPred = state.find(p => 
        p.name === 'ON' && p.x === block
      );
      if (onPred) {
        positions[block] = { on: onPred.y, column: null };
      }
    });

    // Build stacks from bottom up
    const buildStack = (base) => {
      const stack = [base];
      let current = base;
      while (true) {
        const above = blocks.find(b => positions[b]?.on === current);
        if (!above) break;
        stack.push(above);
        current = above;
      }
      return stack;
    };

    // Assign columns
    onTable.forEach((base, idx) => {
      const stack = buildStack(base);
      stack.forEach((block, height) => {
        positions[block].column = idx;
        positions[block].height = height;
      });
    });

    return positions;
  };

  const positions = getBlockPositions();
  const blockColors = {
    A: 'from-red-500 to-red-600',
    B: 'from-blue-500 to-blue-600',
    C: 'from-green-500 to-green-600',
    D: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className="relative w-full h-96 bg-slate-900 rounded-lg border-2 border-slate-700 overflow-hidden">
      {/* Table surface */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-amber-800 to-amber-700 border-t-2 border-amber-600" />

      {/* Arm/Gripper area */}
      {holdingBlock && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          className="absolute left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="flex flex-col items-center">
            <div className="w-1 h-16 bg-slate-400" />
            <div className="w-12 h-2 bg-slate-500 rounded-full" />
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`w-16 h-16 rounded-lg bg-gradient-to-br ${blockColors[holdingBlock]} 
                shadow-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-white`}
            >
              {holdingBlock}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Blocks on table/stacked */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-around px-8">
        {blocks.filter(b => positions[b]?.on === 'table').map((baseBlock, colIdx) => {
          // Get full stack for this column
          const stack = [];
          let current = baseBlock;
          while (current) {
            stack.push(current);
            current = blocks.find(b => positions[b]?.on === current);
          }

          return (
            <div key={colIdx} className="flex flex-col-reverse items-center gap-1">
              <AnimatePresence>
                {stack.map((block, heightIdx) => (
                  <motion.div
                    key={block}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-20 h-20 rounded-lg bg-gradient-to-br ${blockColors[block]} 
                      shadow-xl flex items-center justify-center text-white font-bold text-3xl 
                      border-2 border-white hover:scale-105 transition-transform`}
                  >
                    {block}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4 text-gray-400 text-sm">
        <div className="bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-600">
          {holdingBlock ? (
            <span className="text-cyan-400">🤖 Holding: {holdingBlock}</span>
          ) : (
            <span className="text-green-400">🤖 Arm Empty</span>
          )}
        </div>
      </div>
    </div>
  );
}
