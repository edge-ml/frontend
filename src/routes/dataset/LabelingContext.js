import { createContext, useState } from 'react';

const LabelingContext = createContext();

const LabelingProvider = ({ children, labelings }) => {
  const [activeLabeling, setActiveLabelings] = useState(labelings[0]);

  return (
    <LabelingContext.Provider value={{ activeLabeling, labelings }}>
      {children}
    </LabelingContext.Provider>
  );
};

export { LabelingProvider, LabelingContext };
