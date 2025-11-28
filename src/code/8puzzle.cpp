#include <bits/stdc++.h>
using namespace std;

struct Node {
    string state; // "123405678"
    int g, h;
    // for priority queue (min-heap by f = g + h)
    bool operator>(const Node &other) const {
        return g + h > other.g + other.h;
    }
};

string goal = "123456780";

int manhattan(const string &s) {
    int dist = 0;
    for (int i = 0; i < 9; i++) {
        char c = s[i];
        if (c == '0') continue;
        int val = c - '1';  // 0..7
        int goal_r = val / 3;
        int goal_c = val % 3;
        int cur_r = i / 3;
        int cur_c = i % 3;
        dist += abs(cur_r - goal_r) + abs(cur_c - goal_c);
    }
    return dist;
}

vector<string> getNeighbors(const string &s) {
    vector<string> nbrs;
    int zeroPos = s.find('0');
    int r = zeroPos / 3;
    int c = zeroPos % 3;
    int dr[4] = {-1, 1, 0, 0};
    int dc[4] = {0, 0, -1, 1};

    for (int k = 0; k < 4; k++) {
        int nr = r + dr[k];
        int nc = c + dc[k];
        if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
            int newPos = nr * 3 + nc;
            string t = s;
            swap(t[zeroPos], t[newPos]);
            nbrs.push_back(t);
        }
    }
    return nbrs;
}

void printState(const string &s) {
    for (int i = 0; i < 9; i++) {
        if (s[i] == '0') cout << "_ ";
        else cout << s[i] << " ";
        if (i % 3 == 2) cout << "\n";
    }
}

int main() {
    cout << "Enter initial 8-puzzle state (9 numbers, use 0 for blank):\n";
    string start;
    for (int i = 0; i < 9; i++) {
        int x;
        cin >> x;
        start.push_back(char('0' + x));
    }

    priority_queue<Node, vector<Node>, greater<Node>> open;
    unordered_map<string, int> bestG;
    unordered_map<string, string> parent;

    Node startNode{start, 0, manhattan(start)};
    open.push(startNode);
    bestG[start] = 0;
    parent[start] = ""; // start has no parent

    bool found = false;
    string goalState;

    while (!open.empty()) {
        Node cur = open.top();
        open.pop();

        if (cur.state == goal) {
            found = true;
            goalState = cur.state;
            break;
        }

        // skip if we already found a better path
        if (cur.g > bestG[cur.state]) continue;

        for (const string &nbr : getNeighbors(cur.state)) {
            int newG = cur.g + 1;
            if (!bestG.count(nbr) || newG < bestG[nbr]) {
                bestG[nbr] = newG;
                parent[nbr] = cur.state;
                Node nxt{nbr, newG, manhattan(nbr)};
                open.push(nxt);
            }
        }
    }

    if (!found) {
        cout << "No solution found (unsolvable configuration).\n";
        return 0;
    }

    // Reconstruct path
    vector<string> path;
    string cur = goalState;
    while (cur != "") {
        path.push_back(cur);
        cur = parent[cur];
    }
    reverse(path.begin(), path.end());

    cout << "\nSolution found in " << (int)path.size() - 1 << " moves.\n";
    for (size_t step = 0; step < path.size(); ++step) {
        cout << "\nStep " << step << ":\n";
        printState(path[step]);
    }
    return 0;
}
