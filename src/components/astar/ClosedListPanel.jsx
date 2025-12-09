import React from 'react';
import { motion } from 'framer-motion';

export default function ClosedListPanel({ closedList, graph, solver }) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200 flex items-center gap-2">
        <span>✅</span> Closed List
        <span className="text-xs text-gray-500 ml-auto">
          {closedList.length} nodes
        </span>
      </h3>

      <div className="max-h-[300px] overflow-y-auto">
        {closedList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Closed list is empty
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {closedList.map((nodeId, idx) => {
              const node = graph.getNode(nodeId);
              const nodeData = solver?.getNodeData(nodeId);
              
              return (
                <motion.div
                  key={nodeId}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-600"
                  title={`g: ${nodeData?.g.toFixed(2)}, h: ${nodeData?.h.toFixed(2)}, f: ${nodeData?.f.toFixed(2)}`}
                >
                  <div className="text-gray-300 font-mono text-sm">
                    {node?.label || nodeId}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    f: {nodeData?.f.toFixed(1)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
