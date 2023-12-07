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
import { faXmark } from '@fortawesome/free-solid-svg-icons';

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
      <ModalHeader>Datasets</ModalHeader>
      <ModalBody>
        {console.log(activeNotifications)}
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

          // <div className="d-flex justify-content-between align-items-center">
          //   <div>
          //     <b>{elm.datasetName ? elm.datasetName : elm.projectName}</b>
          //   </div>
          // {elm.error ? <div>Error</div> : null}
          // {elm.status < 100 ? (
          //   <div className="d-flex  align-items-center">
          //     <Spinner></Spinner>
          //     <div className="ml-2">{elm.status}%</div>
          //   </div>
          // ) : (
          //   <div>
          //     {console.log(elm)}
          //     {elm.error ? null : (
          //       <Button onClick={() => datasetDownloadfromId(elm.downloadId)}>
          //         Download
          //       </Button>
          //     )}
          //   </div>
          // )}
          // <Button
          //   className="m-2"
          //   onClick={() => removeNotification(elm.downloadId)}
          //   color="danger"
          // >
          //   <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
          // </Button>
          // </div>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default NotificationHandler;
