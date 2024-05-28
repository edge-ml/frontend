import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { file } from 'jszip';
import { Button } from 'reactstrap';

const FileList = ({ file }) => {
  return (
    <div className="d-flex justify-content-between m-3 align-items-center">
      <div>
        <div className="font-weight-bold">{file.name}</div>
      </div>
      <div>
        <Button>
          <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
        </Button>
      </div>
    </div>
  );
};

export default FileList;
