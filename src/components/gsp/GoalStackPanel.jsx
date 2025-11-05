import React from 'react';

export default function GoalStackPanel({ stack }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-200 mb-3">📚 Goal Stack</h3>
      
      {/* Color Legend */}
      <div className="bg-slate-900 rounded-lg p-3 mb-3 border border-slate-700">
        <h4 className="text-xs font-semibold text-gray-400 mb-2">Legend:</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-900/30 border border-amber-600"></div>
            <span className="text-xs text-gray-300">Goal (to achieve)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-indigo-900/30 border border-indigo-600"></div>
            <span className="text-xs text-gray-300">Operator (to apply)</span>
          </div>
        </div>
      </div>

      {/* Stack Items */}
      <div className="space-y-2 max-h-80 overflow-auto">
        {stack.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4">Stack is empty</div>
        ) : (
          [...stack].reverse().map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded border transition-all ${
                item.kind === 'goal'
                  ? 'bg-amber-900/30 border-amber-600'
                  : 'bg-indigo-900/30 border-indigo-600'
              }`}
            >
              <div className="text-sm text-gray-300">
                <span className="font-semibold mr-2">
                  {item.kind === 'goal' ? 'GOAL' : 'APPLY'}
                </span>
                {item.kind === 'goal' ? (
                  <span className="text-amber-300 font-mono">
                    {item.goal.type}({item.goal.args.join(', ')})
                  </span>
                ) : (
                  <span className="text-indigo-300 font-mono">
                    {item.op.name}({Object.entries(item.op.bindings).map(([k, v]) => `${k}=${v}`).join(', ')})
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
