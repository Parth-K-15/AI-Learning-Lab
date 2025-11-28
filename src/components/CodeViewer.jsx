import React, { useState } from 'react';

const defaultPythonCode = `# Python program to illustrate Missionaries & Cannibals Problem
# This code is contributed by Sunit Mal

print("\\n")
print("\\tGame Start\\nNow the task is to move all of them to right side of the river")
print("rules:\\n1. The boat can carry at most two people\\n2. If cannibals num greater than missionaries then the cannibals would eat the missionaries\\n3. The boat cannot cross the river by itself with no people on board")

lM = 3  # lM = Left side Missionaries number
lC = 3  # lC = Left side Cannibals number
rM = 0  # rM = Right side Missionaries number
rC = 0  # rC = Right side cannibals number
userM = 0  # userM = User input for number of missionaries for right to left side travel
userC = 0  # userC = User input for number of cannibals for right to left travel
k = 0

print("\\nM M M C C C |     --- | \\n")

try:
    while(True):
        while(True):
            print("Left side -> right side river travel")
            # uM = user input for number of missionaries for left to right travel
            # uC = user input for number of cannibals for left to right travel
            uM = int(input("Enter number of Missionaries travel => "))
            uC = int(input("Enter number of Cannibals travel => "))

            if((uM == 0) and (uC == 0)):
                print("Empty travel not possible")
                print("Re-enter : ")
            elif(((uM + uC) <= 2) and ((lM - uM) >= 0) and ((lC - uC) >= 0)):
                break
            else:
                print("Wrong input re-enter : ")
                
        lM = (lM - uM)
        lC = (lC - uC)
        rM += uM
        rC += uC

        print("\\n")
        for i in range(0, lM):
            print("M ", end="")
        for i in range(0, lC):
            print("C ", end="")
        print("| --> | ", end="")
        for i in range(0, rM):
            print("M ", end="")
        for i in range(0, rC):
            print("C ", end="")
        print("\\n")

        k += 1

        if(((lC == 3) and (lM == 1)) or ((lC == 3) and (lM == 2)) or 
           ((lC == 2) and (lM == 1)) or ((rC == 3) and (rM == 1)) or 
           ((rC == 3) and (rM == 2)) or ((rC == 2) and (rM == 1))):
            print("Cannibals eat missionaries:\\nYou lost the game")
            break

        if((rM + rC) == 6):
            print("You won the game : \\n\\tCongrats")
            print("Total attempt")
            print(k)
            break
            
        while(True):
            print("Right side -> Left side river travel")
            userM = int(input("Enter number of Missionaries travel => "))
            userC = int(input("Enter number of Cannibals travel => "))

            if((userM == 0) and (userC == 0)):
                print("Empty travel not possible")
                print("Re-enter : ")
            elif(((userM + userC) <= 2) and ((rM - userM) >= 0) and ((rC - userC) >= 0)):
                break
            else:
                print("Wrong input re-enter : ")
                
        lM += userM
        lC += userC
        rM -= userM
        rC -= userC

        k += 1
        
        print("\\n")
        for i in range(0, lM):
            print("M ", end="")
        for i in range(0, lC):
            print("C ", end="")
        print("| <-- | ", end="")
        for i in range(0, rM):
            print("M ", end="")
        for i in range(0, rC):
            print("C ", end="")
        print("\\n")

        if(((lC == 3) and (lM == 1)) or ((lC == 3) and (lM == 2)) or 
           ((lC == 2) and (lM == 1)) or ((rC == 3) and (rM == 1)) or 
           ((rC == 3) and (rM == 2)) or ((rC == 2) and (rM == 1))):
            print("Cannibals eat missionaries:\\nYou lost the game")
            break
            
except EOFError as e:
    print("\\nInvalid input please retry !!")
`;

// Default C++ code (A* search) for 3 Missionaries and 3 Cannibals from src/components/3M3C.cpp
const defaultCppCode = `#include <bits/stdc++.h>
using namespace std;

struct State {
  int missionaries_left;
  int cannibals_left;
  int boat; // 1 = left, 0 = right
  int cost;

  // Default constructor
  State() : missionaries_left(0), cannibals_left(0), boat(0), cost(0) {}

  State(int m, int c, int b, int cost = 0)
    : missionaries_left(m), cannibals_left(c), boat(b), cost(cost) {}

  // Check if state is valid
  bool is_valid() const {
    int m_right = 3 - missionaries_left;
    int c_right = 3 - cannibals_left;

    if (missionaries_left < 0 || cannibals_left < 0 ||
      missionaries_left > 3 || cannibals_left > 3) {
      return false;
    }

    if (missionaries_left > 0 && missionaries_left < cannibals_left)
      return false;

    if (m_right > 0 && m_right < c_right)
      return false;

    return true;
  }

  // Check if goal reached
  bool is_goal() const {
    return missionaries_left == 0 && cannibals_left == 0 && boat == 0;
  }

  // Heuristic function
  int heuristic() const {
    return (missionaries_left + cannibals_left + 1);
  }

  // Print state
  void print_state() const {
    cout << "Left(M=" << missionaries_left << ", C=" << cannibals_left << ") ";
    if (boat == 1)
      cout << "<--⛵-- ";
    else
      cout << "--⛵--> ";
  cout << "Right(M=" << 3 - missionaries_left << ", C=" << 3 - cannibals_left << ")\\n";
  }

  // Equality operator
  bool operator==(const State &other) const {
    return missionaries_left == other.missionaries_left &&
         cannibals_left == other.cannibals_left &&
         boat == other.boat;
  }
};

// Hash function for unordered_set/map
struct StateHash {
  size_t operator()(const State &s) const {
    return hash<int>()(s.missionaries_left * 100 + s.cannibals_left * 10 + s.boat);
  }
};

// Priority Queue comparator
struct Compare {
  bool operator()(const State &a, const State &b) const {
    return (a.cost + a.heuristic()) > (b.cost + b.heuristic());
  }
};

// Generate successors
vector<State> get_successors(const State &current) {
  vector<State> successors;
  vector<pair<int, int>> moves = {{1, 0}, {2, 0}, {0, 1}, {0, 2}, {1, 1}};

  for (auto [m, c] : moves) {
    State next(current.missionaries_left, current.cannibals_left, current.boat, current.cost + 1);

    if (current.boat == 1) { // boat on left
      next.missionaries_left -= m;
      next.cannibals_left -= c;
      next.boat = 0;
    } else { // boat on right
      next.missionaries_left += m;
      next.cannibals_left += c;
      next.boat = 1;
    }

    if (next.is_valid()) {
      successors.push_back(next);
    }
  }

  return successors;
}

// A* Search
void a_star(const State &start) {
  priority_queue<State, vector<State>, Compare> open_list;
  unordered_map<State, State, StateHash> came_from;
  unordered_set<State, StateHash> visited;

  open_list.push(start);

  while (!open_list.empty()) {
    State current = open_list.top();
    open_list.pop();

    if (visited.find(current) != visited.end())
      continue;
    visited.insert(current);

    if (current.is_goal()) {
      vector<State> path;
      State s = current;

      while (came_from.find(s) != came_from.end()) {
        path.push_back(s);
        s = came_from[s];
      }
      path.push_back(s);
      reverse(path.begin(), path.end());

  cout << "Solution found using A* Search:\\n";
      for (auto &state : path)
        state.print_state();
      return;
    }

    for (auto &next_state : get_successors(current)) {
      if (visited.find(next_state) == visited.end()) {
        came_from[next_state] = current;
        open_list.push(next_state);
      }
    }
  }

  cout << "No solution found.\\n";
}

int main() {
  State start(3, 3, 1);
  a_star(start);
  return 0;
}
`;

export default function CodeViewer({ isOpen, onClose, pyCode, cppCode: cppCodeProp, javaCode, baseName }) {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [copySuccess, setCopySuccess] = useState('');

  if (!isOpen) return null;

  const currentCode = selectedLanguage === 'python' ? (pyCode || defaultPythonCode) : 
                     selectedLanguage === 'java' ? javaCode :
                     (cppCodeProp || defaultCppCode);
  const fileExtension = selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : 'cpp';
  const fileName = `${baseName || (selectedLanguage === 'python' ? 'missionaries_cannibals' : '3m3c_astar')}.${fileExtension}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopySuccess('✓ Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border-2 border-indigo-500 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-indigo-400 flex items-center gap-2">
              💻 Console Implementation Code
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Language Selector */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLanguage('python')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedLanguage === 'python'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              🐍 Python
            </button>
            <button
              onClick={() => setSelectedLanguage('cpp')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedLanguage === 'cpp'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              ⚙️ C++
            </button>
            {javaCode && (
              <button
                onClick={() => setSelectedLanguage('java')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  selectedLanguage === 'java'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                ☕ Java
              </button>
            )}
          </div>
        </div>

        {/* Code Display */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
              <code>{currentCode}</code>
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <div className="text-gray-400 text-sm">
            <span className="font-semibold text-indigo-400">{fileName}</span>
            {' '} - Console-based implementation
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              {copySuccess || '📋 Copy Code'}
            </button>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ⬇️ Download {fileExtension.toUpperCase()}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
