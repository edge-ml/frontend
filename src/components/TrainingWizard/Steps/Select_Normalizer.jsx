import React, { useState } from "react";
import { Select, Text } from "@mantine/core";

const Select_Normalizer = ({
  onBack,
  onNext,
  normalizer,
  setNormalizer,
  footer,
}) => {
  const [selectedNormalizer, setSelectedNormalizer] = useState(0);

  if (!normalizer.length) {
    return;
  }
  return (
    <>
      <Text fw={700} size="lg">
        6. Select Normalization
      </Text>
      <Select
        data={normalizer.map((n) => n.name)}
        value={normalizer[selectedNormalizer]?.name ?? null}
        onChange={(value) => {
          const nextIdx = normalizer.findIndex((n) => n.name === value);
          if (nextIdx === -1) return;
          setSelectedNormalizer(nextIdx);
          setNormalizer(normalizer[nextIdx]);
        }}
        mt="sm"
        size="lg"
      />
    </>
  );
};

Select_Normalizer.validate = () => {};

export default Select_Normalizer;
