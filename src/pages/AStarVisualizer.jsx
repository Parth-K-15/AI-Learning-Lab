import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Graph, GraphNode, createSampleGraph, createSampleGrid } from '../astar/graph';
import { AStarSearch } from '../astar/solver';
import GraphCanvas from '../components/astar/GraphCanvas';
import OpenListPanel from '../components/astar/OpenListPanel';
import ClosedListPanel from '../components/astar/ClosedListPanel';
import NodeDetailsPanel from '../components/astar/NodeDetailsPanel';
import AStarControls from '../components/astar/AStarControls';
import CodeViewer from '../components/CodeViewer';
import cppCode from '../code/astar.cpp?raw';
import javaCode from '../code/astar.java?raw';
import pyCode from '../code/astar.py?raw';

// Simple component to display A* code
function AStarCodeViewer() {
  const [selectedLang, setSelectedLang] = useState('python');
  const [copySuccess, setCopySuccess] = useState('');

  const codeFiles = {
    python: {
      name: 'astar.py',
      code: pyCode
    },
    cpp: {
      name: 'astar.cpp',
      code: cppCode
    },
    java: {
      name: 'astar.java',
      code: javaCode
    }
  };

  const currentFile = codeFiles[selectedLang];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentFile.code);
      setCopySuccess('✓ Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Language Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedLang('python')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedLang === 'python'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          🐍 Python
        </button>
        <button
          onClick={() => setSelectedLang('cpp')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedLang === 'cpp'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          ⚙️ C++
        </button>
        <button
          onClick={() => setSelectedLang('java')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedLang === 'java'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
          }`}
        >
          ☕ Java
        </button>
      </div>

      {/* Code Display */}
      <div className="bg-slate-950 rounded-lg p-4 border border-slate-700">
        <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
          <code>{currentFile.code}</code>
        </pre>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          {copySuccess || '📋 Copy Code'}
        </button>
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          ⬇️ Download {currentFile.name}
        </button>
      </div>
    </div>
  );
}

export default function AStarVisualizer() {
  // Graph state
  const [graph, setGraph] = useState(new Graph());
  const [mode, setMode] = useState('select'); // 'select', 'add-node', 'add-edge', 'edit-heuristic'
  const [selectedForEdge, setSelectedForEdge] = useState(null);
  const [startNode, setStartNode] = useState(null);
  const [goalNode, setGoalNode] = useState(null);
  const [nextNodeId, setNextNodeId] = useState(1);

  // Search state
  const [solver, setSolver] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [openList, setOpenList] = useState([]);
  const [closedList, setClosedList] = useState([]);
  const [path, setPath] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [operationHistory, setOperationHistory] = useState([]);
  const [showCode, setShowCode] = useState(false);
  const autoRunRef = useRef(null);

  const handleAddNode = (x, y) => {
    const nodeId = `N${nextNodeId}`;
    const heuristic = parseFloat(prompt('Enter heuristic value for this node:', '0') || '0');
    const node = new GraphNode(nodeId, x, y, nodeId, heuristic);
    
    const newGraph = new Graph();
    graph.getAllNodes().forEach(n => newGraph.addNode(n));
    graph.getAllEdges().forEach(e => {
      const existing = newGraph.getAllEdges().find(
        edge => edge.from === e.from && edge.to === e.to
      );
      if (!existing) {
        newGraph.addEdge(e.from, e.to, e.weight, false);
      }
    });
    newGraph.addNode(node);
    
    setGraph(newGraph);
    setNextNodeId(nextNodeId + 1);
  };

  const handleSelectNode = (nodeId) => {
    if (mode === 'select') {
      if (!startNode) {
        setStartNode(nodeId);
      } else if (!goalNode && nodeId !== startNode) {
        setGoalNode(nodeId);
      } else if (nodeId === startNode) {
        setStartNode(null);
      } else if (nodeId === goalNode) {
        setGoalNode(null);
      }
    } else if (mode === 'edit-heuristic') {
      const node = graph.getNode(nodeId);
      const currentH = node?.heuristic || 0;
      const newHeuristic = parseFloat(prompt(`Enter heuristic value for node ${node?.label}:`, currentH.toString()) || currentH.toString());
      
      const newGraph = new Graph();
      graph.getAllNodes().forEach(n => newGraph.addNode(n));
      graph.getAllEdges().forEach(e => {
        const existing = newGraph.getAllEdges().find(
          edge => edge.from === e.from && edge.to === e.to
        );
        if (!existing) {
          newGraph.addEdge(e.from, e.to, e.weight, false);
        }
      });
      newGraph.updateNodeHeuristic(nodeId, newHeuristic);
      setGraph(newGraph);
    } else if (mode === 'add-edge') {
      if (!selectedForEdge) {
        setSelectedForEdge(nodeId);
      } else if (selectedForEdge !== nodeId) {
        // Add edge
        const weight = parseFloat(prompt('Enter edge weight:', '1') || '1');
        const newGraph = new Graph();
        graph.getAllNodes().forEach(n => newGraph.addNode(n));
        graph.getAllEdges().forEach(e => {
          const existing = newGraph.getAllEdges().find(
            edge => edge.from === e.from && edge.to === e.to
          );
          if (!existing) {
            newGraph.addEdge(e.from, e.to, e.weight, false);
          }
        });
        newGraph.addEdge(selectedForEdge, nodeId, weight, false);
        setGraph(newGraph);
        setSelectedForEdge(null);
      } else {
        setSelectedForEdge(null);
      }
    }
  };

  const handleLoadSampleGraph = (type) => {
    let sampleGraph;
    if (type === 'simple') {
      sampleGraph = createSampleGraph();
      setStartNode('A');
      setGoalNode('G');
    } else if (type === 'grid') {
      sampleGraph = createSampleGrid();
      setStartNode('0-0');
      setGoalNode('3-3');
    }
    setGraph(sampleGraph);
    setNextNodeId(100);
    handleReset();
  };

  const handleStartSearch = () => {
    if (!startNode || !goalNode) {
      alert('Please select both start and goal nodes');
      return;
    }

    const newSolver = new AStarSearch(graph, startNode, goalNode);
    setSolver(newSolver);
    setCurrentNode(null);
    setOpenList(newSolver.getOpenListSnapshot());
    setClosedList([]);
    setPath([]);
    setOperationHistory([]);
    setIsComplete(false);
  };

  const handleNextStep = () => {
    if (!solver || isComplete) return;

    const result = solver.step();
    
    setCurrentNode(result.currentNode);
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
      if (result.path) {
        setPath(result.path);
      }
    }
  };

  const handleAutoRun = () => {
    if (!solver) {
      handleStartSearch();
      setTimeout(() => {
        setIsRunning(true);
        setIsPaused(false);
      }, 100);
      return;
    }

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

  const handleFindPath = () => {
    if (!startNode || !goalNode) {
      alert('Please select both start and goal nodes');
      return;
    }

    if (autoRunRef.current) {
      clearTimeout(autoRunRef.current);
    }
    setIsRunning(false);
    setIsPaused(false);
    setIsSolving(true);

    setTimeout(() => {
      try {
        const newSolver = new AStarSearch(graph, startNode, goalNode);
        const result = newSolver.solve();

        if (result.success) {
          setSolver(newSolver);
          setCurrentNode(goalNode);
          setOpenList(newSolver.getOpenListSnapshot());
          setClosedList(Array.from(newSolver.closedList));
          setPath(result.path);
          setIsComplete(true);

          const newHistory = result.stepLog.map((log, idx) => ({
            step: idx + 1,
            ...log,
            timestamp: new Date().toLocaleTimeString()
          }));
          setOperationHistory(newHistory);
        } else {
          alert('No path found between start and goal');
        }
      } catch (error) {
        console.error('Error finding path:', error);
        alert('Failed to find path. The graph might be disconnected.');
      } finally {
        setIsSolving(false);
      }
    }, 50);
  };

  const handleReset = () => {
    if (autoRunRef.current) {
      clearTimeout(autoRunRef.current);
    }
    setSolver(null);
    setCurrentNode(null);
    setOpenList([]);
    setClosedList([]);
    setPath([]);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
    setOperationHistory([]);
  };

  const handleClearGraph = () => {
    setGraph(new Graph());
    setStartNode(null);
    setGoalNode(null);
    setNextNodeId(1);
    handleReset();
  };

  const canRunSearch = startNode && goalNode && graph.getAllNodes().length > 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold mb-4"
            >
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-100">
              🗺️ A* Search Algorithm Visualizer
            </h1>
            <p className="text-gray-400 mt-2">
              Create graphs and watch A* find the shortest path
            </p>
          </div>
          
          {/* Sample Graphs */}
          <div className="flex gap-2">
            <button
              onClick={() => handleLoadSampleGraph('simple')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Load Sample Graph
            </button>
            <button
              onClick={() => handleLoadSampleGraph('grid')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Load Grid
            </button>
            <button
              onClick={handleClearGraph}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Clear Graph
            </button>
            <button
              onClick={() => setShowCode(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <span>💻</span> View Code
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <AStarControls
            mode={mode}
            onModeChange={setMode}
            onNextStep={handleNextStep}
            onAutoRun={handleAutoRun}
            onReset={handleReset}
            onFindPath={handleFindPath}
            isRunning={isRunning}
            isComplete={isComplete}
            isSolving={isSolving}
            animationSpeed={animationSpeed}
            onSpeedChange={setAnimationSpeed}
            canRunSearch={canRunSearch}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Graph Canvas */}
          <div className="xl:col-span-2">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <GraphCanvas
                graph={graph}
                mode={mode}
                startNode={startNode}
                goalNode={goalNode}
                currentNode={currentNode}
                openList={openList}
                closedList={closedList}
                path={path}
                onAddNode={handleAddNode}
                onSelectNode={handleSelectNode}
                selectedForEdge={selectedForEdge}
              />
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="xl:col-span-1 space-y-6">
            <NodeDetailsPanel
              currentNode={currentNode}
              solver={solver}
              graph={graph}
              stats={solver?.getStats() || { nodesExpanded: 0, openListSize: 0, closedListSize: 0, pathFound: false }}
            />
          </div>
        </div>

        {/* Open and Closed Lists */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <OpenListPanel openList={openList} graph={graph} />
          <ClosedListPanel closedList={closedList} graph={graph} solver={solver} />
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
                        <div className="flex gap-4 text-xs text-gray-400 mt-2">
                          <span>Node: {graph.getNode(op.nodeId)?.label}</span>
                          <span>f: {op.f?.toFixed(2)}</span>
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

        {/* Instructions */}
        {graph.getAllNodes().length === 0 && (
          <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3">📖 Getting Started</h3>
            <div className="text-gray-300 space-y-2">
              <p>1. <strong>Load a sample graph</strong> or create your own by clicking "Add Node" mode and clicking on the canvas (you'll be prompted for heuristic value)</p>
              <p>2. Use <strong>"Add Edge"</strong> mode to connect nodes (click two nodes to create an edge)</p>
              <p>3. Use <strong>"Edit Heuristic"</strong> mode to set/modify heuristic values for nodes (yellow text below nodes)</p>
              <p>4. Switch to <strong>"Select Nodes"</strong> mode and click nodes to set Start (green) and Goal (red)</p>
              <p>5. Click <strong>"Auto Run"</strong> to watch A* find the shortest path, or <strong>"Next Step"</strong> for manual control</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Built with React, Tailwind CSS, and Framer Motion</p>
          <p className="mt-1">A* Graph Visualizer © 2025</p>
        </div>
      </div>

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
        {solver && !isComplete && !isRunning && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleNextStep}
            className="fixed bottom-6 right-24 sm:bottom-8 sm:right-32 w-16 h-16 sm:w-20 sm:h-20 text-white rounded-full shadow-2xl bg-gradient-to-br from-cyan-600 to-blue-600 hover:shadow-cyan-500/50 transition-all z-50 flex items-center justify-center"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Next Step"
          >
            <span className="text-3xl sm:text-4xl">⏭️</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {solver && !isComplete && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleReset}
            className="fixed bottom-6 right-44 sm:bottom-8 sm:right-56 w-16 h-16 sm:w-20 sm:h-20 text-white rounded-full shadow-2xl bg-gradient-to-br from-gray-600 to-gray-800 hover:shadow-gray-500/50 transition-all z-50 flex items-center justify-center"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            title="Reset"
          >
            <span className="text-3xl sm:text-4xl">🔄</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Code Viewer Modal */}
      <AnimatePresence>
        {showCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCode(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-100">💻 A* Algorithm Implementation</h2>
                <button
                  onClick={() => setShowCode(false)}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <AStarCodeViewer />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
