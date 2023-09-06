import React, { useEffect, useState } from 'react';
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import './PageSelection.css';

const PageSelection = ({
  pageSize,
  datasetCount,
  goToPage,
  goToNextPage,
  goToLastPage,
  currentPage,
  goToPreviousPage,
  goToFirstPage,
}) => {
  const [numPages, setNumPages] = useState(0);
  //determines how many pages are shown in a row, before the shortended pagination is used
  const maxFullSize = 6;

  useEffect(() => {
    setNumPages(Math.ceil(datasetCount / pageSize));
  }, [datasetCount, pageSize]);

  const generateNumbersArray = (m, n) => {
    return Array.from({ length: n - m + 1 }, (_, index) => m + index);
  };

  const fullPagination = () => {
    return getPaginationItems(generateNumbersArray(0, numPages - 1));
  };

  const getPaginationItems = (numbersArray) => {
    return numbersArray.map((page, index) => {
      return (
        <PaginationItem active={page === currentPage} key={page}>
          <PaginationLink onClick={() => goToPage(page)}>
            {page + 1}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  const getEllipsisItem = () => {
    return (
      <PaginationItem disabled>
        <PaginationLink>...</PaginationLink>
      </PaginationItem>
    );
  };

  //always show two previous and next items in addition to first and last item when size is larger than 10
  //prevents overflow of pagination bar when screen is not wide enough
  const shortenedPagination = () => {
    const items = [];
    if (numPages === 1) {
      items.push(getPaginationItems([0]));
    } else if (currentPage <= 2) {
      items.push(getPaginationItems(generateNumbersArray(0, 2)));
      items.push(getEllipsisItem());
      items.push(getPaginationItems([numPages - 1]));
    } else if (currentPage >= numPages - 3) {
      items.push(getPaginationItems([0]));
      items.push(getEllipsisItem());
      items.push(
        getPaginationItems(generateNumbersArray(numPages - 3, numPages - 1))
      );
    } else {
      items.push(getPaginationItems([0]));
      items.push(getEllipsisItem());
      items.push(
        getPaginationItems(
          generateNumbersArray(currentPage - 1, currentPage + 1)
        )
      );
      items.push(getEllipsisItem());
      items.push(getPaginationItems([numPages - 1]));
    }
    return items;
  };

  return (
    <div className="pagination-container">
      <Pagination>
        <PaginationItem disabled={currentPage <= 0}>
          <PaginationLink onClick={goToFirstPage} first />
        </PaginationItem>
        <PaginationItem disabled={currentPage <= 0}>
          <PaginationLink onClick={goToPreviousPage} previous />
        </PaginationItem>
        {numPages > maxFullSize ? shortenedPagination() : fullPagination()}
        <PaginationItem disabled={currentPage === numPages - 1}>
          <PaginationLink onClick={goToNextPage} next />
        </PaginationItem>
        <PaginationItem disabled={currentPage === numPages - 1}>
          <PaginationLink onClick={goToLastPage} last />
        </PaginationItem>
      </Pagination>
    </div>
  );
};

export default PageSelection;
