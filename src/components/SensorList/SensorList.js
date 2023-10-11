import { Badge, Table, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import {
  useBootstrapMDBreakpoint,
  usePersistedState,
} from '../../services/ReactHooksService';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Checkbox from '../Common/Checkbox';

import React, { Component } from 'react';

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

const BadgeSensorComponent = ({ shortComponent }) => (
  <Badge className="m-1">{shortComponent}</Badge>
);

export const SensorList = ({
  sensors,
  selectedSensors,
  setSensor,
  setSensorRate,
  disabled = false,
  uiPersistentStateKey = 'routes:uploadWeb:SensorList.collapseState',
  renderSensorComponent = BadgeSensorComponent,
  onlyShowSelectedDetails = false,
}) => {
  const isDesktop = useBootstrapMDBreakpoint();
  const [collapseState, setCollapseState] = usePersistedState(
    {},
    uiPersistentStateKey
  );

  return (
    <React.Fragment>
      <Table responsive>
        <thead>
          <tr>
            <Th />
            <Th>Sensor</Th>
            {isDesktop ? (
              <React.Fragment>
                <Th style={{ whiteSpace: 'nowrap' }}>Sample Rate</Th>
                <Th style={{ width: '100%' }}>Components</Th>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Th />
              </React.Fragment>
            )}
          </tr>
        </thead>
        <tbody>
          {sensors.map((sensor) => {
            const {
              name,
              shortComponents,
              components,
              sampleRate,
              properties: { fixedFrequency },
            } = sensor;

            const rateInput = (
              <InputGroup style={{ margin: 0, minWidth: '90px' }} size="sm">
                <Input
                  value={sampleRate}
                  onChange={(e) => setSensorRate(name, e.target.value)}
                  type="number"
                  min={0}
                  max={50}
                ></Input>{' '}
                <InputGroupAddon addonType="append">Hz</InputGroupAddon>
              </InputGroup>
            );

            const badges = shortComponents.map((c, i) =>
              renderSensorComponent({
                shortComponent: c,
                component: components[i],
                sensor: sensor,
              })
            );

            const toggleDetails = () =>
              setCollapseState((prevState) => ({
                ...prevState,
                [name]: !prevState[name],
              }));

            const setDetails = (detailState) =>
              setCollapseState((prevState) => ({
                ...prevState,
                [name]: detailState,
              }));

            const areDetailsShownWhenOnlyShowSelectedDetails =
              onlyShowSelectedDetails && !selectedSensors[name];

            const visibilityStyle = (state) => ({
              visibility: state ? 'visible' : 'collapse',
            });

            const displayStyle = (state, def = 'table-cell') => ({
              display: state ? def : 'none',
            });

            return (
              <React.Fragment key={name}>
                <tr>
                  <Td>
                    {' '}
                    <Checkbox
                      isSelected={selectedSensors[name]}
                      className="position-relative ml-0"
                      onClick={(e) => {
                        setSensor(name, !selectedSensors[name]);
                        if (onlyShowSelectedDetails) {
                          setDetails(!selectedSensors[name]);
                        }
                      }}
                    />
                  </Td>
                  <Td>{name}</Td>
                  {isDesktop ? (
                    <React.Fragment>
                      <Td
                        style={visibilityStyle(
                          !areDetailsShownWhenOnlyShowSelectedDetails
                        )}
                      >
                        {fixedFrequency ? null : rateInput}
                      </Td>
                      <Td
                        style={{
                          ...displayStyle(
                            !areDetailsShownWhenOnlyShowSelectedDetails
                          ),
                          width: '100%',
                        }}
                      >
                        {badges}
                      </Td>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Td style={displayStyle(!onlyShowSelectedDetails)}>
                        <FontAwesomeIcon
                          icon={collapseState[name] ? faMinus : faPlus}
                          onClick={toggleDetails}
                        />
                      </Td>
                    </React.Fragment>
                  )}
                </tr>
                {isDesktop ? null : (
                  <React.Fragment>
                    <tr style={visibilityStyle(collapseState[name])}>
                      <Td className="p-0" />
                      <Td className="p-0" colSpan="2">
                        <div className="d-flex align-items-center">
                          <small>
                            <b>Sample Rate:</b>
                          </small>
                          {rateInput}
                        </div>
                      </Td>
                    </tr>
                    <tr style={visibilityStyle(collapseState[name])}>
                      <Td className="p-0" />
                      <Td className="p-0" colspan="2">
                        <div className="d-flex flex-wrap align-items-center">
                          <small>
                            <b>Components:</b>
                          </small>
                          {badges}
                        </div>
                      </Td>
                    </tr>
                  </React.Fragment>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </Table>
    </React.Fragment>
  );
};
