import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

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
          path={[
            this.props.match.path + '/datasets',
            this.props.match.path + '/',
          ]}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <ListPage {...props} />
            </ProjectRefresh>
          )}
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
          path={this.props.match.path + '/model'}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <ModelPage {...props}></ModelPage>
            </ProjectRefresh>
          )}
        />
        <Route
          exact
          path={this.props.match.path + '/validation'}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <ValidationPage {...props}></ValidationPage>
            </ProjectRefresh>
          )}
        />
        <Route
          exact
          path={this.props.match.path + '/deploy'}
          render={(props) => (
            <ProjectRefresh project={this.props.project}>
              <ExportPage {...props}></ExportPage>
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
