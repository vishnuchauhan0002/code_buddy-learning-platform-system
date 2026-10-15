import pytest
import json
import os
import sys

root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app import create_app
from backend.app.config import Config

class TestConfig(Config):
    TESTING = True

@pytest.fixture
def client():
    app = create_app(TestConfig)
    with app.test_client() as client:
        yield client

def get_auth_token(client, username='student@example.com', password='Password123!'):
    login_res = client.post('/api/auth/login', json={
        'identifier': username,
        'password': password
    })
    return json.loads(login_res.data)['data']['token']

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'
    assert data['platform'] == 'CodeBuddy'

def test_login_success(client):
    response = client.post('/api/auth/login', json={
        'identifier': 'student@example.com',
        'password': 'Password123!'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'token' in data['data']
    assert data['data']['user']['username'] == 'aarav123'

def test_login_invalid_password(client):
    response = client.post('/api/auth/login', json={
        'identifier': 'student@example.com',
        'password': 'WrongPassword!'
    })
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['success'] is False

def test_duplicate_registration(client):
    response = client.post('/api/auth/register', json={
        'username': 'aarav123',
        'email': 'student@example.com',
        'password': 'Password123!',
        'full_name': 'Duplicate User'
    })
    assert response.status_code == 400
    data = json.loads(response.data)
    assert data['success'] is False

def test_get_problems_list(client):
    response = client.get('/api/problems')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert len(data['problems']) > 0

def test_filter_problems_by_difficulty(client):
    response = client.get('/api/problems?difficulty=Easy')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    for p in data['problems']:
        assert p['difficulty'] == 'Easy'

def test_protected_route_without_token(client):
    response = client.get('/api/dashboard/stats')
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['success'] is False

def test_dashboard_stats_with_token(client):
    token = get_auth_token(client)
    response = client.get('/api/dashboard/stats', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert 'problems_solved' in data['stats']
    assert 'current_streak' in data['stats']

def test_community_questions(client):
    response = client.get('/api/community/questions')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert len(data['questions']) > 0

def test_mentors_list(client):
    response = client.get('/api/mentors')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert len(data['mentors']) > 0

def test_snippets_crud(client):
    token = get_auth_token(client)
    headers = {'Authorization': f'Bearer {token}'}

    # 1. Create snippet
    res = client.post('/api/snippets', json={
        'title': 'Test Snippet',
        'code': 'print("testing")',
        'language': 'python',
        'tags': 'test, unit'
    }, headers=headers)
    assert res.status_code == 201
    created_id = json.loads(res.data)['snippet']['id']

    # 2. Get snippet
    get_res = client.get(f'/api/snippets/{created_id}', headers=headers)
    assert get_res.status_code == 200
    assert json.loads(get_res.data)['snippet']['title'] == 'Test Snippet'

    # 3. Duplicate snippet
    dup_res = client.post(f'/api/snippets/{created_id}/duplicate', headers=headers)
    assert dup_res.status_code == 201
    dup_id = json.loads(dup_res.data)['snippet']['id']

    # 4. Delete duplicated snippet
    del_res = client.delete(f'/api/snippets/{dup_id}', headers=headers)
    assert del_res.status_code == 200

def test_contests_list_and_register(client):
    token = get_auth_token(client)
    headers = {'Authorization': f'Bearer {token}'}

    # List contests
    res = client.get('/api/contests')
    assert res.status_code == 200
    contests = json.loads(res.data)['contests']
    assert len(contests) > 0

    upcoming = [c for c in contests if c['status'] == 'upcoming']
    target_contest = upcoming[0] if upcoming else contests[0]
    # Register for contest
    reg_res = client.post(f'/api/contests/{target_contest["id"]}/register', headers=headers)
    assert reg_res.status_code in [200, 201]

def test_ai_status_and_educational_chat(client):
    status_res = client.get('/api/ai/status')
    assert status_res.status_code == 200
    assert 'configured' in json.loads(status_res.data)

    chat_res = client.post('/api/ai/chat', json={
        'prompt': 'Explain binary search',
        'mode': 'explain',
        'language': 'python'
    })
    assert chat_res.status_code == 200
    assert 'reply' in json.loads(chat_res.data)


def test_ai_multi_models_and_tools(client):
    # Test models listing
    models_res = client.get('/api/ai/models')
    assert models_res.status_code == 200
    models_data = json.loads(models_res.data)
    assert models_data['success'] is True
    engine_ids = [m['id'] for m in models_data['models']]
    assert 'chatgpt' in engine_ids
    assert 'gemini' in engine_ids
    assert 'claude' in engine_ids
    assert 'apple' in engine_ids
    assert 'cloud' in engine_ids

    # Test Claude chat
    claude_res = client.post('/api/ai/chat', json={
        'prompt': 'Find edge cases',
        'engine': 'claude'
    })
    assert claude_res.status_code == 200
    assert json.loads(claude_res.data)['engine'] == 'claude'

    # Test Code Conversion
    conv_res = client.post('/api/ai/convert', json={
        'code': 'def solve(nums): return len(nums)',
        'from_lang': 'python',
        'to_lang': 'javascript',
        'engine': 'chatgpt'
    })
    assert conv_res.status_code == 200
    assert 'converted_code' in json.loads(conv_res.data)

    # Test Complexity Profiling
    comp_res = client.post('/api/ai/complexity', json={
        'code': 'for x in arr: pass',
        'language': 'python',
        'engine': 'gemini'
    })
    assert comp_res.status_code == 200
    assert 'time_complexity' in json.loads(comp_res.data)


def test_study_hub_endpoints(client):
    # Visual sheets
    sheets_res = client.get('/api/study/visual-sheets')
    assert sheets_res.status_code == 200
    sheets_data = json.loads(sheets_res.data)
    assert sheets_data['count'] >= 5

    # Flashcards
    cards_res = client.get('/api/study/flashcards')
    assert cards_res.status_code == 200
    cards_data = json.loads(cards_res.data)
    assert cards_data['count'] >= 5

    # Roadmaps
    roadmaps_res = client.get('/api/study/roadmaps')
    assert roadmaps_res.status_code == 200
    assert len(json.loads(roadmaps_res.data)['roadmaps']) > 0

    # Big-O data
    bigo_res = client.get('/api/study/big-o')
    assert bigo_res.status_code == 200
    assert len(json.loads(bigo_res.data)['complexities']) >= 5
