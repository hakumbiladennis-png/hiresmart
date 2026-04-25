from rest_framework import serializers
from django.contrib.auth.models import User
from .models import JobPost, Applicant

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class JobPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPost
        fields = ['id', 'title', 'description', 'required_skills', 
                  'required_experience_years', 'location', 'deadline', 
                  'status', 'public_id', 'created_at']

class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = ['id', 'full_name', 'email', 'phone', 'location',
                  'education_level', 'years_of_experience', 'current_job_title',
                  'cover_letter', 'cv_file', 'similarity_score', 
                  'matched_skills', 'status', 'applied_at']