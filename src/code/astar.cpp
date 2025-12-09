#include <iostream>
#include <vector>
#include <queue>
#include <unordered_map>
#include <unordered_set>
#include <cmath>
#include <algorithm>

using namespace std;

struct Node {
    string id;
    double x, y;
    double heuristic;
    
    Node(string id, double x, double y, double h) 
        : id(id), x(x), y(y), heuristic(h) {}
};

struct Edge {
    string from, to;
    double weight;
    
    Edge(string f, string t, double w) 
        : from(f), to(t), weight(w) {}
};

struct AStarNode {
    string id;
    double g, h, f;
    string parent;
    
    AStarNode(string id, double g, double h, string parent = "")
        : id(id), g(g), h(h), f(g + h), parent(parent) {}
    
    bool operator>(const AStarNode& other) const {
        return f > other.f;
    }
};

class Graph {
private:
    unordered_map<string, Node> nodes;
    vector<Edge> edges;
    unordered_map<string, vector<pair<string, double>>> adjacencyList;
    
public:
    void addNode(const Node& node) {
        nodes[node.id] = node;
    }
    
    void addEdge(const string& from, const string& to, double weight) {
        edges.push_back(Edge(from, to, weight));
        adjacencyList[from].push_back({to, weight});
    }
    
    Node getNode(const string& id) {
        return nodes[id];
    }
    
    vector<pair<string, double>> getNeighbors(const string& id) {
        return adjacencyList[id];
    }
};

class AStar {
private:
    Graph& graph;
    string startId, goalId;
    
public:
    AStar(Graph& g, string start, string goal) 
        : graph(g), startId(start), goalId(goal) {}
    
    vector<string> findPath() {
        priority_queue<AStarNode, vector<AStarNode>, greater<AStarNode>> openList;
        unordered_set<string> closedList;
        unordered_map<string, double> gScore;
        unordered_map<string, string> parent;
        
        // Initialize start node
        Node startNode = graph.getNode(startId);
        gScore[startId] = 0;
        openList.push(AStarNode(startId, 0, startNode.heuristic));
        parent[startId] = "";
        
        while (!openList.empty()) {
            AStarNode current = openList.top();
            openList.pop();
            
            // Goal reached
            if (current.id == goalId) {
                return reconstructPath(parent, goalId);
            }
            
            // Skip if already processed
            if (closedList.count(current.id)) continue;
            closedList.insert(current.id);
            
            // Explore neighbors
            for (auto& neighbor : graph.getNeighbors(current.id)) {
                string neighborId = neighbor.first;
                double edgeWeight = neighbor.second;
                
                if (closedList.count(neighborId)) continue;
                
                double tentativeG = gScore[current.id] + edgeWeight;
                
                if (!gScore.count(neighborId) || tentativeG < gScore[neighborId]) {
                    gScore[neighborId] = tentativeG;
                    parent[neighborId] = current.id;
                    
                    Node neighborNode = graph.getNode(neighborId);
                    double h = neighborNode.heuristic;
                    openList.push(AStarNode(neighborId, tentativeG, h, current.id));
                }
            }
        }
        
        return {}; // No path found
    }
    
private:
    vector<string> reconstructPath(unordered_map<string, string>& parent, string current) {
        vector<string> path;
        while (!current.empty()) {
            path.push_back(current);
            current = parent[current];
        }
        reverse(path.begin(), path.end());
        return path;
    }
};

int main() {
    // Create graph
    Graph graph;
    
    // Add nodes with heuristic values
    graph.addNode(Node("A", 0, 0, 6));
    graph.addNode(Node("B", 1, 0, 5));
    graph.addNode(Node("C", 0, 1, 5));
    graph.addNode(Node("D", 2, 0, 3));
    graph.addNode(Node("E", 2, 1, 3));
    graph.addNode(Node("F", 3, 0, 1));
    graph.addNode(Node("G", 4, 0, 0));
    
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
    AStar astar(graph, "A", "G");
    vector<string> path = astar.findPath();
    
    // Print result
    cout << "Path found: ";
    for (size_t i = 0; i < path.size(); i++) {
        cout << path[i];
        if (i < path.size() - 1) cout << " -> ";
    }
    cout << endl;
    
    return 0;
}
