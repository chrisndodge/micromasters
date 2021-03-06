/* global SETTINGS: false */
// @flow
import React from 'react';
import { shallow } from 'enzyme';
import moment from 'moment';
import { assert } from 'chai';
import Button from 'react-mdl/lib/Button';
import urljoin from 'url-join';

import CourseAction from './CourseAction';
import {
  DASHBOARD_FORMAT,
  STATUS_PASSED,
  STATUS_NOT_PASSED,
  STATUS_OFFERED_NOT_ENROLLED,
  STATUS_ENROLLED_NOT_VERIFIED,
  STATUS_VERIFIED_NOT_COMPLETED,
  STATUS_NOT_OFFERED,
} from '../../constants';
import { findCourse } from './CourseDescription_test';

describe('CourseAction', () => {
  const now = moment();

  it('shows a check mark for a passed course', () => {
    let course = findCourse(course => course.status === STATUS_PASSED);
    const wrapper = shallow(<CourseAction course={course} now={now}/>);
    assert.equal(wrapper.find(".material-icons").text(), 'done');
  });

  it('shows nothing for a failed course', () => {
    let course = findCourse(course => (
      course.status === STATUS_NOT_OFFERED &&
      course.runs[0].status === STATUS_NOT_PASSED
    ));
    const wrapper = shallow(<CourseAction course={course} now={now}/>);
    assert.equal(wrapper.text(), '');
  });

  it('shows nothing for a verified course', () => {
    let course = findCourse(course => course.status === STATUS_VERIFIED_NOT_COMPLETED);
    const wrapper = shallow(<CourseAction course={course} now={now}/>);
    assert.equal(wrapper.text(), '');
  });

  it('shows an upgrade button if user is not verified but is enrolled', () => {
    let course = findCourse(course => course.status === STATUS_ENROLLED_NOT_VERIFIED);
    const wrapper = shallow(<CourseAction course={course} now={now}/>);
    let buttonContainer = wrapper.find(".course-action-action");
    let description = wrapper.find(".course-action-description");
    let buttonProps = buttonContainer.find(Button).props();
    let firstRun = course.runs[0];
    let courseUpgradeUrl = urljoin(SETTINGS.edx_base_url, '/course_modes/choose/', firstRun.course_id);

    assert.equal(buttonContainer.find(Button).children().text(), "Upgrade");
    assert(!buttonProps.disabled);
    assert.equal(buttonProps.href, courseUpgradeUrl);
    assert.equal(buttonContainer.text(), `<Button /> in ${firstRun.title}`);
    assert.equal(description.text(), "");
  });

  it('shows a disabled enroll button if user is not enrolled and there is no enrollment date', () => {
    // there should also be text below the button
    let course = findCourse(course => (
      course.status === STATUS_OFFERED_NOT_ENROLLED &&
      course.runs[0].enrollment_start_date === undefined
    ));
    const wrapper = shallow(<CourseAction course={course} now={now}/>);
    let buttonContainer = wrapper.find(".course-action-action");
    let description = wrapper.find(".course-action-description");
    let buttonProps = buttonContainer.find(Button).props();
    let firstRun = course.runs[0];

    assert.equal(buttonContainer.find(Button).children().text(), "Enroll");
    assert(buttonProps.disabled);
    assert.equal(buttonProps.href, undefined);
    assert.equal(buttonContainer.text(), `<Button /> in ${firstRun.title}`);
    assert.equal(description.text(), `Enrollment begins ${firstRun.fuzzy_enrollment_start_date}`);
  });

  it('shows a disabled enroll button if user is not enrolled and enrollment starts in future', () => {
    // there should also be text below the button
    let course = findCourse(course => (
      course.status === STATUS_OFFERED_NOT_ENROLLED &&
      course.runs[0].enrollment_start_date !== undefined
    ));
    let firstRun = course.runs[0];
    let yesterday = moment(firstRun.enrollment_start_date).add(-1, 'days');
    const wrapper = shallow(<CourseAction course={course} now={yesterday}/>);
    let buttonContainer = wrapper.find(".course-action-action");
    let description = wrapper.find(".course-action-description");
    let buttonProps = buttonContainer.find(Button).props();

    assert.equal(buttonContainer.find(Button).children().text(), "Enroll");
    assert(buttonProps.disabled);
    assert.equal(buttonProps.href, undefined);
    assert.equal(buttonContainer.text(), `<Button /> in ${firstRun.title}`);
    let formattedDate = moment(firstRun.enrollment_start_date).format(DASHBOARD_FORMAT);
    assert.equal(description.text(), `Enrollment begins ${formattedDate}`);
  });

  it('shows an enroll button if user is not enrolled and enrollment starts today', () => {
    let course = findCourse(course => (
      course.status === STATUS_OFFERED_NOT_ENROLLED &&
      course.runs[0].enrollment_start_date !== undefined
    ));
    let firstRun = course.runs[0];
    let today = moment(firstRun.enrollment_start_date);
    const wrapper = shallow(<CourseAction course={course} now={today}/>);
    let buttonContainer = wrapper.find(".course-action-action");
    let description = wrapper.find(".course-action-description");
    let buttonProps = buttonContainer.find(Button).props();
    let url = urljoin(SETTINGS.edx_base_url, '/courses/', firstRun.course_id, 'about');

    assert.equal(buttonContainer.find(Button).children().text(), "Enroll");
    assert(!buttonProps.disabled);
    assert.equal(buttonProps.href, url);
    assert.equal(buttonContainer.text(), `<Button /> in ${firstRun.title}`);
    assert.equal(description.text(), ``);
  });

  it('shows an enroll button if user is not enrolled and enrollment started already', () => {
    let course = findCourse(course => (
      course.status === STATUS_OFFERED_NOT_ENROLLED &&
      course.runs[0].enrollment_start_date !== undefined
    ));
    let firstRun = course.runs[0];
    let tomorrow = moment(firstRun.enrollment_start_date).add(1, 'days');
    const wrapper = shallow(<CourseAction course={course} now={tomorrow}/>);
    let buttonContainer = wrapper.find(".course-action-action");
    let description = wrapper.find(".course-action-description");
    let buttonProps = buttonContainer.find(Button).props();
    let url = urljoin(SETTINGS.edx_base_url, '/courses/', firstRun.course_id, 'about');

    assert.equal(buttonContainer.find(Button).children().text(), "Enroll");
    assert(!buttonProps.disabled);
    assert.equal(buttonProps.href, url);
    assert.equal(buttonContainer.text(), `<Button /> in ${firstRun.title}`);
    assert.equal(description.text(), ``);
  });

  it('is not an offered course and user has not failed', () => {
    let course = findCourse(course => (
      course.status === STATUS_NOT_OFFERED &&
      course.runs.length === 0
    ));
    const wrapper = shallow(<CourseAction course={course} now={now}/>);
    let buttonContainer = wrapper.find(".course-action-action");
    let description = wrapper.find(".course-action-description");

    assert.equal(buttonContainer.text(), '');
    assert.equal(description.text(), '');
  });
});
