import { Predicate, ON, ONTABLE, CLEAR, HOLDING, ARMEMPTY } from './predicate';

// Operator class representing an action
export class Operator {
  constructor(name, x = null, y = null) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.preconds = [];
    this.addEffects = [];
    this.deleteEffects = [];
  }

  toString() {
    if (this.x === null && this.y === null) {
      return this.name;
    }
    if (this.y === null) {
      return `${this.name}(${this.x})`;
    }
    return `${this.name}(${this.x},${this.y})`;
  }

  // Check if all preconditions are satisfied in state
  arePrecondsSatisfied(state) {
    return this.preconds.every(precond => 
      Predicate.isInState(precond, state)
    );
  }

  // Apply operator effects to state
  apply(state) {
    let newState = [...state];
    
    // Remove delete effects
    this.deleteEffects.forEach(del => {
      newState = Predicate.removeFromState(del, newState);
    });
    
    // Add add effects
    this.addEffects.forEach(add => {
      newState = Predicate.addToState(add, newState);
    });
    
    return newState;
  }
}

// PICKUP(x): Pick up block x from table
export function PICKUP(x) {
  const op = new Operator('PICKUP', x);
  op.preconds = [ONTABLE(x), CLEAR(x), ARMEMPTY()];
  op.addEffects = [HOLDING(x)];
  op.deleteEffects = [ONTABLE(x), CLEAR(x), ARMEMPTY()];
  return op;
}

// PUTDOWN(x): Put down block x onto table
export function PUTDOWN(x) {
  const op = new Operator('PUTDOWN', x);
  op.preconds = [HOLDING(x)];
  op.addEffects = [ONTABLE(x), CLEAR(x), ARMEMPTY()];
  op.deleteEffects = [HOLDING(x)];
  return op;
}

// STACK(x, y): Stack block x on top of block y
export function STACK(x, y) {
  const op = new Operator('STACK', x, y);
  op.preconds = [HOLDING(x), CLEAR(y)];
  op.addEffects = [ON(x, y), CLEAR(x), ARMEMPTY()];
  op.deleteEffects = [HOLDING(x), CLEAR(y)];
  return op;
}

// UNSTACK(x, y): Unstack block x from top of block y
export function UNSTACK(x, y) {
  const op = new Operator('UNSTACK', x, y);
  op.preconds = [ON(x, y), CLEAR(x), ARMEMPTY()];
  op.addEffects = [HOLDING(x), CLEAR(y)];
  op.deleteEffects = [ON(x, y), CLEAR(x), ARMEMPTY()];
  return op;
}

// Choose appropriate operator for a goal
export function chooseOperator(goal, state, blocks) {
  if (goal.name === 'ON') {
    return STACK(goal.x, goal.y);
  }
  
  if (goal.name === 'ONTABLE') {
    return PUTDOWN(goal.x);
  }
  
  if (goal.name === 'CLEAR') {
    // Find what block is on top of goal.x
    for (const block of blocks) {
      if (Predicate.isInState(ON(block, goal.x), state)) {
        return UNSTACK(block, goal.x);
      }
    }
    return PUTDOWN(goal.x);
  }
  
  if (goal.name === 'HOLDING') {
    if (Predicate.isInState(ONTABLE(goal.x), state)) {
      return PICKUP(goal.x);
    }
    for (const block of blocks) {
      if (Predicate.isInState(ON(goal.x, block), state)) {
        return UNSTACK(goal.x, block);
      }
    }
    return PICKUP(goal.x);
  }
  
  if (goal.name === 'ARMEMPTY') {
    for (const block of blocks) {
      if (Predicate.isInState(HOLDING(block), state)) {
        return PUTDOWN(block);
      }
    }
    return PUTDOWN(blocks[0]);
  }
  
  return null;
}
