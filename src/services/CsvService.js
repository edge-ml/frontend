const { isNumber } = require('./helpers');
const { generateRandomColor } = require('./ColorService');
const { addLabeling } = require('./ApiServices/LabelingServices');

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
          var data = allTextLines[i].replace(/\s/g, '').split(',');
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
  const headerErrors = checkHeaders(timeData);
  if (headerErrors.some(elm => elm.length > 0)) {
    return headerErrors;
  }
  const datasets = [];
  const labelings = [];
  const errors = [];
  for (var i = 0; i < timeData.length; i++) {
    dataset = processCSVColumn(timeData[i]);
    if (!Array.isArray(dataset)) {
      datasets.push(dataset.dataset);
      labelings.push(dataset.labeling);
      errors.push([]);
    } else {
      errors.push(dataset);
    }
  }
  if (errors.some(elm => elm.length > 0)) {
    return errors;
  }
  return { datasets: datasets, labelings: labelings };
};

module.exports.generateCSV = (dataset, props_labelings, props_labels) => {
  var csv = 'time,';
  var csv_lines = Object(); // this will be used as a dictionary, with timestamps as keys, and arrays of values as values
  var timestamps = new Set([]); // this variable will hold all timestamps as an ordered array
  var labelings = Object();
  var labelsUsed =
    dataset.labelings && dataset.labelings.some(elm => elm.labels.length > 0);

  dataset.timeSeries.forEach(t => {
    csv += 'sensor_' + t.name + '[' + t.unit + '],';
  });
  if (labelsUsed) {
    dataset.labelings.forEach(l => {
      const labelingName = props_labelings.find(elm => elm._id === l.labelingId)
        .name;
      labelings[l.labelingId] = [];
      l.labels.forEach(label => {
        const labelName = props_labels.find(elm => elm._id === label.type)[
          'name'
        ];
        labelings[l.labelingId].push({
          labelingName: labelingName,
          name: labelName,
          start: Math.round(label.start),
          end: Math.round(label.end)
        });
      });
    });

    var labelHeaderMap = [];
    for (const [labelingId, labels] of Object.entries(labelings)) {
      const labelNames = new Set(labels.map(elm => elm.name));
      labelNames.forEach(elm => {
        labelHeaderMap.push({
          labelingName: labels[0].labelingName,
          labelName: elm
        });
        csv += 'label_' + labels[0].labelingName + '_' + elm + ',';
      });
    }
  }

  csv = csv.slice(0, -1); // remove the single ',' at the end
  csv += '\r\n'; // this concludes the first csv line, now append data

  // collect all timestamp values in a set, and initialize csv_lines to contain empty arrays as values
  dataset.timeSeries.forEach(t => {
    t.data.forEach(d => {
      timestamps.add(d.timestamp);
      csv_lines[d.timestamp] = [];
    });
  });
  timestamps = Array.from(timestamps).sort();

  dataset.timeSeries.forEach(t => {
    var missingTimestamps = new Set(timestamps); // in the end, this array will contain all timestamps, that do not have a value -> ,, in CSV

    t.data.forEach(d => {
      csv_lines[d.timestamp].push(d.datapoint);
      missingTimestamps.delete(d.timestamp); // since it's not missing, delete the timestamp from the missing timestamps
    });

    missingTimestamps.forEach(m => {
      csv_lines[m].push(undefined); // all missing timestamps must result in empty values in the CSV (,,)
    }); // pushing undefined and later doing .join(",") will results in this behaviour
  });

  for (const [timestamp, values] of Object.entries(csv_lines)) {
    csv += timestamp + ',' + values.join(',');
    if (labelsUsed) {
      csv += ','; // when labels are used, they follow the values in a row, hence a colon is needed
      // check for each labeling, if their labels are in the bounds of the current timestamp. If yes, add 'x' for each label to the CSV line, else only add ','
      for (let labelHeader of labelHeaderMap) {
        var onLabel = false;
        for (const [_, labels] of Object.entries(labelings)) {
          for (let l of labels) {
            if (
              labelHeader.labelingName === l.labelingName &&
              labelHeader.labelName === l.name &&
              l.start <= parseInt(timestamp, 10) &&
              parseInt(timestamp, 10) <= l.end
            ) {
              onLabel = true;
              csv += 'x,';
            }
          }
        }
        if (!onLabel) {
          csv += ',';
        }
      }
    }
    csv = csv.slice(0, -1); // remove the single ',' at the end
    csv += '\r\n';
  }
  return csv;
};

function extractTimeSeries(timeData, i) {
  const timeSeries = {
    name: timeData[0][i].replace('sensor_', '').split('[')[0],
    unit: timeData[0][i].match(/\[(.*)\]/).pop(),
    end: parseInt(timeData[timeData.length - 1][0], 10),
    start: parseInt(timeData[1][0], 10),
    data: []
  };
  for (var j = 1; j < timeData.length; j++) {
    if (timeData[j][0] === '') {
      throw { error: `Timestamp missing in row ${j + 1}` };
    }
    if (!isNumber(timeData[j][0])) {
      throw { error: `Timestamp is not a number in row ${j + 1}` };
    }
    if (!isNumber(timeData[j][i])) {
      throw {
        error: `Sensor value is not a number in row ${j + 1}, column ${i + 1}`
      };
    }
    timeSeries.data.push({
      timestamp: parseInt(timeData[j][0], 10),
      datapoint: parseInt(timeData[j][i], 10)
    });
  }
  return timeSeries;
}

function extractLabel(timeData, i) {
  const labelNames = [];

  const labelingName = timeData[0][i].split('_')[1];
  const labelName = timeData[0][i].split('_')[2];

  const labeling = {
    name: labelingName
  };

  const labels = [
    {
      name: labelName,
      color: generateRandomColor(),
      isNewLabel: true
    }
  ];

  const datasetLabel = {
    name: labelingName,
    labels: []
  };

  for (var j = 1; j < timeData.length; j++) {
    if (timeData[j][i] !== '') {
      var start = timeData[j][0];
      while (j < timeData.length && '' !== timeData[j][i]) {
        j++;
      }
      datasetLabel.labels.push({
        start: start,
        end: timeData[j - 1][0],
        name: labelName
      });
      j--;
    }
  }
  return { datasetLabel: datasetLabel, labeling: labeling, labels: labels };
}

function processCSVColumn(timeData) {
  try {
    const timeSeries = [];
    const labelings = [];
    const numDatasets = timeData[0].length - 1;
    for (var i = 1; i <= numDatasets; i++) {
      const csvLength = timeData[0].length;
      const csvLenghError = timeData.findIndex(elm => elm.length !== csvLength);
      if (csvLenghError > 0) {
        throw {
          error: `Each row needs the same number of elements, at line ${csvLenghError +
            1}`
        };
      }
      if (timeData.length < 2) {
        throw { error: 'No data in csv file' };
      }
      if (timeData[0][i].startsWith('sensor_')) {
        timeSeries.push(extractTimeSeries(timeData, i));
      } else if (timeData[0][i].startsWith('label_')) {
        labelings.push(extractLabel(timeData, i));
      } else {
        return { error: 'Wrong format' };
      }
    }

    const uniquelabelingNames = new Set(
      labelings.map(elm => elm.labeling.name)
    );
    const resultingLabelings = [];
    uniquelabelingNames.forEach(labelingName => {
      const labelingToAppend = {
        datasetLabel: { name: labelingName, labels: [] },
        labeling: { name: labelingName },
        labels: []
      };
      labelingToAppend.labels.push(
        ...labelings
          .filter(elm => elm.labeling.name === labelingName)
          .map(data => data.labels)
          .flat(1)
      );
      labelingToAppend.datasetLabel.labels = labelings
        .filter(elm => elm.labeling.name === labelingName)
        .map(data => data.datasetLabel.labels)
        .flat(1);
      resultingLabelings.push(labelingToAppend);
    });

    const result = {
      start: timeSeries[0].start,
      end: parseInt(timeData[timeData.length - 1][0], 10),
      timeSeries: timeSeries
    };
    return { dataset: result, labeling: resultingLabelings };
  } catch (err) {
    return [{ error: err.error }];
  }
}

module.exports.generateLabeledDataset = (
  labelings,
  labels,
  currentLabeling,
  datasets
) => {
  for (var i = 0; i < currentLabeling.length; i++) {
    for (var j = 0; j < currentLabeling[i].length; j++) {
      const datasetLabels = currentLabeling[i][j].datasetLabel.labels;
      const labelName = currentLabeling[i][j].datasetLabel.name;
      const labelIds = labelings.find(elm => elm.name === labelName).labels;
      currentLabeling[i][j].datasetLabel.labelingId = labelings.find(
        elm => elm.name === labelName
      )._id;
      for (var h = 0; h < datasetLabels.length; h++) {
        const labelName = currentLabeling[i][j].datasetLabel.labels[h].name;
        const labelId = labels.find(
          elm => labelName === elm.name && labelIds.includes(elm._id)
        )._id;
        currentLabeling[i][j].datasetLabel.labels[h].type = labelId;
      }
    }
  }
  const newDatasets = [];
  for (var i = 0; i < datasets.length; i++) {
    newDatasets.push({
      ...datasets[i],
      labelings: currentLabeling[i].map(elm => elm.datasetLabel)
    });
  }
  return newDatasets;
};

module.exports.extendExistingDataset = (dataset, newDatasets) => {
  const fusedDataset = dataset;
  for (var i = 0; i < newDatasets.length; i++) {
    fusedDataset.timeSeries.push(...newDatasets[i].timeSeries);
    if (fusedDataset.start > newDatasets[i].start) {
      fusedDataset.start = newDatasets[i].start;
    }
    if (fusedDataset.end < newDatasets[i].end) {
      fusedDataset.end = newDatasets[i].end;
    }
  }
  return fusedDataset;
};

function checkHeaders(timeData) {
  const errors = [];
  for (var i = 0; i < timeData.length; i++) {
    const currentErrors = [];
    const header = timeData[i][0];
    if (header[0] !== 'time') {
      currentErrors.push({ error: "Header must start with 'time'" });
      errors.push(currentErrors);
      continue;
    }
    for (var j = 1; j < header.length; j++) {
      if (
        !/label_.+_.+/gm.test(header[j]) &&
        !/sensor_[^\[\]]+(\[.*\])?/gm.test(header[j])
      ) {
        currentErrors.push({
          error: `Wrong header format: Must start with 'sensor_' or 'label_' in colum ${j +
            1}`
        });
      }
    }
    errors.push(currentErrors);
  }
  return errors;
}

module.exports.checkHeaders = checkHeaders;
