# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-30 15:43
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0006_fuzzy_date__remove_program_from_course'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='position_in_program',
            field=models.PositiveSmallIntegerField(null=True),
        ),
        migrations.AlterUniqueTogether(
            name='course',
            unique_together=set([('program', 'position_in_program')]),
        ),
    ]
