import java.util.*;

/**
 * Alpha-Beta Pruning Algorithm
 * Game Tree Search Optimization
 * 
 * This implementation demonstrates Alpha-Beta pruning on a fixed game tree.
 */

class GameTreeNode {
    int id;
    String type;  // "MAX", "MIN", or "TERMINAL"
    int value;
    List<GameTreeNode> children;
    int alpha;
    int beta;
    boolean isPruned;
    
    public GameTreeNode(int id, String type, int value) {
        this.id = id;
        this.type = type;
        this.value = value;
        this.children = new ArrayList<>();
        this.alpha = Integer.MIN_VALUE;
        this.beta = Integer.MAX_VALUE;
        this.isPruned = false;
    }
    
    public GameTreeNode(int id, String type) {
        this(id, type, 0);
    }
    
    public void addChild(GameTreeNode child) {
        children.add(child);
    }
}

public class AlphaBetaPruning {
    
    /**
     * Create the predefined game tree
     * Tree structure: MAX -> MIN (2) -> MAX (4) -> MIN (8) -> TERMINAL (16)
     */
    public static GameTreeNode createGameTree() {
        // Root - MAX node
        GameTreeNode root = new GameTreeNode(0, "MAX");
        
        // Level 1 - MIN nodes (2 nodes)
        GameTreeNode min1 = new GameTreeNode(1, "MIN");
        GameTreeNode min2 = new GameTreeNode(2, "MIN");
        root.addChild(min1);
        root.addChild(min2);
        
        // Level 2 - MAX nodes (4 nodes - 2 per MIN)
        GameTreeNode max1 = new GameTreeNode(3, "MAX");
        GameTreeNode max2 = new GameTreeNode(4, "MAX");
        GameTreeNode max3 = new GameTreeNode(5, "MAX");
        GameTreeNode max4 = new GameTreeNode(6, "MAX");
        
        min1.addChild(max1);
        min1.addChild(max2);
        min2.addChild(max3);
        min2.addChild(max4);
        
        // Level 3 - MIN nodes (8 nodes - 2 per MAX)
        List<GameTreeNode> minNodesL3 = new ArrayList<>();
        int nodeId = 7;
        List<GameTreeNode> maxNodes = Arrays.asList(max1, max2, max3, max4);
        
        for (GameTreeNode maxNode : maxNodes) {
            for (int i = 0; i < 2; i++) {
                GameTreeNode minNode = new GameTreeNode(nodeId++, "MIN");
                maxNode.addChild(minNode);
                minNodesL3.add(minNode);
            }
        }
        
        // Level 4 - Terminal nodes (16 nodes - 2 per MIN)
        int[] terminalValues = {3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16};
        int terminalId = 15;
        int terminalIndex = 0;
        
        for (GameTreeNode minNode : minNodesL3) {
            for (int i = 0; i < 2; i++) {
                int value = terminalValues[terminalIndex++];
                GameTreeNode terminal = new GameTreeNode(terminalId++, "TERMINAL", value);
                minNode.addChild(terminal);
            }
        }
        
        return root;
    }
    
    /**
     * Alpha-Beta Pruning Algorithm
     */
    public static int alphaBetaPruning(GameTreeNode node, int alpha, int beta, 
                                      boolean isMaximizing, int depth, List<String> log) {
        String indent = "  ".repeat(depth);
        
        // Terminal node - return its value
        if (node.type.equals("TERMINAL")) {
            if (log != null) {
                log.add(indent + "Node " + node.id + " (TERMINAL): value = " + node.value);
            }
            return node.value;
        }
        
        if (isMaximizing) {
            // MAX node
            if (log != null) {
                log.add(indent + "Node " + node.id + " (MAX): α=" + alpha + ", β=" + beta);
            }
            
            int value = Integer.MIN_VALUE;
            
            for (int i = 0; i < node.children.size(); i++) {
                if (beta <= alpha) {
                    // Prune remaining children
                    for (int j = i; j < node.children.size(); j++) {
                        node.children.get(j).isPruned = true;
                        if (log != null) {
                            log.add(indent + "  ✂️ PRUNED Node " + node.children.get(j).id + 
                                   ": α(" + alpha + ") ≥ β(" + beta + ")");
                        }
                    }
                    break;
                }
                
                int childValue = alphaBetaPruning(node.children.get(i), alpha, beta, 
                                                 false, depth + 1, log);
                value = Math.max(value, childValue);
                alpha = Math.max(alpha, value);
                
                if (log != null) {
                    log.add(indent + "  Updated: value=" + value + ", α=" + alpha);
                }
            }
            
            node.value = value;
            return value;
        } else {
            // MIN node
            if (log != null) {
                log.add(indent + "Node " + node.id + " (MIN): α=" + alpha + ", β=" + beta);
            }
            
            int value = Integer.MAX_VALUE;
            
            for (int i = 0; i < node.children.size(); i++) {
                if (beta <= alpha) {
                    // Prune remaining children
                    for (int j = i; j < node.children.size(); j++) {
                        node.children.get(j).isPruned = true;
                        if (log != null) {
                            log.add(indent + "  ✂️ PRUNED Node " + node.children.get(j).id + 
                                   ": β(" + beta + ") ≤ α(" + alpha + ")");
                        }
                    }
                    break;
                }
                
                int childValue = alphaBetaPruning(node.children.get(i), alpha, beta, 
                                                 true, depth + 1, log);
                value = Math.min(value, childValue);
                beta = Math.min(beta, value);
                
                if (log != null) {
                    log.add(indent + "  Updated: value=" + value + ", β=" + beta);
                }
            }
            
            node.value = value;
            return value;
        }
    }
    
    /**
     * Collect all pruned nodes
     */
    public static void collectPrunedNodes(GameTreeNode node, List<Integer> prunedList) {
        if (node.isPruned) {
            prunedList.add(node.id);
        }
        for (GameTreeNode child : node.children) {
            collectPrunedNodes(child, prunedList);
        }
    }
    
    public static void main(String[] args) {
        System.out.println("=".repeat(60));
        System.out.println("ALPHA-BETA PRUNING VISUALIZER");
        System.out.println("=".repeat(60));
        System.out.println();
        
        // Create the game tree
        GameTreeNode tree = createGameTree();
        System.out.println("Game tree created with 31 total nodes");
        System.out.println("Tree structure: MAX -> MIN (2) -> MAX (4) -> MIN (8) -> TERMINAL (16)");
        System.out.println("Terminal values: 3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16");
        System.out.println();
        
        // Run Alpha-Beta Pruning
        System.out.println("Running Alpha-Beta Pruning...");
        System.out.println("-".repeat(60));
        
        List<String> log = new ArrayList<>();
        int optimalValue = alphaBetaPruning(tree, 
                                           Integer.MIN_VALUE, 
                                           Integer.MAX_VALUE, 
                                           true, 
                                           0, 
                                           log);
        System.out.println();
        
        // Print execution log
        System.out.println("EXECUTION LOG:");
        System.out.println("-".repeat(60));
        for (String entry : log) {
            System.out.println(entry);
        }
        System.out.println();
        
        // Collect pruned nodes
        List<Integer> prunedNodes = new ArrayList<>();
        collectPrunedNodes(tree, prunedNodes);
        Collections.sort(prunedNodes);
        
        // Print results
        System.out.println("=".repeat(60));
        System.out.println("RESULTS:");
        System.out.println("=".repeat(60));
        System.out.println("✓ Optimal Value (Root): " + optimalValue);
        System.out.println("✓ Pruned Nodes: " + prunedNodes.size());
        System.out.print("  Node IDs: ");
        for (int i = 0; i < prunedNodes.size(); i++) {
            System.out.print(prunedNodes.get(i));
            if (i < prunedNodes.size() - 1) System.out.print(", ");
        }
        System.out.println();
        System.out.printf("✓ Efficiency: %d/31 nodes = %.1f%% reduction%n", 
                         prunedNodes.size(), (prunedNodes.size() / 31.0 * 100));
        System.out.println("=".repeat(60));
    }
}
