import { useState, useCallback } from 'react';
export const useSelect = (list, initialIndex = 0) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const setItem = useCallback(
    item => {
      setSelectedIndex(list.indexOf(item));
    },
    [list]
  );

  return {
    index: selectedIndex,
    item: list[selectedIndex],
    setIndex: setSelectedIndex,
    setItem,
    list
  };
};
