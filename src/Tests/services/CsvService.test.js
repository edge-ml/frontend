import { generateRandomColor } from '../../services/ColorService';
import {
  processCSV,
  generateDataset,
  generateLabeledDataset,
  checkHeaders,
  extendExistingDataset
} from '../../services/CsvService';

import { readFakeCsvFile } from '../testUtils';

const path = require('path');
const fs = require('fs');
const util = require('util');

import {
  processedCsvNoLabels,
  proccessedCsvLabels,
  generatedDatasetNoLabels,
  generatedDatasetLabels,
  extractedLabelings,
  extractedLabels,
  currentLabelings,
  currentDatasets,
  labeledDataset
} from '../fakeData/data_csv/processedCSVData';

jest.mock('../../services/ColorService');

const fakeCsvPath = path.join(__dirname, 'data_csv');

describe('Testing function processCSV', () => {
  it('Process with no labels', async () => {
    const file = readFakeCsvFile('noLabels.csv');
    const data = await processCSV([file]);
    expect(data).toEqual(processedCsvNoLabels);
  });

  it('Success case with labels', async () => {
    const file = readFakeCsvFile('full_feature_working.csv');
    const data = await processCSV([file]);
    expect(data).toEqual(proccessedCsvLabels);
  });
});

describe('Generate dataset and labels', () => {
  it('Success case without labels', () => {
    const data = generateDataset(processedCsvNoLabels);
    expect(data).toEqual(generatedDatasetNoLabels);
  });

  it('Success case with labels', () => {
    generateRandomColor.mockReturnValue('#ff00ff');
    const data = generateDataset(proccessedCsvLabels);
    expect(data).toEqual(generatedDatasetLabels);
  });

  it('Missing timestamp', async () => {
    const file = readFakeCsvFile('full_timestampMissing.csv');
    const rawData = await processCSV([file]);
    const data = generateDataset(rawData);
    expect(data).toMatchObject([[{ error: 'Timestamp missing in row 3' }]]);
  });

  it('Timestamp is not a number', async () => {
    const file = readFakeCsvFile('full_timestampNotNumeric.csv');
    const rawData = await processCSV([file]);
    const data = generateDataset(rawData);
    expect(data).toMatchObject([
      [{ error: 'Timestamp is not a number in row 3' }]
    ]);
  });

  it('label header missing', async () => {
    const file = readFakeCsvFile('full_headerMissing.csv');
    const rawData = await processCSV([file]);
    const data = generateDataset(rawData);
    expect(data).toMatchObject([[{ error: "Header must start with 'time'" }]]);
  });

  it('Sensor value is not a number', async () => {
    const file = readFakeCsvFile('full_sensorValue_notNumber.csv');
    const rawData = await processCSV([file]);
    const data = generateDataset(rawData);
    expect(data).toMatchObject([
      [{ error: 'Sensor value is not a number in row 3, column 2' }]
    ]);
  });

  it('Just header not data in csv file', async () => {
    const file = readFakeCsvFile('full_noData_justHeader.csv');
    const rawData = await processCSV([file]);
    const data = generateDataset(rawData);
    expect(data).toMatchObject([[{ error: 'No data in csv file' }]]);
  });

  it('Just data not header in csv file', async () => {
    const file = readFakeCsvFile('full_headerMissing.csv');
    const rawData = await processCSV([file]);
    const data = generateDataset(rawData);
    expect(data).toMatchObject([[{ error: "Header must start with 'time'" }]]);
  });

  it('No header errors', () => {
    const checkResult = checkHeaders(processedCsvNoLabels);
    expect(checkResult).toEqual([[]]);
  });

  it("'time' keyword not present", () => {
    const modifiedCsvNoLabels = JSON.parse(
      JSON.stringify(processedCsvNoLabels)
    );
    modifiedCsvNoLabels[0][0][0] = 'abc';
    const checkResult = checkHeaders(modifiedCsvNoLabels);
    expect(checkResult).toEqual([[{ error: "Header must start with 'time'" }]]);
  });

  it('wrong header prefix', () => {
    const modifiedCsvNoLabels = JSON.parse(
      JSON.stringify(processedCsvNoLabels)
    );
    modifiedCsvNoLabels[0][0][1] = 'wrongprefix_accX';
    const checkResult = checkHeaders(modifiedCsvNoLabels);
    expect(checkResult).toEqual([
      [
        {
          error:
            "Wrong header format: Must start with 'sensor_' or 'label_' in colum 2"
        }
      ]
    ]);
  });
});

describe('Generate labeled dataset', () => {
  it('Success case', () => {
    const resultDataset = generateLabeledDataset(
      extractedLabelings,
      extractedLabels,
      currentLabelings,
      currentDatasets
    );
    expect(resultDataset).toEqual(labeledDataset);
  });
});
