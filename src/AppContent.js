import React, { createContext, useMemo } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import ListPage from './routes/list/index';
import DatasetPage from './routes/dataset';
import LabelingsPage from './routes/labeling/labelings';
import ExperimentsPage from './routes/experiments';
import ProjectRefresh from './components/ProjectRefresh/ProjectRefresh';
import ValidationPage from './routes/validation';
import UploadBLE from './routes/uploadBLE';
import { UploadWebPage } from './routes/uploadWeb';
import Settings from './routes/settings/Settings';
import ModelLivePage from './routes/ModelLivePage';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';

const AppContent = (props) => {
  const {
    match,
    project,
    navigateTo,
    modalOpen,
    onProjectsChanged,
    userName,
    onDeleteProject,
    onLeaveProject,
    userMail,
  } = props;

  return (
    <Switch>
      <Route
        exact
        forceRefresh
        path={[match.path + '/datasets', match.path + '/']}
        render={(props) => {
          let path = match.url;
          if (path.endsWith('datasets')) {
            return <Redirect to={path + '/view'} />;
          } else {
            return <Redirect to={path + '/datasets/view'} />;
          }
        }}
      />
      <Route
        exact
        forceRefresh
        path={match.path + '/datasets/view'}
        render={(props) => {
          return (
            <ProjectRefresh project={project}>
              <ListPage {...props} />
            </ProjectRefresh>
          );
        }}
      />
      <Route
        path={[match.path + '/labelings']}
        render={(props) => (
          <ProjectRefresh project={project}>
            <LabelingsPage {...props} />
          </ProjectRefresh>
        )}
      />
      <Route
        path={match.path + '/datasets/:id'}
        render={(props) => (
          <DatasetPage
            {...props}
            navigateTo={navigateTo}
            modalOpen={modalOpen}
          />
        )}
      />
      <Route
        exact
        path={[match.path + '/experiments', match.path + '/experiments/new']}
        render={(props) => (
          <ProjectRefresh project={project}>
            <ExperimentsPage {...props} />
          </ProjectRefresh>
        )}
      />
      <Route
        exact
        path={match.path + '/models/live/:model_id'}
        render={(modelProps) => (
          <ModelLivePage
            modelId={modelProps.match.params.model_id}
          ></ModelLivePage>
        )}
      ></Route>
      <Route
        exact
        path={match.path + '/models'}
        render={(props) => (
          <ProjectRefresh project={project}>
            <ValidationPage {...props}></ValidationPage>
          </ProjectRefresh>
        )}
      />
      <Route
        exact
        path={match.path + '/settings'}
        render={(props) => (
          <ProjectRefresh project={project}>
            <Settings
              onProjectsChanged={onProjectsChanged}
              userName={userName}
              onDeleteProject={onDeleteProject}
              onLeaveProject={onLeaveProject}
              userMail={userMail}
              {...props}
            />
          </ProjectRefresh>
        )}
      />
      <Route
        exact
        path={match.path + '/settings/getCode'}
        render={(props) => (
          <ProjectRefresh project={project}>
            <Settings
              onProjectsChanged={onProjectsChanged}
              codeSnippetModalOpen={true}
              userName={userName}
              userMail={userMail}
              onDeleteProject={onDeleteProject}
              onLeaveProject={onLeaveProject}
              {...props}
            />
          </ProjectRefresh>
        )}
      />
      <Route
        exact
        path={match.path + '/ble'}
        render={(props) => (
          <ProjectRefresh project={project}>
            <UploadBLE {...props}></UploadBLE>
          </ProjectRefresh>
        )}
      />
      <Route
        exact
        path={match.path + '/uploadweb'}
        render={(props) => (
          <ProjectRefresh project={project}>
            <UploadWebPage {...props}></UploadWebPage>
          </ProjectRefresh>
        )}
      />
    </Switch>
  );
};

export default AppContent;
