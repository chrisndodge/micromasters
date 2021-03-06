"""
Generates fake data
"""
from random import randint

from django.core.management import BaseCommand

from courses.factories import (
    CourseFactory,
    CourseRunFactory,
    ProgramFactory,
)


class Command(BaseCommand):
    """
    Generates fake data
    """
    help = "Generates fake data"

    def add_arguments(self, parser):
        parser.add_argument(
            '--programs',
            dest='programs',
            default=5,
            help='Number of programs to generate',
        )

        parser.add_argument(
            '--courses',
            dest='courses',
            default=3,
            help='Maximum number of courses to generate (per program)',
        )

        parser.add_argument(
            '--course-runs',
            dest='course_runs',
            default=3,
            help='Maximum number of course-runs to generate (per course)',
        )

    def handle(self, *args, **options):
        record_count = 0
        for _ in range(int(options['programs'])):
            program = ProgramFactory.create()
            record_count += 1
            courses_range = range(randint(1, int(options['courses'])))
            for _ in courses_range:
                record_count += 1
                course = CourseFactory.create(program=program)

                course_runs_range = range(randint(1, int(options['course_runs'])))
                for _ in course_runs_range:
                    record_count += 1
                    CourseRunFactory.create(course=course)

        self.stdout.write("Wrote {} records.".format(record_count))
