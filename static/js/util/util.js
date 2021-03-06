// @flow
/* global SETTINGS:false */
import React from 'react';
import ReactDOM from 'react-dom';
import ga from 'react-ga';
import striptags from 'striptags';
import _ from 'lodash';
import iso3166 from 'iso-3166-2';
import urljoin from 'url-join';
import { Maybe, Just, Nothing } from 'sanctuary';

import {
  EDUCATION_LEVELS,
  PROFILE_STEP_LABELS
} from '../constants';
import type {
  Profile,
  EducationEntry,
  WorkHistoryEntry,
  ValidationErrors,
} from '../flow/profileTypes';
import { workEntriesByDate } from './sorting';

export function sendGoogleAnalyticsEvent(category: any, action: any, label: any, value: any) {
  let event: any = {
    category: category,
    action: action,
    label: label,
  };
  if (value !== undefined) {
    event.value = value;
  }
  ga.event(event);
}

export function userPrivilegeCheck (profile: Profile, privileged: any, unPrivileged: any): any {
  if ( profile.username === SETTINGS.username ) {
    return _.isFunction(privileged) ? privileged() : privileged;
  } else {
    return _.isFunction(unPrivileged) ? unPrivileged() : unPrivileged;
  }
}

export function makeProfileProgressDisplay(active: string) {
  const width = 750, height = 100, radius = 20, paddingX = 40, paddingY = 5;
  const numCircles = PROFILE_STEP_LABELS.size;

  // width from first circle edge left to the last circle edge right
  const circlesWidth = width - (paddingX * 2 + radius * 2);
  // x distance between two circle centers
  const circleDistance = Math.floor(circlesWidth / (numCircles - 1));
  const textY = (height - (radius * 2)) / 2 + radius * 2;
  const circleY = radius + paddingY;

  const greenFill = "#00964e", greenLine = "#7dcba7";
  const greyStroke = "#ececec", lightGreyText = "#b7b7b7", darkGreyText = "#888888";
  const greyFill = "#eeeeee", greyCircle = "#dddddd";
  const colors = {
    completed: {
      fill: greenFill,
      stroke: "white",
      circleText: "white",
      text: greenFill,
      line: greenLine
    },
    current: {
      fill: "white",
      stroke: greyStroke,
      circleText: "black",
      text: "black",
      line: greyStroke
    },
    future: {
      fill: greyFill,
      stroke: greyCircle,
      circleText: darkGreyText,
      text: lightGreyText,
      line: greyStroke
    }
  };

  const elements = [];

  let activeTab = [...PROFILE_STEP_LABELS.keys()].findIndex(k => k === active);
  [...PROFILE_STEP_LABELS.entries()].forEach(([, label], i) => {
    let colorScheme;
    if (i < activeTab) {
      colorScheme = colors.completed;
    } else if (i === activeTab) {
      colorScheme = colors.current;
    } else {
      colorScheme = colors.future;
    }

    const circleX = paddingX + radius + circleDistance * i;
    const nextCircleX = paddingX + radius + circleDistance * (i + 1);
    elements.push(
      <circle
        key={`circle_${i}`}
        cx={circleX}
        cy={circleY}
        r={radius}
        stroke={colorScheme.stroke}
        fill={colorScheme.fill}
      />,
      <text
        key={`text_${i}`}
        x={circleX}
        y={textY}
        textAnchor="middle"
        style={{
          fill: colorScheme.text,
          fontWeight: 700,
          fontSize: "12pt"
        }}
      >
        {label}
      </text>,
      <text
        key={`circletext_${i}`}
        x={circleX}
        y={circleY}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fill: colorScheme.circleText,
          fontWeight: 700,
          fontSize: "12pt"
        }}
      >
        {i + 1}
      </text>
    );
    if (i !== numCircles - 1) {
      elements.push(
        <line
          key={`line_${i}`}
          x1={circleX + radius}
          x2={nextCircleX - radius}
          y1={circleY}
          y2={circleY}
          stroke={colorScheme.line}
          strokeWidth={2}
        />
      );
    }
  });

  return <svg style={{width: width, height: height}}>
    <desc>Profile progress: {PROFILE_STEP_LABELS.get(active)}</desc>
    {elements}
  </svg>;
}

/* eslint-disable camelcase */
/**
 * Generate new education object 
 */
export function generateNewEducation(level: string): EducationEntry {
  return {
    'degree_name': level,
    'graduation_date': "",
    'field_of_study': null,
    'online_degree': false,
    'school_name': null,
    'school_city': null,
    'school_state_or_territory': null,
    'school_country': null
  };
}

/**
 * Generate new work history object
 */
export function generateNewWorkHistory(): WorkHistoryEntry {
  return {
    position: "",
    industry: "",
    company_name: "",
    start_date: "",
    end_date: null,
    city: "",
    country: null,
    state_or_territory: null,
  };
}



/**
 * Converts string to int using base 10. Stricter in what is accepted than parseInt
 */
export const filterPositiveInt = (value: ?string|number): number|void => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if ( typeof value === 'number') {
    return value;
  }
  if(/^[0-9]+$/.test(value)) {
    return Number(value);
  }
  return undefined;
};

/**
 * Returns the string with any HTML rendered and then its tags stripped
 */
export function makeStrippedHtml(textOrElement: any): string {
  if (React.isValidElement(textOrElement)) {
    let container = document.createElement("div");
    ReactDOM.render(textOrElement, container);
    return striptags(container.innerHTML);
  } else {
    return striptags(textOrElement);
  }
}

export function makeProfileImageUrl(profile: Profile): string {
  let imageUrl = urljoin(SETTINGS.edx_base_url, 'static/images/profiles/default_120.png');
  if (profile !== undefined && profile.profile_url_large) {
    imageUrl = profile.profile_url_large;
  }

  return imageUrl;
}

/**
 * Returns the preferred name or else the username
 */
export function getPreferredName(profile: Profile, last: boolean = true): string {
  let first;
  if ( profile.username === SETTINGS.username ) {
    first = profile.preferred_name || SETTINGS.name || SETTINGS.username;
  } else {
    first = profile.preferred_name || profile.first_name;
  }
  if ( last ) {
    return profile.last_name ? `${first} ${profile.last_name}` : first;
  }
  return first;
}

/**
 * returns the users location
 */
export function getLocation(profile: Profile): string {
  let { country, state_or_territory, city } = profile;
  let subCountryLocation, countryLocation;
  if ( country === 'US' ) {
    let state = state_or_territory.replace(/^\D{2}-/, '');
    subCountryLocation = `${city}, ${state}`;
    countryLocation = 'US';
  } else {
    subCountryLocation = city;
    countryLocation = iso3166.country(country).name;
  }
  return `${subCountryLocation}, ${countryLocation}`;
}

/**
 * returns the user's most recent (or current) employer
*/
export function getEmployer(profile: Profile): Maybe<string> {
  let entries = workEntriesByDate(profile.work_history);
  if ( _.isEmpty(entries) ) {
    return Nothing();
  }
  let [, entry] = entries[0];
  if ( entry.company_name ) {
    return Just(entry.company_name);
  }
  return Nothing();
}

export function calculateDegreeInclusions(profile: Profile) {
  let highestLevelFound = false;
  let inclusions = {};
  for (const { value } of EDUCATION_LEVELS) {
    inclusions[value] = highestLevelFound ? false : true;
    if (value === profile.edx_level_of_education) {
      // every level after this point is higher than the user has attained according to edx
      highestLevelFound = true;
    }
  }

  // turn on all switches where the user has data
  for (const { value } of EDUCATION_LEVELS) {
    if (profile.education.filter(education => education.degree_name === value).length > 0) {
      inclusions[value] = true;
    }
  }
  return inclusions;
}

/**
 * Calls an array of functions in series with a given argument and returns an array of the results
 */
export function callFunctionArray<R: any, F: (a: any) => R>(functionArray: Array<F>, arg: any): R[] {
  return functionArray.map((func) => func(arg));
}

/**
 * takes an 'error' object and a keyset, and returns a class selector if an
 * error is present
 */
export function validationErrorSelector(errors: ValidationErrors, keySet: string[]) {
  return _.get(errors, keySet) ? "invalid-input" : "";
}

/**
 * Formats a number between 0 and 1 as a percent, eg "57%"
 */
export function asPercent(number: number): string {
  if (number === undefined || number === null) {
    return "";
  } else if (!isFinite(number)) {
    return "";
  }
  return `${Math.round(number * 100)}%`;
}
