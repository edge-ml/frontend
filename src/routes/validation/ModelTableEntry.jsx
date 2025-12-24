import React, { useState } from "react";
import {
  ActionIcon,
  Checkbox,
  Group,
  Loader,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faPen } from "@fortawesome/free-solid-svg-icons";
import DownloadModal from "./DownloadModal";
import { SelectedModelModalView } from "../../components/SelectedModelModalView/SelectedModelModalView";
import ButtonList from "./ButtonList";
import DeployModal from "./DeployModal";
import EditModal from "../../components/EditModal";

const ModelCheckBoxInfo = ({
  selectedModels,
  model,
  clickCheckBox,
  onClickEditName,
}) => (
  <Group align="center" wrap="nowrap">
    <Checkbox
      checked={selectedModels.map((item) => item.id).includes(model.id)}
      onChange={() => clickCheckBox(model)}
    />
    <Stack gap={2}>
      <Group gap="xs" align="center">
        <Text fw={700} size="xl">
          {model.name}
        </Text>
        <ActionIcon variant="subtle" onClick={onClickEditName}>
          <FontAwesomeIcon icon={faPen} />
        </ActionIcon>
      </Group>
      <Text size="sm">{model.pipeline.selectedPipeline.name}</Text>
    </Stack>
  </Group>
);

const TrainErrorSection = ({
  model,
  selectedModels,
  clickCheckBox,
  setModalModel,
  setModelDownload,
  onDeleteModels,
  stepOptions,
  setDeployModalOpen,
  onClickEditName
}) => (
  <Group align="center" justify="space-between" px="sm" py="xs">
    <ModelCheckBoxInfo
      selectedModels={selectedModels}
      model={model}
      clickCheckBox={clickCheckBox}
      onClickEditName={onClickEditName}
    ></ModelCheckBoxInfo>
    <Group align="center" style={{ color: "red", flex: 1 }}>
      {model.error ? (
        <>
          <Text> An error occurred while training!</Text>
          <Tooltip label={model.error}>
            <ActionIcon variant="subtle" color="red">
              <FontAwesomeIcon icon={faCircleInfo}></FontAwesomeIcon>
            </ActionIcon>
          </Tooltip>
        </>
      ) : (
        <Stack gap={0}>
          <Text>
            <b>Acc: </b>
            {metric(model.metrics.accuracy_score)}%
          </Text>
          <Text>
            <b>F1: </b>
            {metric(model.metrics.f1_score)}%
          </Text>
        </Stack>
      )}
    </Group>
    <Group align="center">
      <ButtonList
        model={model}
        setModalModel={setModalModel}
        setModelDownload={setModelDownload}
        onDeleteSingleModel={(model) => onDeleteModels([model])}
        stepOptions={stepOptions}
        setDeployModalOpen={setDeployModalOpen}
      ></ButtonList>
    </Group>
  </Group>
);

const metric = (metric) => Math.round(metric * 100 * 100) / 100;

const ModelTableEntry = ({
  model,
  selectedModels,
  stepOptions,
  clickCheckBox,
  onDeleteModels,
  updateModel
}) => {
  const [modalModel, setModalModel] = useState(null);
  const [modelDownload, setModelDownload] = useState(null);
  const [datasetNameEditOpen, setDatasetNameEditOpen] = useState(false);
  const [deployModalOpen, setDeployModalOpen] = useState(null);

  const metrics =
    model.error || model.trainStatus !== "done"
      ? undefined
      : model.pipeline.selectedPipeline.steps.find((elm) => elm.type === "EVAL")
          .options.metrics.metrics;

  if (model.error) {
    return (
      <>
        <TrainErrorSection
          model={model}
          selectedModels={selectedModels}
          clickCheckBox={clickCheckBox}
          setModalModel={setModalModel}
          setModelDownload={setModelDownload}
          onDeleteModels={onDeleteModels}
          stepOptions={stepOptions}
          onClickEditName={() => setDatasetNameEditOpen(true)}
        ></TrainErrorSection>
      </>
    );
  }

  return (
    <Group align="center" justify="space-between" px="sm" py="xs">
      <ModelCheckBoxInfo
        selectedModels={selectedModels}
        model={model}
        clickCheckBox={clickCheckBox}
        onClickEditName={() => setDatasetNameEditOpen(true)}
      ></ModelCheckBoxInfo>
      {model.trainStatus !== "done" ? (
        <Group align="center">
          <Loader size="sm" />
          <Text>Training...</Text>
        </Group>
      ) : (
        <Stack gap={0}>
          <Text>
            <b>Acc: </b>
            {metrics && metric(metrics.accuracy_score)}%
          </Text>
          <Text>
            <b>F1: </b>
            {metrics && metric(metrics.f1_score)}%
          </Text>
        </Stack>
      )}
      <Group align="center">
        <ButtonList
          model={model}
          setModalModel={setModalModel}
          setModelDownload={setModelDownload}
          onDeleteSingleModel={(model) => onDeleteModels([model])}
          stepOptions={stepOptions}
          setDeployModalOpen={setDeployModalOpen}
        ></ButtonList>
      </Group>
      <SelectedModelModalView
        model={modalModel}
        onClosed={() => setModalModel(null)}
      ></SelectedModelModalView>
      <DownloadModal
        model={modelDownload}
        onClose={() => setModelDownload(null)}
      ></DownloadModal>
      <DeployModal
        isOpen={deployModalOpen}
        model={model}
        onClose={() => setDeployModalOpen(null)}
      ></DeployModal>
      <EditModal
        isOpen={datasetNameEditOpen}
        headerText="Edit Name"
        value={""}
        placeholder="Enter new model name"
        onSave={(text) => {
          updateModel({ ...model, name: text });
          setDatasetNameEditOpen(false);
        }}
        onCancel={() => setDatasetNameEditOpen(false)}
      ></EditModal>
    </Group>
  );
};

export default ModelTableEntry;
