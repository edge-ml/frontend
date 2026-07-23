import React, { useEffect, useState } from "react";
import { Notification } from "@mantine/core";
import { getModel } from "../../services/ApiServices/MlService";
import Loader from "../../modules/loader";
import SetUpBLEConnection from "./SetUpBLEConnection";
import LivePage from "./LivePage";
import LabelBadge from "../../components/Common/LabelBadge";

const ModelLivePage = ({ model_id }) => {
  const [model, setModel] = useState(undefined);
  const [bleDevice, setbleDevice] = useState(undefined);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    getModel(model_id).then((model) => {
      setModel(model);
    });
  }, []);

  const onDeviceDisconnect = () => {
    setBLEDevice(undefined);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const setBLEDevice = (bleDevice) => {
    setbleDevice(bleDevice);
  };

  if (!model) {
    return <Loader loading></Loader>;
  }
  return (
    <>
      {toastVisible ? (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Notification
            color="red"
            title="Warning!"
            onClose={() => setToastVisible(false)}
          >
            Device disconnected!
          </Notification>
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "100vh",
        }}
      >
        <div
          style={{
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
            paddingBottom: "0.5rem",
            paddingTop: "1rem",
          }}
        >
          <h4 style={{ fontWeight: 700 }}>{"LIVE MODEL"}</h4>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              margin: "0.5rem",
            }}
          >
            <div style={{ fontSize: "large", marginTop: "3rem" }}>
              <h5>
                <b>Use model:</b> {model.name}
              </h5>
              <div>
                <h5 style={{ display: "flex", alignItems: "center" }}>
                  <b>Labels in the model: </b>
                  {model.labels.map((elm) => (
                    <LabelBadge
                      key={elm._id}
                      style={{ margin: "0.25rem" }}
                      color={elm.color}
                    >
                      {elm.name}
                    </LabelBadge>
                  ))}
                </h5>
              </div>
            </div>
          </div>
          {bleDevice ? (
            <LivePage bleDevice={bleDevice} model={model}></LivePage>
          ) : (
            <SetUpBLEConnection
              model={model}
              setBLEDevice={setBLEDevice}
              onDeviceDisconnect={onDeviceDisconnect}
            ></SetUpBLEConnection>
          )}
        </div>
      </div>
    </>
  );
};

export default ModelLivePage;
