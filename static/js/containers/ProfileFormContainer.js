// @flow
/* global SETTINGS: false */
import React from 'react';
import _ from 'lodash';
import type { Dispatch } from 'redux';

import {
  startProfileEdit,
  updateProfile,
  updateProfileValidation,
  clearProfileEdit,
  fetchUserProfile,
  saveProfile,
} from '../actions';
import {
  setWorkHistoryEdit,
  setWorkDialogVisibility,
  setWorkDialogIndex,
  setEducationDialogVisibility,
  setEducationDialogIndex,
  setEducationDegreeLevel,
  setEducationDegreeInclusions,
  setUserPageDialogVisibility,
  setShowEducationDeleteDialog,
  setShowWorkDeleteDialog,
  setDeletionIndex,
  setShowWorkDeleteAllDialog,
  setShowEducationDeleteAllDialog,
  setTOSDialogVisibility,
} from '../actions/ui';
import { createSimpleActionHelpers, createAsyncActionHelpers } from '../util/redux';
import type { ActionHelpers, AsyncActionHelpers } from '../util/redux';
import type { Validator, UIValidator } from '../util/validation';
import type { Profile, Profiles, ProfileGetResult } from '../flow/profileTypes';
import type { UIState } from '../reducers/ui';

type UpdateProfile = (isEdit: boolean, profile: Profile, validator: Validator|UIValidator) => void;

class ProfileFormContainer extends React.Component {
  props: {
    profiles:   Profiles,
    children:   React$Element<*>[],
    dispatch:   Dispatch,
    history:    Object,
    ui:         UIState,
    params:     {[k: string]: string},
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  static mapStateToProps = state => {
    return {
      profiles: state.profiles,
      ui: state.ui,
    };
  };

  fetchProfile: Function = (username: string): void => {
    const { dispatch, profiles } = this.props;
    if (profiles[username] === undefined || profiles[username].getStatus === undefined) {
      dispatch(fetchUserProfile(username));
    }
  };

  updateProfileValidation(props: Object, profile: Profile, validator: Validator|UIValidator): void {
    const username = SETTINGS.username;
    const { dispatch, profiles, ui } = props;
    if ( profiles[username].edit && !_.isEmpty(profiles[username].edit.errors) ) {
      let errors = validator(profile, ui);
      dispatch(updateProfileValidation(username, errors));
    }
  }

  updateProfile: UpdateProfile = (isEdit, profile, validator) => {
    const { dispatch } = this.props;
    const username = SETTINGS.username;

    if (!isEdit) {
      dispatch(startProfileEdit(username));
    }
    dispatch(updateProfile(username, profile));
    this.updateProfileValidation(this.props, profile, validator);
  };

  saveProfile(isEdit: boolean, validator: Validator|UIValidator, profile: Profile, ui: UIState) {
    const { dispatch } = this.props;
    const username = SETTINGS.username;

    if (!isEdit) {
      // Validation errors will only show up if we start the edit
      dispatch(startProfileEdit(username));
    }
    let errors = validator(profile, ui);
    dispatch(updateProfileValidation(username, errors));
    if (_.isEmpty(errors)) {
      return dispatch(saveProfile(username, profile)).then(() => {
        dispatch(clearProfileEdit(username));
      });
    } else {
      // `setState` is being called here because we want to guarantee that
      // the callback executes after the `dispatch` call above. A callback
      // passed to `setState` executes when the component next re-renders.
      this.setState({}, () => {
        let invalidField = document.querySelector('.invalid-input');
        if ( invalidField !== null ) {
          invalidField.scrollIntoView();
        }
      });
      return Promise.reject(errors);
    }
  }

  simpleActionHelpers: Function = (): ActionHelpers => {
    const { dispatch } = this.props;
    return createSimpleActionHelpers(dispatch, [
      ['setWorkDialogVisibility', setWorkDialogVisibility],
      ['setWorkDialogIndex', setWorkDialogIndex],
      ['clearProfileEdit', clearProfileEdit],
      ['setEducationDialogVisibility', setEducationDialogVisibility],
      ['setEducationDialogIndex', setEducationDialogIndex],
      ['setEducationDegreeLevel', setEducationDegreeLevel],
      ['setUserPageDialogVisibility', setUserPageDialogVisibility],
      ['setShowEducationDeleteDialog', setShowEducationDeleteDialog],
      ['setShowWorkDeleteDialog', setShowWorkDeleteDialog],
      ['setDeletionIndex', setDeletionIndex],
      ['setShowWorkDeleteAllDialog', setShowWorkDeleteAllDialog],
      ['setShowEducationDeleteAllDialog', setShowEducationDeleteAllDialog],
      ['setTOSDialogVisibility', setTOSDialogVisibility],
    ]);
  };

  asyncActionHelpers: Function = (): AsyncActionHelpers => {
    const { dispatch } = this.props;
    return createAsyncActionHelpers(dispatch, [
      ['setEducationDegreeInclusions', setEducationDegreeInclusions],
      ['setWorkHistoryEdit', setWorkHistoryEdit],
    ]);
  };

  profileProps: Function = (profileFromStore: ProfileGetResult) => {
    let { ui } = this.props;
    let errors, isEdit, profile;

    if ( profileFromStore === undefined ) {
      profile = {};
      errors = {};
      isEdit = false;
    } else {
      if (profileFromStore.edit !== undefined) {
        errors = profileFromStore.edit.errors;
        profile = profileFromStore.edit.profile;
        isEdit = true;
      } else {
        profile = profileFromStore.profile;
        errors = {};
        isEdit = false;
      }
    }

    return Object.assign({}, {
      profile: profile,
      errors: errors,
      ui: ui,
      updateProfile: this.updateProfile.bind(this, isEdit),
      saveProfile: this.saveProfile.bind(this, isEdit),
      fetchProfile: this.fetchProfile,
    }, ...this.simpleActionHelpers(), ...this.asyncActionHelpers()
    );
  };

  childrenWithProps: Function = (profileFromStore: ProfileGetResult) => {
    return React.Children.map(this.props.children, (child) => (
      React.cloneElement(child, this.profileProps(profileFromStore))
    ));
  }
}

export default ProfileFormContainer;
