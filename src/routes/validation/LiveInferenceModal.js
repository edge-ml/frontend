/* global Module */

import { Modal, ModalFooter, ModalBody, ModalHeader, Button } from 'reactstrap';
import { SUPPORTED_SENSORS } from '../../services/WebSensorServices';
import { SensorList } from '../../components/SensorList/SensorList';
import { usePersistedState } from '../../services/ReactHooksService';
import { downloadDeploymentModel } from '../../services/ApiServices/MLDeploymentService';
import { downloadBlob } from '../../services/helpers';
import {
  Badge,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Row,
  Col,
  Table,
} from 'reactstrap';
import { useState, memo, useEffect } from 'react';
import { faCross, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { objMap } from '../../services/helpers';
import Checkbox from '../../components/Common/Checkbox';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mergeSingle = (replacer) => (key, value) => {
  replacer((prev) => ({ ...prev, [key]: value }));
};

const Th = (props) => (
  <th
    {...props}
    className={'border-top-0 ' + (props.className ? props.className : '')}
  />
);
const Td = (props) => (
  <td
    {...props}
    className={'border-top-0 ' + (props.className ? props.className : '')}
  />
);

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

  const badgeClass = `m-1 badge badge-${
    componentTimeseries ? 'primary' : 'secondary'
  }`;
  const badgeText = componentTimeseries
    ? `${shortComponent} → (${componentTimeseries})`
    : shortComponent;

  const isDisabled = componentTimeseries || remainingTimeseries.length === 0;

  return (
    <UncontrolledDropdown
      direction="left"
      style={{ position: 'relative', padding: 0, display: 'inline-block' }}
      disabled={isDisabled}
    >
      <DropdownToggle
        caret={!isDisabled}
        size="sm"
        className={badgeClass}
        tag={'span'}
      >
        {badgeText}
      </DropdownToggle>
      <DropdownMenu>
        {remainingTimeseries.map((tsName) => (
          <DropdownItem
            onClick={() =>
              onTimeseriesSelect(tsName, {
                sensorName: sensor.name,
                component,
                shortComponent,
              })
            }
          >
            {tsName}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

const ScreenOne = memo(
  ({ model, onClassify }) => {
    const [downloadSingleFile, setDownloadSingleFile] = useState(false);

    const [selectedSensors, setSelectedSensors] = usePersistedState(
      {},
      'routes:validation:LiveInferenceModal.selectedSensors'
    );
    const [sensorRates, setSensorRates] = usePersistedState(
      SUPPORTED_SENSORS.reduce((acc, { name }) => {
        acc[name] = 50;
        return acc;
      }, {}),
      'routes:validation:LiveInferenceModal.sensorRates'
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
      const filename = `${model.name}_${'WASM'}.${
        downloadSingleFile ? 'js' : 'zip'
      }`;
      const blob = await downloadDeploymentModel(
        model._id,
        'WASM',
        true,
        downloadSingleFile
      );
      downloadBlob(blob, filename);
    };

    return (
      <ModalBody>
        <Row>
          <Col>
            <div className="header-wrapper d-flex justify-content-center align-content-center">
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
          </Col>
        </Row>
        <Row>
          <Col className="mt-2">
            <div className="header-wrapper d-flex justify-content-center align-content-center">
              <b>Model Timeseries</b>
            </div>
            <div className="body-wrapper-overflow">
              <Table>
                <thead>
                  <tr>
                    <Th>Timeseries</Th>
                    <Th>Sensor</Th>
                    <Th>Component</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {model.timeSeries.map((name) => (
                    <tr>
                      <Td>
                        <b>{name}</b>
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
                              className="btn-edit mr-3 mr-md-4"
                              onClick={() => setMatch(name, null)}
                            >
                              <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
                            </Button>
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td
                            colspan="3"
                            style={{ width: '100%', textAlign: 'center' }}
                          >
                            Unset
                          </Td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
          <Col className="mt-2 d-flex flex-column justify-content-end align-items-end">
            <div className="mb-2 d-flex justify-content-end align-items-center">
              <div className="d-flex justify-content-center align-items-center mr-2">
                <Checkbox
                  isSelected={downloadSingleFile}
                  onClick={(e) => {
                    setDownloadSingleFile(e.target.checked);
                  }}
                />
                <span className="ml-1">Single file</span>
              </div>
              <Button
                outline
                className=""
                onClick={() => {
                  onDownloadWASM();
                }}
              >
                Download WASM
              </Button>
            </div>
            <Button
              disabled={!legal}
              outline
              color="primary"
              className=""
              onClick={() => onClassify(legalMatches)}
            >
              Live Classification
            </Button>
          </Col>
        </Row>
        {/* <Row>
        <Col>
          
        </Col>
      </Row> */}
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

  useEffect(() => {
    let blobURL = null;
    let script = null;

    const f = async () => {
      const blob = await downloadDeploymentModel(model._id, 'WASM', true, true);

      blobURL = URL.createObjectURL(blob);
      // // This conflicts with webpack/cra (https://github.com/webpack/webpack/issues/6680)
      // // There are some workarounds, but they are bad, thje best would be using something like SystemJS
      // // but I could not get it working with webpack either, so script tag it is.

      // import(blobURL).then((Module) => {
      //   console.log(Module);
      // })

      if (typeof Module !== 'undefined') {
        // eslint-disable-next-line no-global-assign
        Module = undefined;
      }

      script = document.createElement('script');
      script.src = blobURL;
      document.body.appendChild(script);

      while (typeof Module === 'undefined') {
        await delay(100);
      }

      console.log('emscripten Module', Module);
      const instance = await Module();
      console.log(instance);

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

    console.log('sensor configgggggs', sensorConfigs);
    setSensorConfigs(sensorConfigs);

    const f = async () => {
      for (const config of sensorConfigs) {
        const sensor = config.sensor;
        console.log('sensor', sensor);
        sensor.removeAllListeners();

        // sensor.on('warn', this._onSensorError(sensor, true));
        // sensor.on('error', this._onSensorError(sensor));
        sensor.on('data', onSensorData(config));
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
        modelInstance._add_datapoint(...payload);
        const prediction = modelInstance._predict();
        setClfRes(prediction);
      }
    }
  }, [legalMatches, model.timeSeries, modelInstance, sensorData]);

  if (!legalMatches) {
    return null;
  }

  console.log(legalMatches, model);

  return (
    <ModalBody>
      <Row>
        <Col>
          <div>
            <b>WASM Blob:</b>{' '}
            {wasmBlobLoaded ? 'Downloaded.' : 'In progress...'}
          </div>
          <div>
            <b>Model Instance:</b>{' '}
            {!!modelInstance ? 'Loaded.' : 'In progress...'}
          </div>
          <div>
            <b>Sensor Matching:</b>
            <ul>
              {sensorConfigs.map(({ sensor, matches }) => (
                <li>
                  {sensor.name}
                  <ul>
                    {matches.map(({ tsName, match }) => (
                      <li>
                        {match.shortComponent} → <b>{tsName}</b>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </Col>
        <Col>
          <div>
            <b>Sensor Data:</b>
            <ul>
              {sensorConfigs.map(({ sensor, matches }) => (
                <li>
                  {sensor.name}
                  <ul>
                    {matches
                      .map(({ match }) => (
                        <li>
                          {match.shortComponent} →{' '}
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
              <b>Classification:</b>{' '}
              <Badge>
                {model.pipeline.labels[clfRes]} ({clfRes})
              </Badge>
            </div>
          ) : null}
        </Col>
      </Row>
      {/* <Row>
        <Col>
          <Button disabled={!legal} outline color="primary" className="float-right" onClick={onClassify}>Classify</Button>
        </Col>
      </Row> */}
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

    // classify
    console.log('classify', legalMatches);
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
      <ModalHeader>Live Inference: {model.name}</ModalHeader>
      {renderedScreen}
      <ModalFooter>
        {page !== 1 ? (
          <Button outline color="primary" onClick={onGoBack}>
            Back
          </Button>
        ) : null}
        <Button onClick={onClose} outline color="danger">
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default LiveInferenceModal;
