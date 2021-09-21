import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { Route, Switch } from 'react-router-dom';

import ListPage from './routes/list';
import DatasetPage from './routes/dataset';
import LabelingsPage from './routes/labelings';
import ExperimentsPage from './routes/experiments';
import ProjectSettings from './routes/projectSettings';
import ProjectRefresh from './components/ProjectRefresh/ProjectRefresh';
import ModelPage from './routes/model';
import UploadBLE from './routes/uploadBLE';

class AppContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Container className="h-100">
        <Switch>
          <Route
            exact
            forceRefresh
            path={[
              this.props.match.path + '/datasets',
              this.props.match.path + '/'
            ]}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <ListPage {...props} />
              </ProjectRefresh>
            )}
          />
          <Route
            path={[this.props.match.path + '/labelings']}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <LabelingsPage {...props} />
              </ProjectRefresh>
            )}
          />
          <Route
            path={this.props.match.path + '/datasets/:id'}
            render={props => (
              <DatasetPage {...props} navigateTo={this.props.navigateTo} />
            )}
          />
          <Route
            exact
            path={[
              this.props.match.path + '/experiments',
              this.props.match.path + '/experiments/new'
            ]}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <ExperimentsPage {...props} />
              </ProjectRefresh>
            )}
          />
          <Route
            exact
            path={this.props.match.path + '/model'}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <ModelPage></ModelPage>
              </ProjectRefresh>
            )}
          />
          <Route
            exact
            path={this.props.match.path + '/settings'}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <ProjectSettings
                  onProjectsChanged={this.props.onProjectsChanged}
                  userName={this.props.userName}
                  userMail={this.props.userMail}
                  {...props}
                />
              </ProjectRefresh>
            )}
          />
          <Route
            exact
            path={this.props.match.path + '/settings/getCode'}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <ProjectSettings
                  onProjectsChanged={this.props.onProjectsChanged}
                  codeSnippetModalOpen={true}
                  userName={this.props.userName}
                  userMail={this.props.userMail}
                  {...props}
                />
              </ProjectRefresh>
            )}
          />
          <Route
            exact
            path={this.props.match.path + '/ble'}
            render={props => (
              <ProjectRefresh project={this.props.project}>
                <UploadBLE {...props}></UploadBLE>
              </ProjectRefresh>
            )}
          />
        </Switch>
      </Container>
    );
  }
}

export default AppContent;
