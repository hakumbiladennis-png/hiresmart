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
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    doc = nlp(text.lower())
    tokens = [token.lemma_ for token in doc
              if not token.is_stop and not token.is_punct
              and token.is_alpha and len(token) > 2]
    return ' '.join(tokens)

def extract_matched_skills(cv_text, required_skills_str):
    required_skills = [s.strip().lower() for s in required_skills_str.split(',')]
    cv_lower = cv_text.lower()
    matched = []
    for skill in required_skills:
        skill_words = skill.split()
        if len(skill_words) == 1:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, cv_lower):
                matched.append(skill)
        else:
            if skill in cv_lower:
                matched.append(skill)
            elif all(word in cv_lower for word in skill_words):
                matched.append(skill)
    return matched, required_skills

def extract_years_of_experience(cv_text):
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*years?\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*yrs?\s*of\s*experience',
        r'(\d+)\+?\s*yrs?\s*experience',
        r'over\s*(\d+)\s*years?',
        r'more\s*than\s*(\d+)\s*years?',
    ]
    max_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, cv_text.lower())
        for match in matches:
            years = int(match)
            if years > max_years and years < 50:
                max_years = years
    return max_years

def calculate_keyword_boost(cv_text, required_skills_str):
    cv_lower = cv_text.lower()
    skills = [s.strip().lower() for s in required_skills_str.split(',')]
    boost = 0.0
    for skill in skills:
        count = len(re.findall(r'\b' + re.escape(skill) + r'\b', cv_lower))
        if count >= 3:
            boost += 0.05
        elif count >= 2:
            boost += 0.03
        elif count >= 1:
            boost += 0.01
    return min(boost, 0.3)

def calculate_similarity(job, cv_text):
    job_text = f"{job.title} {job.description} {job.required_skills} {job.required_skills}"
    processed_job = preprocess_text(job_text)
    processed_cv = preprocess_text(cv_text)

    if not processed_job or not processed_cv:
        return {
            'score': 0.0,
            'matched_skills': [],
            'total_skills': [],
            'skill_score': 0.0,
            'experience_score': 0.0,
            'cv_experience_years': 0,
        }

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=10000,
        sublinear_tf=True,
    )
    try:
        vectors = vectorizer.fit_transform([processed_job, processed_cv])
        text_score = cosine_similarity(vectors[0], vectors[1])[0][0]
    except:
        text_score = 0.0

    matched_skills, required_skills = extract_matched_skills(cv_text, job.required_skills)
    skill_score = len(matched_skills) / len(required_skills) if required_skills else 0

    cv_experience = extract_years_of_experience(cv_text)
    if job.required_experience_years > 0:
        if cv_experience >= job.required_experience_years:
            exp_score = 1.0
        elif cv_experience > 0:
            exp_score = min(cv_experience / job.required_experience_years, 1.0)
        else:
            exp_score = 0.2
    else:
        exp_score = 1.0

    keyword_boost = calculate_keyword_boost(cv_text, job.required_skills)

    final_score = (text_score * 0.35) + (skill_score * 0.40) + (exp_score * 0.15) + (keyword_boost * 0.10)
    final_score = min(final_score, 1.0)

    return {
        'score': round(float(final_score), 4),
        'matched_skills': matched_skills,
        'total_skills': required_skills,
        'skill_score': round(skill_score * 100, 1),
        'experience_score': round(exp_score * 100, 1),
        'cv_experience_years': cv_experience,
    }
BIASED_TERMS = {
    'gender': [
        'male', 'female', 'man', 'woman', 'he', 'she', 'his', 'her',
        'manpower', 'mankind', 'stewardess', 'policeman', 'fireman',
        'salesman', 'chairman', 'spokesman', 'businessman',
    ],
    'age': [
        'young', 'youthful', 'energetic', 'recent graduate', 'fresh graduate',
        'junior only', 'below 30', 'below 25', 'below 35', 'age limit',
        'digital native', 'mature', 'older',
    ],
    'appearance': [
        'attractive', 'good looking', 'well groomed', 'presentable',
        'physically fit', 'slim', 'tall', 'beautiful', 'handsome',
    ],
    'marital_status': [
        'single', 'married', 'unmarried', 'bachelor', 'family status',
    ],
    'nationality': [
        'local only', 'citizens only', 'nationals only', 'no foreigners',
        'zambian only', 'born in',
    ],
}

def detect_bias(text):
    text_lower = text.lower()
    detected = []

    for category, terms in BIASED_TERMS.items():
        found_terms = []
        for term in terms:
            pattern = r'\b' + re.escape(term) + r'\b'
            if re.search(pattern, text_lower):
                found_terms.append(term)
        if found_terms:
            detected.append({
                'category': category,
                'terms': found_terms,
            })

    return detected
