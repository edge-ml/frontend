import {
  generateTimeSeries,
  processCSV,
  generateDataset
} from '../../services/CsvService';

const fs = require('fs');
const path = require('path');
const singleTestFileTimeSeries = {
  names: ['testName'],
  units: ['testUnit'],
  timeData: [
    [
      [1595506316, 1],
      [1595506317, 2],
      [1595506318, 3],
      [1595506319, 4]
    ]
  ],
  timeSeries: [
    {
      data: [1, 2, 3, 4],
      end: 1595506319,
      name: 'testName',
      offset: 0,
      samplingRate: 1,
      start: 1595506316,
      unit: 'testUnit'
    }
  ]
};

const twoTestFilesTimeSeries = {
  names: ['testName0', 'testName1'],
  units: ['testUnit0', 'testUnit1'],
  timeData: [
    [
      [1595506316, 1],
      [1595506317, 2],
      [1595506318, 3],
      [1595506319, 4]
    ],
    [
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
    ]
  ],
  timeSeries: [
    {
      data: [1, 2, 3, 4],
      end: 1595506319,
      name: 'testName0',
      offset: 0,
      samplingRate: 1,
      start: 1595506316,
      unit: 'testUnit0'
    },
    {
      data: [1, 2, 4, 8, 8, 8, 8, 8, 12, 16],
      end: 1595506325,
      name: 'testName1',
      offset: 0,
      samplingRate: 1,
      start: 1595506316,
      unit: 'testUnit1'
    }
  ]
};

describe.skip('Tests for generateTimeSeries', () => {
  it('Correct data from single file', () => {
    expect(
      generateTimeSeries(
        singleTestFileTimeSeries.timeData,
        singleTestFileTimeSeries.names,
        singleTestFileTimeSeries.units
      )
    ).toEqual(singleTestFileTimeSeries.timeSeries);
  });

  it('Single file with inconsistent sampling rate', () => {
    var modData = { ...singleTestFileTimeSeries };
    modData.timeData[0][0][0] = 1595506315; //Start one time step too early
    expect(
      generateTimeSeries(modData.timeData, modData.names, modData.units).err
    ).not.toEqual(undefined);
  });

  it('Correct data from multiple files', () => {
    expect(
      generateTimeSeries(
        twoTestFilesTimeSeries.timeData,
        twoTestFilesTimeSeries.names,
        twoTestFilesTimeSeries.units
      )
    ).toEqual(twoTestFilesTimeSeries.timeSeries);
  });

  it('2 files, one with inconsistent sampling rate', () => {
    var modData = { ...twoTestFilesTimeSeries };
    modData.timeData[0][0][0] = 2; // Timestamp does not fit to the rest of the data
    expect(
      generateTimeSeries(
        twoTestFilesTimeSeries.timeData,
        twoTestFilesTimeSeries.names,
        twoTestFilesTimeSeries.units
      ).err
    ).not.toEqual(undefined);
  });

  it('2 files, nun numerical number in csv file', () => {
    var modData = { ...twoTestFilesTimeSeries };
    modData.timeData[0][0][0] = 'NoNumber'; // Timestamp does not fit to the rest of the data
    expect(
      generateTimeSeries(
        twoTestFilesTimeSeries.timeData,
        twoTestFilesTimeSeries.names,
        twoTestFilesTimeSeries.units
      ).err
    ).not.toEqual(undefined);
  });
});

describe.skip('ProcessCSV', () => {
  it('success case 1', () => {
    const csv_dataset_1 = path.join(
      __dirname,
      '..',
      'fakeData',
      'testData.csv'
    );
    const file = new File([''], csv_dataset_1);
    console.log(file);
    console.log(fs.readFileSync(csv_dataset_1, 'utf-8'));
    processCSV([file]).then(data => {
      console.log(data);
      expect(data).not.toEqual(undefined);
    });
  });
});

const fakeCSVDataNoHeader = [
  [
    ['1', '1', '1', '1'],
    ['2', '3', '1', '2'],
    ['3', '1', '1', '1'],
    ['4', '1', '1', '5']
  ]
];

const dataSet = [
  {
    start: 1,
    end: 4,
    timeSeries: [
      {
        name: '',
        unit: '',
        start: 1,
        end: 4,
        data: [
          { timestamp: 1, datapoint: 1 },
          { timestamp: 2, datapoint: 3 },
          { timestamp: 3, datapoint: 1 },
          { timestamp: 4, datapoint: 1 }
        ]
      },
      {
        name: '',
        unit: '',
        start: 1,
        end: 4,
        data: [
          { timestamp: 1, datapoint: 1 },
          { timestamp: 2, datapoint: 1 },
          { timestamp: 3, datapoint: 1 },
          { timestamp: 4, datapoint: 1 }
        ]
      },
      {
        name: '',
        unit: '',
        start: 1,
        end: 4,
        data: [
          { timestamp: 1, datapoint: 1 },
          { timestamp: 2, datapoint: 2 },
          { timestamp: 3, datapoint: 1 },
          { timestamp: 4, datapoint: 5 }
        ]
      }
    ]
  }
];

describe('generateDataset', () => {
  it('Get dataset without header', () => {
    const result = generateDataset(fakeCSVDataNoHeader);
    //console.log(util.inspect(result, { showHidden: false, depth: null }))
    expect(result).toEqual(dataSet);
  });

  it('Get dataset with header', () => {
    const timeSeriesObjWithNames = JSON.parse(JSON.stringify(dataSet));
    const fakeCSVDatasetWithHeader = [
      [['time', 'accX', 'accY', 'accZ'], ...fakeCSVDataNoHeader[0]]
    ];
    const result = generateDataset(fakeCSVDatasetWithHeader);
    //console.log(util.inspect(result, { showHidden: false, depth: null }))
    timeSeriesObjWithNames[0].timeSeries[0].name = 'accX';
    timeSeriesObjWithNames[0].timeSeries[1].name = 'accY';
    timeSeriesObjWithNames[0].timeSeries[2].name = 'accZ';
    expect(result).toEqual(timeSeriesObjWithNames);
  });

  it('Missing unix timestamp', () => {
    const invalidCSVData = JSON.parse(JSON.stringify(fakeCSVDataNoHeader));
    invalidCSVData[0][2][0] = '';
    const result = generateDataset(invalidCSVData);
    //console.log(util.inspect(result, { showHidden: false, depth: null }))
    expect(result.error);
  });

  it('Missing value at one point in time for one sensor', () => {
    const csvWithMissingValue = JSON.parse(JSON.stringify(fakeCSVDataNoHeader));
    csvWithMissingValue[0][2][1] = '';
    const result = generateDataset(csvWithMissingValue);
    const expectedResult = dataSet;
    delete expectedResult[0].timeSeries[0].data.splice(2, 1);
    expect(result).toEqual(expectedResult);
  });
});
