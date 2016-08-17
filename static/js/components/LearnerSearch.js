import React from 'react';
import {
  SearchkitComponent,
  HierarchicalMenuFilter,
  Hits,
  NoHits,
  SelectedFilters,
  RefinementListFilter,
  HitsStats,
  Pagination,
  ResetFilters,
  SortingSelector,
} from 'searchkit';
import Grid, { Cell } from 'react-mdl/lib/Grid';
import Card from 'react-mdl/lib/Card/Card';
import iso3166 from 'iso-3166-2';

import LearnerResult from './search/LearnerResult';
import CountryRefinementOption from './search/CountryRefinementOption';
import FilterVisibilityToggle from './search/FilterVisibilityToggle';
import HitsCount from './search/HitsCount';
import type { Option } from '../flow/generalTypes';

let makeSearchkitTranslations: () => Object = () => {
  let translations = {};
  for (let code of Object.keys(iso3166.data)) {
    translations[code] = iso3166.data[code].name;
    for (let stateCode of Object.keys(iso3166.data[code].sub)) {
      translations[stateCode] = iso3166.data[code].sub[stateCode].name;
    }
  }

  return translations;
};

const sortOptions = [
  {
    label: "Name A-Z", key: "name_a_z", fields: [
      { field: "profile.last_name", options: { order: "asc" } },
      { field: "profile.first_name", options: { order: "asc" } }
    ]
  },
  {
    label: "Name Z-A", key: "name_z_a", fields: [
      { field: "profile.last_name", options: { order: "desc" } },
      { field: "profile.first_name", options: { order: "desc" } }
    ]
  },
  {
    label: "Grade High-to-low", field: "program.grade_average",
    options: { order: "desc" }, key: "grade-high-low"
  },
  {
    label: "Grade Low-to-High", field: "program.grade_average",
    options: { order: "asc" }, key: "grade-low-high"
  },
  {
    label: "Location A-Z", key: "loc-a-z", fields: [
      { field: "profile.country", options: { order: "asc" } },
      { field: "profile.city", options: { order: "asc" } },
    ]
  },
  {
    label: "Location Z-A", key: "loc-z-a", fields: [
      { field: "profile.country", options: { order: "desc" } },
      { field: "profile.city", options: { order: "desc" } },
    ]
  },
];

export default class LearnerSearch extends SearchkitComponent {
  props: {
    checkFilterVisibility:  (s: string) => boolean,
    setFilterVisibility:    (s: string, v: boolean) => void,
  };

  dropdownOptions: Option[] = [
    { value: 'name', label: "Sort: name" },
    { value: 'dob', label: "Sort: dob" },
  ];

  searchkitTranslations: Object = makeSearchkitTranslations();

  render () {
    return (
      <div className="learners-search">
        <Grid className="search-grid">
          <Cell col={3} className="search-sidebar">
            <Card className="fullwidth">
              <FilterVisibilityToggle
                {...this.props}
                filterName="birth-location"
              >
                <RefinementListFilter
                  id="birth_location"
                  title="Place of Birth"
                  field="profile.birth_country"
                  itemComponent={CountryRefinementOption}
                />
              </FilterVisibilityToggle>
              <FilterVisibilityToggle
                {...this.props}
                filterName="residence-country"
              >
                <HierarchicalMenuFilter
                  fields={["profile.country", "profile.state_or_territory"]}
                  title="Current Location"
                  id="country"
                  translations={this.searchkitTranslations}
                />
              </FilterVisibilityToggle>
            </Card>
          </Cell>
          <Cell col={9}>
            <Card className="fullwidth">
              <Grid className="search-header">
                <Cell col={6} className="result-info">
                  <div
                    role="button"
                    id="new-group"
                    className="mm-button"
                  >
                    <span>
                      New Group from Selected
                    </span>
                  </div>
                  <div
                    role="button"
                    id="email-selected"
                    className="mm-button"
                  >
                    Email Selected
                  </div>
                  <HitsStats component={HitsCount} />
                </Cell>
                <Cell col={2}></Cell>
                <Cell col={4} className="pagination-sort">
                  <SortingSelector options={sortOptions} />
                  <Pagination />
                </Cell>
                <Cell col={12}>
                  <SelectedFilters />
                  <ResetFilters />
                </Cell>
              </Grid>
              <Hits 
                className="learner-results"
                hitsPerPage={50}
                itemComponent={LearnerResult}
              />
              <NoHits />
            </Card>
          </Cell>
        </Grid>
      </div>
    );
  }
}
