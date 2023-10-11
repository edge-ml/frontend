import { Modal, ModalFooter, ModalBody, ModalHeader, Button } from 'reactstrap';
import { SUPPORTED_SENSORS } from '../../services/WebSensorServices';
import { SensorList } from '../../components/SensorList/SensorList';
import { usePersistedState } from '../../services/ReactHooksService';
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
import { useState } from 'react';
import { faCross, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { objMap } from '../../services/helpers';

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
              onTimeseriesSelect(tsName, { sensor, component, shortComponent })
            }
          >
            {tsName}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

const LiveInferenceModal = ({ model, onClose }) => {
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

  if (!model) {
    return null;
  }

  const sensors = SUPPORTED_SENSORS;

  const setMatch = mergeSingle(setTsMatches, tsMatches);

  const legalMatches = objMap(tsMatches, (triplet) =>
    triplet && selectedSensors[triplet.sensor.name] ? triplet : null
  );

  return (
    <Modal isOpen={model} size="xl">
      <ModalHeader>Live Inference: {model.name}</ModalHeader>
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
          <Col className="mt-2"></Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  );
};

export default LiveInferenceModal;
