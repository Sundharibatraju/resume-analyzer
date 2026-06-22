"""
Reusable input validation helpers.
"""
import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def is_valid_email(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))


def is_valid_password(password: str) -> tuple[bool, str]:
    """Returns (is_valid, error_message)."""
    if not password or not isinstance(password, str):
        return False, "Password is required."
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Za-z]", password):
        return False, "Password must contain at least one letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number."
    return True, ""


def is_valid_name(name: str) -> bool:
    if not name or not isinstance(name, str):
        return False
    return 1 <= len(name.strip()) <= 100


def allowed_file(filename: str, allowed_extensions: set) -> bool:
    if not filename or "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in allowed_extensions


def validate_required_fields(data: dict, required_fields: list) -> tuple[bool, str]:
    if not data:
        return False, "Request body is missing or not valid JSON."
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return False, f"Missing required field(s): {', '.join(missing)}"
    return True, ""
