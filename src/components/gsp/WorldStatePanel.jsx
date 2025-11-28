import React from 'react';
import { motion } from 'framer-motion';

export default function WorldStatePanel({ state, goalState }) {
  // Helper function to group predicates
  const groupPredicates = (predicates) => {
    const grouped = {
      on: [],
      ontable: [],
      clear: [],
      holding: [],
      armempty: []
    };

    predicates.forEach(pred => {
      if (pred.name === 'ON') grouped.on.push(pred);
      else if (pred.name === 'ONTABLE') grouped.ontable.push(pred);
      else if (pred.name === 'CLEAR') grouped.clear.push(pred);
      else if (pred.name === 'HOLDING') grouped.holding.push(pred);
      else if (pred.name === 'ARMEMPTY') grouped.armempty.push(pred);
    });

    return grouped;
  };

  const groupedState = groupPredicates(state);
  const groupedGoal = goalState ? groupPredicates(goalState) : null;

  const PredicateGroup = ({ title, predicates, color, icon }) => {
    if (predicates.length === 0) return null;

    return (
      <div className="mb-3">
        <div className={`text-xs font-semibold ${color} mb-2 flex items-center gap-2`}>
          <span>{icon}</span>
          {title}
        </div>
        <div className="flex flex-wrap gap-1">
          {predicates.map((pred, idx) => (
            <motion.span
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 bg-slate-900/50 rounded text-xs font-mono text-gray-300 border border-slate-700"
            >
              {pred.toString()}
            </motion.span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200 flex items-center gap-2">
        <span>🌍</span> States
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current State */}
        <div>
          <div className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
            <span>📍</span> Current State
            <span className="text-xs text-gray-500 ml-auto">
              {state.length} predicates
            </span>
          </div>
          <div className="space-y-3">
        <PredicateGroup
          title="ON Relations"
          predicates={groupedState.on}
          color="text-blue-400"
          icon="🔗"
        />
        
        <PredicateGroup
          title="On Table"
          predicates={groupedState.ontable}
          color="text-amber-400"
          icon="📦"
        />
        
        <PredicateGroup
          title="Clear Blocks"
          predicates={groupedState.clear}
          color="text-green-400"
          icon="✨"
        />
        
        <PredicateGroup
          title="Holding"
          predicates={groupedState.holding}
          color="text-purple-400"
          icon="🤲"
        />
        
        <PredicateGroup
          title="Arm Status"
          predicates={groupedState.armempty}
          color="text-cyan-400"
          icon="🤖"
        />

            {state.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No predicates in world state
              </div>
            )}
          </div>
        </div>

        {/* Goal State */}
        {goalState && groupedGoal && (
          <div>
            <div className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
              <span>🎯</span> Goal State
              <span className="text-xs text-gray-500 ml-auto">
                {goalState.length} predicates
              </span>
            </div>
            <div className="space-y-3">
              <PredicateGroup
                title="ON Relations"
                predicates={groupedGoal.on}
                color="text-blue-400"
                icon="🔗"
              />
              
              <PredicateGroup
                title="On Table"
                predicates={groupedGoal.ontable}
                color="text-amber-400"
                icon="📦"
              />
              
              <PredicateGroup
                title="Clear Blocks"
                predicates={groupedGoal.clear}
                color="text-green-400"
                icon="✨"
              />
              
              <PredicateGroup
                title="Holding"
                predicates={groupedGoal.holding}
                color="text-purple-400"
                icon="🤲"
              />
              
              <PredicateGroup
                title="Arm Status"
                predicates={groupedGoal.armempty}
                color="text-cyan-400"
                icon="🤖"
              />

              {goalState.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No predicates in goal state
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
