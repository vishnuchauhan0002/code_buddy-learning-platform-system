from flask import Blueprint, request, jsonify
from backend.app.models import User, UserProfile
from backend.app.extensions import db
from backend.app.services.auth_service import (
    register_user, authenticate_user, create_reset_token, apply_password_reset
)
from backend.app.utils.middleware import token_required

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    full_name = data.get('full_name', '').strip()
    skill_level = data.get('skill_level', 'Beginner')

    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Username, email, and password are required'}), 400

    if len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be at least 3 characters'}), 400

    if '@' not in email or '.' not in email:
        return jsonify({'success': False, 'message': 'Please provide a valid email address'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400

    if confirm_password and password != confirm_password:
        return jsonify({'success': False, 'message': 'Passwords do not match'}), 400

    success, result = register_user(username, email, password, full_name, skill_level)
    if not success:
        return jsonify({'success': False, 'message': result}), 400

    return jsonify({
        'success': True,
        'message': 'Registration successful! Welcome to CodeBuddy.',
        'data': result
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = data.get('identifier') or data.get('email') or data.get('username') or ''
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'success': False, 'message': 'Email/Username and password are required'}), 400

    success, result = authenticate_user(identifier, password)
    if not success:
        return jsonify({'success': False, 'message': result}), 401

    return jsonify({
        'success': True,
        'message': 'Logged in successfully',
        'data': result
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    # JWT is stateless, client clears token from storage
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'success': True,
        'data': current_user.to_dict()
    }), 200


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json() or {}
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id, full_name=current_user.username)
        db.session.add(profile)

    if 'full_name' in data:
        profile.full_name = data['full_name'].strip()
    if 'bio' in data:
        profile.bio = data['bio']
    if 'avatar_url' in data:
        profile.avatar_url = data['avatar_url']
    if 'skill_level' in data:
        profile.skill_level = data['skill_level']
    if 'preferred_languages' in data:
        if isinstance(data['preferred_languages'], list):
            profile.preferred_languages = ', '.join(data['preferred_languages'])
        else:
            profile.preferred_languages = str(data['preferred_languages'])
    if 'github_url' in data:
        profile.github_url = data['github_url']
    if 'linkedin_url' in data:
        profile.linkedin_url = data['linkedin_url']

    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'data': current_user.to_dict()
    }), 200


@auth_bp.route('/change-password', methods=['PUT'])
@token_required
def change_password(current_user):
    data = request.get_json() or {}
    current_pass = data.get('current_password', '')
    new_pass = data.get('new_password', '')

    if not current_pass or not new_pass:
        return jsonify({'success': False, 'message': 'Current and new password are required'}), 400

    if not current_user.check_password(current_pass):
        return jsonify({'success': False, 'message': 'Incorrect current password'}), 400

    if len(new_pass) < 6:
        return jsonify({'success': False, 'message': 'New password must be at least 6 characters'}), 400

    current_user.set_password(new_pass)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Password changed successfully'}), 200


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '')
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    success, result = create_reset_token(email)
    if not success:
        return jsonify({'success': False, 'message': result}), 404

    # Development notice with direct token for evaluation/testing
    return jsonify({
        'success': True,
        'message': 'Password reset token generated. (In development mode, token is returned directly below)',
        'reset_token': result['token'],
        'reset_url': f"/reset-password?token={result['token']}"
    }), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token', '')
    new_password = data.get('new_password', '')

    if not token or not new_password:
        return jsonify({'success': False, 'message': 'Token and new password are required'}), 400

    if len(new_password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400

    success, message = apply_password_reset(token, new_password)
    if not success:
        return jsonify({'success': False, 'message': message}), 400

    return jsonify({'success': True, 'message': message}), 200
