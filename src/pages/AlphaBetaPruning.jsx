import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createGameTree, calculateTreeLayout } from '../alphabeta/tree';
import { AlphaBetaSolver } from '../alphabeta/solver';
import TreeCanvas from '../components/alphabeta/TreeCanvas';
import AlphaBetaControls from '../components/alphabeta/AlphaBetaControls';
import PruningLog from '../components/alphabeta/PruningLog';
import NodeDetailsPanel from '../components/alphabeta/NodeDetailsPanel';
import CodeViewer from '../components/CodeViewer';
import pythonCode from '../code/alphabeta.py?raw';
import cppCode from '../code/alphabeta.cpp?raw';
import javaCode from '../code/alphabeta.java?raw';

export default function AlphaBetaPruning() {
  const [tree, setTree] = useState(null);
  const [positions, setPositions] = useState(null);
  const [solver, setSolver] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [evaluationLog, setEvaluationLog] = useState([]);
  const [prunedNodes, setPrunedNodes] = useState([]);
  const [evaluatedLeaves, setEvaluatedLeaves] = useState([]);
  const [optimalValue, setOptimalValue] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [showCode, setShowCode] = useState(false);
  const autoRunRef = useRef(null);

  // Initialize the tree on mount
  useEffect(() => {
    const gameTree = createGameTree();
    const treePositions = calculateTreeLayout(gameTree);
    setTree(gameTree);
    setPositions(treePositions);
    
    const alphaBetaSolver = new AlphaBetaSolver(gameTree);
    setSolver(alphaBetaSolver);
  }, []);

  const handleNextStep = () => {
    if (!solver || isComplete) return;

    const result = solver.step();
    
    // Update tree to trigger re-render
    setTree({ ...tree });
    
    setEvaluationLog(result.log);
    setPrunedNodes(result.prunedNodes || []);
    setEvaluatedLeaves(result.evaluatedLeaves || []);
    
    if (result.optimalValue !== null && result.optimalValue !== undefined) {
      setOptimalValue(result.optimalValue);
    }

    if (result.done) {
      setIsComplete(true);
      setIsRunning(false);
      if (autoRunRef.current) {
        clearTimeout(autoRunRef.current);
      }
    }
  };

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

  useEffect(() => {
    // Update timeout if speed changes while running
    if (isRunning && autoRunRef.current) {
      clearTimeout(autoRunRef.current);
      runNextStep();
    }
  }, [animationSpeed]);

  const handleReset = () => {
    if (autoRunRef.current) {
      clearTimeout(autoRunRef.current);
    }
    
    // Create a fresh tree and solver
    const gameTree = createGameTree();
    const treePositions = calculateTreeLayout(gameTree);
    setTree(gameTree);
    setPositions(treePositions);
    
    const alphaBetaSolver = new AlphaBetaSolver(gameTree);
    setSolver(alphaBetaSolver);
    
    setSelectedNode(null);
    setEvaluationLog([]);
    setPrunedNodes([]);
    setEvaluatedLeaves([]);
    setOptimalValue(null);
    setIsRunning(false);
    setIsComplete(false);
    setIsSolving(false);
  };

  const handleSolveAll = () => {
    if (!solver || isComplete) return;

    if (autoRunRef.current) {
      clearTimeout(autoRunRef.current);
    }
    setIsRunning(false);
    setIsSolving(true);

    setTimeout(() => {
      try {
        const result = solver.solve();
        
        setTree({ ...tree });
        setEvaluationLog(result.evaluationLog);
        setPrunedNodes(result.prunedNodes);
        setEvaluatedLeaves(result.evaluatedLeaves);
        setOptimalValue(result.optimalValue);
        setIsComplete(true);
      } catch (error) {
        console.error('Error solving:', error);
        alert('Failed to complete solution');
      } finally {
        setIsSolving(false);
      }
    }, 100);
  };

  const handleSpeedChange = (speed) => {
    setAnimationSpeed(speed);
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <Link
          to="/"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-4 transition-colors"
        >
          ← Back to Home
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Alpha-Beta Pruning Visualizer
            </h1>
            <p className="text-gray-400">
              Optimize game tree search by pruning branches that cannot affect the final decision
            </p>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold 
              hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            {showCode ? '📊 View Visualizer' : '💻 View Code'}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Controls */}
            <AlphaBetaControls
              onNextStep={handleNextStep}
              onAutoRun={handleAutoRun}
              onReset={handleReset}
              onSolveAll={handleSolveAll}
              isRunning={isRunning}
              isComplete={isComplete}
              isSolving={isSolving}
              animationSpeed={animationSpeed}
              onSpeedChange={handleSpeedChange}
            />

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Tree Visualization - Takes up 3 columns */}
              <div className="lg:col-span-3">
                <TreeCanvas
                  root={tree}
                  positions={positions}
                  onNodeClick={handleNodeClick}
                />
              </div>

              {/* Node Details Panel */}
              <div className="lg:col-span-1">
                <NodeDetailsPanel
                  selectedNode={selectedNode}
                  optimalValue={optimalValue}
                  prunedNodes={prunedNodes}
                  evaluatedLeaves={evaluatedLeaves}
                  totalNodes={31}
                  isComplete={isComplete}
                />
              </div>
            </div>

            {/* Evaluation Log */}
            <PruningLog logs={evaluationLog} maxHeight={400} />

            {/* Final Result Summary */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-900/40 to-cyan-900/40 rounded-lg shadow-xl p-6 border border-green-700/50"
              >
                <h3 className="text-2xl font-bold mb-4 text-green-400">🎉 Solution Complete!</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-700/30">
                    <p className="text-sm text-gray-400 mb-1">Optimal Value (MAX)</p>
                    <p className="text-3xl font-bold text-cyan-400">{optimalValue}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-green-700/30">
                    <p className="text-sm text-gray-400 mb-1">Evaluated Leaves</p>
                    <p className="text-3xl font-bold text-green-400">{evaluatedLeaves.length} / 16</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Saved {16 - evaluatedLeaves.length} evaluations
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-red-700/30">
                    <p className="text-sm text-gray-400 mb-1">Pruned Nodes</p>
                    <p className="text-3xl font-bold text-red-400">{prunedNodes.length}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((prunedNodes.length / 31) * 100).toFixed(1)}% reduction
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

        {/* Learning Points */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700"
        >
          <h3 className="text-lg font-bold mb-4 text-cyan-400">💡 Key Concepts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-400">MAX Nodes (α)</h4>
              <p className="text-gray-300">
                <strong>MAX</strong> nodes maintain <strong>alpha (α)</strong> - the best value MAX can guarantee.
                Initialized to <code className="text-orange-400">-∞</code>. Updated as MAX finds better options.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-400">MIN Nodes (β)</h4>
              <p className="text-gray-300">
                <strong>MIN</strong> nodes maintain <strong>beta (β)</strong> - the best value MIN can guarantee.
                Initialized to <code className="text-cyan-400">+∞</code>. Updated as MIN finds better options.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-400">Pruning Condition</h4>
              <p className="text-gray-300">
                When <code className="text-orange-400">α ≥ β</code>, we can prune the remaining branches 
                because they won't affect the final decision.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-cyan-400">Efficiency</h4>
              <p className="text-gray-300">
                Alpha-Beta pruning can reduce the number of nodes evaluated from <code>O(b^d)</code> to 
                <code>O(b^(d/2))</code> in the best case.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <CodeViewer 
        isOpen={showCode} 
        onClose={() => setShowCode(false)} 
        pyCode={pythonCode}
        cppCode={cppCode}
        javaCode={javaCode}
        baseName="alphabeta" 
      />
    </div>
  );
}
