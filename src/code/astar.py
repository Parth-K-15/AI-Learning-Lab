import heapq
from typing import List, Dict, Set, Tuple, Optional

class Node:
    """Represents a node in the graph"""
    def __init__(self, id: str, x: float, y: float, heuristic: float):
        self.id = id
        self.x = x
        self.y = y
        self.heuristic = heuristic

class Edge:
    """Represents a directed edge in the graph"""
    def __init__(self, from_node: str, to_node: str, weight: float):
        self.from_node = from_node
        self.to_node = to_node
        self.weight = weight

class AStarNode:
    """Node wrapper for A* algorithm with f, g, h scores"""
    def __init__(self, id: str, g: float, h: float, parent: Optional[str] = None):
        self.id = id
        self.g = g  # Cost from start to current node
        self.h = h  # Heuristic (estimated cost to goal)
        self.f = g + h  # Total cost
        self.parent = parent
    
    def __lt__(self, other):
        """For priority queue comparison"""
        return self.f < other.f

class Graph:
    """Graph data structure with nodes and edges"""
    def __init__(self):
        self.nodes: Dict[str, Node] = {}
        self.edges: List[Edge] = []
        self.adjacency_list: Dict[str, List[Tuple[str, float]]] = {}
    
    def add_node(self, node: Node):
        """Add a node to the graph"""
        self.nodes[node.id] = node
        if node.id not in self.adjacency_list:
            self.adjacency_list[node.id] = []
    
    def add_edge(self, from_id: str, to_id: str, weight: float):
        """Add a directed edge to the graph"""
        edge = Edge(from_id, to_id, weight)
        self.edges.append(edge)
        self.adjacency_list[from_id].append((to_id, weight))
    
    def get_node(self, id: str) -> Node:
        """Get node by ID"""
        return self.nodes.get(id)
    
    def get_neighbors(self, id: str) -> List[Tuple[str, float]]:
        """Get neighbors of a node"""
        return self.adjacency_list.get(id, [])

class AStar:
    """A* pathfinding algorithm implementation"""
    def __init__(self, graph: Graph, start_id: str, goal_id: str):
        self.graph = graph
        self.start_id = start_id
        self.goal_id = goal_id
    
    def find_path(self) -> List[str]:
        """Execute A* algorithm and return the path"""
        # Priority queue for open list (min-heap based on f-score)
        open_list = []
        closed_list: Set[str] = set()
        
        # Track g-scores and parents
        g_score: Dict[str, float] = {}
        parent: Dict[str, Optional[str]] = {}
        
        # Initialize start node
        start_node = self.graph.get_node(self.start_id)
        g_score[self.start_id] = 0
        heapq.heappush(open_list, AStarNode(self.start_id, 0, start_node.heuristic))
        parent[self.start_id] = None
        
        while open_list:
            # Get node with lowest f-score
            current = heapq.heappop(open_list)
            
            # Goal reached
            if current.id == self.goal_id:
                return self._reconstruct_path(parent, self.goal_id)
            
            # Skip if already processed
            if current.id in closed_list:
                continue
            
            closed_list.add(current.id)
            
            # Explore neighbors
            for neighbor_id, edge_weight in self.graph.get_neighbors(current.id):
                if neighbor_id in closed_list:
                    continue
                
                tentative_g = g_score[current.id] + edge_weight
                
                # Update if better path found
                if neighbor_id not in g_score or tentative_g < g_score[neighbor_id]:
                    g_score[neighbor_id] = tentative_g
                    parent[neighbor_id] = current.id
                    
                    neighbor_node = self.graph.get_node(neighbor_id)
                    h = neighbor_node.heuristic
                    heapq.heappush(open_list, AStarNode(neighbor_id, tentative_g, h, current.id))
        
        return []  # No path found
    
    def _reconstruct_path(self, parent: Dict[str, Optional[str]], current: str) -> List[str]:
        """Reconstruct path from parent pointers"""
        path = []
        while current is not None:
            path.append(current)
            current = parent[current]
        path.reverse()
        return path

def main():
    """Example usage of A* algorithm"""
    # Create graph
    graph = Graph()
    
    # Add nodes with heuristic values
    graph.add_node(Node("A", 0, 0, 6))
    graph.add_node(Node("B", 1, 0, 5))
    graph.add_node(Node("C", 0, 1, 5))
    graph.add_node(Node("D", 2, 0, 3))
    graph.add_node(Node("E", 2, 1, 3))
    graph.add_node(Node("F", 3, 0, 1))
    graph.add_node(Node("G", 4, 0, 0))
    
    # Add directed edges with weights
    graph.add_edge("A", "B", 2)
    graph.add_edge("A", "C", 5)
    graph.add_edge("B", "D", 3)
    graph.add_edge("C", "E", 2)
    graph.add_edge("D", "F", 4)
    graph.add_edge("E", "F", 1)
    graph.add_edge("D", "E", 2)
    graph.add_edge("F", "G", 3)
    
    # Run A* algorithm
    astar = AStar(graph, "A", "G")
    path = astar.find_path()
    
    # Print result
    if path:
        print("Path found:", " -> ".join(path))
    else:
        print("No path found")

if __name__ == "__main__":
    main()
