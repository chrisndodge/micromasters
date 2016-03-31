/* global SETTINGS: false */
import React from 'react';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import {
  fetchCourseList,
  clearCourseList,
  fetchUserProfile,
  clearProfile,
  fetchDashboard,
  clearDashboard,
} from '../actions/index';

class DashboardPage extends React.Component {
  componentDidMount() {
    this.fetchCourseList();
    this.fetchUserProfile(SETTINGS.username);
    this.fetchDashboard();
  }

  componentDidUpdate() {
    this.fetchCourseList();
    this.fetchUserProfile(SETTINGS.username);
    this.fetchDashboard();
  }

  componentWillUnmount() {
    const { dispatch, profile } = this.props;
    dispatch(clearCourseList());
    dispatch(clearProfile());
    dispatch(clearDashboard());
  }

  fetchCourseList() {
    const { courseList, dispatch } = this.props;
    if (courseList.fetchStatus === undefined) {
      dispatch(fetchCourseList());
    }
  }
  fetchUserProfile(username) {
    const { profile, dispatch } = this.props;
    if (profile.userProfileStatus === undefined) {
      dispatch(fetchUserProfile(username));
    }
  }

  fetchDashboard() {
    const { dashboard, dispatch } = this.props;
    if (dashboard.fetchStatus === undefined) {
      dispatch(fetchDashboard());
    }
  }

  render() {
    const { courseList, profile, dashboard } = this.props;
    return <div>
      <Header />
      <Dashboard
        courseList={courseList}
        profile={profile.profile}
        dashboard={dashboard}
      />
    </div>;
  }
}

const mapStateToProps = (state) => {
  return {
    courseList: state.courseList,
    profile: state.userProfile,
    dashboard: state.dashboard,
  };
};

DashboardPage.propTypes = {
  courseList: React.PropTypes.object.isRequired,
  profile: React.PropTypes.object.isRequired,
  dashboard: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired
};

export default connect(mapStateToProps)(DashboardPage);
