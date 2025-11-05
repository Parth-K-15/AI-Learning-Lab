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
  const [current, setCurrent] = useState(null);
  const [lastNote, setLastNote] = useState('');
  const [log, setLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [isDone, setIsDone] = useState(false);
  const [showCode, setShowCode] = useState(false);
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
    setWorld([...planner.world]);
    setStack([...planner.stack]);
    setPlan([...planner.plan]);
    setCurrent(planner.current);
    const last = planner.log[planner.log.length - 1];
    setLastNote(last?.note || '');
  setLog([...planner.log]);
    if (res?.done) {
      setIsDone(true);
      setIsRunning(false);
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
    setWorld([...p.world]);
    setStack([...p.stack]);
    setPlan([...p.plan]);
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

  const gspPython = `# Goal Stack Planning (Blocks World) - Python console
from dataclasses import dataclass
from typing import List, Tuple, Dict

@dataclass(frozen=True)
class Predicate:
  type: str
  args: Tuple[str, ...]

def pred(t: str, *args: str) -> Predicate:
  return Predicate(t.upper(), tuple(args))

def stringify(p: Predicate) -> str:
  return f"{p.type}({','.join(p.args)})"

def contains(world: List[Predicate], p: Predicate) -> bool:
  return any(x.type == p.type and x.args == p.args for x in world)

def apply_effects(world: List[Predicate], add: List[Predicate], delete: List[Predicate]) -> List[Predicate]:
  w = [x for x in world if x not in delete]
  for a in add:
    if a not in w:
      w.append(a)
  return w

@dataclass
class Op:
  name: str
  bindings: Dict[str, str]
  pre: List[Predicate]
  add: List[Predicate]
  delete: List[Predicate]

def inst_STACK(X, Y):
  return Op(
    name='STACK', bindings={'X': X, 'Y': Y},
    pre=[pred('HOLDING', X), pred('CLEAR', Y)],
    add=[pred('ON', X, Y), pred('ARMEMPTY'), pred('CLEAR', X)],
    delete=[pred('HOLDING', X), pred('CLEAR', Y)]
  )

def inst_UNSTACK(X, Y):
  return Op(
    name='UNSTACK', bindings={'X': X, 'Y': Y},
    pre=[pred('ON', X, Y), pred('CLEAR', X), pred('ARMEMPTY')],
    add=[pred('HOLDING', X), pred('CLEAR', Y)],
    delete=[pred('ON', X, Y), pred('CLEAR', X), pred('ARMEMPTY')]
  )

def inst_PICKUP(X):
  return Op(
    name='PICKUP', bindings={'X': X},
    pre=[pred('ONTABLE', X), pred('CLEAR', X), pred('ARMEMPTY')],
    add=[pred('HOLDING', X)],
    delete=[pred('ONTABLE', X), pred('CLEAR', X), pred('ARMEMPTY')]
  )

def inst_PUTDOWN(X):
  return Op(
    name='PUTDOWN', bindings={'X': X},
    pre=[pred('HOLDING', X)],
    add=[pred('ONTABLE', X), pred('CLEAR', X), pred('ARMEMPTY')],
    delete=[pred('HOLDING', X)]
  )

class Planner:
  def __init__(self, initial: List[Predicate], goals: List[Predicate]):
    self.initial = list(initial)
    self.world = list(initial)
    self.goals = list(goals)
    self.stack: List[Tuple[str, object]] = [('goal', g) for g in reversed(goals)]
    self.plan: List[Op] = []
    self.log: List[str] = []
    self.current = None
    self.done = False
    self.step_count = 0

  def is_sat(self, g: Predicate) -> bool:
    return contains(self.world, g)

  def achieve(self, g: Predicate):
    t = g.type
    if t == 'ON':
      X, Y = g.args
      return inst_STACK(X, Y)
    if t == 'CLEAR':
      X = g.args[0]
      holder = next((p for p in self.world if p.type == 'ON' and p.args[1] == X), None)
      if holder:
        Z = holder.args[0]
        return inst_UNSTACK(Z, X)
      return None
    if t == 'HOLDING':
      X = g.args[0]
      if contains(self.world, pred('ONTABLE', X)) and contains(self.world, pred('CLEAR', X)) and contains(self.world, pred('ARMEMPTY')):
        return inst_PICKUP(X)
      onx = next((p for p in self.world if p.type == 'ON' and p.args[0] == X), None)
      if onx and contains(self.world, pred('CLEAR', X)) and contains(self.world, pred('ARMEMPTY')):
        return inst_UNSTACK(X, onx.args[1])
      return None
    if t == 'ARMEMPTY':
      holding = next((p for p in self.world if p.type == 'HOLDING'), None)
      if holding:
        return inst_PUTDOWN(holding.args[0])
      return None
    if t == 'ONTABLE':
      X = g.args[0]
      holding = next((p for p in self.world if p.type == 'HOLDING' and p.args[0] == X), None)
      if holding:
        return inst_PUTDOWN(X)
      onx = next((p for p in self.world if p.type == 'ON' and p.args[0] == X), None)
      if onx and contains(self.world, pred('ARMEMPTY')) and contains(self.world, pred('CLEAR', X)):
        return inst_UNSTACK(X, onx.args[1])
      return None
    return None

  def step(self):
    if self.done: return {'done': True}
    if self.step_count > 2000:
      self.done = True
      self.log.append('Stopped: step limit reached (possible loop)')
      return {'done': True}
    self.step_count += 1

    if not self.stack:
      self.done = True
      ok = all(self.is_sat(g) for g in self.goals)
      self.log.append('All goals achieved' if ok else 'Stack empty, some goals unmet')
      return {'done': True}

    kind, payload = self.stack.pop()
    self.current = (kind, payload)

    if kind == 'goal':
      g: Predicate = payload
      if self.is_sat(g):
        self.log.append(f"Goal satisfied: {stringify(g)}")
        return {'done': False}
      op = self.achieve(g)
      if not op:
        if g.type == 'HOLDING':
          X = g.args[0]
          if not contains(self.world, pred('ARMEMPTY')):
            self.stack.append(('goal', pred('ARMEMPTY')))
            self.log.append(f"Need ARMEMPTY to achieve HOLDING({X}), pushing subgoal ARMEMPTY")
            return {'done': False}
          onx = next((p for p in self.world if p.type == 'ON' and p.args[0] == X), None)
          if onx and not contains(self.world, pred('CLEAR', X)):
            self.stack.append(('goal', pred('CLEAR', X)))
            self.log.append(f"Need CLEAR({X}) to unstack, pushing subgoal CLEAR({X})")
            return {'done': False}
        if g.type == 'CLEAR':
          X = g.args[0]
          occupied = any(p.type == 'ON' and p.args[1] == X for p in self.world)
          if not occupied and not contains(self.world, pred('CLEAR', X)):
            self.world.append(pred('CLEAR', X))
            self.log.append(f"Infer CLEAR({X}) as nothing on it")
            return {'done': False}
        self.log.append(f"No operator for {stringify(g)} now")
        return {'done': False}
      # push op then preconds
      self.stack.append(('op', op))
      for pc in reversed(op.pre):
        self.stack.append(('goal', pc))
      self.log.append(f"Decompose {stringify(g)} with {op.name}({','.join(f'{k}={v}' for k,v in op.bindings.items())})")
      return {'done': False}

    if kind == 'op':
      op: Op = payload
      if not all(self.is_sat(pc) for pc in op.pre):
        # re-push and missing preconds
        self.stack.append(('op', op))
        for pc in op.pre:
          if not self.is_sat(pc):
            self.stack.append(('goal', pc))
        self.log.append(f"Preconditions not met for {op.name}, pushing missing goals")
        return {'done': False}
      outstanding = [stringify(g) for k,g in self.stack if k=='goal']
      remaining = [stringify(g) for g in self.goals if not self.is_sat(g)]
      helps = any(stringify(a) in outstanding or stringify(a) in remaining for a in op.add)
      if not helps:
        self.log.append(f"Skipped redundant operator {op.name}({','.join(f'{k}={v}' for k,v in op.bindings.items())})")
        return {'done': False}
      self.world = apply_effects(self.world, op.add, op.delete)
      self.plan.append(op)
      self.log.append(f"Applied {op.name}({','.join(f'{k}={v}' for k,v in op.bindings.items())})")
      return {'done': False}

def default_scenario():
  initial = [
    pred('ON','B','A'),
    pred('ONTABLE','A'),
    pred('ONTABLE','C'),
    pred('ONTABLE','D'),
    pred('CLEAR','B'), pred('CLEAR','C'), pred('CLEAR','D'),
    pred('ARMEMPTY')
  ]
  goals = [
    pred('ON','C','A'), pred('ON','B','D'),
    pred('ONTABLE','A'), pred('ONTABLE','D'),
    pred('CLEAR','B'), pred('CLEAR','C'), pred('ARMEMPTY')
  ]
  return initial, goals

if __name__ == '__main__':
  init, goals = default_scenario()
  p = Planner(init, goals)
  while True:
    r = p.step()
    if r.get('done'): break
  print('Plan:')
  for i,op in enumerate(p.plan,1):
    b = ','.join(f"{k}={v}" for k,v in op.bindings.items())
    print(f"{i}. {op.name}({b})")
  print('\nFinal world:')
  for w in p.world:
    print(' -', stringify(w))
`;

  const gspCpp = `// Goal Stack Planning (Blocks World) - C++ console
#include <bits/stdc++.h>
using namespace std;

struct Predicate { string type; vector<string> args; };
bool operator==(Predicate const& a, Predicate const& b){ return a.type==b.type && a.args==b.args; }
string stringify(const Predicate& p){ string s=p.type+"("; for(size_t i=0;i<p.args.size();++i){ if(i) s+=","; s+=p.args[i]; } s+=")"; return s; }
Predicate pred(string t, initializer_list<string> a){ return Predicate{t, vector<string>(a)}; }

bool contains(vector<Predicate> const& world, Predicate const& p){ return any_of(world.begin(),world.end(),[&](auto& x){return x==p;}); }
vector<Predicate> apply_effects(vector<Predicate> world, vector<Predicate> add, vector<Predicate> del){
  vector<Predicate> w; w.reserve(world.size());
  for(auto &x: world){ if(find(del.begin(),del.end(),x)==del.end()) w.push_back(x); }
  for(auto &a: add){ if(find(w.begin(),w.end(),a)==w.end()) w.push_back(a); }
  return w;
}

struct Op{ string name; map<string,string> b; vector<Predicate> pre, add, del; };

Op STACK(string X,string Y){ return Op{"STACK", {{"X",X},{"Y",Y}}, { pred("HOLDING",{X}), pred("CLEAR",{Y}) }, { pred("ON",{X,Y}), pred("ARMEMPTY",{}), pred("CLEAR",{X}) }, { pred("HOLDING",{X}), pred("CLEAR",{Y}) } }; }
Op UNSTACK(string X,string Y){ return Op{"UNSTACK", {{"X",X},{"Y",Y}}, { pred("ON",{X,Y}), pred("CLEAR",{X}), pred("ARMEMPTY",{}) }, { pred("HOLDING",{X}), pred("CLEAR",{Y}) }, { pred("ON",{X,Y}), pred("CLEAR",{X}), pred("ARMEMPTY",{}) } }; }
Op PICKUP(string X){ return Op{"PICKUP", {{"X",X}}, { pred("ONTABLE",{X}), pred("CLEAR",{X}), pred("ARMEMPTY",{}) }, { pred("HOLDING",{X}) }, { pred("ONTABLE",{X}), pred("CLEAR",{X}), pred("ARMEMPTY",{}) } }; }
Op PUTDOWN(string X){ return Op{"PUTDOWN", {{"X",X}}, { pred("HOLDING",{X}) }, { pred("ONTABLE",{X}), pred("CLEAR",{X}), pred("ARMEMPTY",{}) }, { pred("HOLDING",{X}) } }; }

struct Item{ string kind; // "goal" or "op"
  Predicate g; Op op; };

struct Planner{
  vector<Predicate> initial, world, goals; vector<Item> stack; vector<Op> plan; vector<string> log; int steps=0; bool done=false;
  Planner(vector<Predicate> init, vector<Predicate> goals): initial(init), world(init), goals(goals){ for(int i=(int)goals.size()-1;i>=0;--i){ stack.push_back({"goal", goals[i], {}}); } }
  bool is_sat(Predicate const& g){ return contains(world,g); }
  optional<Op> achieve(Predicate const& g){
    if(g.type=="ON"){ return STACK(g.args[0], g.args[1]); }
    if(g.type=="CLEAR"){ string X=g.args[0]; auto it=find_if(world.begin(),world.end(),[&](auto&p){return p.type=="ON" && p.args[1]==X;}); if(it!=world.end()){ string Z=it->args[0]; return UNSTACK(Z,X);} return nullopt; }
    if(g.type=="HOLDING"){ string X=g.args[0]; if(contains(world,pred("ONTABLE",{X})) && contains(world,pred("CLEAR",{X})) && contains(world,pred("ARMEMPTY",{}))) return PICKUP(X); auto it=find_if(world.begin(),world.end(),[&](auto&p){return p.type=="ON" && p.args[0]==X;}); if(it!=world.end() && contains(world,pred("CLEAR",{X})) && contains(world,pred("ARMEMPTY",{}))) return UNSTACK(X,it->args[1]); return nullopt; }
    if(g.type=="ARMEMPTY"){ auto it=find_if(world.begin(),world.end(),[](auto&p){return p.type=="HOLDING";}); if(it!=world.end()) return PUTDOWN(it->args[0]); return nullopt; }
    if(g.type=="ONTABLE"){ string X=g.args[0]; auto h=find_if(world.begin(),world.end(),[&](auto&p){return p.type=="HOLDING" && p.args[0]==X;}); if(h!=world.end()) return PUTDOWN(X); auto on=find_if(world.begin(),world.end(),[&](auto&p){return p.type=="ON" && p.args[0]==X;}); if(on!=world.end() && contains(world,pred("ARMEMPTY",{})) && contains(world,pred("CLEAR",{X}))) return UNSTACK(X,on->args[1]); return nullopt; }
    return nullopt;
  }
  map<string,bool> seen;
  string signature(){
    vector<string> w; for(auto &p: world) w.push_back(stringify(p)); sort(w.begin(),w.end());
    vector<string> s; for(auto &it: stack){ if(it.kind=="goal") s.push_back("G:"+stringify(it.g)); else s.push_back("O:"+it.op.name);} 
    return accumulate(w.begin(),w.end(),string(""))+"|"+accumulate(s.begin(),s.end(),string(""));
  }
  map<string,int> remGoals(){ map<string,int> m; for(auto &g: goals) if(!is_sat(g)) m[stringify(g)]++; return m; }
  bool step(){
    if(done) return true; if(steps++>2000){ done=true; log.push_back("Stopped: step limit reached"); return true; }
    if(stack.empty()){ done=true; bool ok=all_of(goals.begin(),goals.end(),[&](auto&g){return is_sat(g);}); log.push_back(ok?"All goals achieved":"Stack empty, goals unmet"); return true; }
    auto item = stack.back(); stack.pop_back();
  if(item.kind=="goal"){ auto g=item.g; if(is_sat(g)){ log.push_back(string("Goal satisfied: ")+stringify(g)); return false; } auto op=achieve(g); if(!op){ if(g.type=="HOLDING"){ string X=g.args[0]; bool armempty = contains(world, pred("ARMEMPTY",{})); if(!armempty){ stack.push_back({"goal", pred("ARMEMPTY",{}), {}}); log.push_back(string("Need ARMEMPTY to achieve HOLDING(")+X+") , pushing subgoal ARMEMPTY"); return false; } auto onx = find_if(world.begin(),world.end(),[&](auto&p){return p.type=="ON" && p.args[0]==X;}); bool clearx = contains(world, pred("CLEAR",{X})); if(onx!=world.end() && !clearx){ stack.push_back({"goal", pred("CLEAR",{X}), {}}); log.push_back(string("Need CLEAR(")+X+") to unstack, pushing subgoal CLEAR("+X+")"); return false; } } if(g.type=="CLEAR"){ string X=g.args[0]; bool occ=any_of(world.begin(),world.end(),[&](auto&p){return p.type=="ON" && p.args[1]==X;}); if(!occ && !contains(world,pred("CLEAR",{X}))){ world.push_back(pred("CLEAR",{X})); log.push_back(string("Infer CLEAR(")+X+")"); } return false; } log.push_back(string("No operator for ")+stringify(g)); return false; } stack.push_back({"op", {}, *op}); for(int i=(int)op->pre.size()-1;i>=0;--i) stack.push_back({"goal", op->pre[i], {}}); log.push_back(string("Decompose ")+stringify(g)+" with "+op->name); return false; }
    // op
    auto op=item.op; bool ok=all_of(op.pre.begin(),op.pre.end(),[&](auto&pc){return is_sat(pc);}); if(!ok){ stack.push_back({"op", {}, op}); for(auto &pc: op.pre) if(!is_sat(pc)) stack.push_back({"goal", pc, {}}); log.push_back(string("Preconditions not met for ")+op.name); return false; }
    vector<string> outstanding; for(auto &it: stack) if(it.kind=="goal") outstanding.push_back(stringify(it.g));
    vector<string> remaining; for(auto &g: goals) if(!is_sat(g)) remaining.push_back(stringify(g));
    bool helps=false; for(auto &a: op.add){ string sa=stringify(a); if(find(outstanding.begin(),outstanding.end(),sa)!=outstanding.end() || find(remaining.begin(),remaining.end(),sa)!=remaining.end()) { helps=true; break; } }
    if(!helps){ log.push_back(string("Skipped redundant operator ")+op.name); return false; }
    world = apply_effects(world, op.add, op.del); plan.push_back(op); log.push_back(string("Applied ")+op.name); return false;
  }
};

int main(){
  vector<Predicate> init = { pred("ON",{"B","A"}), pred("ONTABLE",{"A"}), pred("ONTABLE",{"C"}), pred("ONTABLE",{"D"}), pred("CLEAR",{"B"}), pred("CLEAR",{"C"}), pred("CLEAR",{"D"}), pred("ARMEMPTY",{}) };
  vector<Predicate> goals = { pred("ON",{"C","A"}), pred("ON",{"B","D"}), pred("ONTABLE",{"A"}), pred("ONTABLE",{"D"}), pred("CLEAR",{"B"}), pred("CLEAR",{"C"}), pred("ARMEMPTY",{}) };
  Planner p(init, goals);
  while(true){ if(p.step()) break; }
  cout << "Plan:\n"; int i=1; for(auto &op: p.plan){ cout << i++ << ". " << op.name << "("; bool first=true; for(auto &kv: op.b){ if(!first) cout << ","; first=false; cout << kv.first << "=" << kv.second; } cout << ")\n"; }
  cout << "\nFinal world:\n"; for(auto &w: p.world){ cout << " - " << stringify(w) << "\n"; }
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
              <label className="text-sm text-gray-300 font-semibold">Goal State (one predicate per line)</label>
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
            {plan.length > 0 && (
              <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold mb-3 text-gray-200">📋 Generated Plan</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {plan.map((op, i) => (
                    <li key={i} className="text-sm text-gray-300 font-mono">
                      <span className="text-cyan-300 font-semibold">{op.name}</span>
                      <span className="text-gray-400">({Object.entries(op.bindings).map(([k, v]) => `${k}=${v}`).join(', ')})</span>
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
