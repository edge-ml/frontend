import { useState, useCallback, useEffect } from 'react';
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

export const useIncrement = () => {
  const [i, setI] = useState(0);
  return [i, () => setI(i + 1)];
};

export function useAsyncMemo(factory, deps, initial = undefined) {
  const [val, setVal] = useState(initial);
  useEffect(() => {
    let cancel = false;
    const promise = factory();
    if (promise === undefined || promise === null) return;
    promise.then(val => {
      if (!cancel) {
        setVal(val);
      }
    });
    return () => {
      cancel = true;
    };
  }, deps);
  return val;
}

export function useBoolean(defaultValue) {
  const [value, setValue] = useState(!!defaultValue);

  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);
  const toggle = () => setValue(x => !x);

  return [value, setTrue, setFalse, toggle];
}
