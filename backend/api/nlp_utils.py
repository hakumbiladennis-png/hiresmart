import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pypdf
import docx
import re

nlp = spacy.load('en_core_web_sm')

def extract_text_from_file(file):
    name = file.name.lower()
    if name.endswith('.pdf'):
        reader = pypdf.PdfReader(file)
        return ' '.join(page.extract_text() or '' for page in reader.pages)
    elif name.endswith('.docx'):
        doc = docx.Document(file)
        return ' '.join(para.text for para in doc.paragraphs)
    return ''

def preprocess_text(text):
    doc = nlp(text.lower())
    tokens = [token.lemma_ for token in doc
              if not token.is_stop and not token.is_punct and token.is_alpha]
    return ' '.join(tokens)

def extract_matched_skills(cv_text, required_skills_str):
    required_skills = [s.strip().lower() for s in required_skills_str.split(',')]
    cv_lower = cv_text.lower()
    matched = [skill for skill in required_skills if skill in cv_lower]
    return matched, required_skills

def extract_years_of_experience(cv_text):
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*years?\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
    ]
    for pattern in patterns:
        match = re.search(pattern, cv_text.lower())
        if match:
            return int(match.group(1))
    return 0

def calculate_similarity(job, cv_text):
    job_text = f"{job.description} {job.required_skills}"
    processed_job = preprocess_text(job_text)
    processed_cv = preprocess_text(cv_text)

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([processed_job, processed_cv])
    text_score = cosine_similarity(vectors[0], vectors[1])[0][0]

    matched_skills, required_skills = extract_matched_skills(cv_text, job.required_skills)
    skill_score = len(matched_skills) / len(required_skills) if required_skills else 0

    cv_experience = extract_years_of_experience(cv_text)
    if job.required_experience_years > 0:
        exp_score = min(cv_experience / job.required_experience_years, 1.0)
    else:
        exp_score = 1.0

    final_score = (text_score * 0.4) + (skill_score * 0.4) + (exp_score * 0.2)

    return {
        'score': round(float(final_score), 4),
        'matched_skills': matched_skills,
        'total_skills': required_skills,
        'skill_score': round(skill_score * 100, 1),
        'experience_score': round(exp_score * 100, 1),
        'cv_experience_years': cv_experience,
    }