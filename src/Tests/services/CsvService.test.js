import { generateRandomColor } from '../../services/ColorService';
import {
  processCSV,
  generateDataset,
  generateLabeledDataset,
  checkHeaders
} from '../../services/CsvService';

import { readFakeCsvFile } from '../testUtils';

const path = require('path');
const fs = require('fs');
const util = require('util');

import {
  processedCsvNoLabels,
  proccessedCsvLabels,
  generatedDatasetNoLabels,
  generatedDatasetLabels
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
    generateRandomColor.mockReturnValue('#ff00ff');
    const data = generateDataset(processedCsvNoLabels);
    expect(data).toEqual(generatedDatasetNoLabels);
  });

  it('Success case with labels', () => {
    generateRandomColor.mockReturnValue('#ff00ff');
    const data = generateDataset(proccessedCsvLabels);
    expect(data).toEqual(generatedDatasetLabels);
  });

  it('Missing timestamp with no labels', () => {
    generateRandomColor.mockReturnValue('#ff00ff');
    const resultProcessCsvMissingTimestamp = JSON.parse(
      JSON.stringify(processedCsvNoLabels)
    );
    resultProcessCsvMissingTimestamp[0][2][0] = '';
    const data = generateDataset(resultProcessCsvMissingTimestamp);
    expect(data).toMatchObject([[{ error: 'Timestamp missing in line 2' }]]);
  });

  it('Timestamp is not a number', () => {
    generateRandomColor.mockReturnValue('#ff00ff');
    const resultProcessCsvMissingTimestamp = JSON.parse(
      JSON.stringify(processedCsvNoLabels)
    );
    resultProcessCsvMissingTimestamp[0][2][0] = 'abc';
    const data = generateDataset(resultProcessCsvMissingTimestamp);
    expect(data).toMatchObject([
      [{ error: 'Timestamp is not a number in line 2' }]
    ]);
  });
});

describe('Check for header errors', () => {
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
            "Wrong header format: Must start with 'sensor_' or 'label_' in colum 1"
        }
      ]
    ]);
  });
});

describe.skip('Generate labeled dataset', () => {
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
