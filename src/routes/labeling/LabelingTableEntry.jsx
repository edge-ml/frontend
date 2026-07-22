import React from "react";
import { Group, Badge, ActionIcon, Text } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../../components/Common/Checkbox";
import LabelBadge from "../../components/Common/LabelBadge";

const LabelingTableEntry = ({ labeling, isSelected, toggleCheck, onEdit }) => {
  return (
    <Group p="sm" gap="sm" wrap="nowrap">
      <Checkbox isSelected={isSelected} onClick={toggleCheck} />
      <div style={{ flex: 1 }}>
        <Text fw={700}>{labeling.name}</Text>
        <Group gap={4} mt={4}>
          {labeling.labels?.map((label) => (
            <LabelBadge key={label._id} color={label.color}>
              {label.name}
            </LabelBadge>
          ))}
        </Group>
      </div>
      <Group gap="xs">
        <ActionIcon variant="subtle" color="blue" onClick={onEdit}>
          <FontAwesomeIcon icon={faEdit} />
        </ActionIcon>
      </Group>
    </Group>
  );
};

export default LabelingTableEntry;
