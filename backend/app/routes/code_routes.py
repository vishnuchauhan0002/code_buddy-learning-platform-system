from flask import Blueprint, request, jsonify
from backend.app.services.execution_service import execute_code, LANGUAGE_MAP

code_bp = Blueprint('code_bp', __name__)

@code_bp.route('/languages', methods=['GET'])
def get_languages():
    return jsonify({
        'success': True,
        'languages': [
            {'key': k, 'name': v['name'], 'monaco': v['monaco'], 'ext': v['ext']}
            for k, v in LANGUAGE_MAP.items()
        ]
    }), 200

@code_bp.route('/run', methods=['POST'])
def run_code():
    data = request.get_json() or {}
    source_code = data.get('code', '')
    language = data.get('language', 'python')
    stdin = data.get('stdin', '')

    if not source_code.strip():
        return jsonify({'success': False, 'message': 'Code cannot be empty'}), 400

    result = execute_code(source_code, language, stdin)
    return jsonify({
        'success': True,
        'result': result
    }), 200
