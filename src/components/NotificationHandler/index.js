import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap';
import NotificationContext from '../NotificationHandler/NotificationProvider';
import { useContext } from 'react';
import { datasetDownloadfromId } from '../../services/DatasetService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const NotificationHandler = ({ onClose, isOpen }) => {
  const { activeNotifications, removeNotification } =
    useContext(NotificationContext);

  return (
    <Modal isOpen={isOpen} size="xl">
      <ModalHeader>Datasets</ModalHeader>
      <ModalBody>
        {activeNotifications.map((elm) => (
          <div className="d-flex justify-content-between">
            <div>
              {elm.datasets.map((elm) => (
                <Badge className="m-1">{elm.name}</Badge>
              ))}
            </div>
            <div>Processed: {elm.status}%</div>
            {elm.status !== 100 ? (
              <Spinner></Spinner>
            ) : (
              <div>
                <Button onClick={() => datasetDownloadfromId(elm.downloadId)}>
                  Download
                </Button>
                <Button
                  onClick={() => removeNotification(elm.downloadId)}
                  color="secondary m-2"
                >
                  <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                </Button>
              </div>
            )}
          </div>
        ))}
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default NotificationHandler;
