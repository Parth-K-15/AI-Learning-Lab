import React from 'react';

export default function ActionPanel({ current, lastNote }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-200 mb-3">⚙️ Current Action</h3>
      {current ? (
        <div className="p-4 rounded border border-cyan-600 bg-cyan-900/30 text-cyan-200">
          {current.kind === 'goal' ? (
            <div className="text-sm">
              <div className="font-semibold mb-1">Processing Goal:</div>
              <div className="font-mono">{current.goal.type}({current.goal.args.join(', ')})</div>
            </div>
          ) : (
            <div className="text-sm">
              <div className="font-semibold mb-1">Applying Operator:</div>
              <div className="font-mono">{current.op.name}({Object.entries(current.op.bindings).map(([k, v]) => `${k}=${v}`).join(', ')})</div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-400 text-sm text-center py-4">No action in progress</div>
      )}
      {lastNote && (
        <div className="mt-3 p-3 text-xs text-gray-300 bg-slate-900 rounded border border-slate-700">
          {lastNote}
        </div>
      )}
    </div>
  );
}
