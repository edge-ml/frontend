import React, { useMemo } from 'react';
import { Container, Col, Row, Table, Badge, Button, Input } from 'reactstrap';
import { useTable, useSortBy, useRowSelect } from 'react-table';
import SortedTableHeader from '../../components/SortedTableHeader';
import { humanFileSize, toPercentage } from '../../services/helpers';

const percentageCell = ({ value }) => toPercentage(value);

export const ValidationView = ({
  models, // {id: string, name: string, creation_date: number, classifier: string, accuracy: number, precision: number, f1_score: number, size: number}[]
  handleDelete,
  onViewModel = () => {},
  onDeployModel = () => {}
}) => {
  const Checkbox = ({ ...rest }) => {
    return <Input type="checkbox" {...rest} />;
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows
  } = useTable(
    {
      data: models,
      columns: useMemo(
        () => [
          {
            id: 'selection',
            Header: ({ selectedFlatRows }) => (
              <Button
                color="danger"
                outline={true}
                disabled={!selectedFlatRows.length}
                onClick={e => {
                  handleDelete(selectedFlatRows.map(r => r.original.id));
                }}
              >
                Delete
              </Button>
            ),
            Cell: ({ row }) => <Checkbox {...row.getToggleRowSelectedProps()} />
          },
          { Header: 'Name', accessor: 'name', sortType: 'string' },
          { Header: 'ID', accessor: 'id', sortType: 'alphanumeric' },
          {
            Header: 'Creation Date',
            id: 'creation_date',
            accessor: row => new Date(parseInt(row.creation_date) * 1000),
            sortType: 'datetime',
            Cell: ({ value }) => value.toISOString()
          },
          {
            Header: 'Size on Disk',
            accessor: 'size',
            sortType: 'number',
            Cell: ({ value }) => humanFileSize(value)
          },
          { Header: 'Classifier', accessor: 'classifier', sortType: 'string' },
          {
            Header: 'Accuracy',
            accessor: 'accuracy',
            sortType: 'number',
            Cell: percentageCell
          },
          {
            Header: 'Precision',
            accessor: 'precision',
            sortType: 'number',
            Cell: percentageCell
          },
          {
            Header: 'F1-Score',
            accessor: 'f1_score',
            sortType: 'number',
            Cell: percentageCell
          },
          {
            id: 'details-button',
            accessor: row => row.id,
            disableSortBy: true,
            Cell: ({ value }) => (
              <Button
                onClick={() => onViewModel(value)}
                className="btn-secondary mt-0"
                block
              >
                View
              </Button>
            )
          },
          {
            id: 'deploy-button',
            accessor: row => row.id,
            disableSortBy: true,
            Cell: ({ value }) => (
              <Button
                onClick={() => onDeployModel(value)}
                className="btn-secondary mt-0"
                block
              >
                Deploy
              </Button>
            )
          }
        ],
        []
      )
    },
    useSortBy,
    useRowSelect
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
