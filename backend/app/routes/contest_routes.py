from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from backend.app.models import Contest, ContestProblem, ContestParticipant, Problem
from backend.app.extensions import db
from backend.app.utils.middleware import token_required, optional_token, role_required

contests_bp = Blueprint('contests_bp', __name__)

@contests_bp.route('', methods=['GET'])
@optional_token
def get_contests(current_user):
    tab = request.args.get('tab', 'all') # 'upcoming', 'active', 'past', 'all'
    now = datetime.utcnow()

    contests = Contest.query.order_by(Contest.start_time.asc()).all()
    uid = current_user.id if current_user else None

    result = [c.to_dict(current_user_id=uid) for c in contests]

    if tab in ['upcoming', 'active', 'past']:
        result = [c for c in result if c['status'] == tab]

    return jsonify({'success': True, 'contests': result}), 200


@contests_bp.route('/<int:contest_id>', methods=['GET'])
@optional_token
def get_contest(current_user, contest_id):
    contest = Contest.query.get_or_404(contest_id)
    uid = current_user.id if current_user else None
    c_dict = contest.to_dict(current_user_id=uid)

    # Problems are visible only if active or past, or if admin
    is_admin = current_user and current_user.role == 'admin'
    if contest.status in ['active', 'past'] or is_admin:
        c_dict['problems'] = [cp.to_dict() for cp in contest.problems]
    else:
        c_dict['problems'] = []

    return jsonify({'success': True, 'contest': c_dict}), 200


@contests_bp.route('/<int:contest_id>/register', methods=['POST'])
@token_required
def register_contest(current_user, contest_id):
    contest = Contest.query.get_or_404(contest_id)

    if contest.status == 'past':
        return jsonify({'success': False, 'message': 'Cannot register for a past contest'}), 400

    existing = ContestParticipant.query.filter_by(contest_id=contest.id, user_id=current_user.id).first()
    if existing:
        return jsonify({'success': True, 'message': 'You are already registered for this contest'}), 200

    participant = ContestParticipant(
        contest_id=contest.id,
        user_id=current_user.id
    )
    db.session.add(participant)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Successfully registered for contest!'}), 201


@contests_bp.route('/<int:contest_id>/leaderboard', methods=['GET'])
def get_contest_leaderboard(contest_id):
    contest = Contest.query.get_or_404(contest_id)
    participants = ContestParticipant.query.filter_by(contest_id=contest.id).order_by(
        ContestParticipant.score.desc(),
        ContestParticipant.finish_time.asc()
    ).all()

    # Calculate dynamic ranks with ties
    results = []
    current_rank = 1
    for p in participants:
        p_dict = p.to_dict()
        p_dict['rank'] = current_rank
        results.append(p_dict)
        current_rank += 1

    return jsonify({'success': True, 'leaderboard': results}), 200


@contests_bp.route('', methods=['POST'])
@token_required
@role_required('admin')
def create_contest(current_user):
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '')
    start_time_str = data.get('start_time')
    duration_minutes = int(data.get('duration_minutes', 120))
    problem_ids = data.get('problem_ids', [])

    if not title or not start_time_str:
        return jsonify({'success': False, 'message': 'Title and start time are required'}), 400

    try:
        start_time = datetime.fromisoformat(start_time_str.replace('Z', ''))
    except Exception:
        return jsonify({'success': False, 'message': 'Invalid start time ISO format'}), 400

    end_time = start_time + timedelta(minutes=duration_minutes)

    contest = Contest(
        title=title,
        description=description,
        start_time=start_time,
        end_time=end_time,
        duration_minutes=duration_minutes,
        created_by=current_user.id
    )
    db.session.add(contest)
    db.session.flush()

    for idx, pid in enumerate(problem_ids):
        cp = ContestProblem(contest_id=contest.id, problem_id=pid, points=100, order_index=idx + 1)
        db.session.add(cp)

    db.session.commit()
    return jsonify({'success': True, 'contest': contest.to_dict()}), 201
