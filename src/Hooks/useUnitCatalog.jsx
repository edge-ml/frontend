import { useEffect, useState } from "react";
import { getUnitCatalog } from "../services/ApiServices/MlService";

// The catalog is static reference data, so it is fetched once per page load.
let catalogPromise = null;

const loadCatalog = () => {
  if (!catalogPromise) {
    catalogPromise = getUnitCatalog().catch((e) => {
      catalogPromise = null;
      throw e;
    });
  }
  return catalogPromise;
};

const useUnitCatalog = () => {
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    let active = true;
    loadCatalog()
      .then((res) => active && setCatalog(res))
      .catch((e) => console.error("Could not load the unit catalog", e));
    return () => {
      active = false;
    };
  }, []);

  return catalog;
};

export default useUnitCatalog;
