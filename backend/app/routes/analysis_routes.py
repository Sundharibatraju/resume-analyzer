"""
Analysis routes: run a new analysis, fetch a specific result, fetch history.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.resume import Resume
from app.models.analysis import Analysis
from app.services.jd_parser import parse_job_description
from app.services.ats_scorer import calculate_ats_score
from app.services.section_analyzer import analyze_sections, generate_recommendations
from app.utils.validators import validate_required_fields
from app.middleware.error_handler import APIError
from app.utils.logger import get_logger

logger = get_logger(__name__)
analysis_bp = Blueprint("analysis", __name__, url_prefix="/api")


@analysis_bp.route("/analyze", methods=["POST"])
@jwt_required()
def analyze():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)

    is_valid, error_msg = validate_required_fields(data, ["resume_id", "job_description"])
    if not is_valid:
        raise APIError(error_msg, 400)

    resume_id = data["resume_id"]
    job_description = data["job_description"].strip()
    job_title = (data.get("job_title") or "").strip() or None

    if len(job_description.split()) < 10:
        raise APIError("Job description is too short to analyze meaningfully.", 400)

    resume = Resume.query.filter_by(id=resume_id, user_id=user_id).first()
    if not resume:
        raise APIError("Resume not found.", 404)

    resume_data = resume.get_parsed_data()
    jd_data = parse_job_description(job_description)

    score_breakdown = calculate_ats_score(
        resume_data, jd_data, resume.raw_text or "", job_description
    )
    section_scores = analyze_sections(resume_data)
    recommendations = generate_recommendations(resume_data, jd_data, score_breakdown, section_scores)

    analysis = Analysis(
        resume_id=resume.id,
        job_title=job_title,
        job_description=job_description,
        ats_score=score_breakdown["ats_score"],
        skill_score=score_breakdown["skill_score"],
        keyword_score=score_breakdown["keyword_score"],
        experience_score=score_breakdown["experience_score"],
        education_score=score_breakdown["education_score"],
    )
    analysis.set_json_field("matched_skills", score_breakdown["matched_skills"])
    analysis.set_json_field("missing_skills", score_breakdown["missing_skills"])
    analysis.set_json_field("recommended_skills", score_breakdown["recommended_skills"])
    analysis.set_json_field("recommendations", recommendations)
    analysis.set_json_field("section_scores", section_scores)

    db.session.add(analysis)
    db.session.commit()

    logger.info(f"Analysis #{analysis.id} run for resume #{resume.id} (user {user_id})")

    result = analysis.to_dict()
    result["resume"] = resume.to_dict()
    result["jd_summary"] = {
        "required_skills": [s["name"] for s in jd_data["required_skills"]],
        "preferred_skills": [s["name"] for s in jd_data["preferred_skills"]],
        "experience_requirement": jd_data["experience_requirement"],
        "education_requirement": jd_data["education_requirement"],
        "keywords": jd_data["keywords"],
    }

    return jsonify({"message": "Analysis complete.", "analysis": result}), 201


@analysis_bp.route("/results/<int:analysis_id>", methods=["GET"])
@jwt_required()
def get_result(analysis_id):
    user_id = int(get_jwt_identity())

    analysis = (
        Analysis.query.join(Resume, Analysis.resume_id == Resume.id)
        .filter(Analysis.id == analysis_id, Resume.user_id == user_id)
        .first()
    )
    if not analysis:
        raise APIError("Analysis not found.", 404)

    result = analysis.to_dict()
    result["resume"] = analysis.resume.to_dict()
    return jsonify({"analysis": result}), 200


@analysis_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = int(get_jwt_identity())

    analyses = (
        Analysis.query.join(Resume, Analysis.resume_id == Resume.id)
        .filter(Resume.user_id == user_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    history = []
    for a in analyses:
        item = a.to_dict()
        item["resume_filename"] = a.resume.original_filename
        history.append(item)

    return jsonify({"history": history}), 200


@analysis_bp.route("/rank-resumes", methods=["POST"])
@jwt_required()
def rank_resumes():
    """
    Ranks all of the user's resumes against a single job description.
    Useful for recruiters comparing multiple candidates' resumes
    (here, all resumes belonging to the authenticated account).
    """
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)

    is_valid, error_msg = validate_required_fields(data, ["job_description"])
    if not is_valid:
        raise APIError(error_msg, 400)

    job_description = data["job_description"].strip()
    jd_data = parse_job_description(job_description)

    resumes = Resume.query.filter_by(user_id=user_id).all()
    if not resumes:
        raise APIError("No resumes found to rank. Upload at least one resume first.", 404)

    ranked = []
    for resume in resumes:
        resume_data = resume.get_parsed_data()
        score_breakdown = calculate_ats_score(
            resume_data, jd_data, resume.raw_text or "", job_description
        )
        ranked.append({
            "resume_id": resume.id,
            "filename": resume.original_filename,
            "candidate_name": resume_data.get("name"),
            "ats_score": score_breakdown["ats_score"],
            "skill_score": score_breakdown["skill_score"],
            "experience_score": score_breakdown["experience_score"],
        })

    ranked.sort(key=lambda x: x["ats_score"], reverse=True)
    for i, item in enumerate(ranked, start=1):
        item["rank"] = i

    return jsonify({"ranking": ranked}), 200
