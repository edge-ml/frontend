import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faList,
  faPen,
  faTimes,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import React, { Fragment, useState } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Checkbox,
  Group,
  Text,
} from "@mantine/core";

import classNames from "classnames";

import { displayTime } from "../../services/helpers";
import LabelBadge from "../../components/Common/LabelBadge";
import useProjectRouter from "../../Hooks/ProjectRouter";
import EditModal from "../../components/EditModal";

// s as unix timestamp in milliseconds
const format_time = (s) => {
  const seconds = s / 1000;

  // Calculate the number of minutes and seconds from the remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });

  // Calculate the number of hours, minutes, and seconds from the remaining minutes
  const hours = Math.floor(minutes / 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });
  const remainingMinutes = (minutes % 60).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
  });

  return `${hours}:${remainingMinutes}:${remainingSeconds}`;
};

const Labelings = (props) => {
  if (!props.dataset.labelings.length || !props.labelings.length) {
    return null;
  }

  const labelings = props.dataset.labelings
    .map((elm) =>
      props.labelings.find((labeling) => labeling.id === elm.labelingId)
    )
    .filter((elm) => elm !== undefined);

  return (
    <div className="mt-1 ms-4 p-lg-0 m-lg-0">
      <Group className="ps-1 ms-1 p-lg-0 m-lg-0 " gap="sm">
        {labelings.map((labeling, idx) => (
          <Badge
            className="me-2 badgeSize badgeLabelings pb-2 mt-2 mb-2"
            color="gray"
            size="md"
            key={labeling + idx}
          >
            <div className="labelingBadgeWrapper">
              {labeling.name.toUpperCase()}
            </div>
            <div>
              {labeling.labels.map((label, index) => {
                const labelTypes = props.dataset.labelings[idx].labels.map(
                  (elm) => elm.type
                );
                if (!labelTypes.includes(label.id)) {
                  return null;
                }
                return (
                  <LabelBadge
                    key={label + index}
                    className="badgeSize mx-1"
                    color={label.color}
                  >
                    {label.name}
                  </LabelBadge>
                );
              })}
            </div>
          </Badge>
        ))}
      </Group>
    </div>
  );
};

const Metadata = (props) => {
  if (!props.metaData) {
    return null;
  }
  const dataset = props.dataset;
  return (
    <div>
      <Group align="center" gap="xs">
        <Text fw={600} size="md">
          Metadata:
        </Text>
        <Group gap="xs">
          {Object.keys(dataset.metaData).map((key, idx) => {
            const value = dataset.metaData[key];
            return (
              <Badge key={key + idx} className="me-2 badgeSize" color="gray" size="md">
                <b>{key}: </b>
                {value}
              </Badge>
            );
          })}
        </Group>
      </Group>
    </div>
  );
};

const AdditionalInfo = (props) => {
  const dataset = props.dataset;

  return (
    <div className="text-left m-2">
      <Metadata dataset={dataset}></Metadata>
      <Labelings
        labelings={props.labelings}
        dataset={props.dataset}
      ></Labelings>
    </div>
  );
};

const DatasetInfo = (props) => {
  const { dataset, updateDataset } = props;

  const [datasetNameEditOpen, setDatasetNameEditOpen] = useState(false);

  const datasetStart = Math.min(...dataset.timeSeries.map((elm) => elm.start));
  const datasetEnd = Math.max(...dataset.timeSeries.map((elm) => elm.end));

  const duration = Math.max(datasetEnd - datasetStart, 0) || 0;
  const empty = dataset.timeSeries
    .map((elm) => elm.length)
    .every((elm) => elm === 0 || elm === null);
  return (
    <div className="text-left d-inline-block m-2">
      <Text fw={700} size="xl">
        {dataset.name}
      </Text>
      {!empty ? (
        <Fragment>
          <Text size="sm" c="dimmed">
            <b>START </b>
            {displayTime(datasetStart)}
          </Text>
          <Text size="sm" c="dimmed">
            <b>DURATION </b>
            {format_time(duration)}
          </Text>
        </Fragment>
      ) : (
        <Group align="center" gap="xs">
          <FontAwesomeIcon
            style={{ fontSize: "1rem", color: "rgb(131, 136, 159)" }}
            icon={faExclamationTriangle}
          ></FontAwesomeIcon>
          <Text size="md">Dataset is empty</Text>
        </Group>
      )}
      <EditModal
        isOpen={datasetNameEditOpen}
        headerText="Edit Name"
        value={""}
        placeholder="Enter new datast name"
        onSave={(text) => {
          updateDataset({ ...dataset, name: text });
          setDatasetNameEditOpen(false);
        }}
        onCancel={() => setDatasetNameEditOpen(false)}
      ></EditModal>
    </div>
  );
};

const ExpandButton = (props) => {
  return (
    <div
      className=" align-self-stretch d-flex"
      onClick={(e) => {
        e.stopPropagation();
        props.setOpen(!props.isOpen);
      }}
    >
      <div
        className={classNames("d-flex align-items-center animationDuration", {
          collapse_arrow: props.isOpen,
        })}
      >
        <ActionIcon color="gray" variant="light" size="lg">
          <FontAwesomeIcon
            icon={!props.isOpen ? faList : faTimes}
          ></FontAwesomeIcon>
        </ActionIcon>
      </div>
    </div>
  );
};

const DatasetTableEntry = (props) => {
  const dataset = props.dataset;
  const updateDataset = props.updateDataset;
  const navigate = useProjectRouter();

  const [isOpen, setOpen] = useState(false);
  return (
    <Fragment>
      <Box
        className="datasetCard"
        style={{
          background: props.index % 2 === 1 ? "rgb(249, 251, 252)" : "",
        }}
      >
        <Group align="stretch" wrap="nowrap">
          <Box className="d-flex align-items-center p-2 ms-2 me-0 ml-md-3 me-md-3">
            <Checkbox
              checked={props.isSelected}
              className="d-inline-block"
              onChange={(e) => props.toggleCheck(e, dataset.id)}
            />
          </Box>
          <Box className="w-100">
            <Group align="center" wrap="nowrap">
              <Box className="text-left align-self-center col-lg-4 col-xl-3">
                <DatasetInfo dataset={dataset} updateDataset={updateDataset} />
              </Box>
              <Box className="d-none d-lg-block" style={{ flex: 1 }}>
                <div className="d-flex h-100 flex-column justify-content-center">
                  <AdditionalInfo dataset={dataset} labelings={props.labelings} />
                </div>
              </Box>
              <Box style={{ flex: 1 }}>
                <Group justify="flex-end" align="center" className="h-100" wrap="nowrap">
                  <div className="d-block d-lg-none me-2">
                    <ExpandButton isOpen={isOpen} setOpen={setOpen} />
                  </div>
                  <ActionIcon
                    size="lg"
                    variant="outline"
                    color="red"
                    className="me-2"
                    onClick={() => props.deleteEntry(dataset.id)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </ActionIcon>
                  <ActionIcon
                    size="lg"
                    variant="outline"
                    color="blue"
                    className="me-3 me-md-4"
                    onClick={() => navigate(`Datasets/${dataset.id}`)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </ActionIcon>
                </Group>
              </Box>
            </Group>
          </Box>
        </Group>
        <div
          className={classNames("animationDuration d-block d-lg-none", {
            showInfo: !isOpen,
          })}
        >
          <AdditionalInfo
            dataset={dataset}
            labelings={props.labelings}
          ></AdditionalInfo>
        </div>
      </Box>
    </Fragment>
  );
};

export default DatasetTableEntry;
