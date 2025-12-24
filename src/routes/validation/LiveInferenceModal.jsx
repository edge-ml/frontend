/* global Module */

import {
  Alert,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Menu,
  Modal,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { SUPPORTED_SENSORS } from "../../services/WebSensorServices";
import { SensorList } from "../../components/SensorList/SensorList";
import { usePersistedState } from "../../services/ReactHooksService";
import { downloadDeploymentModel } from "../../services/ApiServices/MLDeploymentService";
import { downloadBlob } from "../../services/helpers";
import { useState, memo, useEffect } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { objMap } from "../../services/helpers";
import Checkbox from "../../components/Common/Checkbox";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mergeSingle = (replacer) => (key, value) => {
  replacer((prev) => ({ ...prev, [key]: value }));
};

const Th = (props) => <Table.Th {...props} style={{ borderTop: 0 }} />;
const Td = (props) => <Table.Td {...props} style={{ borderTop: 0 }} />;

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
    <Menu position="left-start" disabled={isDisabled}>
      <Menu.Target>
        <Badge color={componentTimeseries ? "blue" : "gray"} variant="light">
          {badgeText}
        </Badge>
      </Menu.Target>
      <Menu.Dropdown>
        {remainingTimeseries.map((tsName) => (
          <Menu.Item
            key={tsName}
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

    // tsName -> { sensor, component, shortComponent }
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
        model.id,
        "WASM",
        true,
        downloadSingleFile
      );
      downloadBlob(blob, filename);
    };

    return (
      <Box>
        <Grid>
          <Grid.Col span={12}>
            <Group className="header-wrapper" justify="center" align="center">
              <Text fw={700}>Configure Sensor / Timeseries Matching</Text>
            </Group>
            <Box className="body-wrapper-overflow">
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
            </Box>
          </Grid.Col>
        </Grid>
        <Grid mt="sm">
          <Grid.Col span={8}>
            <Group className="header-wrapper" justify="center" align="center">
              <Text fw={700}>Model Timeseries</Text>
            </Group>
            <Box className="body-wrapper-overflow">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Th>Timeseries</Th>
                    <Th>Sensor</Th>
                    <Th>Component</Th>
                    <Th></Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {model.timeSeries.map((name) => (
                    <Table.Tr key={name}>
                      <Td>
                        <Text fw={700}>{name}</Text>
                      </Td>
                      {legalMatches[name] ? (
                        <>
                          <Td>{legalMatches[name].sensor.name}</Td>
                          <Td>
                            <Badge>{legalMatches[name].shortComponent}</Badge>
                          </Td>
                          <Td>
                            <Button
                              color="danger"
                              variant="outline"
                              mr="md"
                              onClick={() => setMatch(name, null)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td
                            colSpan="3"
                            style={{ width: "100%", textAlign: "center" }}
                          >
                            Unset
                          </Td>
                        </>
                      )}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack align="flex-end" justify="flex-end" mt="sm">
              <Group align="center">
                <Checkbox
                  isSelected={downloadSingleFile}
                  onClick={(e) => {
                    setDownloadSingleFile(e.target.checked);
                  }}
                />
                <Text ml="xs">Single file</Text>
              </Group>
              <Button
                variant="outline"
                onClick={() => {
                  onDownloadWASM();
                }}
              >
                Download WASM
              </Button>
            <Button
              disabled={!legal}
              variant="outline"
              color="primary"
              onClick={() => onClassify(legalMatches)}
            >
              Live Classification
            </Button>
            </Stack>
          </Grid.Col>
        </Grid>
        {/* <Row>
        <Col>
          
        </Col>
      </Row> */}
      </Box>
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
      const blob = await downloadDeploymentModel(model.id, "WASM", true, true);

      blobURL = URL.createObjectURL(blob);
      // // This conflicts with webpack/cra (https://github.com/webpack/webpack/issues/6680)
      // // There are some workarounds, but they are bad, thje best would be using something like SystemJS
      // // but I could not get it working with webpack either, so script tag it is.

      // import(blobURL).then((Module) => {
      //
      // })

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

    // sensorData: Record<string, number>
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
          ...(sensor.properties.fixedFrequency
            ? {}
            : // : { frequency: this._sampleRates[sensor.name] }),
              {}), // TODO: tackle frequency here later
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
    <Box>
      <Grid>
        <Grid.Col span={6}>
          <Text>
            <Text component="span" fw={700}>
              WASM Blob:
            </Text>{" "}
            {wasmBlobLoaded ? "Downloaded." : "In progress..."}
          </Text>
          <Text>
            <Text component="span" fw={700}>
              Model Instance:
            </Text>{" "}
            {modelInstance ? "Loaded." : "In progress..."}
          </Text>
          <Box>
            <Text fw={700}>Sensor Matching:</Text>
            <Box component="ul">
              {sensorConfigs.map(({ sensor, matches }) => (
                <li key={sensor.name}>
                  {sensor.name}
                  <Box component="ul">
                    {matches.map(({ tsName, match }) => (
                      <li key={tsName}>
                        {match.shortComponent} → <b>{tsName}</b>
                      </li>
                    ))}
                  </Box>
                </li>
              ))}
            </Box>
          </Box>
        </Grid.Col>
        <Grid.Col span={6}>
          <Box>
            <Text fw={700}>Sensor Data:</Text>
            <Box component="ul">
              {sensorConfigs.map(({ sensor, matches }) => (
                <li key={sensor.name}>
                  {sensor.name}
                  <Box component="ul">
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
                  </Box>
                </li>
              ))}
            </Box>
          </Box>
          {clfRes !== null ? (
            <Text>
              <Text component="span" fw={700}>
                Classification:
              </Text>{" "}
              <Badge>
                {modelInstance.class_to_label(clfRes)} ({clfRes})
              </Badge>
            </Text>
          ) : null}
          {Object.entries(sensorErrors).map(([comp, { error, isWarning }]) => (
            <Alert key={comp} color={isWarning ? "yellow" : "red"}>
              <Text fw={700} component="span">
                {comp}
              </Text>
              : {error}
            </Alert>
          ))}
        </Grid.Col>
      </Grid>
      {/* <Row>
        <Col>
          <Button disabled={!legal} outline color="primary" className="float-right" onClick={onClassify}>Classify</Button>
        </Col>
      </Row> */}
    </Box>
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

    // classify

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
    <Modal opened={!!model} onClose={onClose} size="xl">
      <Title order={4}>Live Inference: {model.name}</Title>
      {renderedScreen}
      <Group justify="flex-end" mt="md">
        {page !== 1 ? (
          <Button variant="outline" color="blue" onClick={onGoBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onClose} variant="outline" color="red">
          Cancel
        </Button>
      </Group>
    </Modal>
  );
};

export default LiveInferenceModal;
