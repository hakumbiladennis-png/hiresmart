from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.utils import timezone
from .serializers import RegisterSerializer
from .models import JobPost, Applicant
from .nlp_utils import extract_text_from_file, calculate_similarity, detect_bias
import csv
from django.http import HttpResponse

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created successfully'}, status=201)
        return Response(serializer.errors, status=400)

class JobPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        job_text = f"{data.get('title', '')} {data.get('description', '')} {data.get('required_skills', '')}"
        bias_warnings = detect_bias(job_text)

        job = JobPost.objects.create(
            recruiter=request.user,
            title=data.get('title'),
            description=data.get('description'),
            required_skills=data.get('required_skills'),
            required_experience_years=data.get('required_experience_years', 0),
            location=data.get('location', ''),
            deadline=data.get('deadline'),
        )

        response_data = {
            'id': job.id,
            'public_id': str(job.public_id),
            'message': 'Job created successfully',
        }

        if bias_warnings:
            response_data['bias_warnings'] = bias_warnings
            response_data['bias_detected'] = True
        else:
            response_data['bias_detected'] = False

        return Response(response_data, status=201)

    def get(self, request):
        jobs = JobPost.objects.filter(recruiter=request.user).order_by('-created_at')
        data = []
        for j in jobs:
            applicant_count = j.applicants.count()
            data.append({
                'id': j.id,
                'title': j.title,
                'location': j.location,
                'deadline': j.deadline,
                'status': j.status,
                'public_id': str(j.public_id),
                'applicant_count': applicant_count,
            })
        return Response(data)

class JobPostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = JobPost.objects.get(id=job_id, recruiter=request.user)
            return Response({
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'required_skills': job.required_skills,
                'required_experience_years': job.required_experience_years,
                'location': job.location,
                'deadline': str(job.deadline),
                'status': job.status,
                'public_id': str(job.public_id),
            })
        except JobPost.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

    def patch(self, request, job_id):
        try:
            job = JobPost.objects.get(id=job_id, recruiter=request.user)
            job.status = request.data.get('status', job.status)
            job.save()
            return Response({'message': 'Job updated successfully'})
        except JobPost.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

class PublicJobView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, public_id):
        try:
            job = JobPost.objects.get(public_id=public_id)
            if job.status == 'closed':
                return Response({'error': 'This job is no longer accepting applications'}, status=400)
            today = timezone.now().date()
            if job.deadline < today:
                job.status = 'closed'
                job.save()
                return Response({'error': 'Application deadline has passed'}, status=400)
            return Response({
                'id': job.id,
                'title': job.title,
                'description': job.description,
                'location': job.location,
                'deadline': str(job.deadline),
                'required_skills': job.required_skills,
                'required_experience_years': job.required_experience_years,
            })
        except JobPost.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

class ApplyView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, public_id):
        try:
            job = JobPost.objects.get(public_id=public_id)

            if job.status == 'closed':
                return Response({'error': 'This job is no longer accepting applications'}, status=400)

            today = timezone.now().date()
            if job.deadline < today:
                job.status = 'closed'
                job.save()
                return Response({'error': 'Application deadline has passed'}, status=400)

            email = request.data.get('email')
            if Applicant.objects.filter(job=job, email=email).exists():
                return Response({'error': 'You have already applied for this job'}, status=400)

            cv_file = request.FILES.get('cv_file')
            if not cv_file:
                return Response({'error': 'Please upload your CV'}, status=400)

            extracted_text = extract_text_from_file(cv_file)
            cv_file.seek(0)

            result = calculate_similarity(job, extracted_text)

            applicant = Applicant.objects.create(
                job=job,
                full_name=request.data.get('full_name'),
                email=email,
                phone=request.data.get('phone'),
                location=request.data.get('location'),
                education_level=request.data.get('education_level'),
                years_of_experience=request.data.get('years_of_experience', 0),
                current_job_title=request.data.get('current_job_title', ''),
                cover_letter=request.data.get('cover_letter', ''),
                cv_file=cv_file,
                extracted_text=extracted_text,
                similarity_score=result['score'],
                matched_skills=','.join(result['matched_skills']),
            )

            return Response({'message': 'Application submitted successfully! Good luck!'}, status=201)

        except JobPost.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

class ApplicantListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = JobPost.objects.get(id=job_id, recruiter=request.user)
            applicants = job.applicants.order_by('-similarity_score')
            data = []
            for i, a in enumerate(applicants):
                matched = a.matched_skills.split(',') if a.matched_skills else []
                total_skills = job.required_skills.split(',')
                data.append({
                    'id': a.id,
                    'rank': i + 1,
                    'full_name': a.full_name,
                    'email': a.email,
                    'phone': a.phone,
                    'location': a.location,
                    'education_level': a.education_level,
                    'years_of_experience': a.years_of_experience,
                    'current_job_title': a.current_job_title,
                    'score': round(a.similarity_score * 100, 1),
                    'matched_skills': matched,
                    'total_skills': len(total_skills),
                    'status': a.status,
                    'applied_at': str(a.applied_at),
                })
            return Response({'job_title': job.title, 'applicants': data})
        except JobPost.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)

class ApplicantDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, applicant_id):
        try:
            applicant = Applicant.objects.get(id=applicant_id, job__recruiter=request.user)
            matched = applicant.matched_skills.split(',') if applicant.matched_skills else []
            return Response({
                'full_name': applicant.full_name,
                'email': applicant.email,
                'phone': applicant.phone,
                'location': applicant.location,
                'education_level': applicant.education_level,
                'years_of_experience': applicant.years_of_experience,
                'current_job_title': applicant.current_job_title,
                'cover_letter': applicant.cover_letter,
                'score': round(applicant.similarity_score * 100, 1),
                'matched_skills': matched,
                'status': applicant.status,
                'applied_at': str(applicant.applied_at),
            })
        except Applicant.DoesNotExist:
            return Response({'error': 'Applicant not found'}, status=404)

    def patch(self, request, applicant_id):
        try:
            applicant = Applicant.objects.get(id=applicant_id, job__recruiter=request.user)
            applicant.status = request.data.get('status', applicant.status)
            applicant.save()
            return Response({'message': 'Applicant status updated'})
        except Applicant.DoesNotExist:
            return Response({'error': 'Applicant not found'}, status=404)

class ExportApplicantsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = JobPost.objects.get(id=job_id, recruiter=request.user)
            applicants = job.applicants.order_by('-similarity_score')

            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{job.title}_applicants.csv"'

            writer = csv.writer(response)
            writer.writerow(['Rank', 'Name', 'Email', 'Phone', 'Location', 'Education',
                           'Experience (Years)', 'Current Title', 'Match Score (%)',
                           'Matched Skills', 'Status', 'Applied At'])

            for i, a in enumerate(applicants):
                writer.writerow([
                    i + 1, a.full_name, a.email, a.phone,
                    a.location, a.education_level, a.years_of_experience,
                    a.current_job_title, round(a.similarity_score * 100, 1),
                    a.matched_skills, a.status, a.applied_at
                ])

            return response
        except JobPost.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)