import { useState, useEffect } from "react";
import {
  getDatasetsPagination,
  updateDataset as updateDataset_api,
  deleteDataset as deleteDatasets_api,
} from "../services/ApiServices/DatasetServices";

const usePaginatedDatasets = () => {
  const [datasets, setDatasets] = useState(undefined);
  const [page, setPageInternal] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tableLenth] = useState(20);
  const [sorting, setSortingInternal] = useState("alphaAsc");

  const _refreshDatasets = async (page, tableLenth, sorting) => {
    try {
      const datasets = await getDatasetsPagination(
        (page - 1) * tableLenth,
        tableLenth * page,
        sorting
      );
      setDatasets(datasets.datasets);
      setTotalPages(Math.ceil(datasets.total_datasets / tableLenth));
    } catch (error) {
      console.error("[usePaginatedDatasets] Failed to load datasets:", error);
      // Keep any data we already have, but never leave the page stuck on its
      // loading state when the first request fails.
      setDatasets((previous) => previous ?? []);
    }
  };

  useEffect(() => {
    _refreshDatasets(page, tableLenth, sorting);
  }, [page]);

  const setPage = (page) => {
    let newPage = Math.max(1, Math.min(page, totalPages));
    setPageInternal(newPage);
  };

  const setSorting = async (sorting) => {
    setSortingInternal(sorting);
    setPage(1);
    await _refreshDatasets(1, tableLenth, sorting);
  };

  const updateDataset = async (dataset) => {
    await updateDataset_api(dataset);
    await _refreshDatasets(page, tableLenth, sorting);
  };

  const deleteDatasets = async (datasets) => {
    await Promise.all(datasets.map((elm) => deleteDatasets_api(elm)));
    await _refreshDatasets(1, tableLenth, sorting);
  };

  const refreshDatasets = () => {
    _refreshDatasets(1, tableLenth, sorting);
  };

  return {
    datasets,
    page,
    totalPages,
    setPage,
    refreshDatasets,
    sorting,
    setSorting,
    updateDataset,
    deleteDatasets,
  };
};

export default usePaginatedDatasets;
