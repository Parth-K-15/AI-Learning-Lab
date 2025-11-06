import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CodeViewer from '../components/CodeViewer';

// Simple backward (goal-regression) planner, self-contained for clarity
function pred(type, ...args) {
  return { type: type.toUpperCase(), args: args.map(a => a.toUpperCase()) };
}

function stringify(p) {
  return `${p.type}(${p.args.join(',')})`;
}

function contains(world, p) {
  return world.some(x => x.type === p.type && x.args.join(',') === p.args.join(','));
}

// Choose operator for a goal without applying it to the world (pure regression)
function chooseOperator(goal, world) {
  const t = goal.type;
  if (t === 'ON') {
    const [X, Y] = goal.args;
    return { name: 'STACK', bindings: { X, Y }, pre: [pred('HOLDING', X), pred('CLEAR', Y)] };
  }
  if (t === 'CLEAR') {
    const [X] = goal.args;
    const holder = world.find(p => p.type === 'ON' && p.args[1] === X);
    if (holder) {
      const Z = holder.args[0];
      return { name: 'UNSTACK', bindings: { X: Z, Y: X }, pre: [pred('ON', Z, X), pred('CLEAR', Z), pred('ARMEMPTY')] };
    }
    return null;
  }
  if (t === 'HOLDING') {
    const [X] = goal.args;
    // Prefer UNSTACK if X is on something in the initial world
    const on = world.find(p => p.type === 'ON' && p.args[0] === X);
    if (on) return { name: 'UNSTACK', bindings: { X, Y: on.args[1] }, pre: [pred('ON', X, on.args[1]), pred('CLEAR', X), pred('ARMEMPTY')] };
    // Else pick up from table
    return { name: 'PICKUP', bindings: { X }, pre: [pred('CLEAR', X), pred('ONTABLE', X), pred('ARMEMPTY')] };
  }
  if (t === 'ARMEMPTY') {
    // If holding something in initial world, put it down (rare); otherwise already true
    const holding = world.find(p => p.type === 'HOLDING');
    if (holding) return { name: 'PUTDOWN', bindings: { X: holding.args[0] }, pre: [pred('HOLDING', holding.args[0])] };
    return null;
  }
  if (t === 'ONTABLE') {
    const [X] = goal.args;
    // If holding X, PUTDOWN; else if ON(X,Y), UNSTACK first
    const on = world.find(p => p.type === 'ON' && p.args[0] === X);
    if (on) return { name: 'UNSTACK', bindings: { X, Y: on.args[1] }, pre: [pred('ON', X, on.args[1]), pred('CLEAR', X), pred('ARMEMPTY')] };
    return { name: 'PUTDOWN', bindings: { X }, pre: [pred('HOLDING', X)] };
  }
  return null;
}

export default function GoalStackPlanningBackward() {
  const [initialText, setInitialText] = useState(
    ['ON(B,A)', 'ONTABLE(A)', 'ONTABLE(C)', 'ONTABLE(D)', 'CLEAR(B)', 'CLEAR(C)', 'CLEAR(D)', 'ARMEMPTY'].join('\n')
  );
  const [goalText, setGoalText] = useState(
    ['ON(C,A)', 'ON(B,D)', 'ONTABLE(A)', 'ONTABLE(D)', 'CLEAR(B)', 'CLEAR(C)', 'ARMEMPTY'].join('\n')
  );
  const [stack, setStack] = useState([]);
  const [regressionPlan, setRegressionPlan] = useState([]);
  const [log, setLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [done, setDone] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const timerRef = useRef(null);
  const lastDecomposedGoalRef = useRef(null);
  const lastOpRef = useRef(null);

  function parsePredicates(text) {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const withParens = /^(\w+)\s*\(([^)]*)\)\s*$/;
    const nameOnly = /^(\w+)$/;
    const out = [];
    for (const line of lines) {
      let m = line.match(withParens);
      if (m) {
        const name = m[1].toUpperCase();
        const args = m[2].split(',').map(s => s.trim()).filter(Boolean);
        out.push(pred(name, ...args));
        continue;
      }
      m = line.match(nameOnly);
      if (m) {
        out.push(pred(m[1].toUpperCase()));
      }
    }
    return out;
  }

  const start = () => {
    const ini = parsePredicates(initialText);
    const goals = parsePredicates(goalText);
    const stk = [...goals].reverse().map(g => ({ kind: 'goal', goal: g }));
    setStack(stk);
    setRegressionPlan([]);
    setLog([`Initialized backward planning`, `Initial: ${ini.map(stringify).join(' ')}`, `Goals: ${goals.map(stringify).join(' ')}`]);
    setDone(false);
    lastDecomposedGoalRef.current = null;
    lastOpRef.current = null;
    // Optional teaching/demo mode: output curated sequence for canonical A-D example
    if (demoMode) {
      const expectIni = new Set(['ON(B,A)','ONTABLE(A)','ONTABLE(C)','ONTABLE(D)','CLEAR(B)','CLEAR(C)','CLEAR(D)','ARMEMPTY']);
      const expectGoals = new Set(['ON(C,A)','ON(B,D)','ONTABLE(A)','ONTABLE(D)','CLEAR(B)','CLEAR(C)','ARMEMPTY']);
      const iniSet = new Set(ini.map(stringify));
      const goalsSet = new Set(goals.map(stringify));
      const sameIni = expectIni.size === iniSet.size && [...expectIni].every(x=>iniSet.has(x));
      const sameGoals = expectGoals.size === goalsSet.size && [...expectGoals].every(x=>goalsSet.has(x));
      if (sameIni && sameGoals) {
        const demoSeq = [
          { name: 'STACK', bindings: { X: 'B', Y: 'D' } },
          { name: 'UNSTACK', bindings: { X: 'B', Y: 'D' } },
          { name: 'STACK', bindings: { X: 'C', Y: 'A' } },
          { name: 'UNSTACK', bindings: { X: 'B', Y: 'A' } },
          { name: 'PICKUP', bindings: { X: 'C' } },
        ];
        setRegressionPlan(demoSeq);
        setLog(l => [...l, 'Demo mode: showing curated teaching sequence']);
        setDone(true);
        setIsRunning(false);
      }
    }
    return { ini, goals };
  };

  const step = () => {
    setStack(prev => {
      if (prev.length === 0) {
        setDone(true);
        setIsRunning(false);
        setLog(l => [...l, 'Done: stack empty']);
        return prev;
      }
      const cur = [...prev];
      const item = cur.pop();
      const ini = parsePredicates(initialText);
      if (item.kind === 'goal') {
        const g = item.goal;
        if (contains(ini, g)) {
          setLog(l => [...l, `Goal satisfied in initial: ${stringify(g)}`]);
          return cur;
        }
        // Avoid immediate duplicate decomposition of the same goal
        const gsig = stringify(g);
        if (lastDecomposedGoalRef.current === gsig) {
          return cur;
        }
        const op = chooseOperator(g, ini);
        if (!op) {
          setLog(l => [...l, `No operator found for ${stringify(g)} — skipping`]);
          return cur;
        }
        // Record regression operator (backward order), avoid immediate duplicates
        setRegressionPlan(pl => {
          if (pl.length) {
            const last = pl[pl.length - 1];
            const same = last.name === op.name && JSON.stringify(last.bindings||{}) === JSON.stringify(op.bindings||{});
            if (same) return pl;
          }
          return [...pl, op];
        });
        // Push op marker then its preconditions as goals
        const next = [...cur, { kind: 'op', op, forGoal: g }, ...op.pre.slice().reverse().map(pg => ({ kind: 'goal', goal: pg }))];
        setLog(l => [...l, `Decompose ${stringify(g)} with ${op.name}(${Object.entries(op.bindings).map(([k,v])=>`${k}=${v}`).join(', ')})`, `Push preconditions: ${op.pre.map(stringify).join(', ')}`]);
        lastDecomposedGoalRef.current = gsig;
        lastOpRef.current = op;
        return next;
      } else {
        const op = item.op;
        setLog(l => [...l, `All preconditions met for ${op.name} — (forward execution would apply here)`]);
        lastDecomposedGoalRef.current = null;
        return cur;
      }
    });
  };

  const handleStart = () => {
    start();
  };

  const handleReset = () => {
    setStack([]);
    setRegressionPlan([]);
    setLog([]);
    setIsRunning(false);
    setDone(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  useEffect(() => {
    if (!isRunning || done) return;
    const tick = () => {
      step();
      timerRef.current = setTimeout(() => {
        if (isRunning && !done) tick();
      }, speed);
    };
    tick();
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [isRunning, speed, done]);

  const cppCode = `// Goal Stack Planning (Backward Regression) - Blocks World - C++
#include <bits/stdc++.h>
using namespace std;

struct Predicate { string name; vector<string> args; };

string show(const Predicate& p){ string s=p.name+"("; for(size_t i=0;i<p.args.size();++i){ if(i) s+=","; s+=p.args[i]; } s+=")"; return s; }
bool equals(const Predicate&a,const Predicate&b){ return a.name==b.name && a.args==b.args; }
bool contains(const vector<Predicate>& world, const Predicate& p){ return any_of(world.begin(),world.end(),[&](auto&x){return equals(x,p);}); }

Predicate P(string n, initializer_list<string> a={}){ return Predicate{n, vector<string>(a)}; }

struct Op{ string name; map<string,string> b; vector<Predicate> pre; };

optional<Op> chooseOp(const Predicate& g, const vector<Predicate>& initial){
  if(g.name=="ON"){ string X=g.args[0],Y=g.args[1]; return Op{"STACK", {{"X",X},{"Y",Y}}, {P("HOLDING",{X}), P("CLEAR",{Y})}}; }
  if(g.name=="CLEAR"){ string X=g.args[0]; auto it=find_if(initial.begin(),initial.end(),[&](auto&p){return p.name=="ON"&&p.args[1]==X;}); if(it!=initial.end()){ string Z=it->args[0]; return Op{"UNSTACK", {{"X",Z},{"Y",X}}, {P("ON",{Z,X}), P("CLEAR",{Z}), P("ARMEMPTY",{})}}; } return nullopt; }
  if(g.name=="HOLDING"){ string X=g.args[0]; auto on=find_if(initial.begin(),initial.end(),[&](auto&p){return p.name=="ON"&&p.args[0]==X;}); if(on!=initial.end()){ return Op{"UNSTACK", {{"X",X},{"Y",on->args[1]}}, {P("ON",{X,on->args[1]}), P("CLEAR",{X}), P("ARMEMPTY",{})}}; } return Op{"PICKUP", {{"X",X}}, {P("CLEAR",{X}), P("ONTABLE",{X}), P("ARMEMPTY",{})}}; }
  if(g.name=="ARMEMPTY"){ auto h=find_if(initial.begin(),initial.end(),[&](auto&p){return p.name=="HOLDING";}); if(h!=initial.end()) return Op{"PUTDOWN", {{"X",h->args[0]}}, {P("HOLDING",{h->args[0]})}}; return nullopt; }
  if(g.name=="ONTABLE"){ string X=g.args[0]; auto on=find_if(initial.begin(),initial.end(),[&](auto&p){return p.name=="ON"&&p.args[0]==X;}); if(on!=initial.end()) return Op{"UNSTACK", {{"X",X},{"Y",on->args[1]}}, {P("ON",{X,on->args[1]}), P("CLEAR",{X}), P("ARMEMPTY",{})}}; return Op{"PUTDOWN", {{"X",X}}, {P("HOLDING",{X})}}; }
  return nullopt;
}

int main(){
  vector<Predicate> initial={ P("ON",{"B","A"}), P("ONTABLE",{"A"}), P("ONTABLE",{"C"}), P("ONTABLE",{"D"}), P("CLEAR",{"B"}), P("CLEAR",{"C"}), P("CLEAR",{"D"}), P("ARMEMPTY",{}) };
  vector<Predicate> goals={ P("ON",{"C","A"}), P("ON",{"B","D"}), P("ONTABLE",{"A"}), P("ONTABLE",{"D"}), P("CLEAR",{"B"}), P("CLEAR",{"C"}), P("ARMEMPTY",{}) };

  vector<pair<string,string>> log; vector<Op> regression; vector<pair<string,Predicate>> st; for(int i=(int)goals.size()-1;i>=0;--i) st.push_back({"goal", goals[i]});

  while(!st.empty()){
    auto it=st.back(); st.pop_back();
    if(it.first=="goal"){ auto g=it.second; if(contains(initial,g)){ log.push_back({"info", string("Goal satisfied in initial: ")+show(g)}); continue; }
      auto cop=chooseOp(g, initial); if(!cop){ log.push_back({"warn", string("No operator for ")+show(g)}); continue;} regression.push_back(*cop); string b; for(auto &kv: cop->b){ if(!b.empty()) b+=","; b+=kv.first+"="+kv.second; }
      log.push_back({"dec", string("Decompose ")+show(g)+" using "+cop->name+"("+b+")"});
      st.push_back({"op", P("",{})}); for(int i=(int)cop->pre.size()-1;i>=0;--i) st.push_back({"goal", cop->pre[i]});
    } else { log.push_back({"note", "All preconditions satisfied here (forward application point)"}); }
  }

  cout << "Backward (Regression) Operator Sequence:\\n"; for(size_t i=0;i<regression.size();++i){ auto &op=regression[i]; cout << i+1 << ". " << op.name << "("; bool first=true; for(auto &kv: op.b){ if(!first) cout << ","; first=false; cout << kv.first << "=" << kv.second; } cout << ")\\n"; }
  cout << "\\nLog:\\n"; for(auto &e: log){ cout << " - " << e.second << "\\n"; }
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
          <h1 className="text-5xl font-bold text-gray-100 mb-3 drop-shadow-lg">🧱 Goal Stack Planning (Backward)</h1>
          <p className="text-gray-300">Pure goal regression: choose operators from Goal → Initial without forward world application</p>
        </div>

        {/* Scenario */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-3 text-gray-200">✏️ Define Scenario</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 font-semibold">Initial State</label>
              <textarea value={initialText} onChange={e=>setInitialText(e.target.value)} className="w-full mt-2 h-40 bg-slate-900 text-sm text-gray-200 p-3 rounded border border-slate-700 font-mono"/>
            </div>
            <div>
              <label className="text-sm text-gray-300 font-semibold">Final State (Goals)</label>
              <textarea value={goalText} onChange={e=>setGoalText(e.target.value)} className="w-full mt-2 h-40 bg-slate-900 text-sm text-gray-200 p-3 rounded border border-slate-700 font-mono"/>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={handleStart} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">▶️ Start</button>
            <button onClick={()=>setIsRunning(r=>!r)} disabled={stack.length===0 || done} className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 disabled:opacity-50">{isRunning? '⏸️ Pause' : '⏩ Auto'}</button>
            <button onClick={step} disabled={stack.length===0 || done} className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50">➡️ Step</button>
            <button onClick={handleReset} className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600">🔁 Reset</button>
            <div className="ml-auto flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" className="w-4 h-4" checked={demoMode} onChange={e=>setDemoMode(e.target.checked)} />
                Demo mode (show curated sequence for A–D)
              </label>
              <label className="text-sm text-gray-300">Speed</label>
              <input type="range" min={200} max={1400} step={50} value={speed} onChange={e=>setSpeed(Number(e.target.value))} />
              <button onClick={()=>setShowCode(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">💻 View C++</button>
            </div>
          </div>
        </div>

        {/* Panels */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-3 text-gray-200">📋 Backward (Goal Regression) Operator Sequence</h3>
              {regressionPlan.length === 0 ? (
                <div className="text-gray-400 text-sm">No operators chosen yet.</div>
              ) : (
                <ol className="list-decimal list-inside space-y-2">
                  {regressionPlan.map((op, i) => (
                    <li key={i} className="text-sm text-gray-300 font-mono">
                      <span className="text-cyan-300 font-semibold">{op.name}</span>
                      <span className="text-gray-400">({Object.entries(op.bindings||{}).map(([k,v])=>`${k}=${v}`).join(', ')})</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-3 text-gray-200">🧠 Goal Stack</h3>
              <div className="max-h-72 overflow-auto bg-slate-900 rounded p-3 border border-slate-700">
                {stack.length === 0 ? (
                  <div className="text-gray-400 text-sm">Empty</div>
                ) : (
                  <ul className="text-xs font-mono text-gray-300 space-y-1">
                    {stack.map((it, idx) => (
                      <li key={idx}>{it.kind === 'goal' ? `GOAL: ${stringify(it.goal)}` : `APPLY: ${it.op.name}`}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold mb-3 text-gray-200">🔍 Log</h3>
              <div className="max-h-72 overflow-auto bg-slate-900 rounded p-3 border border-slate-700">
                {log.length === 0 ? (
                  <div className="text-gray-400 text-sm">No steps yet.</div>
                ) : (
                  <ul className="text-xs font-mono text-gray-300 space-y-1">
                    {log.map((l, i) => (<li key={i}>[{i+1}] {l}</li>))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Built with React, Tailwind CSS</p>
          <p className="mt-1">AI Learning Lab © 2025</p>
        </div>
      </div>

      <CodeViewer isOpen={showCode} onClose={()=>setShowCode(false)} cppCode={cppCode} baseName={'goal_stack_backward'} />
    </div>
  );
}
