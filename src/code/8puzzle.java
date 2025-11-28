import java.util.*;

class Node implements Comparable<Node> {
    String state; // "123456780"
    int g, h;

    Node(String state, int g, int h) {
        this.state = state;
        this.g = g;
        this.h = h;
    }

    int f() {
        return g + h;
    }

    @Override
    public int compareTo(Node other) {
        return Integer.compare(this.f(), other.f());
    }
}

public class EightPuzzleAStar {
    static String goal = "123456780";

    static int manhattan(String s) {
        int dist = 0;
        for (int i = 0; i < 9; i++) {
            char c = s.charAt(i);
            if (c == '0') continue;
            int val = c - '1';
            int goal_r = val / 3;
            int goal_c = val % 3;
            int cur_r = i / 3;
            int cur_c = i % 3;
            dist += Math.abs(cur_r - goal_r) + Math.abs(cur_c - goal_c);
        }
        return dist;
    }

    static List<String> getNeighbors(String s) {
        List<String> nbrs = new ArrayList<>();
        int zeroPos = s.indexOf('0');
        int r = zeroPos / 3;
        int c = zeroPos % 3;
        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};

        for (int k = 0; k < 4; k++) {
            int nr = r + dr[k];
            int nc = c + dc[k];
            if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
                int newPos = nr * 3 + nc;
                char[] arr = s.toCharArray();
                char tmp = arr[zeroPos];
                arr[zeroPos] = arr[newPos];
                arr[newPos] = tmp;
                nbrs.add(new String(arr));
            }
        }
        return nbrs;
    }

    static void printState(String s) {
        for (int i = 0; i < 9; i++) {
            char ch = s.charAt(i);
            System.out.print(ch == '0' ? "_ " : ch + " ");
            if (i % 3 == 2) System.out.println();
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Enter initial 8-puzzle state (9 numbers, use 0 for blank):");
        StringBuilder startBuilder = new StringBuilder();
        for (int i = 0; i < 9; i++) {
            int x = sc.nextInt();
            startBuilder.append((char) ('0' + x));
        }
        String start = startBuilder.toString();

        PriorityQueue<Node> open = new PriorityQueue<>();
        Map<String, Integer> bestG = new HashMap<>();
        Map<String, String> parent = new HashMap<>();

        Node startNode = new Node(start, 0, manhattan(start));
        open.add(startNode);
        bestG.put(start, 0);
        parent.put(start, null);

        boolean found = false;
        String goalState = null;

        while (!open.isEmpty()) {
            Node cur = open.poll();

            if (cur.state.equals(goal)) {
                found = true;
                goalState = cur.state;
                break;
            }

            if (cur.g > bestG.get(cur.state)) continue;

            for (String nbr : getNeighbors(cur.state)) {
                int newG = cur.g + 1;
                if (!bestG.containsKey(nbr) || newG < bestG.get(nbr)) {
                    bestG.put(nbr, newG);
                    parent.put(nbr, cur.state);
                    Node nxt = new Node(nbr, newG, manhattan(nbr));
                    open.add(nxt);
                }
            }
        }

        if (!found) {
            System.out.println("No solution found (unsolvable configuration).");
            return;
        }

        // Reconstruct path
        List<String> path = new ArrayList<>();
        String cur = goalState;
        while (cur != null) {
            path.add(cur);
            cur = parent.get(cur);
        }
        Collections.reverse(path);

        System.out.println("\nSolution found in " + (path.size() - 1) + " moves.\n");
        int step = 0;
        for (String s : path) {
            System.out.println("Step " + step++ + ":");
            printState(s);
        }
    }
}
