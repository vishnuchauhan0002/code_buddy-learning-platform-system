from flask import Blueprint, request, jsonify, current_app
from backend.app.services.ai_service import (
    generate_ai_response,
    SUPPORTED_ENGINES
)
from backend.app.utils.middleware import optional_token

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route('/models', methods=['GET'])
def get_supported_models():
    """Return list of available AI models/engines with metadata."""
    engines_list = [
        {
            'id': key,
            'name': val['name'],
            'provider': val['provider'],
            'badge': val['badge'],
            'tagline': val['tagline'],
            'color': val['color']
        }
        for key, val in SUPPORTED_ENGINES.items()
    ]
    return jsonify({
        'success': True,
        'models': engines_list,
        'default': 'chatgpt'
    }), 200


@ai_bp.route('/status', methods=['GET'])
def get_ai_status():
    api_key = current_app.config.get('AI_API_KEY', '').strip()
    return jsonify({
        'success': True,
        'configured': bool(api_key),
        'provider': current_app.config.get('AI_API_PROVIDER', 'auto'),
        'model': current_app.config.get('AI_MODEL', 'gemini-1.5-flash'),
        'supported_engines': list(SUPPORTED_ENGINES.keys())
    }), 200


@ai_bp.route('/chat', methods=['POST'])
@optional_token
def chat_ai(current_user):
    data = request.get_json() or {}
    prompt = data.get('prompt', '').strip()
    code_context = data.get('code', '')
    language = data.get('language', 'python')
    mode = data.get('mode', 'chat')
    engine = data.get('engine', 'chatgpt')

    if not prompt and not code_context:
        return jsonify({'success': False, 'message': 'Prompt or code context is required'}), 400

    result = generate_ai_response(
        prompt=prompt,
        mode=mode,
        code_context=code_context,
        language=language,
        engine=engine
    )
    return jsonify({
        'success': result.get('success', True),
        'reply': result.get('reply', ''),
        'service_configured': result.get('service_configured', False),
        'provider': result.get('provider'),
        'engine': result.get('engine', engine)
    }), 200


@ai_bp.route('/explain', methods=['POST'])
@optional_token
def explain_code(current_user):
    data = request.get_json() or {}
    code = data.get('code', '')
    language = data.get('language', 'python')
    engine = data.get('engine', 'chatgpt')

    if not code.strip():
        return jsonify({'success': False, 'message': 'Code snippet is required for explanation'}), 400

    result = generate_ai_response(
        prompt="Explain this code line by line and describe its time and space complexity.",
        mode='explain',
        code_context=code,
        language=language,
        engine=engine
    )
    return jsonify({
        'success': result.get('success', True),
        'explanation': result.get('reply', ''),
        'service_configured': result.get('service_configured', False),
        'engine': engine
    }), 200


@ai_bp.route('/debug', methods=['POST'])
@optional_token
def debug_code(current_user):
    data = request.get_json() or {}
    code = data.get('code', '')
    error_message = data.get('error', '')
    language = data.get('language', 'python')
    engine = data.get('engine', 'chatgpt')

    if not code.strip():
        return jsonify({'success': False, 'message': 'Code snippet is required for debugging'}), 400

    prompt = f"Find potential bugs, edge-case failures, and fix this code. Error encountered: {error_message}"
    result = generate_ai_response(
        prompt=prompt,
        mode='debug',
        code_context=code,
        language=language,
        engine=engine
    )

    return jsonify({
        'success': result.get('success', True),
        'debug_analysis': result.get('reply', ''),
        'service_configured': result.get('service_configured', False),
        'engine': engine
    }), 200


@ai_bp.route('/convert', methods=['POST'])
@optional_token
def convert_code(current_user):
    data = request.get_json() or {}
    code = data.get('code', '')
    from_lang = data.get('from_lang', 'python')
    to_lang = data.get('to_lang', 'javascript')
    engine = data.get('engine', 'chatgpt')

    if not code.strip():
        return jsonify({'success': False, 'message': 'Source code is required for conversion'}), 400

    prompt = f"Convert this {from_lang} code into idiomatic {to_lang}. Preserve complexity and provide explanation."
    result = generate_ai_response(
        prompt=prompt,
        mode='convert',
        code_context=code,
        language=from_lang,
        engine=engine
    )

    return jsonify({
        'success': result.get('success', True),
        'converted_code': result.get('reply', ''),
        'service_configured': result.get('service_configured', False),
        'engine': engine
    }), 200


@ai_bp.route('/complexity', methods=['POST'])
@optional_token
def analyze_complexity(current_user):
    data = request.get_json() or {}
    code = data.get('code', '')
    language = data.get('language', 'python')
    engine = data.get('engine', 'chatgpt')

    if not code.strip():
        return jsonify({'success': False, 'message': 'Code snippet is required for complexity analysis'}), 400

    prompt = "Analyze the Big-O time and space complexity of this code."
    result = generate_ai_response(
        prompt=prompt,
        mode='complexity',
        code_context=code,
        language=language,
        engine=engine
    )

    return jsonify({
        'success': result.get('success', True),
        'analysis': result.get('reply', ''),
        'time_complexity': result.get('time_complexity', 'O(N)'),
        'space_complexity': result.get('space_complexity', 'O(1)'),
        'service_configured': result.get('service_configured', False),
        'engine': engine
    }), 200
