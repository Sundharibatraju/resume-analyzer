"""
Job Description Parsing Engine.

Extracts required skills, preferred skills, experience requirements,
education requirements, and general keywords from a pasted/uploaded JD.
"""
import re
from app.services.resume_parser import nlp, _skill_matcher, extract_skills
from app.services.skill_dictionary import get_category_for_skill

REQUIRED_MARKERS = [
    "required", "requirements", "must have", "minimum qualifications",
    "you have", "what you'll need", "what we're looking for", "qualifications",
]
PREFERRED_MARKERS = [
    "preferred", "nice to have", "bonus", "plus", "good to have", "desirable",
]

DEGREE_LEVEL_PATTERNS = {
    "phd": r"\bph\.?d\b|\bdoctorate\b",
    "master": r"\bmaster'?s?\b|\bm\.sc\b|\bmba\b|\bm\.tech\b",
    "bachelor": r"\bbachelor'?s?\b|\bb\.sc\b|\bb\.tech\b|\bb\.e\.?\b|\bundergraduate degree\b",
    "associate": r"\bassociate'?s? degree\b",
}


def _split_jd_sections(text: str) -> dict:
    """Splits JD text into required vs preferred chunks based on marker phrases."""
    lower_text = text.lower()
    lines = text.split("\n")

    required_lines, preferred_lines, general_lines = [], [], []
    mode = "general"

    for line in lines:
        lower_line = line.strip().lower()
        if any(m in lower_line for m in PREFERRED_MARKERS) and len(lower_line) < 60:
            mode = "preferred"
            continue
        if any(m in lower_line for m in REQUIRED_MARKERS) and len(lower_line) < 60:
            mode = "required"
            continue

        if mode == "required":
            required_lines.append(line)
        elif mode == "preferred":
            preferred_lines.append(line)
        else:
            general_lines.append(line)

    return {
        "required_text": "\n".join(required_lines),
        "preferred_text": "\n".join(preferred_lines),
        "general_text": "\n".join(general_lines),
    }


def extract_experience_requirement(text: str) -> dict:
    """Finds the minimum years of experience requested, e.g. '3-5 years', '5+ years'."""
    range_match = re.search(r"(\d+)\s*(?:-|to)\s*(\d+)\s*\+?\s*years?", text, re.IGNORECASE)
    if range_match:
        return {"min_years": int(range_match.group(1)), "max_years": int(range_match.group(2))}

    plus_match = re.search(r"(\d+)\+?\s*years?", text, re.IGNORECASE)
    if plus_match:
        years = int(plus_match.group(1))
        return {"min_years": years, "max_years": None}

    return {"min_years": 0, "max_years": None}


def extract_education_requirement(text: str) -> list:
    found = []
    for level, pattern in DEGREE_LEVEL_PATTERNS.items():
        if re.search(pattern, text, re.IGNORECASE):
            found.append(level)
    return found


def extract_keywords(text: str, top_n: int = 25) -> list:
    """
    Extracts salient single/multi-word keywords using simple noun-chunk +
    frequency heuristics. This is a lightweight keyword cloud, distinct
    from the structured skill list.
    """
    doc = nlp(text)
    candidates = {}

    if doc.has_annotation("DEP") or "tagger" in nlp.pipe_names:
        # Use noun chunks if a full pipeline is available
        try:
            for chunk in doc.noun_chunks:
                phrase = chunk.text.strip().lower()
                phrase = re.sub(r"^(the|a|an|our|your|their)\s+", "", phrase)
                if 2 <= len(phrase) <= 40 and not phrase.isdigit():
                    candidates[phrase] = candidates.get(phrase, 0) + 1
        except Exception:
            pass

    if not candidates:
        # Fallback: simple word frequency, excluding stopword-like short tokens
        words = re.findall(r"[A-Za-z][A-Za-z+.#]{2,}", text)
        stop = {"the", "and", "for", "with", "this", "that", "you", "are", "will", "our"}
        for w in words:
            wl = w.lower()
            if wl not in stop:
                candidates[wl] = candidates.get(wl, 0) + 1

    sorted_keywords = sorted(candidates.items(), key=lambda x: x[1], reverse=True)
    return [kw for kw, _ in sorted_keywords[:top_n]]


def parse_job_description(text: str) -> dict:
    sections = _split_jd_sections(text)

    required_text = sections["required_text"] or text
    preferred_text = sections["preferred_text"]

    required_skills = extract_skills(required_text) if required_text.strip() else []
    preferred_skills = extract_skills(preferred_text) if preferred_text.strip() else []
    all_skills = extract_skills(text)

    # Ensure skills found anywhere but not yet bucketed end up in "required"
    required_names = {s["name"].lower() for s in required_skills}
    preferred_names = {s["name"].lower() for s in preferred_skills}
    for skill in all_skills:
        if skill["name"].lower() not in required_names and skill["name"].lower() not in preferred_names:
            required_skills.append(skill)

    return {
        "required_skills": required_skills,
        "preferred_skills": preferred_skills,
        "experience_requirement": extract_experience_requirement(text),
        "education_requirement": extract_education_requirement(text),
        "keywords": extract_keywords(text),
        "word_count": len(text.split()),
    }
