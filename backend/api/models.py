from django.db import models
from django.contrib.auth.models import User
import uuid

class JobPost(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField()
    required_skills = models.TextField(help_text="Comma separated skills e.g. Python, Django, PostgreSQL")
    required_experience_years = models.IntegerField(default=0)
    location = models.CharField(max_length=200, blank=True)
    deadline = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Applicant(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
    ]
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name='applicants')
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=200)
    education_level = models.CharField(max_length=200)
    years_of_experience = models.IntegerField(default=0)
    current_job_title = models.CharField(max_length=200, blank=True)
    cover_letter = models.TextField(blank=True)
    cv_file = models.FileField(upload_to='cvs/')
    extracted_text = models.TextField(blank=True)
    similarity_score = models.FloatField(default=0.0)
    matched_skills = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['job', 'email']

    def __str__(self):
        return f"{self.full_name} - {self.job.title}"
