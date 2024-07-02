import React, { useState } from "react";
import useModels from "../../Hooks/useModels";
import Loader from "../../modules/loader";
import Page from "../../components/Common/Page";
import { Button } from "reactstrap";
import ModelTable from "./ModelTable";

const ModelPage = () => {
  const { models } = useModels();

  if (!models) {
    return <Loader loading></Loader>;
  }

  const NoModelsSection = () => {
    return (
      <div
        style={{ marginTop: "30vh", fontSize: "large" }}
        className="d-flex h-100 justify-content-center align-items-center fw-bold"
      >
        No models trained yet!
      </div>
    );
  };

  return (
    <Page
      header={
        <>
          <div className="fw-bold h4 justify-self-start">MODELS</div>
          <div className="justify-f-end">
            <Button
              outline
              color="primary"
              className="btn-neutral"
              onClick={() => setModalOpen(true)}
            >
              Train a model
            </Button>
          </div>
        </>
      }
    >
      {models.length === 0 && <NoModelsSection />}
      {models.length > 0 && (
        <ModelTable
          models={models}
        ></ModelTable>
      )}
    </Page>
  );
};

export default ModelPage;
