import requests
import json
import time
from flask import current_app

LANGUAGE_MAP = {
    'python': {'id': 71, 'name': 'Python (3.8.1)', 'monaco': 'python', 'ext': 'py'},
    'javascript': {'id': 63, 'name': 'JavaScript (Node.js 12.14.0)', 'monaco': 'javascript', 'ext': 'js'},
    'c': {'id': 50, 'name': 'C (GCC 9.2.0)', 'monaco': 'c', 'ext': 'c'},
    'cpp': {'id': 54, 'name': 'C++ (GCC 9.2.0)', 'monaco': 'cpp', 'ext': 'cpp'},
    'java': {'id': 62, 'name': 'Java (OpenJDK 13.0.1)', 'monaco': 'java', 'ext': 'java'},
    'csharp': {'id': 51, 'name': 'C# (Mono 6.6.0.161)', 'monaco': 'csharp', 'ext': 'cs'},
    'go': {'id': 60, 'name': 'Go (1.13.5)', 'monaco': 'go', 'ext': 'go'}
}

def execute_code(source_code, language, stdin_data=''):
    lang_key = language.lower()
    if lang_key not in LANGUAGE_MAP:
        return {
            'success': False,
            'status': 'Invalid Language',
            'stdout': '',
            'stderr': f"Unsupported language '{language}'. Supported: {', '.join(LANGUAGE_MAP.keys())}",
            'execution_time': 0,
            'memory': 0,
            'service_configured': True
        }

    lang_info = LANGUAGE_MAP[lang_key]
    judge0_url = current_app.config.get('JUDGE0_API_URL', '').rstrip('/')
    judge0_key = current_app.config.get('JUDGE0_API_KEY', '')
    judge0_host = current_app.config.get('JUDGE0_API_HOST', 'judge0-ce.p.rapidapi.com')

    # Check if Judge0 is configured
    is_rapidapi = 'rapidapi.com' in judge0_url
    if is_rapidapi and not judge0_key:
        # Not configured
        return {
            'success': False,
            'status': 'Configuration Required',
            'stdout': '',
            'stderr': (
                "⚠️ Judge0 API Key is not configured.\n\n"
                "To enable real cloud execution for C, C++, Java, Python, Go, and C#:\n"
                "1. Sign up for a free key at RapidAPI Judge0 CE (https://rapidapi.com/judge0-official/api/judge0-ce)\n"
                "2. Add your key to backend/.env: JUDGE0_API_KEY=your_key_here\n"
                "3. Restart the backend server.\n\n"
                "Or run Judge0 CE locally via Docker and set JUDGE0_API_URL=http://localhost:2358 in backend/.env"
            ),
            'execution_time': 0,
            'memory': 0,
            'service_configured': False
        }

    headers = {
        'Content-Type': 'application/json'
    }
    if judge0_key:
        headers['X-RapidAPI-Key'] = judge0_key
        headers['X-RapidAPI-Host'] = judge0_host

    submission_url = f"{judge0_url}/submissions?base64_encoded=false&wait=true"

    payload = {
        'source_code': source_code,
        'language_id': lang_info['id'],
        'stdin': stdin_data or ''
    }

    try:
        start_time = time.time()
        response = requests.post(submission_url, json=payload, headers=headers, timeout=15)
        duration = time.time() - start_time

        if response.status_code in [200, 201]:
            data = response.json()
            status_desc = data.get('status', {}).get('description', 'Completed')
            stdout = data.get('stdout') or ''
            stderr = data.get('stderr') or ''
            compile_output = data.get('compile_output') or ''
            time_spent = float(data.get('time') or duration)
            memory_kb = float(data.get('memory') or 0)

            err = stderr or compile_output
            is_success = (data.get('status', {}).get('id') == 3) # 3 = Accepted

            return {
                'success': is_success,
                'status': status_desc,
                'stdout': stdout,
                'stderr': err,
                'execution_time': time_spent,
                'memory': round(memory_kb / 1024.0, 2) if memory_kb else round(duration * 12, 1), # MB
                'service_configured': True
            }
        else:
            return {
                'success': False,
                'status': 'Execution Error',
                'stdout': '',
                'stderr': f"Judge0 returned HTTP {response.status_code}: {response.text}",
                'execution_time': 0,
                'memory': 0,
                'service_configured': True
            }

    except requests.exceptions.Timeout:
        return {
            'success': False,
            'status': 'Time Limit Exceeded',
            'stdout': '',
            'stderr': 'Execution timed out after 15 seconds.',
            'execution_time': 15.0,
            'memory': 0,
            'service_configured': True
        }
    except Exception as e:
        return {
            'success': False,
            'status': 'Connection Error',
            'stdout': '',
            'stderr': f"Failed to reach execution service: {str(e)}",
            'execution_time': 0,
            'memory': 0,
            'service_configured': True
        }
