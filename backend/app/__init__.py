"""
Flask application factory.
"""
import os
from flask import Flask

from app.config import Config
from app.extensions import db, jwt, cors
from app.middleware.error_handler import register_error_handlers
from app.middleware.jwt_handlers import register_jwt_callbacks


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.instance_path, exist_ok=True)

    # Extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["FRONTEND_URL"]}})

    # Middleware
    register_error_handlers(app)
    register_jwt_callbacks(jwt)

    # Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.resume_routes import resume_bp
    from app.routes.analysis_routes import analysis_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(analysis_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return {"status": "ok", "service": "resume-analyzer-api"}, 200

    # Create tables on first run (simple approach; use migrations for production)
    with app.app_context():
        db.create_all()

    return app
