import React, { createContext, useContext, useMemo } from 'react';
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
import { ProjectContext } from './ProjectProvider';
import { Router, Routes } from 'react-router-dom';

const AppContent = ({ match }) => {
  const { currentProject } = useContext(ProjectContext);

  return (
    <Routes>
      <Route path="/:userName/:projectId/">
        <Route path="test" element={<div>test</div>}></Route>
        <Route
          path="labelings"
          element={<LabelingsPage></LabelingsPage>}
        ></Route>
        <Route path="Datasets" element={<ListPage></ListPage>}></Route>
      </Route>
    </Routes>
  );
};

export default AppContent;
