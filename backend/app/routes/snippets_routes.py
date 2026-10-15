from flask import Blueprint, request, jsonify
from backend.app.models import SavedSnippet
from backend.app.extensions import db
from backend.app.utils.middleware import token_required

snippets_bp = Blueprint('snippets_bp', __name__)

@snippets_bp.route('', methods=['GET'])
@token_required
def get_snippets(current_user):
    search = request.args.get('search', '').strip()
    language = request.args.get('language', '').strip()
    tag = request.args.get('tag', '').strip()

    query = SavedSnippet.query.filter_by(user_id=current_user.id)

    if search:
        query = query.filter(SavedSnippet.title.ilike(f'%{search}%') | SavedSnippet.description.ilike(f'%{search}%'))

    if language and language.lower() != 'all':
        query = query.filter(SavedSnippet.language.ilike(language))

    if tag:
        query = query.filter(SavedSnippet.tags.ilike(f'%{tag}%'))

    snippets = query.order_by(SavedSnippet.updated_at.desc()).all()
    return jsonify({
        'success': True,
        'snippets': [s.to_dict() for s in snippets]
    }), 200


@snippets_bp.route('', methods=['POST'])
@token_required
def create_snippet(current_user):
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    code = data.get('code', '')
    language = data.get('language', 'python')
    description = data.get('description', '')
    tags = data.get('tags', '')
    is_public = data.get('is_public', False)

    if not title:
        return jsonify({'success': False, 'message': 'Snippet title is required'}), 400

    if not code:
        return jsonify({'success': False, 'message': 'Code snippet cannot be empty'}), 400

    if isinstance(tags, list):
        tags = ', '.join(tags)

    snippet = SavedSnippet(
        user_id=current_user.id,
        title=title,
        description=description,
        language=language,
        code=code,
        tags=tags,
        is_public=is_public
    )
    db.session.add(snippet)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Code snippet saved successfully',
        'snippet': snippet.to_dict()
    }), 201


@snippets_bp.route('/<int:snippet_id>', methods=['GET'])
@token_required
def get_snippet(current_user, snippet_id):
    snippet = SavedSnippet.query.filter_by(id=snippet_id, user_id=current_user.id).first()
    if not snippet:
        return jsonify({'success': False, 'message': 'Snippet not found'}), 404

    return jsonify({'success': True, 'snippet': snippet.to_dict()}), 200


@snippets_bp.route('/<int:snippet_id>', methods=['PUT'])
@token_required
def update_snippet(current_user, snippet_id):
    snippet = SavedSnippet.query.filter_by(id=snippet_id, user_id=current_user.id).first()
    if not snippet:
        return jsonify({'success': False, 'message': 'Snippet not found or unauthorized'}), 404

    data = request.get_json() or {}
    if 'title' in data:
        snippet.title = data['title'].strip()
    if 'code' in data:
        snippet.code = data['code']
    if 'language' in data:
        snippet.language = data['language']
    if 'description' in data:
        snippet.description = data['description']
    if 'tags' in data:
        tags = data['tags']
        snippet.tags = ', '.join(tags) if isinstance(tags, list) else str(tags)
    if 'is_public' in data:
        snippet.is_public = data['is_public']

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Snippet updated successfully',
        'snippet': snippet.to_dict()
    }), 200


@snippets_bp.route('/<int:snippet_id>', methods=['DELETE'])
@token_required
def delete_snippet(current_user, snippet_id):
    snippet = SavedSnippet.query.filter_by(id=snippet_id, user_id=current_user.id).first()
    if not snippet:
        return jsonify({'success': False, 'message': 'Snippet not found or unauthorized'}), 404

    db.session.delete(snippet)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Snippet deleted successfully'}), 200


@snippets_bp.route('/<int:snippet_id>/duplicate', methods=['POST'])
@token_required
def duplicate_snippet(current_user, snippet_id):
    snippet = SavedSnippet.query.filter_by(id=snippet_id, user_id=current_user.id).first()
    if not snippet:
        return jsonify({'success': False, 'message': 'Snippet not found'}), 404

    duplicated = SavedSnippet(
        user_id=current_user.id,
        title=f"{snippet.title} (Copy)",
        description=snippet.description,
        language=snippet.language,
        code=snippet.code,
        tags=snippet.tags,
        is_public=False
    )
    db.session.add(duplicated)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Snippet duplicated successfully',
        'snippet': duplicated.to_dict()
    }), 201
