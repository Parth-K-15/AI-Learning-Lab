import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import BlocksWorld from '../components/gsp/BlocksWorld';
import GoalStackPanel from '../components/gsp/GoalStackPanel';
import ActionPanel from '../components/gsp/ActionPanel';
import WorldStatePanel from '../components/gsp/WorldStatePanel';
import GSPControls from '../components/gsp/GSPControls';
import { GSPPlanner, defaultScenario } from '../gsp/planner';
import { pred } from '../gsp/predicate';
import CodeViewer from '../components/CodeViewer';

export default function GoalStackPlanningNew() {
  const ds = defaultScenario();
  const [initialText, setInitialText] = useState(
    ds.initial.map(p => `${p.type}(${p.args.join(',')})`).join('\n')
  );
  const [goalText, setGoalText] = useState(
    ds.goals.map(p => `${p.type}(${p.args.join(',')})`).join('\n')
  );
  const [blocks] = useState(ds.blocks);

  const [planner, setPlanner] = useState(null);
  const [world, setWorld] = useState([]);
  const [stack, setStack] = useState([]);
  const [plan, setPlan] = useState([]);
  const [regressionPlan, setRegressionPlan] = useState([]);
  const [current, setCurrent] = useState(null);
  const [lastNote, setLastNote] = useState('');
  const [log, setLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [isDone, setIsDone] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [planningOnly, setPlanningOnly] = useState(false);
  const [showRegression, setShowRegression] = useState(false);
  const [initialWorldSnapshot, setInitialWorldSnapshot] = useState([]);
  const timerRef = useRef(null);

  function parsePredicates(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const out = [];
    const re = /^(\w+)\s*\(([^)]*)\)\s*$/;
    for (const line of lines) {
      const m = line.match(re);
      if (!m) continue;
      const name = m[1].toUpperCase();
      const args = m[2].split(',').map(s => s.trim()).filter(Boolean);
      out.push(pred(name, ...args));
    }
    return out;
  }

  const doStep = () => {
    if (!planner) return;
    const res = planner.step();
    // When planningOnly is enabled, keep the visualization at initial world until planning completes
    setWorld(planningOnly ? [...initialWorldSnapshot] : [...planner.world]);
    setStack([...planner.stack]);
  setPlan([...planner.plan]);
  setRegressionPlan([...(planner.regressionPlan || [])]);
    setCurrent(planner.current);
    const last = planner.log[planner.log.length - 1];
    setLastNote(last?.note || '');
  setLog([...planner.log]);
    if (res?.done) {
      setIsDone(true);
      setIsRunning(false);
      // On completion in planning-only mode, jump visualization to final world
      if (planningOnly) {
        setWorld([...planner.world]);
      }
    }
  };

  const handleAuto = () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning || isDone) return;
    const tick = () => {
      doStep();
      timerRef.current = setTimeout(() => {
        if (isRunning && !isDone) tick();
      }, speed);
    };
    tick();
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [isRunning, speed, isDone]);

  const handleStart = () => {
    const ini = parsePredicates(initialText);
    const gl = parsePredicates(goalText);
    const p = new GSPPlanner(ini, gl, blocks);
    setPlanner(p);
    setInitialWorldSnapshot([...ini]);
    setWorld(planningOnly ? [...ini] : [...p.world]);
    setStack([...p.stack]);
    setPlan([...p.plan]);
  setRegressionPlan([...(p.regressionPlan || [])]);
    setCurrent(p.current);
    setLastNote('Initialized from user input');
  setLog([...p.log]);
    setIsDone(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setPlanner(null);
    setWorld([]);
    setStack([]);
    setPlan([]);
    setCurrent(null);
    setLastNote('');
  setLog([]);
    setIsDone(false);
  };

  const gspPython = `# Goal Stack Planning - Python console (simple version)
class Predicate:
    def __init__(self, name, X="", Y=""):
        self.name = name
        self.X = X
        self.Y = Y

    def __eq__(self, other):
        return self.name == other.name and self.X == other.X and self.Y == other.Y

    def __str__(self):
        if self.Y:
            return f"{self.name}({self.X},{self.Y})"
        elif self.X:
            return f"{self.name}({self.X})"
        else:
            return self.name


class Operation:
    def __init__(self, name, X="", Y=""):
        self.name = name
        self.X = X
        self.Y = Y

    def __str__(self):
        if self.Y:
            return f"{self.name}({self.X},{self.Y})"
        else:
            return f"{self.name}({self.X})"


def contains(state, p):
    return any(x == p for x in state)


def applyOperator(op, world):
    if op.name == "STACK":
        world = [w for w in world if w != Predicate("HOLDING", op.X)]
        world = [w for w in world if w != Predicate("CLEAR", op.Y)]
        world.append(Predicate("ON", op.X, op.Y))
        world.append(Predicate("ARMEMPTY"))
        world.append(Predicate("CLEAR", op.X))

    elif op.name == "UNSTACK":
        world = [w for w in world if w != Predicate("ON", op.X, op.Y)]
        world = [w for w in world if w != Predicate("ARMEMPTY")]
        world.append(Predicate("HOLDING", op.X))
        world.append(Predicate("CLEAR", op.Y))

    elif op.name == "PICKUP":
        world = [w for w in world if w != Predicate("ONTABLE", op.X)]
        world = [w for w in world if w != Predicate("ARMEMPTY")]
        world.append(Predicate("HOLDING", op.X))

    elif op.name == "PUTDOWN":
        world = [w for w in world if w != Predicate("HOLDING", op.X)]
        world.append(Predicate("ONTABLE", op.X))
        world.append(Predicate("CLEAR", op.X))
        world.append(Predicate("ARMEMPTY"))

    return world


def main():
    world = [
        Predicate("ON", "B", "A"),
        Predicate("ONTABLE", "A"),
        Predicate("ONTABLE", "C"),
        Predicate("ONTABLE", "D"),
        Predicate("CLEAR", "B"),
        Predicate("CLEAR", "C"),
        Predicate("CLEAR", "D"),
        Predicate("ARMEMPTY")
    ]

    goal = [
        Predicate("ON", "C", "A"),
        Predicate("ON", "B", "D"),
        Predicate("ONTABLE", "A"),
        Predicate("ONTABLE", "D"),
        Predicate("CLEAR", "B"),
        Predicate("CLEAR", "C"),
        Predicate("ARMEMPTY")
    ]

    print("Initial State:")
    print(" ".join(str(p) for p in world))
    print("\\nGoal State:")
    print(" ".join(str(p) for p in goal))
    print()

    goalStack = list(reversed(goal))
    plan = []

    while goalStack:
        g = goalStack.pop()

        if contains(world, g):
            continue

        if g.name == "ON":
            X, Y = g.X, g.Y
            goalStack.append(Predicate("HOLDING", X))
            goalStack.append(Predicate("CLEAR", Y))
            plan.append(Operation("STACK", X, Y))

        elif g.name == "HOLDING":
            X = g.X
            if contains(world, Predicate("ONTABLE", X)):
                plan.append(Operation("PICKUP", X))
            else:
                for p in world:
                    if p.name == "ON" and p.X == X:
                        plan.append(Operation("UNSTACK", X, p.Y))
                        goalStack.append(Predicate("ON", X, p.Y))
                        break

        elif g.name == "CLEAR":
            X = g.X
            for p in world:
                if p.name == "ON" and p.Y == X:
                    plan.append(Operation("UNSTACK", p.X, X))
                    goalStack.append(Predicate("CLEAR", p.X))
                    break

        elif g.name == "ONTABLE":
            X = g.X
            goalStack.append(Predicate("HOLDING", X))
            plan.append(Operation("PUTDOWN", X))

        elif g.name == "ARMEMPTY":
            for p in world:
                if p.name == "HOLDING":
                    plan.append(Operation("PUTDOWN", p.X))
                    break

        if plan:
            last = plan[-1]
            world = applyOperator(last, world)

    print("\\nPlan (sequence of operations):")
    for op in plan:
        print(str(op))

    print("\\nFinal World State:")
    print(" ".join(str(p) for p in world))


if __name__ == "__main__":
    main()
`;

  const gspCpp = `// Goal Stack Planning - C++ console (simple version)
#include <iostream>
#include <vector>
#include <stack>
#include <string>
#include <algorithm>
using namespace std;

struct Predicate {
  string name;
  string X, Y; 

  Predicate(string n, string x = "", string y = "") : name(n), X(x), Y(y) {}

  string toString() const {
    if (Y != "") return name + "(" + X + "," + Y + ")";
    if (X != "") return name + "(" + X + ")";
    return name;
  }

  bool operator==(const Predicate &other) const {
    return name == other.name && X == other.X && Y == other.Y;
  }
};

struct Operation {
  string name;
  string X, Y;

  Operation(string n, string x = "", string y = "") : name(n), X(x), Y(y) {}

  string toString() const {
    if (Y != "") return name + "(" + X + "," + Y + ")";
    return name + "(" + X + ")";
  }
};

bool contains(const vector<Predicate> &state, const Predicate &p) {
  return find(state.begin(), state.end(), p) != state.end();
}

void applyOperator(Operation op, vector<Predicate> &world) {
  if (op.name == "STACK") {
    world.erase(remove(world.begin(), world.end(), Predicate("HOLDING", op.X)), world.end());
    world.erase(remove(world.begin(), world.end(), Predicate("CLEAR", op.Y)), world.end());
    world.push_back(Predicate("ON", op.X, op.Y));
    world.push_back(Predicate("ARMEMPTY"));
    world.push_back(Predicate("CLEAR", op.X));
  }
  else if (op.name == "UNSTACK") {
    world.erase(remove(world.begin(), world.end(), Predicate("ON", op.X, op.Y)), world.end());
    world.erase(remove(world.begin(), world.end(), Predicate("ARMEMPTY")), world.end());
    world.push_back(Predicate("HOLDING", op.X));
    world.push_back(Predicate("CLEAR", op.Y));
  }
  else if (op.name == "PICKUP") {
    world.erase(remove(world.begin(), world.end(), Predicate("ONTABLE", op.X)), world.end());
    world.erase(remove(world.begin(), world.end(), Predicate("ARMEMPTY")), world.end());
    world.push_back(Predicate("HOLDING", op.X));
  }
  else if (op.name == "PUTDOWN") {
    world.erase(remove(world.begin(), world.end(), Predicate("HOLDING", op.X)), world.end());
    world.push_back(Predicate("ONTABLE", op.X));
    world.push_back(Predicate("CLEAR", op.X));
    world.push_back(Predicate("ARMEMPTY"));
  }
}

int main() {
  vector<Predicate> world = {
    Predicate("ON", "B", "A"),
    Predicate("ONTABLE", "A"),
    Predicate("ONTABLE", "C"),
    Predicate("ONTABLE", "D"),
    Predicate("CLEAR", "B"),
    Predicate("CLEAR", "C"),
    Predicate("CLEAR", "D"),
    Predicate("ARMEMPTY")
  };

  vector<Predicate> goal = {
    Predicate("ON", "C", "A"),
    Predicate("ON", "B", "D"),
    Predicate("ONTABLE", "A"),
    Predicate("ONTABLE", "D"),
    Predicate("CLEAR", "B"),
    Predicate("CLEAR", "C"),
    Predicate("ARMEMPTY")
  };

  cout << "Initial State:\\n";
  for (auto &p : world) cout << p.toString() << " ";
  cout << "\\n\\nGoal State:\\n";
  for (auto &p : goal) cout << p.toString() << " ";
  cout << "\\n\\n";

  stack<Predicate> goalStack;
  for (auto &g : goal) goalStack.push(g);

  vector<Operation> plan;

  while (!goalStack.empty()) {
    Predicate g = goalStack.top();
    goalStack.pop();

    if (contains(world, g)) continue; 
        
    if (g.name == "ON") {
      string X = g.X, Y = g.Y;
      goalStack.push(Predicate("HOLDING", X));
      goalStack.push(Predicate("CLEAR", Y));
      plan.push_back(Operation("STACK", X, Y));
    }
    else if (g.name == "HOLDING") {
      string X = g.X;
      if (contains(world, Predicate("ONTABLE", X)))
        plan.push_back(Operation("PICKUP", X));
      else {
        for (auto &p : world) {
          if (p.name == "ON" && p.X == X) {
            plan.push_back(Operation("UNSTACK", X, p.Y));
            goalStack.push(Predicate("ON", X, p.Y));
            break;
          }
        }
      }
    }
    else if (g.name == "CLEAR") {
      string X = g.X;
      for (auto &p : world) {
        if (p.name == "ON" && p.Y == X) {
          plan.push_back(Operation("UNSTACK", p.X, X));
          goalStack.push(Predicate("CLEAR", p.X));
          break;
        }
      }
    }
    else if (g.name == "ONTABLE") {
      string X = g.X;
      goalStack.push(Predicate("HOLDING", X));
      plan.push_back(Operation("PUTDOWN", X));
    }
    else if (g.name == "ARMEMPTY") {
      for (auto &p : world) {
        if (p.name == "HOLDING") {
          plan.push_back(Operation("PUTDOWN", p.X));
          break;
        }
      }
    }

    if (!plan.empty()) {
      Operation last = plan.back();
      applyOperator(last, world);
    }
  }

  cout << "\\nPlan (sequence of operations):\\n";
  for (auto &op : plan) cout << op.toString() << "\\n";

  cout << "\\nFinal World State:\\n";
  for (auto &p : world) cout << p.toString() << " ";
  cout << "\\n";

  return 0;
}
`;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-100 mb-4 drop-shadow-lg">
            🧱 Goal Stack Planning Visualizer
          </h1>
          <p className="text-xl text-gray-300 drop-shadow">
            Interactive Visualization of AI Planning in Blocks World
          </p>
          <div className="mt-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 inline-block border border-slate-700">
            <p className="text-gray-200 text-sm">
              <strong>Goal:</strong> Rearrange blocks from initial configuration to goal state using planning operators
            </p>
            <p className="text-gray-200 text-sm mt-1">
              <strong>Algorithm:</strong> Goal Stack Planning (Backward Chaining from Goals)
            </p>
          </div>
        </div>

        {/* Scenario Configuration */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-3 text-gray-200">✏️ Define Scenario</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 font-semibold">Initial State (one predicate per line)</label>
              <textarea
                value={initialText}
                onChange={(e) => setInitialText(e.target.value)}
                className="w-full mt-2 h-40 bg-slate-900 text-sm text-gray-200 p-3 rounded border border-slate-700 font-mono"
                placeholder="ON(B,A)&#10;ONTABLE(A)&#10;CLEAR(B)&#10;ARMEMPTY()"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Final State (one predicate per line)</label>
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className="w-full mt-2 h-40 bg-slate-900 text-sm text-gray-200 p-3 rounded border border-slate-700 font-mono"
                placeholder="ON(C,A)&#10;ON(B,D)&#10;CLEAR(B)&#10;ARMEMPTY()"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={handleStart} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              ▶️ Start Planning
            </button>
            <button onClick={handleReset} className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors">
              🔁 Reset
            </button>
            <button onClick={() => setShowCode(true)} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 ml-auto transition-colors">
              💻 View Code
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" className="w-4 h-4" checked={planningOnly} onChange={(e) => setPlanningOnly(e.target.checked)} />
              Plan-first (no world updates during reasoning)
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" className="w-4 h-4" checked={showRegression} onChange={(e) => setShowRegression(e.target.checked)} />
              Show backward (regression) operator order
            </label>
            <span className="text-xs text-gray-400">GSP reasons backward from goals; world changes are the forward execution of chosen actions.</span>
          </div>
          <div className="mt-4 text-right">
            <span className="text-sm text-gray-400">
              Step: <strong className="text-cyan-400 text-lg">{log.length}</strong>
            </span>
          </div>
        </div>

        {/* Main Content: 2-column grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column: Visualization */}
          <div className="lg:col-span-2 space-y-6">
            {/* BlocksWorld Visualization */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-4 text-gray-200">🧱 Blocks World State</h3>
              <BlocksWorld world={world} blocks={blocks} />
            </div>

            {/* Current World Predicates */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <WorldStatePanel world={world} />
            </div>

            {/* Plan Summary */}
            {(showRegression ? regressionPlan.length > 0 : plan.length > 0) && (
              <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-3 text-gray-200">📋 {showRegression ? 'Backward (Goal Regression) Operator Sequence' : 'Forward Execution Plan'}</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {(showRegression ? regressionPlan : plan).map((op, i) => (
                    <li key={i} className="text-sm text-gray-300 font-mono">
                      <span className="text-cyan-300 font-semibold">{op.name}</span>
                      <span className="text-gray-400">({Object.entries(op.bindings || {}).map(([k, v]) => `${k}=${v}`).join(', ')})</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Right Column: Controls */}
          <div className="space-y-6">
            {/* Goal Stack Panel */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <GoalStackPanel stack={stack} />
            </div>

            {/* Current Action Panel */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <ActionPanel current={current} lastNote={lastNote} />
            </div>

            {/* Controls */}
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <GSPControls
                isRunning={isRunning}
                onStep={doStep}
                onAuto={handleAuto}
                onReset={handleReset}
                speed={speed}
                onSpeedChange={setSpeed}
                isDone={isDone}
              />
            </div>
          </div>
        </div>

        {/* Explanation Panel */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4 text-gray-200">� Understanding Goal Stack Planning</h3>
          
          {/* Operators Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">🔧 Operators</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <h5 className="font-bold text-emerald-400 mb-2">STACK(X, Y)</h5>
                <p className="text-sm text-gray-300 mb-2">Place block X on top of block Y.</p>
                <div className="text-xs text-gray-400">
                  <div><strong>Requires:</strong> Holding X, Y is clear</div>
                  <div><strong>Effects:</strong> X is on Y, X is clear, arm is empty</div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <h5 className="font-bold text-emerald-400 mb-2">UNSTACK(X, Y)</h5>
                <p className="text-sm text-gray-300 mb-2">Remove block X from top of Y.</p>
                <div className="text-xs text-gray-400">
                  <div><strong>Requires:</strong> X on Y, X clear, arm empty</div>
                  <div><strong>Effects:</strong> Holding X, Y is clear</div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <h5 className="font-bold text-emerald-400 mb-2">PICKUP(X)</h5>
                <p className="text-sm text-gray-300 mb-2">Pick up block X from the table.</p>
                <div className="text-xs text-gray-400">
                  <div><strong>Requires:</strong> X on table, X clear, arm empty</div>
                  <div><strong>Effects:</strong> Holding X</div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded border border-slate-700">
                <h5 className="font-bold text-emerald-400 mb-2">PUTDOWN(X)</h5>
                <p className="text-sm text-gray-300 mb-2">Place block X on the table.</p>
                <div className="text-xs text-gray-400">
                  <div><strong>Requires:</strong> Holding X</div>
                  <div><strong>Effects:</strong> X on table, X is clear, arm is empty</div>
                </div>
              </div>
            </div>
          </div>

          {/* Predicates Section */}
          <div>
            <h4 className="text-lg font-semibold text-cyan-400 mb-3">🏷️ Predicates</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <h5 className="font-bold text-purple-400 mb-1">ON(X, Y)</h5>
                <p className="text-xs text-gray-300">Block X is on top of block Y</p>
              </div>

              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <h5 className="font-bold text-purple-400 mb-1">ONTABLE(X)</h5>
                <p className="text-xs text-gray-300">Block X is on the table</p>
              </div>

              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <h5 className="font-bold text-purple-400 mb-1">CLEAR(X)</h5>
                <p className="text-xs text-gray-300">Nothing is on top of block X</p>
              </div>

              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <h5 className="font-bold text-purple-400 mb-1">HOLDING(X)</h5>
                <p className="text-xs text-gray-300">Robot arm is holding block X</p>
              </div>

              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <h5 className="font-bold text-purple-400 mb-1">ARMEMPTY</h5>
                <p className="text-xs text-gray-300">Robot arm is not holding anything</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Log */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-xl font-bold text-gray-200 mb-3">🔍 Execution Log</h3>
          {log.length === 0 ? (
            <div className="text-gray-400 text-sm">No steps executed yet. Click "Start Planning" to begin.</div>
          ) : (
            <div className="max-h-64 overflow-auto bg-slate-900 rounded p-4 border border-slate-700">
              <ul className="text-gray-300 space-y-1">
                {log.map((entry, idx) => (
                  <li key={idx} className="text-xs font-mono">
                    <span className="text-gray-500">[{idx + 1}]</span> {typeof entry === 'string' ? entry : entry.note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Built with React, Tailwind CSS, and Framer Motion</p>
          <p className="mt-1">AI Learning Lab © 2025</p>
        </div>
      </div>

      <CodeViewer isOpen={showCode} onClose={() => setShowCode(false)} pyCode={gspPython} cppCode={gspCpp} baseName={'goal_stack_planning'} />
    </div>
  );
}
