"""project URL Configuration"""
from django.conf.urls import include, url
from django.contrib import admin
from rest_framework import routers

from courses.api import ProgramViewSet, CourseViewSet

router = routers.DefaultRouter()
router.register(r'programs', ProgramViewSet)
router.register(r'courses', CourseViewSet)

urlpatterns = [
    url(r'', include('ui.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/v0/', include(router.urls)),
]