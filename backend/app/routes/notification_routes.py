from flask import Blueprint, jsonify
from backend.app.models import Notification
from backend.app.extensions import db
from backend.app.utils.middleware import token_required

notification_bp = Blueprint('notification_bp', __name__)

@notification_bp.route('', methods=['GET'])
@token_required
def get_notifications(current_user):
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(
        Notification.created_at.desc()
    ).limit(30).all()

    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()

    return jsonify({
        'success': True,
        'notifications': [n.to_dict() for n in notifications],
        'unread_count': unread_count
    }), 200

@notification_bp.route('/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_read(current_user, notification_id):
    notif = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
    if notif:
        notif.is_read = True
        db.session.commit()
    return jsonify({'success': True}), 200

@notification_bp.route('/read-all', methods=['PUT'])
@token_required
def mark_all_read(current_user):
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'success': True}), 200
