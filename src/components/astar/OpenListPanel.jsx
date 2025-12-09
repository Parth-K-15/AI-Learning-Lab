import React from 'react';
import { motion } from 'framer-motion';

export default function OpenListPanel({ openList, graph }) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200 flex items-center gap-2">
        <span>📊</span> Open List
        <span className="text-xs text-gray-500 ml-auto">
          {openList.length} nodes
        </span>
      </h3>

      <div className="max-h-[400px] overflow-y-auto">
        {openList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Open list is empty
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-800">
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 text-cyan-400">Node</th>
                <th className="text-center py-2 text-green-400">g</th>
                <th className="text-center py-2 text-purple-400">h</th>
                <th className="text-center py-2 text-yellow-400 font-bold">f</th>
              </tr>
            </thead>
            <tbody>
              {openList.map((item, idx) => {
                const node = graph.getNode(item.nodeId);
                return (
                  <motion.tr
                    key={item.nodeId}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30"
                  >
                    <td className="py-2 text-gray-300 font-mono">
                      {node?.label || item.nodeId}
                    </td>
                    <td className="text-center text-green-400 font-mono">
                      {item.g.toFixed(2)}
                    </td>
                    <td className="text-center text-purple-400 font-mono">
                      {item.h.toFixed(2)}
                    </td>
                    <td className="text-center text-yellow-400 font-bold font-mono">
                      {item.f.toFixed(2)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
