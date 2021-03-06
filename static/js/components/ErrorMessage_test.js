/* global SETTINGS: false */
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { assert } from 'chai';
import _ from 'lodash';

import {
  RECEIVE_DASHBOARD_FAILURE,
  RECEIVE_GET_USER_PROFILE_SUCCESS,
  REQUEST_GET_USER_PROFILE,
  RECEIVE_DASHBOARD_SUCCESS,
  RECEIVE_GET_USER_PROFILE_FAILURE,
  SET_USER_PAGE_DIALOG_VISIBILITY,
  START_PROFILE_EDIT,
  UPDATE_PROFILE_VALIDATION,
  REQUEST_PATCH_USER_PROFILE,
  RECEIVE_PATCH_USER_PROFILE_FAILURE,
  CLEAR_PROFILE_EDIT,
} from '../actions';
import {
  DASHBOARD_RESPONSE,
  ERROR_RESPONSE,
  USER_PROFILE_RESPONSE,
} from '../constants';
import IntegrationTestHelper from '../util/integration_test_helper';
import { makeStrippedHtml } from '../util/util';
import * as api from '../util/api';
import ErrorMessage from './ErrorMessage';

describe("ErrorInfo", () => {
  let errorString = `Sorry, we were unable to load the data necessary
      to process your request. Please reload the page.`;
  errorString = errorString.replace(/\s\s+/g, ' ');

  let contactExpectation = `If the error persists, please contact
      mitx-support@mit.edu specifying this entire error message.`;
  contactExpectation = contactExpectation.replace(/\s\s+/g, ' ');

  describe('unit tests', () => {
    let renderErrorMessage = props => {
      return makeStrippedHtml(<ErrorMessage {...props} />);
    };
    let codeAttributes = [
      ['error_code', '500'],
      ['errorStatusCode', 404],
    ];
    let messageAttributes = [
      ['user_message', 'A message'],
      ['detail', 'Some details'],
    ];

    codeAttributes.forEach(([codeAttribute, code]) => {
      messageAttributes.forEach(([msgAttribute, message]) => {
        it(`should render an error and message on the ${codeAttribute} and ${msgAttribute} attributes`, () => {
          let that = {
            errorInfo: {
              [codeAttribute]: code,
              [msgAttribute]: message,
            }
          };
          let errorMessage = renderErrorMessage(that);
          assert.include(errorMessage, String(code));
          assert.include(errorMessage, errorString);
          assert.include(errorMessage, contactExpectation);
          assert.include(errorMessage, message);
        });
      });
    });
  });

  describe('showing errors on pages', () => {
    let renderComponent, helper, patchUserProfileStub, listenForActions;
    let dashboardErrorActions;

    const confirmErrorMessage = (div, codeMessage, extraInfo = '') => {
      let alert = div.querySelector('.alert-message');
      let messages = alert.getElementsByTagName('p');
      assert.deepEqual(messages[0].textContent, codeMessage);
      assert.deepEqual(messages[1].textContent, extraInfo);
      assert.deepEqual(messages[2].textContent, contactExpectation);
    };

    beforeEach(() => {
      helper = new IntegrationTestHelper();
      renderComponent = helper.renderComponent.bind(helper);
      patchUserProfileStub = helper.sandbox.stub(api, 'patchUserProfile');
      listenForActions = helper.listenForActions.bind(helper);

      dashboardErrorActions = [
        RECEIVE_DASHBOARD_FAILURE,
        RECEIVE_GET_USER_PROFILE_SUCCESS
      ];

      helper.profileGetStub.
        withArgs(SETTINGS.username).
        returns(
          Promise.resolve(Object.assign({}, USER_PROFILE_RESPONSE, {
            username: SETTINGS.username
          }))
        );
    });

    afterEach(() => {
      helper.cleanup();
    });

    describe('dashboard page', () => {
      it('error from the backend triggers error message in dashboard', () => {
        helper.dashboardStub.returns(Promise.reject(ERROR_RESPONSE));

        return renderComponent("/dashboard", dashboardErrorActions, false).then(([, div]) => {
          confirmErrorMessage(div, `AB123 ${errorString}`, 'Additional info: custom error message for the user.');
        });
      });

      it('the error from the backend does not need to be complete', () => {
        let response = _.cloneDeep(ERROR_RESPONSE);
        delete response.user_message;
        helper.dashboardStub.returns(Promise.reject(response));

        return renderComponent("/dashboard", dashboardErrorActions, false).then(([, div]) => {
          confirmErrorMessage(div, `AB123 ${errorString}`);
        });
      });

      it('the error from the backend does not need to exist at all as long as there is an http error', () => {
        helper.dashboardStub.returns(Promise.reject({
          errorStatusCode: 500
        }));

        return renderComponent("/dashboard", dashboardErrorActions, false).then(([, div]) => {
          confirmErrorMessage(div, `500 ${errorString}`);
        });
      });

      it('a regular response does not show the error', () => {
        helper.dashboardStub.returns(Promise.resolve(DASHBOARD_RESPONSE));

        return renderComponent("/dashboard").then(([, div]) => {
          let message = div.getElementsByClassName('alert-message')[0];
          assert.equal(message, undefined);
        });
      });
    });

    describe('profile page', () => {
      it('renders errors when there is an error receiving the profile', () => {
        helper.profileGetStub.
          withArgs(SETTINGS.username).
          returns(Promise.reject(ERROR_RESPONSE));

        const types = [
          RECEIVE_DASHBOARD_SUCCESS,
          RECEIVE_GET_USER_PROFILE_FAILURE,
        ];
        return renderComponent("/profile", types, false).then(([, div]) => {
          confirmErrorMessage(
            div,
            `${ERROR_RESPONSE.error_code} ${errorString}`,
            `Additional info: ${ERROR_RESPONSE.user_message}`,
          );
        });
      });
    });

    describe('user page', () => {
      it('should show an error for profile GET', () => {
        let fourOhFour = {
          errorStatusCode: 404,
          detail: "some error messsage"
        };
        helper.profileGetStub.
          withArgs(SETTINGS.username).
          returns(Promise.reject(fourOhFour));
        let actions = [
          REQUEST_GET_USER_PROFILE,
          RECEIVE_DASHBOARD_SUCCESS,
          RECEIVE_GET_USER_PROFILE_FAILURE,
        ];
        return renderComponent(`/users/${SETTINGS.username}`, actions, false).then(([, div]) => {
          confirmErrorMessage(
            div,
            `404 ${errorString}`,
            `Additional info: ${fourOhFour.detail}`
          );
        });
      });

      it('should show an error for profile PATCH', () => {
        patchUserProfileStub.returns(Promise.reject({errorStatusCode: 500}));
        let userPageActions = [
          REQUEST_GET_USER_PROFILE,
          RECEIVE_DASHBOARD_SUCCESS,
          RECEIVE_GET_USER_PROFILE_SUCCESS,
          RECEIVE_GET_USER_PROFILE_SUCCESS,
        ];
        return renderComponent(`/users/${SETTINGS.username}`, userPageActions, false).then(([, div]) => {
          let editButton = div.querySelector('.mdl-card').querySelector('.mdl-button--icon');
          listenForActions([
            SET_USER_PAGE_DIALOG_VISIBILITY,
            START_PROFILE_EDIT,
            UPDATE_PROFILE_VALIDATION,
            REQUEST_PATCH_USER_PROFILE,
            RECEIVE_PATCH_USER_PROFILE_FAILURE,
            CLEAR_PROFILE_EDIT,
            SET_USER_PAGE_DIALOG_VISIBILITY,
            CLEAR_PROFILE_EDIT,
          ], () => {
            TestUtils.Simulate.click(editButton);
            let dialog = document.querySelector('.personal-dialog');
            let save = dialog.querySelector('.save-button');
            TestUtils.Simulate.click(save);
          }).then(() => {
            confirmErrorMessage(div, `500 ${errorString}`);
          });
        });
      });
    });
  });
});
