"""
Resume model — tracks an uploaded resume file and its parsed contents.
Parsed data is stored as JSON text since SQLite has no native JSON type.
"""
import json
from datetime import datetime
from app.extensions import db


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)  # pdf | docx

    # Parsed structured data (stored as JSON string)
    parsed_data = db.Column(db.Text, nullable=True)
    raw_text = db.Column(db.Text, nullable=True)

    upload_date = db.Column(db.DateTime, default=datetime.utcnow)

    analyses = db.relationship(
        "Analysis", backref="resume", lazy=True, cascade="all, delete-orphan"
    )

    def set_parsed_data(self, data: dict) -> None:
        self.parsed_data = json.dumps(data)

    def get_parsed_data(self) -> dict:
        return json.loads(self.parsed_data) if self.parsed_data else {}

    def to_dict(self, include_parsed=True) -> dict:
        result = {
            "id": self.id,
            "user_id": self.user_id,
            "original_filename": self.original_filename,
            "file_type": self.file_type,
            "upload_date": self.upload_date.isoformat() if self.upload_date else None,
        }
        if include_parsed:
            result["parsed_data"] = self.get_parsed_data()
        return result
