import { pred, containsPredicate, stringify, substitute, unify, applyEffects } from './predicate';
import { OPERATORS, instantiateOp } from './operators';

// Planner stack item kinds
// { kind: 'goal', goal: Predicate }
// { kind: 'op', op: InstantiatedOp }

export class GSPPlanner {
  constructor(initialWorld, goals, blocks = ['A','B','C','D']) {
    this.initialWorld = [...initialWorld];
    this.world = [...initialWorld];
    this.goals = goals;
    this.stack = []; // LIFO
    this.plan = []; // sequence of applied operators
  this.regressionPlan = []; // operators chosen during backward reasoning (goal regression order)
    this.log = []; // step-by-step log strings and snapshots
    this.current = null; // current item being processed
    this.done = false;
    this.blocks = blocks;
    this.stepCount = 0;
    this.pushGoals(goals);
  }

  snapshot(note) {
    return {
      note,
      stack: this.stack.map(it => it.kind === 'goal' ? `GOAL: ${stringify(it.goal)}` : `APPLY: ${it.op.name}${this.formatBindings(it.op.bindings)}`),
      world: [...this.world],
      plan: [...this.plan],
    };
  }

  formatBindings(bind) {
    const entries = Object.entries(bind || {});
    if (!entries.length) return '';
    return '(' + entries.map(([k,v]) => `${k}=${v}`).join(', ') + ')';
  }

  pushGoals(goals) {
    // Push in reverse so first goal is processed last pushed -> top
    [...goals].reverse().forEach(g => this.stack.push({ kind: 'goal', goal: g }));
  }

  isSatisfied(g) {
    return containsPredicate(this.world, g);
  }

  // Choose operator and bindings for a goal based on current world
  achieve(goal) {
    const t = goal.type;
    // Heuristics for choosing an operator and bindings
    if (t === 'ON') {
      // Goal: ON(X, Y) -> STACK(X, Y)
      const [X, Y] = goal.args;
      const bindings = { X, Y };
      const op = instantiateOp(OPERATORS.STACK, bindings);
      return op;
    }
    if (t === 'CLEAR') {
      // If CLEAR(X) not true, someone is on X: find Z such that ON(Z, X) is true -> UNSTACK(Z, X)
      const [X] = goal.args;
      const holder = this.world.find(p => p.type === 'ON' && p.args[1] === X);
      if (holder) {
        const Z = holder.args[0];
        return instantiateOp(OPERATORS.UNSTACK, { X: Z, Y: X });
      }
      // otherwise it might already be clear (nothing on X); but if not present in world as CLEAR(X), we can assert if ONTABLE(X) and no ON(Z,X) facts
      return null; // no operator needed; will be treated as satisfied or impossible
    }
    if (t === 'HOLDING') {
      // Try to pick up from table if possible
      const [X] = goal.args;
      if (this.world.some(p => p.type === 'ONTABLE' && p.args[0] === X) &&
          this.world.some(p => p.type === 'CLEAR' && p.args[0] === X) &&
          this.world.some(p => p.type === 'ARMEMPTY')) {
        return instantiateOp(OPERATORS.PICKUP, { X });
      }
      // Else if ON(X, Y) and CLEAR(X) and ARMEMPTY -> UNSTACK(X, Y)
      const on = this.world.find(p => p.type === 'ON' && p.args[0] === X);
      if (on && this.world.some(p => p.type === 'CLEAR' && p.args[0] === X) && this.world.some(p => p.type === 'ARMEMPTY')) {
        return instantiateOp(OPERATORS.UNSTACK, { X, Y: on.args[1] });
      }
      // Otherwise, we may need to clear X or free arm; let planner push subgoals first
      return null;
    }
    if (t === 'ARMEMPTY') {
      // If holding something, put it down
      const holding = this.world.find(p => p.type === 'HOLDING');
      if (holding) {
        return instantiateOp(OPERATORS.PUTDOWN, { X: holding.args[0] });
      }
      return null; // already true
    }
    if (t === 'ONTABLE') {
      const [X] = goal.args;
      const holding = this.world.find(p => p.type === 'HOLDING' && p.args[0] === X);
      if (holding) return instantiateOp(OPERATORS.PUTDOWN, { X });
      // if ON(X, Y), we need to UNSTACK(X, Y) first
      const on = this.world.find(p => p.type === 'ON' && p.args[0] === X);
      if (on && this.world.some(p => p.type === 'ARMEMPTY') && this.world.some(p => p.type === 'CLEAR' && p.args[0] === X)) {
        return instantiateOp(OPERATORS.UNSTACK, { X, Y: on.args[1] });
      }
      return null;
    }
    return null;
  }

  step() {
    // basic loop guard to avoid infinite cycles on adversarial inputs
    this.stepCount++;
    if (this.stepCount > 2000) {
      this.done = true;
      this.log.push(this.snapshot('Stopped: step limit reached (possible loop)'));
      return { done: true };
    }
    if (this.done) return { done: true };
    if (this.stack.length === 0) {
      // Check if all goals satisfied
      const allOk = this.goals.every(g => this.isSatisfied(g));
      this.done = true;
      this.log.push(this.snapshot(allOk ? 'All goals achieved' : 'No more stack items'));
      return { done: true };
    }

    const item = this.stack.pop();
    this.current = item;

    if (item.kind === 'goal') {
      const g = item.goal;
      if (this.isSatisfied(g)) {
        this.log.push(this.snapshot(`Goal satisfied: ${stringify(g)}`));
        return { done: false };
      }
  const op = this.achieve(g);
      if (!op) {
        // Special handling for HOLDING goal: if arm not empty, push ARMEMPTY as subgoal.
        if (g.type === 'HOLDING') {
          const X = g.args[0];
          const armEmpty = this.world.some(p => p.type === 'ARMEMPTY');
          if (!armEmpty) {
            this.stack.push({ kind: 'goal', goal: pred('ARMEMPTY') });
            this.log.push(this.snapshot(`Need ARMEMPTY to achieve HOLDING(${X}), pushing subgoal ARMEMPTY`));
            return { done: false };
          }
          // If X is on something but not CLEAR, we must clear X first
          const onX = this.world.find(p => p.type === 'ON' && p.args[0] === X);
          const clearX = this.world.some(p => p.type === 'CLEAR' && p.args[0] === X);
          if (onX && !clearX) {
            this.stack.push({ kind: 'goal', goal: pred('CLEAR', X) });
            this.log.push(this.snapshot(`Need CLEAR(${X}) to unstack, pushing subgoal CLEAR(${X})`));
            return { done: false };
          }
        }
        // If goal is CLEAR(X) and nothing on X, we can assert CLEAR(X) by inference
        if (g.type === 'CLEAR') {
          const X = g.args[0];
          const occupied = this.world.some(p => p.type === 'ON' && p.args[1] === X);
          if (!occupied) {
            if (!this.world.some(p => p.type === 'CLEAR' && p.args[0] === X)) {
              this.world = [...this.world, pred('CLEAR', X)];
              this.log.push(this.snapshot(`Infer CLEAR(${X}) as nothing on it`));
            }
            return { done: false };
          }
        }
        this.log.push(this.snapshot(`No operator to achieve ${stringify(g)} right now`));
        return { done: false };
    }
    // Record operator in regression order (backward reasoning order)
    this.regressionPlan.push(op);
    // Push operator application marker (linking it to the goal), then preconditions as goals
    this.stack.push({ kind: 'op', op, forGoal: g });
      // push preconditions (substituted already)
      [...op.preconds].reverse().forEach(pc => this.stack.push({ kind: 'goal', goal: pc }));
      this.log.push(this.snapshot(`Decompose goal ${stringify(g)} using ${op.name}${this.formatBindings(op.bindings)}`));
      return { done: false };
    }

    if (item.kind === 'op') {
      const op = item.op;
      const forGoal = item.forGoal;
      // Check if preconditions satisfied
      const ok = op.preconds.every(pc => this.isSatisfied(pc));
      if (!ok) {
        // Re-push op and missing preconditions
        this.stack.push({ kind: 'op', op, forGoal });
        op.preconds.filter(pc => !this.isSatisfied(pc)).forEach(pc => this.stack.push({ kind: 'goal', goal: pc }));
        this.log.push(this.snapshot(`Preconditions not met for ${op.name}, pushing missing goals`));
        return { done: false };
      }
      // Before applying, check if operator makes progress toward any outstanding goal.
      const outstandingGoals = this.stack.filter(s => s.kind === 'goal').map(s => stringify(s.goal));
      const plannerGoals = this.goals.map(g => stringify(g)).filter(g => !this.isSatisfied(g));
      const helpsGoal = op.add.some(a => {
        const sa = stringify(a);
        if (forGoal && sa === stringify(forGoal)) return true;
        return outstandingGoals.includes(sa) || plannerGoals.includes(sa);
      });

      if (!helpsGoal) {
        // If operator doesn't help any outstanding or desired final goals, skip applying to avoid loops
        this.log.push(this.snapshot(`Skipped redundant operator ${op.name}${this.formatBindings(op.bindings)}`));
        return { done: false };
      }

      // Apply effects
      this.world = applyEffects(this.world, op.add, op.del);
      this.plan.push(op);
      this.log.push(this.snapshot(`Applied ${op.name}${this.formatBindings(op.bindings)}`));
      return { done: false };
    }
  }
}

// Default scenario builder based on PRD
export function defaultScenario() {
  const initial = [
    pred('ON', 'B', 'A'),
    pred('ONTABLE', 'A'),
    pred('ONTABLE', 'C'),
    pred('ONTABLE', 'D'),
    pred('CLEAR', 'B'),
    pred('CLEAR', 'C'),
    pred('CLEAR', 'D'),
    pred('ARMEMPTY'),
  ];

  const goals = [
    pred('ON', 'C', 'A'),
    pred('ON', 'B', 'D'),
    pred('ONTABLE', 'A'),
    pred('ONTABLE', 'D'),
    pred('CLEAR', 'B'),
    pred('CLEAR', 'C'),
    pred('ARMEMPTY'),
  ];

  return { initial, goals, blocks: ['A','B','C','D'] };
}
