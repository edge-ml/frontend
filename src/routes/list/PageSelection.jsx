import React from "react";
import { Pagination } from "@mantine/core";

const PageSelection = ({ currentPage, setPage, totalPages }) => {
  return (
    <div style={{ padding: "0 16px" }}>
      <Pagination value={currentPage} onChange={setPage} total={totalPages} />
    </div>
  );
};

export default PageSelection;
