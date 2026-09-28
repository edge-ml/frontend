import React, { useState, Fragment } from "react";
import { Menu, Button } from "@mantine/core";

const Select_Normalizer = ({
  onBack,
  onNext,
  normalizer,
  setNormalizer,
  footer,
}) => {
  const [selectedNormalizer, setSelectedNormalizer] = useState(0);

  if (!normalizer.length) {
    return null;
  }
  return (
    <Fragment>
      <h3 style={{ fontWeight: 700 }}>6. Select Normalization</h3>
      <Menu>
        <Menu.Target>
          <Button size="lg">{normalizer[selectedNormalizer].name}</Button>
        </Menu.Target>
        <Menu.Dropdown>
          {normalizer.map((n, idx) => (
            <Menu.Item
              key={n.name}
              onClick={() => {
                setSelectedNormalizer(idx);
                setNormalizer(normalizer[idx]);
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

Select_Normalizer.validate = () => {};

export default Select_Normalizer;
