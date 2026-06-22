"""
Resume routes: upload, retrieve, list, delete.
"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.resume import Resume
from app.utils.validators import allowed_file
from app.utils.file_storage import save_uploaded_file, delete_file_if_exists
from app.services.document_extractor import extract_text, DocumentExtractionError
from app.services.resume_parser import parse_resume
from app.middleware.error_handler import APIError
from app.utils.logger import get_logger

logger = get_logger(__name__)
resume_bp = Blueprint("resume", __name__, url_prefix="/api")


@resume_bp.route("/upload-resume", methods=["POST"])
@jwt_required()
def upload_resume():
    user_id = int(get_jwt_identity())

    if "file" not in request.files:
        raise APIError("No file was uploaded. Please attach a PDF or DOCX file.", 400)

    file = request.files["file"]
    if file.filename == "":
        raise APIError("No file was selected.", 400)

    allowed_extensions = current_app.config["ALLOWED_EXTENSIONS"]
    if not allowed_file(file.filename, allowed_extensions):
        raise APIError("Unsupported file type. Please upload a PDF or DOCX file.", 400)

    file_type = file.filename.rsplit(".", 1)[1].lower()

    file_path, stored_filename, original_filename = save_uploaded_file(
        file, current_app.config["UPLOAD_FOLDER"], user_id
    )

    try:
        raw_text = extract_text(file_path, file_type)
    except DocumentExtractionError as e:
        delete_file_if_exists(file_path)
        raise APIError(str(e), 422)

    if len(raw_text.split()) < 20:
        delete_file_if_exists(file_path)
        raise APIError(
            "This file doesn't contain enough readable text to analyze. "
            "It may be a scanned image — please upload a text-based PDF or DOCX.",
            422,
        )

    parsed_data = parse_resume(raw_text)

    resume = Resume(
        user_id=user_id,
        original_filename=original_filename,
        file_path=file_path,
        file_type=file_type,
        raw_text=raw_text,
    )
    resume.set_parsed_data(parsed_data)

    db.session.add(resume)
    db.session.commit()

    logger.info(f"Resume uploaded by user {user_id}: {original_filename}")

    return jsonify({
        "message": "Resume uploaded and parsed successfully.",
        "resume": resume.to_dict(),
    }), 201


@resume_bp.route("/resumes", methods=["GET"])
@jwt_required()
def list_resumes():
    user_id = int(get_jwt_identity())
    resumes = (
        Resume.query.filter_by(user_id=user_id)
        .order_by(Resume.upload_date.desc())
        .all()
    )
    return jsonify({"resumes": [r.to_dict(include_parsed=False) for r in resumes]}), 200


@resume_bp.route("/resume/<int:resume_id>", methods=["GET"])
@jwt_required()
def get_resume(resume_id):
    user_id = int(get_jwt_identity())
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        raise APIError("Resume not found.", 404)
    return jsonify({"resume": resume.to_dict()}), 200


@resume_bp.route("/resume/<int:resume_id>", methods=["DELETE"])
@jwt_required()
def delete_resume(resume_id):
    user_id = int(get_jwt_identity())
    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        raise APIError("Resume not found.", 404)

    delete_file_if_exists(resume.file_path)
    db.session.delete(resume)
    db.session.commit()

    logger.info(f"Resume {resume_id} deleted by user {user_id}")
    return jsonify({"message": "Resume deleted successfully."}), 200
