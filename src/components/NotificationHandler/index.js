import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Col,
  Row,
} from 'reactstrap';
import NotificationContext from '../NotificationHandler/NotificationProvider';
import { useContext, useEffect } from 'react';
import { datasetDownloadfromId } from '../../services/DatasetService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faTrash,
  faTrashAlt,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {
  EdgeMLTable,
  EdgeMLTableEntry,
  EdgeMLTableHeader,
} from '../Common/EdgeMLTable';

const NotificationHandler = ({ onClose, isOpen }) => {
  const { activeNotifications, removeNotification } =
    useContext(NotificationContext);

  useEffect(() => {
    if (activeNotifications.length <= 0) {
      onClose();
    }
  }, [activeNotifications]);

  return (
    <Modal isOpen={isOpen} size="xl">
      <ModalHeader toggle={onClose}>Notifications</ModalHeader>
      <ModalBody>
        {/* {console.log(activeNotifications)}
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
                  <div className="ml-2">{elm.status}%</div>
                </div>
              ) : (
                <div>
                  {console.log(elm)}
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
          <EdgeMLTableHeader>Downloads</EdgeMLTableHeader>
          {activeNotifications.map((elm, idx) => {
            return (
              <EdgeMLTableEntry>
                <div className="m-2 d-flex justify-content-between algin-items-center">
                  <div>
                    <b>{elm.datasetName ? elm.datasetName : elm.projectName}</b>
                    <div>
                      {elm.datasetName
                        ? '(Dataset in project ' + elm.projectName + ')'
                        : '(Project)'}
                    </div>
                  </div>
                  <div className="text-center d-flex align-items-center m-2">
                    {elm.error ? <div>Error</div> : null}
                    {elm.status < 100 ? (
                      <div className="d-flex  align-items-center">
                        <Spinner></Spinner>
                        <div className="ml-2">{elm.status}%</div>
                      </div>
                    ) : (
                      <div>
                        {console.log(elm)}
                        {elm.error ? null : (
                          <Button
                            onClick={() =>
                              datasetDownloadfromId(elm.downloadId)
                            }
                          >
                            <FontAwesomeIcon
                              icon={faDownload}
                            ></FontAwesomeIcon>
                          </Button>
                        )}
                      </div>
                    )}
                    <div className="ml-2">
                      <Button
                        onClick={() => removeNotification(elm.downloadId)}
                        color="danger"
                      >
                        <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>
                      </Button>
                    </div>
                  </div>
                </div>
              </EdgeMLTableEntry>
            );
          })}
        </EdgeMLTable>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default NotificationHandler;
