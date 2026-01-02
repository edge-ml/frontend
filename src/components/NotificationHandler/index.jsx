import React from "react";
import { ActionIcon, Button, Group, Loader, Modal, Stack, Text } from "@mantine/core";
import NotificationContext from "../NotificationHandler/NotificationProvider";
import { useContext, useEffect } from "react";
import { datasetDownloadfromId } from "../../services/DatasetService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faTrash,
  faTrashAlt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from "../Common/EdgeMLTable";

const NotificationHandler = ({ onClose, isOpen }) => {
  const { activeNotifications, removeNotification } =
    useContext(NotificationContext);
  const formatExpiration = (expiresAt) => {
    if (!expiresAt) {
      return null;
    }
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleString();
  };

  useEffect(() => {
    if (activeNotifications.length <= 0) {
      onClose();
    }
  }, [activeNotifications]);

  return (
    <Modal opened={isOpen} onClose={onClose} size="xl" title="Notifications">
      <Stack gap="md">
        {/* {
        {activeNotifications.map((elm, idx) => (
          <Row className="mt-2" key={elm + idx}>
            <Col>
              <div>
                <b>{elm.datasetName ? elm.datasetName : elm.projectName}</b>
                <div>
                  {elm.datasetName
                    ? '(Dataset in project ' + elm.projectName + ')'
                    : '(Project)'}
                </div>
              </div>
            </Col>
            <Col className="text-center">
              {elm.error ? <div>Error</div> : null}
              {elm.status < 100 ? (
                <div className="d-flex  align-items-center">
                  <Spinner></Spinner>
                  <div className="ms-2">{elm.status}%</div>
                </div>
              ) : (
                <div>
                  {
                  {elm.error ? null : (
                    <Button
                      onClick={() => datasetDownloadfromId(elm.downloadId)}
                    >
                      Download
                    </Button>
                  )}
                </div>
              )}
            </Col>
            <Col style={{ textAlign: 'end' }}>
              <Button
                onClick={() => removeNotification(elm.downloadId)}
                color="danger"
              >
                <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
              </Button>
            </Col>
          </Row>
        ))} */}

        <EdgeMLTable>
          <EdgeMLTableHeader>
            <Text fw={600}>Downloads</Text>
          </EdgeMLTableHeader>
          {activeNotifications.map((elm, idx) => {
            return (
              <EdgeMLTableEntry key={"notification" + idx}>
                <Group justify="space-between" px="sm" py="xs" align="center">
                  <Stack gap={2}>
                    <Text fw={600}>
                      {elm.datasetName ? elm.datasetName : elm.projectName}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {elm.datasetName
                        ? "(Dataset in project " + elm.projectName + ")"
                        : "(Project)"}
                    </Text>
                    {elm.expiresAt ? (
                      <Text size="sm" c="dimmed">
                        Expires: {formatExpiration(elm.expiresAt)}
                      </Text>
                    ) : null}
                  </Stack>
                  <Group align="center" gap="sm">
                    {elm.error ? <Text c="red">Error</Text> : null}
                    {elm.status < 100 ? (
                      <Group gap="xs">
                        <Loader size="xs" />
                        <Text>{elm.status}%</Text>
                      </Group>
                    ) : (
                      <>
                        {elm.error ? null : (
                          <ActionIcon
                            variant="outline"
                            onClick={() =>
                              datasetDownloadfromId(elm.downloadId)
                            }
                          >
                            <FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>
                          </ActionIcon>
                        )}
                      </>
                    )}
                    <ActionIcon
                      variant="outline"
                      color="red"
                      onClick={() => removeNotification(elm.downloadId)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>
                    </ActionIcon>
                  </Group>
                </Group>
              </EdgeMLTableEntry>
            );
          })}
        </EdgeMLTable>
        <Group justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default NotificationHandler;
