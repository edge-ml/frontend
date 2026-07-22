import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExclamationTriangle,
  faList,
  faPen,
  faTimes,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import React, { useState } from "react";
import { Button, Group, Text, Tooltip, Badge } from "@mantine/core";

import { useNavigate } from "react-router-dom";
import classNames from "classnames";

import Checkbox from "../../components/Common/Checkbox";
import { displayTime } from "../../services/helpers";
import LabelBadge from "../../components/Common/LabelBadge";
import useProjectRouter from "../../Hooks/ProjectRouter";
import EditModal from "../../components/EditModal";

const format_time = (s) => {
  const seconds = s / 1000;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });
  const hours = Math.floor(minutes / 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });
  const remainingMinutes = (minutes % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });
  return `${hours}:${remainingMinutes}:${remainingSeconds}`;
};

const Labelings = ({ dataset, labelings }) => {
  if (!dataset.labelings?.length || !labelings?.length) return null;

  const datasetLabelings = dataset.labelings
    .map((elm) => labelings.find((labeling) => labeling._id === elm.labelingId))
    .filter(Boolean);

  return (
    <Group gap="xs" mt="xs" ml="lg">
      {datasetLabelings.map((labeling, idx) => (
        <Badge
          key={labeling._id}
          variant="outline"
          className="badgeSize"
          styles={{ root: { padding: "8px" } }}
        >
          <Text size="xs" fw={700}>
            {labeling.name.toUpperCase()}
          </Text>
          <Group gap={4} mt={2}>
            {labeling.labels.map((label) => {
              const labelTypes = dataset.labelings[idx].labels.map(
                (elm) => elm.type
              );
              if (!labelTypes.includes(label._id)) return null;
              return (
                <LabelBadge key={label._id} color={label.color} size="xs">
                  {label.name}
                </LabelBadge>
              );
            })}
          </Group>
        </Badge>
      ))}
    </Group>
  );
};

const Metadata = ({ dataset }) => {
  if (!dataset.metaData) return null;
  return (
    <Group gap="xs" mt="xs">
      <Text fw={700} size="sm" component="span">
        Metadata:{' '}
      </Text>
      {Object.entries(dataset.metaData).map(([key, value]) => (
        <Badge key={key} variant="outline" size="sm">
          <b>{key}: </b>
          {value}
        </Badge>
      ))}
    </Group>
  );
};

const DatasetInfo = ({ dataset, updateDataset }) => {
  const [datasetNameEditOpen, setDatasetNameEditOpen] = useState(false);

  const datasetStart = Math.min(...dataset.timeSeries.map((elm) => elm.start));
  const datasetEnd = Math.max(...dataset.timeSeries.map((elm) => elm.end));
  const duration = Math.max(datasetEnd - datasetStart, 0) || 0;
  const empty = dataset.timeSeries
    .map((elm) => elm.length)
    .every((elm) => elm === 0 || elm === null);

  return (
    <div className="text-left d-inline-block m-2">
      <Group gap="xs">
        <Text fw={700} size="lg" component="span">
          {dataset.name}
        </Text>
      </Group>
      {!empty ? (
        <>
          <Text size="xs" c="dimmed">
            <b>START </b>
            {displayTime(datasetStart)}
          </Text>
          <Text size="xs" c="dimmed">
            <b>DURATION </b>
            {format_time(duration)}
          </Text>
        </>
      ) : (
        <Group gap="xs">
          <FontAwesomeIcon
            style={{ fontSize: "1rem", color: "rgb(131, 136, 159)" }}
            icon={faExclamationTriangle}
          />
          <Text size="sm" c="dimmed">
            Dataset is empty
          </Text>
        </Group>
      )}
      <EditModal
        isOpen={datasetNameEditOpen}
        headerText="Edit Name"
        value=""
        placeholder="Enter new dataset name"
        onSave={(text) => {
          updateDataset({ ...dataset, name: text });
          setDatasetNameEditOpen(false);
        }}
        onCancel={() => setDatasetNameEditOpen(false)}
      />
    </div>
  );
};

const DatasetTableEntry = (props) => {
  const { dataset, updateDataset, isSelected, toggleCheck, labelings, deleteEntry, index } = props;
  const navigate = useProjectRouter();
  const [isOpen, setOpen] = useState(false);

  return (
    <div
      className="datasetCard"
      style={{
        background: index % 2 === 1 ? "rgb(249, 251, 252)" : "",
      }}
    >
      <Group gap="xs" p="sm" wrap="nowrap">
        <Checkbox
          isSelected={isSelected}
          onClick={(e) => toggleCheck(e, dataset._id)}
        />
        <Group justify="space-between" style={{ flex: 1 }} wrap="nowrap">
          <DatasetInfo dataset={dataset} updateDataset={updateDataset} />
          <Group gap="xs" visibleFrom="lg">
            <Labelings dataset={dataset} labelings={labelings} />
            <Metadata dataset={dataset} />
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Button
              variant="outline"
              color="red"
              size="compact-sm"
              onClick={() => deleteEntry(dataset._id)}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>
            <Button
              variant="outline"
              color="blue"
              size="compact-sm"
              onClick={() => navigate(`Datasets/${dataset._id}`)}
            >
              <FontAwesomeIcon icon={faPen} />
            </Button>
          </Group>
        </Group>
      </Group>
    </div>
  );
};

export default DatasetTableEntry;
