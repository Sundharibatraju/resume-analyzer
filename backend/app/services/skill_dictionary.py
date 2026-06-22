"""
Custom skill dictionary used for resume and job-description skill extraction.
Organized by category. Used for fast, deterministic phrase matching
(via spaCy's PhraseMatcher) instead of relying purely on generic NER,
which is unreliable for domain-specific skill names.
"""

SKILL_CATEGORIES = {
    "programming_languages": [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "C", "Go", "Golang",
        "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl",
        "Dart", "Objective-C", "Shell Scripting", "Bash", "PowerShell",
    ],
    "web_frontend": [
        "React", "React.js", "Vue", "Vue.js", "Angular", "Next.js", "Nuxt.js",
        "HTML", "HTML5", "CSS", "CSS3", "Sass", "SCSS", "Tailwind CSS", "Bootstrap",
        "jQuery", "Redux", "Webpack", "Vite", "Svelte", "Three.js", "Framer Motion",
        "Material UI", "Chakra UI",
    ],
    "web_backend": [
        "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "Spring",
        "Laravel", "Ruby on Rails", "ASP.NET", ".NET", "GraphQL", "REST API",
        "RESTful APIs", "gRPC", "Microservices", "WebSockets",
    ],
    "databases": [
        "SQL", "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis", "Oracle",
        "Microsoft SQL Server", "Cassandra", "DynamoDB", "Firebase", "Elasticsearch",
        "Neo4j", "MariaDB", "CouchDB",
    ],
    "cloud_devops": [
        "AWS", "Amazon Web Services", "Azure", "Google Cloud Platform", "GCP",
        "Docker", "Kubernetes", "Jenkins", "CI/CD", "Terraform", "Ansible",
        "GitHub Actions", "GitLab CI", "Cloud Computing", "Serverless",
        "Lambda", "EC2", "S3", "Heroku", "Nginx", "Linux", "Unix",
    ],
    "data_ml": [
        "Machine Learning", "Deep Learning", "Natural Language Processing", "NLP",
        "Computer Vision", "TensorFlow", "PyTorch", "Keras", "Scikit-learn",
        "Pandas", "NumPy", "Data Analysis", "Data Science", "Data Visualization",
        "Matplotlib", "Seaborn", "Power BI", "Tableau", "Big Data", "Spark",
        "Hadoop", "ETL", "Statistics", "Neural Networks", "OpenCV", "spaCy",
        "Artificial Intelligence", "AI", "Predictive Modeling", "A/B Testing",
    ],
    "mobile": [
        "Android", "iOS", "React Native", "Flutter", "SwiftUI", "Xamarin",
        "Mobile App Development",
    ],
    "tools_other": [
        "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Postman",
        "Figma", "Adobe XD", "Agile", "Scrum", "Kanban", "Unit Testing",
        "Test Driven Development", "TDD", "Selenium", "Jest", "Cypress",
        "Project Management", "Excel", "Microsoft Office", "VS Code",
        "Linux Administration", "Networking", "Cybersecurity", "Blockchain",
        "Solidity", "Web3",
    ],
    "soft_skills": [
        "Communication", "Leadership", "Teamwork", "Problem Solving",
        "Critical Thinking", "Time Management", "Collaboration",
        "Adaptability", "Attention to Detail", "Creativity",
        "Decision Making", "Public Speaking", "Negotiation", "Mentoring",
        "Stakeholder Management", "Cross-functional Collaboration",
    ],
    "business_marketing": [
        "Digital Marketing", "SEO", "SEM", "Content Marketing", "Social Media Marketing",
        "Google Analytics", "Email Marketing", "CRM", "Salesforce", "HubSpot",
        "Market Research", "Brand Management", "Product Management",
        "Business Analysis", "Financial Analysis", "Budgeting", "Forecasting",
    ],
}

# Flattened lookup: lowercase skill -> canonical display name
ALL_SKILLS_FLAT = {}
for _category, _skills in SKILL_CATEGORIES.items():
    for _skill in _skills:
        ALL_SKILLS_FLAT[_skill.lower()] = _skill


def get_all_skills() -> list:
    """Returns the canonical (display-cased) list of all known skills."""
    return list(ALL_SKILLS_FLAT.values())


def get_category_for_skill(skill: str) -> str:
    skill_lower = skill.lower()
    for category, skills in SKILL_CATEGORIES.items():
        if skill_lower in [s.lower() for s in skills]:
            return category
    return "other"
