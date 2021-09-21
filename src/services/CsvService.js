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
  if (!dataset) {
    const datasets = [];
    const labelings = [];
    for (var i = 0; i < timeData.length; i++) {
      dataset = generateSingleTimeSeries(timeData[i]);
      datasets.push(dataset.dataset);
      labelings.push(dataset.labeling);
    }
    return { datasets: datasets, labelings: labelings };
  }
};

function extractTimeSeries(timeData, i) {
  console.log(timeData);
  const timeSeries = {
    name: timeData[0][i].replace('sensor_', '').split('[')[0],
    unit: timeData[0][i].match(/\[(.*)\]/).pop(),
    end: parseInt(timeData[timeData.length - 1][0], 10),
    start: parseInt(timeData[1][0], 10),
    data: []
  };
  for (var j = 1; j < timeData.length; j++) {
    if (isNaN(timeData[j][0])) {
      throw { error: 'Timestamps cannot be missing' };
    }
    if (!isNaN(timeData[j][i])) {
      timeSeries.data.push({
        timestamp: parseInt(timeData[j][0], 10),
        datapoint: parseInt(timeData[j][i], 10)
      });
    }
  }
  return timeSeries;
}

function extractLabel(timeData, i) {
  const labelNames = [];
  const labeling = {
    name: timeData[0][i].replace('label_', '')
  };

  for (var j = 1; j < timeData.length; j++) {
    const label = timeData[j][i];
    if (!labelNames.includes(label) && label !== '') {
      labelNames.push(label);
    }
  }

  const labels = labelNames.map(label => {
    return {
      name: label,
      color: generateRandomColor(),
      isNewLabel: true
    };
  });

  const datasetLabel = {
    name: timeData[0][i].replace('label_', ''),
    labels: []
  };

  for (var j = 1; j < timeData.length; j++) {
    if (timeData[j][i] !== '') {
      var found = timeData[j][i];
      var start = timeData[j][0];
      while (j < timeData.length && found === timeData[j][i]) {
        j++;
      }
      datasetLabel.labels.push({
        start: start,
        end: timeData[j - 1][0],
        name: found
      });
      j--;
    }
  }
  return { datasetLabel: datasetLabel, labeling: labeling, labels: labels };
}

function generateSingleTimeSeries(timeData) {
  try {
    const timeSeries = [];
    const labelings = [];
    const numDatasets = timeData[0].length - 1;
    for (var i = 1; i <= numDatasets; i++) {
      if (timeData[0][i].startsWith('sensor_')) {
        timeSeries.push(extractTimeSeries(timeData, i));
      } else if (timeData[0][i].startsWith('label_')) {
        labelings.push(extractLabel(timeData, i));
      } else {
        return { error: 'Wrong format' };
      }
    }

    const result = {
      start: timeSeries[0].start,
      end: parseInt(timeData[timeData.length - 1][0], 10),
      timeSeries: timeSeries
    };
    return { dataset: result, labeling: labelings };
  } catch (err) {
    return { error: err.error };
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
