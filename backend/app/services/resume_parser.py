"""
Resume Parsing Engine.

Extracts structured fields from raw resume text:
name, email, phone, skills, education, experience, certifications,
projects, languages.

Approach: spaCy is used for sentence segmentation and lightweight NER
(for name candidates), combined with a custom skill dictionary
(PhraseMatcher) and regex/section-header heuristics for the rest.
This is deliberately not "pure NER" — generic NER models are poor at
resume-specific structures like "Skills:" sections, so we lean on
section detection + phrase matching, which is far more reliable in practice.
"""
import re
import spacy
from spacy.matcher import PhraseMatcher

from app.services.skill_dictionary import get_all_skills, get_category_for_skill
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Load a small spaCy English model. If not installed, fall back to a blank
# English pipeline (sentence boundaries still work via a rule-based sentencizer).
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.warning(
        "en_core_web_sm not found — falling back to blank('en') with sentencizer. "
        "Run: python -m spacy download en_core_web_sm for better name detection."
    )
    nlp = spacy.blank("en")
    nlp.add_pipe("sentencizer")

# Build a PhraseMatcher over the skill dictionary once at import time.
_skill_matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
_skill_docs = list(nlp.pipe(get_all_skills()))
for skill_text, skill_doc in zip(get_all_skills(), _skill_docs):
    _skill_matcher.add(skill_text, [skill_doc])

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_REGEX = re.compile(
    r"(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}"
)
LINKEDIN_REGEX = re.compile(r"(linkedin\.com/in/[A-Za-z0-9\-_/]+)", re.IGNORECASE)
GITHUB_REGEX = re.compile(r"(github\.com/[A-Za-z0-9\-_/]+)", re.IGNORECASE)

SECTION_HEADERS = {
    "skills": ["skills", "technical skills", "core competencies", "key skills", "expertise"],
    "education": ["education", "academic background", "qualifications"],
    "experience": ["experience", "work experience", "professional experience", "employment history"],
    "certifications": ["certifications", "certificates", "licenses"],
    "projects": ["projects", "personal projects", "key projects"],
    "languages": ["languages", "language proficiency"],
    "summary": ["summary", "professional summary", "objective", "profile", "about"],
}

DEGREE_KEYWORDS = [
    "bachelor", "master", "phd", "doctorate", "b.sc", "bsc", "m.sc", "msc",
    "b.tech", "btech", "m.tech", "mtech", "mba", "b.e.", "be ", "m.e.",
    "associate degree", "diploma", "b.a.", "ba ", "m.a.", "ma ",
]

LANGUAGE_NAMES = [
    "English", "Spanish", "French", "German", "Mandarin", "Chinese", "Hindi",
    "Arabic", "Portuguese", "Russian", "Japanese", "Korean", "Italian",
    "Bengali", "Tamil", "Telugu", "Kannada", "Marathi", "Gujarati", "Punjabi",
    "Urdu", "Dutch", "Turkish", "Vietnamese", "Thai", "Polish",
]


def _split_into_sections(text: str) -> dict:
    """
    Splits resume text into sections based on common header keywords.
    Returns dict of {section_name: section_text}.
    """
    lines = text.split("\n")
    sections = {}
    current_section = "header"
    buffer = []

    def flush():
        if buffer:
            sections.setdefault(current_section, "")
            sections[current_section] += "\n".join(buffer) + "\n"

    for line in lines:
        stripped = line.strip().lower().rstrip(":")
        matched_section = None
        if 0 < len(stripped) <= 40:
            for section_name, keywords in SECTION_HEADERS.items():
                if stripped in keywords or any(
                    stripped == kw or stripped.startswith(kw + " ") for kw in keywords
                ):
                    matched_section = section_name
                    break

        if matched_section:
            flush()
            buffer = []
            current_section = matched_section
        else:
            buffer.append(line)

    flush()
    return sections


def extract_email(text: str) -> str | None:
    match = EMAIL_REGEX.search(text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    for match in PHONE_REGEX.finditer(text):
        candidate = match.group(0)
        digits = re.sub(r"\D", "", candidate)
        if 7 <= len(digits) <= 15:
            return candidate.strip()
    return None


def extract_links(text: str) -> dict:
    linkedin = LINKEDIN_REGEX.search(text)
    github = GITHUB_REGEX.search(text)
    return {
        "linkedin": ("https://" + linkedin.group(1)) if linkedin else None,
        "github": ("https://" + github.group(1)) if github else None,
    }


def extract_name(text: str) -> str | None:
    """
    Heuristic: the name is usually the first non-empty line that doesn't
    contain an email, phone number, or common resume keywords, and isn't
    too long. We also try spaCy PERSON entities on the first few lines
    as a cross-check when a real model is loaded.
    """
    first_lines = [l.strip() for l in text.split("\n")[:8] if l.strip()]

    # Try spaCy PERSON NER on the top of the document first.
    if "ner" in nlp.pipe_names:
        top_text = "\n".join(first_lines)
        doc = nlp(top_text)
        for ent in doc.ents:
            if ent.label_ == "PERSON" and 2 <= len(ent.text.split()) <= 4:
                return ent.text.strip()

    # Fallback heuristic
    skip_keywords = ["resume", "curriculum vitae", "cv", "@", "http", "www"]
    for line in first_lines:
        lower = line.lower()
        if any(kw in lower for kw in skip_keywords):
            continue
        if PHONE_REGEX.search(line) and len(line.split()) <= 4:
            continue
        words = line.split()
        if 1 <= len(words) <= 4 and all(w.replace(",", "").isalpha() for w in words):
            return line.strip()

    return None


def extract_skills(text: str) -> list:
    """Uses the PhraseMatcher built from the custom skill dictionary."""
    doc = nlp(text)
    matches = _skill_matcher(doc)

    found = {}
    for match_id, start, end in matches:
        skill_name = nlp.vocab.strings[match_id]
        found[skill_name.lower()] = skill_name

    skills = sorted(found.values())
    return [{"name": s, "category": get_category_for_skill(s)} for s in skills]


def extract_education(section_text: str) -> list:
    if not section_text:
        return []
    entries = []
    for line in section_text.split("\n"):
        line = line.strip()
        if not line:
            continue
        lower = line.lower()
        if any(kw in lower for kw in DEGREE_KEYWORDS):
            year_match = re.search(r"(19|20)\d{2}", line)
            entries.append({
                "text": line,
                "year": year_match.group(0) if year_match else None,
            })
    return entries


def extract_experience(section_text: str) -> list:
    if not section_text:
        return []
    entries = []
    current_entry = []
    for line in section_text.split("\n"):
        stripped = line.strip()
        if not stripped:
            if current_entry:
                entries.append(" ".join(current_entry))
                current_entry = []
            continue
        # New entry heuristic: line contains a year range or starts with capitalized job-title-looking text
        if re.search(r"(19|20)\d{2}\s*(-|–|to)\s*((19|20)\d{2}|present)", stripped, re.IGNORECASE):
            if current_entry:
                entries.append(" ".join(current_entry))
            current_entry = [stripped]
        else:
            current_entry.append(stripped)
    if current_entry:
        entries.append(" ".join(current_entry))

    return [{"text": e} for e in entries if e.strip()]


def extract_total_years_experience(section_text: str, full_text: str) -> float:
    """
    Estimates total years of experience from explicit mentions
    ("5+ years of experience") or by summing date ranges in the experience section.
    """
    explicit = re.search(
        r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience", full_text, re.IGNORECASE
    )
    if explicit:
        try:
            return float(explicit.group(1))
        except ValueError:
            pass

    if not section_text:
        return 0.0

    total_months = 0
    ranges = re.findall(
        r"(\d{4})\s*(?:-|–|to)\s*(\d{4}|present)", section_text, re.IGNORECASE
    )
    import datetime
    current_year = datetime.datetime.now().year
    for start, end in ranges:
        start_year = int(start)
        end_year = current_year if end.lower() == "present" else int(end)
        if end_year >= start_year:
            total_months += (end_year - start_year) * 12

    return round(total_months / 12, 1)


def extract_certifications(section_text: str) -> list:
    if not section_text:
        return []
    return [
        line.strip() for line in section_text.split("\n") if line.strip()
    ]


def extract_projects(section_text: str) -> list:
    if not section_text:
        return []
    projects = []
    current = []
    for line in section_text.split("\n"):
        stripped = line.strip()
        if not stripped:
            if current:
                projects.append(" ".join(current))
                current = []
            continue
        current.append(stripped)
    if current:
        projects.append(" ".join(current))
    return [{"text": p} for p in projects if p.strip()]


def extract_languages(text: str) -> list:
    found = []
    lower_text = text.lower()
    for lang in LANGUAGE_NAMES:
        if re.search(r"\b" + re.escape(lang.lower()) + r"\b", lower_text):
            found.append(lang)
    return found


def has_measurable_achievements(section_text: str) -> bool:
    """Checks for quantified results (%, $, numbers + action verbs) — used later for suggestions."""
    if not section_text:
        return False
    return bool(re.search(r"\d+%|\$\d+|\d+x\b|increased|reduced|improved|grew|saved", section_text, re.IGNORECASE))


def parse_resume(text: str) -> dict:
    """
    Main entry point: takes raw resume text and returns a fully
    structured dict of extracted fields.
    """
    sections = _split_into_sections(text)

    skills_section_text = sections.get("skills", "")
    # Skills can also appear scattered throughout (e.g. in project descriptions),
    # so we run skill extraction over the *whole* document, not just the Skills section.
    skills = extract_skills(text)

    education = extract_education(sections.get("education", ""))
    experience_entries = extract_experience(sections.get("experience", ""))
    years_experience = extract_total_years_experience(sections.get("experience", ""), text)
    certifications = extract_certifications(sections.get("certifications", ""))
    projects = extract_projects(sections.get("projects", ""))
    languages = extract_languages(sections.get("languages", "") or text)
    links = extract_links(text)

    summary_text = sections.get("summary", "").strip()

    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "linkedin": links["linkedin"],
        "github": links["github"],
        "summary": summary_text or None,
        "skills": skills,
        "education": education,
        "experience": experience_entries,
        "years_experience": years_experience,
        "certifications": certifications,
        "projects": projects,
        "languages": languages,
        "sections_detected": list(sections.keys()),
        "has_measurable_achievements": (
            has_measurable_achievements(sections.get("experience", ""))
            or has_measurable_achievements(sections.get("projects", ""))
        ),
        "word_count": len(text.split()),
    }
