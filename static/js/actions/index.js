import _ from 'lodash';

import * as api from '../util/api';
import * as util from '../util/util';

// user profile actions
export const REQUEST_GET_USER_PROFILE = 'REQUEST_GET_USER_PROFILE';
export const RECEIVE_GET_USER_PROFILE_SUCCESS = 'RECEIVE_GET_USER_PROFILE_SUCCESS';
export const RECEIVE_GET_USER_PROFILE_FAILURE = 'RECEIVE_GET_USER_PROFILE_FAILURE';
export const CLEAR_PROFILE = 'CLEAR_PROFILE';
export const UPDATE_PROFILE = 'UPDATE_PROFILE';
export const START_PROFILE_EDIT = 'START_PROFILE_EDIT';
export const CLEAR_PROFILE_EDIT = 'CLEAR_PROFILE_EDIT';
export const REQUEST_PATCH_USER_PROFILE = 'REQUEST_PATCH_USER_PROFILE';
export const RECEIVE_PATCH_USER_PROFILE_SUCCESS = 'RECEIVE_PATCH_USER_PROFILE_SUCCESS';
export const RECEIVE_PATCH_USER_PROFILE_FAILURE = 'RECEIVE_PATCH_USER_PROFILE_FAILURE';
export const UPDATE_PROFILE_VALIDATION = 'UPDATE_PROFILE_VALIDATION';

// ui actions
export const CLEAR_UI = 'CLEAR_UI';
export const UPDATE_DIALOG_TEXT = 'UPDATE_DIALOG_TEXT';
export const UPDATE_DIALOG_TITLE = 'UPDATE_DIALOG_TITLE';
export const SET_DIALOG_VISIBILITY = 'SET_DIALOG_VISIBILITY';

export const SHOW_EDUCATION_FORM_DIALOG = 'SHOW_EDUCATION_FORM_DIALOG';
export const HIDE_EDUCATION_FORM_DIALOG = 'HIDE_EDUCATION_FORM_DIALOG';
export const TOGGLE_EDUCATION_LEVEL = 'TOGGLE_EDUCATION_LEVEL';

// constants for fetch status (these are not action types)
export const FETCH_FAILURE = 'FETCH_FAILURE';
export const FETCH_SUCCESS = 'FETCH_SUCCESS';
export const FETCH_PROCESSING = 'FETCH_PROCESSING';

// general UI actions
export const clearUI = () => ({ type: CLEAR_UI });
export const updateDialogText = text => (
  { type: UPDATE_DIALOG_TEXT, payload: text }
);

export const updateDialogTitle = title => (
  { type: UPDATE_DIALOG_TITLE, payload: title }
);

export const setDialogVisibility = bool => (
  { type: SET_DIALOG_VISIBILITY, payload: bool }
);

// actions for user profile
const requestGetUserProfile = () => ({ type: REQUEST_GET_USER_PROFILE });

export const receiveGetUserProfileSuccess = profile =>({
  type: RECEIVE_GET_USER_PROFILE_SUCCESS,
  payload: { profile }
});

const receiveGetUserProfileFailure = () => ({ type: RECEIVE_GET_USER_PROFILE_FAILURE });

export const clearProfile = () => ({ type: CLEAR_PROFILE });

export const updateProfile = profile => ({
  type: UPDATE_PROFILE,
  payload: { profile }
});
export const openEducationForm = (level, index) => ({
  type: SHOW_EDUCATION_FORM_DIALOG,
  payload: { level, index }
});
export const closeEducationForm = () => ({type: HIDE_EDUCATION_FORM_DIALOG});

export const startProfileEdit = () => ({ type: START_PROFILE_EDIT });
export const clearProfileEdit = () => ({ type: CLEAR_PROFILE_EDIT });

export const toggleEducationLevel = educationLevels => ({
  type: TOGGLE_EDUCATION_LEVEL,
  payload: { educationLevels }
});

const requestPatchUserProfile = () => ({ type: REQUEST_PATCH_USER_PROFILE });

const receivePatchUserProfileSuccess = profile => ({
  type: RECEIVE_PATCH_USER_PROFILE_SUCCESS,
  payload: { profile }
});

const receivePatchUserProfileFailure = () => ({ type: RECEIVE_PATCH_USER_PROFILE_FAILURE });

export const saveProfile = (username, profile) => {
  return dispatch => {
    dispatch(requestPatchUserProfile());
    return api.patchUserProfile(username, profile).
      then(newProfile => dispatch(receivePatchUserProfileSuccess(newProfile))).
      catch(() => dispatch(receivePatchUserProfileFailure()));
  };
};
export const updateProfileValidation = errors => ({
  type: UPDATE_PROFILE_VALIDATION,
  payload: { errors }
});

export const validateProfile = (profile, requiredFields, messages) => {
  return dispatch => {
    let errors = util.validateProfile(profile, requiredFields, messages);
    dispatch(updateProfileValidation(errors));
    if (_.isEmpty(errors)) {
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  };
};

export function fetchUserProfile(username) {
  return dispatch => {
    dispatch(requestGetUserProfile());
    return api.getUserProfile(username).
      then(json => dispatch(receiveGetUserProfileSuccess(json))).
      catch(()=> dispatch(receiveGetUserProfileFailure()));
  };
}

// dashboard list actions
export const REQUEST_DASHBOARD = 'REQUEST_DASHBOARD';
export const RECEIVE_DASHBOARD_SUCCESS = 'RECEIVE_DASHBOARD_SUCCESS';
export const RECEIVE_DASHBOARD_FAILURE = 'RECEIVE_DASHBOARD_FAILURE';
export const CLEAR_DASHBOARD = 'CLEAR_DASHBOARD';

const requestDashboard = () => ({ type: REQUEST_DASHBOARD });
export const receiveDashboardSuccess = programs => ({
  type: RECEIVE_DASHBOARD_SUCCESS,
  payload: { programs }
});
const receiveDashboardFailure = () => ({ type: RECEIVE_DASHBOARD_FAILURE });
export const clearDashboard = () => ({ type: CLEAR_DASHBOARD });

export function fetchDashboard() {
  return dispatch => {
    dispatch(requestDashboard());
    return api.getDashboard().
      then(dashboard => dispatch(receiveDashboardSuccess(dashboard))).
      catch(() => dispatch(receiveDashboardFailure()));
  };
}
