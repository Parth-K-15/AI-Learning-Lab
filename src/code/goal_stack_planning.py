from dataclasses import dataclass, field
from typing import Optional, List, Set, Tuple, Union

# ---------- Predicate & Action definitions ----------

@dataclass(frozen=True)
class Predicate:
    name: str
    x: Optional[str] = None
    y: Optional[str] = None

    def __str__(self):
        if self.x is None:
            return self.name
        if self.y is None:
            return f"{self.name}({self.x})"
        return f"{self.name}({self.x},{self.y})"


@dataclass
class Action:
    name: str
    x: Optional[str] = None
    y: Optional[str] = None
    preconds: Set[Predicate] = field(default_factory=set)
    add: Set[Predicate] = field(default_factory=set)
    delete: Set[Predicate] = field(default_factory=set)

    def __str__(self):
        if self.x is None:
            return self.name
        if self.y is None:
            return f"{self.name}({self.x})"
        return f"{self.name}({self.x},{self.y})"


# ---------- Helpers to build predicates ----------

def ON(x, y): return Predicate("ON", x, y)
def ONTABLE(x): return Predicate("ONTABLE", x)
def CLEAR(x): return Predicate("CLEAR", x)
def HOLDING(x): return Predicate("HOLDING", x)
def ARMEMPTY(): return Predicate("ARMEMPTY")


# ---------- Action constructors ----------

def act_pickup(x: str) -> Action:
    pre = {ONTABLE(x), CLEAR(x), ARMEMPTY()}
    add = {HOLDING(x)}
    delete = {ONTABLE(x), CLEAR(x), ARMEMPTY()}
    return Action("PICKUP", x=x, preconds=pre, add=add, delete=delete)


def act_putdown(x: str) -> Action:
    pre = {HOLDING(x)}
    add = {ONTABLE(x), CLEAR(x), ARMEMPTY()}
    delete = {HOLDING(x)}
    return Action("PUTDOWN", x=x, preconds=pre, add=add, delete=delete)


def act_unstack(x: str, y: str) -> Action:
    pre = {ON(x, y), CLEAR(x), ARMEMPTY()}
    add = {HOLDING(x), CLEAR(y)}
    delete = {ON(x, y), CLEAR(x), ARMEMPTY()}
    return Action("UNSTACK", x=x, y=y, preconds=pre, add=add, delete=delete)


def act_stack(x: str, y: str) -> Action:
    pre = {HOLDING(x), CLEAR(y)}
    add = {ON(x, y), CLEAR(x), ARMEMPTY()}
    delete = {HOLDING(x), CLEAR(y)}
    return Action("STACK", x=x, y=y, preconds=pre, add=add, delete=delete)


GoalOrAction = Union[Predicate, Action, Tuple[Predicate, ...]]


# ---------- Goal Stack Planner WITH INTERMEDIATE STEPS ----------

def goal_stack_planner(initial_state, goal_state, blocks):
    state = set(initial_state)
    stack: List[GoalOrAction] = [tuple(goal_state)]
    plan: List[Action] = []

    print("\n========= INITIAL STATE =========")
    for s in state: print(s)
    print("\n========= GOAL STATE =========")
    for g in goal_state: print(g)
    print("\n========= PLANNING PROCESS =========")

    def choose_action(goal, state):
        if goal.name == "ON":
            return act_stack(goal.x, goal.y)
        if goal.name == "ONTABLE":
            return act_putdown(goal.x)
        if goal.name == "CLEAR":
            for b in blocks:
                if ON(b, goal.x) in state:
                    return act_unstack(b, goal.x)
            return act_putdown(goal.x)
        if goal.name == "HOLDING":
            if ONTABLE(goal.x) in state:
                return act_pickup(goal.x)
            for b in blocks:
                if ON(goal.x, b) in state:
                    return act_unstack(goal.x, b)
            return act_pickup(goal.x)
        if goal.name == "ARMEMPTY":
            for b in blocks:
                if HOLDING(b) in state:
                    return act_putdown(b)
            return act_putdown(blocks[0])

    while stack:
        top = stack.pop()
        print("\nCurrent Stack:", stack)
        print("Popped:", top)

        if isinstance(top, Action):
            if not top.preconds.issubset(state):
                missing = list(top.preconds - state)
                stack.append(top)
                stack.extend(missing)
                print("→ Action needs preconditions:", [str(p) for p in missing])
            else:
                state -= top.delete
                state |= top.add
                plan.append(top)
                print(f"✓ Executing: {top}")
                print("Updated State:", {str(s) for s in state})
        elif isinstance(top, tuple):
            unsatisfied = [g for g in top if g not in state]
            if unsatisfied:
                stack.append(top)
                stack.extend(unsatisfied)
                print("→ Unsatisfied goals:", [str(x) for x in unsatisfied])
        else:
            if top not in state:
                action = choose_action(top, state)
                stack.append(action)
                print(f"→ Selecting action: {action}")
            else:
                print(f"✓ Goal {top} already satisfied.")

    return plan


# ---------- EXAMPLE ----------

if __name__ == "__main__":
    blocks = ["A", "B", "C"]

    initial_state = {
        ONTABLE("A"), ON("B", "A"), ONTABLE("C"),
        CLEAR("B"), CLEAR("C"), ARMEMPTY()
    }

    goal_state = {
        ON("A", "B"), ON("B", "C"), ONTABLE("C"), ARMEMPTY()
    }

    plan = goal_stack_planner(initial_state, goal_state, blocks)

    print("\n========= FINAL PLAN =========")
    for i, act in enumerate(plan, 1):
        print(f"{i}. {act}")
