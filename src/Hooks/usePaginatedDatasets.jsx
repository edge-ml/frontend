import React, { useState, useEffect } from "react";
import { getDatasetsPagination } from "../services/ApiServices/DatasetServices";

const usePaginatedDatasets = (initialPage) => {
  const [datasets, setDatasets] = useState(undefined);
  const [page, setPageInternal] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [tableLenth, setTableLength] = useState(20);
  const [sorting, setSortingInternal] = useState("alphaAsc");

  const refreshDatasets = async (page, tableLenth, sorting) => {
    const datasets = await getDatasetsPagination(
      (page - 1) * tableLenth,
      tableLenth * page,
      sorting
    );
    setDatasets(datasets.datasets);
    setTotalPages(Math.ceil(datasets.total_datasets / tableLenth));
  };

  useEffect(() => {
    refreshDatasets(page, tableLenth, sorting);
  }, [page]);

  const setPage = (page) => {
    let newPage = Math.max(1, Math.min(page, totalPages));
    setPageInternal(newPage);
  };

  const setSorting = (sorting) => {
    setSortingInternal(sorting);
    setPage(1);
    refreshDatasets(1, tableLenth, sorting);
  };

  return {
    datasets,
    page,
    totalPages,
    setPage,
    refreshDatasets,
    sorting,
    setSorting,
  };
};

export default usePaginatedDatasets;
