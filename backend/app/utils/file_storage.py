"""
Helpers for saving uploaded files safely to disk.
"""
import os
import uuid
from werkzeug.utils import secure_filename


def save_uploaded_file(file_storage, upload_folder: str, user_id: int) -> tuple[str, str, str]:
    """
    Saves an uploaded file under a unique name to avoid collisions.
    Returns (absolute_file_path, stored_filename, original_filename).
    """
    original_filename = secure_filename(file_storage.filename)
    ext = original_filename.rsplit(".", 1)[1].lower()

    unique_name = f"user{user_id}_{uuid.uuid4().hex[:12]}.{ext}"

    user_folder = os.path.join(upload_folder, str(user_id))
    os.makedirs(user_folder, exist_ok=True)

    file_path = os.path.join(user_folder, unique_name)
    file_storage.save(file_path)

    return file_path, unique_name, original_filename


def delete_file_if_exists(file_path: str) -> None:
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
