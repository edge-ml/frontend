import React, { useState } from "react";
import useModels from "../../Hooks/useModels";
import Loader from "../../modules/loader";
import Page from "../../components/Common/Page";
import { Button } from "reactstrap";
import ModelTable from "./ModelTable";
import { Empty } from "../export/components/Empty";

const ModelPage = () => {
  const { models } = useModels();

  if (!models) {
    return <Loader loading></Loader>;
  }

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
      {models.length === 0 && <Empty>No models trained yet</Empty>}
      {models.length > 0 && (
        <ModelTable
          models={models}
        ></ModelTable>
      )}
    </Page>
  );
};

export default ModelPage;
