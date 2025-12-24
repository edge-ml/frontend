import React from "react";
import {
  Anchor,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Table,
  Text,
  Title,
} from "@mantine/core";

const HelpModal = ({ isOpen, onCloseModal }) => {
  return (
    <Modal opened={isOpen} onClose={onCloseModal}>
      <Title order={4}>Help</Title>
      <Box py="sm">
        <Title order={6}>Shortcuts</Title>
        <Table withRowBorders={false} mt="xs">
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>
                <kbd>Ctrl</kbd> + <kbd>[Number]</kbd>
              </Table.Td>
              <Table.Td>Set active label type</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>
                <kbd>Backspace</kbd> / <kbd>Delete</kbd>
              </Table.Td>
              <Table.Td>Delete current label</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Box>
      <Divider my="sm" />
      <Title order={6}>Upload CSV</Title>
      <Text size="sm" mt="xs">
        <Anchor href="/example_file.csv" download="example_file.csv">
          Click here
        </Anchor>{" "}
        to download an example CSV file.
      </Text>
      <Group justify="flex-end" mt="md">
        <Button variant="outline" color="gray" onClick={onCloseModal}>
          Close
        </Button>
      </Group>
    </Modal>
  );
};

export default HelpModal;
