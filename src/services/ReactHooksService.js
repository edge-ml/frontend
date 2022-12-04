import { useState, useCallback, useEffect } from 'react';
export const useSelect = (list, initialIndex = 0) => {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const setItem = useCallback(
    (item) => {
      setSelectedIndex(list.indexOf(item));
    },
    [list]
  );

  return {
    index: selectedIndex,
    item: list[selectedIndex],
    setIndex: setSelectedIndex,
    setItem,
    list,
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
    promise.then((val) => {
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
  const toggle = () => setValue((x) => !x);

  return [value, setTrue, setFalse, toggle];
}

export function useMediaQuery(query) {
  const getMatches = (query) => {
    // Prevents SSR issues
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState(getMatches(query));

  function handleChange() {
    setMatches(getMatches(query));
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Listen matchMedia
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener('change', handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener('change', handleChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}

export const useBootstrapMDBreakpoint = () =>
  useMediaQuery('(min-width: 768px)');

// https://levelup.gitconnected.com/react-localstorage-persisting-state-with-a-custom-hook-98f9a88ae7a9
export const usePersistedState = (defaultValue, localStorageKey) => {
  const [value, setValue] = useState(() => {
    const localStorageItem = localStorage.getItem(localStorageKey);
    if (localStorageItem === null) return defaultValue;
    try {
      return JSON.parse(localStorageItem);
    } catch (err) {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(value));
  }, [value]);

  // Expose the value and the updater function.
  return [value, setValue];
};
