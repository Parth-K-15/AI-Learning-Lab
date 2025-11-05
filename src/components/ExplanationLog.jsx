import React, { useRef } from 'react';

export default function ExplanationLog({ stepHistory, explainMode, isComplete }) {
  const logEndRef = useRef(null);

  if (!stepHistory || stepHistory.length === 0) {
    return null;
  }

  const currentStep = stepHistory[stepHistory.length - 1];

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4 text-gray-200 flex items-center">
        <span className="mr-2">📝</span> Explanation Log
      </h3>

      {/* Current Step Highlight */}
      {currentStep && (
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          isComplete ? 'bg-green-900/30 border-green-500' : 'bg-cyan-900/30 border-cyan-500'
        }`}>
          <div className="font-bold text-lg mb-2 text-gray-200">
            {isComplete ? '🎉 Complete!' : `Step ${stepHistory.length - 1}`}
          </div>
          <div className="text-sm text-gray-300">
            {currentStep.action && (
              <div className="mb-2">
                <span className="font-semibold">Action:</span> {currentStep.action}
              </div>
            )}
            {currentStep.state && (
              <div className="mb-2">
                <span className="font-semibold">State:</span> ({currentStep.state.missionaries}M, {currentStep.state.cannibals}C, {currentStep.state.boat === 0 ? 'Left' : 'Right'})
                {' '} | g={currentStep.state.g}, h={currentStep.state.h}, f={currentStep.state.f}
              </div>
            )}
            {explainMode && currentStep.explanation && (
              <div className="mt-2 p-2 bg-slate-900/50 rounded border border-slate-600">
                <span className="font-semibold">Explanation:</span> {currentStep.explanation}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step History */}
      <div className="max-h-96 overflow-auto space-y-2 scroll-smooth">
        {stepHistory.map((step, index) => (
          <div
            key={index}
            className={`p-3 rounded border text-sm ${
              index === stepHistory.length - 1 
                ? 'bg-cyan-900/30 border-cyan-600' 
                : 'bg-slate-900/30 border-slate-700'
            }`}
          >
            <div className="font-semibold text-gray-300">
              Step {index}: {step.action}
            </div>
            {step.state && (
              <div className="text-xs text-gray-400 mt-1">
                State: ({step.state.missionaries}M, {step.state.cannibals}C, {step.state.boat === 0 ? 'L' : 'R'})
                {' '} | f={step.state.f}
              </div>
            )}
            {explainMode && step.explanation && (
              <div className="text-xs text-gray-400 mt-1 italic">
                {step.explanation}
              </div>
            )}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Heuristic Info */}
      {explainMode && (
        <div className="mt-4 p-4 bg-indigo-900/30 rounded-lg border border-indigo-700">
          <h4 className="font-bold text-indigo-300 mb-2">📐 Heuristic Information</h4>
          <ul className="text-sm space-y-1 text-gray-300">
            <li><strong>g(n):</strong> Cost from start node (number of moves made)</li>
            <li><strong>h(n):</strong> Heuristic estimate to goal (people remaining on left bank)</li>
            <li><strong>f(n) = g(n) + h(n):</strong> Total estimated cost</li>
            <li className="mt-2 text-indigo-300">
              <strong>A* Strategy:</strong> Always expand the node with the lowest f value to find the optimal path efficiently.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
