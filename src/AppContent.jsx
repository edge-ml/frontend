import React, { useContext } from 'react';
import { Route, useParams } from 'react-router-dom';

import ListPage from './routes/list/index';
import DatasetPage from './routes/dataset';
import LabelingsPage from './routes/labeling/labelings';
import ValidationPage from './routes/validation';
import UploadBLE from './routes/uploadBLE';
import { UploadWebPage } from './routes/uploadWeb';
import Settings from './routes/settings/Settings';
import ModelLivePage from './routes/ModelLivePage';
import { Routes, Navigate } from 'react-router-dom';
import NoProjectPage from './components/NoProjectPage/NoProjectPage';
import useProjectStore from './stores/projectStore';

const ParamsAdapter = ({ children }) => {
  if (!children) {
    throw Error('ParamsAdapter needs a child');
  }
  const params = useParams();
  const childrenWithProps = React.Children.map(children, (child) =>
    React.cloneElement(child, { ...params }),
  );
  return childrenWithProps;
};

const AppContent = () => {
  const { currentProject } = useProjectStore();
  const projectId = currentProject ? currentProject._id : 'default_key';

  if (!currentProject) {
    return <NoProjectPage></NoProjectPage>;
  }

  return (
    <Routes>
      <Route path="/:userName/:projectId/">
        {/*  Datasets-List */}
        <Route
          path="Datasets"
          element={<ListPage key={projectId}></ListPage>}
        ></Route>
        <Route
          path="Datasets/view"
          element={<ListPage key={projectId}></ListPage>}
        ></Route>
        <Route
          path="view"
          element={<ListPage key={projectId}></ListPage>}
        ></Route>
        {/* Dataset */}
        {/* <Route path="Datasets/:id" element={<DatasetPage></DatasetPage>} key={projectId}></Route> */}
        <Route
          path="Datasets/:datasetId"
          element={
            <ParamsAdapter>
              <DatasetPage key={projectId}></DatasetPage>
            </ParamsAdapter>
          }
        ></Route>
        {/* Labelings */}
        <Route
          path="labelings"
          element={<LabelingsPage key={projectId}></LabelingsPage>}
        ></Route>
        {/* Models */}
        <Route
          path="Models"
          element={<ValidationPage key={projectId}></ValidationPage>}
        ></Route>
        {/* Models-Live-Page */}
        <Route
          path="Models/live/:model_id"
          element={<ModelLivePage key={projectId}></ModelLivePage>}
        ></Route>
        {/* Settings */}
        <Route
          path="Settings"
          element={<Settings key={projectId}></Settings>}
        ></Route>
        <Route
          path="Settings/getCode"
          element={<Settings key={projectId}></Settings>}
        ></Route>
        {/* BLE-Recording */}
        <Route
          path="BLE"
          element={<UploadBLE key={projectId}></UploadBLE>}
        ></Route>
        {/* Upload-Web */}
        <Route
          path="uploadWeb"
          element={<UploadWebPage key={projectId}></UploadWebPage>}
        ></Route>
        {/* Default to the datasets-page */}
        <Route path="" element={<Navigate to="Datasets"></Navigate>}></Route>
      </Route>
      <Route path="*" element={<Navigate to={`${currentProject.admin.userName}/${currentProject.name}/Datasets`}></Navigate>}></Route>
    </Routes>
  );
};

export default AppContent;
