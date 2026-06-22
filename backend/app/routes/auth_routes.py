"""
Authentication routes: register, login, get current user profile.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db
from app.models.user import User
from app.utils.validators import is_valid_email, is_valid_password, is_valid_name, validate_required_fields
from app.middleware.error_handler import APIError
from app.utils.logger import get_logger

logger = get_logger(__name__)
auth_bp = Blueprint("auth", __name__, url_prefix="/api")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    is_valid, error_msg = validate_required_fields(data, ["name", "email", "password"])
    if not is_valid:
        raise APIError(error_msg, 400)

    name = data["name"].strip()
    email = data["email"].strip().lower()
    password = data["password"]

    if not is_valid_name(name):
        raise APIError("Please provide a valid name.", 400)
    if not is_valid_email(email):
        raise APIError("Please provide a valid email address.", 400)

    password_valid, password_error = is_valid_password(password)
    if not password_valid:
        raise APIError(password_error, 400)

    if User.query.filter_by(email=email).first():
        raise APIError("An account with this email already exists.", 409)

    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    logger.info(f"New user registered: {email}")

    return jsonify({
        "message": "Account created successfully.",
        "access_token": access_token,
        "user": user.to_dict(),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    is_valid, error_msg = validate_required_fields(data, ["email", "password"])
    if not is_valid:
        raise APIError(error_msg, 400)

    email = data["email"].strip().lower()
    password = data["password"]

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        raise APIError("Invalid email or password.", 401)

    access_token = create_access_token(identity=str(user.id))
    logger.info(f"User logged in: {email}")

    return jsonify({
        "message": "Login successful.",
        "access_token": access_token,
        "user": user.to_dict(),
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        raise APIError("User not found.", 404)
    return jsonify({"user": user.to_dict()}), 200
