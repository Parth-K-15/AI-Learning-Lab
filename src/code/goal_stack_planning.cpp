#include <iostream>
#include <vector>
#include <stack>
#include <set>
#include <string>
#include <algorithm>
using namespace std;

// -------------------- Predicate Structure --------------------
struct Predicate {
    string name, X, Y;

    Predicate(string n, string x = "", string y = "") : name(n), X(x), Y(y) {}

    string str() const {
        if (X == "" && Y == "") return name;
        if (Y == "") return name + "(" + X + ")";
        return name + "(" + X + "," + Y + ")";
    }

    bool operator<(const Predicate& other) const {
        return str() < other.str();
    }
};

// -------------------- Helper Functions for Predicates --------------------
Predicate ON(string x, string y) { return Predicate("ON", x, y); }
Predicate ONTABLE(string x) { return Predicate("ONTABLE", x); }
Predicate CLEAR(string x) { return Predicate("CLEAR", x); }
Predicate HOLDING(string x) { return Predicate("HOLDING", x); }
Predicate ARMEMPTY() { return Predicate("ARMEMPTY"); }

// -------------------- Action Structure --------------------
struct Action {
    string name, X, Y;
    set<Predicate> preconds, add, del;

    Action(string n, string x = "", string y = "") : name(n), X(x), Y(y) {}

    string str() const {
        if (X == "" && Y == "") return name;
        if (Y == "") return name + "(" + X + ")";
        return name + "(" + X + "," + Y + ")";
    }
};

// -------------------- Action Generators --------------------
Action PICKUP(string x) {
    Action a("PICKUP", x);
    a.preconds = { ONTABLE(x), CLEAR(x), ARMEMPTY() };
    a.add = { HOLDING(x) };
    a.del = { ONTABLE(x), CLEAR(x), ARMEMPTY() };
    return a;
}

Action PUTDOWN(string x) {
    Action a("PUTDOWN", x);
    a.preconds = { HOLDING(x) };
    a.add = { ONTABLE(x), CLEAR(x), ARMEMPTY() };
    a.del = { HOLDING(x) };
    return a;
}

Action UNSTACK(string x, string y) {
    Action a("UNSTACK", x, y);
    a.preconds = { ON(x, y), CLEAR(x), ARMEMPTY() };
    a.add = { HOLDING(x), CLEAR(y) };
    a.del = { ON(x, y), CLEAR(x), ARMEMPTY() };
    return a;
}

Action STACK(string x, string y) {
    Action a("STACK", x, y);
    a.preconds = { HOLDING(x), CLEAR(y) };
    a.add = { ON(x, y), CLEAR(x), ARMEMPTY() };
    a.del = { HOLDING(x), CLEAR(y) };
    return a;
}

// -------------------- Goal Stack Planner --------------------
Action choose_action(Predicate g, set<Predicate>& state, vector<string>& blocks) {
    if (g.name == "ON") return STACK(g.X, g.Y);
    if (g.name == "ONTABLE") return PUTDOWN(g.X);
    if (g.name == "CLEAR") {
        for (string b : blocks)
            if (state.count(ON(b, g.X))) return UNSTACK(b, g.X);
        return PUTDOWN(g.X);
    }
    if (g.name == "HOLDING") {
        if (state.count(ONTABLE(g.X))) return PICKUP(g.X);
        for (string b : blocks)
            if (state.count(ON(g.X, b))) return UNSTACK(g.X, b);
        return PICKUP(g.X);
    }
    if (g.name == "ARMEMPTY") {
        for (string b : blocks)
            if (state.count(HOLDING(b))) return PUTDOWN(b);
        return PUTDOWN(blocks[0]);  // fallback
    }
    return Action("NO_ACTION");
}

// -------------------- Main Planner --------------------
vector<Action> goal_stack_planner(set<Predicate> initial_state,
                                  set<Predicate> goal_state,
                                  vector<string>& blocks) {

    set<Predicate> state = initial_state;
    stack<vector<Predicate>> st;
    vector<Predicate> goal_list(goal_state.begin(), goal_state.end());
    st.push(goal_list);
    vector<Action> plan;

    cout << "\n========= INITIAL STATE =========\n";
    for (auto& s : state) cout << s.str() << endl;

    cout << "\n========= GOAL STATE =========\n";
    for (auto& g : goal_state) cout << g.str() << endl;

    cout << "\n========= PLANNING PROCESS =========\n";

    while (!st.empty()) {
        auto top = st.top(); st.pop();

        if (top.size() > 1) { // Conjunction
            vector<Predicate> unsatisfied;
            for (auto& p : top)
                if (!state.count(p)) unsatisfied.push_back(p);

            if (!unsatisfied.empty()) {
                st.push(top);
                for (auto& p : unsatisfied) st.push({ p });
                cout << "→ Unsatisfied goals:";
                for (auto& x : unsatisfied) cout << " " << x.str();
                cout << endl;
            }
        }
        else { // Single goal
            Predicate g = top[0];
            if (state.count(g)) {
                cout << "✓ Already satisfied: " << g.str() << endl;
                continue;
            }

            Action act = choose_action(g, state, blocks);
            cout << "→ Choosing action: " << act.str() << endl;

            // Check preconditions
            bool ok = true;
            for (auto& p : act.preconds)
                if (!state.count(p)) ok = false;

            if (!ok) {  // Push preconditions
                cout << "→ Preconditions not met, pushing:";
                st.push({ g });
                for (auto& p : act.preconds) {
                    if (!state.count(p)) {
                        st.push({ p });
                        cout << " " << p.str();
                    }
                }
                cout << endl;
            }
            else {
                // Apply action
                for (auto& d : act.del) state.erase(d);
                for (auto& a : act.add) state.insert(a);
                plan.push_back(act);

                cout << "✓ Executing: " << act.str() << endl;
                cout << "Updated State: { ";
                for (auto& s : state) cout << s.str() << " ";
                cout << "}\n";
            }
        }
    }
    return plan;
}

// -------------------- MAIN FUNCTION --------------------
int main() {
    vector<string> blocks = {"A", "B", "C"};

    // INITIAL STATE
    set<Predicate> initial_state = {
        ONTABLE("A"), ON("B","A"), ONTABLE("C"),
        CLEAR("B"), CLEAR("C"), ARMEMPTY()
    };

    // GOAL STATE
    set<Predicate> goal_state = {
        ON("A","B"), ON("B","C"), ONTABLE("C"), ARMEMPTY()
    };

    vector<Action> plan = goal_stack_planner(initial_state, goal_state, blocks);

    cout << "\n========= FINAL PLAN =========\n";
    int step = 1;
    for (auto& a : plan)
        cout << step++ << ". " << a.str() << endl;

    return 0;
}
