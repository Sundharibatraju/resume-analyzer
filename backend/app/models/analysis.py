"""
Analysis model — stores the result of comparing a resume against a job description.
"""
import json
from datetime import datetime
from app.extensions import db


class Analysis(db.Model):
    __tablename__ = "analyses"

    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=False)

    job_title = db.Column(db.String(255), nullable=True)
    job_description = db.Column(db.Text, nullable=False)

    # Core scores (0-100)
    ats_score = db.Column(db.Float, nullable=False)
    skill_score = db.Column(db.Float, nullable=False)
    keyword_score = db.Column(db.Float, nullable=False)
    experience_score = db.Column(db.Float, nullable=False)
    education_score = db.Column(db.Float, nullable=False)

    # JSON-serialized lists/dicts
    matched_skills = db.Column(db.Text, nullable=True)
    missing_skills = db.Column(db.Text, nullable=True)
    recommended_skills = db.Column(db.Text, nullable=True)
    recommendations = db.Column(db.Text, nullable=True)
    section_scores = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_json_field(self, field: str, value) -> None:
        setattr(self, field, json.dumps(value))

    def get_json_field(self, field: str):
        raw = getattr(self, field)
        return json.loads(raw) if raw else None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "resume_id": self.resume_id,
            "job_title": self.job_title,
            "ats_score": round(self.ats_score, 1),
            "skill_score": round(self.skill_score, 1),
            "keyword_score": round(self.keyword_score, 1),
            "experience_score": round(self.experience_score, 1),
            "education_score": round(self.education_score, 1),
            "matched_skills": self.get_json_field("matched_skills") or [],
            "missing_skills": self.get_json_field("missing_skills") or [],
            "recommended_skills": self.get_json_field("recommended_skills") or [],
            "recommendations": self.get_json_field("recommendations") or [],
            "section_scores": self.get_json_field("section_scores") or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
