import React, { useState, useEffect } from "react";
import { getDatasetsPagination } from "../services/ApiServices/DatasetServices";

const usePaginatedDatasets = (initialPage) => {
  const [datasets, setDatasets] = useState(undefined);
  const [page, setPageInternal] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [tableLenth, setTableLength] = useState(3);

  const refreshDatasets = async () => {
    const datasets = await getDatasetsPagination(
      (page - 1) * tableLenth,
      tableLenth * page
    );
    setDatasets(datasets.datasets);
    setTotalPages(datasets.total_datasets);
  };

  useEffect(() => {
    refreshDatasets();
  }, [page]);

  const setPage = (page) => {
    let newPage = Math.max(1, Math.min(page, totalPages));
    setPageInternal(newPage);
  };

  return { datasets, page, totalPages, setPage, refreshDatasets };
};

export default usePaginatedDatasets;
