import React, { useContext, useEffect } from "react";
import {
  Modal,
  Button,
  Loader,
  Group,
  Stack,
  Text,
  ActionIcon,
} from "@mantine/core";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import NotificationContext from "../NotificationHandler/NotificationProvider";
import { datasetDownloadfromId } from "../../services/DatasetService";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../Common/EdgeMLTable";

const NotificationHandler = ({ onClose, isOpen }) => {
  const { activeNotifications, removeNotification } =
    useContext(NotificationContext);

  useEffect(() => {
    if (activeNotifications.length <= 0) {
      onClose();
    }
  }, [activeNotifications]);

  return (
    <Modal opened={isOpen} onClose={onClose} title="Notifications" size="xl">
      <EdgeMLTable>
        <EdgeMLTableHeader>Downloads</EdgeMLTableHeader>
        {activeNotifications.map((elm, idx) => (
          <EdgeMLTableEntry key={"notification" + idx}>
            <Group justify="space-between" m="sm">
              <div>
                <Text fw={700}>
                  {elm.datasetName || elm.projectName}
                </Text>
                <Text size="sm" c="dimmed">
                  {elm.datasetName
                    ? `(Dataset in project ${elm.projectName})`
                    : "(Project)"}
                </Text>
              </div>
              <Group gap="xs">
                {elm.error && <Text c="red">Error</Text>}
                {elm.status < 100 ? (
                  <Group gap="xs">
                    <Loader size="sm" />
                    <Text size="sm">{elm.status}%</Text>
                  </Group>
                ) : (
                  !elm.error && (
                    <Button
                      size="compact-sm"
                      onClick={() => datasetDownloadfromId(elm.downloadId)}
                    >
                      <IconDownload size={14} />
                    </Button>
                  )
                )}
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => removeNotification(elm.downloadId)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </Group>
          </EdgeMLTableEntry>
        ))}
      </EdgeMLTable>
      <Group justify="end" mt="md">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </Group>
    </Modal>
  );
};

export default NotificationHandler;
