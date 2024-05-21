import { createContext, useState } from 'react';

const LabelingContext = createContext();

const LabelingProvider = ({ children, labelings }) => {
  const [activeLabeling, setActiveLabeling] = useState(labelings[0]);

  const disableSelectedLabelings = () => {
    setActiveLabeling(undefined);
  };

  return (
    <LabelingContext.Provider
      value={{
        activeLabeling,
        labelings,
        disableSelectedLabelings,
        setActiveLabeling,
      }}
    >
      {children}
    </LabelingContext.Provider>
  );
};

export { LabelingProvider, LabelingContext };
