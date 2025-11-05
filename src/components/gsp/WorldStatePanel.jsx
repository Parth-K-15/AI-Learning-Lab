import React from 'react';

export default function WorldStatePanel({ world }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-200 mb-3">🌍 Current World State</h3>
      <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-auto">
        {world.length === 0 ? (
          <div className="col-span-2 text-gray-400 text-sm text-center py-4">World state is empty</div>
        ) : (
          world.map((p, idx) => (
            <div key={idx} className="text-sm text-gray-300 bg-slate-900/60 border border-slate-700 rounded px-3 py-2 font-mono">
              {p.type}({p.args.join(', ')})
            </div>
          ))
        )}
      </div>
    </div>
  );
}
