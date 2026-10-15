from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from backend.app.models import Mentor, MentoringRequest, User, UserProfile
from backend.app.extensions import db
from backend.app.utils.middleware import token_required, optional_token

mentors_bp = Blueprint('mentors_bp', __name__)

@mentors_bp.route('', methods=['GET'])
@optional_token
def get_mentors(current_user):
    search = request.args.get('search', '').strip()
    skill = request.args.get('skill', '').strip()

    query = Mentor.query.filter_by(is_available=True)

    if search:
        query = query.filter(or_(
            Mentor.title.ilike(f'%{search}%'),
            Mentor.company.ilike(f'%{search}%'),
            Mentor.bio.ilike(f'%{search}%'),
            Mentor.skills.ilike(f'%{search}%')
        ))

    if skill and skill.lower() != 'all':
        query = query.filter(Mentor.skills.ilike(f'%{skill}%'))

    mentors = query.order_by(Mentor.rating.desc(), Mentor.experience_years.desc()).all()
    return jsonify({
        'success': True,
        'mentors': [m.to_dict() for m in mentors]
    }), 200


@mentors_bp.route('/<int:mentor_id>', methods=['GET'])
def get_mentor(mentor_id):
    mentor = Mentor.query.get_or_404(mentor_id)
    return jsonify({'success': True, 'mentor': mentor.to_dict()}), 200


@mentors_bp.route('/request', methods=['POST'])
@token_required
def create_session_request(current_user):
    data = request.get_json() or {}
    mentor_id = data.get('mentor_id')
    topic = data.get('topic', '').strip()
    message = data.get('message', '').strip()
    preferred_time = data.get('preferred_time', '').strip()

    if not mentor_id or not topic:
        return jsonify({'success': False, 'message': 'Mentor and topic are required'}), 400

    mentor = Mentor.query.get_or_404(mentor_id)
    if mentor.user_id == current_user.id:
        return jsonify({'success': False, 'message': 'You cannot book a mentorship session with yourself'}), 400

    session_req = MentoringRequest(
        student_id=current_user.id,
        mentor_id=mentor.id,
        topic=topic,
        message=message,
        preferred_time=preferred_time,
        status='pending',
        meeting_link='https://meet.google.com/buddy-demo-room'
    )
    db.session.add(session_req)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Mentoring session requested successfully! The mentor has been notified.',
        'request': session_req.to_dict()
    }), 201


@mentors_bp.route('/my-sessions', methods=['GET'])
@token_required
def get_my_sessions(current_user):
    # Check if user is also a mentor
    mentor_profile = Mentor.query.filter_by(user_id=current_user.id).first()

    student_sessions = MentoringRequest.query.filter_by(student_id=current_user.id).order_by(MentoringRequest.created_at.desc()).all()

    mentor_sessions = []
    if mentor_profile:
        mentor_sessions = MentoringRequest.query.filter_by(mentor_id=mentor_profile.id).order_by(MentoringRequest.created_at.desc()).all()

    return jsonify({
        'success': True,
        'as_student': [s.to_dict() for s in student_sessions],
        'as_mentor': [s.to_dict() for s in mentor_sessions],
        'is_mentor': mentor_profile is not None
    }), 200


@mentors_bp.route('/requests/<int:request_id>/status', methods=['PUT'])
@token_required
def update_request_status(current_user, request_id):
    req_item = MentoringRequest.query.get_or_404(request_id)
    data = request.get_json() or {}
    new_status = data.get('status') # 'accepted', 'rejected', 'completed', 'cancelled'
    meeting_link = data.get('meeting_link')

    # Security check: only the mentor can accept/reject/complete, student can cancel
    mentor = Mentor.query.get(req_item.mentor_id)
    is_mentor = mentor and mentor.user_id == current_user.id
    is_student = req_item.student_id == current_user.id

    if new_status in ['accepted', 'rejected', 'completed'] and not is_mentor and current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Only the assigned mentor can perform this action'}), 403

    if new_status == 'cancelled' and not is_student and not is_mentor:
        return jsonify({'success': False, 'message': 'Unauthorized to cancel this session'}), 403

    req_item.status = new_status
    if meeting_link:
        req_item.meeting_link = meeting_link

    db.session.commit()
    return jsonify({
        'success': True,
        'message': f"Session request {new_status} successfully",
        'request': req_item.to_dict()
    }), 200


@mentors_bp.route('/requests/<int:request_id>/rate', methods=['POST'])
@token_required
def rate_session(current_user, request_id):
    req_item = MentoringRequest.query.get_or_404(request_id)
    if req_item.student_id != current_user.id:
        return jsonify({'success': False, 'message': 'Only the student can rate this session'}), 403

    data = request.get_json() or {}
    rating = int(data.get('rating', 5))
    feedback = data.get('feedback', '')

    req_item.rating = max(1, min(5, rating))
    req_item.feedback = feedback

    # Recalculate mentor average rating
    mentor = Mentor.query.get(req_item.mentor_id)
    if mentor:
        rated_sessions = MentoringRequest.query.filter(
            MentoringRequest.mentor_id == mentor.id,
            MentoringRequest.rating.isnot(None)
        ).all()
        if rated_sessions:
            mentor.rating = sum(r.rating for r in rated_sessions) / len(rated_sessions)
            mentor.reviews_count = len(rated_sessions)

    db.session.commit()
    return jsonify({'success': True, 'message': 'Feedback submitted! Thank you.'}), 200
