# CodeBuddy REST API Documentation

This document describes all RESTful endpoints implemented in the **CodeBuddy** backend server.

---

## Base URL
- Local Development: `http://localhost:5000/api`
- Content Type: `application/json`
- Authentication Header: `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new student account.
- **Request Body:**
  ```json
  {
    "full_name": "Aarav Mehta",
    "email": "student@example.com",
    "username": "aarav123",
    "password": "Password123!",
    "confirm_password": "Password123!",
    "skill_level": "Beginner"
  }
  ```
- **Responses:**
  - `201 Created`: User and JWT access token returned.
  - `400 Bad Request`: Validation failure or duplicate email/username.

### `POST /api/auth/login`
Authenticates user with email or username and password.
- **Request Body:**
  ```json
  {
    "identifier": "student@example.com",
    "password": "Password123!"
  }
  ```
- **Responses:**
  - `200 OK`: Returns authenticated user profile and JWT token.
  - `401 Unauthorized`: Invalid credentials.

### `GET /api/auth/me`
Fetches current authenticated user profile. Requires JWT header.
- **Responses:** `200 OK`, `401 Unauthorized`.

### `PUT /api/auth/profile`
Updates current user's profile information (full name, bio, skills, preferred languages, avatar).
- **Responses:** `200 OK`, `401 Unauthorized`.

### `PUT /api/auth/change-password`
Updates password after verifying the old password.
- **Responses:** `200 OK`, `400 Bad Request`, `401 Unauthorized`.

### `POST /api/auth/forgot-password`
Initiates password reset flow and generates secure reset token.
- **Request Body:** `{ "email": "student@example.com" }`
- **Responses:** `200 OK` (with direct dev token link), `404 Not Found`.

### `POST /api/auth/reset-password`
Applies password reset using validated token.
- **Request Body:** `{ "token": "...", "new_password": "NewPassword123!" }`
- **Responses:** `200 OK`, `400 Bad Request`.

---

## 2. Problems & DSA Practice (`/api/problems`)

### `GET /api/problems`
Retrieves paginated list of DSA problems with difficulty and topic filters.
- **Query Parameters:**
  - `difficulty`: `Easy`, `Medium`, `Hard`, or `All`
  - `topic`: `Arrays`, `String`, `Linked List`, `DP`, etc.
  - `search`: title or tag query
  - `page`: integer (default: 1)
  - `per_page`: integer (default: 10)
- **Response:** `200 OK` with problems list and pagination meta.

### `GET /api/problems/:id`
Retrieves detailed problem statement, constraints, sample test cases, hints, and starter code.
- **Response:** `200 OK`, `404 Not Found`.

### `POST /api/problems/:id/run`
Executes submitted source code against the sample test case using the execution service.
- **Request Body:**
  ```json
  {
    "code": "def two_sum(nums, target): ...",
    "language": "python",
    "input": "2 7 11 15\n9"
  }
  ```
- **Response:** `200 OK` with stdout, stderr, execution time, and memory.

### `POST /api/problems/:id/submit`
Evaluates solution against all hidden and visible test cases. Updates user points, problem acceptance rate, and user streak.
- **Request Body:**
  ```json
  {
    "code": "...",
    "language": "python",
    "contest_id": null
  }
  ```
- **Response:** `201 Created` with `status: "Accepted" | "Wrong Answer" | "Runtime Error"`.

### `POST /api/problems/:id/bookmark`
Toggles bookmark status for the problem.
- **Response:** `200 OK` or `201 Created` with current bookmark state.

### `GET /api/problems/submissions`
Returns authenticated user's submission history.

---

## 3. Code Editor Playground (`/api/code`)

### `GET /api/code/languages`
Lists supported programming languages (Python, JavaScript, C, C++, Java, C#, Go).

### `POST /api/code/run`
Submits source code and stdin to Judge0 sandboxed execution service.
- **Request Body:**
  ```json
  {
    "code": "print('Hello, CodeBuddy!')",
    "language": "python",
    "stdin": ""
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "result": {
      "status": "Success",
      "stdout": "Hello, CodeBuddy!\n",
      "stderr": "",
      "execution_time": 0.02,
      "memory": 12.4,
      "service_configured": true
    }
  }
  ```

---

## 4. Personal Code Snippets (`/api/snippets`)

- `GET /api/snippets`: List user's saved snippets with search & tag filters.
- `POST /api/snippets`: Save a new code snippet.
- `GET /api/snippets/:id`: Retrieve single snippet.
- `PUT /api/snippets/:id`: Update snippet title, code, tags, or description.
- `DELETE /api/snippets/:id`: Delete snippet.
- `POST /api/snippets/:id/duplicate`: Duplicate snippet.

---

## 5. AI Coding Assistant (`/api/ai`)

### `GET /api/ai/status`
Returns configuration status of the AI service provider (Gemini / OpenAI).

### `POST /api/ai/chat`
Interacts with the AI assistant.
- **Request Body:**
  ```json
  {
    "prompt": "Can you explain this recursive solution?",
    "code": "def factorial(n): ...",
    "language": "python",
    "mode": "explain"
  }
  ```
- **Supported Modes:** `chat`, `explain`, `debug`, `optimize`, `hint`.
- **Response:** Returns structured markdown response with syntax-highlighted code.

---

## 6. Peer-Learning Community (`/api/community`)

- `GET /api/community/questions`: List questions (filters: `tab=all|my|bookmarks`, `tag`, `search`).
- `POST /api/community/questions`: Create new question.
- `GET /api/community/questions/:id`: Get question with answers and comments.
- `POST /api/community/questions/:id/answers`: Post an answer to a question.
- `POST /api/community/questions/:id/vote`: Upvote/Downvote question (1 vote per user).
- `POST /api/community/answers/:id/vote`: Upvote/Downvote answer.
- `POST /api/community/questions/:id/accept-answer`: Mark answer as accepted (author only).
- `POST /api/community/questions/:id/bookmark`: Toggle bookmark on question.

---

## 7. Mentorship System (`/api/mentors`)

- `GET /api/mentors`: List verified mentors with search and skill filters.
- `GET /api/mentors/:id`: Mentor profile details.
- `POST /api/mentors/request`: Request a 1-on-1 session with a mentor.
- `GET /api/mentors/my-sessions`: List sessions as student and as mentor.
- `PUT /api/mentors/requests/:id/status`: Accept, reject, or complete request.
- `POST /api/mentors/requests/:id/rate`: Rate completed session (1-5 stars) and feedback.

---

## 8. Coding Contests (`/api/contests`)

- `GET /api/contests`: List contests (`tab=upcoming|active|past`).
- `GET /api/contests/:id`: Contest arena, details, problem set.
- `POST /api/contests/:id/register`: Register for contest.
- `GET /api/contests/:id/leaderboard`: Contest real-time participant standings.
- `POST /api/contests`: Create new contest (Admin role only).

---

## 9. Dashboard & Leaderboard (`/api/dashboard`)

- `GET /api/dashboard/stats`: Returns problems solved, streak, success rate, learning hours, weekly chart data, daily challenge, and recommendations.
- `GET /api/dashboard/activity`: Recent submissions and learning points.
- `GET /api/dashboard/leaderboard`: Global leaderboard (`filter=all|weekly|monthly`).

---

## 10. Admin Panel (`/api/admin`)

- `GET /api/admin/stats`: Comprehensive platform statistics.
- `GET /api/admin/users`: User management list.
- `PUT /api/admin/users/:id/role`: Change role (`student`, `mentor`, `admin`).
- `PUT /api/admin/users/:id/status`: Suspend or reactivate user accounts.
- `POST /api/admin/problems`: Create problem with hidden test cases.
- `DELETE /api/admin/problems/:id`: Delete problem.
- `GET /api/admin/audit-logs`: System audit trail.
