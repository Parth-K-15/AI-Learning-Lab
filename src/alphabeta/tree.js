// Game tree structure with predefined values
export class GameTreeNode {
  constructor(id, type, value = null, depth = 0) {
    this.id = id;
    this.type = type; // 'MAX' or 'MIN' or 'TERMINAL'
    this.value = value; // Terminal node value or computed value
    this.children = [];
    this.depth = depth;
    this.alpha = -Infinity;
    this.beta = Infinity;
    this.isPruned = false;
    this.isEvaluated = false;
    this.isCurrent = false;
    this.isBeingPruned = false; // For animation
    this.parent = null;
  }

  addChild(child) {
    child.parent = this;
    this.children.push(child);
  }
}

// Create the predefined game tree from the PRD
export function createGameTree() {
  // Root - MAX node
  const root = new GameTreeNode(0, 'MAX', null, 0);

  // Level 1 - MIN nodes (2 nodes)
  const min1 = new GameTreeNode(1, 'MIN', null, 1);
  const min2 = new GameTreeNode(2, 'MIN', null, 1);

  root.addChild(min1);
  root.addChild(min2);

  // Level 2 - MAX nodes (4 nodes - 2 per MIN)
  const max1 = new GameTreeNode(3, 'MAX', null, 2);
  const max2 = new GameTreeNode(4, 'MAX', null, 2);
  const max3 = new GameTreeNode(5, 'MAX', null, 2);
  const max4 = new GameTreeNode(6, 'MAX', null, 2);

  min1.addChild(max1);
  min1.addChild(max2);
  min2.addChild(max3);
  min2.addChild(max4);

  // Level 3 - MIN nodes (8 nodes - 2 per MAX)
  const minNodes = [];
  let nodeId = 7;
  [max1, max2, max3, max4].forEach(maxNode => {
    for (let i = 0; i < 2; i++) {
      const minNode = new GameTreeNode(nodeId++, 'MIN', null, 3);
      maxNode.addChild(minNode);
      minNodes.push(minNode);
    }
  });

  // Level 4 - Terminal nodes (16 nodes - 2 per MIN)
  // Leaf values (left → right): 3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16
  const terminals = [
    3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16
  ];

  let terminalId = 15;
  let terminalIndex = 0;

  minNodes.forEach(minNode => {
    for (let i = 0; i < 2; i++) {
      const terminal = new GameTreeNode(
        terminalId++,
        'TERMINAL',
        terminals[terminalIndex++],
        4
      );
      minNode.addChild(terminal);
    }
  });

  return root;
}

// Helper function to get all nodes in DFS order
export function getAllNodes(root) {
  const nodes = [];
  const stack = [root];
  
  while (stack.length > 0) {
    const node = stack.pop();
    nodes.push(node);
    for (let i = node.children.length - 1; i >= 0; i--) {
      stack.push(node.children[i]);
    }
  }
  
  return nodes;
}

// Helper function to get terminal nodes
export function getTerminalNodes(root) {
  const terminals = [];
  const stack = [root];
  
  while (stack.length > 0) {
    const node = stack.pop();
    if (node.type === 'TERMINAL') {
      terminals.push(node);
    }
    for (let i = node.children.length - 1; i >= 0; i--) {
      stack.push(node.children[i]);
    }
  }
  
  return terminals;
}

// Calculate tree layout positions for visualization
export function calculateTreeLayout(root, width = 1200, height = 700) {
  const positions = new Map();
  const levelHeight = height / 5;
  
  // Calculate positions recursively
  function positionSubtree(node, left, right, depth) {
    const x = (left + right) / 2;
    const y = depth * levelHeight + 50;
    
    positions.set(node.id, { x, y });
    
    if (node.children.length > 0) {
      const childWidth = (right - left) / node.children.length;
      node.children.forEach((child, i) => {
        const childLeft = left + i * childWidth;
        const childRight = childLeft + childWidth;
        positionSubtree(child, childLeft, childRight, depth + 1);
      });
    }
  }
  
  positionSubtree(root, 0, width, 0);
  return positions;
}
