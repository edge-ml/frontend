import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mantine/core";

const FileList = ({ file }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", margin: "0.75rem", alignItems: "center" }}>
      <div>
        <div style={{ fontWeight: 700 }}>{file.name}</div>
      </div>
      <div>
        <Button variant="subtle">
          <FontAwesomeIcon icon={faTrash} />
        </Button>
      </div>
    </div>
  );
};

export default FileList;
