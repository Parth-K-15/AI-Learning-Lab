import React from 'react';
import { stringify } from '../../gsp/predicate';

const COLORS = {
  A: 'bg-rose-500',
  B: 'bg-emerald-500',
  C: 'bg-amber-500',
  D: 'bg-indigo-500',
};

function deriveStacks(world, blocks) {
  // Build mapping child->parent for ON
  const onMap = new Map(); // X -> Y
  const onTable = new Set();
  const clear = new Set();
  world.forEach(p => {
    if (p.type === 'ON') onMap.set(p.args[0], p.args[1]);
    if (p.type === 'ONTABLE') onTable.add(p.args[0]);
    if (p.type === 'CLEAR') clear.add(p.args[0]);
  });

  // Build stacks from ONTABLE bases
  const bases = blocks.filter(b => onTable.has(b));
  const stacks = bases.map(base => {
    const stack = [base];
    let current = base;
    // Find who is on current iteratively
    while (true) {
      const next = [...onMap.entries()].find(([, y]) => y === current);
      if (!next) break;
      const x = next[0];
      stack.push(x);
      current = x;
    }
    return stack;
  });

  // Blocks not on table might be held or missing; ensure all blocks appear
  blocks.forEach(b => {
    if (!stacks.some(s => s.includes(b))) stacks.push([b]);
  });

  return { stacks, clear, onTable };
}

export default function BlocksWorld({ world, blocks = ['A','B','C','D'] }) {
  const { stacks } = deriveStacks(world, blocks);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-gray-200 mb-4">🏗️ Blocks World</h3>
      <div className="relative h-64 w-full bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        {/* Table */}
        <div className="absolute bottom-4 left-4 right-4 h-4 bg-slate-600 rounded"></div>
        {/* Stacks */}
        <div className="absolute bottom-8 left-6 right-6 flex justify-around items-end h-[calc(100%-3rem)]">
          {stacks.map((stack, i) => (
            <div key={i} className="flex flex-col-reverse items-center gap-2 min-w-[120px]">
              {stack.map((b, j) => (
                <div key={j} className={`w-28 h-10 ${COLORS[b] || 'bg-slate-500'} rounded shadow-lg border-2 border-white/20 flex items-center justify-center text-white font-bold`}>
                  {b}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
