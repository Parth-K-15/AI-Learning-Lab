import React from 'react';

export default function StateTable({ openList, closedList, currentState }) {
  const formatState = (state) => {
    return `(${state.missionaries}M, ${state.cannibals}C, ${state.boat === 0 ? 'L' : 'R'})`;
  };

  const isCurrentState = (state) => {
    return currentState && state.equals(currentState);
  };

  const isGoalState = (state) => {
    return state.isGoal();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Open List */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 border border-slate-700">
        <h3 className="text-xl font-bold mb-3 text-cyan-400 flex items-center">
          <span className="mr-2">📋</span> Open List ({openList.length})
        </h3>
        <div className="overflow-auto max-h-64">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 sticky top-0">
              <tr>
                <th className="p-2 text-left text-gray-300">State</th>
                <th className="p-2 text-center text-gray-300">g</th>
                <th className="p-2 text-center text-gray-300">h</th>
                <th className="p-2 text-center text-gray-300">f</th>
              </tr>
            </thead>
            <tbody>
              {openList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No states in open list
                  </td>
                </tr>
              ) : (
                openList.map((state, index) => (
                  <tr
                    key={index}
                    className={`border-b border-slate-700 hover:bg-slate-700 ${
                      isCurrentState(state) ? 'bg-yellow-900/50 border-yellow-500' : ''
                    } ${isGoalState(state) ? 'bg-green-900/50 border-green-500' : ''}`}
                  >
                    <td className="p-2 font-mono text-gray-200">{formatState(state)}</td>
                    <td className="p-2 text-center text-gray-300">{state.g}</td>
                    <td className="p-2 text-center text-gray-300">{state.h}</td>
                    <td className="p-2 text-center font-bold text-cyan-400">{state.f}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Closed List */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 border border-slate-700">
        <h3 className="text-xl font-bold mb-3 text-purple-400 flex items-center">
          <span className="mr-2">✅</span> Closed List ({closedList.length})
        </h3>
        <div className="overflow-auto max-h-64">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 sticky top-0">
              <tr>
                <th className="p-2 text-left text-gray-300">State</th>
                <th className="p-2 text-center text-gray-300">g</th>
                <th className="p-2 text-center text-gray-300">h</th>
                <th className="p-2 text-center text-gray-300">f</th>
              </tr>
            </thead>
            <tbody>
              {closedList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No states explored yet
                  </td>
                </tr>
              ) : (
                closedList.map((state, index) => (
                  <tr
                    key={index}
                    className={`border-b border-slate-700 hover:bg-slate-700 ${
                      isCurrentState(state) ? 'bg-yellow-900/50 border-yellow-500' : ''
                    } ${isGoalState(state) ? 'bg-green-900/50 border-green-500' : ''}`}
                  >
                    <td className="p-2 font-mono text-gray-400">{formatState(state)}</td>
                    <td className="p-2 text-center text-gray-400">{state.g}</td>
                    <td className="p-2 text-center text-gray-400">{state.h}</td>
                    <td className="p-2 text-center font-bold text-gray-500">{state.f}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
