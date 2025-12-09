// Graph Node and Edge classes

export class GraphNode {
  constructor(id, x, y, label = null, heuristic = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.label = label || id;
    this.heuristic = heuristic; // User-provided heuristic value
  }
}

export class GraphEdge {
  constructor(from, to, weight = 1) {
    this.from = from;
    this.to = to;
    this.weight = weight;
  }
}

export class Graph {
  constructor() {
    this.nodes = new Map(); // id -> GraphNode
    this.edges = []; // Array of GraphEdge
    this.adjacencyList = new Map(); // id -> [{nodeId, weight}]
  }

  addNode(node) {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  updateNodeHeuristic(nodeId, heuristic) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.heuristic = heuristic;
    }
  }

  removeNode(nodeId) {
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    
    // Remove all edges connected to this node
    this.edges = this.edges.filter(edge => 
      edge.from !== nodeId && edge.to !== nodeId
    );
    
    // Update adjacency list
    for (const [id, neighbors] of this.adjacencyList.entries()) {
      this.adjacencyList.set(
        id,
        neighbors.filter(n => n.nodeId !== nodeId)
      );
    }
  }

  addEdge(fromId, toId, weight = 1, bidirectional = true) {
    const edge = new GraphEdge(fromId, toId, weight);
    this.edges.push(edge);
    
    // Update adjacency list
    const neighbors = this.adjacencyList.get(fromId) || [];
    neighbors.push({ nodeId: toId, weight });
    this.adjacencyList.set(fromId, neighbors);
    
    if (bidirectional) {
      const reverseEdge = new GraphEdge(toId, fromId, weight);
      this.edges.push(reverseEdge);
      
      const reverseNeighbors = this.adjacencyList.get(toId) || [];
      reverseNeighbors.push({ nodeId: fromId, weight });
      this.adjacencyList.set(toId, reverseNeighbors);
    }
  }

  removeEdge(fromId, toId, bidirectional = true) {
    this.edges = this.edges.filter(edge => 
      !(edge.from === fromId && edge.to === toId)
    );
    
    const neighbors = this.adjacencyList.get(fromId) || [];
    this.adjacencyList.set(
      fromId,
      neighbors.filter(n => n.nodeId !== toId)
    );
    
    if (bidirectional) {
      this.edges = this.edges.filter(edge => 
        !(edge.from === toId && edge.to === fromId)
      );
      
      const reverseNeighbors = this.adjacencyList.get(toId) || [];
      this.adjacencyList.set(
        toId,
        reverseNeighbors.filter(n => n.nodeId !== fromId)
      );
    }
  }

  getNeighbors(nodeId) {
    return this.adjacencyList.get(nodeId) || [];
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getAllEdges() {
    return this.edges;
  }

  clear() {
    this.nodes.clear();
    this.edges = [];
    this.adjacencyList.clear();
  }
}

// Sample graph presets
export function createSampleGrid() {
  const graph = new Graph();
  
  // Create 4x4 grid
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const id = `${i}-${j}`;
      const node = new GraphNode(id, 100 + j * 150, 100 + i * 100, `(${i},${j})`);
      graph.addNode(node);
    }
  }
  
  // Connect adjacent nodes
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const id = `${i}-${j}`;
      
      if (j < 3) {
        graph.addEdge(id, `${i}-${j + 1}`, 1);
      }
      if (i < 3) {
        graph.addEdge(id, `${i + 1}-${j}`, 1);
      }
    }
  }
  
  return graph;
}

export function createSampleGraph() {
  const graph = new Graph();
  
  // Create nodes in a interesting layout with heuristic values
  const nodes = [
    { id: 'A', x: 100, y: 200, h: 6 },
    { id: 'B', x: 250, y: 100, h: 5 },
    { id: 'C', x: 250, y: 300, h: 5 },
    { id: 'D', x: 400, y: 150, h: 3 },
    { id: 'E', x: 400, y: 250, h: 3 },
    { id: 'F', x: 550, y: 200, h: 1 },
    { id: 'G', x: 700, y: 200, h: 0 }
  ];
  
  nodes.forEach(n => graph.addNode(new GraphNode(n.id, n.x, n.y, n.id, n.h)));
  
  // Add edges with weights
  graph.addEdge('A', 'B', 2);
  graph.addEdge('A', 'C', 5);
  graph.addEdge('B', 'D', 3);
  graph.addEdge('C', 'E', 2);
  graph.addEdge('D', 'F', 4);
  graph.addEdge('E', 'F', 1);
  graph.addEdge('D', 'E', 2);
  graph.addEdge('F', 'G', 3);
  
  return graph;
}
