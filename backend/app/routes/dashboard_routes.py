from datetime import datetime, timedelta, date
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from backend.app.models import (
    User, UserProfile, Problem, Submission, Contest, SavedSnippet, LearningActivity
)
from backend.app.extensions import db
from backend.app.utils.middleware import token_required, optional_token

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    profile = current_user.profile

    # 1. Real problems solved count
    solved_submissions = Submission.query.filter_by(
        user_id=current_user.id,
        status='Accepted'
    ).all()
    solved_problem_ids = list(set(s.problem_id for s in solved_submissions))
    total_solved = len(solved_problem_ids)

    # 2. Total submissions & success rate
    total_submissions = Submission.query.filter_by(user_id=current_user.id).count()
    success_rate = round((len(solved_submissions) / total_submissions * 100), 1) if total_submissions > 0 else 0

    # 3. Learning streak
    streak = profile.current_streak if profile else 0

    # 4. Learning hours
    learning_hours = profile.learning_hours if profile else 0.0

    # 5. Weekly Activity Chart Data (last 7 days)
    today = date.today()
    days_data = []
    day_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    for i in range(6, -1, -1):
        target_day = today - timedelta(days=i)
        count = Submission.query.filter(
            Submission.user_id == current_user.id,
            func.date(Submission.created_at) == target_day
        ).count()
        days_data.append({
            'date': target_day.isoformat(),
            'day': day_labels[target_day.weekday()],
            'count': count
        })

    # 6. Daily Challenge Problem (e.g. Two Sum or rotating daily problem)
    daily_problem = Problem.query.filter_by(difficulty='Easy').first()
    if not daily_problem:
        daily_problem = Problem.query.first()

    # 7. Recommended Problems (unsolved problems)
    recommended = Problem.query.filter(
        Problem.id.notin_(solved_problem_ids) if solved_problem_ids else True
    ).limit(3).all()

    # 8. Upcoming Contests
    upcoming_contests = Contest.query.filter(
        Contest.start_time > datetime.utcnow()
    ).order_by(Contest.start_time.asc()).limit(2).all()

    # 9. Recent Snippets
    recent_snippets = SavedSnippet.query.filter_by(
        user_id=current_user.id
    ).order_by(SavedSnippet.updated_at.desc()).limit(3).all()

    # 10. Difficulty breakdown
    easy_count = 0
    medium_count = 0
    hard_count = 0
    if solved_problem_ids:
        solved_objs = Problem.query.filter(Problem.id.in_(solved_problem_ids)).all()
        for p in solved_objs:
            if p.difficulty == 'Easy':
                easy_count += 1
            elif p.difficulty == 'Medium':
                medium_count += 1
            elif p.difficulty == 'Hard':
                hard_count += 1

    return jsonify({
        'success': True,
        'stats': {
            'problems_solved': total_solved,
            'current_streak': streak,
            'success_rate': success_rate,
            'learning_hours': learning_hours,
            'total_submissions': total_submissions,
            'total_points': profile.total_points if profile else 0,
            'reputation_points': profile.reputation_points if profile else 0,
            'difficulty_breakdown': {
                'easy': easy_count,
                'medium': medium_count,
                'hard': hard_count
            }
        },
        'weekly_progress': days_data,
        'daily_challenge': daily_problem.to_dict() if daily_problem else None,
        'recommended_problems': [p.to_dict() for p in recommended],
        'upcoming_contests': [c.to_dict(current_user_id=current_user.id) for c in upcoming_contests],
        'recent_snippets': [s.to_dict() for s in recent_snippets]
    }), 200


@dashboard_bp.route('/activity', methods=['GET'])
@token_required
def get_user_activity(current_user):
    submissions = Submission.query.filter_by(user_id=current_user.id).order_by(
        Submission.created_at.desc()
    ).limit(10).all()

    activities = LearningActivity.query.filter_by(user_id=current_user.id).order_by(
        LearningActivity.created_at.desc()
    ).limit(10).all()

    return jsonify({
        'success': True,
        'recent_submissions': [s.to_dict() for s in submissions],
        'activities': [a.to_dict() for a in activities]
    }), 200


@dashboard_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    time_filter = request.args.get('filter', 'all') # 'all', 'weekly', 'monthly'

    # Retrieve active users with profiles
    profiles = UserProfile.query.join(User).filter(User.is_active == True).order_by(
        UserProfile.total_points.desc(),
        UserProfile.current_streak.desc()
    ).limit(50).all()

    leaderboard = []
    for rank, prof in enumerate(profiles, 1):
        # Count solved problems
        solved_count = len(set(
            s.problem_id for s in Submission.query.filter_by(user_id=prof.user_id, status='Accepted').all()
        ))

        leaderboard.append({
            'rank': rank,
            'user_id': prof.user_id,
            'username': prof.user.username,
            'full_name': prof.full_name,
            'avatar_url': prof.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={prof.user.username}",
            'points': prof.total_points,
            'problems_solved': solved_count,
            'streak': prof.current_streak,
            'skill_level': prof.skill_level
        })

    return jsonify({
        'success': True,
        'filter': time_filter,
        'leaderboard': leaderboard
    }), 200
