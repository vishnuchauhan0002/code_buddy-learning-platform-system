from flask import Blueprint, jsonify, request
from backend.app.utils.middleware import optional_token

study_bp = Blueprint('study_bp', __name__)

# Curated Visual DSA Diagram Sheets
VISUAL_SHEETS = [
    {
        "id": "two-pointers",
        "title": "Two Pointers & Sliding Window",
        "category": "Arrays & Strings",
        "difficulty": "Easy to Medium",
        "description": "Technique utilizing two index markers moving either convergently or in tandem to eliminate nested O(N^2) loops down to O(N).",
        "diagramType": "pointers",
        "patternKey": "left_right_convergence",
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "bestFor": ["Two Sum II (Sorted)", "Valid Palindrome", "Container With Most Water", "Trapping Rain Water"],
        "codeTemplate": "def two_pointers(arr, target):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        curr_sum = arr[left] + arr[right]\n        if curr_sum == target:\n            return [left, right]\n        elif curr_sum < target:\n            left += 1\n        else:\n            right -= 1\n    return []"
    },
    {
        "id": "tree-inversion",
        "title": "Binary Tree Inversion & Traversal",
        "category": "Trees & Recursion",
        "difficulty": "Easy to Hard",
        "description": "Recursive tree transformations where child subtrees are swapped recursively, forming mirror reflections or depth-first/breadth-first orderings.",
        "diagramType": "tree",
        "patternKey": "mirror_swap",
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(H) recursion height",
        "bestFor": ["Invert Binary Tree", "Maximum Depth", "Lowest Common Ancestor", "Serialize & Deserialize Tree"],
        "codeTemplate": "def invertTree(root):\n    if not root:\n        return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root"
    },
    {
        "id": "linked-list-reversal",
        "title": "Linked List In-Place Pointer Inversion",
        "category": "Linked Lists",
        "difficulty": "Medium",
        "description": "Reverses directional pointers of singly-linked nodes using three sequential pointers (prev, curr, next_node) without allocating extra memory.",
        "diagramType": "linked_list",
        "patternKey": "three_pointers_shift",
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "bestFor": ["Reverse Linked List", "Palindrome Linked List", "Reverse Nodes in k-Group", "Reorder List"],
        "codeTemplate": "def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_temp = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_temp\n    return prev"
    },
    {
        "id": "dp-grid",
        "title": "Dynamic Programming 2D Grid / State Table",
        "category": "Dynamic Programming",
        "difficulty": "Medium to Hard",
        "description": "Tabulation technique solving overlapping subproblems by filling a 2D matrix where each cell represents an optimal sub-solution derived from previous neighbor cells.",
        "diagramType": "dp_table",
        "patternKey": "grid_paths",
        "timeComplexity": "O(M * N)",
        "spaceComplexity": "O(M * N) or O(N) optimized",
        "bestFor": ["Unique Paths", "Minimum Path Sum", "0/1 Knapsack", "Longest Common Subsequence"],
        "codeTemplate": "def uniquePaths(m: int, n: int) -> int:\n    dp = [[1] * n for _ in range(m)]\n    for i in range(1, m):\n        for j in range(1, n):\n            dp[i][j] = dp[i-1][j] + dp[i][j-1]\n    return dp[m-1][n-1]"
    },
    {
        "id": "fast-slow-pointers",
        "title": "Fast & Slow Pointers (Floyd's Cycle)",
        "category": "Linked Lists & Arrays",
        "difficulty": "Medium",
        "description": "Two pointers moving at disparate velocities (slow: 1 step, fast: 2 steps). If a cycle exists, the distance between them contracts by 1 each step until they collide.",
        "diagramType": "cycle_track",
        "patternKey": "tortoise_and_hare",
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "bestFor": ["Linked List Cycle I & II", "Middle of the Linked List", "Find the Duplicate Number", "Happy Number"],
        "codeTemplate": "def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False"
    },
    {
        "id": "graph-traversal",
        "title": "Graph BFS (Queue) vs DFS (Stack/Recursion)",
        "category": "Graphs",
        "difficulty": "Medium to Hard",
        "description": "Breadth-First Search explores outward layer-by-layer to guarantee the shortest path in unweighted graphs; Depth-First Search dives deep along branch lines for connectivity.",
        "diagramType": "graph_nodes",
        "patternKey": "bfs_vs_dfs",
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V)",
        "bestFor": ["Number of Islands", "Clone Graph", "Course Schedule", "Word Ladder", "Rotting Oranges"],
        "codeTemplate": "from collections import deque\ndef bfs(graph, start):\n    visited = {start}\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)"
    }
]

# Spaced Repetition Flashcards
FLASHCARDS = [
    {
        "id": 1,
        "topic": "Arrays & Two Pointers",
        "title": "When to apply Two Pointers vs Hash Map?",
        "difficulty": "Medium",
        "question": "Given an array where you need to find two elements meeting a condition, when is Two Pointers preferred over a Hash Map?",
        "concept": "Two Pointers achieves O(1) auxiliary memory space if the array is already sorted (or cheap to sort), whereas a Hash Map requires O(N) additional space.",
        "codeSnippet": "# Two Pointers: O(N) time, O(1) space\nwhile left < right:\n    s = nums[left] + nums[right]\n    if s == target: return [left, right]\n    elif s < target: left += 1\n    else: right -= 1",
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(1)",
        "mnemonic": "Sorted? Point and squeeze. Unsorted and order matters? Hash and remember."
    },
    {
        "id": 2,
        "topic": "Sliding Window",
        "title": "Variable vs Fixed Size Sliding Window",
        "difficulty": "Medium",
        "question": "What is the core difference in pointer management between a Fixed vs Variable Sliding Window?",
        "concept": "Fixed window advances both 'left' and 'right' pointers simultaneously once length K is reached. Variable window expands 'right' until an invalid condition triggers, then shrinks 'left' until validity is restored.",
        "codeSnippet": "# Variable window template\nleft = 0\nfor right in range(len(s)):\n    add(s[right])\n    while not is_valid():\n        remove(s[left])\n        left += 1\n    max_len = max(max_len, right - left + 1)",
        "timeComplexity": "O(N)",
        "spaceComplexity": "O(K) character map",
        "mnemonic": "Right explores the future; Left pays off the debt."
    },
    {
        "id": 3,
        "topic": "Binary Search",
        "title": "Binary Search Invariant: mid vs mid + 1",
        "difficulty": "Hard",
        "question": "How do you avoid an infinite loop when writing `left = mid` vs `left = mid + 1` in binary search?",
        "concept": "When your logic sets `left = mid`, integer division rounds down, causing an infinite loop when `right - left == 1`. Fix it by calculating `mid = left + (right - left + 1) // 2` (bias right).",
        "codeSnippet": "# Bias right to prevent infinite loop with left = mid\nmid = left + (right - left + 1) // 2\nif condition(mid):\n    left = mid\nelse:\n    right = mid - 1",
        "timeComplexity": "O(log N)",
        "spaceComplexity": "O(1)",
        "mnemonic": "If you assign left = mid, round MID UP (+ 1)."
    },
    {
        "id": 4,
        "topic": "Dynamic Programming",
        "title": "0/1 Knapsack vs Unbounded Knapsack",
        "difficulty": "Hard",
        "question": "How does the inner loop iteration direction differ between 0/1 Knapsack and Unbounded Knapsack when space-optimized to 1D?",
        "concept": "In 0/1 Knapsack, iterate weights BACKWARDS from capacity down to item weight so each item is used at most once. In Unbounded Knapsack, iterate FORWARD so the current item can be reused.",
        "codeSnippet": "# 0/1 Knapsack (Reverse order)\nfor item_w, val in items:\n    for w in range(W, item_w - 1, -1):\n        dp[w] = max(dp[w], dp[w - item_w] + val)",
        "timeComplexity": "O(N * W)",
        "spaceComplexity": "O(W) 1D array",
        "mnemonic": "Single use? Go in reverse! Infinite use? March forward!"
    },
    {
        "id": 5,
        "topic": "Trees",
        "title": "Lowest Common Ancestor (LCA) in a BST vs General Tree",
        "difficulty": "Medium",
        "question": "Why is finding LCA in a Binary Search Tree (BST) significantly faster than in a general Binary Tree?",
        "concept": "In a BST, ordering properties allow you to make directional decisions: if both p and q are smaller than root, LCA is in left subtree; if both are larger, it's in right subtree; otherwise, root is the split point (LCA).",
        "codeSnippet": "def lowestCommonAncestor(root, p, q):\n    while root:\n        if p.val < root.val and q.val < root.val:\n            root = root.left\n        elif p.val > root.val and q.val > root.val:\n            root = root.right\n        else:\n            return root",
        "timeComplexity": "O(H) where H is tree height",
        "spaceComplexity": "O(1) iterative",
        "mnemonic": "If both stray together, follow them. If they diverge, you are their split!"
    },
    {
        "id": 6,
        "topic": "Graphs",
        "title": "Detecting Cycles in Directed vs Undirected Graphs",
        "difficulty": "Hard",
        "question": "Why does simple 2-color (visited/unvisited) DFS fail to correctly detect cycles in Directed graphs?",
        "concept": "In directed graphs, cross-edges to previously finished components do not constitute cycles. You need 3-coloring: 0 = Unvisited, 1 = Currently in recursion stack (back-edge = cycle!), 2 = Fully processed.",
        "codeSnippet": "# 0: Unvisited, 1: Visiting (Cycle!), 2: Visited\nstate = {}\ndef has_cycle(node):\n    if state.get(node) == 1: return True\n    if state.get(node) == 2: return False\n    state[node] = 1\n    for neighbor in graph[node]:\n        if has_cycle(neighbor): return True\n    state[node] = 2\n    return False",
        "timeComplexity": "O(V + E)",
        "spaceComplexity": "O(V)",
        "mnemonic": "Three shades: White (fresh), Gray (in-flight danger), Black (safe)."
    }
]

# Interactive Roadmap
STUDY_ROADMAPS = [
    {
        "id": "faang-30",
        "name": "30-Day FAANG & Top Tech Accelerator",
        "subtitle": "Master high-frequency patterns asked in Google, Amazon, Microsoft, and Meta coding interviews.",
        "estimatedHours": 45,
        "weeks": [
            {
                "weekNumber": 1,
                "title": "Arrays, Two Pointers & Hashing",
                "days": [
                    {"day": 1, "topic": "Two Sum & Hash Sets", "problem": "Two Sum", "solved": True},
                    {"day": 2, "topic": "Two Pointers Convergence", "problem": "Valid Palindrome", "solved": True},
                    {"day": 3, "topic": "Sliding Window Maximum", "problem": "Best Time to Buy and Sell Stock", "solved": True},
                    {"day": 4, "topic": "Prefix Sums & Subarrays", "problem": "Subarray Sum Equals K", "solved": False},
                    {"day": 5, "topic": "Kadane's Algorithm", "problem": "Maximum Subarray", "solved": True},
                    {"day": 6, "topic": "Product of Array Except Self", "problem": "Product of Array Except Self", "solved": False},
                    {"day": 7, "topic": "Weekly Review & Mock Contest", "problem": "Weekend Sprint Contest", "solved": False}
                ]
            },
            {
                "weekNumber": 2,
                "title": "Linked Lists, Stacks & Binary Search",
                "days": [
                    {"day": 8, "topic": "Pointer Reversal", "problem": "Reverse Linked List", "solved": True},
                    {"day": 9, "topic": "Floyd's Cycle Detection", "problem": "Linked List Cycle", "solved": False},
                    {"day": 10, "topic": "Monotonic Stack Pattern", "problem": "Daily Temperatures", "solved": False},
                    {"day": 11, "topic": "Balanced Brackets", "problem": "Valid Parentheses", "solved": True},
                    {"day": 12, "topic": "Rotated Binary Search", "problem": "Search in Rotated Sorted Array", "solved": False},
                    {"day": 13, "topic": "Binary Search on Answer", "problem": "Koko Eating Bananas", "solved": False},
                    {"day": 14, "topic": "Mock Speed Test", "problem": "Mid-Program Assessment", "solved": False}
                ]
            },
            {
                "weekNumber": 3,
                "title": "Trees, DFS, BFS & Heaps",
                "days": [
                    {"day": 15, "topic": "Tree Traversal Mastery", "problem": "Binary Tree Inorder Traversal", "solved": False},
                    {"day": 16, "topic": "Tree Depth & Symmetry", "problem": "Maximum Depth of Binary Tree", "solved": False},
                    {"day": 17, "topic": "Lowest Common Ancestor", "problem": "LCA in Binary Search Tree", "solved": False},
                    {"day": 18, "topic": "Level Order BFS", "problem": "Binary Tree Level Order Traversal", "solved": False},
                    {"day": 19, "topic": "Top K Frequent Elements", "problem": "Top K Elements using Min-Heap", "solved": False},
                    {"day": 20, "topic": "Trie Prefix Tree", "problem": "Implement Trie (Prefix Tree)", "solved": False},
                    {"day": 21, "topic": "Review & Mock Session", "problem": "Trees & Heaps Evaluation", "solved": False}
                ]
            },
            {
                "weekNumber": 4,
                "title": "Graphs, Dynamic Programming & Final Prep",
                "days": [
                    {"day": 22, "topic": "Graph BFS/DFS Grid", "problem": "Number of Islands", "solved": False},
                    {"day": 23, "topic": "Topological Sorting", "problem": "Course Schedule I & II", "solved": False},
                    {"day": 24, "topic": "1D DP Memoization", "problem": "Climbing Stairs & House Robber", "solved": False},
                    {"day": 25, "topic": "Coin Change (Unbounded DP)", "problem": "Coin Change", "solved": False},
                    {"day": 26, "topic": "Longest Common Subsequence", "problem": "LCS 2D Matrix", "solved": False},
                    {"day": 27, "topic": "0/1 Knapsack Invariants", "problem": "Partition Equal Subset Sum", "solved": False},
                    {"day": 28, "topic": "Backtracking Combinations", "problem": "Subsets & Permutations", "solved": False},
                    {"day": 29, "topic": "System Design Foundations", "problem": "Scalability & Caching Overview", "solved": False},
                    {"day": 30, "topic": "Full FAANG Simulation", "problem": "45-Minute Live Interview Exam", "solved": False}
                ]
            }
        ]
    }
]

# Big-O Complexity Graph / Table Data
BIG_O_DATA = [
    {
        "notation": "O(1)",
        "name": "Constant Time",
        "rating": "Excellent",
        "color": "emerald",
        "n10": 1,
        "n100": 1,
        "n1000": 1,
        "example": "Hash table lookup, array index access, push/pop on stack"
    },
    {
        "notation": "O(log N)",
        "name": "Logarithmic Time",
        "rating": "Good",
        "color": "teal",
        "n10": 3.3,
        "n100": 6.6,
        "n1000": 10,
        "example": "Binary search, balanced BST operations, divide & conquer"
    },
    {
        "notation": "O(N)",
        "name": "Linear Time",
        "rating": "Fair",
        "color": "blue",
        "n10": 10,
        "n100": 100,
        "n1000": 1000,
        "example": "Single pass loop, two-pointer scan, linear search, tree traversal"
    },
    {
        "notation": "O(N log N)",
        "name": "Linearithmic Time",
        "rating": "Acceptable",
        "color": "amber",
        "n10": 33,
        "n100": 664,
        "n1000": 9965,
        "example": "Merge sort, quick sort (average), heap sort"
    },
    {
        "notation": "O(N^2)",
        "name": "Quadratic Time",
        "rating": "Poor",
        "color": "orange",
        "n10": 100,
        "n100": 10000,
        "n1000": 1000000,
        "example": "Nested loops, bubble sort, brute force pairs comparison"
    },
    {
        "notation": "O(2^N)",
        "name": "Exponential Time",
        "rating": "Terrible",
        "color": "rose",
        "n10": 1024,
        "n100": "1.27e30",
        "n1000": "Overflow",
        "example": "Recursive Fibonacci, generating all subsets (power set)"
    }
]


@study_bp.route('/visual-sheets', methods=['GET'])
def get_visual_sheets():
    return jsonify({
        'success': True,
        'count': len(VISUAL_SHEETS),
        'sheets': VISUAL_SHEETS
    }), 200


@study_bp.route('/flashcards', methods=['GET'])
def get_flashcards():
    topic = request.args.get('topic')
    cards = FLASHCARDS
    if topic:
        cards = [c for c in FLASHCARDS if topic.lower() in c['topic'].lower()]
    return jsonify({
        'success': True,
        'count': len(cards),
        'cards': cards
    }), 200


@study_bp.route('/roadmaps', methods=['GET'])
def get_roadmaps():
    return jsonify({
        'success': True,
        'roadmaps': STUDY_ROADMAPS
    }), 200


@study_bp.route('/big-o', methods=['GET'])
def get_big_o_data():
    return jsonify({
        'success': True,
        'complexities': BIG_O_DATA
    }), 200
