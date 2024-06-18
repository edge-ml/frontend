// Import necessary libraries and components
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Row, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faFile,
  faMicrochip,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";
import useProjectRouter from "../../Hooks/ProjectRouter";
import useDatasetStore from "../../stores/datasetStore";
import { UploadDatasetModal } from "../../components/UploadDatasetModal/UploadDatasetModal";

// Component for Data Upload Panel
const DataUpload = () => {
  const navigate = useProjectRouter();

  const [csvModalOpen, setCSVModalOpen] = useState(true);
  const { refreshDatasets } = useDatasetStore();

  const iconSize = "xs";
  const buttonColor = "secondary";
  const linkTarget = "_blank";

  const dataUploadOptions = [
    {
      icon: faMicrochip,
      title: "WebBLE Direct Connect",
      description: (
        <>
          Learn how to prepare your Arduino{" "}
          <a
            href="https://github.com/edge-ml/EdgeML-Arduino"
            target={linkTarget}
          >
            here
          </a>
          .
        </>
      ),
      buttonText: "Connect BLE Device",
      buttonAction: () => navigate("ble"),
    },
    {
      icon: faFile,
      title: "CSV File Upload",
      description: (
        <>
          Learn how to prepare your CSV file{" "}
          <a
            href="https://github.com/edge-ml/EdgeML-Arduino"
            target={linkTarget}
          >
            here
          </a>
          .
        </>
      ),
      buttonText: "Upload CSV Files",
      buttonAction: () => setCSVModalOpen(true),
    },
    {
      icon: faCode,
      title: "Library Upload",
      description: "Implement custom logic using edge-ml libraries.",
      buttonText: "Generate Code",
      buttonAction: () => navigate("settings/getCode"),
    },
    {
      icon: faMobileAlt,
      title: "Web Sensor API",
      description: "Collect sensor data from a smartphone in a browser.",
      buttonText: "Collect Web Sensor Data",
      buttonAction: () => navigate("uploadWeb"),
    },
  ];

  return (
    <div
      className="p-4 pt-4 pb-5 mb-4 data-upload-panel"
      style={{
        background: "linear-gradient(rgb(26, 32, 44), rgb(45, 55, 72))",
      }}
    >
      <div className="mt-2 mb-4" style={{ color: "white", opacity: 0.7 }}>
        <b>DATA UPLOAD</b>
      </div>

      {/* Render the Data Upload options */}
      <Row>
        {dataUploadOptions.map((option, index) => (
          <Col
            key={index}
            className="col-sm-6 col-xl-3 col-12 p-3 d-flex flex-row align-items-start justify-content-start"
            style={{ color: "white" }}
          >
            <div className="data-upload-icon">
              <FontAwesomeIcon icon={option.icon} size={iconSize} />
            </div>
            <div className="w-100 h-100 d-flex flex-column align-items-start justify-content-between">
              <div>
                <small>
                  <b>{option.title}</b>
                  <br />
                  {option.description}
                </small>
              </div>
              <Button
                id={`buttonUpload${option.title.replace(/ /g, "")}`}
                className="mt-2 btn-upload align-self-stretch align-self-md-start"
                color={buttonColor}
                onClick={option.buttonAction}
                style={{ padding: "0px" }}
              >
                <small>{option.buttonText}</small>
              </Button>
            </div>
          </Col>
        ))}
      </Row>
      <UploadDatasetModal
        isOpen={csvModalOpen}
        onCloseModal={() => setCSVModalOpen(false)}
        onDatasetComplete={refreshDatasets}
      />
    </div>
  );
};

export default DataUpload;
