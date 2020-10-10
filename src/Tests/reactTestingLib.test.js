import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act
} from '@testing-library/react';

import CreateNewDAtasetModal from '../components/CreateNewDatasetModal/CreateNewDatasetModal';
import { bothCombined, fakeDataset_One } from './fakeData/fakeDatasets';
import {
  processCSV,
  generateTimeSeries,
  calculateStartEndTimes
} from '../services/CsvService';
import { createDataset } from '../services/ApiServices/DatasetServices';

const csv_dataset_1 = __dirname + '/fakeData/fakeDataSets/testData.csv';
const csv_dataset_2 = __dirname + '/fakeData/fakeDataSets/testData2.csv';

jest.mock('../services/CsvService');
jest.mock('../services/ApiServices/DatasetServices');

test('React testing lib test', async () => {
  var f = new File([''], csv_dataset_1);
  const fakeComplete = jest.fn();

  //Generate some fake data according the csv file "testData2.csv"
  var f = new File([''], csv_dataset_2);

  const fakeTimeData = [
    [1595506316, 1],
    [1595506317, 2],
    [1595506318, 4],
    [1595506319, 8],
    [1595506320, 8],
    [1595506321, 8],
    [1595506322, 8],
    [1595506323, 8],
    [1595506324, 12],
    [1595506325, 16]
  ];

  const fakeTimeSeries = [
    {
      data: [1, 2, 4, 8, 8, 8, 8, 8, 12, 16],
      end: 1595506325,
      name: 'n1',
      offset: 0,
      samplingRate: 1,
      start: 1595506316,
      unit: 'u1'
    }
  ];

  //Mock requests for processing the dataset
  processCSV.mockReturnValue(Promise.resolve(fakeTimeData));
  generateTimeSeries.mockReturnValue(fakeTimeSeries);
  calculateStartEndTimes.mockReturnValue({
    start: fakeTimeSeries.start,
    end: fakeTimeSeries.end
  });

  //Mock backend request
  createDataset.mockReturnValue(Promise.resolve(fakeDataset_One));

  render(
    <CreateNewDAtasetModal isOpen={true} onDatasetComplete={fakeComplete} />
  );
  fireEvent.change(screen.getByTestId('fileInput'), { target: { files: [f] } });
  fireEvent.change(screen.getByTestId('nameInput'), {
    target: { value: 'n1' }
  });
  fireEvent.change(screen.getByTestId('unitInput'), {
    target: { value: 'u1' }
  });
  fireEvent.click(screen.getByTestId('uploadButton'));
  await flushPromises();

  //Modal closing
  expect(fakeComplete).toBeCalled();

  //See if correct data is passed the the csv-processor
  expect(generateTimeSeries).toHaveBeenCalledWith(
    fakeTimeData,
    [fakeTimeSeries[0].name],
    [fakeTimeSeries[0].unit]
  );
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
