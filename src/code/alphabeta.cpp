#include <iostream>
#include <vector>
#include <limits>
#include <algorithm>
#include <iomanip>

using namespace std;

// Game Tree Node Structure
struct GameTreeNode {
    int id;
    string type;  // "MAX", "MIN", or "TERMINAL"
    int value;
    vector<GameTreeNode*> children;
    int alpha;
    int beta;
    bool isPruned;
    
    GameTreeNode(int id, string type, int value = 0) 
        : id(id), type(type), value(value), isPruned(false) {
        alpha = numeric_limits<int>::min();
        beta = numeric_limits<int>::max();
    }
    
    void addChild(GameTreeNode* child) {
        children.push_back(child);
    }
};

// Create the predefined game tree
GameTreeNode* createGameTree() {
    // Root - MAX node
    GameTreeNode* root = new GameTreeNode(0, "MAX");
    
    // Level 1 - MIN nodes (2 nodes)
    GameTreeNode* min1 = new GameTreeNode(1, "MIN");
    GameTreeNode* min2 = new GameTreeNode(2, "MIN");
    root->addChild(min1);
    root->addChild(min2);
    
    // Level 2 - MAX nodes (4 nodes - 2 per MIN)
    GameTreeNode* max1 = new GameTreeNode(3, "MAX");
    GameTreeNode* max2 = new GameTreeNode(4, "MAX");
    GameTreeNode* max3 = new GameTreeNode(5, "MAX");
    GameTreeNode* max4 = new GameTreeNode(6, "MAX");
    
    min1->addChild(max1);
    min1->addChild(max2);
    min2->addChild(max3);
    min2->addChild(max4);
    
    // Level 3 - MIN nodes (8 nodes - 2 per MAX)
    vector<GameTreeNode*> minNodesL3;
    int nodeId = 7;
    vector<GameTreeNode*> maxNodes = {max1, max2, max3, max4};
    
    for (auto maxNode : maxNodes) {
        for (int i = 0; i < 2; i++) {
            GameTreeNode* minNode = new GameTreeNode(nodeId++, "MIN");
            maxNode->addChild(minNode);
            minNodesL3.push_back(minNode);
        }
    }
    
    // Level 4 - Terminal nodes (16 nodes - 2 per MIN)
    vector<int> terminalValues = {3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16};
    int terminalId = 15;
    int terminalIndex = 0;
    
    for (auto minNode : minNodesL3) {
        for (int i = 0; i < 2; i++) {
            int value = terminalValues[terminalIndex++];
            GameTreeNode* terminal = new GameTreeNode(terminalId++, "TERMINAL", value);
            minNode->addChild(terminal);
        }
    }
    
    return root;
}

// Alpha-Beta Pruning Algorithm
int alphaBetaPruning(GameTreeNode* node, int alpha, int beta, bool isMaximizing, 
                     int depth = 0, vector<string>* log = nullptr) {
    string indent(depth * 2, ' ');
    
    // Terminal node - return its value
    if (node->type == "TERMINAL") {
        if (log) {
            log->push_back(indent + "Node " + to_string(node->id) + 
                          " (TERMINAL): value = " + to_string(node->value));
        }
        return node->value;
    }
    
    if (isMaximizing) {
        // MAX node
        if (log) {
            log->push_back(indent + "Node " + to_string(node->id) + 
                          " (MAX): α=" + to_string(alpha) + ", β=" + to_string(beta));
        }
        
        int value = numeric_limits<int>::min();
        
        for (size_t i = 0; i < node->children.size(); i++) {
            if (beta <= alpha) {
                // Prune remaining children
                for (size_t j = i; j < node->children.size(); j++) {
                    node->children[j]->isPruned = true;
                    if (log) {
                        log->push_back(indent + "  ✂️ PRUNED Node " + 
                                      to_string(node->children[j]->id) + 
                                      ": α(" + to_string(alpha) + ") ≥ β(" + to_string(beta) + ")");
                    }
                }
                break;
            }
            
            int childValue = alphaBetaPruning(node->children[i], alpha, beta, false, depth + 1, log);
            value = max(value, childValue);
            alpha = max(alpha, value);
            
            if (log) {
                log->push_back(indent + "  Updated: value=" + to_string(value) + 
                              ", α=" + to_string(alpha));
            }
        }
        
        node->value = value;
        return value;
    } else {
        // MIN node
        if (log) {
            log->push_back(indent + "Node " + to_string(node->id) + 
                          " (MIN): α=" + to_string(alpha) + ", β=" + to_string(beta));
        }
        
        int value = numeric_limits<int>::max();
        
        for (size_t i = 0; i < node->children.size(); i++) {
            if (beta <= alpha) {
                // Prune remaining children
                for (size_t j = i; j < node->children.size(); j++) {
                    node->children[j]->isPruned = true;
                    if (log) {
                        log->push_back(indent + "  ✂️ PRUNED Node " + 
                                      to_string(node->children[j]->id) + 
                                      ": β(" + to_string(beta) + ") ≤ α(" + to_string(alpha) + ")");
                    }
                }
                break;
            }
            
            int childValue = alphaBetaPruning(node->children[i], alpha, beta, true, depth + 1, log);
            value = min(value, childValue);
            beta = min(beta, value);
            
            if (log) {
                log->push_back(indent + "  Updated: value=" + to_string(value) + 
                              ", β=" + to_string(beta));
            }
        }
        
        node->value = value;
        return value;
    }
}

// Collect pruned nodes
void collectPrunedNodes(GameTreeNode* node, vector<int>& prunedList) {
    if (node->isPruned) {
        prunedList.push_back(node->id);
    }
    for (auto child : node->children) {
        collectPrunedNodes(child, prunedList);
    }
}

// Clean up memory
void deleteTree(GameTreeNode* node) {
    for (auto child : node->children) {
        deleteTree(child);
    }
    delete node;
}

int main() {
    cout << string(60, '=') << endl;
    cout << "ALPHA-BETA PRUNING VISUALIZER" << endl;
    cout << string(60, '=') << endl << endl;
    
    // Create the game tree
    GameTreeNode* tree = createGameTree();
    cout << "Game tree created with 31 total nodes" << endl;
    cout << "Tree structure: MAX -> MIN (2) -> MAX (4) -> MIN (8) -> TERMINAL (16)" << endl;
    cout << "Terminal values: 3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16" << endl << endl;
    
    // Run Alpha-Beta Pruning
    cout << "Running Alpha-Beta Pruning..." << endl;
    cout << string(60, '-') << endl;
    
    vector<string> log;
    int optimalValue = alphaBetaPruning(tree, 
                                        numeric_limits<int>::min(), 
                                        numeric_limits<int>::max(), 
                                        true, 
                                        0, 
                                        &log);
    cout << endl;
    
    // Print execution log
    cout << "EXECUTION LOG:" << endl;
    cout << string(60, '-') << endl;
    for (const auto& entry : log) {
        cout << entry << endl;
    }
    cout << endl;
    
    // Collect pruned nodes
    vector<int> prunedNodes;
    collectPrunedNodes(tree, prunedNodes);
    sort(prunedNodes.begin(), prunedNodes.end());
    
    // Print results
    cout << string(60, '=') << endl;
    cout << "RESULTS:" << endl;
    cout << string(60, '=') << endl;
    cout << "✓ Optimal Value (Root): " << optimalValue << endl;
    cout << "✓ Pruned Nodes: " << prunedNodes.size() << endl;
    cout << "  Node IDs: ";
    for (size_t i = 0; i < prunedNodes.size(); i++) {
        cout << prunedNodes[i];
        if (i < prunedNodes.size() - 1) cout << ", ";
    }
    cout << endl;
    cout << fixed << setprecision(1);
    cout << "✓ Efficiency: " << prunedNodes.size() << "/31 nodes = " 
         << (prunedNodes.size() / 31.0 * 100) << "% reduction" << endl;
    cout << string(60, '=') << endl;
    
    // Clean up
    deleteTree(tree);
    
    return 0;
}
