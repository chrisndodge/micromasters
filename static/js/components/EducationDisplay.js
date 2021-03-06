// @flow
import React from 'react';
import IconButton from 'react-mdl/lib/IconButton';

import Grid, { Cell } from 'react-mdl/lib/Grid';
import { Card } from 'react-mdl/lib/Card';
import _ from 'lodash';
import moment from 'moment';

import ProfileFormFields from '../util/ProfileFormFields';
import ConfirmDeletion from './ConfirmDeletion';
import EducationDialog from './EducationDialog';
import {
  openEditEducationForm,
  openNewEducationForm,
  deleteEducationEntry,
} from '../util/editEducation';
import { userPrivilegeCheck } from '../util/util';
import { HIGH_SCHOOL } from '../constants';
import { educationEntriesByDate } from '../util/sorting';
import type { EducationEntry } from '../flow/profileTypes';
import { educationValidation } from '../util/validation';

export default class EducationDisplay extends ProfileFormFields {
  openEditEducationForm: Function = (index: number): void => {
    openEditEducationForm.call(this, index);
  };

  openNewEducationForm: Function = (level: string, index: number): void => {
    openNewEducationForm.call(this, level, index);
  };

  deleteEducationEntry: Function = (): void => {
    deleteEducationEntry.call(this);
  };

  educationRow: Function = (entry: EducationEntry, index: number): void => {
    const { profile, errors } = this.props;
    if (!('id' in entry)) {
      // don't show new educations, wait until we saved on the server before showing them
      return;
    }

    let deleteEntry = () => this.openEducationDeleteDialog(index);
    let editEntry = () => this.openEditEducationForm(index);
    let validationAlert = () => {
      if (_.get(errors, ['education', String(index)])) {
        return <IconButton name="error" onClick={editEntry} />;
      }
    };
    let dateFormat = date => moment(date).format("MM[/]YYYY");
    let degree = this.educationLevelOptions.find(level => (
      level.value === entry.degree_name
    )).label;
    let icons = () => (
      <div className="profile-row-icons">
        {validationAlert()}
        <IconButton className="edit-button" name="edit" onClick={editEntry} />
        <IconButton className="delete-button" name="delete" onClick={deleteEntry} />
      </div>
    );
    return (
      <Cell col={12} className="profile-form-row" key={index}>
        <div className="basic-info">
          <div className="profile-row-name">
            <span className="school-type">
              { degree }
            </span><br/>
            { entry.school_name }
          </div>
          <div className="profile-row-date-range">
            {`${dateFormat(entry.graduation_date)}`}
          </div>
        </div>
        { userPrivilegeCheck(profile, icons, () => <Cell col={2} />) }
      </Cell>
    );
  };

  renderEducationEntries: Function = (): React$Element<*>[] => {
    const { profile, profile: { education }} = this.props;
    let rows = [];
    if (education !== undefined) {
      let sorted = educationEntriesByDate(education);
      rows = sorted.map( ([index, entry]) => this.educationRow(entry, index));
    }
    userPrivilegeCheck(profile, () => {
      rows.push(
        <Cell col={12} className="profile-form-row" key={"I'm unique!"}>
          <a
            className="mm-minor-action"
            onClick={() => this.openNewEducationForm(HIGH_SCHOOL, null)}
          >
            Add another
          </a>
        </Cell>
      );
    });
    return rows;
  };

  render() {
    const { ui: { showEducationDeleteDialog } } = this.props;
    return (
      <div>
        <ConfirmDeletion
          deleteFunc={this.deleteEducationEntry}
          open={showEducationDeleteDialog}
          close={this.closeConfirmDeleteDialog}
          confirmText="Delete this entry?"
        />
        <EducationDialog
          {...this.props}
          showLevelForm={true}
          validator={educationValidation}
        />
        <Card shadow={1} className="profile-form" id="education-card">
          <Grid className="profile-form-grid">
            <Cell col={12} className="profile-form-row profile-card-header">
              <span>
                Education
              </span>
            </Cell>
          { this.renderEducationEntries() }
          </Grid>
        </Card>
      </div>
    );
  }
}
