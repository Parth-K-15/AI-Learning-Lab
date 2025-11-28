import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoalStackPlanner } from '../gsp/planner';
import { ON, ONTABLE, CLEAR, HOLDING, ARMEMPTY } from '../gsp/predicate';
import BlocksWorld from '../components/gsp/BlocksWorld';
import GoalStackPanel from '../components/gsp/GoalStackPanel';
import ActionPanel from '../components/gsp/ActionPanel';
import WorldStatePanel from '../components/gsp/WorldStatePanel';
import GSPControls from '../components/gsp/GSPControls';
import CodeViewer from '../components/CodeViewer';
import pythonCode from '../code/goal_stack_planning.py?raw';
import cppCode from '../code/goal_stack_planning.cpp?raw';
import javaCode from '../code/goal_stack_planning.java?raw';

export default function GoalStackPlanning() {
  // Configuration state
  const [numBlocks, setNumBlocks] = useState(3);
  const [blocks, setBlocks] = useState(['A', 'B', 'C']);
  const [initialConfig, setInitialConfig] = useState({ A: 'table', B: 'A', C: 'table' });
  const [goalConfig, setGoalConfig] = useState({ A: 'B', B: 'C', C: 'table' });
  const [isConfigured, setIsConfigured] = useState(false);
  
  // Planner state
  const [planner, setPlanner] = useState(null);
  const [currentState, setCurrentState] = useState([]);
  const [goalState, setGoalState] = useState([]);
  const [currentStack, setCurrentStack] = useState([]);
  const [currentPlan, setCurrentPlan] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1500);
  const [showCode, setShowCode] = useState(false);
  const [showActionsTable, setShowActionsTable] = useState(false);
  const [holdingBlock, setHoldingBlock] = useState(null);
  const [operationHistory, setOperationHistory] = useState([]);
  const autoRunRef = useRef(null);

  // Initialize blocks based on numBlocks
  useEffect(() => {
    const blockLabels = ['A', 'B', 'C', 'D', 'E'].slice(0, numBlocks);
    setBlocks(blockLabels);
    
    // Reset configurations with defaults
    const defaultInitial = { A: 'table', B: 'A', C: 'table' };
    const defaultGoal = { A: 'B', B: 'C', C: 'table' };
    
    if (numBlocks === 4) {
      defaultInitial.D = 'table';
      defaultGoal.D = 'table';
    } else if (numBlocks === 5) {
      defaultInitial.D = 'table';
      defaultInitial.E = 'table';
      defaultGoal.D = 'table';
      defaultGoal.E = 'D';
    }
    
    setInitialConfig(defaultInitial);
    setGoalConfig(defaultGoal);
    setIsConfigured(false);
  }, [numBlocks]);

  const handleStartPlanner = () => {
    // Build initial state from configuration
    const initialState = [];
    blocks.forEach(block => {
      if (initialConfig[block] === 'table') {
        initialState.push(ONTABLE(block));
      } else if (initialConfig[block]) {
        initialState.push(ON(block, initialConfig[block]));
      }
    });
    
    // Add CLEAR predicates
    blocks.forEach(block => {
      const isBlockedInInitial = blocks.some(b => initialConfig[b] === block);
      if (!isBlockedInInitial) {
        initialState.push(CLEAR(block));
      }
    });
    
    initialState.push(ARMEMPTY());

    // Build goal state from configuration
    const goalState = [];
    blocks.forEach(block => {
      if (goalConfig[block] === 'table') {
        goalState.push(ONTABLE(block));
      } else if (goalConfig[block]) {
        goalState.push(ON(block, goalConfig[block]));
      }
    });
    goalState.push(ARMEMPTY());

    // Initialize planner
    const newPlanner = new GoalStackPlanner(initialState, goalState, blocks);
    setPlanner(newPlanner);
    setCurrentState([...initialState]);
    setGoalState([...goalState]);
    setCurrentStack(newPlanner.getStackSnapshot());
    setCurrentPlan([]);
    setCurrentStep(null);
    setIsComplete(false);
    setIsConfigured(true);
  };

  // Extract holding block from state
  useEffect(() => {
    const holdingPred = currentState.find(p => p.name === 'HOLDING');
    setHoldingBlock(holdingPred ? holdingPred.x : null);
  }, [currentState]);

  // Handle next step
  const handleNextStep = () => {
    if (!planner || isComplete) return;

    const result = planner.step();
    
    setCurrentState([...planner.state]);
    setCurrentStack(planner.getStackSnapshot());
    setCurrentPlan([...planner.plan]);
    
    if (planner.stepLog.length > 0) {
      const lastStep = planner.stepLog[planner.stepLog.length - 1];
      setCurrentStep(lastStep);
      // Add to operation history
      setOperationHistory(prev => [...prev, {
        step: prev.length + 1,
        ...lastStep,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }

    if (planner.completed) {
      setIsComplete(true);
      setIsRunning(false);
    }
  };

  // Handle auto run
  const handleAutoRun = () => {
    if (isRunning) {
      // Pause
      setIsRunning(false);
      setIsPaused(true);
      if (autoRunRef.current) {
        clearTimeout(autoRunRef.current);
      }
    } else {
      // Resume/Start
      setIsRunning(true);
      setIsPaused(false);
      runNextStep();
    }
  };

  const runNextStep = () => {
    if (!planner || planner.completed) {
      setIsRunning(false);
      return;
    }

    handleNextStep();

    if (!planner.completed) {
      autoRunRef.current = setTimeout(() => {
        runNextStep();
      }, animationSpeed);
    } else {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (autoRunRef.current) {
        clearTimeout(autoRunRef.current);
      }
    };
  }, []);

  // Handle reset
  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (autoRunRef.current) {
      clearTimeout(autoRunRef.current);
    }
    setIsConfigured(false);
    setPlanner(null);
    setCurrentState([]);
    setCurrentStack([]);
    setCurrentPlan([]);
    setCurrentStep(null);
    setIsComplete(false);
    setOperationHistory([]);
  };

  // Handle speed change
  const handleSpeedChange = (speed) => {
    setAnimationSpeed(speed);
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
              🧱 Goal Stack Planning Setup
            </h1>
            <p className="text-xl text-gray-300 drop-shadow">
              Configure your blocks world problem
            </p>
          </div>

          {/* Configuration Panel */}
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
            {/* Number of Blocks */}
            <div className="mb-8">
              <label className="block text-lg font-semibold text-gray-200 mb-3">
                Number of Blocks
              </label>
              <div className="flex gap-4">
                {[3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setNumBlocks(n)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      numBlocks === n
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {n} Blocks
                  </button>
                ))}
              </div>
            </div>

            {/* Initial State Configuration */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Initial State</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {blocks.map(block => (
                  <div key={block} className="bg-slate-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Block {block} is on:
                    </label>
                    <select
                      value={initialConfig[block] || 'table'}
                      onChange={(e) => setInitialConfig({ ...initialConfig, [block]: e.target.value })}
                      className="w-full bg-slate-600 text-white rounded px-3 py-2 border border-slate-500 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="table">Table</option>
                      {blocks.filter(b => b !== block).map(b => (
                        <option key={b} value={b}>Block {b}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Goal State Configuration */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-200 mb-3">Goal State</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {blocks.map(block => (
                  <div key={block} className="bg-slate-700 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Block {block} should be on:
                    </label>
                    <select
                      value={goalConfig[block] || 'table'}
                      onChange={(e) => setGoalConfig({ ...goalConfig, [block]: e.target.value })}
                      className="w-full bg-slate-600 text-white rounded px-3 py-2 border border-slate-500 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="table">Table</option>
                      {blocks.filter(b => b !== block).map(b => (
                        <option key={b} value={b}>Block {b}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={handleStartPlanner}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Start Planning
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
            ← Reconfigure
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-100 mb-4 drop-shadow-lg">
            🧱 Goal Stack Planning Visualizer
          </h1>
          <p className="text-xl text-gray-300 drop-shadow">
            Interactive Visualization of AI Planning with Blocks World
          </p>
          <div className="mt-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 inline-block border border-slate-700">
            <p className="text-gray-200 text-sm">
              <strong>Algorithm:</strong> Stack-based backward planning with operator selection
            </p>
          </div>
        </div>

        {/* Controls - Full Width */}
        <div className="mb-6">
          <GSPControls
            onNextStep={handleNextStep}
            onAutoRun={handleAutoRun}
            onReset={handleReset}
            isRunning={isRunning}
            isComplete={isComplete}
            animationSpeed={animationSpeed}
            onSpeedChange={handleSpeedChange}
            onViewCode={() => setShowCode(true)}
            onShowActionsTable={() => setShowActionsTable(true)}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Goal Stack */}
          <div className="xl:col-span-1 flex flex-col">
            <GoalStackPanel stack={currentStack} />
          </div>

          {/* Right Column - Blocks World & World State */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 text-gray-200">
                🎯 Blocks World
              </h3>
              <BlocksWorld 
                state={currentState} 
                blocks={blocks}
                holdingBlock={holdingBlock}
              />
            </div>

            <WorldStatePanel state={currentState} goalState={goalState} />
          </div>
        </div>

        {/* Action Panel - Full Width */}
        <div className="mb-6">
          <ActionPanel currentStep={currentStep} plan={currentPlan} />
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
                    <div className="flex items-start gap-3">
                      <div className="text-xs bg-cyan-600 text-white px-2 py-1 rounded font-bold min-w-[3rem] text-center">
                        #{op.step}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium mb-1">
                          {op.action}
                        </div>
                        {op.message && (
                          <div className="text-xs text-gray-300 mb-1">
                            {op.message}
                          </div>
                        )}
                        {op.operator && (
                          <div className="text-xs text-green-400">
                            <span className="text-gray-500">Operator:</span> {op.operator}
                          </div>
                        )}
                        {op.goal && (
                          <div className="text-xs text-blue-400">
                            <span className="text-gray-500">Goal:</span> {op.goal}
                          </div>
                        )}
                        {op.preconditions && op.preconditions.length > 0 && (
                          <div className="text-xs text-yellow-400 mt-1">
                            <span className="text-gray-500">Pushed Preconditions:</span> {op.preconditions.join(', ')}
                          </div>
                        )}
                        {op.unsatisfied && op.unsatisfied.length > 0 && (
                          <div className="text-xs text-orange-400 mt-1">
                            <span className="text-gray-500">Unsatisfied:</span> {op.unsatisfied.join(', ')}
                          </div>
                        )}
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

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Built with React, Tailwind CSS, and Framer Motion</p>
          <p className="mt-1">Goal Stack Planning Educational Visualizer © 2025</p>
        </div>
      </div>

      <CodeViewer 
        isOpen={showCode} 
        onClose={() => setShowCode(false)} 
        pyCode={pythonCode}
        cppCode={cppCode}
        javaCode={javaCode}
        baseName="goal_stack_planning" 
      />

      {/* Actions Table Modal */}
      <AnimatePresence>
        {showActionsTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowActionsTable(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-2 border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📊</span> Actions Table
                </h2>
                <button
                  onClick={() => setShowActionsTable(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-6">
                  {/* PICKUP */}
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-xl font-bold text-green-400 mb-3">PICKUP(x)</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Preconditions:</div>
                        <ul className="space-y-1 text-blue-300">
                          <li>• ONTABLE(x)</li>
                          <li>• CLEAR(x)</li>
                          <li>• ARMEMPTY()</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Add Effects:</div>
                        <ul className="space-y-1 text-green-300">
                          <li>• HOLDING(x)</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Delete Effects:</div>
                        <ul className="space-y-1 text-red-300">
                          <li>• ONTABLE(x)</li>
                          <li>• CLEAR(x)</li>
                          <li>• ARMEMPTY()</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* PUTDOWN */}
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-xl font-bold text-green-400 mb-3">PUTDOWN(x)</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Preconditions:</div>
                        <ul className="space-y-1 text-blue-300">
                          <li>• HOLDING(x)</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Add Effects:</div>
                        <ul className="space-y-1 text-green-300">
                          <li>• ONTABLE(x)</li>
                          <li>• CLEAR(x)</li>
                          <li>• ARMEMPTY()</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Delete Effects:</div>
                        <ul className="space-y-1 text-red-300">
                          <li>• HOLDING(x)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* STACK */}
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-xl font-bold text-green-400 mb-3">STACK(x, y)</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Preconditions:</div>
                        <ul className="space-y-1 text-blue-300">
                          <li>• HOLDING(x)</li>
                          <li>• CLEAR(y)</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Add Effects:</div>
                        <ul className="space-y-1 text-green-300">
                          <li>• ON(x, y)</li>
                          <li>• CLEAR(x)</li>
                          <li>• ARMEMPTY()</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Delete Effects:</div>
                        <ul className="space-y-1 text-red-300">
                          <li>• HOLDING(x)</li>
                          <li>• CLEAR(y)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* UNSTACK */}
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-xl font-bold text-green-400 mb-3">UNSTACK(x, y)</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Preconditions:</div>
                        <ul className="space-y-1 text-blue-300">
                          <li>• ON(x, y)</li>
                          <li>• CLEAR(x)</li>
                          <li>• ARMEMPTY()</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Add Effects:</div>
                        <ul className="space-y-1 text-green-300">
                          <li>• HOLDING(x)</li>
                          <li>• CLEAR(y)</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-gray-400 font-semibold mb-2">Delete Effects:</div>
                        <ul className="space-y-1 text-red-300">
                          <li>• ON(x, y)</li>
                          <li>• CLEAR(x)</li>
                          <li>• ARMEMPTY()</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
