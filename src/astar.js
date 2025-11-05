// A* Algorithm Implementation for Missionaries and Cannibals Problem

export class State {
  constructor(missionaries, cannibals, boat, parent = null, action = '') {
    this.missionaries = missionaries; // missionaries on left bank
    this.cannibals = cannibals; // cannibals on left bank
    this.boat = boat; // 0 = left, 1 = right
    this.parent = parent;
    this.action = action;
    this.g = parent ? parent.g + 1 : 0; // cost from start
    this.h = this.calculateHeuristic(); // heuristic to goal
    this.f = this.g + this.h; // total cost
  }

  calculateHeuristic() {
    // Simple heuristic: number of people still on left bank
    return this.missionaries + this.cannibals;
  }

  getKey() {
    return `${this.missionaries}-${this.cannibals}-${this.boat}`;
  }

  isGoal() {
    return this.missionaries === 0 && this.cannibals === 0 && this.boat === 1;
  }

  isValid(totalM, totalC) {
    // Check if state is within bounds
    if (this.missionaries < 0 || this.cannibals < 0) return false;
    if (this.missionaries > totalM || this.cannibals > totalC) return false;

    const rightM = totalM - this.missionaries;
    const rightC = totalC - this.cannibals;

    // Check if cannibals outnumber missionaries on either side
    if (this.missionaries > 0 && this.cannibals > this.missionaries) return false;
    if (rightM > 0 && rightC > rightM) return false;

    return true;
  }

  equals(other) {
    return this.missionaries === other.missionaries &&
           this.cannibals === other.cannibals &&
           this.boat === other.boat;
  }
}

export class AStarSolver {
  constructor(totalMissionaries = 3, totalCannibals = 3) {
    this.totalM = totalMissionaries;
    this.totalC = totalCannibals;
    this.openList = [];
    this.closedList = [];
    this.currentState = null;
    this.goalReached = false;
    this.stepHistory = [];
  }

  initialize() {
    const initialState = new State(this.totalM, this.totalC, 0);
    this.openList = [initialState];
    this.closedList = [];
    this.currentState = initialState;
    this.goalReached = false;
    this.stepHistory = [{
      action: 'Initialize',
      state: initialState,
      openList: [...this.openList],
      closedList: [...this.closedList],
      explanation: `Starting state: ${this.totalM} missionaries and ${this.totalC} cannibals on left bank. Boat on left. Goal: Move everyone to right bank.`
    }];
  }

  getSuccessors(state) {
    const successors = [];
    const moves = [
      [1, 0], // 1 missionary
      [2, 0], // 2 missionaries
      [0, 1], // 1 cannibal
      [0, 2], // 2 cannibals
      [1, 1]  // 1 missionary and 1 cannibal
    ];

    for (const [m, c] of moves) {
      let newState;
      let action;

      if (state.boat === 0) {
        // Boat on left, move to right
        newState = new State(
          state.missionaries - m,
          state.cannibals - c,
          1,
          state,
          `Move ${m}M ${c}C to right`
        );
        action = `${m} missionary(ies) and ${c} cannibal(s) → right`;
      } else {
        // Boat on right, move to left
        newState = new State(
          state.missionaries + m,
          state.cannibals + c,
          0,
          state,
          `Move ${m}M ${c}C to left`
        );
        action = `${m} missionary(ies) and ${c} cannibal(s) ← left`;
      }

      newState.action = action;

      if (newState.isValid(this.totalM, this.totalC)) {
        successors.push(newState);
      }
    }

    return successors;
  }

  step() {
    if (this.goalReached || this.openList.length === 0) {
      return null;
    }

    // Find state with lowest f value
    this.openList.sort((a, b) => a.f - b.f);
    this.currentState = this.openList.shift();

    // Add to closed list
    this.closedList.push(this.currentState);

    // Check if goal
    if (this.currentState.isGoal()) {
      this.goalReached = true;
      this.stepHistory.push({
        action: 'Goal Reached',
        state: this.currentState,
        openList: [...this.openList],
        closedList: [...this.closedList],
        explanation: `🎉 Goal reached! All ${this.totalM} missionaries and ${this.totalC} cannibals safely crossed to the right bank in ${this.currentState.g} steps.`
      });
      return this.currentState;
    }

    // Generate successors
    const successors = this.getSuccessors(this.currentState);
    let explanation = `Expanding state (${this.currentState.missionaries}M, ${this.currentState.cannibals}C, ${this.currentState.boat === 0 ? 'Left' : 'Right'}). `;
    explanation += `Cost g=${this.currentState.g}, Heuristic h=${this.currentState.h}, Total f=${this.currentState.f}. `;
    explanation += `Generated ${successors.length} valid successor(s).`;

    // Add successors to open list if not in closed list
    for (const successor of successors) {
      const inClosed = this.closedList.some(s => s.equals(successor));
      const inOpen = this.openList.find(s => s.equals(successor));

      if (!inClosed) {
        if (!inOpen) {
          this.openList.push(successor);
        } else if (successor.g < inOpen.g) {
          // Found better path
          inOpen.g = successor.g;
          inOpen.f = successor.g + inOpen.h;
          inOpen.parent = successor.parent;
        }
      }
    }

    this.stepHistory.push({
      action: this.currentState.action,
      state: this.currentState,
      openList: [...this.openList],
      closedList: [...this.closedList],
      explanation
    });

    return this.currentState;
  }

  getSolutionPath() {
    if (!this.goalReached) return [];

    const path = [];
    let current = this.currentState;

    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }

  reset() {
    this.initialize();
  }

  // Manual move method for user-controlled gameplay
  makeManualMove(missionaries, cannibals) {
    if (this.goalReached) return { success: false, lost: false };

    const currentState = this.currentState;
    let newState;

    if (currentState.boat === 0) {
      // Boat on left, move to right
      newState = new State(
        currentState.missionaries - missionaries,
        currentState.cannibals - cannibals,
        1,
        currentState,
        `Manual: Move ${missionaries}M ${cannibals}C to right`
      );
    } else {
      // Boat on right, move to left
      newState = new State(
        currentState.missionaries + missionaries,
        currentState.cannibals + cannibals,
        0,
        currentState,
        `Manual: Move ${missionaries}M ${cannibals}C to left`
      );
    }

    // Check if valid
    if (!newState.isValid(this.totalM, this.totalC)) {
      return { success: false, lost: true };
    }

    // Update state
    this.currentState = newState;
    
    // Add to closed list
    this.closedList.push(newState);

    // Check if goal reached
    if (newState.isGoal()) {
      this.goalReached = true;
    }

    // Add to step history
    const action = currentState.boat === 0 
      ? `Move ${missionaries} missionary(ies) and ${cannibals} cannibal(s) → right`
      : `Move ${missionaries} missionary(ies) and ${cannibals} cannibal(s) ← left`;

    this.stepHistory.push({
      action: action,
      state: newState,
      openList: [...this.openList],
      closedList: [...this.closedList],
      explanation: `Manual move: ${action}. New state: (${newState.missionaries}M, ${newState.cannibals}C, ${newState.boat === 0 ? 'Left' : 'Right'}). Cost g=${newState.g}, Heuristic h=${newState.h}.`
    });

    return { success: true, lost: false };
  }
}
