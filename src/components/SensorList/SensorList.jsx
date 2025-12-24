import { Badge, Group, NumberInput, Table, Text } from "@mantine/core";
import {
  useBootstrapMDBreakpoint,
  usePersistedState,
} from "../../services/ReactHooksService";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Checkbox from "../Common/Checkbox";

import React, { Component } from "react";

const Th = (props) => <Table.Th {...props} style={{ borderTop: 0 }} />;
const Td = (props) => <Table.Td {...props} style={{ borderTop: 0 }} />;

const BadgeSensorComponent = ({ shortComponent }) => (
  <Badge m="xs">{shortComponent}</Badge>
);

export const SensorList = ({
  sensors,
  selectedSensors,
  setSensor,
  setSensorRate,
  disabled = false,
  uiPersistentStateKey = "routes:uploadWeb:SensorList.collapseState",
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
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Th />
            <Th>Sensor</Th>
            {isDesktop ? (
              <React.Fragment>
                <Th style={{ whiteSpace: "nowrap" }}>Sample Rate</Th>
                <Th style={{ width: "100%" }}>Components</Th>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Th />
              </React.Fragment>
            )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sensors.map((sensor) => {
            const {
              name,
              shortComponents,
              components,
              sampleRate,
              properties: { fixedFrequency },
            } = sensor;

            const rateInput = (
              <Group gap="xs" align="center">
                <NumberInput
                  value={sampleRate}
                  onChange={(value) => setSensorRate(name, value)}
                  min={0}
                  max={50}
                  w={120}
                  size="xs"
                />
                <Text size="xs">Hz</Text>
              </Group>
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
              visibility: state ? "visible" : "collapse",
            });

            const displayStyle = (state, def = "table-cell") => ({
              display: state ? def : "none",
            });

            return (
              <React.Fragment key={name}>
                <Table.Tr>
                  <Td>
                    <Checkbox
                      isSelected={selectedSensors[name]}
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
                          width: "100%",
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
                </Table.Tr>
                {isDesktop ? null : (
                  <React.Fragment>
                    <Table.Tr style={visibilityStyle(collapseState[name])}>
                      <Td />
                      <Td colSpan="2">
                        <Group align="center" gap="xs">
                          <Text size="xs" fw={700}>
                            Sample Rate:
                          </Text>
                          {rateInput}
                        </Group>
                      </Td>
                    </Table.Tr>
                    <Table.Tr style={visibilityStyle(collapseState[name])}>
                      <Td />
                      <Td colSpan="2">
                        <Group align="center" gap="xs" wrap="wrap">
                          <Text size="xs" fw={700}>
                            Components:
                          </Text>
                          {badges}
                        </Group>
                      </Td>
                    </Table.Tr>
                  </React.Fragment>
                )}
              </React.Fragment>
            );
          })}
        </Table.Tbody>
      </Table>
    </React.Fragment>
  );
};
