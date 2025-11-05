import React, { useState } from 'react';

export default function ManualMoveControls({ onManualMove, onReset, currentState, totalM, totalC, isComplete, hasLost }) {
  const [selectedMissionaries, setSelectedMissionaries] = useState(0);
  const [selectedCannibals, setSelectedCannibals] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  if (!currentState) return null;

  const boatOnLeft = currentState.boat === 0;
  const availableM = boatOnLeft ? currentState.missionaries : (totalM - currentState.missionaries);
  const availableC = boatOnLeft ? currentState.cannibals : (totalC - currentState.cannibals);

  const handleMakeMove = () => {
    // Reset error
    setErrorMessage('');

    // Validation
    const totalPeople = selectedMissionaries + selectedCannibals;
    
    if (totalPeople === 0) {
      setErrorMessage('⚠️ You must select at least 1 person to move!');
      return;
    }
    
    if (totalPeople > 2) {
      setErrorMessage('⚠️ Boat capacity is maximum 2 people!');
      return;
    }

    if (selectedMissionaries > availableM) {
      setErrorMessage(`⚠️ Only ${availableM} missionary(ies) available on ${boatOnLeft ? 'left' : 'right'} bank!`);
      return;
    }

    if (selectedCannibals > availableC) {
      setErrorMessage(`⚠️ Only ${availableC} cannibal(s) available on ${boatOnLeft ? 'left' : 'right'} bank!`);
      return;
    }

    // Try to make the move
    const success = onManualMove(selectedMissionaries, selectedCannibals);
    
    if (!success) {
      setErrorMessage('❌ Invalid move! This would create an unsafe state (cannibals > missionaries).');
    } else {
      // Reset selections on successful move
      setSelectedMissionaries(0);
      setSelectedCannibals(0);
    }
  };

  const direction = boatOnLeft ? '→' : '←';
  const fromBank = boatOnLeft ? 'LEFT' : 'RIGHT';
  const toBank = boatOnLeft ? 'RIGHT' : 'LEFT';

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border-2 border-amber-600">
      <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center">
        <span className="mr-2">🎮</span> Manual Move Control
      </h3>

      <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
        <div className="text-sm text-gray-300 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Boat Location:</span>
            <span className="px-3 py-1 bg-cyan-900 text-cyan-300 rounded-full font-bold">
              {fromBank} Bank
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Available: {availableM} Missionary(ies), {availableC} Cannibal(s)
          </div>
        </div>

        <div className="space-y-3">
          {/* Missionaries Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              👨 Missionaries to send:
            </label>
            <div className="flex gap-2">
              {[0, 1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedMissionaries(num)}
                  disabled={num > availableM || isComplete || hasLost}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedMissionaries === num
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Cannibals Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              👹 Cannibals to send:
            </label>
            <div className="flex gap-2">
              {[0, 1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedCannibals(num)}
                  disabled={num > availableC || isComplete || hasLost}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedCannibals === num
                      ? 'bg-red-600 text-white shadow-lg scale-105'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Move Preview */}
        <div className="mt-4 p-3 bg-cyan-900/30 rounded-lg border border-cyan-700">
          <div className="text-sm font-semibold text-cyan-300 text-center">
            {selectedMissionaries === 0 && selectedCannibals === 0 ? (
              'Select people to move...'
            ) : (
              <>
                Move: {selectedMissionaries} 👨 + {selectedCannibals} 👹 {direction} {toBank}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleMakeMove}
          disabled={isComplete || hasLost || (selectedMissionaries === 0 && selectedCannibals === 0)}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
        >
          <span>🚤</span> Make Move {direction}
        </button>
        <button
          onClick={onReset}
          className="px-4 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-all shadow-lg"
          title="Reset Game"
        >
          🔁
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-amber-900/30 rounded-lg border border-amber-700">
        <div className="text-xs text-amber-300">
          <div className="font-bold mb-1">📋 Rules:</div>
          <ul className="list-disc list-inside space-y-1">
            <li>Boat capacity: 1-2 people</li>
            <li>Safety: Cannibals ≤ Missionaries (unless M=0)</li>
            <li>Goal: Move everyone to right bank</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
