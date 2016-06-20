import React from 'react';
import { assert } from 'chai';
import _ from 'lodash';
import sinon from 'sinon';
import TestUtils from 'react-addons-test-utils';

import { USER_PROFILE_RESPONSE } from '../../constants';
import iso3166 from 'iso-3166-2';
import MenuItem from 'material-ui/MenuItem';

import SelectField from './SelectField';
import CountrySelectField from './CountrySelectField';
import StateSelectField from './StateSelectField';
import FieldsOfStudySelectField from './FieldsOfStudySelectField';
import FIELDS_OF_STUDY from '../../fields_of_study';

describe('Profile inputs', () => {
  let inputProps, sandbox;

  const change = (newProfile) => inputProps.profile = newProfile;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const renderTestComponent = (componentType, props) => {
    let renderer = TestUtils.createRenderer();
    renderer.render(
      React.createElement(componentType, props)
    );
    return renderer.getRenderOutput();
  };
  
  describe('Select field', () => {
    let selectField;
    let genderOptions = [
      {value: 'm', label: 'Male'},
      {value: 'f', label: 'Female'},
      {value: 'o', label: 'Other/Prefer not to say'}
    ];
    let extendedOptions = [
      {value: 'a', label: 'Option 1'},
      {value: 'b', label: 'Option 2'},
      {value: 'c', label: 'Option 3'},
      {value: 'd', label: 'Option 4'},
      {value: 'e', label: 'Option 5'}
    ];

    let renderGenderSelectField = () => {
      let selectProps = Object.assign({},
        inputProps,
        {
          keySet: ['gender'],
          label: "Gender",
          options: genderOptions
        }
      );
      return renderTestComponent(SelectField, selectProps);
    };
    
    let renderExtendedSelectField = () => {
      let selectProps = Object.assign({},
        inputProps,
        {
          keySet: ['extended'],
          label: "Extended",
          options: extendedOptions
        }
      );
      return renderTestComponent(SelectField, selectProps);
    };

    beforeEach(() => {
      inputProps = {
        profile: {
          "account_privacy": "private",
          "first_name": "",
          "date_of_birth": "",
          "gender": undefined,
          "date_field": ""
        },
        errors: {
          "first_name": "First name is required",
          "date_of_birth": "Date of birth is required",
          "gender": "Gender is required",
          "date_field": "Date field is required",
          "account_privacy": "Account privacy is required"
        },
        updateProfile: change
      };
    });

    it('should set props correctly', () => {
      selectField = renderGenderSelectField();
      assert.equal(selectField.props.dataSource.length, genderOptions.length);
      for (let i = 0; i < genderOptions.length; i++) {
        let item = selectField.props.dataSource[i];
        let option = genderOptions[i];
        assert.equal(option.label, item.text);
        assert.equal(option.label, item.value.props.primaryText);
        assert.equal(option.value, item.value.props.value);
      }
      assert.equal(selectField.props.floatingLabelText, 'Gender');
      assert.equal(selectField.props.searchText, "");
      assert.ok(selectField.props.openOnFocus);
      assert.equal(selectField.props.errorText, "Gender is required");
    });

    it('should filter by case insensitive prefix', () => {
      selectField = renderGenderSelectField();
      let filter = selectField.props.filter;
      assert(filter("mal", "Male"));
      // prefix doesn't match
      assert(!filter("mal", "Female"));
    });

    it('should update the selected option when onNewRequest fires with an option', () => {
      selectField = renderGenderSelectField();
      let option = genderOptions[1];
      selectField.props.onNewRequest({
        text: option.label,
        value: <MenuItem primaryText={option.label} value={option.value}/>
      }, 0);
      assert.equal(inputProps.profile.gender, 'f');
    });

    it('should update the selected option when the enter key is pressed', () => {
      selectField = renderGenderSelectField();
      selectField.props.onNewRequest('other', -1);
      assert.equal(inputProps.profile.gender, 'o');
    });

    it("should not update the selected option when the enter key is pressed and text doesn't match", () => {
      selectField = renderGenderSelectField();
      inputProps.profile.gender = 'm';
      selectField.props.onNewRequest('x', -1);
      assert.equal(inputProps.profile.gender, 'm');
    });

    it('should have the correct option selected', () => {
      inputProps.profile.gender = 'f';
      selectField = renderGenderSelectField();
      assert.equal(selectField.props.searchText, 'Female');
    });

    it('should update the edit state when onUpdateInput is called', () => {
      selectField = renderGenderSelectField();
      selectField.props.onUpdateInput("update input text");
      assert.equal(inputProps.profile.gender_edit, "update input text");
    });

    it('should clear edit text when onBlur is called', () => {
      selectField = renderGenderSelectField();
      inputProps.profile.gender = 'f';
      inputProps.profile.gender_edit = 'text not matching anything';
      selectField.props.onBlur();
      assert.equal(inputProps.profile.gender, 'f');
      assert.equal(inputProps.profile.gender_edit, undefined);
    });

    it('should display the edit text if it is set', () => {
      const text = 'text typed in';
      inputProps.profile.gender = 'f';
      inputProps.profile.gender_edit = text;
      selectField = renderGenderSelectField();
      assert.equal(selectField.props.searchText, text);
    });

    it('behaves appropriately with a limit on autocomplete results', () => {
      inputProps.resultLimit = 3;
      selectField = renderExtendedSelectField();
      assert.isNotOk(selectField.props.openOnFocus);
    });
  });

  describe("State select field", () => {
    beforeEach(() => {
      inputProps = {
        stateKeySet: ['state_key'],
        countryKeySet: ['country_key'],
        label: 'State',
        profile: Object.assign({}, USER_PROFILE_RESPONSE),
        errors: {},
        updateProfile: change
      };
    });

    it('lists no states when an invalid country is selected', () => {
      inputProps.profile.country_key = 'MISSING';
      let stateField = renderTestComponent(StateSelectField, inputProps);
      assert.equal(stateField.props.options.length, 0);
    });

    it('renders a select field with sorted states for the given country', () => {
      const country = "US";
      // Get a list of US state values (eg: 'US-MA') ordered by the state name
      let orderedUSStateValues = _(iso3166.data[country].sub).toPairs().sortBy((keyValueList) => {
        return keyValueList[1]['name'];
      }).map((keyValueList) => {
        return keyValueList[0];
      }).value();
      inputProps.profile.country_key = country;
      let stateField = renderTestComponent(StateSelectField, inputProps);
      let optionValueList = stateField.props.options.map((option) => {
        return option.value;
      });
      assert.deepEqual(optionValueList, orderedUSStateValues);
    });
  });

  describe("Country select field", () => {
    beforeEach(() => {
      inputProps = {
        stateKeySet: ['state_key'],
        countryKeySet: ['country_key'],
        label: 'Country',
        profile: Object.assign({}, USER_PROFILE_RESPONSE),
        errors: {},
        updateProfile: change
      };
    });


    it('shows a list of countries', () => {
      inputProps.profile.country_key = null;
      inputProps.profile.country = null;
      let countryField = renderTestComponent(CountrySelectField, inputProps);
      let countryCount = _.keys(iso3166.data).length;
      assert.equal(countryField.props.options.length, countryCount);
      // Check for a random list of country values that should exist as options in the select field
      let countriesToFind = ['AF', 'AL', 'US', 'IN', 'NZ'];
      let numCountriesFound = _(countryField.props.options)
        .map((countryOption) => {
          return _.includes(countriesToFind, countryOption.value) ? 1 : 0;
        }).sum();
      assert.equal(numCountriesFound, countriesToFind.length);
    });

    it('clears the state state when the country changes', () => {
      inputProps.profile.country_key = 'US';
      inputProps.profile.state_key = 'US-MA';
      let countryField = renderTestComponent(CountrySelectField, inputProps);
      let newProfile = Object.assign({}, inputProps.profile);
      newProfile.country_key = 'AL';
      countryField.props.onChange(newProfile);
      assert.equal(inputProps.profile.country_key, 'AL');
      assert.equal(inputProps.profile.state_key, null);
    });
  });
  
  describe("Field of study select field", () => {
    beforeEach(() => {
      inputProps = {
        profile: Object.assign({}, USER_PROFILE_RESPONSE),
        errors: {},
        updateProfile: change
      };
    });

    it('shows a list of fields of study', () => {
      let fieldsOfStudyCount = _.keys(FIELDS_OF_STUDY).length;
      let fieldsOfStudyField = renderTestComponent(FieldsOfStudySelectField, inputProps);
      let options = fieldsOfStudyField.props.options;
      assert.equal(options.length, fieldsOfStudyCount);
      // Test that the option values follow the expected "xx.xxxx" pattern
      let fosCodePattern = /^\d{2}\.\d{4}$/;
      assert(fosCodePattern.test(options[0].value));
    });
  });
});