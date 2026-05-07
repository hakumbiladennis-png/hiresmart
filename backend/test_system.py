import os
import sys
import csv
import time

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from api.nlp_utils import calculate_similarity

class MockJob:
    def __init__(self, title, description, required_skills, required_experience_years):
        self.title = title
        self.description = description
        self.required_skills = required_skills
        self.required_experience_years = required_experience_years

TEST_JOBS = {
    'INFORMATION-TECHNOLOGY': MockJob(
        title='Software Developer',
        description='Experienced software developer with programming skills in web applications and databases.',
        required_skills='Python,Java,JavaScript,SQL,database,software development,programming,web development,API',
        required_experience_years=2,
    ),
    'HEALTHCARE': MockJob(
        title='Healthcare Professional',
        description='Qualified healthcare professional with experience in patient care and clinical procedures.',
        required_skills='patient care,clinical,medical,diagnosis,treatment,healthcare,nursing,hospital',
        required_experience_years=2,
    ),
    'ACCOUNTANT': MockJob(
        title='Accountant',
        description='Experienced accountant with knowledge of financial reporting, tax preparation and auditing.',
        required_skills='accounting,finance,audit,tax,financial reporting,budgeting,Excel,QuickBooks',
        required_experience_years=2,
    ),
    'ENGINEERING': MockJob(
        title='Engineer',
        description='Skilled engineer with experience in engineering design, project management and technical analysis.',
        required_skills='engineering,design,project management,CAD,technical,analysis,problem solving',
        required_experience_years=2,
    ),
    'TEACHER': MockJob(
        title='Teacher',
        description='Experienced teacher with classroom management skills and curriculum development experience.',
        required_skills='teaching,education,curriculum,classroom,lesson planning,assessment,students',
        required_experience_years=1,
    ),
}

def load_resumes(csv_path, category, limit=15):
    resumes = []
    with open(csv_path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['Category'] == category:
                resumes.append(row['Resume_str'])
                if len(resumes) >= limit:
                    break
    return resumes

def load_non_matching(csv_path, exclude_category, limit=15):
    resumes = []
    with open(csv_path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['Category'] != exclude_category:
                resumes.append(row['Resume_str'])
                if len(resumes) >= limit:
                    break
    return resumes

def evaluate(category, job, csv_path):
    print('\n' + '='*60)
    print('Testing: ' + job.title + ' (Category: ' + category + ')')
    print('='*60)

    matching = load_resumes(csv_path, category, limit=15)
    non_matching = load_non_matching(csv_path, category, limit=15)

    print('Loaded ' + str(len(matching)) + ' matching and ' + str(len(non_matching)) + ' non-matching resumes')

    results = []
    start = time.time()

    for i, text in enumerate(matching):
        result = calculate_similarity(job, text)
        results.append({'name': 'Candidate_' + str(i+1), 'score': result['score'], 'is_match': True, 'skills': result['matched_skills']})

    for i, text in enumerate(non_matching):
        result = calculate_similarity(job, text)
        results.append({'name': 'NonMatch_' + str(i+1), 'score': result['score'], 'is_match': False, 'skills': result['matched_skills']})

    elapsed = time.time() - start
    avg_time = elapsed / len(results)

    results.sort(key=lambda x: x['score'], reverse=True)

    top15 = results[:15]
    correct = sum(1 for r in top15 if r['is_match'])
    accuracy = (correct / 15) * 100

    match_scores = [r['score'] for r in results if r['is_match']]
    non_scores = [r['score'] for r in results if not r['is_match']]
    avg_match = sum(match_scores) / len(match_scores) if match_scores else 0
    avg_non = sum(non_scores) / len(non_scores) if non_scores else 0

    print('\nRESULTS:')
    print('  Correct in Top 15: ' + str(correct) + '/15')
    print('  Accuracy: ' + str(round(accuracy, 1)) + '%')
    print('  Avg score - matching resumes:     ' + str(round(avg_match*100, 1)) + '%')
    print('  Avg score - non-matching resumes: ' + str(round(avg_non*100, 1)) + '%')
    print('  Total time: ' + str(round(elapsed, 2)) + ' seconds')
    print('  Avg time per resume: ' + str(round(avg_time, 3)) + ' seconds')

    print('\nTOP 10 RANKED:')
    for i, r in enumerate(results[:10]):
        tag = 'MATCH' if r['is_match'] else 'NON-MATCH'
        print('  #' + str(i+1) + ' ' + r['name'] + ' | Score: ' + str(round(r['score']*100, 1)) + '% | ' + tag)

    return {
        'category': category,
        'title': job.title,
        'accuracy': accuracy,
        'correct': correct,
        'avg_match': avg_match * 100,
        'avg_non': avg_non * 100,
        'avg_time': avg_time,
    }

def main():
    csv_path = input('\nEnter the full path to your Resume.csv file\nExample: C:\\Users\\HP\\Desktop\\Resume.csv\n\nPath: ').strip()

    if not os.path.exists(csv_path):
        print('ERROR: File not found at ' + csv_path)
        print('Please check the path and try again.')
        return

    print('\nFile found! Starting HireSmart evaluation...')

    all_results = []
    for category, job in TEST_JOBS.items():
        result = evaluate(category, job, csv_path)
        all_results.append(result)

    print('\n' + '='*60)
    print('HIRESMART SYSTEM EVALUATION SUMMARY')
    print('='*60)

    total_accuracy = sum(r['accuracy'] for r in all_results) / len(all_results)
    total_avg_time = sum(r['avg_time'] for r in all_results) / len(all_results)

    print('\n{:<30} {:<15} {:<15} {}'.format('Job Title', 'Accuracy', 'Match Score', 'Non-Match Score'))
    print('-' * 75)
    for r in all_results:
        print('{:<30} {:<15} {:<15} {}'.format(
            r['title'],
            str(round(r['accuracy'], 1)) + '%',
            str(round(r['avg_match'], 1)) + '%',
            str(round(r['avg_non'], 1)) + '%'
        ))

    print('\n' + '='*60)
    print('OVERALL SYSTEM ACCURACY:         ' + str(round(total_accuracy, 1)) + '%')
    print('AVERAGE TIME PER RESUME:         ' + str(round(total_avg_time, 3)) + ' seconds')
    print('TARGET ACCURACY (from proposal): 80%')
    if total_accuracy >= 80:
        print('TARGET MET: YES')
    else:
        print('TARGET MET: NO - needs improvement')
    print('='*60)
    print('\nEvaluation complete! Save these results for your final report.')

if __name__ == '__main__':
    main()