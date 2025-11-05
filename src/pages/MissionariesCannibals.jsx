import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AStarSolver } from '../astar';
import RiverScene from '../components/RiverScene';
import StateTable from '../components/StateTable';
import Controls from '../components/Controls';
import ExplanationLog from '../components/ExplanationLog';
import ManualMoveControls from '../components/ManualMoveControls';
import CodeViewer from '../components/CodeViewer';

function MissionariesCannibals() {
  const [solver, setSolver] = useState(null);
  const [currentState, setCurrentState] = useState(null);
  const [openList, setOpenList] = useState([]);
  const [closedList, setClosedList] = useState([]);
  const [stepHistory, setStepHistory] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [explainMode, setExplainMode] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [totalMissionaries] = useState(3);
  const [totalCannibals] = useState(3);
  const [playMode, setPlayMode] = useState('auto'); // 'auto' or 'manual'
  const [hasLost, setHasLost] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const autoRunRef = useRef(null);

  // Initialize solver
  useEffect(() => {
    const newSolver = new AStarSolver(totalMissionaries, totalCannibals);
    newSolver.initialize();
    setSolver(newSolver);
    setCurrentState(newSolver.currentState);
    setOpenList([...newSolver.openList]);
    setClosedList([...newSolver.closedList]);
    setStepHistory([...newSolver.stepHistory]);
    setIsComplete(false);
  }, [totalMissionaries, totalCannibals]);

  // Handle next step
  const handleNextStep = () => {
    if (!solver || isComplete) return;

    setIsAnimating(true);
    
    const result = solver.step();
    
    setCurrentState(solver.currentState);
    setOpenList([...solver.openList]);
    setClosedList([...solver.closedList]);
    setStepHistory([...solver.stepHistory]);

    if (solver.goalReached) {
      setIsComplete(true);
      setIsRunning(false);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 1200); // Wait for boat animation to complete
  };

  // Handle auto run
  const handleAutoRun = () => {
    if (isRunning) {
      setIsRunning(false);
      if (autoRunRef.current) {
        clearTimeout(autoRunRef.current);
      }
    } else {
      setIsRunning(true);
      runNextStep();
    }
  };

  const runNextStep = () => {
    if (!solver || solver.goalReached) {
      setIsRunning(false);
      return;
    }

    handleNextStep();

    autoRunRef.current = setTimeout(() => {
      if (isRunning && !solver.goalReached) {
        runNextStep();
      }
    }, animationSpeed);
  };

  useEffect(() => {
    if (isRunning && !isComplete) {
      runNextStep();
    }
    return () => {
      if (autoRunRef.current) {
        clearTimeout(autoRunRef.current);
      }
    };
  }, [isRunning]);

  // Handle reset
  const handleReset = () => {
    setIsRunning(false);
    setHasLost(false);
    if (autoRunRef.current) {
      clearTimeout(autoRunRef.current);
    }

    const newSolver = new AStarSolver(totalMissionaries, totalCannibals);
    newSolver.initialize();
    setSolver(newSolver);
    setCurrentState(newSolver.currentState);
    setOpenList([...newSolver.openList]);
    setClosedList([...newSolver.closedList]);
    setStepHistory([...newSolver.stepHistory]);
    setIsComplete(false);
  };

  // Handle speed change
  const handleSpeedChange = (speed) => {
    setAnimationSpeed(speed);
  };

  // Handle explain mode toggle
  const handleExplainModeToggle = (mode) => {
    setExplainMode(mode);
  };

  // Handle manual move
  const handleManualMove = (missionaries, cannibals) => {
    if (!solver || isComplete || hasLost) return false;

    setIsAnimating(true);
    
    const result = solver.makeManualMove(missionaries, cannibals);
    
    if (result.success) {
      setCurrentState(solver.currentState);
      setOpenList([...solver.openList]);
      setClosedList([...solver.closedList]);
      setStepHistory([...solver.stepHistory]);

      if (solver.goalReached) {
        setTimeout(() => {
          setIsComplete(true);
          setIsRunning(false);
          setIsAnimating(false);
        }, 1200);
      } else {
        setTimeout(() => {
          setIsAnimating(false);
        }, 1200);
      }
    } else if (result.lost) {
      // User made an invalid move that creates unsafe state
      setTimeout(() => {
        setHasLost(true);
        setIsRunning(false);
        setIsAnimating(false);
      }, 1200);
    }
    
    return result.success;
  };

  // Handle mode change
  const handleModeChange = (mode) => {
    setPlayMode(mode);
    if (mode === 'manual') {
      setIsRunning(false);
      if (autoRunRef.current) {
        clearTimeout(autoRunRef.current);
      }
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-100 mb-4 drop-shadow-lg">
            🚤 Missionaries & Cannibals A* Solver
          </h1>
          <p className="text-xl text-gray-300 drop-shadow">
            Interactive Visualization of A* Search Algorithm
          </p>
          <div className="mt-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 inline-block border border-slate-700">
            <p className="text-gray-200 text-sm">
              <strong>Goal:</strong> Move all 3 missionaries and 3 cannibals from left to right bank safely
            </p>
            <p className="text-gray-200 text-sm mt-1">
              <strong>Rule:</strong> Cannibals must never outnumber missionaries on either side (unless no missionaries present)
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-3 text-gray-200">🎯 Play Mode</h3>
          <div className="flex gap-4">
            <button
              onClick={() => handleModeChange('auto')}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                playMode === 'auto'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              🤖 A* Auto Solver
            </button>
            <button
              onClick={() => handleModeChange('manual')}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                playMode === 'manual'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              🎮 Manual Play
            </button>
          </div>
          <div className="mt-4 text-right">
            <span className="text-sm text-gray-400">
              Step: <strong className="text-cyan-400 text-lg">{stepHistory.length - 1}</strong>
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Visualization */}
          <div className="lg:col-span-2 space-y-6">
            <RiverScene 
              state={currentState} 
              totalM={totalMissionaries} 
              totalC={totalCannibals}
              isAnimating={isAnimating}
            />
            <StateTable 
              openList={openList} 
              closedList={closedList} 
              currentState={currentState}
            />
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            {playMode === 'auto' ? (
              <Controls
                onNextStep={handleNextStep}
                onAutoRun={handleAutoRun}
                onReset={handleReset}
                isRunning={isRunning}
                isComplete={isComplete}
                animationSpeed={animationSpeed}
                onSpeedChange={handleSpeedChange}
                explainMode={explainMode}
                onExplainModeToggle={handleExplainModeToggle}
                onViewCode={() => setShowCodeViewer(true)}
              />
            ) : (
              <ManualMoveControls
                onManualMove={handleManualMove}
                onReset={handleReset}
                currentState={currentState}
                totalM={totalMissionaries}
                totalC={totalCannibals}
                isComplete={isComplete}
                hasLost={hasLost}
              />
            )}
          </div>
        </div>

        {/* Explanation Log */}
        <ExplanationLog 
          stepHistory={stepHistory} 
          explainMode={explainMode}
          isComplete={isComplete}
        />

        {/* Success Modal */}
        {isComplete && !showLogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-2 border-green-500 rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-400 mb-4">
                  Success!
                </h2>
                <p className="text-lg text-gray-300 mb-2">
                  All missionaries and cannibals have safely crossed the river!
                </p>
                <p className="text-gray-400 mb-6">
                  Solution found in <strong className="text-cyan-400">{currentState?.g}</strong> steps
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowLogModal(true)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                  >
                    📝 View Log
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lose Modal */}
        {hasLost && !showLogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-2 border-red-500 rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="text-6xl mb-4">💀</div>
                <h2 className="text-3xl font-bold text-red-400 mb-4">
                  Game Over!
                </h2>
                <p className="text-lg text-gray-300 mb-2">
                  Invalid move! The cannibals outnumber the missionaries.
                </p>
                <p className="text-gray-400 mb-6">
                  Everyone got eaten. Better luck next time!
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowLogModal(true)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                  >
                    📝 View Log
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Explanation Log Modal */}
        {showLogModal && (isComplete || hasLost) && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-2 border-cyan-500 rounded-2xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                  📝 Game Explanation Log
                </h2>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 overflow-auto">
                <div className="space-y-3">
                  {stepHistory.map((step, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        index === stepHistory.length - 1 
                          ? 'bg-cyan-900/30 border-cyan-600' 
                          : 'bg-slate-900/30 border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-gray-200 text-lg mb-2">
                        Step {index}: {step.action}
                      </div>
                      {step.state && (
                        <div className="text-sm text-gray-300 mb-2">
                          <span className="font-semibold">State:</span> ({step.state.missionaries}M, {step.state.cannibals}C, {step.state.boat === 0 ? 'Left' : 'Right'})
                          {' '} | <span className="text-cyan-400">g={step.state.g}, h={step.state.h}, f={step.state.f}</span>
                        </div>
                      )}
                      {step.explanation && (
                        <div className="text-sm text-gray-400 italic mt-2 p-2 bg-slate-900/50 rounded border border-slate-600">
                          {step.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  Total Log Entries: <strong className="text-cyan-400">{stepHistory.length}</strong> | 
                  Actual Moves: <strong className="text-green-400">{currentState?.g || 0}</strong>
                </div>
                <button
                  onClick={() => {
                    setShowLogModal(false);
                    handleReset();
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Start New Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Built with React, Tailwind CSS, and Framer Motion</p>
          <p className="mt-1">A* Algorithm Educational Visualizer © 2025</p>
        </div>
      </div>

      {/* Code Viewer Modal */}
      <CodeViewer
        isOpen={showCodeViewer}
        onClose={() => setShowCodeViewer(false)}
      />
    </div>
  );
}

export default MissionariesCannibals;
