/* global SETTINGS: false */
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';
import {
    REQUEST_COURSE_LIST,
    CLEAR_COURSE_LIST,
    FETCH_FAILURE,
    FETCH_PROCESSING,
    FETCH_SUCCESS,
} from '../actions/index';

// Helper function to avoid a commonly repeated pattern where we merge
// state with something computed solely from the actions. Accepts a
// function that will get the action, and should return the value to
// be merged with the existing state.
function payloadMerge(fn) {
  return (state, action) => {
    return Object.assign({}, state, fn(action));
  };
}

const INITIAL_COURSE_LIST_STATE = {
  courseList: []
};

export const courseList = handleActions({
  REQUEST_COURSE_LIST: payloadMerge((action) => ({
    courseListStatus: FETCH_PROCESSING
  })),

  RECEIVE_COURSE_LIST_SUCCESS: payloadMerge((action) => ({
    courseListStatus: FETCH_SUCCESS,
    courseList: action.payload.courseList
  })),

  RECEIVE_COURSE_LIST_FAILURE: payloadMerge((action) => ({
    courseListStatus: FETCH_FAILURE
  })),

  CLEAR_COURSE_LIST: payloadMerge((action) => ({
    courseListStatus: undefined,
    courseList: []
  }))

}, INITIAL_COURSE_LIST_STATE);

const INITIAL_AUTHENTICATION_STATE = {
  isAuthenticated: SETTINGS.isAuthenticated,
  name: SETTINGS.name,
};

export const authentication = handleActions({
  // nothing here yet
}, INITIAL_AUTHENTICATION_STATE);

export default combineReducers({
  courseList,
  authentication,
});