// Predicate class for representing world state facts
export class Predicate {
  constructor(name, x = null, y = null) {
    this.name = name;
    this.x = x;
    this.y = y;
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

  equals(other) {
    return (
      other instanceof Predicate &&
      this.name === other.name &&
      this.x === other.x &&
      this.y === other.y
    );
  }

  // Helper to check if this predicate exists in a state
  static isInState(predicate, state) {
    return state.some(p => predicate.equals(p));
  }

  // Helper to remove a predicate from state
  static removeFromState(predicate, state) {
    return state.filter(p => !predicate.equals(p));
  }

  // Helper to add predicate to state if not exists
  static addToState(predicate, state) {
    if (!Predicate.isInState(predicate, state)) {
      return [...state, predicate];
    }
    return state;
  }
}

// Factory functions for common predicates
export const ON = (x, y) => new Predicate('ON', x, y);
export const ONTABLE = (x) => new Predicate('ONTABLE', x);
export const CLEAR = (x) => new Predicate('CLEAR', x);
export const HOLDING = (x) => new Predicate('HOLDING', x);
export const ARMEMPTY = () => new Predicate('ARMEMPTY');
