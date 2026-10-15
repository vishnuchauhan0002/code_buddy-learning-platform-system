import json
from datetime import datetime
from backend.app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='student', nullable=False) # 'student', 'mentor', 'admin'
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    submissions = db.relationship('Submission', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    snippets = db.relationship('SavedSnippet', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    bookmarks = db.relationship('Bookmark', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    questions = db.relationship('Question', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    answers = db.relationship('Answer', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    mentor_profile = db.relationship('Mentor', backref='user', uselist=False, cascade='all, delete-orphan')
    learning_activities = db.relationship('LearningActivity', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'profile': self.profile.to_dict() if self.profile else None
        }


class UserProfile(db.Model):
    __tablename__ = 'user_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    full_name = db.Column(db.String(120), nullable=False)
    bio = db.Column(db.Text, default='')
    avatar_url = db.Column(db.String(255), default='')
    skill_level = db.Column(db.String(50), default='Beginner') # 'Beginner', 'Intermediate', 'Advanced'
    preferred_languages = db.Column(db.String(255), default='Python, JavaScript')
    github_url = db.Column(db.String(255), default='')
    linkedin_url = db.Column(db.String(255), default='')
    reputation_points = db.Column(db.Integer, default=100)
    total_points = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    highest_streak = db.Column(db.Integer, default=0)
    learning_hours = db.Column(db.Float, default=0.0)
    last_active_date = db.Column(db.Date, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'bio': self.bio,
            'avatar_url': self.avatar_url or f"https://api.dicebear.com/7.x/avataaars/svg?seed={self.full_name or 'User'}",
            'skill_level': self.skill_level,
            'preferred_languages': [l.strip() for l in self.preferred_languages.split(',') if l.strip()] if self.preferred_languages else [],
            'github_url': self.github_url,
            'linkedin_url': self.linkedin_url,
            'reputation_points': self.reputation_points,
            'total_points': self.total_points,
            'current_streak': self.current_streak,
            'highest_streak': self.highest_streak,
            'learning_hours': round(self.learning_hours, 1),
            'last_active_date': self.last_active_date.isoformat() if self.last_active_date else None
        }


class Problem(db.Model):
    __tablename__ = 'problems'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(20), nullable=False) # 'Easy', 'Medium', 'Hard'
    topic = db.Column(db.String(100), nullable=False, index=True)
    tags = db.Column(db.String(255), default='')
    input_format = db.Column(db.Text, default='')
    output_format = db.Column(db.Text, default='')
    constraints = db.Column(db.Text, default='')
    sample_input = db.Column(db.Text, default='')
    sample_output = db.Column(db.Text, default='')
    sample_explanation = db.Column(db.Text, default='')
    hints = db.Column(db.Text, default='[]') # JSON string array
    solution_code = db.Column(db.Text, default='')
    starter_code = db.Column(db.Text, default='{}') # JSON string dict by lang
    acceptance_rate = db.Column(db.Float, default=0.0)
    total_submissions = db.Column(db.Integer, default=0)
    accepted_submissions = db.Column(db.Integer, default=0)
    points = db.Column(db.Integer, default=100)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    test_cases = db.relationship('ProblemTestCase', backref='problem', cascade='all, delete-orphan', order_by='ProblemTestCase.order_index')
    submissions = db.relationship('Submission', backref='problem', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self, include_test_cases=False):
        try:
            starter = json.loads(self.starter_code) if self.starter_code else {}
        except Exception:
            starter = {}

        try:
            hint_list = json.loads(self.hints) if self.hints else []
        except Exception:
            hint_list = []

        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'description': self.description,
            'difficulty': self.difficulty,
            'topic': self.topic,
            'tags': [t.strip() for t in self.tags.split(',') if t.strip()] if self.tags else [],
            'input_format': self.input_format,
            'output_format': self.output_format,
            'constraints': self.constraints,
            'sample_input': self.sample_input,
            'sample_output': self.sample_output,
            'sample_explanation': self.sample_explanation,
            'hints': hint_list,
            'starter_code': starter,
            'acceptance_rate': round(self.acceptance_rate, 1),
            'total_submissions': self.total_submissions,
            'accepted_submissions': self.accepted_submissions,
            'points': self.points,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_test_cases:
            data['test_cases'] = [tc.to_dict() for tc in self.test_cases if not tc.is_hidden]

        return data


class ProblemTestCase(db.Model):
    __tablename__ = 'problem_test_cases'

    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.Integer, db.ForeignKey('problems.id', ondelete='CASCADE'), nullable=False)
    input_data = db.Column(db.Text, nullable=False)
    expected_output = db.Column(db.Text, nullable=False)
    is_hidden = db.Column(db.Boolean, default=False)
    order_index = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'problem_id': self.problem_id,
            'input_data': self.input_data,
            'expected_output': self.expected_output,
            'is_hidden': self.is_hidden,
            'order_index': self.order_index
        }


class Submission(db.Model):
    __tablename__ = 'submissions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    problem_id = db.Column(db.Integer, db.ForeignKey('problems.id', ondelete='CASCADE'), nullable=False)
    contest_id = db.Column(db.Integer, db.ForeignKey('contests.id', ondelete='SET NULL'), nullable=True)
    language = db.Column(db.String(50), nullable=False)
    source_code = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='Pending') # 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error'
    execution_time = db.Column(db.Float, default=0.0) # in seconds
    memory_used = db.Column(db.Float, default=0.0) # in MB
    test_cases_passed = db.Column(db.Integer, default=0)
    total_test_cases = db.Column(db.Integer, default=0)
    error_message = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else None,
            'problem_id': self.problem_id,
            'problem_title': self.problem.title if self.problem else None,
            'contest_id': self.contest_id,
            'language': self.language,
            'source_code': self.source_code,
            'status': self.status,
            'execution_time': round(self.execution_time, 3) if self.execution_time else 0.0,
            'memory_used': round(self.memory_used, 1) if self.memory_used else 0.0,
            'test_cases_passed': self.test_cases_passed,
            'total_test_cases': self.total_test_cases,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class SavedSnippet(db.Model):
    __tablename__ = 'saved_snippets'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    language = db.Column(db.String(50), default='python')
    code = db.Column(db.Text, nullable=False)
    tags = db.Column(db.String(255), default='')
    is_public = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'language': self.language,
            'code': self.code,
            'tags': [t.strip() for t in self.tags.split(',') if t.strip()] if self.tags else [],
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Bookmark(db.Model):
    __tablename__ = 'bookmarks'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    target_type = db.Column(db.String(50), nullable=False) # 'problem', 'question'
    target_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'target_type', 'target_id', name='uq_user_target_bookmark'),
    )


class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), default='General')
    tags = db.Column(db.String(255), default='')
    views_count = db.Column(db.Integer, default=0)
    upvotes_count = db.Column(db.Integer, default=0)
    accepted_answer_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    answers = db.relationship('Answer', backref='question', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self, current_user_id=None):
        user_voted = 0
        if current_user_id:
            vote = Vote.query.filter_by(user_id=current_user_id, target_type='question', target_id=self.id).first()
            if vote:
                user_voted = vote.vote_value

        is_bookmarked = False
        if current_user_id:
            is_bookmarked = Bookmark.query.filter_by(user_id=current_user_id, target_type='question', target_id=self.id).first() is not None

        return {
            'id': self.id,
            'user_id': self.user_id,
            'author_name': self.author.profile.full_name if self.author and self.author.profile else self.author.username if self.author else 'Anonymous',
            'author_username': self.author.username if self.author else 'anonymous',
            'author_avatar': self.author.profile.avatar_url if self.author and self.author.profile else f"https://api.dicebear.com/7.x/avataaars/svg?seed={self.user_id}",
            'author_reputation': self.author.profile.reputation_points if self.author and self.author.profile else 0,
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'tags': [t.strip() for t in self.tags.split(',') if t.strip()] if self.tags else [],
            'views_count': self.views_count,
            'upvotes_count': self.upvotes_count,
            'answers_count': self.answers.count(),
            'accepted_answer_id': self.accepted_answer_id,
            'user_voted': user_voted,
            'is_bookmarked': is_bookmarked,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Answer(db.Model):
    __tablename__ = 'answers'

    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    upvotes_count = db.Column(db.Integer, default=0)
    is_accepted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self, current_user_id=None):
        user_voted = 0
        if current_user_id:
            vote = Vote.query.filter_by(user_id=current_user_id, target_type='answer', target_id=self.id).first()
            if vote:
                user_voted = vote.vote_value

        return {
            'id': self.id,
            'question_id': self.question_id,
            'user_id': self.user_id,
            'author_name': self.author.profile.full_name if self.author and self.author.profile else self.author.username if self.author else 'Anonymous',
            'author_username': self.author.username if self.author else 'anonymous',
            'author_avatar': self.author.profile.avatar_url if self.author and self.author.profile else f"https://api.dicebear.com/7.x/avataaars/svg?seed={self.user_id}",
            'author_reputation': self.author.profile.reputation_points if self.author and self.author.profile else 0,
            'content': self.content,
            'upvotes_count': self.upvotes_count,
            'is_accepted': self.is_accepted,
            'user_voted': user_voted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Vote(db.Model):
    __tablename__ = 'votes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    target_type = db.Column(db.String(20), nullable=False) # 'question', 'answer'
    target_id = db.Column(db.Integer, nullable=False)
    vote_value = db.Column(db.Integer, nullable=False) # 1 or -1
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'target_type', 'target_id', name='uq_user_target_vote'),
    )


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    target_type = db.Column(db.String(20), nullable=False) # 'question', 'answer'
    target_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='comments')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'author_name': self.user.profile.full_name if self.user and self.user.profile else self.user.username,
            'author_username': self.user.username,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Mentor(db.Model):
    __tablename__ = 'mentors'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    title = db.Column(db.String(120), nullable=False) # e.g. "Senior Software Engineer"
    bio = db.Column(db.Text, default='')
    company = db.Column(db.String(120), default='')
    experience_years = db.Column(db.Integer, default=3)
    rating = db.Column(db.Float, default=5.0)
    reviews_count = db.Column(db.Integer, default=0)
    skills = db.Column(db.String(255), default='') # e.g. "JavaScript, React, Node.js"
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    requests = db.relationship('MentoringRequest', backref='mentor', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self):
        user_info = self.user.profile if self.user and self.user.profile else None
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': user_info.full_name if user_info else self.user.username if self.user else 'Mentor',
            'username': self.user.username if self.user else '',
            'avatar_url': user_info.avatar_url if user_info else f"https://api.dicebear.com/7.x/avataaars/svg?seed=mentor{self.id}",
            'title': self.title,
            'company': self.company,
            'bio': self.bio or (user_info.bio if user_info else ''),
            'experience_years': self.experience_years,
            'rating': round(self.rating, 1),
            'reviews_count': self.reviews_count,
            'skills': [s.strip() for s in self.skills.split(',') if s.strip()] if self.skills else [],
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class MentoringRequest(db.Model):
    __tablename__ = 'mentoring_requests'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('mentors.id', ondelete='CASCADE'), nullable=False)
    topic = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, default='')
    preferred_time = db.Column(db.String(100), default='')
    status = db.Column(db.String(20), default='pending') # 'pending', 'accepted', 'rejected', 'completed', 'cancelled'
    meeting_link = db.Column(db.String(255), default='')
    rating = db.Column(db.Integer, nullable=True) # 1-5 stars
    feedback = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = db.relationship('User', backref='mentoring_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.profile.full_name if self.student and self.student.profile else self.student.username if self.student else 'Student',
            'student_avatar': self.student.profile.avatar_url if self.student and self.student.profile else '',
            'mentor_id': self.mentor_id,
            'mentor_name': self.mentor.user.profile.full_name if self.mentor and self.mentor.user and self.mentor.user.profile else 'Mentor',
            'topic': self.topic,
            'message': self.message,
            'preferred_time': self.preferred_time,
            'status': self.status,
            'meeting_link': self.meeting_link,
            'rating': self.rating,
            'feedback': self.feedback,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Contest(db.Model):
    __tablename__ = 'contests'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, default=120)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    problems = db.relationship('ContestProblem', backref='contest', cascade='all, delete-orphan', order_by='ContestProblem.order_index')
    participants = db.relationship('ContestParticipant', backref='contest', cascade='all, delete-orphan')

    @property
    def status(self):
        now = datetime.utcnow()
        if now < self.start_time:
            return 'upcoming'
        elif now > self.end_time:
            return 'past'
        return 'active'

    def to_dict(self, current_user_id=None):
        is_registered = False
        if current_user_id:
            is_registered = ContestParticipant.query.filter_by(contest_id=self.id, user_id=current_user_id).first() is not None

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat(),
            'duration_minutes': self.duration_minutes,
            'status': self.status,
            'problems_count': len(self.problems),
            'participants_count': len(self.participants),
            'is_registered': is_registered,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ContestProblem(db.Model):
    __tablename__ = 'contest_problems'

    id = db.Column(db.Integer, primary_key=True)
    contest_id = db.Column(db.Integer, db.ForeignKey('contests.id', ondelete='CASCADE'), nullable=False)
    problem_id = db.Column(db.Integer, db.ForeignKey('problems.id', ondelete='CASCADE'), nullable=False)
    points = db.Column(db.Integer, default=100)
    order_index = db.Column(db.Integer, default=0)

    problem = db.relationship('Problem')

    def to_dict(self):
        prob_dict = self.problem.to_dict() if self.problem else {}
        prob_dict['contest_points'] = self.points
        prob_dict['order_index'] = self.order_index
        return prob_dict


class ContestParticipant(db.Model):
    __tablename__ = 'contest_participants'

    id = db.Column(db.Integer, primary_key=True)
    contest_id = db.Column(db.Integer, db.ForeignKey('contests.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, default=0)
    rank = db.Column(db.Integer, default=0)
    finish_time = db.Column(db.DateTime, nullable=True)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User')

    __table_args__ = (
        db.UniqueConstraint('contest_id', 'user_id', name='uq_contest_user_reg'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'contest_id': self.contest_id,
            'user_id': self.user_id,
            'username': self.user.username if self.user else '',
            'full_name': self.user.profile.full_name if self.user and self.user.profile else '',
            'avatar_url': self.user.profile.avatar_url if self.user and self.user.profile else '',
            'score': self.score,
            'rank': self.rank,
            'finish_time': self.finish_time.isoformat() if self.finish_time else None,
            'registered_at': self.registered_at.isoformat() if self.registered_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50), default='info') # 'info', 'success', 'warning', 'achievement'
    is_read = db.Column(db.Boolean, default=False)
    link = db.Column(db.String(255), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'link': self.link,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class LearningActivity(db.Model):
    __tablename__ = 'learning_activity'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    activity_type = db.Column(db.String(50), nullable=False) # 'problem_solved', 'submission', 'forum_question', 'forum_answer', 'contest'
    details = db.Column(db.String(255), default='')
    points_earned = db.Column(db.Integer, default=0)
    date = db.Column(db.Date, default=datetime.utcnow().date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'details': self.details,
            'points_earned': self.points_earned,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token = db.Column(db.String(128), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    action = db.Column(db.String(100), nullable=False)
    target_type = db.Column(db.String(50), default='')
    target_id = db.Column(db.Integer, nullable=True)
    ip_address = db.Column(db.String(50), default='')
    details = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'target_type': self.target_type,
            'target_id': self.target_id,
            'ip_address': self.ip_address,
            'details': self.details,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
