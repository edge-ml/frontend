import React from "react";
import { Group, Button, Text, Table } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Checkbox from "../../components/Common/Checkbox";
import LabelBadge from "../../components/Common/LabelBadge";

const LabelingTableEntry = ({
  labeling,
  isSelected,
  toggleCheck,
  onEdit,
  onDelete,
}) => {
  return (
    <Table.Tr>
      <Table.Td>
        <Checkbox isSelected={isSelected} onClick={toggleCheck} />
      </Table.Td>
      <Table.Td>
        <div className="text-left d-inline-block m-2">
          <Text fw={700} size="lg" component="span">
            {labeling.name}
          </Text>
          <Group gap={6} mt={6}>
            {labeling.labels?.map((label) => (
              <LabelBadge key={label._id} color={label.color}>
                {label.name}
              </LabelBadge>
            ))}
          </Group>
        </div>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Button variant="outline" color="red" size="sm" onClick={onDelete}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </Button>
          <Button variant="outline" color="blue" size="sm" onClick={onEdit}>
            <FontAwesomeIcon icon={faPen} />
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};

export default LabelingTableEntry;
