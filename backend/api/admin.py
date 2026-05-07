from django.contrib import admin
from .models import JobPost, Applicant

@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'recruiter', 'location', 'deadline', 'status', 'created_at']
    list_filter = ['status', 'deadline']
    search_fields = ['title', 'description', 'required_skills']
    readonly_fields = ['public_id', 'created_at']
    ordering = ['-created_at']

@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'job', 'similarity_score', 'status', 'applied_at']
    list_filter = ['status', 'job']
    search_fields = ['full_name', 'email', 'job__title']
    readonly_fields = ['similarity_score', 'matched_skills', 'extracted_text', 'applied_at']
    ordering = ['-similarity_score']
