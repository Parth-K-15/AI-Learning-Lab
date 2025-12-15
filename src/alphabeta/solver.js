// Alpha-Beta Pruning Solver
export class AlphaBetaSolver {
  constructor(root) {
    this.root = root;
    this.evaluationLog = [];
    this.prunedNodes = [];
    this.evaluatedLeaves = [];
    this.currentNode = null;
    this.isComplete = false;
    this.optimalValue = null;
    this.totalNodes = 0;
    this.evaluatedNodes = 0;
    
    // For step-by-step execution
    this.executionStack = [];
    this.stepIndex = 0;
    this.isInitialized = false;
  }

  initialize() {
    this.evaluationLog = [];
    this.prunedNodes = [];
    this.evaluatedLeaves = [];
    this.isComplete = false;
    this.optimalValue = null;
    this.stepIndex = 0;
    
    // Count total nodes
    this.totalNodes = this.countNodes(this.root);
    this.evaluatedNodes = 0;
    
    // Prepare execution stack for step-by-step
    this.prepareExecution();
    this.isInitialized = true;
  }

  countNodes(node) {
    if (!node) return 0;
    let count = 1;
    node.children.forEach(child => {
      count += this.countNodes(child);
    });
    return count;
  }

  prepareExecution() {
    // Generate all execution steps
    this.executionStack = [];
    this.generateSteps(this.root, -Infinity, Infinity, true);
  }

  generateSteps(node, alpha, beta, isRoot = false) {
    // Add step for visiting this node
    this.executionStack.push({
      type: 'visit',
      node: node,
      alpha: alpha,
      beta: beta,
      message: `Visiting ${node.type} node ${node.id}`
    });

    if (node.type === 'TERMINAL') {
      // Terminal node - return its value
      this.executionStack.push({
        type: 'evaluate',
        node: node,
        value: node.value,
        alpha: alpha,
        beta: beta,
        message: `Terminal node: value = ${node.value}`
      });
      return node.value;
    }

    if (node.type === 'MAX') {
      let value = -Infinity;
      let localAlpha = alpha;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        
        // Check if we should prune
        if (localAlpha >= beta) {
          // Prune remaining children
          for (let j = i; j < node.children.length; j++) {
            this.executionStack.push({
              type: 'prune',
              node: node.children[j],
              alpha: localAlpha,
              beta: beta,
              reason: `α (${localAlpha}) ≥ β (${beta})`,
              message: `Pruning subtree at node ${node.children[j].id}: α ≥ β`
            });
          }
          break;
        }

        const childValue = this.generateSteps(child, localAlpha, beta);
        
        this.executionStack.push({
          type: 'update_max',
          node: node,
          oldValue: value,
          childValue: childValue,
          newValue: Math.max(value, childValue),
          alpha: localAlpha,
          beta: beta,
          message: `MAX node ${node.id}: value = max(${value === -Infinity ? '-∞' : value}, ${childValue}) = ${Math.max(value, childValue)}`
        });

        value = Math.max(value, childValue);
        
        if (value > localAlpha) {
          this.executionStack.push({
            type: 'update_alpha',
            node: node,
            oldAlpha: localAlpha,
            newAlpha: value,
            beta: beta,
            message: `Updating α: ${localAlpha === -Infinity ? '-∞' : localAlpha} → ${value}`
          });
          localAlpha = value;
        }
      }

      return value;
    } else { // MIN node
      let value = Infinity;
      let localBeta = beta;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        
        // Check if we should prune
        if (localBeta <= alpha) {
          // Prune remaining children
          for (let j = i; j < node.children.length; j++) {
            this.executionStack.push({
              type: 'prune',
              node: node.children[j],
              alpha: alpha,
              beta: localBeta,
              reason: `β (${localBeta}) ≤ α (${alpha})`,
              message: `Pruning subtree at node ${node.children[j].id}: β ≤ α`
            });
          }
          break;
        }

        const childValue = this.generateSteps(child, alpha, localBeta);
        
        this.executionStack.push({
          type: 'update_min',
          node: node,
          oldValue: value,
          childValue: childValue,
          newValue: Math.min(value, childValue),
          alpha: alpha,
          beta: localBeta,
          message: `MIN node ${node.id}: value = min(${value === Infinity ? '+∞' : value}, ${childValue}) = ${Math.min(value, childValue)}`
        });

        value = Math.min(value, childValue);
        
        if (value < localBeta) {
          this.executionStack.push({
            type: 'update_beta',
            node: node,
            oldBeta: localBeta,
            newBeta: value,
            alpha: alpha,
            message: `Updating β: ${localBeta === Infinity ? '+∞' : localBeta} → ${value}`
          });
          localBeta = value;
        }
      }

      return value;
    }
  }

  markSubtreeAsPruned(node) {
    node.isPruned = true;
    node.children.forEach(child => this.markSubtreeAsPruned(child));
  }

  step() {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (this.stepIndex >= this.executionStack.length) {
      this.isComplete = true;
      return {
        done: true,
        currentStep: null,
        log: this.evaluationLog,
        prunedNodes: this.prunedNodes,
        optimalValue: this.optimalValue
      };
    }

    const currentStep = this.executionStack[this.stepIndex];
    this.processStep(currentStep);
    this.stepIndex++;

    // Check if this is the last step
    if (this.stepIndex >= this.executionStack.length) {
      this.isComplete = true;
    }

    return {
      done: this.isComplete,
      currentStep: currentStep,
      log: this.evaluationLog,
      prunedNodes: this.prunedNodes,
      evaluatedLeaves: this.evaluatedLeaves,
      optimalValue: this.optimalValue
    };
  }

  processStep(step) {
    // Update current node
    if (this.currentNode) {
      this.currentNode.isCurrent = false;
    }
    this.currentNode = step.node;
    this.currentNode.isCurrent = true;

    // Update alpha and beta for the node
    step.node.alpha = step.alpha;
    step.node.beta = step.beta;

    // Process based on step type
    switch (step.type) {
      case 'visit':
        this.evaluationLog.push({
          type: 'info',
          message: step.message,
          nodeId: step.node.id,
          alpha: step.alpha,
          beta: step.beta
        });
        break;

      case 'evaluate':
        step.node.isEvaluated = true;
        step.node.value = step.value;
        this.evaluatedNodes++;
        this.evaluatedLeaves.push(step.node.id);
        this.evaluationLog.push({
          type: 'evaluate',
          message: step.message,
          nodeId: step.node.id,
          value: step.value
        });
        break;

      case 'update_max':
      case 'update_min':
        step.node.value = step.newValue;
        this.evaluationLog.push({
          type: 'update',
          message: step.message,
          nodeId: step.node.id,
          value: step.newValue
        });
        break;

      case 'update_alpha':
        step.node.alpha = step.newAlpha;
        this.evaluationLog.push({
          type: 'alpha',
          message: step.message,
          nodeId: step.node.id,
          alpha: step.newAlpha
        });
        break;

      case 'update_beta':
        step.node.beta = step.newBeta;
        this.evaluationLog.push({
          type: 'beta',
          message: step.message,
          nodeId: step.node.id,
          beta: step.newBeta
        });
        break;

      case 'prune':
        // Mark the entire subtree as pruned when we encounter it
        this.markSubtreeAsPruned(step.node);
        this.prunedNodes.push(step.node.id);
        this.evaluationLog.push({
          type: 'prune',
          message: step.message,
          nodeId: step.node.id,
          reason: step.reason
        });
        break;
    }

    // If we're at the root and have a value, that's our optimal value
    if (step.node.id === 0 && step.node.value !== null && step.node.value !== undefined) {
      this.optimalValue = step.node.value;
    }
  }

  // Complete solution in one go
  solve() {
    if (!this.isInitialized) {
      this.initialize();
    }

    while (this.stepIndex < this.executionStack.length) {
      this.step();
    }

    return {
      success: true,
      optimalValue: this.optimalValue,
      prunedNodes: this.prunedNodes,
      evaluatedLeaves: this.evaluatedLeaves,
      evaluationLog: this.evaluationLog,
      totalNodes: this.totalNodes,
      evaluatedNodes: this.evaluatedNodes
    };
  }

  reset() {
    this.initialize();
  }
}
