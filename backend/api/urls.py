from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, JobPostView, JobPostDetailView,
    PublicJobView, ApplyView, ApplicantListView,
    ApplicantDetailView, ExportApplicantsView, DashboardStatsView,
    DashboardStatsView, PasswordResetView

)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('password-reset/', PasswordResetView.as_view()),
    path('jobs/', JobPostView.as_view()),
    path('jobs/<int:job_id>/', JobPostDetailView.as_view()),
    path('jobs/<int:job_id>/applicants/', ApplicantListView.as_view()),
    path('jobs/<int:job_id>/export/', ExportApplicantsView.as_view()),
    path('applicants/<int:applicant_id>/', ApplicantDetailView.as_view()),
    path('apply/<uuid:public_id>/', PublicJobView.as_view()),
    path('apply/<uuid:public_id>/submit/', ApplyView.as_view()),
    path('stats/', DashboardStatsView.as_view()),
]