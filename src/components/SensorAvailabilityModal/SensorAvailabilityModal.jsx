import { Box, Button, Group, Modal, Title } from "@mantine/core";

const SensorAvailabilityModal = ({ isOpen, onClose }) => {
  const onGoBack = () => {};

  return (
    <Modal opened={isOpen} onClose={onClose} size="xl">
      <Title order={4}>Header</Title>
      <Box />
      <Group justify="flex-end" mt="md">
        {page == 1 ? (
          <Button variant="outline" color="blue" onClick={onGoBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onClose} variant="outline" color="red">
          Cancel
        </Button>
      </Group>
    </Modal>
  );
};

export default SensorAvailabilityModal;
