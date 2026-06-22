"""
Resume Section Analysis + Improvement Recommendations Engine.

Evaluates individual resume sections (contact info, summary, skills,
experience, education, projects) and generates actionable, specific
suggestions based on what's missing or weak.
"""


def analyze_sections(resume_data: dict) -> dict:
    """Returns a 0-100 score per section plus a short status label."""
    scores = {}

    # Contact Information
    contact_fields = [resume_data.get("email"), resume_data.get("phone"), resume_data.get("name")]
    contact_present = sum(1 for f in contact_fields if f)
    scores["contact_information"] = round((contact_present / 3) * 100, 1)

    # Summary
    summary = resume_data.get("summary") or ""
    if not summary.strip():
        scores["summary"] = 0.0
    elif len(summary.split()) < 15:
        scores["summary"] = 50.0
    else:
        scores["summary"] = 100.0

    # Skills
    skill_count = len(resume_data.get("skills", []))
    if skill_count == 0:
        scores["skills"] = 0.0
    elif skill_count < 5:
        scores["skills"] = 50.0
    elif skill_count < 10:
        scores["skills"] = 80.0
    else:
        scores["skills"] = 100.0

    # Experience
    experience_entries = resume_data.get("experience", [])
    if not experience_entries:
        scores["experience"] = 0.0
    else:
        base = min(70 + len(experience_entries) * 10, 90)
        if resume_data.get("has_measurable_achievements"):
            base = min(base + 10, 100)
        scores["experience"] = float(base)

    # Education
    scores["education"] = 100.0 if resume_data.get("education") else 0.0

    # Projects
    project_entries = resume_data.get("projects", [])
    scores["projects"] = min(100.0, len(project_entries) * 35.0) if project_entries else 0.0

    return scores


def generate_recommendations(resume_data: dict, jd_data: dict, score_breakdown: dict, section_scores: dict) -> list:
    """
    Produces a prioritized list of actionable recommendations.
    Each item: {"category": ..., "priority": "high"|"medium"|"low", "message": ...}
    """
    recs = []

    # Missing required skills
    missing = score_breakdown.get("missing_skills", [])
    if missing:
        top_missing = missing[:6]
        recs.append({
            "category": "Skills",
            "priority": "high",
            "message": (
                f"Add these missing required skills if you have experience with them: "
                f"{', '.join(top_missing)}."
            ),
        })

    recommended = score_breakdown.get("recommended_skills", [])
    if recommended:
        recs.append({
            "category": "Skills",
            "priority": "medium",
            "message": (
                f"Consider learning or highlighting these preferred (nice-to-have) skills: "
                f"{', '.join(recommended[:5])}."
            ),
        })

    # Keyword optimization
    if score_breakdown.get("keyword_score", 0) < 40:
        recs.append({
            "category": "Keyword Optimization",
            "priority": "high",
            "message": (
                "Your resume's overall wording overlaps weakly with this job description. "
                "Mirror more of the job description's terminology (job titles, tools, methodologies) "
                "in your bullet points and summary."
            ),
        })

    # Summary
    if section_scores.get("summary", 0) < 60:
        recs.append({
            "category": "Summary",
            "priority": "medium" if section_scores.get("summary", 0) > 0 else "high",
            "message": (
                "Add a concise professional summary (2-4 sentences) at the top of your resume "
                "highlighting your role, years of experience, and top skills."
            ),
        })

    # Measurable achievements
    if not resume_data.get("has_measurable_achievements"):
        recs.append({
            "category": "Experience",
            "priority": "high",
            "message": (
                "Quantify your achievements with numbers — e.g. \"reduced page load time by 35%\" "
                "or \"managed a $200K budget\" — instead of describing duties without measurable results."
            ),
        })

    # Experience gap
    if score_breakdown.get("experience_score", 100) < 70:
        recs.append({
            "category": "Experience",
            "priority": "medium",
            "message": (
                "Your years of experience appear below this role's stated requirement. "
                "Emphasize relevant freelance work, internships, or transferable project experience to close the gap."
            ),
        })

    # Education gap
    if score_breakdown.get("education_score", 100) < 70:
        recs.append({
            "category": "Education",
            "priority": "low",
            "message": (
                "This job lists a degree requirement your resume doesn't clearly state. "
                "If you meet it, make sure your education section clearly lists the degree and institution."
            ),
        })

    # Projects
    if section_scores.get("projects", 0) < 40:
        recs.append({
            "category": "Projects",
            "priority": "low",
            "message": (
                "Add 1-3 relevant projects with a short description of the problem, your approach, "
                "and the outcome — this is especially valuable if your work experience is limited."
            ),
        })

    # Contact info
    if section_scores.get("contact_information", 0) < 100:
        recs.append({
            "category": "Formatting",
            "priority": "high",
            "message": (
                "Make sure your name, email, and phone number are clearly visible near the top of the resume "
                "in plain text (not inside an image or text box), so ATS systems can parse them."
            ),
        })

    # Certifications nudge (general best practice, lower priority)
    if not resume_data.get("certifications"):
        recs.append({
            "category": "Certifications",
            "priority": "low",
            "message": (
                "Consider adding relevant certifications. Even one recognized certification "
                "relevant to this role can strengthen your candidacy for ATS keyword scans."
            ),
        })

    return recs
