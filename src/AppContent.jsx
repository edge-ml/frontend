import React, { lazy, Suspense, useEffect } from "react";
import { Route, useParams, Routes, Navigate } from "react-router-dom";
import NoProjectPage from "./components/NoProjectPage/NoProjectPage";
import useProjectStore from "./stores/projectStore";
import Loader from "./modules/loader";

// Dynamic imports
const ListPage = lazy(() => import("./routes/list/index"));
const loadDatasetPage = () => import("./routes/dataset");
const DatasetPage = lazy(loadDatasetPage);
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
  const { currentProject } = useProjectStore();
  const projectId = currentProject ? currentProject._id : "default_key";

  // The dataset editor is the page opened most from here, and its code is
  // not small: fetch it while the browser is idle instead of on the click.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((run) => window.setTimeout(run, 1500));
    const cancel = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => loadDatasetPage().catch(() => {}));
    return () => cancel(handle);
  }, []);

  if (!currentProject) {
    return <NoProjectPage />;
  }

  return (
    <Suspense
      fallback={
        <div style={{ height: "100vh" }}>
          <Loader loading />
        </div>
      }
    >
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
