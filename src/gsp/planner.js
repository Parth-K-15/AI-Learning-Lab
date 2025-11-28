import { Predicate } from './predicate';
import { chooseOperator } from './operators';

// Goal Stack Planner with step-by-step tracking
export class GoalStackPlanner {
  constructor(initialState, goalState, blocks) {
    this.initialState = [...initialState];
    this.goalState = [...goalState];
    this.blocks = [...blocks];
    this.reset();
  }

  reset() {
    this.state = [...this.initialState];
    this.stack = [{ type: 'conjunction', goals: [...this.goalState] }];
    this.plan = [];
    this.stepLog = [];
    this.completed = false;
  }

  // Check if goal is satisfied in current state
  isGoalSatisfied(goal) {
    return Predicate.isInState(goal, this.state);
  }

  // Check if all goals in conjunction are satisfied
  areAllGoalsSatisfied(goals) {
    return goals.every(g => this.isGoalSatisfied(g));
  }

  // Execute one step of the planner
  step() {
    if (this.stack.length === 0) {
      this.completed = true;
      this.stepLog.push({
        action: 'complete',
        message: 'Planning complete! All goals achieved.',
        stack: [],
        state: [...this.state],
        plan: [...this.plan]
      });
      return { done: true };
    }

    const top = this.stack.pop();

    // Handle conjunction of goals
    if (top.type === 'conjunction') {
      const unsatisfied = top.goals.filter(g => !this.isGoalSatisfied(g));
      
      if (unsatisfied.length === 0) {
        this.stepLog.push({
          action: 'conjunction_satisfied',
          message: `All goals in conjunction already satisfied`,
          goals: top.goals.map(g => g.toString()),
          stack: this.getStackSnapshot(),
          state: [...this.state]
        });
        return { done: false };
      }

      // Push conjunction back, then push unsatisfied goals
      this.stack.push(top);
      unsatisfied.forEach(g => {
        this.stack.push({ type: 'goal', goal: g });
      });

      this.stepLog.push({
        action: 'push_unsatisfied',
        message: `Found ${unsatisfied.length} unsatisfied goal(s)`,
        unsatisfied: unsatisfied.map(g => g.toString()),
        stack: this.getStackSnapshot(),
        state: [...this.state]
      });
      return { done: false };
    }

    // Handle single goal
    if (top.type === 'goal') {
      const goal = top.goal;

      if (this.isGoalSatisfied(goal)) {
        this.stepLog.push({
          action: 'goal_satisfied',
          message: `Goal ${goal.toString()} already satisfied`,
          goal: goal.toString(),
          stack: this.getStackSnapshot(),
          state: [...this.state]
        });
        return { done: false };
      }

      // Choose operator to achieve goal
      const operator = chooseOperator(goal, this.state, this.blocks);
      
      this.stepLog.push({
        action: 'choose_operator',
        message: `Chose operator ${operator.toString()} for goal ${goal.toString()}`,
        goal: goal.toString(),
        operator: operator.toString(),
        stack: this.getStackSnapshot(),
        state: [...this.state]
      });

      // Push operator onto stack
      this.stack.push({ type: 'operator', operator: operator });
      return { done: false };
    }

    // Handle operator
    if (top.type === 'operator') {
      const operator = top.operator;

      // Check if preconditions are satisfied
      if (!operator.arePrecondsSatisfied(this.state)) {
        const unsatisfiedPreconds = operator.preconds.filter(
          p => !Predicate.isInState(p, this.state)
        );

        this.stack.push(top); // Push operator back
        unsatisfiedPreconds.forEach(p => {
          this.stack.push({ type: 'goal', goal: p });
        });

        this.stepLog.push({
          action: 'push_preconditions',
          message: `Operator ${operator.toString()} needs preconditions`,
          operator: operator.toString(),
          preconditions: unsatisfiedPreconds.map(p => p.toString()),
          stack: this.getStackSnapshot(),
          state: [...this.state]
        });
        return { done: false };
      }

      // Apply operator
      this.state = operator.apply(this.state);
      this.plan.push(operator);

      this.stepLog.push({
        action: 'apply_operator',
        message: `Applied operator ${operator.toString()}`,
        operator: operator.toString(),
        stack: this.getStackSnapshot(),
        state: [...this.state],
        plan: [...this.plan]
      });
      return { done: false };
    }

    return { done: false };
  }

  // Get snapshot of current stack for visualization
  getStackSnapshot() {
    return this.stack.map(item => {
      if (item.type === 'conjunction') {
        return {
          type: 'conjunction',
          goals: item.goals.map(g => g.toString())
        };
      }
      if (item.type === 'goal') {
        return {
          type: 'goal',
          goal: item.goal.toString()
        };
      }
      if (item.type === 'operator') {
        return {
          type: 'operator',
          operator: item.operator.toString()
        };
      }
      return item;
    });
  }

  // Run planner to completion
  solve() {
    this.reset();
    let iterations = 0;
    const maxIterations = 1000;

    while (!this.completed && iterations < maxIterations) {
      const result = this.step();
      if (result.done) break;
      iterations++;
    }

    return {
      plan: this.plan,
      steps: this.stepLog,
      success: this.completed
    };
  }
}
