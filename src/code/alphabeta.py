"""
Alpha-Beta Pruning Algorithm
Game Tree Search Optimization

This implementation demonstrates Alpha-Beta pruning on a fixed game tree.
The tree alternates between MAX and MIN levels, with terminal nodes 
containing predefined utility values.
"""

class GameTreeNode:
    """Represents a node in the game tree"""
    def __init__(self, node_id, node_type, value=None):
        self.id = node_id
        self.type = node_type  # 'MAX', 'MIN', or 'TERMINAL'
        self.value = value
        self.children = []
        self.alpha = float('-inf')
        self.beta = float('inf')
        self.is_pruned = False
    
    def add_child(self, child):
        """Add a child node"""
        self.children.append(child)


def create_game_tree():
    """
    Create the predefined game tree from the problem.
    Tree structure: MAX -> MIN (2) -> MAX (4) -> MIN (8) -> TERMINAL (16)
    Leaf values (left to right): 3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16
    """
    # Root - MAX node
    root = GameTreeNode(0, 'MAX')
    
    # Level 1 - MIN nodes (2 nodes)
    min1 = GameTreeNode(1, 'MIN')
    min2 = GameTreeNode(2, 'MIN')
    root.add_child(min1)
    root.add_child(min2)
    
    # Level 2 - MAX nodes (4 nodes - 2 per MIN)
    max1 = GameTreeNode(3, 'MAX')
    max2 = GameTreeNode(4, 'MAX')
    max3 = GameTreeNode(5, 'MAX')
    max4 = GameTreeNode(6, 'MAX')
    
    min1.add_child(max1)
    min1.add_child(max2)
    min2.add_child(max3)
    min2.add_child(max4)
    
    # Level 3 - MIN nodes (8 nodes - 2 per MAX)
    min_nodes_l3 = []
    node_id = 7
    max_nodes = [max1, max2, max3, max4]
    
    for max_node in max_nodes:
        for i in range(2):
            min_node = GameTreeNode(node_id, 'MIN')
            max_node.add_child(min_node)
            min_nodes_l3.append(min_node)
            node_id += 1
    
    # Level 4 - Terminal nodes (16 nodes - 2 per MIN)
    terminal_values = [3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16]
    terminal_id = 15
    terminal_index = 0
    
    for min_node in min_nodes_l3:
        for i in range(2):
            terminal = GameTreeNode(terminal_id, 'TERMINAL', terminal_values[terminal_index])
            min_node.add_child(terminal)
            terminal_id += 1
            terminal_index += 1
    
    return root


def alpha_beta_pruning(node, alpha, beta, is_maximizing, depth=0, log=None):
    """
    Alpha-Beta Pruning Algorithm
    
    Args:
        node: Current game tree node
        alpha: Best value for MAX player (initially -∞)
        beta: Best value for MIN player (initially +∞)
        is_maximizing: True if current player is MAX
        depth: Current depth in tree (for logging)
        log: List to store execution log
    
    Returns:
        Optimal value for the current node
    """
    if log is None:
        log = []
    
    indent = "  " * depth
    
    # Terminal node - return its value
    if node.type == 'TERMINAL':
        log.append(f"{indent}Node {node.id} (TERMINAL): value = {node.value}")
        return node.value
    
    if is_maximizing:
        # MAX node
        log.append(f"{indent}Node {node.id} (MAX): α={alpha}, β={beta}")
        value = float('-inf')
        
        for i, child in enumerate(node.children):
            if beta <= alpha:
                # Prune remaining children
                for j in range(i, len(node.children)):
                    node.children[j].is_pruned = True
                    log.append(f"{indent}  ✂️ PRUNED Node {node.children[j].id}: α({alpha}) ≥ β({beta})")
                break
            
            child_value = alpha_beta_pruning(child, alpha, beta, False, depth + 1, log)
            value = max(value, child_value)
            alpha = max(alpha, value)
            
            log.append(f"{indent}  Updated: value={value}, α={alpha}")
        
        node.value = value
        return value
    
    else:
        # MIN node
        log.append(f"{indent}Node {node.id} (MIN): α={alpha}, β={beta}")
        value = float('inf')
        
        for i, child in enumerate(node.children):
            if beta <= alpha:
                # Prune remaining children
                for j in range(i, len(node.children)):
                    node.children[j].is_pruned = True
                    log.append(f"{indent}  ✂️ PRUNED Node {node.children[j].id}: β({beta}) ≤ α({alpha})")
                break
            
            child_value = alpha_beta_pruning(child, alpha, beta, True, depth + 1, log)
            value = min(value, child_value)
            beta = min(beta, value)
            
            log.append(f"{indent}  Updated: value={value}, β={beta}")
        
        node.value = value
        return value


def collect_pruned_nodes(node, pruned_list):
    """Collect all pruned nodes in the tree"""
    if node.is_pruned:
        pruned_list.append(node.id)
    for child in node.children:
        collect_pruned_nodes(child, pruned_list)


def main():
    """Main execution"""
    print("=" * 60)
    print("ALPHA-BETA PRUNING VISUALIZER")
    print("=" * 60)
    print()
    
    # Create the game tree
    tree = create_game_tree()
    print("Game tree created with 31 total nodes")
    print("Tree structure: MAX -> MIN (2) -> MAX (4) -> MIN (8) -> TERMINAL (16)")
    print("Terminal values: 3, 4, 2, 1, 7, 8, 9, 10, 2, 11, 1, 12, 14, 9, 13, 16")
    print()
    
    # Run Alpha-Beta Pruning
    print("Running Alpha-Beta Pruning...")
    print("-" * 60)
    log = []
    optimal_value = alpha_beta_pruning(
        tree, 
        float('-inf'), 
        float('inf'), 
        True,  # Root is MAX node
        log=log
    )
    print()
    
    # Print execution log
    print("EXECUTION LOG:")
    print("-" * 60)
    for entry in log:
        print(entry)
    print()
    
    # Collect pruned nodes
    pruned_nodes = []
    collect_pruned_nodes(tree, pruned_nodes)
    
    # Print results
    print("=" * 60)
    print("RESULTS:")
    print("=" * 60)
    print(f"✓ Optimal Value (Root): {optimal_value}")
    print(f"✓ Pruned Nodes: {len(pruned_nodes)}")
    print(f"  Node IDs: {sorted(pruned_nodes)}")
    print(f"✓ Efficiency: {len(pruned_nodes)}/31 nodes = {(len(pruned_nodes)/31)*100:.1f}% reduction")
    print("=" * 60)


if __name__ == "__main__":
    main()
