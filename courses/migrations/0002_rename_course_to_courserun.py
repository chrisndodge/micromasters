# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-31 13:45
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Course',
            new_name='CourseRun',
        ),
        migrations.RunSQL(
            "ALTER INDEX IF EXISTS courses_course_pkey RENAME TO courses_courserun_pkey",
            reverse_sql="ALTER INDEX IF EXISTS courses_courserun_pkey RENAME TO courses_course_pkey"),
        migrations.RunSQL(
            "ALTER INDEX IF EXISTS courses_course_429b1823 RENAME TO courses_courserun_429b1823",
            reverse_sql="ALTER INDEX IF EXISTS courses_courserun_429b1823 RENAME TO courses_course_429b1823",
        ),
    ]