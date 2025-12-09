import java.util.*;

class Node {
    String id;
    double x, y;
    double heuristic;
    
    public Node(String id, double x, double y, double heuristic) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.heuristic = heuristic;
    }
}

class Edge {
    String from, to;
    double weight;
    
    public Edge(String from, String to, double weight) {
        this.from = from;
        this.to = to;
        this.weight = weight;
    }
}

class AStarNode implements Comparable<AStarNode> {
    String id;
    double g, h, f;
    String parent;
    
    public AStarNode(String id, double g, double h, String parent) {
        this.id = id;
        this.g = g;
        this.h = h;
        this.f = g + h;
        this.parent = parent;
    }
    
    @Override
    public int compareTo(AStarNode other) {
        return Double.compare(this.f, other.f);
    }
}

class Graph {
    private Map<String, Node> nodes;
    private List<Edge> edges;
    private Map<String, List<Edge>> adjacencyList;
    
    public Graph() {
        nodes = new HashMap<>();
        edges = new ArrayList<>();
        adjacencyList = new HashMap<>();
    }
    
    public void addNode(Node node) {
        nodes.put(node.id, node);
        adjacencyList.putIfAbsent(node.id, new ArrayList<>());
    }
    
    public void addEdge(String from, String to, double weight) {
        Edge edge = new Edge(from, to, weight);
        edges.add(edge);
        adjacencyList.get(from).add(edge);
    }
    
    public Node getNode(String id) {
        return nodes.get(id);
    }
    
    public List<Edge> getNeighbors(String id) {
        return adjacencyList.getOrDefault(id, new ArrayList<>());
    }
}

class AStar {
    private Graph graph;
    private String startId, goalId;
    
    public AStar(Graph graph, String startId, String goalId) {
        this.graph = graph;
        this.startId = startId;
        this.goalId = goalId;
    }
    
    public List<String> findPath() {
        PriorityQueue<AStarNode> openList = new PriorityQueue<>();
        Set<String> closedList = new HashSet<>();
        Map<String, Double> gScore = new HashMap<>();
        Map<String, String> parent = new HashMap<>();
        
        // Initialize start node
        Node startNode = graph.getNode(startId);
        gScore.put(startId, 0.0);
        openList.add(new AStarNode(startId, 0, startNode.heuristic, null));
        parent.put(startId, null);
        
        while (!openList.isEmpty()) {
            AStarNode current = openList.poll();
            
            // Goal reached
            if (current.id.equals(goalId)) {
                return reconstructPath(parent, goalId);
            }
            
            // Skip if already processed
            if (closedList.contains(current.id)) continue;
            closedList.add(current.id);
            
            // Explore neighbors
            for (Edge edge : graph.getNeighbors(current.id)) {
                String neighborId = edge.to;
                
                if (closedList.contains(neighborId)) continue;
                
                double tentativeG = gScore.get(current.id) + edge.weight;
                
                if (!gScore.containsKey(neighborId) || tentativeG < gScore.get(neighborId)) {
                    gScore.put(neighborId, tentativeG);
                    parent.put(neighborId, current.id);
                    
                    Node neighborNode = graph.getNode(neighborId);
                    double h = neighborNode.heuristic;
                    openList.add(new AStarNode(neighborId, tentativeG, h, current.id));
                }
            }
        }
        
        return new ArrayList<>(); // No path found
    }
    
    private List<String> reconstructPath(Map<String, String> parent, String current) {
        List<String> path = new ArrayList<>();
        while (current != null) {
            path.add(0, current);
            current = parent.get(current);
        }
        return path;
    }
}

public class AStarAlgorithm {
    public static void main(String[] args) {
        // Create graph
        Graph graph = new Graph();
        
        // Add nodes with heuristic values
        graph.addNode(new Node("A", 0, 0, 6));
        graph.addNode(new Node("B", 1, 0, 5));
        graph.addNode(new Node("C", 0, 1, 5));
        graph.addNode(new Node("D", 2, 0, 3));
        graph.addNode(new Node("E", 2, 1, 3));
        graph.addNode(new Node("F", 3, 0, 1));
        graph.addNode(new Node("G", 4, 0, 0));
        
        // Add directed edges
        graph.addEdge("A", "B", 2);
        graph.addEdge("A", "C", 5);
        graph.addEdge("B", "D", 3);
        graph.addEdge("C", "E", 2);
        graph.addEdge("D", "F", 4);
        graph.addEdge("E", "F", 1);
        graph.addEdge("D", "E", 2);
        graph.addEdge("F", "G", 3);
        
        // Run A* algorithm
        AStar astar = new AStar(graph, "A", "G");
        List<String> path = astar.findPath();
        
        // Print result
        System.out.print("Path found: ");
        for (int i = 0; i < path.size(); i++) {
            System.out.print(path.get(i));
            if (i < path.size() - 1) System.out.print(" -> ");
        }
        System.out.println();
    }
}
