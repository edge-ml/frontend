import { Badge, Box, Group, NumberInput, Table, Text } from "@mantine/core";
import {
  useBootstrapMDBreakpoint,
  usePersistedState,
} from "../../services/ReactHooksService";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Checkbox from "../../components/Common/Checkbox";

import React from "react";

const Th = (props) => <Table.Th {...props} style={{ borderTop: 0 }} />;
const Td = (props) => <Table.Td {...props} style={{ borderTop: 0 }} />;

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
    "routes:uploadWeb:SensorList.collapseState"
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
                <Th>Sample Rate</Th>
                <Th>Components</Th>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Th />
              </React.Fragment>
            )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sensors.map(
            ({
              name,
              shortComponents,
              sampleRate,
              properties: { fixedFrequency },
            }) => {
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

              const badges = shortComponents.map((c) => (
                <Badge key={c} m="xs">
                  {c}
                </Badge>
              ));

              const toggleDetails = () =>
                setCollapseState((prevState) => ({
                  ...prevState,
                  [name]: !prevState[name],
                }));

              const tableVisibilityStyle = (name) => ({
                visibility: collapseState[name] ? "visible" : "collapse",
              });

              return (
                <React.Fragment key={name}>
                  <Table.Tr>
                    <Td>
                      <Checkbox
                        isSelected={selectedSensors[name]}
                        onClick={(e) => setSensor(name, !selectedSensors[name])}
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
                  </Table.Tr>
                  {isDesktop ? null : (
                    <React.Fragment>
                      <Table.Tr style={tableVisibilityStyle(name)}>
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
                      <Table.Tr style={tableVisibilityStyle(name)}>
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
            }
          )}
        </Table.Tbody>
      </Table>
    </React.Fragment>
  );
};
