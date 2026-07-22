import React, { useState } from "react";
import Checkbox from "../../components/Common/Checkbox";
import { Group, Text, Loader, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPen } from "@fortawesome/free-solid-svg-icons";
import DownloadModal from "./DownloadModal";
import { SelectedModelModalView } from "../../components/SelectedModelModalView/SelectedModelModalView";
import ButtonList from "./ButtonList";
import DeployModal from "./DeployModal";
import EditModal from "../../components/EditModal";

const metric = (val) => Math.round(val * 100 * 100) / 100;

const ModelTableEntry = ({
  model,
  selectedModels,
  stepOptions,
  clickCheckBox,
  onDeleteModels,
  updateModel,
}) => {
  const [modalModel, setModalModel] = useState(null);
  const [modelDownload, setModelDownload] = useState(null);
  const [datasetNameEditOpen, setDatasetNameEditOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(false);

  const metrics =
    !model.error && model.trainStatus === "done"
      ? model.pipeline.selectedPipeline.steps
          .find((elm) => elm.type === "EVAL")
          ?.options.metrics.metrics
      : null;

  return (
    <>
      <Group p="sm" gap="sm" wrap="nowrap" align="flex-start">
        <Checkbox
          isSelected={selectedModels.includes(model._id)}
          onClick={() => clickCheckBox(model)}
        />
        <div style={{ flex: 1 }}>
          <Group gap="xs">
            <Text fw={700} size="lg" component="span">
              {model.name}
            </Text>
            <FontAwesomeIcon
              className="cursor-pointer"
              icon={faPen}
              onClick={() => setDatasetNameEditOpen(true)}
            />
          </Group>
          <Text size="sm" c="dimmed">
            {model.pipeline?.selectedPipeline?.name}
          </Text>
        </div>

        {model.error ? (
          <Group gap="xs" style={{ color: "red" }}>
            <Text c="red">An error occurred while training!</Text>
            <Tooltip label={model.error}>
              <FontAwesomeIcon icon={faCircleInfo} />
            </Tooltip>
          </Group>
        ) : model.trainStatus !== "done" ? (
          <Group gap="xs">
            <Loader size="sm" />
            <Text size="sm">Training...</Text>
          </Group>
        ) : (
          <Group gap="md">
            <Text size="sm">
              <b>Acc: </b>
              {metrics ? `${metric(metrics.accuracy_score)}%` : "N/A"}
            </Text>
            <Text size="sm">
              <b>F1: </b>
              {metrics ? `${metric(metrics.f1_score)}%` : "N/A"}
            </Text>
          </Group>
        )}

        <ButtonList
          model={model}
          setModalModel={setModalModel}
          setModelDownload={setModelDownload}
          onDeleteSingleModel={(m) => onDeleteModels([m])}
          stepOptions={stepOptions}
          setDeployModalOpen={setDeployModalOpen}
        />
      </Group>

      <SelectedModelModalView
        model={modalModel}
        onClosed={() => setModalModel(null)}
      />
      <DownloadModal
        model={modelDownload}
        onClose={() => setModelDownload(null)}
      />
      <DeployModal
        isOpen={deployModalOpen}
        model={model}
        onClose={() => setDeployModalOpen(false)}
      />
      <EditModal
        isOpen={datasetNameEditOpen}
        headerText="Edit Name"
        value=""
        placeholder="Enter new model name"
        onSave={(text) => {
          updateModel({ ...model, name: text });
          setDatasetNameEditOpen(false);
        }}
        onCancel={() => setDatasetNameEditOpen(false)}
      />
    </>
  );
};

export default ModelTableEntry;
