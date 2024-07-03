import React from "react";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const PageSelection = ({ currentPage, setPage, totalPages }) => {
  const onClick = () => {
    setPage(currentPage);
  };

  return (
    <Pagination>
      <PaginationItem onClick={() => setPage(1)}>
        <PaginationLink first href="#" />
      </PaginationItem>
      <PaginationItem onClick={() => setPage(currentPage - 1)}>
        <PaginationLink href="#" previous />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink>{currentPage + "/" + totalPages}</PaginationLink>
      </PaginationItem>
      <PaginationItem onClick={() => setPage(currentPage + 1)}>
        <PaginationLink href="#" next />
      </PaginationItem>
      <PaginationItem onClick={() => setPage(Number.MAX_SAFE_INTEGER)}>
        <PaginationLink href="#" last />
      </PaginationItem>
    </Pagination>
  );
};

export default PageSelection;
