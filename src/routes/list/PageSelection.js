import React, { useEffect, useState } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';

const PageSelection = ({
  pageSize,
  datasetCount,
  goToPage,
  goToNextPage,
  goToLastPage,
  currentPage,
}) => {
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    setNumPages(Math.ceil(datasetCount / pageSize));
  }, [datasetCount]);

  return numPages > 1 ? (
    <div className="pagination-container">
      <Pagination>
        <PaginationItem disabled={currentPage <= 0}>
          <PaginationLink onClick={goToLastPage} previous />
        </PaginationItem>
        {[...Array(Math.ceil(datasetCount / pageSize))].map((page, index) => {
          return (
            <PaginationItem active={index == currentPage} key={index}>
              <PaginationLink onClick={() => goToPage(index)}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem
          disabled={currentPage === Math.ceil(datasetCount / pageSize) - 1}
        >
          <PaginationLink onClick={goToNextPage} next />
        </PaginationItem>
      </Pagination>
    </div>
  ) : null;
};

export default PageSelection;
