"""
ATS Scoring Engine.

Combines:
  - Skill Match Score   (40%) — set overlap + TF-IDF/cosine similarity of skill text
  - Keyword Match Score (30%) — TF-IDF cosine similarity of full resume vs JD text
  - Experience Score    (20%) — resume years vs JD minimum years required
  - Education Score     (10%) — resume's highest degree vs JD requirement

Overall ATS Score = weighted sum, normalized to 0-100.
"""
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

WEIGHTS = {
    "skill": 0.40,
    "keyword": 0.30,
    "experience": 0.20,
    "education": 0.10,
}

DEGREE_RANK = {"associate": 1, "bachelor": 2, "master": 3, "phd": 4}


def _cosine_similarity_score(text_a: str, text_b: str) -> float:
    """Returns a 0-100 cosine similarity score between two raw texts using TF-IDF."""
    if not text_a.strip() or not text_b.strip():
        return 0.0
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=2000)
        tfidf_matrix = vectorizer.fit_transform([text_a, text_b])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(similarity) * 100, 2)
    except ValueError:
        # Happens if vocabulary is empty after stopword removal
        return 0.0


def calculate_skill_match(resume_skills: list, required_skills: list, preferred_skills: list) -> dict:
    """
    resume_skills / required_skills / preferred_skills: lists of {"name": ..., "category": ...}
    Returns matched, missing, recommended skills + a 0-100 score.
    """
    resume_names = {s["name"].lower(): s["name"] for s in resume_skills}
    required_names = {s["name"].lower(): s["name"] for s in required_skills}
    preferred_names = {s["name"].lower(): s["name"] for s in preferred_skills}

    matched = [name for key, name in required_names.items() if key in resume_names]
    matched += [name for key, name in preferred_names.items() if key in resume_names and name not in matched]

    missing_required = [name for key, name in required_names.items() if key not in resume_names]
    missing_preferred = [name for key, name in preferred_names.items() if key not in resume_names]

    total_jd_skills = len(required_names) + len(preferred_names)
    if total_jd_skills == 0:
        # No skills detected in JD at all — fall back to neutral score
        return {
            "score": 50.0,
            "matched_skills": [s["name"] for s in resume_skills],
            "missing_skills": [],
            "recommended_skills": [],
        }

    # Weighted: required matches count more than preferred matches
    matched_required_count = len(required_names) - len(missing_required)
    matched_preferred_count = len(preferred_names) - len(missing_preferred)

    weighted_matched = matched_required_count * 1.0 + matched_preferred_count * 0.5
    weighted_total = len(required_names) * 1.0 + len(preferred_names) * 0.5

    score = (weighted_matched / weighted_total * 100) if weighted_total > 0 else 50.0

    return {
        "score": round(min(score, 100.0), 2),
        "matched_skills": matched,
        "missing_skills": missing_required,
        "recommended_skills": missing_preferred,
    }


def calculate_keyword_match(resume_text: str, jd_text: str, resume_keywords_hit: list = None) -> float:
    """TF-IDF cosine similarity between full resume text and full JD text."""
    return _cosine_similarity_score(resume_text, jd_text)


def calculate_experience_match(resume_years: float, jd_experience_req: dict) -> float:
    min_years = jd_experience_req.get("min_years", 0)
    if min_years == 0:
        return 100.0  # JD didn't specify a requirement — don't penalize

    if resume_years >= min_years:
        return 100.0

    # Partial credit, scaled — e.g. 2 years experience vs 4 required = 50%
    ratio = resume_years / min_years if min_years > 0 else 1.0
    return round(min(max(ratio * 100, 0), 100), 2)


def _highest_degree_rank(education_entries) -> int:
    text_blob = " ".join(
        e.get("text", "") if isinstance(e, dict) else str(e) for e in education_entries
    ).lower()
    best = 0
    if "phd" in text_blob or "doctorate" in text_blob:
        best = max(best, 4)
    if "master" in text_blob or "m.sc" in text_blob or "mba" in text_blob or "m.tech" in text_blob:
        best = max(best, 3)
    if "bachelor" in text_blob or "b.sc" in text_blob or "b.tech" in text_blob or "b.e" in text_blob:
        best = max(best, 2)
    if "associate" in text_blob or "diploma" in text_blob:
        best = max(best, 1)
    return best


def calculate_education_match(resume_education: list, jd_education_req: list) -> float:
    if not jd_education_req:
        return 100.0  # No specific requirement stated

    required_rank = max((DEGREE_RANK.get(level, 0) for level in jd_education_req), default=0)
    resume_rank = _highest_degree_rank(resume_education)

    if resume_rank >= required_rank:
        return 100.0
    if resume_rank == 0:
        return 20.0
    # Partial credit for being close (e.g. bachelor's when master's preferred)
    return round(max(40.0, (resume_rank / required_rank) * 100), 2)


def calculate_ats_score(resume_data: dict, jd_data: dict, resume_text: str, jd_text: str) -> dict:
    """
    Master scoring function. Returns the full breakdown used to populate
    the Analysis record and the frontend results page.
    """
    skill_result = calculate_skill_match(
        resume_data.get("skills", []),
        jd_data.get("required_skills", []),
        jd_data.get("preferred_skills", []),
    )
    keyword_score = calculate_keyword_match(resume_text, jd_text)
    experience_score = calculate_experience_match(
        resume_data.get("years_experience", 0),
        jd_data.get("experience_requirement", {}),
    )
    education_score = calculate_education_match(
        resume_data.get("education", []),
        jd_data.get("education_requirement", []),
    )

    overall = (
        skill_result["score"] * WEIGHTS["skill"]
        + keyword_score * WEIGHTS["keyword"]
        + experience_score * WEIGHTS["experience"]
        + education_score * WEIGHTS["education"]
    )
    overall = round(min(max(overall, 0), 100), 2)

    return {
        "ats_score": overall,
        "skill_score": skill_result["score"],
        "keyword_score": keyword_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "matched_skills": skill_result["matched_skills"],
        "missing_skills": skill_result["missing_skills"],
        "recommended_skills": skill_result["recommended_skills"],
    }
