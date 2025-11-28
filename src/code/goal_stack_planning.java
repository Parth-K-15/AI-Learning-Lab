import java.util.*;

// -------------------- Predicate Class --------------------
class Predicate {
    String name, X, Y;

    Predicate(String name, String x, String y) {
        this.name = name;
        this.X = x;
        this.Y = y;
    }

    Predicate(String name) {
        this(name, "", "");
    }

    @Override
    public String toString() {
        if (X.equals("") && Y.equals("")) return name;
        if (Y.equals("")) return name + "(" + X + ")";
        return name + "(" + X + "," + Y + ")";
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Predicate)) return false;
        return this.toString().equals(o.toString());
    }

    @Override
    public int hashCode() {
        return toString().hashCode();
    }
}

// ------------------ Action Class -------------------
class Action {
    String name, X, Y;
    Set<Predicate> preconds = new HashSet<>();
    Set<Predicate> add = new HashSet<>();
    Set<Predicate> del = new HashSet<>();

    Action(String name, String x, String y) {
        this.name = name;
        this.X = x;
        this.Y = y;
    }

    Action(String name, String x) {
        this(name, x, "");
    }

    @Override
    public String toString() {
        if (X.equals("") && Y.equals("")) return name;
        if (Y.equals("")) return name + "(" + X + ")";
        return name + "(" + X + "," + Y + ")";
    }
}

// -------------------- Helpers for Predicates --------------------
class Predicates {
    static Predicate ON(String x, String y) { return new Predicate("ON", x, y); }
    static Predicate ONTABLE(String x) { return new Predicate("ONTABLE", x, ""); }
    static Predicate CLEAR(String x) { return new Predicate("CLEAR", x, ""); }
    static Predicate HOLDING(String x) { return new Predicate("HOLDING", x, ""); }
    static Predicate ARMEMPTY() { return new Predicate("ARMEMPTY", "", ""); }
}

// -------------------- Action Generators --------------------
class Actions {
    static Action PICKUP(String x) {
        Action a = new Action("PICKUP", x);
        a.preconds.add(Predicates.ONTABLE(x));
        a.preconds.add(Predicates.CLEAR(x));
        a.preconds.add(Predicates.ARMEMPTY());
        a.add.add(Predicates.HOLDING(x));
        a.del.add(Predicates.ONTABLE(x));
        a.del.add(Predicates.CLEAR(x));
        a.del.add(Predicates.ARMEMPTY());
        return a;
    }

    static Action PUTDOWN(String x) {
        Action a = new Action("PUTDOWN", x);
        a.preconds.add(Predicates.HOLDING(x));
        a.add.add(Predicates.ONTABLE(x));
        a.add.add(Predicates.CLEAR(x));
        a.add.add(Predicates.ARMEMPTY());
        a.del.add(Predicates.HOLDING(x));
        return a;
    }

    static Action UNSTACK(String x, String y) {
        Action a = new Action("UNSTACK", x, y);
        a.preconds.add(Predicates.ON(x, y));
        a.preconds.add(Predicates.CLEAR(x));
        a.preconds.add(Predicates.ARMEMPTY());
        a.add.add(Predicates.HOLDING(x));
        a.add.add(Predicates.CLEAR(y));
        a.del.add(Predicates.ON(x, y));
        a.del.add(Predicates.CLEAR(x));
        a.del.add(Predicates.ARMEMPTY());
        return a;
    }

    static Action STACK(String x, String y) {
        Action a = new Action("STACK", x, y);
        a.preconds.add(Predicates.HOLDING(x));
        a.preconds.add(Predicates.CLEAR(y));
        a.add.add(Predicates.ON(x, y));
        a.add.add(Predicates.CLEAR(x));
        a.add.add(Predicates.ARMEMPTY());
        a.del.add(Predicates.HOLDING(x));
        a.del.add(Predicates.CLEAR(y));
        return a;
    }
}

// -------------------- GSP Algorithm --------------------
public class GoalStackPlanner {

    static Action chooseAction(Predicate g, Set<Predicate> state, List<String> blocks) {
        if (g.name.equals("ON")) return Actions.STACK(g.X, g.Y);
        if (g.name.equals("ONTABLE")) return Actions.PUTDOWN(g.X);
        if (g.name.equals("CLEAR")) {
            for (String b : blocks) {
                if (state.contains(Predicates.ON(b, g.X))) 
                    return Actions.UNSTACK(b, g.X);
            }
            return Actions.PUTDOWN(g.X);
        }
        if (g.name.equals("HOLDING")) {
            if (state.contains(Predicates.ONTABLE(g.X))) return Actions.PICKUP(g.X);
            for (String b : blocks) {
                if (state.contains(Predicates.ON(g.X, b)))
                    return Actions.UNSTACK(g.X, b);
            }
            return Actions.PICKUP(g.X);
        }
        if (g.name.equals("ARMEMPTY")) {
            for (String b : blocks) {
                if (state.contains(Predicates.HOLDING(b)))
                    return Actions.PUTDOWN(b);
            }
            return Actions.PUTDOWN(blocks.get(0));
        }
        return null;
    }

    public static List<Action> plan(Set<Predicate> init, Set<Predicate> goal, List<String> blocks) {
        Set<Predicate> state = new HashSet<>(init);
        Stack<List<Predicate>> stack = new Stack<>();
        stack.push(new ArrayList<>(goal));
        List<Action> plan = new ArrayList<>();

        System.out.println("\n===== INITIAL STATE =====");
        state.forEach(s -> System.out.println(s));

        System.out.println("\n===== GOAL STATE =====");
        goal.forEach(g -> System.out.println(g));

        System.out.println("\n===== PLANNING PROCESS =====");

        while (!stack.isEmpty()) {
            List<Predicate> top = stack.pop();

            if (top.size() > 1) { // Conjunction
                List<Predicate> unsatisfied = new ArrayList<>();
                for (Predicate g : top)
                    if (!state.contains(g)) unsatisfied.add(g);

                if (!unsatisfied.isEmpty()) {
                    stack.push(top);
                    for (Predicate g : unsatisfied)
                        stack.push(Collections.singletonList(g));

                    System.out.print("→ Unsatisfied goals: ");
                    unsatisfied.forEach(x -> System.out.print(x + " "));
                    System.out.println();
                }
            } else { // Single Goal
                Predicate g = top.get(0);
                if (state.contains(g)) {
                    System.out.println("✓ Already satisfied: " + g);
                    continue;
                }

                Action action = chooseAction(g, state, blocks);
                System.out.println("→ Choosing action: " + action);

                boolean precondsMet = true;
                for (Predicate p : action.preconds)
                    if (!state.contains(p)) precondsMet = false;

                if (!precondsMet) {
                    System.out.print("→ Pushing missing preconditions: ");
                    stack.push(top);
                    for (Predicate p : action.preconds) {
                        if (!state.contains(p)) {
                            stack.push(Collections.singletonList(p));
                            System.out.print(p + " ");
                        }
                    }
                    System.out.println();
                } else {
                    state.removeAll(action.del);
                    state.addAll(action.add);
                    plan.add(action);

                    System.out.println("✓ Executing: " + action);
                    System.out.print("Updated State: { ");
                    state.forEach(s -> System.out.print(s + " "));
                    System.out.println("}");
                }
            }
        }
        return plan;
    }

    // -------------------- MAIN --------------------
    public static void main(String[] args) {
        List<String> blocks = Arrays.asList("A", "B", "C");

        Set<Predicate> initial = new HashSet<>(Arrays.asList(
            Predicates.ONTABLE("A"),
            Predicates.ON("B", "A"),
            Predicates.ONTABLE("C"),
            Predicates.CLEAR("B"),
            Predicates.CLEAR("C"),
            Predicates.ARMEMPTY()
        ));

        Set<Predicate> goal = new HashSet<>(Arrays.asList(
            Predicates.ON("A", "B"),
            Predicates.ON("B", "C"),
            Predicates.ONTABLE("C"),
            Predicates.ARMEMPTY()
        ));

        List<Action> finalPlan = plan(initial, goal, blocks);

        System.out.println("\n===== FINAL PLAN =====");
        int step = 1;
        for (Action a : finalPlan)
            System.out.println(step++ + ". " + a);
    }
}
