import React from 'react';

export default function NodeDetailsPanel({ currentNode, solver, graph, stats }) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200 flex items-center gap-2">
        <span>📍</span> Current Node
      </h3>

      {currentNode ? (
        <div className="space-y-4">
          {/* Node Info */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="text-2xl font-bold text-cyan-400 mb-2">
              {graph.getNode(currentNode)?.label || currentNode}
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">
                  {solver?.getNodeData(currentNode)?.g.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">Cost (g)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">
                  {solver?.getNodeData(currentNode)?.h.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">Heuristic (h)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">
                  {solver?.getNodeData(currentNode)?.f.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">Total (f)</div>
              </div>
            </div>

            {solver?.getNodeData(currentNode)?.parent && (
              <div className="mt-3 text-sm text-gray-400">
                <span>Parent: </span>
                <span className="text-cyan-300 font-semibold">
                  {graph.getNode(solver.getNodeData(currentNode).parent)?.label}
                </span>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="text-sm font-semibold text-gray-300 mb-3">
              Search Statistics
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Nodes Expanded</span>
                <span className="text-white font-bold">{stats.nodesExpanded}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Open List Size</span>
                <span className="text-purple-400 font-bold">{stats.openListSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Closed List Size</span>
                <span className="text-gray-400 font-bold">{stats.closedListSize}</span>
              </div>
            </div>
          </div>

          {/* Path Found */}
          {stats.pathFound && (
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-600">
              <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <span>✅</span> Path Found!
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {stats.pathCost?.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">Total Path Cost</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No node selected
        </div>
      )}
    </div>
  );
}
