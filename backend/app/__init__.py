import os
from flask import Flask, jsonify
from flask_cors import CORS
from backend.app.config import Config
from backend.app.extensions import db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)

    # Configure CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Register blueprints
    from backend.app.routes.auth_routes import auth_bp
    from backend.app.routes.problem_routes import problems_bp
    from backend.app.routes.snippets_routes import snippets_bp
    from backend.app.routes.ai_routes import ai_bp
    from backend.app.routes.community_routes import community_bp
    from backend.app.routes.mentors_routes import mentors_bp
    from backend.app.routes.contest_routes import contests_bp
    from backend.app.routes.dashboard_routes import dashboard_bp
    from backend.app.routes.admin_routes import admin_bp
    from backend.app.routes.code_routes import code_bp
    from backend.app.routes.notification_routes import notification_bp
    from backend.app.routes.study_routes import study_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(problems_bp, url_prefix='/api/problems')
    app.register_blueprint(snippets_bp, url_prefix='/api/snippets')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(community_bp, url_prefix='/api/community')
    app.register_blueprint(mentors_bp, url_prefix='/api/mentors')
    app.register_blueprint(contests_bp, url_prefix='/api/contests')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(code_bp, url_prefix='/api/code')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(study_bp, url_prefix='/api/study')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'platform': 'CodeBuddy',
            'version': '1.0.0',
            'database': 'connected'
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Internal server error'}), 500

    return app
