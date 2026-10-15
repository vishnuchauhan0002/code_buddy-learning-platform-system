import uuid
from datetime import datetime, timedelta
import jwt
from flask import current_app
from backend.app.extensions import db
from backend.app.models import User, UserProfile, PasswordResetToken

def generate_jwt_token(user):
    payload = {
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'exp': datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')


def register_user(username, email, password, full_name, skill_level='Beginner'):
    username = username.strip()
    email = email.strip().lower()

    if User.query.filter_by(username=username).first():
        return False, "Username is already taken"

    if User.query.filter_by(email=email).first():
        return False, "Email address is already registered"

    user = User(
        username=username,
        email=email,
        role='student'
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    profile = UserProfile(
        user_id=user.id,
        full_name=full_name.strip() or username,
        skill_level=skill_level,
        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}"
    )
    db.session.add(profile)
    db.session.commit()

    token = generate_jwt_token(user)
    return True, {'user': user.to_dict(), 'token': token}


def authenticate_user(identifier, password):
    identifier = identifier.strip()
    user = User.query.filter((User.username == identifier) | (User.email == identifier.lower())).first()

    if not user or not user.check_password(password):
        return False, "Invalid username/email or password"

    if not user.is_active:
        return False, "This account has been deactivated. Please contact support."

    token = generate_jwt_token(user)
    return True, {'user': user.to_dict(), 'token': token}


def create_reset_token(email):
    email = email.strip().lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        return False, "No account found with this email address"

    token_str = str(uuid.uuid4())
    reset_entry = PasswordResetToken(
        user_id=user.id,
        token=token_str,
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.session.add(reset_entry)
    db.session.commit()

    return True, {'token': token_str, 'email': email, 'username': user.username}


def apply_password_reset(token_str, new_password):
    token_entry = PasswordResetToken.query.filter_by(token=token_str, is_used=False).first()
    if not token_entry:
        return False, "Invalid or expired reset token"

    if token_entry.expires_at < datetime.utcnow():
        return False, "Reset token has expired"

    user = User.query.get(token_entry.user_id)
    if not user:
        return False, "Associated user could not be found"

    user.set_password(new_password)
    token_entry.is_used = True
    db.session.commit()

    return True, "Password has been successfully reset"
