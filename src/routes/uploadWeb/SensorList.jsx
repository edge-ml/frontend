import { Badge, Table, TextInput } from "@mantine/core";
import {
  useBootstrapMDBreakpoint,
  usePersistedState,
} from "../../services/ReactHooksService";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Checkbox from "../../components/Common/Checkbox";

import React from "react";

const Th = (props) => (
  <Table.Th
    {...props}
  />
);
const Td = (props) => (
  <Table.Td
    {...props}
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
    "routes:uploadWeb:SensorList.collapseState"
  );

  return (
    <>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Th />
            <Th>Sensor</Th>
            {isDesktop ? (
              <>
                <Th>Sample Rate</Th>
                <Th>Components</Th>
              </>
            ) : (
              <>
                <Th />
              </>
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
                <TextInput
                  value={sampleRate}
                  onChange={(e) => setSensorRate(name, e.target.value)}
                  type="number"
                  min={0}
                  max={50}
                  rightSection="Hz"
                  size="sm"
                  style={{ margin: 0, minWidth: "90px" }}
                />
              );

              const badges = shortComponents.map((c) => (
                <Badge style={{ margin: "0.25rem" }}>{c}</Badge>
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
                      {" "}
                      <Checkbox
                        isSelected={selectedSensors[name]}
                        onClick={(e) => setSensor(name, !selectedSensors[name])}
                      />
                    </Td>
                    <Td>{name}</Td>
                    {isDesktop ? (
                      <>
                        <Td>{fixedFrequency ? null : rateInput}</Td>
                        <Td>{badges}</Td>
                      </>
                    ) : (
                      <>
                        <Td>
                          <FontAwesomeIcon
                            icon={collapseState[name] ? faMinus : faPlus}
                            onClick={toggleDetails}
                          />
                        </Td>
                      </>
                    )}
                  </Table.Tr>
                  {isDesktop ? null : (
                    <>
                      <Table.Tr style={tableVisibilityStyle(name)}>
                        <Td style={{ padding: 0 }} />
                        <Td style={{ padding: 0 }} colSpan={2}>
                          <div style={{ display: "flex", alignItems: "center", paddingRight: "1rem" }}>
                            <small>
                              <b>Sample Rate:</b>
                            </small>
                            {rateInput}
                          </div>
                        </Td>
                      </Table.Tr>
                      <Table.Tr style={tableVisibilityStyle(name)}>
                        <Td style={{ padding: 0 }} />
                        <Td style={{ padding: 0 }} colSpan={2}>
                          <div
                            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
                          >
                            <small>
                              <b>Components:</b>
                            </small>
                            {badges}
                          </div>
                        </Td>
                      </Table.Tr>
                    </>
                  )}
                </React.Fragment>
              );
            }
          )}
        </Table.Tbody>
      </Table>
    </>
  );
};
