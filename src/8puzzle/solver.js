// A* Algorithm Implementation for 8-Puzzle

import { PuzzleState, manhattanDistance, misplacedTiles, isGoalState } from './puzzle';

class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(item, priority) {
    this.items.push({ item, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.items.shift()?.item;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  getAll() {
    return this.items.map(x => x.item);
  }
}

export class AStarSolver {
  constructor(initialBoard, goalBoard) {
    this.heuristicFunc = (board) => this.calculateMisplacedTiles(board, goalBoard);
    this.heuristicType = 'misplaced';
    this.goalBoard = goalBoard;
    
    const h = this.heuristicFunc(initialBoard);
    this.initialState = new PuzzleState(initialBoard, 0, h);
    
    this.openList = new PriorityQueue();
    this.closedList = [];
    this.openMap = new Map(); // string -> state
    
    this.openList.enqueue(this.initialState, this.initialState.f);
    this.openMap.set(this.initialState.toString(), this.initialState);
    
    this.currentState = null;
    this.solution = null;
    this.stepLog = [];
    this.completed = false;
    this.nodesExplored = 0;
  }

  // Calculate misplaced tiles against custom goal
  calculateMisplacedTiles(board, goal) {
    let count = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const value = board[r][c];
        if (value === 0) continue; // Skip blank
        if (value !== goal[r][c]) {
          count++;
        }
      }
    }
    return count;
  }

  // Single step of A* algorithm
  step() {
    if (this.completed || this.openList.isEmpty()) {
      return {
        done: true,
        message: this.completed ? 'Solution found!' : 'No solution exists',
        currentState: this.currentState,
        openList: this.getOpenListSnapshot(),
        closedList: [...this.closedList]
      };
    }

    // Get node with lowest f value
    this.currentState = this.openList.dequeue();
    this.openMap.delete(this.currentState.toString());
    this.nodesExplored++;

    const stepInfo = {
      step: this.nodesExplored,
      action: 'EXPAND',
      state: this.currentState,
      message: `Expanding state with f=${this.currentState.f} (g=${this.currentState.g}, h=${this.currentState.h})`,
      move: this.currentState.move,
      openSize: this.openList.size(),
      closedSize: this.closedList.length
    };

    // Check if goal
    if (this.isGoalState(this.currentState.board)) {
      this.completed = true;
      this.solution = this.reconstructPath(this.currentState);
      stepInfo.message = `🎉 Goal state reached! Solution has ${this.solution.length - 1} moves`;
      stepInfo.action = 'GOAL_FOUND';
      this.stepLog.push(stepInfo);
      
      return {
        done: true,
        message: stepInfo.message,
        currentState: this.currentState,
        openList: this.getOpenListSnapshot(),
        closedList: [...this.closedList],
        solution: this.solution
      };
    }

    // Add to closed list
    this.closedList.push(this.currentState);

    // Generate neighbors
    const neighbors = this.currentState.getNeighbors();
    let addedCount = 0;

    for (const neighbor of neighbors) {
      const neighborKey = new PuzzleState(neighbor.board).toString();
      
      // Skip if in closed list
      if (this.closedList.some(s => s.toString() === neighborKey)) {
        continue;
      }

      const newG = this.currentState.g + 1;
      const h = this.heuristicFunc(neighbor.board);
      const newState = new PuzzleState(neighbor.board, newG, h, this.currentState, neighbor.move);

      // Check if already in open list with better cost
      const existingState = this.openMap.get(neighborKey);
      if (existingState && existingState.g <= newG) {
        continue;
      }

      // Add or update in open list
      if (existingState) {
        this.openMap.delete(neighborKey);
      }
      
      this.openList.enqueue(newState, newState.f);
      this.openMap.set(neighborKey, newState);
      addedCount++;
    }

    stepInfo.neighborsAdded = addedCount;
    this.stepLog.push(stepInfo);

    return {
      done: false,
      message: stepInfo.message,
      currentState: this.currentState,
      openList: this.getOpenListSnapshot(),
      closedList: [...this.closedList],
      stepInfo
    };
  }

  // Reconstruct solution path
  reconstructPath(state) {
    const path = [];
    let current = state;
    
    while (current !== null) {
      path.unshift(current);
      current = current.parent;
    }
    
    return path;
  }

  // Get snapshot of open list for visualization
  getOpenListSnapshot() {
    return this.openList.getAll().slice(0, 10); // Top 10 for display
  }

  // Solve completely (for auto mode)
  solve() {
    while (!this.completed && !this.openList.isEmpty()) {
      this.step();
    }
    
    return {
      success: this.completed,
      solution: this.solution,
      nodesExplored: this.nodesExplored,
      stepLog: this.stepLog
    };
  }

  // Check if board matches goal
  isGoalState(board) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] !== this.goalBoard[r][c]) {
          return false;
        }
      }
    }
    return true;
  }

  // Get statistics
  getStats() {
    return {
      nodesExplored: this.nodesExplored,
      openListSize: this.openList.size(),
      closedListSize: this.closedList.length,
      heuristicType: this.heuristicType,
      completed: this.completed,
      solutionLength: this.solution ? this.solution.length - 1 : null
    };
  }
}
