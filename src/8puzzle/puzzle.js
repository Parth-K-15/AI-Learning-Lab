// 8-Puzzle State Management

export class PuzzleState {
  constructor(board, g = 0, h = 0, parent = null, move = null) {
    this.board = board; // 2D array [3][3]
    this.g = g; // cost so far
    this.h = h; // heuristic
    this.parent = parent;
    this.move = move; // 'UP', 'DOWN', 'LEFT', 'RIGHT'
  }

  get f() {
    return this.g + this.h;
  }

  // Convert board to string for comparison
  toString() {
    return this.board.flat().join(',');
  }

  // Get blank tile position
  getBlankPosition() {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.board[r][c] === 0) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  // Clone the board
  cloneBoard() {
    return this.board.map(row => [...row]);
  }

  // Generate neighbor states
  getNeighbors() {
    const neighbors = [];
    const blank = this.getBlankPosition();
    
    const moves = [
      { dr: -1, dc: 0, name: 'UP' },
      { dr: 1, dc: 0, name: 'DOWN' },
      { dr: 0, dc: -1, name: 'LEFT' },
      { dr: 0, dc: 1, name: 'RIGHT' }
    ];

    for (const move of moves) {
      const newRow = blank.row + move.dr;
      const newCol = blank.col + move.dc;

      if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
        const newBoard = this.cloneBoard();
        // Swap blank with target
        newBoard[blank.row][blank.col] = newBoard[newRow][newCol];
        newBoard[newRow][newCol] = 0;
        
        neighbors.push({
          board: newBoard,
          move: move.name
        });
      }
    }

    return neighbors;
  }

  // Check if this state equals another
  equals(other) {
    return this.toString() === other.toString();
  }
}

// Heuristic functions
export function manhattanDistance(board) {
  let distance = 0;
  
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const value = board[r][c];
      if (value === 0) continue; // Skip blank
      
      // Calculate goal position for this tile
      const goalRow = Math.floor((value - 1) / 3);
      const goalCol = (value - 1) % 3;
      
      distance += Math.abs(r - goalRow) + Math.abs(c - goalCol);
    }
  }
  
  return distance;
}

export function misplacedTiles(board) {
  let count = 0;
  
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const value = board[r][c];
      if (value === 0) continue; // Skip blank
      
      const goalValue = r * 3 + c + 1;
      if (value !== goalValue) {
        count++;
      }
    }
  }
  
  return count;
}

// Check if puzzle is solvable
export function isSolvable(board) {
  const flat = board.flat().filter(x => x !== 0);
  let inversions = 0;
  
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) {
        inversions++;
      }
    }
  }
  
  return inversions % 2 === 0;
}

// Generate random solvable puzzle
export function generateRandomPuzzle() {
  let board;
  do {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    // Fisher-Yates shuffle
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    board = [
      numbers.slice(0, 3),
      numbers.slice(3, 6),
      numbers.slice(6, 9)
    ];
  } while (!isSolvable(board));
  
  return board;
}

// Goal state
export const GOAL_STATE = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0]
];

// Check if board is goal
export function isGoalState(board) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] !== GOAL_STATE[r][c]) {
        return false;
      }
    }
  }
  return true;
}
