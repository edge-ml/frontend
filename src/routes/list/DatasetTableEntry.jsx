import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faExclamationTriangle,
  faPen,
  faTrashAlt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import React, { useEffect, useRef, useState } from "react";
import {
  ActionIcon,
  Button,
  Group,
  HoverCard,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";

import Checkbox from "../../components/Common/Checkbox";
import { displayTime } from "../../services/helpers";
import useProjectRouter from "../../Hooks/ProjectRouter";

const ColorDot = ({ color = "var(--mantine-color-blue-5)" }) => (
  <span
    aria-hidden="true"
    style={{
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: color,
      boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 16%, transparent)`,
      flexShrink: 0,
    }}
  />
);

const MoreLink = ({ count }) =>
  count > 0 ? (
    <Text size="xs" c="blue" fw={600} style={{ whiteSpace: "nowrap" }}>
      +{count} more
    </Text>
  ) : null;

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
    .map((datasetLabeling) => {
      const labeling = labelings.find(
        (item) => item._id === datasetLabeling.labelingId
      );
      if (!labeling) return null;

      const selectedTypes = new Set(
        datasetLabeling.labels.map((label) => label.type)
      );
      return {
        labeling,
        activeLabels: labeling.labels.filter((label) =>
          selectedTypes.has(label._id)
        ),
      };
    })
    .filter(Boolean);
  if (datasetLabelings.length === 0) return null;

  const visible = datasetLabelings.slice(0, 2);
  const remaining = datasetLabelings.length - visible.length;

  const content = (
    <Stack gap="md" maw={340}>
      {datasetLabelings.map(({ labeling, activeLabels }) => (
        <div key={labeling._id}>
          <Text fw={700} size="sm" mb={6}>
            {labeling.name}
          </Text>
          <Group gap="sm">
            {activeLabels.map((label) => (
              <Group key={label._id} gap={6} wrap="nowrap">
                <ColorDot color={label.color} />
                <Text size="sm">{label.name}</Text>
              </Group>
            ))}
          </Group>
        </div>
      ))}
    </Stack>
  );

  return (
    <HoverCard shadow="md" openDelay={200} withinPortal={false}>
      <HoverCard.Target>
        <Stack gap={7}>
          {visible.map(({ labeling, activeLabels }) => (
            <Group key={labeling._id} gap={8} wrap="nowrap">
              <ColorDot color={activeLabels[0]?.color} />
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={600} truncate>
                  {labeling.name}
                </Text>
                <Text size="xs" c="dimmed">
                  {activeLabels.length} selected{" "}
                  {activeLabels.length === 1 ? "label" : "labels"}
                </Text>
              </div>
            </Group>
          ))}
          <MoreLink count={remaining} />
        </Stack>
      </HoverCard.Target>
      <HoverCard.Dropdown>{content}</HoverCard.Dropdown>
    </HoverCard>
  );
};

const Metadata = ({ dataset }) => {
  if (!dataset.metaData) return null;
  const entries = Object.entries(dataset.metaData);
  if (entries.length === 0) return null;
  const visible = entries.slice(0, 2);
  const remaining = entries.length - visible.length;
  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "—";
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  };

  const content = (
    <Stack gap={8} maw={360}>
      {entries.map(([key, value]) => (
        <Group key={key} gap="md" wrap="nowrap" align="baseline">
          <Text size="xs" c="dimmed" fw={600} w={110} truncate>
            {key}
          </Text>
          <Text size="sm" style={{ overflowWrap: "anywhere" }}>
            {formatValue(value)}
          </Text>
        </Group>
      ))}
    </Stack>
  );

  return (
    <HoverCard shadow="md" openDelay={200} withinPortal={false}>
      <HoverCard.Target>
        <Stack gap={6}>
          {visible.map(([key, value]) => (
            <Group key={key} gap={8} wrap="nowrap" align="baseline">
              <Text size="xs" c="dimmed" fw={600} w={84} truncate>
                {key}
              </Text>
              <Text size="sm" truncate maw={190}>
                {formatValue(value)}
              </Text>
            </Group>
          ))}
          <MoreLink count={remaining} />
        </Stack>
      </HoverCard.Target>
      <HoverCard.Dropdown>{content}</HoverCard.Dropdown>
    </HoverCard>
  );
};

const DatasetInfo = ({ dataset, updateDataset }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(dataset.name);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isEditingName) {
      setNameDraft(dataset.name);
      // Focus and select the text once the input is mounted.
      const id = requestAnimationFrame(() => {
        nameInputRef.current?.select();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isEditingName]);

  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== dataset.name) {
      updateDataset({ ...dataset, name: trimmed });
    }
    setIsEditingName(false);
  };

  const datasetStart = Math.min(...dataset.timeSeries.map((elm) => elm.start));
  const datasetEnd = Math.max(...dataset.timeSeries.map((elm) => elm.end));
  const duration = Math.max(datasetEnd - datasetStart, 0) || 0;
  const empty = dataset.timeSeries
    .map((elm) => elm.length)
    .every((elm) => elm === 0 || elm === null);

  return (
    <div className="text-left d-inline-block m-2">
      <Group gap="xs" wrap="nowrap">
        {isEditingName ? (
          <Group gap="xs" wrap="nowrap">
            <TextInput
              w={220}
              size="sm"
              value={nameDraft}
              ref={nameInputRef}
              onChange={(e) => setNameDraft(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName();
                if (e.key === "Escape") setIsEditingName(false);
              }}
              placeholder="Enter new dataset name"
            />
            <ActionIcon
              variant="filled"
              color="blue"
              onClick={saveName}
              title="Save name"
            >
              <FontAwesomeIcon icon={faCheck} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setIsEditingName(false)}
              title="Cancel"
            >
              <FontAwesomeIcon icon={faXmark} />
            </ActionIcon>
          </Group>
        ) : (
          <>
            <Text fw={700} size="lg" component="span">
              {dataset.name}
            </Text>
            <ActionIcon
              variant="subtle"
              color="gray"
              aria-label={`Rename ${dataset.name}`}
              title="Rename"
              onClick={() => setIsEditingName(true)}
            >
              <FontAwesomeIcon icon={faPen} style={{ fontSize: "0.8rem" }} />
            </ActionIcon>
          </>
        )}
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
    </div>
  );
};

const DatasetTableEntry = (props) => {
  const {
    dataset,
    updateDataset,
    isSelected,
    toggleCheck,
    labelings,
    deleteEntry,
  } = props;
  const navigate = useProjectRouter();

  return (
    <Table.Tr>
      <Table.Td>
        <Checkbox
          isSelected={isSelected}
          onClick={(e) => toggleCheck(e, dataset._id)}
        />
      </Table.Td>
      <Table.Td>
        <DatasetInfo dataset={dataset} updateDataset={updateDataset} />
      </Table.Td>
      <Table.Td>
        <Labelings dataset={dataset} labelings={labelings} />
      </Table.Td>
      <Table.Td>
        <Metadata dataset={dataset} />
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Button
            variant="outline"
            color="red"
            size="sm"
            onClick={() => deleteEntry(dataset._id)}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
          <Button
            variant="outline"
            color="blue"
            size="sm"
            onClick={() => navigate(`Datasets/${dataset._id}`)}
          >
            <FontAwesomeIcon icon={faPen} />
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

export default DatasetTableEntry;
