import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import './index.css';

const SortedTableHeader = ({
  children,
  sorted = null, // asc, desc
  ...props
}) => (
  <th {...props} className="sorted_table_header-th">
    {children}
    <span className="float-right sorted_table_header-arrows text-muted">
      {sorted !== 'desc' && (
        <FontAwesomeIcon
          icon={faCaretUp}
          className={sorted === 'asc' ? 'text-dark' : ''}
        />
      )}
      {sorted !== 'asc' && (
        <FontAwesomeIcon
          icon={faCaretDown}
          className={sorted === 'asc' ? 'text-dark' : ''}
        />
      )}
    </span>
  </th>
);

export default SortedTableHeader;
