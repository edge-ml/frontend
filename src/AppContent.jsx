import React, { useEffect, lazy, Suspense } from "react";
import { Route, useParams, Routes, Navigate } from "react-router-dom";
import NoProjectPage from "./components/NoProjectPage/NoProjectPage";
import useProjectStore from "./stores/projectStore";

// Dynamic imports
const ListPage = lazy(() => import("./routes/list/index"));
const DatasetPage = lazy(() => import("./routes/dataset"));
const LabelingsPage = lazy(() => import("./routes/labeling/labelings"));
const ValidationPage = lazy(() => import("./routes/validation"));
const UploadBLE = lazy(() => import("./routes/uploadBLE"));
const UploadWebPage = lazy(() => import("./routes/uploadWeb"));
const Settings = lazy(() => import("./routes/settings/Settings"));
const ModelLivePage = lazy(() => import("./routes/ModelLivePage"));

const ParamsAdapter = ({ children }) => {
  if (!children) {
    throw Error("ParamsAdapter needs a child");
  }
  const params = useParams();
  const childrenWithProps = React.Children.map(children, (child) =>
    React.cloneElement(child, { ...params })
  );
  return childrenWithProps;
};

const AppContent = () => {
  const { currentProject, getProjects } = useProjectStore();
  const projectId = currentProject ? currentProject._id : "default_key";

  useEffect(() => {
    getProjects();
  }, []);

  if (!currentProject) {
    return <NoProjectPage />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/:userName/:projectId/">
          {/* Datasets-List */}
          <Route path="Datasets" element={<ListPage key={projectId} />} />
          <Route path="Datasets/view" element={<ListPage key={projectId} />} />
          <Route path="view" element={<ListPage key={projectId} />} />
          {/* Dataset */}
          <Route
            path="Datasets/:datasetId"
            element={
              <ParamsAdapter>
                <DatasetPage key={projectId} />
              </ParamsAdapter>
            }
          />
          {/* Labelings */}
          <Route path="labelings" element={<LabelingsPage key={projectId} />} />
          {/* Models */}
          <Route path="Models" element={<ValidationPage key={projectId} />} />
          {/* Models-Live-Page */}
          <Route
            path="Models/live/:model_id"
            element={
              <ParamsAdapter>
                <ModelLivePage key={projectId}></ModelLivePage>
              </ParamsAdapter>
            }
          />
          {/* Settings */}
          <Route path="Settings" element={<Settings key={projectId} />} />
          <Route
            path="Settings/getCode"
            element={<Settings key={projectId} />}
          />
          {/* BLE-Recording */}
          <Route path="BLE" element={<UploadBLE key={projectId} />} />
          {/* Upload-Web */}
          <Route path="uploadWeb" element={<UploadWebPage key={projectId} />} />
          {/* Default to the datasets-page */}
          <Route path="" element={<Navigate to="Datasets" />} />
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to={`${currentProject.admin.userName}/${currentProject.name}/Datasets`}
            />
          }
        />
      </Routes>
    </Suspense>
  );
};

export default AppContent;
