import React, { useState } from "react";
import { Select, Text } from "@mantine/core";

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
    <>
      <Text fw={700} size="lg">
        5. Select Feature Extractor
      </Text>
      <Select
        data={featureExtractors.map((n) => n.name)}
        value={featureExtractors[featureExtractor_index]?.name ?? null}
        onChange={(value) => {
          const nextIdx = featureExtractors.findIndex((n) => n.name === value);
          if (nextIdx === -1) return;
          setFeatureExtractor_index(nextIdx);
          setFeatureExtractor(featureExtractors[nextIdx]);
        }}
        mt="sm"
        size="lg"
      />
    </>
  );
};

Select_FeatureExtractor.validate = () => {};

export default Select_FeatureExtractor;
