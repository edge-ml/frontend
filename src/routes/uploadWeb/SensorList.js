import { Badge, Table, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import {
  useBootstrapMDBreakpoint,
  usePersistedState,
} from '../../services/ReactHooksService';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import React from 'react';

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

export const SensorList = ({
  sensors,
  selectedSensors,
  setSensor,
  setSensorRate,
  disabled = false,
}) => {
  const isDesktop = useBootstrapMDBreakpoint();
  const [collapseState, setCollapseState] = usePersistedState(
    {},
    'routes:uploadWeb:SensorList.collapseState'
  );

  return (
    <Table responsive>
      <thead>
        <tr>
          <Th />
          <Th>Sensor</Th>
          {isDesktop ? (
            <React.Fragment>
              <Th>Sample Rate</Th>
              <Th>Components</Th>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Th />
            </React.Fragment>
          )}
        </tr>
      </thead>
      <tbody>
        {sensors.map(
          ({
            name,
            shortComponents,
            sampleRate,
            properties: { fixedFrequency },
          }) => {
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

            const badges = shortComponents.map((c) => (
              <Badge className="m-1">{c}</Badge>
            ));

            const toggleDetails = () =>
              setCollapseState((prevState) => ({
                ...prevState,
                [name]: !prevState[name],
              }));

            const tableVisibilityStyle = (name) => ({
              visibility: collapseState[name] ? 'visible' : 'collapse',
            });

            return (
              <React.Fragment key={name}>
                <tr>
                  <Td>
                    {' '}
                    <Input
                      onChange={(e) => setSensor(name, !selectedSensors[name])}
                      className="position-relative ml-0"
                      checked={selectedSensors[name]}
                      type="checkbox"
                    />
                  </Td>
                  <Td>{name}</Td>
                  {isDesktop ? (
                    <React.Fragment>
                      <Td>{fixedFrequency ? null : rateInput}</Td>
                      <Td>{badges}</Td>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Td>
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
                    <tr style={tableVisibilityStyle(name)}>
                      <Td className="p-0" />
                      <Td className="p-0" colspan="2">
                        <div className="d-flex align-items-center">
                          <small>
                            <b>Sample Rate:</b>
                          </small>
                          {rateInput}
                        </div>
                      </Td>
                    </tr>
                    <tr style={tableVisibilityStyle(name)}>
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
          }
        )}
      </tbody>
    </Table>
  );
};
