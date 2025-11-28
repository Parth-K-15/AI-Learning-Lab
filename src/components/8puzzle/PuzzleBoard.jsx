import React from 'react';
import { motion } from 'framer-motion';

export default function PuzzleBoard({ board, goalBoard, highlightCorrect = true }) {
  const getTileColor = (value, row, col) => {
    if (value === 0) return 'transparent';
    
    if (highlightCorrect && goalBoard) {
      const isCorrect = goalBoard[row][col] === value;
      return isCorrect 
        ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400' 
        : 'bg-gradient-to-br from-red-500 to-red-600 border-red-400';
    }
    
    return 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400';
  };

  return (
    <div className="inline-flex flex-col gap-2 p-4">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {row.map((value, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={`
                w-20 h-20 flex items-center justify-center
                text-3xl font-bold text-white rounded-lg
                shadow-lg border-2
                ${value === 0 
                  ? 'bg-slate-700/30 border-slate-600' 
                  : getTileColor(value, rowIndex, colIndex)
                }
              `}
            >
              {value === 0 ? '' : value}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}
