"""
Centralized error handling.
Registers handlers on the Flask app so all errors return a consistent
JSON shape: { "error": true, "message": "...", "details": ... (optional) }
"""
from flask import jsonify
from werkzeug.exceptions import HTTPException
from app.utils.logger import get_logger

logger = get_logger(__name__)


class APIError(Exception):
    """Raise this anywhere in services/routes for a controlled, user-facing error."""

    def __init__(self, message: str, status_code: int = 400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details


def register_error_handlers(app):

    @app.errorhandler(APIError)
    def handle_api_error(err):
        logger.warning(f"APIError: {err.message}")
        payload = {"error": True, "message": err.message}
        if err.details:
            payload["details"] = err.details
        return jsonify(payload), err.status_code

    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        logger.warning(f"HTTPException: {err.description}")
        return jsonify({"error": True, "message": err.description}), err.code

    @app.errorhandler(413)
    def handle_file_too_large(err):
        return jsonify({
            "error": True,
            "message": "File is too large. Maximum upload size is 10MB.",
        }), 413

    @app.errorhandler(Exception)
    def handle_unexpected_error(err):
        logger.exception(f"Unhandled exception: {err}")
        return jsonify({
            "error": True,
            "message": "An unexpected error occurred. Please try again.",
        }), 500
