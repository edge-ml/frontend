/* global Module */

import {
  Modal,
  Button,
  Badge,
  Menu,
  Table,
  Alert,
  Loader,
} from "@mantine/core";
import { SUPPORTED_SENSORS } from "../../services/WebSensorServices";
import { SensorList } from "../../components/SensorList/SensorList";
import { usePersistedState } from "../../services/ReactHooksService";
import { downloadDeploymentModel } from "../../services/ApiServices/MLDeploymentService";
import { downloadBlob } from "../../services/helpers";
import { useState, memo, useEffect } from "react";
import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { objMap } from "../../services/helpers";
import Checkbox from "../../components/Common/Checkbox";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mergeSingle = (replacer) => (key, value) => {
  replacer((prev) => ({ ...prev, [key]: value }));
};

const TimeSeriesSelectingSensorComponent = ({
  shortComponent,
  component,
  sensor,
  onTimeseriesSelect,
  matches,
  timeseries,
}) => {
  const componentTimeseries = timeseries.find(
    (ts) =>
      matches[ts] &&
      matches[ts].component === component &&
      matches[ts].sensor.name === sensor.name
  );
  const remainingTimeseries = timeseries.filter((ts) => !matches[ts]);

  const badgeText = componentTimeseries
    ? `${shortComponent} → (${componentTimeseries})`
    : shortComponent;

  const isDisabled = componentTimeseries || remainingTimeseries.length === 0;

  return (
    <Menu disabled={isDisabled}>
      <Menu.Target>
        <Badge
          variant={componentTimeseries ? "filled" : "outline"}
          color={componentTimeseries ? "blue" : "gray"}
          size="sm"
          style={{
            cursor: isDisabled ? "default" : "pointer",
            margin: "0.25rem",
          }}
        >
          {badgeText}
        </Badge>
      </Menu.Target>
      <Menu.Dropdown>
        {remainingTimeseries.map((tsName) => (
          <Menu.Item
            onClick={() =>
              onTimeseriesSelect(tsName, {
                sensorName: sensor.name,
                component,
                shortComponent,
              })
            }
          >
            {tsName}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

const ScreenOne = memo(
  ({ model, onClassify }) => {
    const [downloadSingleFile, setDownloadSingleFile] = useState(false);

    const [selectedSensors, setSelectedSensors] = usePersistedState(
      {},
      "routes:validation:LiveInferenceModal.selectedSensors"
    );
    const [sensorRates, setSensorRates] = usePersistedState(
      SUPPORTED_SENSORS.reduce((acc, { name }) => {
        acc[name] = 50;
        return acc;
      }, {}),
      "routes:validation:LiveInferenceModal.sensorRates"
    );

    const [tsMatches, setTsMatches] = useState({});

    const sensors = SUPPORTED_SENSORS;

    const setMatch = (tsName, { sensorName, component, shortComponent }) => {
      setTsMatches((prev) => ({
        ...prev,
        [tsName]: {
          sensor: sensors.find((s) => s.name === sensorName),
          component,
          shortComponent,
        },
      }));
    };

    const legalMatches = objMap(tsMatches, (obj) =>
      obj && selectedSensors[obj.sensor.name] ? obj : null
    );

    const legal = model.timeSeries.reduce(
      (acc, tsName) => !!(acc && legalMatches[tsName]),
      true
    );

    const onDownloadWASM = async () => {
      const filename = `${model.name}_${"WASM"}.${
        downloadSingleFile ? "js" : "zip"
      }`;
      const blob = await downloadDeploymentModel(
        model._id,
        "WASM",
        true,
        downloadSingleFile
      );
      await downloadBlob(blob, filename);
    };

    return (
      <ModalBody>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <b>Configure Sensor / Timeseries Matching</b>
            </div>
            <div className="body-wrapper-overflow">
              <SensorList
                sensors={sensors.map((x) => ({
                  ...x,
                  sampleRate: sensorRates[x.name],
                }))}
                selectedSensors={selectedSensors}
                setSensor={mergeSingle(setSelectedSensors, selectedSensors)}
                setSensorRate={mergeSingle(setSensorRates, sensorRates)}
                uiPersistentStateKey="routes:validation:LiveInferenceModal.sensorList"
                onlyShowSelectedDetails={true}
                renderSensorComponent={({
                  shortComponent,
                  component,
                  sensor,
                }) => (
                  <TimeSeriesSelectingSensorComponent
                    {...{ shortComponent, component, sensor }}
                    matches={legalMatches}
                    timeseries={model.timeSeries}
                    onTimeseriesSelect={setMatch}
                  />
                )}
              />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div style={{ flex: 1, marginTop: "0.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
              }}
            >
              <b>Model Timeseries</b>
            </div>
            <div className="body-wrapper-overflow">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Timeseries</Table.Th>
                    <Table.Th>Sensor</Table.Th>
                    <Table.Th>Component</Table.Th>
                    <Table.Th></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {model.timeSeries.map((name) => (
                    <Table.Tr key={name}>
                      <Table.Td>
                        <b>{name}</b>
                      </Table.Td>
                      {legalMatches[name] ? (
                        <>
                          <Table.Td>{legalMatches[name].sensor.name}</Table.Td>
                          <Table.Td>
                            <Badge>{legalMatches[name].shortComponent}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Button
                              color="red"
                              size="sm"
                              onClick={() => setMatch(name, null)}
                            >
                              <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                            </Button>
                          </Table.Td>
                        </>
                      ) : (
                        <>
                          <Table.Td
                            colSpan={3}
                            style={{ width: "100%", textAlign: "center" }}
                          >
                            Unset
                          </Table.Td>
                        </>
                      )}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              marginTop: "0.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                marginBottom: "0.5rem",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: "0.5rem",
                }}
              >
                <Checkbox
                  isSelected={downloadSingleFile}
                  onClick={(e) => {
                    setDownloadSingleFile(e.target.checked);
                  }}
                />
                <span style={{ marginLeft: "0.25rem" }}>Single file</span>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  onDownloadWASM();
                }}
              >
                Download WASM
              </Button>
            </div>
            <Button
              disabled={!legal}
              variant="outline"
              color="blue"
              onClick={() => onClassify(legalMatches)}
            >
              Live Classification
            </Button>
          </div>
        </div>
      </ModalBody>
    );
  },
  (props, nextprops) => props.model === nextprops.model
);

const ScreenTwo = ({ model, legalMatches }) => {
  const [wasmBlobLoaded, setWASMBlobLoaded] = useState(false);
  const [sensorConfigs, setSensorConfigs] = useState([]);
  const [modelInstance, setModelInstance] = useState(null);
  const [sensorData, setSensorData] = useState({});
  const [clfRes, setClfRes] = useState(null);
  const [sensorErrors, setSensorErrors] = useState({});

  useEffect(() => {
    let blobURL = null;
    let script = null;

    const f = async () => {
      const blob = await downloadDeploymentModel(model._id, "WASM", true, true);

      blobURL = URL.createObjectURL(blob);

      if (typeof Module !== "undefined") {
        // eslint-disable-next-line no-global-assign
        Module = undefined;
      }

      script = document.createElement("script");
      script.src = blobURL;
      document.body.appendChild(script);

      while (typeof Module === "undefined") {
        await delay(100);
      }

      const instance = await Module();

      setWASMBlobLoaded(true);
      setModelInstance(instance);
    };
    f();

    return () => {
      if (script) {
        script.remove();
        // eslint-disable-next-line no-global-assign
        Module = undefined;
      }
      if (blobURL) URL.revokeObjectURL(blobURL);
    };
  }, [model]);

  useEffect(() => {
    if (!legalMatches) {
      return null;
    }

    const sensorNames = [
      ...new Set(Object.values(legalMatches).map(({ sensor }) => sensor.name)),
    ];
    let sensorConfigs = [];
    for (const sensorName of sensorNames) {
      const matches = Object.entries(legalMatches)
        .filter(([_, { sensor: s }]) => s.name === sensorName)
        .map(([tsName, match]) => ({ tsName, match }));
      sensorConfigs.push({
        sensor: matches[0].match.sensor,
        matches: matches,
      });
    }

    const onSensorData = (config) => (newData) => {
      setSensorData((prev) => ({
        ...prev,
        [config.sensor.name]: { sensorName: config.sensor.name, data: newData },
      }));
    };

    const onSensorError =
      (sensor, isWarning = false) =>
      (error) => {
        setSensorErrors((prev) => ({
          ...prev,
          [sensor.name]: { error, isWarning },
        }));
      };

    setSensorConfigs(sensorConfigs);

    const f = async () => {
      for (const config of sensorConfigs) {
        const sensor = config.sensor;

        sensor.removeAllListeners();

        sensor.on("warn", onSensorError(sensor, true));
        sensor.on("error", onSensorError(sensor));
        sensor.on("data", onSensorData(config));
        await sensor.listen({
          ...(sensor.properties.fixedFrequency ? {} : {}),
        });
      }
    };
    f();

    return () => {
      for (const config of sensorConfigs) {
        const sensor = config.sensor;
        sensor.stop();
        sensor.removeAllListeners();
      }
    };
  }, [legalMatches]);

  useEffect(() => {
    if (modelInstance) {
      const payload = model.timeSeries.map((tsName) => {
        const match = legalMatches[tsName];
        const sensorName = match.sensor.name;
        return sensorData[sensorName]?.data[match.component];
      });

      if (!payload.includes(undefined)) {
        modelInstance.add_datapoint(...payload);
        const prediction = modelInstance.predict();
        setClfRes(prediction);
      }
    }
  }, [legalMatches, model.timeSeries, modelInstance, sensorData]);

  if (!legalMatches) {
    return null;
  }

  return (
    <ModalBody>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div>
            <b>WASM Blob:</b>{" "}
            {wasmBlobLoaded ? "Downloaded." : "In progress..."}
          </div>
          <div>
            <b>Model Instance:</b>{" "}
            {modelInstance ? "Loaded." : "In progress..."}
          </div>
          <div>
            <b>Sensor Matching:</b>
            <ul>
              {sensorConfigs.map(({ sensor, matches }) => (
                <li key={sensor.name}>
                  {sensor.name}
                  <ul>
                    {matches.map(({ tsName, match }) => (
                      <li key={tsName}>
                        {match.shortComponent} → <b>{tsName}</b>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div>
            <b>Sensor Data:</b>
            <ul>
              {sensorConfigs.map(({ sensor, matches }) => (
                <li key={sensor.name}>
                  {sensor.name}
                  <ul>
                    {matches
                      .map(({ match }) => (
                        <li key={match.shortComponent}>
                          {match.shortComponent} →{" "}
                          <b>
                            {sensorData[sensor.name]?.data[match.component]}
                          </b>
                        </li>
                      ))
                      .filter((x) => x)}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          {clfRes !== null ? (
            <div>
              <b>Classification:</b>{" "}
              <Badge>
                {modelInstance.class_to_label(clfRes)} ({clfRes})
              </Badge>
            </div>
          ) : null}
          {Object.entries(sensorErrors).map(([comp, { error, isWarning }]) => (
            <Alert color={isWarning ? "yellow" : "red"} key={comp}>
              <strong>{comp}</strong>: {error}
            </Alert>
          ))}
        </div>
      </div>
    </ModalBody>
  );
};

const LiveInferenceModal = ({ model, onClose: onCloseOrig }) => {
  const [page, setPage] = useState(1);

  const [legalMatches, setLegalMatches] = useState(null);

  if (!model) {
    return null;
  }

  const onGoBack = () => {
    setPage(1);
    setLegalMatches(null);
  };

  const onClose = () => {
    setPage(1);
    setLegalMatches(null);
    return onCloseOrig();
  };

  const onClassify = (legalMatches) => {
    const legal = model.timeSeries.reduce(
      (acc, tsName) => !!(acc && legalMatches[tsName]),
      true
    );

    if (!legal) {
      return;
    }

    setLegalMatches(legalMatches);
    setPage(2);
  };

  let renderedScreen = null;
  switch (page) {
    case 1:
      renderedScreen = <ScreenOne model={model} onClassify={onClassify} />;
      break;
    case 2:
      renderedScreen = <ScreenTwo model={model} legalMatches={legalMatches} />;
      break;
    default:
      renderedScreen = null;
  }

  return (
    <Modal isOpen={model} size="xl">
      <Modal.Header>
        <Modal.Title>Live Inference: {model.name}</Modal.Title>
      </Modal.Header>
      {renderedScreen}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.5rem",
          marginTop: "1rem",
          padding: "1rem",
        }}
      >
        {page !== 1 ? (
          <Button variant="outline" color="blue" onClick={onGoBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onClose} variant="outline" color="red">
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default LiveInferenceModal;
