import React from "react";
import { useState, Fragment } from "react";
import { Menu, Button } from "@mantine/core";

const Select_FeatureExtractor = ({
  onBack,
  onNext,
  featureExtractors,
  setFeatureExtractor,
  footer,
}) => {
  const [featureExtractor_index, setFeatureExtractor_index] = useState(0);

  if (featureExtractors.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <h3 style={{ fontWeight: 700 }}>5. Select Feature Extractor</h3>
      <Menu>
        <Menu.Target>
          <Button size="lg">
            {featureExtractors[featureExtractor_index].name}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {featureExtractors.map((n, idx) => (
            <Menu.Item
              key={n.name}
              onClick={() => {
                setFeatureExtractor_index(idx);
                setFeatureExtractor(featureExtractors[idx]);
              }}
            >
              {n.name}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Fragment>
  );
};

Select_FeatureExtractor.validate = () => {};

export default Select_FeatureExtractor;
