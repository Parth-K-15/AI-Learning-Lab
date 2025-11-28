import heapq

goal = "123456780"

def manhattan(state: str) -> int:
    dist = 0
    for i, ch in enumerate(state):
        if ch == '0':
            continue
        val = int(ch) - 1
        goal_r, goal_c = divmod(val, 3)
        cur_r, cur_c = divmod(i, 3)
        dist += abs(cur_r - goal_r) + abs(cur_c - goal_c)
    return dist

def get_neighbors(state: str):
    neighbors = []
    zero_pos = state.index('0')
    r, c = divmod(zero_pos, 3)
    moves = [(-1,0),(1,0),(0,-1),(0,1)]
    for dr, dc in moves:
        nr, nc = r + dr, c + dc
        if 0 <= nr < 3 and 0 <= nc < 3:
            new_pos = nr * 3 + nc
            s_list = list(state)
            s_list[zero_pos], s_list[new_pos] = s_list[new_pos], s_list[zero_pos]
            neighbors.append("".join(s_list))
    return neighbors

def print_state(state: str):
    for i, ch in enumerate(state):
        print("_" if ch == '0' else ch, end=" ")
        if i % 3 == 2:
            print()
    print()

def a_star(start: str):
    open_heap = []
    g_score = {start: 0}
    parent = {start: None}

    start_h = manhattan(start)
    heapq.heappush(open_heap, (start_h, 0, start))  # (f, g, state)

    while open_heap:
        f, g, state = heapq.heappop(open_heap)

        if state == goal:
            # reconstruct path
            path = []
            cur = state
            while cur is not None:
                path.append(cur)
                cur = parent[cur]
            path.reverse()
            return path

        if g > g_score[state]:
            continue

        for nbr in get_neighbors(state):
            new_g = g + 1
            if nbr not in g_score or new_g < g_score[nbr]:
                g_score[nbr] = new_g
                parent[nbr] = state
                h = manhattan(nbr)
                heapq.heappush(open_heap, (new_g + h, new_g, nbr))

    return None

if __name__ == "__main__":
    print("Enter initial 8-puzzle state (9 numbers, use 0 for blank):")
    nums = []
    while len(nums) < 9:
        nums.extend(input().split())
    nums = nums[:9]
    start = "".join(nums)

    path = a_star(start)

    if path is None:
        print("No solution found (unsolvable configuration).")
    else:
        print(f"\nSolution found in {len(path)-1} moves.\n")
        for step, state in enumerate(path):
            print(f"Step {step}:")
            print_state(state)
