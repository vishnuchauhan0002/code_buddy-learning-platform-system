import json
from flask import Blueprint, request, jsonify
from backend.app.models import (
    User, UserProfile, Problem, ProblemTestCase, Submission, Question, Answer, Contest, AuditLog
)
from backend.app.extensions import db
from backend.app.utils.middleware import token_required, role_required

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/stats', methods=['GET'])
@token_required
@role_required('admin')
def get_admin_stats(current_user):
    return jsonify({
        'success': True,
        'stats': {
            'total_users': User.query.count(),
            'total_students': User.query.filter_by(role='student').count(),
            'total_mentors': User.query.filter_by(role='mentor').count(),
            'total_problems': Problem.query.count(),
            'total_submissions': Submission.query.count(),
            'accepted_submissions': Submission.query.filter_by(status='Accepted').count(),
            'total_questions': Question.query.count(),
            'total_contests': Contest.query.count()
        }
    }), 200


@admin_bp.route('/users', methods=['GET'])
@token_required
@role_required('admin')
def list_users(current_user):
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    search = request.args.get('search', '').strip()

    query = User.query
    if search:
        query = query.filter((User.username.ilike(f'%{search}%')) | (User.email.ilike(f'%{search}%')))

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in users],
        'pagination': {'page': page, 'per_page': per_page, 'total': total}
    }), 200


@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@token_required
@role_required('admin')
def update_user_role(current_user, user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    new_role = data.get('role')

    if new_role not in ['student', 'mentor', 'admin']:
        return jsonify({'success': False, 'message': 'Invalid role specified'}), 400

    user.role = new_role

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action='update_role',
        target_type='user',
        target_id=user.id,
        details=f"Changed user {user.username} role to {new_role}"
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({'success': True, 'message': f"User role updated to {new_role}", 'user': user.to_dict()}), 200


@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@token_required
@role_required('admin')
def toggle_user_status(current_user, user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return jsonify({'success': False, 'message': 'You cannot deactivate your own account'}), 400

    data = request.get_json() or {}
    is_active = data.get('is_active', not user.is_active)
    user.is_active = is_active

    audit = AuditLog(
        user_id=current_user.id,
        action='toggle_status',
        target_type='user',
        target_id=user.id,
        details=f"Changed user {user.username} active status to {is_active}"
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"User {'reactivated' if is_active else 'suspended'} successfully",
        'user': user.to_dict()
    }), 200


@admin_bp.route('/problems', methods=['POST'])
@token_required
@role_required('admin')
def create_problem(current_user):
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    slug = data.get('slug', '').strip().lower() or title.lower().replace(' ', '-')
    description = data.get('description', '').strip()
    difficulty = data.get('difficulty', 'Easy')
    topic = data.get('topic', 'General')
    tags = data.get('tags', '')
    sample_input = data.get('sample_input', '')
    sample_output = data.get('sample_output', '')
    sample_explanation = data.get('sample_explanation', '')
    test_cases_data = data.get('test_cases', [])

    if not title or not description:
        return jsonify({'success': False, 'message': 'Title and description are required'}), 400

    problem = Problem(
        title=title,
        slug=slug,
        description=description,
        difficulty=difficulty,
        topic=topic,
        tags=tags if isinstance(tags, str) else ', '.join(tags),
        sample_input=sample_input,
        sample_output=sample_output,
        sample_explanation=sample_explanation,
        starter_code=json.dumps(data.get('starter_code', {})),
        hints=json.dumps(data.get('hints', []))
    )
    db.session.add(problem)
    db.session.flush()

    for idx, tc in enumerate(test_cases_data):
        test_case = ProblemTestCase(
            problem_id=problem.id,
            input_data=tc.get('input', ''),
            expected_output=tc.get('output', ''),
            is_hidden=tc.get('is_hidden', False),
            order_index=idx
        )
        db.session.add(test_case)

    # Log action
    audit = AuditLog(
        user_id=current_user.id,
        action='create_problem',
        target_type='problem',
        target_id=problem.id,
        details=f"Created problem: {problem.title}"
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({'success': True, 'problem': problem.to_dict(include_test_cases=True)}), 201


@admin_bp.route('/problems/<int:problem_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_problem(current_user, problem_id):
    problem = Problem.query.get_or_404(problem_id)
    db.session.delete(problem)

    audit = AuditLog(
        user_id=current_user.id,
        action='delete_problem',
        target_type='problem',
        target_id=problem_id,
        details=f"Deleted problem ID {problem_id}"
    )
    db.session.add(audit)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Problem deleted successfully'}), 200


@admin_bp.route('/audit-logs', methods=['GET'])
@token_required
@role_required('admin')
def get_audit_logs(current_user):
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(100).all()
    return jsonify({'success': True, 'logs': [l.to_dict() for l in logs]}), 200
