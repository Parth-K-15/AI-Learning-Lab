import React from 'react';
import { motion } from 'framer-motion';

export default function NodeDetailsPanel({ selectedNode, optimalValue, prunedNodes, evaluatedLeaves, totalNodes, isComplete }) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200">📊 Details</h3>
      
      {/* Selected Node Info */}
      {selectedNode ? (
        <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">Selected Node</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Node ID:</span>
              <span className="font-semibold text-white">{selectedNode.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className={`font-semibold ${
                selectedNode.type === 'MAX' ? 'text-blue-400' : 
                selectedNode.type === 'MIN' ? 'text-purple-400' : 
                'text-green-400'
              }`}>
                {selectedNode.type}
              </span>
            </div>
            {selectedNode.value !== null && selectedNode.value !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Value:</span>
                <span className="font-semibold text-green-400">
                  {selectedNode.value === Infinity ? '+∞' : 
                   selectedNode.value === -Infinity ? '-∞' : 
                   selectedNode.value}
                </span>
              </div>
            )}
            {selectedNode.type !== 'TERMINAL' && (
              <div className="flex justify-between">
                {selectedNode.type === 'MAX' ? (
                  <>
                    <span className="text-gray-400">Alpha (α):</span>
                    <span className="font-semibold text-orange-400">
                      {selectedNode.alpha === -Infinity ? '-∞' : 
                       selectedNode.alpha === Infinity ? '+∞' : 
                       selectedNode.alpha}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400">Beta (β):</span>
                    <span className="font-semibold text-cyan-400">
                      {selectedNode.beta === Infinity ? '+∞' : 
                       selectedNode.beta === -Infinity ? '-∞' : 
                       selectedNode.beta}
                    </span>
                  </>
                )}
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={`font-semibold ${
                selectedNode.isPruned ? 'text-red-400' : 
                selectedNode.isEvaluated ? 'text-green-400' : 
                'text-gray-400'
              }`}>
                {selectedNode.isPruned ? 'Pruned' : 
                 selectedNode.isEvaluated ? 'Evaluated' : 
                 'Pending'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-slate-900 rounded-lg border border-slate-700 text-center">
          <p className="text-sm text-gray-500">Click a node to view details</p>
        </div>
      )}

      {/* Statistics */}
      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg border border-blue-700/50">
          <p className="text-xs text-blue-300 mb-1">Total Nodes</p>
          <p className="text-2xl font-bold text-blue-400">{totalNodes || 31}</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg border border-green-700/50">
          <p className="text-xs text-green-300 mb-1">Evaluated Leaves</p>
          <p className="text-2xl font-bold text-green-400">{evaluatedLeaves ? evaluatedLeaves.length : 0} / 16</p>
        </div>

        <div className="p-4 bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-lg border border-red-700/50">
          <p className="text-xs text-red-300 mb-1">Pruned Nodes</p>
          <p className="text-2xl font-bold text-red-400">{prunedNodes ? prunedNodes.length : 0}</p>
          {prunedNodes && prunedNodes.length > 0 && (
            <p className="text-xs text-red-300/70 mt-1">IDs: {prunedNodes.join(', ')}</p>
          )}
        </div>

        {isComplete && optimalValue !== null && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-lg border border-yellow-700/50"
          >
            <p className="text-xs text-yellow-300 mb-1">Optimal Value (Root)</p>
            <p className="text-3xl font-bold text-yellow-400">{optimalValue}</p>
          </motion.div>
        )}
      </div>

      {/* Efficiency Stats */}
      {isComplete && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700"
        >
          <h4 className="text-sm font-semibold text-cyan-400 mb-3">🎯 Efficiency</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Nodes saved:</span>
              <span className="font-semibold text-green-400">
                {prunedNodes ? prunedNodes.length : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Reduction:</span>
              <span className="font-semibold text-cyan-400">
                {prunedNodes ? ((prunedNodes.length / 31) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
