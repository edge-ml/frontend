import React, { Component } from 'react';
import { Route, Switch, Redirect, useLocation } from 'react-router-dom';

import ListPage from './routes/list/index';
import DatasetPage from './routes/dataset';
import LabelingsPage from './routes/labeling/labelings';
import ExperimentsPage from './routes/experiments';
import ProjectRefresh from './components/ProjectRefresh/ProjectRefresh';
import ModelPage from './routes/model';
import ValidationPage from './routes/validation';
import ExportPage from './routes/export';
import UploadBLE from './routes/uploadBLE';
import { UploadWebPage } from './routes/uploadWeb';
import UnderConstruction from './components/UnderConstruction';
import Settings from './routes/settings/Settings';

class AppContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Switch>
        <Route
          exact
          forceRefresh
          path={this.props.match.path + '/Datasets/view'}
          render={(props) => {
            const urlSearchParams = new URLSearchParams(props.location.search);
            let page = urlSearchParams.get('page');
            let page_size = urlSearchParams.get('page_size');

            if (!page || !page_size) {
              // Redirect to the specific page and page size
              return (
                <Redirect
                  to={`${this.props.match.url}view?page=1&page_size=5`}
                />
              );
            } else {
              return (
                <ProjectRefresh project={this.props.project}>
                  <ListPage
                    {...props}
                    page={parseInt(props.page, 10)}
                    page_size={parseInt(props.page_size, 10)}
                  />
                </ProjectRefresh>
              );
            }
          }}
        />
        <Route
          exact
          forceRefresh
          path={[
            this.props.match.path + '/Datasets',
            this.props.match.path + '/',
          ]}
          render={(props) => {
            // Redirect to /datasets/view?page=1&page_size=5
            let currentURL = this.props.match.url.endsWith('/')
              ? this.props.match.url
              : this.props.match.url + '/';
            const redirectTo = `${currentURL}Datasets/view?page=1&page_size=5`;
            return <Redirect to={redirectTo} />;
          }}
        />
        <Route
          path={[this.props.match.path + '/labelings']}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <LabelingsPage {...props} />
            </ProjectRefresh>
          )}
        />
        <Route
          path={this.props.match.path + '/datasets/:id'}
          render={(props) => (
            <DatasetPage
              {...props}
              navigateTo={this.props.navigateTo}
              modalOpen={this.props.modalOpen}
            />
          )}
        />
        <Route
          exact
          path={[
            this.props.match.path + '/experiments',
            this.props.match.path + '/experiments/new',
          ]}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <ExperimentsPage {...props} />
            </ProjectRefresh>
          )}
        />
        <Route
          exact
          path={this.props.match.path + '/models'}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <ValidationPage {...props}></ValidationPage>
            </ProjectRefresh>
          )}
        />
        <Route
          exact
          path={this.props.match.path + '/settings'}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <Settings
                onProjectsChanged={this.props.onProjectsChanged}
                userName={this.props.userName}
                onDeleteProject={this.props.onDeleteProject}
                onLeaveProject={this.props.onLeaveProject}
                userMail={this.props.userMail}
                {...props}
              />
            </ProjectRefresh>
          )}
        />
        <Route
          exact
          path={this.props.match.path + '/settings/getCode'}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <Settings
                onProjectsChanged={this.props.onProjectsChanged}
                codeSnippetModalOpen={true}
                userName={this.props.userName}
                userMail={this.props.userMail}
                onDeleteProject={this.props.onDeleteProject}
                onLeaveProject={this.props.onLeaveProject}
                {...props}
              />
            </ProjectRefresh>
          )}
        />
        <Route
          exact
          path={this.props.match.path + '/ble'}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <UploadBLE {...props}></UploadBLE>
            </ProjectRefresh>
          )}
        />
        <Route
          exact
          path={this.props.match.path + '/uploadweb'}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <UploadWebPage {...props}></UploadWebPage>
            </ProjectRefresh>
          )}
        />
      </Switch>
    );
  }
}

export default AppContent;
