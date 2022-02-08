import React, { useMemo } from 'react';
import { Container, Col, Row, Table, Badge, Button } from 'reactstrap';
import { useTable, useSortBy } from 'react-table';
import SortedTableHeader from '../../components/SortedTableHeader';

export const ValidationView = ({
  models, // {id: string, name: string, creation_date: number, classifier: string, accuracy: number, precision: number, f1_score: number}[]
  onViewModel = () => {}
}) => {
  const toPercantage = (row, property) =>
    (row[property] * 100).toFixed(2) + '%';
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable(
    {
      data: models,
      columns: useMemo(
        () => [
          { Header: 'Name', accessor: 'name', sortType: 'string' },
          { Header: 'ID', accessor: 'id', sortType: 'alphanumeric' },
          {
            Header: 'Creation Date',
            id: 'creation_date',
            accessor: row => new Date(parseInt(row.creation_date) * 1000),
            sortType: 'datetime',
            Cell: ({ value }) => value.toISOString()
          },
          { Header: 'Classifier', accessor: 'classifier', sortType: 'string' },
          {
            Header: 'Accuracy',
            accessor: row => toPercantage(row, 'accuracy'),
            sortType: 'number'
          },
          {
            Header: 'Precision',
            accessor: row => toPercantage(row, 'precision'),
            sortType: 'number'
          },
          {
            Header: 'f1 Score',
            accessor: row => toPercantage(row, 'f1_score'),
            sortType: 'number'
          },
          {
            id: 'details-button',
            accessor: row => row.id,
            Cell: ({ value }) => (
              <Button
                onClick={() => onViewModel(value)}
                className="btn-secondary mt-0"
                block
              >
                View
              </Button>
            )
          }
        ],
        []
      )
    },
    useSortBy
  );

  return (
    <Container>
      <Row className="mt-3">
        <Col>
          <Table {...getTableProps()} responsive>
            <thead className={'bg-light'}>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column =>
                    column.canSort ? (
                      <SortedTableHeader
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        sorted={
                          column.isSorted
                            ? column.isSortedDesc
                              ? 'desc'
                              : 'asc'
                            : null
                        }
                      >
                        {column.render('Header')}
                      </SortedTableHeader>
                    ) : (
                      <th {...column.getHeaderProps()}>
                        {column.render('Header')}
                      </th>
                    )
                  )}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => {
                      return (
                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};
