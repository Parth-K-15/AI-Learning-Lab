import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CodeViewer from '../components/CodeViewer';

// Check if position is safe for queen placement
function isSafe(board, row, col, n) {
  // Check column
  for (let i = 0; i < row; i++) {
    if (board[i][col]) return false;
  }
  
  // Check upper-left diagonal
  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j]) return false;
  }
  
  // Check upper-right diagonal
  for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
    if (board[i][j]) return false;
  }
  
  return true;
}

// Get all attacking positions for a queen at (row, col)
function getAttackingPositions(row, col, n) {
  const attacking = new Set();
  
  // Column
  for (let i = 0; i < n; i++) {
    if (i !== row) attacking.add(`${i},${col}`);
  }
  
  // Diagonals
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== row || j !== col) {
        if (Math.abs(i - row) === Math.abs(j - col)) {
          attacking.add(`${i},${j}`);
        }
      }
    }
  }
  
  return attacking;
}

export default function NQueens() {
  const [n, setN] = useState(4);
  const [board, setBoard] = useState([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [log, setLog] = useState([]);
  const [backtracks, setBacktracks] = useState(0);
  const [recursionDepth, setRecursionDepth] = useState(0);
  const [isSolving, setIsSolving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [conflicts, setConflicts] = useState(new Set());
  const [showCode, setShowCode] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);
  const [trialCell, setTrialCell] = useState(null); // `${row},${col}` or null
  const [trialConflict, setTrialConflict] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const solverRef = useRef(null);
  const stepRef = useRef({ canProceed: false });
  const pausedRef = useRef(false);
  const stepModeRef = useRef(false);
  const speedRef = useRef(800);
  const stepEngineRef = useRef(null); // step-mode explicit engine
  const stepSnapshotsRef = useRef([]); // history of snapshots for Back

  // Helpers for step engine
  const cloneBoard = (b) => b.map((r) => [...r]);
  const cloneEngine = (eng) => {
    if (!eng) return null;
    return {
      status: eng.status,
      phase: eng.phase,
      stack: eng.stack.map(f => ({
        row: f.row,
        colIndex: f.colIndex,
        prevPlacement: f.prevPlacement ? { ...f.prevPlacement } : undefined,
        board: cloneBoard(f.board),
      })),
    };
  };
  const captureSnapshot = () => ({
    board: cloneBoard(board),
    log: [...log],
    currentRow,
    recursionDepth,
    backtracks,
    trialCell,
    trialConflict,
    isSolved,
    engine: cloneEngine(stepEngineRef.current),
  });
  const applySnapshot = (snap) => {
    setBoard(cloneBoard(snap.board));
    setLog([...snap.log]);
    setCurrentRow(snap.currentRow);
    setRecursionDepth(snap.recursionDepth);
    setBacktracks(snap.backtracks);
    setTrialCell(snap.trialCell);
    setTrialConflict(snap.trialConflict);
    setIsSolved(snap.isSolved);
    stepEngineRef.current = cloneEngine(snap.engine);
  };

  const initializeBoard = (size) => {
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(false));
    setBoard(newBoard);
    setCurrentRow(0);
    setLog([`Initialized ${size}×${size} board`]);
    setBacktracks(0);
    setRecursionDepth(0);
    setIsSolved(false);
    setConflicts(new Set());
    setIsStepMode(false);
    stepRef.current.canProceed = false;
    setTrialCell(null);
    setTrialConflict(false);
    setShowSuccessModal(false);
  };

  useEffect(() => {
    initializeBoard(n);
  }, [n]);

  // Keep refs in sync with state for use inside async solver
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    stepModeRef.current = isStepMode;
  }, [isStepMode]);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const waitForStep = async (shouldContinue) => {
    if (stepModeRef.current) {
      stepRef.current.canProceed = false;
      // Wait until user clicks "Next Step" or stops step mode
      while (!stepRef.current.canProceed && shouldContinue.current && stepModeRef.current) {
        await delay(100);
      }
      return shouldContinue.current;
    }
    return true;
  };

  const solveNQueensBacktracking = async (boardState, row, shouldContinue) => {
    if (!shouldContinue.current) return false;
    
    // Handle pause
    while (pausedRef.current && shouldContinue.current) {
      await delay(100);
    }
    if (!shouldContinue.current) return false;
    
    setRecursionDepth(row + 1);
    setCurrentRow(row);

    if (row === n) {
      setLog(prev => [...prev, `✅ Solution found!`]);
      setIsSolved(true);
      setShowSuccessModal(true);
      return true;
    }

    for (let col = 0; col < n; col++) {
      if (!shouldContinue.current) return false;
      
      // Handle pause
      while (pausedRef.current && shouldContinue.current) {
        await delay(100);
      }
      if (!shouldContinue.current) return false;

      setLog(prev => [...prev, `Trying position (Row ${row + 1}, Col ${col + 1})`]);
      // Show dummy queen at trial cell
      setTrialCell(`${row},${col}`);
      setTrialConflict(false);
      
      // Wait for step if in step mode
      if (!(await waitForStep(shouldContinue))) return false;
      
      if (isSafe(boardState, row, col, n)) {
        // Place queen
        const newBoard = boardState.map(r => [...r]);
        newBoard[row][col] = true;
        setBoard(newBoard);
        setConflicts(new Set());
        // Clear trial marker on successful placement
        setTrialCell(null);
        setTrialConflict(false);
        setLog(prev => [...prev, `👑 Placed queen at (Row ${row + 1}, Col ${col + 1})`]);
        
  if (!stepModeRef.current) await delay(speedRef.current);
        if (!(await waitForStep(shouldContinue))) return false;

        // Recurse
        if (await solveNQueensBacktracking(newBoard, row + 1, shouldContinue)) {
          return true;
        }

        // Backtrack
        setBacktracks(prev => prev + 1);
        setLog(prev => [...prev, `🔙 Backtracking from (Row ${row + 1}, Col ${col + 1})`]);
        newBoard[row][col] = false;
        setBoard(newBoard);
        
        if (!stepModeRef.current) await delay(speedRef.current);
        if (!(await waitForStep(shouldContinue))) return false;
      } else {
        // Show conflicts
        // Only mark the trial cell in red, don't highlight other cells
        setTrialConflict(true);
        setLog(prev => [...prev, `❌ Conflict at (Row ${row + 1}, Col ${col + 1})`]);
        
        if (!stepModeRef.current) await delay(speedRef.current / 2);
        if (!(await waitForStep(shouldContinue))) return false;
        // Clear trial marker after showing conflict
        setTrialCell(null);
        setTrialConflict(false);
      }
    }

    return false;
  };

  const handleStart = async () => {
    initializeBoard(n);
    setIsSolving(true);
    setIsPaused(false);
    setIsStepMode(false);
    stepRef.current.canProceed = false;
    pausedRef.current = false;
    stepModeRef.current = false;
    
    const shouldContinue = { current: true };
    solverRef.current = shouldContinue;
    
    const initialBoard = Array(n).fill(null).map(() => Array(n).fill(false));
    await solveNQueensBacktracking(initialBoard, 0, shouldContinue);
    setIsSolving(false);
  };

  const handlePause = () => {
    setIsPaused(prev => {
      const next = !prev;
      pausedRef.current = next;
      setLog(p => [...p, next ? '⏸️ Paused' : '▶️ Resumed']);
      return next;
    });
  };

  // Start Step Mode with explicit engine (no async recursion)
  const handleStepMode = () => {
    if (!isSolving) {
      initializeBoard(n);
      const empty = Array(n).fill(null).map(() => Array(n).fill(false));
      setBoard(empty);
      setIsStepMode(true);
      setIsSolving(true);
      setIsPaused(false);
      stepModeRef.current = true;
      pausedRef.current = false;

      // Initialize engine
      stepEngineRef.current = {
        status: 'running',
        phase: 'prepareTry',
        stack: [{ row: 0, colIndex: 0, board: cloneBoard(empty) }],
      };
  setCurrentRow(0);
  setRecursionDepth(0);

      // Initialize snapshots with the starting state
      stepSnapshotsRef.current = [];
      stepSnapshotsRef.current.push({
        board: cloneBoard(empty),
        log: [`Initialized ${n}×${n} board`],
        currentRow: 0,
        recursionDepth: 0,
        backtracks: 0,
        trialCell: null,
        trialConflict: false,
        isSolved: false,
        engine: cloneEngine(stepEngineRef.current),
      });
      // Apply that snapshot to sync state
      applySnapshot(stepSnapshotsRef.current[0]);
    }
  };

  const handleNextStep = () => {
    if (!isSolving) return;
    if (isStepMode) {
      stepEngineAdvance();
    } else {
      stepRef.current.canProceed = true;
    }
  };

  const handlePrevStep = () => {
    if (!isSolving || !isStepMode) return;
    if (stepSnapshotsRef.current.length <= 1) return; // keep at least initial
    // Remove current snapshot and revert to previous
    stepSnapshotsRef.current.pop();
    const prev = stepSnapshotsRef.current[stepSnapshotsRef.current.length - 1];
    applySnapshot(prev);
  };

  const stepEngineAdvance = () => {
    const eng = stepEngineRef.current;
    if (!eng || eng.status !== 'running') return;
    const stack = eng.stack;
    if (stack.length === 0) return;
    const top = stack[stack.length - 1];

    let newBoard = cloneBoard(top.board);
    let newLog = [...log];
    let newBacktracks = backtracks;
    let newTrialCell = trialCell;
    let newTrialConflict = trialConflict;
    let newIsSolved = isSolved;
    let newCurrentRow = top.row; // 0-based
    let newRecDepth = stack.length; // depth approximation

    // If solution reached
    if (top.row === n) {
      if (!newIsSolved) {
        newLog = [...newLog, `✅ Solution found!`];
      }
      newIsSolved = true;
      eng.status = 'solved';
      setShowSuccessModal(true);
      // snapshot and apply
      const snap = {
        board: cloneBoard(newBoard),
        log: newLog,
        currentRow: newCurrentRow,
        recursionDepth: newRecDepth,
        backtracks: newBacktracks,
        trialCell: null,
        trialConflict: false,
        isSolved: newIsSolved,
        engine: cloneEngine(eng),
      };
      stepSnapshotsRef.current.push(snap);
      applySnapshot(snap);
      return;
    }

    // Manage phases
    if (eng.phase === 'prepareTry') {
      // Log trying and show ghost queen
      if (top.colIndex < n) {
        newLog = [...newLog, `Trying position (Row ${top.row + 1}, Col ${top.colIndex + 1})`];
        newTrialCell = `${top.row},${top.colIndex}`;
        newTrialConflict = false;
        eng.phase = 'resolveTry';
      } else {
        // Exhausted columns at this row -> backtrack
        if (stack.length === 1) {
          newLog = [...newLog, `No solution found`];
          eng.status = 'solved';
        } else {
          const popped = stack.pop();
          const parent = stack[stack.length - 1];
          newBoard = cloneBoard(parent.board);
          newBacktracks = backtracks + 1;
          if (popped.prevPlacement) {
            newLog = [...newLog, `🔙 Backtracking from (Row ${popped.prevPlacement.row + 1}, Col ${popped.prevPlacement.col + 1})`];
            // Next try next column at parent
            parent.colIndex = popped.prevPlacement.col + 1;
          }
          eng.phase = 'prepareTry';
          newTrialCell = null;
          newTrialConflict = false;
          newCurrentRow = parent.row;
          newRecDepth = stack.length;
        }
      }
    } else if (eng.phase === 'resolveTry') {
      // Decide safe vs conflict for current trial
      const r = top.row;
      const c = top.colIndex;
      const safe = isSafe(newBoard, r, c, n);
      if (safe) {
        // Place queen
        const placedBoard = cloneBoard(newBoard);
        placedBoard[r][c] = true;
        newBoard = placedBoard;
        newLog = [...newLog, `👑 Placed queen at (Row ${r + 1}, Col ${c + 1})`];
        newTrialCell = null;
        newTrialConflict = false;

        // Push next row frame
        const child = { row: r + 1, colIndex: 0, board: cloneBoard(placedBoard), prevPlacement: { row: r, col: c } };
        stack.push(child);
        eng.phase = 'prepareTry';
        newCurrentRow = r + 1;
        newRecDepth = stack.length;
      } else {
        // Conflict on trial cell
        newLog = [...newLog, `❌ Conflict at (Row ${r + 1}, Col ${c + 1})`];
        newTrialConflict = true;
        eng.phase = 'postConflict';
      }
    } else if (eng.phase === 'postConflict') {
      // Clear conflict marker and advance to next column
      newTrialCell = null;
      newTrialConflict = false;
      top.colIndex += 1;
      eng.phase = 'prepareTry';
    }

    // snapshot and apply
    const snap = {
      board: cloneBoard(newBoard),
      log: newLog,
      currentRow: newCurrentRow,
      recursionDepth: newRecDepth,
      backtracks: newBacktracks,
      trialCell: newTrialCell,
      trialConflict: newTrialConflict,
      isSolved: newIsSolved,
      engine: cloneEngine(eng),
    };
    stepSnapshotsRef.current.push(snap);
    applySnapshot(snap);
  };

  const handleReset = () => {
    if (solverRef.current) {
      solverRef.current.current = false;
    }
    setIsSolving(false);
    setIsPaused(false);
    setIsStepMode(false);
    stepRef.current.canProceed = false;
    pausedRef.current = false;
    stepModeRef.current = false;
    stepEngineRef.current = null;
    stepSnapshotsRef.current = [];
    setShowSuccessModal(false);
    initializeBoard(n);
  };

  const pythonCode = `# N-Queens Problem Solver - Python
def is_safe(board, row, col, n):
    """Check if placing queen at (row, col) is safe"""
    # Check column
    for i in range(row):
        if board[i][col]:
            return False
    
    # Check upper-left diagonal
    i, j = row - 1, col - 1
    while i >= 0 and j >= 0:
        if board[i][j]:
            return False
        i -= 1
        j -= 1
    
    # Check upper-right diagonal
    i, j = row - 1, col + 1
    while i >= 0 and j < n:
        if board[i][j]:
            return False
        i -= 1
        j += 1
    
    return True

def solve_n_queens(board, row, n):
    """Solve N-Queens using backtracking"""
    if row == n:
        return True
    
    for col in range(n):
        if is_safe(board, row, col, n):
            board[row][col] = True
            print(f"Placed queen at ({row}, {col})")
            
            if solve_n_queens(board, row + 1, n):
                return True
            
            # Backtrack
            board[row][col] = False
            print(f"Backtracking from ({row}, {col})")
    
    return False

def print_board(board, n):
    """Print the board"""
    for row in board:
        print(" ".join("Q" if cell else "." for cell in row))
    print()

# Main execution
n = 4  # Board size
board = [[False] * n for _ in range(n)]

print(f"Solving {n}-Queens problem...\\n")

if solve_n_queens(board, 0, n):
    print("\\nSolution found:")
    print_board(board, n)
else:
    print("No solution exists")
`;

  const cppCode = `// N-Queens Problem Solver - C++
#include <iostream>
#include <vector>
using namespace std;

bool isSafe(vector<vector<bool>>& board, int row, int col, int n) {
    // Check column
    for (int i = 0; i < row; i++) {
        if (board[i][col]) return false;
    }
    
    // Check upper-left diagonal
    for (int i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
        if (board[i][j]) return false;
    }
    
    // Check upper-right diagonal
    for (int i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
        if (board[i][j]) return false;
    }
    
    return true;
}

bool solveNQueens(vector<vector<bool>>& board, int row, int n) {
    if (row == n) {
        return true;
    }
    
    for (int col = 0; col < n; col++) {
        if (isSafe(board, row, col, n)) {
            board[row][col] = true;
            cout << "Placed queen at (" << row << ", " << col << ")\\n";
            
            if (solveNQueens(board, row + 1, n)) {
                return true;
            }
            
            // Backtrack
            board[row][col] = false;
            cout << "Backtracking from (" << row << ", " << col << ")\\n";
        }
    }
    
    return false;
}

void printBoard(vector<vector<bool>>& board, int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            cout << (board[i][j] ? "Q " : ". ");
        }
        cout << "\\n";
    }
    cout << "\\n";
}

int main() {
    int n = 4;  // Board size
    vector<vector<bool>> board(n, vector<bool>(n, false));
    
    cout << "Solving " << n << "-Queens problem...\\n\\n";
    
    if (solveNQueens(board, 0, n)) {
        cout << "\\nSolution found:\\n";
        printBoard(board, n);
    } else {
        cout << "No solution exists\\n";
    }
    
    return 0;
}
`;

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
            ♛ N-Queens Visual Solver
          </h1>
          <p className="text-xl text-gray-300 drop-shadow">
            Interactive Visualization of Backtracking Algorithm
          </p>
          <div className="mt-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 inline-block border border-slate-700">
            <p className="text-gray-200 text-sm">
              <strong>Goal:</strong> Place N queens on an N×N board so no two queens attack each other
            </p>
            <p className="text-gray-200 text-sm mt-1">
              <strong>Rule:</strong> Queens cannot share the same row, column, or diagonal
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-3 text-gray-200">🎯 Solver Mode</h3>
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleStart}
              disabled={isSolving}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                !isStepMode && isSolving
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:opacity-50'
              }`}
            >
              🤖 Auto Solver
            </button>
            <button
              onClick={handleStepMode}
              disabled={isSolving}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                isStepMode && isSolving
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:opacity-50'
              }`}
            >
              👣 Step-by-Step Mode
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-gray-300 font-semibold text-sm">Board Size:</label>
              <select 
                value={n} 
                onChange={(e) => setN(Number(e.target.value))}
                disabled={isSolving}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg border border-slate-700 disabled:opacity-50"
              >
                <option value={3}>3×3</option>
                <option value={4}>4×4</option>
                <option value={5}>5×5</option>
                <option value={6}>6×6</option>
                <option value={8}>8×8</option>
              </select>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-400">
                Backtracks: <strong className="text-orange-400 text-lg">{backtracks}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-6 border border-slate-700">
          <div className="flex items-center gap-3 flex-wrap">
            {isStepMode ? (
              <>
                <button 
                  onClick={handlePrevStep}
                  disabled={!isSolving || isSolved || (stepSnapshotsRef.current?.length ?? 0) <= 1}
                  className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-500 transition-colors disabled:opacity-50"
                >
                  ⏮️ Back
                </button>
                <button 
                  onClick={handleNextStep}
                  disabled={!isSolving || isSolved}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  ⏭️ Next Step
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handlePause}
                  disabled={!isSolving || isSolved}
                  className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition-colors disabled:opacity-50"
                >
                  {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                </button>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-300">Speed:</label>
                  <input 
                    type="range" 
                    min={200} 
                    max={2000} 
                    step={100} 
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-gray-400 text-sm w-16">{speed}ms</span>
                </div>
              </>
            )}
            
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              🔁 Reset
            </button>

            <button 
              onClick={() => setShowCode(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors ml-auto"
            >
              💻 View Code
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Board and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chessboard */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold mb-4 text-gray-200">
                {isSolved ? '✅ Solution Found!' : '🎯 Chessboard'}
              </h3>
              <div className="flex justify-center">
                <div 
                  className="inline-grid gap-1 p-4 bg-slate-900 rounded-lg border-2 border-slate-700"
                  style={{ 
                    gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
                  }}
                >
                  {board.map((row, i) => 
                    row.map((cell, j) => {
                      const key = `${i},${j}`;
                      const isLight = (i + j) % 2 === 0;
                      const isTrial = trialCell === key;
                      const showRedRing = isTrial && trialConflict;
                      const showGreenRing = isSolved && cell;
                      
                      return (
                        <motion.div
                          key={key}
                          className={`
                            ${n <= 4 ? 'w-20 h-20' : n <= 6 ? 'w-16 h-16' : 'w-12 h-12'}
                            flex items-center justify-center text-3xl font-bold
                            ${isLight ? 'bg-amber-100' : 'bg-amber-800'}
                            ${showRedRing ? 'ring-4 ring-red-500' : ''}
                            ${showGreenRing ? 'ring-4 ring-green-500' : ''}
                          `}
                          animate={{
                            scale: cell ? [1, 1.2, 1] : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {cell ? (
                            <span className={isSolved ? 'text-green-600' : 'text-gray-800'}>♛</span>
                          ) : isTrial ? (
                            <span className={`text-gray-700 opacity-60 ${n <= 4 ? 'text-3xl' : 'text-2xl'}`}>♛</span>
                          ) : null}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4 text-gray-200">📊 Algorithm Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-1">Current Row</div>
                  <div className="text-cyan-400 font-bold text-2xl">{currentRow + 1}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-1">Depth</div>
                  <div className="text-purple-400 font-bold text-2xl">{recursionDepth}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-1">Backtracks</div>
                  <div className="text-orange-400 font-bold text-2xl">{backtracks}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="text-gray-400 text-sm mb-1">Board Size</div>
                  <div className="text-emerald-400 font-bold text-2xl">{n}×{n}</div>
                </div>
              </div>
              {isStepMode && (
                <div className="mt-4 p-3 bg-teal-900/30 border border-teal-600 rounded-lg">
                  <div className="text-teal-400 font-bold text-center">
                    👣 Step-by-Step Mode Active
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Algorithm Trace */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-3 text-gray-200">🔍 Algorithm Trace</h3>
              <div className="max-h-96 overflow-auto bg-slate-900 rounded p-3 border border-slate-700">
                {log.length === 0 ? (
                  <div className="text-gray-400 text-sm text-center py-8">
                    Select a solver mode to begin
                  </div>
                ) : (
                  <ul className="text-xs font-mono text-gray-300 space-y-1">
                    {log.slice(-20).map((entry, idx) => (
                      <li key={idx} className={
                        entry.includes('✅') ? 'text-green-400' :
                        entry.includes('❌') ? 'text-red-400' :
                        entry.includes('🔙') ? 'text-orange-400' :
                        entry.includes('👑') ? 'text-cyan-400' :
                        'text-gray-300'
                      }>
                        [{Math.max(0, log.length - 20) + idx + 1}] {entry}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border-2 border-green-500 rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="text-center">
                <div className="text-6xl mb-4">�</div>
                <h2 className="text-3xl font-bold text-green-400 mb-4">
                  Solution Found!
                </h2>
                <p className="text-lg text-gray-300 mb-2">
                  All {n} queens have been placed successfully!
                </p>
                <p className="text-gray-400 mb-6">
                  Total backtracks: <strong className="text-orange-400">{backtracks}</strong>
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                  >
                    📊 View Stats & Trace
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    🔁 Try Again
                  </button>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      setShowCode(true);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    💻 View Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Built with React, Tailwind CSS, and Framer Motion</p>
          <p className="mt-1">Backtracking Algorithm Educational Visualizer © 2025</p>
        </div>
      </div>

      <CodeViewer 
        isOpen={showCode} 
        onClose={() => setShowCode(false)} 
        pyCode={pythonCode} 
        cppCode={cppCode} 
        baseName="n_queens_solver" 
      />
    </div>
  );
}
