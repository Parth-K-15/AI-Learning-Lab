// A* Search Algorithm Implementation

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

  contains(nodeId) {
    return this.items.some(x => x.item === nodeId);
  }

  updatePriority(nodeId, newPriority) {
    const index = this.items.findIndex(x => x.item === nodeId);
    if (index !== -1) {
      this.items[index].priority = newPriority;
      this.items.sort((a, b) => a.priority - b.priority);
    }
  }
}

export class AStarSearch {
  constructor(graph, startId, goalId) {
    this.graph = graph;
    this.startId = startId;
    this.goalId = goalId;
    
    this.openList = new PriorityQueue();
    this.closedList = new Set();
    
    this.gScore = new Map(); // nodeId -> g value
    this.hScore = new Map(); // nodeId -> h value
    this.fScore = new Map(); // nodeId -> f value
    this.parent = new Map(); // nodeId -> parent nodeId
    
    this.currentNode = null;
    this.pathFound = false;
    this.path = [];
    this.stepLog = [];
    this.nodesExpanded = 0;
    
    // Initialize start node
    this.gScore.set(startId, 0);
    this.hScore.set(startId, this.calculateHeuristic(startId));
    this.fScore.set(startId, this.hScore.get(startId));
    this.parent.set(startId, null);
    this.openList.enqueue(startId, this.fScore.get(startId));
  }

  calculateHeuristic(nodeId) {
    const node = this.graph.getNode(nodeId);
    if (!node) return 0;
    
    // Use the user-provided heuristic value stored in the node
    return node.heuristic || 0;
  }

  step() {
    if (this.pathFound || this.openList.isEmpty()) {
      return {
        done: true,
        pathFound: this.pathFound,
        message: this.pathFound ? 'Path found!' : 'No path exists',
        currentNode: this.currentNode,
        openList: this.getOpenListSnapshot(),
        closedList: Array.from(this.closedList),
        path: this.path
      };
    }

    // Get node with lowest f score
    this.currentNode = this.openList.dequeue();
    this.nodesExpanded++;

    const stepInfo = {
      step: this.nodesExpanded,
      action: 'EXPAND',
      nodeId: this.currentNode,
      g: this.gScore.get(this.currentNode),
      h: this.hScore.get(this.currentNode),
      f: this.fScore.get(this.currentNode),
      message: `Expanding node ${this.graph.getNode(this.currentNode).label} with f=${this.fScore.get(this.currentNode).toFixed(2)}`,
      openSize: this.openList.size(),
      closedSize: this.closedList.size
    };

    // Check if goal reached
    if (this.currentNode === this.goalId) {
      this.pathFound = true;
      this.path = this.reconstructPath();
      stepInfo.message = `🎉 Goal reached! Path cost: ${this.gScore.get(this.currentNode).toFixed(2)}`;
      stepInfo.action = 'GOAL_FOUND';
      this.stepLog.push(stepInfo);
      
      return {
        done: true,
        pathFound: true,
        message: stepInfo.message,
        currentNode: this.currentNode,
        openList: this.getOpenListSnapshot(),
        closedList: Array.from(this.closedList),
        path: this.path,
        stepInfo
      };
    }

    // Move to closed list
    this.closedList.add(this.currentNode);

    // Explore neighbors
    const neighbors = this.graph.getNeighbors(this.currentNode);
    let neighborsAdded = 0;

    for (const neighbor of neighbors) {
      const neighborId = neighbor.nodeId;
      
      // Skip if in closed list
      if (this.closedList.has(neighborId)) {
        continue;
      }

      const tentativeG = this.gScore.get(this.currentNode) + neighbor.weight;

      // If not in open list or found better path
      if (!this.openList.contains(neighborId) || tentativeG < (this.gScore.get(neighborId) || Infinity)) {
        this.parent.set(neighborId, this.currentNode);
        this.gScore.set(neighborId, tentativeG);
        this.hScore.set(neighborId, this.calculateHeuristic(neighborId));
        this.fScore.set(neighborId, tentativeG + this.hScore.get(neighborId));
        
        if (this.openList.contains(neighborId)) {
          this.openList.updatePriority(neighborId, this.fScore.get(neighborId));
        } else {
          this.openList.enqueue(neighborId, this.fScore.get(neighborId));
          neighborsAdded++;
        }
      }
    }

    stepInfo.neighborsAdded = neighborsAdded;
    this.stepLog.push(stepInfo);

    return {
      done: false,
      pathFound: false,
      message: stepInfo.message,
      currentNode: this.currentNode,
      openList: this.getOpenListSnapshot(),
      closedList: Array.from(this.closedList),
      stepInfo
    };
  }

  reconstructPath() {
    const path = [];
    let current = this.goalId;
    
    while (current !== null) {
      path.unshift(current);
      current = this.parent.get(current);
    }
    
    return path;
  }

  getOpenListSnapshot() {
    return this.openList.getAll().map(nodeId => ({
      nodeId,
      g: this.gScore.get(nodeId),
      h: this.hScore.get(nodeId),
      f: this.fScore.get(nodeId)
    })).slice(0, 10); // Top 10 for display
  }

  getNodeData(nodeId) {
    return {
      g: this.gScore.get(nodeId) || 0,
      h: this.hScore.get(nodeId) || 0,
      f: this.fScore.get(nodeId) || 0,
      parent: this.parent.get(nodeId)
    };
  }

  solve() {
    while (!this.pathFound && !this.openList.isEmpty()) {
      this.step();
    }
    
    return {
      success: this.pathFound,
      path: this.path,
      pathCost: this.pathFound ? this.gScore.get(this.goalId) : null,
      nodesExpanded: this.nodesExpanded,
      stepLog: this.stepLog
    };
  }

  getStats() {
    return {
      nodesExpanded: this.nodesExpanded,
      openListSize: this.openList.size(),
      closedListSize: this.closedList.size,
      pathFound: this.pathFound,
      pathCost: this.pathFound ? this.gScore.get(this.goalId) : null
    };
  }
}
