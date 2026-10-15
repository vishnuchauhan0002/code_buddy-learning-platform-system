import os
import sys
import json
from datetime import datetime, timedelta, date

# Ensure root directory is on python path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app import create_app
from backend.app.extensions import db
from backend.app.models import (
    User, UserProfile, Problem, ProblemTestCase, Submission,
    SavedSnippet, Bookmark, Question, Answer, Vote, Comment,
    Mentor, MentoringRequest, Contest, ContestProblem, ContestParticipant,
    LearningActivity
)

app = create_app()

def seed_database():
    with app.app_context():
        print("Clearing existing tables...")
        db.drop_all()
        db.create_all()
        print("Tables created.")

        # 1. Create Users
        print("Seeding users...")
        # Demo Student (matching panels 3, 4, 12: Aarav Mehta)
        student_user = User(
            username='aarav123',
            email='student@example.com',
            role='student'
        )
        student_user.set_password('Password123!')
        db.session.add(student_user)
        db.session.flush()

        student_profile = UserProfile(
            user_id=student_user.id,
            full_name='Aarav Mehta',
            bio='Passionate about coding and building cool projects!',
            avatar_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            skill_level='Intermediate',
            preferred_languages='Python, JavaScript, C++',
            github_url='https://github.com',
            linkedin_url='https://linkedin.com',
            reputation_points=250,
            total_points=2100,
            current_streak=12,
            highest_streak=15,
            learning_hours=42.0,
            last_active_date=date.today()
        )
        db.session.add(student_profile)

        # Demo Mentors (matching panel 11)
        mentor_neha_user = User(
            username='neha_gupta',
            email='mentor@example.com',
            role='mentor'
        )
        mentor_neha_user.set_password('Password123!')
        db.session.add(mentor_neha_user)
        db.session.flush()

        neha_profile = UserProfile(
            user_id=mentor_neha_user.id,
            full_name='Dr. Neha Gupta',
            bio='Senior Software Engineer with 7+ years of experience in distributed systems, AI/ML, and clean architecture.',
            avatar_url='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            skill_level='Advanced',
            preferred_languages='Python, Go, Java',
            reputation_points=980,
            total_points=5400
        )
        db.session.add(neha_profile)

        neha_mentor = Mentor(
            user_id=mentor_neha_user.id,
            title='Senior Software Engineer',
            company='Google / Cloud Systems',
            bio='Passionate about helping budding software engineers master Data Structures, Algorithms, and System Design.',
            experience_years=5,
            rating=4.9,
            reviews_count=128,
            skills='Python, AI/ML, System Design, Algorithms'
        )
        db.session.add(neha_mentor)

        # Rohit Kumar Mentor
        mentor_rohit_user = User(
            username='rohit_kumar',
            email='rohit@example.com',
            role='mentor'
        )
        mentor_rohit_user.set_password('Password123!')
        db.session.add(mentor_rohit_user)
        db.session.flush()

        rohit_profile = UserProfile(
            user_id=mentor_rohit_user.id,
            full_name='Rohit Kumar',
            bio='Full Stack Tech Lead building scalable frontend and backend platforms.',
            avatar_url='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            skill_level='Advanced',
            preferred_languages='JavaScript, TypeScript, React',
            reputation_points=850,
            total_points=4200
        )
        db.session.add(rohit_profile)

        rohit_mentor = Mentor(
            user_id=mentor_rohit_user.id,
            title='Full Stack Developer',
            company='Meta / Product Infrastructure',
            bio='Specialized in modern React ecosystems, Node.js microservices, and full stack interview prep.',
            experience_years=4,
            rating=4.8,
            reviews_count=96,
            skills='JavaScript, React, Node.js, Next.js'
        )
        db.session.add(rohit_mentor)

        # Ananya Singh Mentor
        mentor_ananya_user = User(
            username='ananya_singh',
            email='ananya@example.com',
            role='mentor'
        )
        mentor_ananya_user.set_password('Password123!')
        db.session.add(mentor_ananya_user)
        db.session.flush()

        ananya_profile = UserProfile(
            user_id=mentor_ananya_user.id,
            full_name='Ananya Singh',
            bio='Data Scientist focused on Deep Learning and predictive modeling.',
            avatar_url='https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
            skill_level='Advanced',
            preferred_languages='Python, SQL, PyTorch',
            reputation_points=720,
            total_points=3800
        )
        db.session.add(ananya_profile)

        ananya_mentor = Mentor(
            user_id=mentor_ananya_user.id,
            title='Data Scientist',
            company='Uber AI Labs',
            bio='Helping students transition into Data Science, Machine Learning, and Big Data engineering.',
            experience_years=3,
            rating=4.8,
            reviews_count=75,
            skills='Python, Machine Learning, Data Science, SQL'
        )
        db.session.add(ananya_mentor)

        # Leaderboard Peers (matching panel 9)
        peers_data = [
            ('priya_sharma', 'Priya Sharma', 'priya@example.com', 2450, 320, 18, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
            ('rohan_verma', 'Rohan Verma', 'rohan@example.com', 1950, 260, 9, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
            ('sneha_patel', 'Sneha Patel', 'sneha@example.com', 1860, 240, 14, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'),
            ('aditya_singh', 'Aditya Singh', 'aditya@example.com', 1720, 210, 7, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'),
        ]

        for u_name, f_name, u_email, pts, solved_c, strk, avt in peers_data:
            p_user = User(username=u_name, email=u_email, role='student')
            p_user.set_password('Password123!')
            db.session.add(p_user)
            db.session.flush()

            p_prof = UserProfile(
                user_id=p_user.id,
                full_name=f_name,
                bio=f"Learner & competitive programmer on CodeBuddy.",
                avatar_url=avt,
                skill_level='Advanced' if pts > 2000 else 'Intermediate',
                total_points=pts,
                reputation_points=pts // 10,
                current_streak=strk,
                highest_streak=strk + 4,
                learning_hours=float(solved_c * 0.4),
                last_active_date=date.today()
            )
            db.session.add(p_prof)

        # Admin user
        admin_user = User(
            username='admin',
            email='admin@example.com',
            role='admin'
        )
        admin_user.set_password('AdminPassword123!')
        db.session.add(admin_user)
        db.session.flush()

        admin_profile = UserProfile(
            user_id=admin_user.id,
            full_name='CodeBuddy Administrator',
            bio='Platform Administrator and Curriculum Designer.',
            avatar_url='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            skill_level='Advanced',
            total_points=10000
        )
        db.session.add(admin_profile)
        db.session.commit()
        print("Users and profiles seeded.")

        # 2. Seed Problems (matching panel 6 & DSA requirements)
        print("Seeding DSA problems...")
        problems_data = [
            {
                'title': 'Two Sum',
                'slug': 'two-sum',
                'difficulty': 'Easy',
                'topic': 'Arrays & Hash Table',
                'tags': 'Arrays, Hash Table',
                'points': 100,
                'description': (
                    "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\n"
                    "You may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\n"
                    "You can return the answer in any order."
                ),
                'input_format': "Line 1: space-separated integers representing `nums`.\nLine 2: integer `target`.",
                'output_format': "Two space-separated indices.",
                'constraints': "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
                'sample_input': "2 7 11 15\n9",
                'sample_output': "0 1",
                'sample_explanation': "Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.",
                'hints': [
                    "A brute force approach checks all pairs in O(n^2).",
                    "Can you use a hash map to look up if the complement (target - num) exists in O(1) time?"
                ],
                'starter_code': {
                    'python': "def two_sum(nums, target):\n    # Write your solution here\n    hashmap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in hashmap:\n            return [hashmap[diff], i]\n        hashmap[n] = i\n    return []\n\nif __name__ == '__main__':\n    import sys\n    input_data = sys.stdin.read().split()\n    if input_data:\n        target = int(input_data[-1])\n        nums = [int(x) for x in input_data[:-1]]\n        res = two_sum(nums, target)\n        print(f'{res[0]} {res[1]}')\n",
                    'javascript': "const fs = require('fs');\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nconst input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);\nif (input.length > 1) {\n    const target = parseInt(input.pop());\n    const nums = input.map(Number);\n    const res = twoSum(nums, target);\n    console.log(`${res[0]} ${res[1]}`);\n}\n"
                },
                'test_cases': [
                    {'input': '2 7 11 15\n9', 'output': '0 1', 'is_hidden': False},
                    {'input': '3 2 4\n6', 'output': '1 2', 'is_hidden': False},
                    {'input': '3 3\n6', 'output': '0 1', 'is_hidden': True},
                    {'input': '1 5 8 10 14\n19', 'output': '1 4', 'is_hidden': True}
                ],
                'acceptance_rate': 68.4,
                'total_submissions': 1240,
                'accepted_submissions': 848
            },
            {
                'title': 'Valid Parentheses',
                'slug': 'valid-parentheses',
                'difficulty': 'Easy',
                'topic': 'Stack & String',
                'tags': 'Stack, String',
                'points': 100,
                'description': (
                    "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\n"
                    "An input string is valid if:\n"
                    "1. Open brackets must be closed by the same type of brackets.\n"
                    "2. Open brackets must be closed in the correct order.\n"
                    "3. Every close bracket has a corresponding open bracket of the same type."
                ),
                'input_format': "A single string s of brackets.",
                'output_format': "true or false",
                'constraints': "1 <= s.length <= 10^4\ns consists of parentheses only '()[]{}'.",
                'sample_input': "()[]{}",
                'sample_output': "true",
                'sample_explanation': "All opened brackets are closed properly in sequence.",
                'hints': [
                    "Use a stack data structure.",
                    "Push opening brackets onto the stack. When encountering a closing bracket, pop and check if it matches."
                ],
                'starter_code': {
                    'python': "def is_valid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top_element = stack.pop() if stack else '#'\n            if mapping[char] != top_element:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nif __name__ == '__main__':\n    import sys\n    s = sys.stdin.read().strip()\n    print('true' if is_valid(s) else 'false')\n"
                },
                'test_cases': [
                    {'input': '()[]{}', 'output': 'true', 'is_hidden': False},
                    {'input': '(]', 'output': 'false', 'is_hidden': False},
                    {'input': '([)]', 'output': 'false', 'is_hidden': True},
                    {'input': '{[]}', 'output': 'true', 'is_hidden': True}
                ],
                'acceptance_rate': 72.1,
                'total_submissions': 950,
                'accepted_submissions': 685
            },
            {
                'title': 'Merge Two Sorted Lists',
                'slug': 'merge-two-sorted-lists',
                'difficulty': 'Medium',
                'topic': 'Linked List',
                'tags': 'Linked List, Two Pointers',
                'points': 150,
                'description': (
                    "You are given the heads of two sorted linked lists `list1` and `list2`.\n\n"
                    "Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.\n\n"
                    "Return the head of the merged linked list."
                ),
                'input_format': "Line 1: space separated integers for list1.\nLine 2: space separated integers for list2.",
                'output_format': "Space separated integers of the merged sorted list.",
                'constraints': "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.",
                'sample_input': "1 2 4\n1 3 4",
                'sample_output': "1 1 2 3 4 4",
                'sample_explanation': "Merged elements in non-decreasing order: 1, 1, 2, 3, 4, 4.",
                'hints': [
                    "Compare the front of both lists and advance the pointer pointing to the smaller element."
                ],
                'starter_code': {
                    'python': "import sys\ndef merge_sorted(l1, l2):\n    i, j = 0, 0\n    res = []\n    while i < len(l1) and j < len(l2):\n        if l1[i] <= l2[j]:\n            res.append(l1[i])\n            i += 1\n        else:\n            res.append(l2[j])\n            j += 1\n    res.extend(l1[i:])\n    res.extend(l2[j:])\n    return res\n\nif __name__ == '__main__':\n    lines = sys.stdin.read().strip().split('\\n')\n    l1 = [int(x) for x in lines[0].split()] if len(lines) > 0 and lines[0].strip() else []\n    l2 = [int(x) for x in lines[1].split()] if len(lines) > 1 and lines[1].strip() else []\n    merged = merge_sorted(l1, l2)\n    print(' '.join(map(str, merged)))\n"
                },
                'test_cases': [
                    {'input': "1 2 4\n1 3 4", 'output': '1 1 2 3 4 4', 'is_hidden': False},
                    {'input': "1 3 5\n2 4 6", 'output': '1 2 3 4 5 6', 'is_hidden': False},
                    {'input': "5\n1 2 3", 'output': '1 2 3 5', 'is_hidden': True}
                ],
                'acceptance_rate': 65.3,
                'total_submissions': 820,
                'accepted_submissions': 535
            },
            {
                'title': 'Maximum Subarray',
                'slug': 'maximum-subarray',
                'difficulty': 'Medium',
                'topic': 'Array & DP',
                'tags': 'Array, DP, Kadane',
                'points': 150,
                'description': (
                    "Given an integer array `nums`, find the subarray with the largest sum, and return *its sum*."
                ),
                'input_format': "Space separated integers representing nums.",
                'output_format': "Maximum subarray sum integer.",
                'constraints': "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
                'sample_input': "-2 1 -3 4 -1 2 1 -5 4",
                'sample_output': "6",
                'sample_explanation': "The subarray [4, -1, 2, 1] has the largest sum 6.",
                'hints': [
                    "Think of Kadane's Algorithm: at each position, decide whether to add current element to previous sum or start fresh."
                ],
                'starter_code': {
                    'python': "import sys\ndef max_sub_array(nums):\n    max_sum = current_sum = nums[0]\n    for x in nums[1:]:\n        current_sum = max(x, current_sum + x)\n        max_sum = max(max_sum, current_sum)\n    return max_sum\n\nif __name__ == '__main__':\n    nums = [int(x) for x in sys.stdin.read().split()]\n    if nums:\n        print(max_sub_array(nums))\n"
                },
                'test_cases': [
                    {'input': '-2 1 -3 4 -1 2 1 -5 4', 'output': '6', 'is_hidden': False},
                    {'input': '1', 'output': '1', 'is_hidden': False},
                    {'input': '5 4 -1 7 8', 'output': '23', 'is_hidden': True}
                ],
                'acceptance_rate': 58.7,
                'total_submissions': 710,
                'accepted_submissions': 417
            },
            {
                'title': 'Longest Substring Without Repeating Characters',
                'slug': 'longest-substring-without-repeating-characters',
                'difficulty': 'Medium',
                'topic': 'String & Sliding Window',
                'tags': 'String, Sliding Window, Hash Table',
                'points': 150,
                'description': (
                    "Given a string `s`, find the length of the **longest substring** without repeating characters."
                ),
                'input_format': "A single line containing string s.",
                'output_format': "An integer representing max length.",
                'constraints': "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
                'sample_input': "abcabcbb",
                'sample_output': "3",
                'sample_explanation': "The answer is 'abc', with the length of 3.",
                'hints': [
                    "Use a sliding window with two pointers `left` and `right`.",
                    "Use a set or hashmap to store characters currently inside the window."
                ],
                'starter_code': {
                    'python': "import sys\ndef length_of_longest_substring(s):\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, char in enumerate(s):\n        if char in char_map and char_map[char] >= left:\n            left = char_map[char] + 1\n        char_map[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n\nif __name__ == '__main__':\n    s = sys.stdin.read().strip()\n    print(length_of_longest_substring(s))\n"
                },
                'test_cases': [
                    {'input': 'abcabcbb', 'output': '3', 'is_hidden': False},
                    {'input': 'bbbbb', 'output': '1', 'is_hidden': False},
                    {'input': 'pwwkew', 'output': '3', 'is_hidden': True}
                ],
                'acceptance_rate': 61.2,
                'total_submissions': 640,
                'accepted_submissions': 392
            },
            {
                'title': 'Binary Search',
                'slug': 'binary-search',
                'difficulty': 'Easy',
                'topic': 'Searching & Sorting',
                'tags': 'Binary Search, Array',
                'points': 100,
                'description': (
                    "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`.\n\n"
                    "If `target` exists, then return its index. Otherwise, return `-1`.\n\n"
                    "You must write an algorithm with `O(log n)` runtime complexity."
                ),
                'input_format': "Line 1: space separated integers `nums`.\nLine 2: target integer.",
                'output_format': "Index integer or -1.",
                'constraints': "1 <= nums.length <= 10^4\nAll integers in nums are unique.\nnums is sorted in ascending order.",
                'sample_input': "-1 0 3 5 9 12\n9",
                'sample_output': "4",
                'sample_explanation': "9 exists in nums and its index is 4.",
                'hints': ["Maintain low and high pointers and inspect the midpoint."],
                'starter_code': {
                    'python': "import sys\ndef binary_search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nif __name__ == '__main__':\n    data = sys.stdin.read().split()\n    if data:\n        target = int(data[-1])\n        nums = [int(x) for x in data[:-1]]\n        print(binary_search(nums, target))\n"
                },
                'test_cases': [
                    {'input': '-1 0 3 5 9 12\n9', 'output': '4', 'is_hidden': False},
                    {'input': '-1 0 3 5 9 12\n2', 'output': '-1', 'is_hidden': False},
                    {'input': '5\n5', 'output': '0', 'is_hidden': True}
                ],
                'acceptance_rate': 78.5,
                'total_submissions': 890,
                'accepted_submissions': 699
            },
            {
                'title': 'Climbing Stairs',
                'slug': 'climbing-stairs',
                'difficulty': 'Easy',
                'topic': 'Dynamic Programming',
                'tags': 'DP, Math',
                'points': 100,
                'description': (
                    "You are climbing a staircase. It takes `n` steps to reach the top.\n\n"
                    "Each time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?"
                ),
                'input_format': "Integer n.",
                'output_format': "Number of ways integer.",
                'constraints': "1 <= n <= 45",
                'sample_input': "3",
                'sample_output': "3",
                'sample_explanation': "There are 3 ways: 1+1+1, 1+2, 2+1.",
                'hints': ["Ways to reach step n is ways(n-1) + ways(n-2). This is the Fibonacci sequence!"],
                'starter_code': {
                    'python': "import sys\ndef climb_stairs(n):\n    if n <= 2:\n        return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n\nif __name__ == '__main__':\n    val = sys.stdin.read().strip()\n    if val:\n        print(climb_stairs(int(val)))\n"
                },
                'test_cases': [
                    {'input': '2', 'output': '2', 'is_hidden': False},
                    {'input': '3', 'output': '3', 'is_hidden': False},
                    {'input': '5', 'output': '8', 'is_hidden': True}
                ],
                'acceptance_rate': 74.0,
                'total_submissions': 620,
                'accepted_submissions': 458
            },
            {
                'title': 'Trapping Rain Water',
                'slug': 'trapping-rain-water',
                'difficulty': 'Hard',
                'topic': 'Two Pointers & Stacks',
                'tags': 'Two Pointers, Stack, Dynamic Programming',
                'points': 250,
                'description': (
                    "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, "
                    "compute how much water it can trap after raining."
                ),
                'input_format': "Space separated integers representing bar heights.",
                'output_format': "Total trapped water integer.",
                'constraints': "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
                'sample_input': "0 1 0 2 1 0 1 3 2 1 2 1",
                'sample_output': "6",
                'sample_explanation': "The elevation map traps 6 units of rain water.",
                'hints': ["Can two pointers moving inwards keep track of left_max and right_max?"],
                'starter_code': {
                    'python': "import sys\ndef trap(height):\n    if not height:\n        return 0\n    l, r = 0, len(height) - 1\n    left_max, right_max = height[l], height[r]\n    water = 0\n    while l < r:\n        if left_max < right_max:\n            l += 1\n            left_max = max(left_max, height[l])\n            water += left_max - height[l]\n        else:\n            r -= 1\n            right_max = max(right_max, height[r])\n            water += right_max - height[r]\n    return water\n\nif __name__ == '__main__':\n    nums = [int(x) for x in sys.stdin.read().split()]\n    print(trap(nums))\n"
                },
                'test_cases': [
                    {'input': '0 1 0 2 1 0 1 3 2 1 2 1', 'output': '6', 'is_hidden': False},
                    {'input': '4 2 0 3 2 5', 'output': '9', 'is_hidden': True}
                ],
                'acceptance_rate': 44.2,
                'total_submissions': 480,
                'accepted_submissions': 212
            }
        ]

        problem_objects = []
        for p_data in problems_data:
            tc_data = p_data.pop('test_cases')
            prob = Problem(
                title=p_data['title'],
                slug=p_data['slug'],
                difficulty=p_data['difficulty'],
                topic=p_data['topic'],
                tags=p_data['tags'],
                points=p_data['points'],
                description=p_data['description'],
                input_format=p_data['input_format'],
                output_format=p_data['output_format'],
                constraints=p_data['constraints'],
                sample_input=p_data['sample_input'],
                sample_output=p_data['sample_output'],
                sample_explanation=p_data['sample_explanation'],
                hints=json.dumps(p_data['hints']),
                starter_code=json.dumps(p_data['starter_code']),
                acceptance_rate=p_data['acceptance_rate'],
                total_submissions=p_data['total_submissions'],
                accepted_submissions=p_data['accepted_submissions']
            )
            db.session.add(prob)
            db.session.flush()
            problem_objects.append(prob)

            for idx, tc in enumerate(tc_data):
                tcase = ProblemTestCase(
                    problem_id=prob.id,
                    input_data=tc['input'],
                    expected_output=tc['output'],
                    is_hidden=tc['is_hidden'],
                    order_index=idx
                )
                db.session.add(tcase)

        db.session.commit()
        print(f"Seeded {len(problem_objects)} problems.")

        # 3. Create initial Submissions for student (Aarav) so dashboard has rich data
        print("Seeding student submissions...")
        sub1 = Submission(
            user_id=student_user.id,
            problem_id=problem_objects[0].id, # Two Sum
            language='python',
            source_code=problem_objects[0].to_dict()['starter_code'].get('python', ''),
            status='Accepted',
            execution_time=0.035,
            memory_used=12.4,
            test_cases_passed=4,
            total_test_cases=4,
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        db.session.add(sub1)

        sub2 = Submission(
            user_id=student_user.id,
            problem_id=problem_objects[1].id, # Valid Parentheses
            language='python',
            source_code="def is_valid(s):\n    return True",
            status='Accepted',
            execution_time=0.028,
            memory_used=11.8,
            test_cases_passed=4,
            total_test_cases=4,
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.session.add(sub2)

        sub3 = Submission(
            user_id=student_user.id,
            problem_id=problem_objects[2].id, # Merge Two Sorted Lists
            language='python',
            source_code="pass",
            status='Accepted',
            execution_time=0.041,
            memory_used=13.1,
            test_cases_passed=3,
            total_test_cases=3,
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        db.session.add(sub3)

        # Learning activities for Aarav
        for i in range(1, 8):
            act = LearningActivity(
                user_id=student_user.id,
                activity_type='problem_solved',
                details=f"Completed daily coding exercise #{i}",
                points_earned=100,
                date=date.today() - timedelta(days=i),
                created_at=datetime.utcnow() - timedelta(days=i)
            )
            db.session.add(act)

        # 4. Seed Saved Snippets for Aarav (matching panels 4 & 5)
        print("Seeding code snippets...")
        snip1 = SavedSnippet(
            user_id=student_user.id,
            title='Simple Python Program',
            description='Basic greeting script with standard input prompt.',
            language='python',
            code=(
                "# Simple Python Program\n"
                "def greet(name):\n"
                "    return f\"Hello, {name}!\"\n\n"
                "name = input(\"Enter your name: \")\n"
                "print(greet(name))\n"
            ),
            tags='python, beginner, input'
        )
        db.session.add(snip1)

        snip2 = SavedSnippet(
            user_id=student_user.id,
            title='Two Pointers Template',
            description='Boilerplate for palindrome checking & sorted array two pointers.',
            language='python',
            code=(
                "def two_pointers_demo(arr):\n"
                "    left, right = 0, len(arr) - 1\n"
                "    while left < right:\n"
                "        # Process elements\n"
                "        left += 1\n"
                "        right -= 1\n"
            ),
            tags='template, algorithms, two-pointers'
        )
        db.session.add(snip2)

        # 5. Seed Community Questions & Answers (matching panel 8)
        print("Seeding community Q&A...")
        q1 = Question(
            user_id=student_user.id,
            title='How to reverse a linked list in Python?',
            content=(
                "I am practicing linked lists and struggling with updating pointers in place. "
                "Can someone explain how `prev`, `curr`, and `next_node` pointers work without losing nodes?"
            ),
            category='Data Structures',
            tags='python, linked-list, data-structures',
            views_count=142,
            upvotes_count=12
        )
        db.session.add(q1)
        db.session.flush()

        a1 = Answer(
            question_id=q1.id,
            user_id=mentor_neha_user.id,
            content=(
                "Here is the standard 3-pointer iterative approach in Python:\n\n"
                "```python\n"
                "def reverseList(head):\n"
                "    prev = None\n"
                "    curr = head\n"
                "    while curr:\n"
                "        next_temp = curr.next  # 1. Save next node\n"
                "        curr.next = prev       # 2. Reverse current pointer\n"
                "        prev = curr            # 3. Advance prev\n"
                "        curr = next_temp       # 4. Advance curr\n"
                "    return prev\n"
                "```\n\n"
                "**Time Complexity:** O(n)\n**Space Complexity:** O(1) in-place memory."
            ),
            upvotes_count=18,
            is_accepted=True
        )
        db.session.add(a1)
        q1.accepted_answer_id = a1.id

        q2 = Question(
            user_id=mentor_rohit_user.id,
            title='Difference between == and equals() in Java?',
            content="Can someone explain the behavioral difference between `==` and `.equals()` when comparing Java Objects and Strings?",
            category='Object Oriented Programming',
            tags='java, oop, syntax',
            views_count=98,
            upvotes_count=8
        )
        db.session.add(q2)

        q3 = Question(
            user_id=student_user.id,
            title='How to optimize this DP solution?',
            content="My coin change recursive implementation times out on larger test cases. How can I transition from memoization to bottom-up tabulation?",
            category='Algorithms',
            tags='dynamic-programming, optimization',
            views_count=175,
            upvotes_count=15
        )
        db.session.add(q3)

        q4 = Question(
            user_id=mentor_neha_user.id,
            title='Best resources to learn System Design?',
            content="Curating a roadmap for mid-level engineers targeting senior roles. What books and whitepapers helped you master distributed systems?",
            category='System Design',
            tags='system-design, learning',
            views_count=210,
            upvotes_count=28
        )
        db.session.add(q4)

        # 6. Seed Coding Contests (matching panel 10)
        print("Seeding coding contests...")
        now = datetime.utcnow()

        contest1 = Contest(
            title='Weekly Challenge #45',
            description='Weekly algorithmic battle testing Arrays, Strings, and Dynamic Programming. Compete for global leaderboard points!',
            start_time=now + timedelta(days=2, hours=4, minutes=32),
            end_time=now + timedelta(days=2, hours=6, minutes=32),
            duration_minutes=120,
            created_by=admin_user.id
        )
        db.session.add(contest1)
        db.session.flush()

        # Add problems to contest 1
        for idx, prob in enumerate(problem_objects[:5]):
            cp = ContestProblem(contest_id=contest1.id, problem_id=prob.id, points=100 + (idx * 50), order_index=idx + 1)
            db.session.add(cp)

        contest2 = Contest(
            title='Monthly Challenge',
            description='Comprehensive endurance contest featuring 5 DSA problems spanning beginner to advanced levels.',
            start_time=now + timedelta(days=12, hours=7, minutes=12),
            end_time=now + timedelta(days=12, hours=10, minutes=12),
            duration_minutes=180,
            created_by=admin_user.id
        )
        db.session.add(contest2)
        db.session.flush()

        # Add problems to contest 2
        for idx, prob in enumerate(problem_objects[2:7]):
            cp = ContestProblem(contest_id=contest2.id, problem_id=prob.id, points=100 + (idx * 50), order_index=idx + 1)
            db.session.add(cp)

        # Past Contest with Participants
        past_contest = Contest(
            title='Speed Code Sprint #10',
            description='Rapid algorithmic challenge for intermediate programmers.',
            start_time=now - timedelta(days=5),
            end_time=now - timedelta(days=5, hours=-2),
            duration_minutes=120,
            created_by=admin_user.id
        )
        db.session.add(past_contest)
        db.session.flush()

        part1 = ContestParticipant(contest_id=past_contest.id, user_id=student_user.id, score=450, rank=2)
        db.session.add(part1)

        # 7. Mentoring Requests
        m_req = MentoringRequest(
            student_id=student_user.id,
            mentor_id=neha_mentor.id,
            topic='System Design & DSA Roadmap',
            message='Hi Dr. Neha, would love advice on scaling microservices and interview strategies.',
            preferred_time='Next Tuesday at 6:00 PM IST',
            status='accepted',
            meeting_link='https://meet.google.com/buddy-demo-room'
        )
        db.session.add(m_req)

        db.session.commit()
        print("Database successfully seeded with realistic sample data!")

if __name__ == '__main__':
    seed_database()
