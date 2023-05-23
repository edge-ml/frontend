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
        {console.log(activeNotifications)}
        {activeNotifications.map((elm) => (
          <div className="d-flex justify-content-between align-items-center">
            {console.log(elm)}
            <div>
              <b>{elm.projectName ? elm.projectName : elm.datasetName}</b>
            </div>
            {elm.error ? <div>Error</div> : null}
            {elm.status < 100 ? (
              <div className="d-flex  align-items-center">
                <Spinner></Spinner>
                <div className="ml-2">{elm.status}%</div>
              </div>
            ) : (
              <div>
                {elm.error ? null : (
                  <Button onClick={() => datasetDownloadfromId(elm.downloadId)}>
                    Download
                  </Button>
                )}
              </div>
            )}
            <Button
              onClick={() => removeNotification(elm.downloadId)}
              color="secondary m-2"
            >
              <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
            </Button>
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
