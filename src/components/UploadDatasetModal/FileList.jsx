import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Group, Text } from "@mantine/core";

const FileList = ({ file }) => {
  return (
    <Group justify="space-between" px="md" py="sm">
      <Text fw={600}>{file.name}</Text>
      <ActionIcon variant="outline" color="red">
        <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
      </ActionIcon>
    </Group>
  );
};

export default FileList;
