import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import sinon from 'sinon';
import assert from 'assert';
import _ from 'lodash';

import CourseList from './CourseList';
import * as util from '../util/util';
import { STATUS_PASSED, DASHBOARD_RESPONSE } from '../constants';

describe("CourseList", () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders apply for master button and text', () => {
    let renderedComponent = TestUtils.renderIntoDocument(
      <CourseList dashboard={{programs: DASHBOARD_RESPONSE}} expander={{}} dispatch={() => {}}/>
    );
    let programBottomDivComponent = TestUtils.scryRenderedDOMComponentsWithClass(
      renderedComponent,
      'apply-for-ms'
    );
    assert(programBottomDivComponent.length > 0);

    let programCount = 0;
    for (let program of DASHBOARD_RESPONSE) {
      let totalCourses = program.courses.length;
      let coursesPassed = 0;
      for (let course of program.courses) {
        if (course.status === STATUS_PASSED) {
          coursesPassed++;
        }
      }

      // Tests for program's `apply for master` bottom UI.
      let coursesNeedToPass = totalCourses - coursesPassed;
      let programBottomText = `You need to pass ${coursesNeedToPass} more courses before you can apply for ${program.title} Master's Degree.`; // eslint-disable-line max-len
      let programBottomButtonText = `Apply for ${program.title} Master Degree`;

      let div = ReactDOM.findDOMNode(programBottomDivComponent[programCount]);
      let renderedProgramBottomMessage = div.querySelectorAll("p");
      let renderedProgramBottomButton = div.querySelectorAll("button");

      assert(renderedProgramBottomButton.length > 0);
      assert(renderedProgramBottomMessage[0].textContent === programBottomText);
      assert(renderedProgramBottomButton[0].textContent === programBottomButtonText);

      programCount++;
    }
  });

  it('renders courses using util functions', () => {
    let makeCourseProgressDisplaySpy = sandbox.spy(util, 'makeCourseProgressDisplay');
    let makeCourseStatusDisplaySpy = sandbox.spy(util, 'makeCourseStatusDisplay');

    TestUtils.renderIntoDocument(
      <CourseList dashboard={{programs: DASHBOARD_RESPONSE}} expander={{}} dispatch={() => {}} />
    );

    let callCount = 0;
    for (let program of DASHBOARD_RESPONSE) {
      let sortedCourses = _.sortBy(program.courses, 'position_in_program');
      let courseCount = 0;
      for (let course of sortedCourses) {
        let progressDisplayCall = makeCourseProgressDisplaySpy.getCall(callCount);
        let statusDisplayCall = makeCourseStatusDisplaySpy.getCall(callCount);
        callCount++;

        assert.deepEqual(course, progressDisplayCall.args[0]);
        assert.deepEqual(course, statusDisplayCall.args[0]);

        let isTop = courseCount === 0;
        let isBottom = courseCount === sortedCourses.length - 1;
        assert.equal(isTop, progressDisplayCall.args[1]);
        assert.equal(isBottom, progressDisplayCall.args[2]);

        courseCount++;
      }
    }
  });
});
