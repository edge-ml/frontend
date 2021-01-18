import {
  generateTimeSeries,
  calculateStartEndTimes,
  processCSV
} from '../../services/CsvService';

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
