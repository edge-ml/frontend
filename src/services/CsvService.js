const { rejects } = require('assert');
const { isNumber } = require('./helpers');

module.exports.processCSV = files => {
  return new Promise((resolve, reject) => {
    var timeData = [];
    var i = 0;
    for (i = 0; i < files.length; i++) {
      let file = files[i];
      const reader = new FileReader();
      reader.onload = () => {
        var res = reader.result;
        var allTextLines = res.split(/\r\n|\n/);
        if (allTextLines[allTextLines.length - 1] === '') {
          allTextLines.pop();
        }
        var lines = [];
        for (var i = 0; i < allTextLines.length; i++) {
          var data = allTextLines[i].split(',');
          lines.push(data);
        }
        timeData.push(lines);
        if (timeData.length === files.length) {
          resolve(timeData);
        }
      };
      reader.readAsText(file);
    }
  });
};

module.exports.generateDataset = (timeData, dataset) => {
  try {
    if (!dataset) {
      const datasets = [];
      for (var i = 0; i < timeData.length; i++) {
        datasets.push(generateSingleTimeSeries(timeData[i]));
      }
      return datasets;
    }
  } catch (err) {
    return { error: 'Invalid format' };
  }
};

function generateSingleTimeSeries(timeData) {
  const timeSeries = [];
  const numDatasets = timeData[0].length - 1;
  for (var i = 1; i <= numDatasets; i++) {
    timeSeries.push({
      name: '',
      unit: '',
      end: parseInt(timeData[timeData.length - 1][0], 10),
      start: parseInt(timeData[0][0], 10),
      data: []
    });

    var start = 0;
    if (!isNumber(timeData[0][0])) {
      start = 1;
      timeSeries[i - 1].name = timeData[0][i];
      timeSeries[i - 1].start = parseInt(timeData[1][0], 10);
    }
    for (var j = start; j < timeData.length; j++) {
      if (!isNumber(timeData[j][0])) {
        throw 'Invalid format';
      }
      timeSeries[i - 1].data.push({
        timestamp: parseInt(timeData[j][0], 10),
        datapoint: parseInt(timeData[j][i], 10)
      });
    }
  }
  const result = {
    start: timeSeries[0].start,
    end: parseInt(timeData[timeData.length - 1][0], 10),
    timeSeries: timeSeries
  };
  return result;
}

module.exports.extendExistingDataset = (timeData, dataset) => {
  for (var i = 0; i < timeData.length; i++) {
    const newDataset = generateSingleTimeSeries(timeData[i]);
    if (newDataset.start < dataset.start) {
      dataset.start = newDataset.start;
    }
    if (newDataset.end > dataset.end) {
      dataset.end = newDataset.end;
    }
    dataset.timeSeries.push(...newDataset.timeSeries);
  }
  return dataset;
};
