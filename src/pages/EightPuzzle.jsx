import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AStarSolver } from '../8puzzle/solver';
import { generateRandomPuzzle, GOAL_STATE } from '../8puzzle/puzzle';
import PuzzleBoard from '../components/8puzzle/PuzzleBoard';
import OpenListPanel from '../components/8puzzle/OpenListPanel';
import HeuristicPanel from '../components/8puzzle/HeuristicPanel';
import PuzzleControls from '../components/8puzzle/PuzzleControls';
import CodeViewer from '../components/CodeViewer';
import pythonCode from '../code/8puzzle.py?raw';
import cppCode from '../code/8puzzle.cpp?raw';
import javaCode from '../code/8puzzle.java?raw';

export default function EightPuzzle() {
  // Configuration state
  const [initialBoard, setInitialBoard] = useState(null);
  const [goalBoard, setGoalBoard] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [initialInput, setInitialInput] = useState(['1','2','3','5','0','6','4','7','8']);
  const [goalInput, setGoalInput] = useState(['1','2','3','4','5','6','7','8','0']);
  
  // Solver state
  const [solver, setSolver] = useState(null);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [openList, setOpenList] = useState([]);
  const [closedList, setClosedList] = useState([]);
  const [currentState, setCurrentState] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [showCode, setShowCode] = useState(false);
  const [operationHistory, setOperationHistory] = useState([]);
  const [solution, setSolution] = useState(null);
  const autoRunRef = useRef(null);

  const handleStartSolver = (useRandom = false) => {
    let initialBoardParsed, goalBoardParsed;
    
    if (useRandom) {
      initialBoardParsed = generateRandomPuzzle();
      goalBoardParsed = [
        goalInput.slice(0, 3).map(Number),
        goalInput.slice(3, 6).map(Number),
        goalInput.slice(6, 9).map(Number)
      ];
    } else {
      // Parse custom input
      initialBoardParsed = [
        initialInput.slice(0, 3).map(Number),
        initialInput.slice(3, 6).map(Number),
        initialInput.slice(6, 9).map(Number)
      ];
      goalBoardParsed = [
        goalInput.slice(0, 3).map(Number),
        goalInput.slice(3, 6).map(Number),
        goalInput.slice(6, 9).map(Number)
      ];
    }

    setInitialBoard(initialBoardParsed);
    setGoalBoard(goalBoardParsed);
    const newSolver = new AStarSolver(initialBoardParsed, goalBoardParsed);
    setSolver(newSolver);
    setCurrentBoard([...initialBoardParsed.map(row => [...row])]);
    setCurrentState(newSolver.initialState);
    setOpenList(newSolver.getOpenListSnapshot());
    setClosedList([]);
    setOperationHistory([]);
    setSolution(null);
    setIsComplete(false);
    setIsConfigured(true);
  };

  const handleNextStep = () => {
    if (!solver || isComplete) return;

    const result = solver.step();
    
    setCurrentBoard([...result.currentState.board.map(row => [...row])]);
    setCurrentState(result.currentState);
    setOpenList(result.openList);
    setClosedList(result.closedList);

    if (result.stepInfo) {
      setOperationHistory(prev => [...prev, {
        step: prev.length + 1,
        ...result.stepInfo,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }

    if (result.done) {
      setIsComplete(true);
      setIsRunning(false);
      if (result.solution) {
        setSolution(result.solution);
      }
    }
  };

  const handleAutoRun = () => {
    if (isRunning) {
      setIsRunning(false);
      setIsPaused(true);
      if (autoRunRef.current) {
        clearTimeout(autoRunRef.current);
      }
    } else {
      setIsRunning(true);
      setIsPaused(false);
      runNextStep();
    }
  };

  const runNextStep = () => {
    if (!isRunning || isComplete) return;
    
    handleNextStep();
    
    autoRunRef.current = setTimeout(() => {
      runNextStep();
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

  const handleReset = () => {
    if (autoRunRef.current) {
      clearTimeout(autoRunRef.current);
    }
    setIsRunning(false);
    setIsPaused(false);
    setIsConfigured(false);
    setSolver(null);
    setCurrentBoard(null);
    setOpenList([]);
    setClosedList([]);
    setCurrentState(null);
    setIsComplete(false);
    setOperationHistory([]);
    setSolution(null);
  };

  const handleSpeedChange = (speed) => {
    setAnimationSpeed(speed);
  };

  const handleFindSolution = () => {
    if (!solver || isComplete) return;

    // Stop any running animation
    if (autoRunRef.current) {
      clearTimeout(autoRunRef.current);
    }
    setIsRunning(false);
    setIsPaused(false);
    setIsSolving(true);

    // Use setTimeout to allow UI to update with loading state
    setTimeout(() => {
      try {
        // Solve directly
        const result = solver.solve();

        if (result.success && result.solution) {
          // Set to final state
          const finalState = result.solution[result.solution.length - 1];
          setCurrentBoard([...finalState.board.map(row => [...row])]);
          setCurrentState(finalState);
          setOpenList(solver.getOpenListSnapshot());
          setClosedList(solver.closedList);
          setSolution(result.solution);
          setIsComplete(true);

          // Add all steps to history
          const newHistory = result.stepLog.map((log, idx) => ({
            step: idx + 1,
            ...log,
            timestamp: new Date().toLocaleTimeString()
          }));
          setOperationHistory(newHistory);
        }
      } catch (error) {
        console.error('Error solving puzzle:', error);
        alert('Failed to solve puzzle. The puzzle might be too complex or unsolvable.');
      } finally {
        setIsSolving(false);
      }
    }, 50);
  };

  const handleInitialInputChange = (index, value) => {
    const newInput = [...initialInput];
    newInput[index] = value;
    setInitialInput(newInput);
  };

  const handleGoalInputChange = (index, value) => {
    const newInput = [...goalInput];
    newInput[index] = value;
    setGoalInput(newInput);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
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
              🧩 8-Puzzle A* Solver Setup
            </h1>
            <p className="text-xl text-gray-300 drop-shadow">
              Configure initial and goal states (0 = blank tile)
            </p>
          </div>

          {/* Configuration Panel */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700 space-y-6">
            {/* Initial and Goal States */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Initial State */}
              <div>
                <label className="block text-lg font-semibold text-cyan-400 mb-3 text-center">
                  🎯 Initial State
                </label>
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {initialInput.map((value, idx) => (
                    <input
                      key={idx}
                      type="number"
                      min="0"
                      max="8"
                      value={value}
                      onChange={(e) => handleInitialInputChange(idx, e.target.value)}
                      className="w-full h-16 text-center text-2xl font-bold bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-cyan-500 focus:outline-none"
                    />
                  ))}
                </div>
              </div>

              {/* Goal State */}
              <div>
                <label className="block text-lg font-semibold text-purple-400 mb-3 text-center">
                  🏁 Goal State
                </label>
                <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                  {goalInput.map((value, idx) => (
                    <input
                      key={idx}
                      type="number"
                      min="0"
                      max="8"
                      value={value}
                      onChange={(e) => handleGoalInputChange(idx, e.target.value)}
                      className="w-full h-16 text-center text-2xl font-bold bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-purple-500 focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Start Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => handleStartSolver(false)}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Start with Custom
              </button>
              <button
                onClick={() => handleStartSolver(true)}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Random Puzzle
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            ← Back to Setup
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            🧩 8-Puzzle A* Solver
          </h1>
          <p className="text-gray-400">
            Heuristic: <span className="text-purple-400 font-semibold">Misplaced Tiles</span>
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <PuzzleControls
            onNextStep={handleNextStep}
            onAutoRun={handleAutoRun}
            onReset={handleReset}
            onFindSolution={handleFindSolution}
            isRunning={isRunning}
            isComplete={isComplete}
            isSolving={isSolving}
            animationSpeed={animationSpeed}
            onSpeedChange={handleSpeedChange}
            onViewCode={() => setShowCode(true)}
          />
          
          {/* Disclaimer */}
          <div className="mt-3 bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-3">
            <div className="flex items-start gap-2 text-yellow-400 text-sm">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <p>
                <strong>Note:</strong> Using "Find Solution" on complex puzzles may take time and consume significant memory. 
                If the puzzle requires many steps (20+ moves), it may slow down or crash the current session.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Open List */}
          <div className="xl:col-span-1">
            <OpenListPanel openList={openList} />
          </div>

          {/* Right Column - Puzzle Board & Stats */}
          <div className="xl:col-span-2 space-y-6">
            {/* Puzzle Boards */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 text-gray-200 text-center">
                Puzzle States
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current State */}
                <div>
                  <div className="text-center mb-3">
                    <span className="text-cyan-400 font-semibold">🎯 Current State</span>
                  </div>
                  <div className="flex justify-center">
                    <PuzzleBoard 
                      board={currentBoard} 
                      goalBoard={goalBoard}
                      highlightCorrect={true}
                    />
                  </div>
                </div>
                {/* Goal State */}
                <div>
                  <div className="text-center mb-3">
                    <span className="text-purple-400 font-semibold">🏁 Goal State</span>
                  </div>
                  <div className="flex justify-center">
                    <PuzzleBoard 
                      board={goalBoard} 
                      goalBoard={goalBoard}
                      highlightCorrect={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Heuristic Panel */}
            <HeuristicPanel 
              stats={solver?.getStats() || {}} 
              currentState={currentState}
            />
          </div>
        </div>

        {/* Operation History */}
        {operationHistory.length > 0 && (
          <div className="mb-6">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 text-gray-200 flex items-center gap-2">
                <span>📜</span> Operation History
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {operationHistory.map((op, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-cyan-400 mb-1">
                          Step {op.step}: {op.action}
                        </div>
                        <div className="text-xs text-gray-300">{op.message}</div>
                        {op.move && (
                          <div className="text-xs text-purple-400 mt-1">
                            <span className="text-gray-500">Move:</span> {op.move}
                          </div>
                        )}
                        <div className="flex gap-4 text-xs text-gray-400 mt-2">
                          <span>Open: {op.openSize}</span>
                          <span>Closed: {op.closedSize}</span>
                          {op.neighborsAdded !== undefined && (
                            <span className="text-green-400">+{op.neighborsAdded} neighbors</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {op.timestamp}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Solution Path */}
        {solution && (
          <div className="mb-6">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 text-gray-200 flex items-center gap-2">
                <span>✅</span> Solution Path ({solution.length - 1} moves)
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {solution.map((state, idx) => (
                  <div key={idx} className="flex-shrink-0">
                    <div className="text-center mb-2">
                      <span className="text-sm font-semibold text-cyan-400">Step {idx}</span>
                      {state.move && (
                        <span className="text-xs text-purple-400 ml-2">({state.move})</span>
                      )}
                    </div>
                    <div className="scale-75">
                      <PuzzleBoard board={state.board} highlightCorrect={false} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Built with React, Tailwind CSS, and Framer Motion</p>
          <p className="mt-1">8-Puzzle A* Solver © 2025</p>
        </div>
      </div>

      <CodeViewer 
        isOpen={showCode} 
        onClose={() => setShowCode(false)} 
        pyCode={pythonCode}
        cppCode={cppCode}
        javaCode={javaCode}
        baseName="8puzzle" 
      />

      {/* Floating Action Buttons */}
      <AnimatePresence>
        {(isRunning || isPaused) && !isComplete && (
          <motion.button
            key={isRunning ? 'pause' : 'resume'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleAutoRun}
            className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-16 h-16 sm:w-20 sm:h-20 text-white rounded-full shadow-2xl transition-all z-50 flex items-center justify-center ${
              isRunning 
                ? 'bg-gradient-to-br from-orange-600 to-red-600 hover:shadow-orange-500/50'
                : 'bg-gradient-to-br from-green-600 to-emerald-600 hover:shadow-green-500/50'
            }`}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title={isRunning ? 'Pause' : 'Resume'}
          >
            <span className="text-3xl sm:text-4xl">{isRunning ? '⏸️' : '▶️'}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfigured && !isComplete && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleReset}
            className="fixed bottom-6 right-24 sm:bottom-8 sm:right-32 w-16 h-16 sm:w-20 sm:h-20 text-white rounded-full shadow-2xl bg-gradient-to-br from-gray-600 to-gray-800 hover:shadow-gray-500/50 transition-all z-50 flex items-center justify-center"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Reset"
          >
            <span className="text-3xl sm:text-4xl">🔄</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
