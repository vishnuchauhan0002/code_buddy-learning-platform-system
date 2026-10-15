from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from backend.app.models import Question, Answer, Vote, Comment, Bookmark, User, UserProfile
from backend.app.extensions import db
from backend.app.utils.middleware import token_required, optional_token

community_bp = Blueprint('community_bp', __name__)

@community_bp.route('/questions', methods=['GET'])
@optional_token
def get_questions(current_user):
    search = request.args.get('search', '').strip()
    tag = request.args.get('tag', '').strip()
    category = request.args.get('category', '').strip()
    tab = request.args.get('tab', 'all') # 'all', 'my', 'bookmarks'
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 15))

    query = Question.query

    if tab == 'my' and current_user:
        query = query.filter_by(user_id=current_user.id)
    elif tab == 'bookmarks' and current_user:
        bookmarked_ids = [b.target_id for b in Bookmark.query.filter_by(user_id=current_user.id, target_type='question').all()]
        query = query.filter(Question.id.in_(bookmarked_ids))

    if search:
        query = query.filter(or_(
            Question.title.ilike(f'%{search}%'),
            Question.content.ilike(f'%{search}%'),
            Question.tags.ilike(f'%{search}%')
        ))

    if tag and tag.lower() != 'all':
        query = query.filter(Question.tags.ilike(f'%{tag}%'))

    if category and category.lower() != 'all':
        query = query.filter_by(category=category)

    total = query.count()
    questions = query.order_by(Question.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    uid = current_user.id if current_user else None
    return jsonify({
        'success': True,
        'questions': [q.to_dict(current_user_id=uid) for q in questions],
        'pagination': {'page': page, 'per_page': per_page, 'total': total}
    }), 200


@community_bp.route('/questions', methods=['POST'])
@token_required
def create_question(current_user):
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    category = data.get('category', 'General')
    tags = data.get('tags', '')

    if not title or not content:
        return jsonify({'success': False, 'message': 'Title and question content are required'}), 400

    if isinstance(tags, list):
        tags = ', '.join(tags)

    question = Question(
        user_id=current_user.id,
        title=title,
        content=content,
        category=category,
        tags=tags
    )
    db.session.add(question)

    if current_user.profile:
        current_user.profile.reputation_points += 5

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Question posted successfully',
        'question': question.to_dict(current_user_id=current_user.id)
    }), 201


@community_bp.route('/questions/<int:question_id>', methods=['GET'])
@optional_token
def get_question(current_user, question_id):
    question = Question.query.get_or_404(question_id)

    # Increment view count
    question.views_count += 1
    db.session.commit()

    uid = current_user.id if current_user else None
    q_dict = question.to_dict(current_user_id=uid)

    # Load answers with vote state
    answers = Answer.query.filter_by(question_id=question.id).order_by(Answer.is_accepted.desc(), Answer.upvotes_count.desc()).all()
    q_dict['answers'] = [a.to_dict(current_user_id=uid) for a in answers]

    # Load comments
    comments = Comment.query.filter_by(target_type='question', target_id=question.id).order_by(Comment.created_at.asc()).all()
    q_dict['comments'] = [c.to_dict() for c in comments]

    return jsonify({'success': True, 'question': q_dict}), 200


@community_bp.route('/questions/<int:question_id>/answers', methods=['POST'])
@token_required
def post_answer(current_user, question_id):
    question = Question.query.get_or_404(question_id)
    data = request.get_json() or {}
    content = data.get('content', '').strip()

    if not content:
        return jsonify({'success': False, 'message': 'Answer content cannot be empty'}), 400

    answer = Answer(
        question_id=question.id,
        user_id=current_user.id,
        content=content
    )
    db.session.add(answer)

    if current_user.profile:
        current_user.profile.reputation_points += 10

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Answer posted successfully',
        'answer': answer.to_dict(current_user_id=current_user.id)
    }), 201


@community_bp.route('/questions/<int:question_id>/vote', methods=['POST'])
@token_required
def vote_question(current_user, question_id):
    question = Question.query.get_or_404(question_id)
    data = request.get_json() or {}
    direction = int(data.get('direction', 1)) # 1 for upvote, -1 for downvote

    vote = Vote.query.filter_by(user_id=current_user.id, target_type='question', target_id=question.id).first()

    if vote:
        if vote.vote_value == direction:
            # Cancel vote
            question.upvotes_count -= direction
            db.session.delete(vote)
            new_vote_val = 0
        else:
            # Switch vote
            question.upvotes_count += (direction * 2)
            vote.vote_value = direction
            new_vote_val = direction
    else:
        # New vote
        vote = Vote(user_id=current_user.id, target_type='question', target_id=question.id, vote_value=direction)
        question.upvotes_count += direction
        db.session.add(vote)
        new_vote_val = direction

    db.session.commit()
    return jsonify({
        'success': True,
        'upvotes_count': question.upvotes_count,
        'user_voted': new_vote_val
    }), 200


@community_bp.route('/answers/<int:answer_id>/vote', methods=['POST'])
@token_required
def vote_answer(current_user, answer_id):
    answer = Answer.query.get_or_404(answer_id)
    data = request.get_json() or {}
    direction = int(data.get('direction', 1))

    vote = Vote.query.filter_by(user_id=current_user.id, target_type='answer', target_id=answer.id).first()

    if vote:
        if vote.vote_value == direction:
            answer.upvotes_count -= direction
            db.session.delete(vote)
            new_vote_val = 0
        else:
            answer.upvotes_count += (direction * 2)
            vote.vote_value = direction
            new_vote_val = direction
    else:
        vote = Vote(user_id=current_user.id, target_type='answer', target_id=answer.id, vote_value=direction)
        answer.upvotes_count += direction
        db.session.add(vote)
        new_vote_val = direction

    # Update answer author reputation
    author_profile = answer.author.profile if answer.author else None
    if author_profile:
        author_profile.reputation_points += (direction * 5)

    db.session.commit()
    return jsonify({
        'success': True,
        'upvotes_count': answer.upvotes_count,
        'user_voted': new_vote_val
    }), 200


@community_bp.route('/questions/<int:question_id>/accept-answer', methods=['POST'])
@token_required
def accept_answer(current_user, question_id):
    question = Question.query.get_or_404(question_id)
    if question.user_id != current_user.id and current_user.role != 'admin':
        return jsonify({'success': False, 'message': 'Only the question author can accept an answer'}), 403

    data = request.get_json() or {}
    answer_id = data.get('answer_id')
    answer = Answer.query.get_or_404(answer_id)

    if answer.question_id != question.id:
        return jsonify({'success': False, 'message': 'Answer does not belong to this question'}), 400

    # Unmark previously accepted answer
    if question.accepted_answer_id:
        prev_ans = Answer.query.get(question.accepted_answer_id)
        if prev_ans:
            prev_ans.is_accepted = False

    question.accepted_answer_id = answer.id
    answer.is_accepted = True

    # Reward author
    if answer.author and answer.author.profile:
        answer.author.profile.reputation_points += 15

    db.session.commit()
    return jsonify({'success': True, 'message': 'Answer marked as accepted'}), 200


@community_bp.route('/questions/<int:question_id>/bookmark', methods=['POST'])
@token_required
def toggle_question_bookmark(current_user, question_id):
    existing = Bookmark.query.filter_by(user_id=current_user.id, target_type='question', target_id=question_id).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'success': True, 'is_bookmarked': False, 'message': 'Question removed from bookmarks'}), 200
    else:
        new_b = Bookmark(user_id=current_user.id, target_type='question', target_id=question_id)
        db.session.add(new_b)
        db.session.commit()
        return jsonify({'success': True, 'is_bookmarked': True, 'message': 'Question bookmarked'}), 201


@community_bp.route('/comments', methods=['POST'])
@token_required
def add_comment(current_user):
    data = request.get_json() or {}
    target_type = data.get('target_type')
    target_id = data.get('target_id')
    content = data.get('content', '').strip()

    if not content or not target_type or not target_id:
        return jsonify({'success': False, 'message': 'Target and content are required'}), 400

    comment = Comment(
        user_id=current_user.id,
        target_type=target_type,
        target_id=target_id,
        content=content
    )
    db.session.add(comment)
    db.session.commit()

    return jsonify({'success': True, 'comment': comment.to_dict()}), 201
