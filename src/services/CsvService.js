module.exports.generateTimeSeries = (timeData, names, units) => {
  var timeSeries = [];
  var i = 0;
  var obj = {};
  var errMsgs = [];
  for (i = 0; i < timeData.length; i++) {
    obj = {
      name: names[i],
      unit: units[i],
      offset: 0,
      start: timeData[i][0][0],
      end: timeData[i][timeData[i].length - 1][0]
    };
    var j = 0;
    var samplingRate = timeData[i][1][0] - timeData[i][0][0];
    var data = [];
    var errFound = false;
    for (j = 0; j < timeData[i].length; j++) {
      if (errFound) {
        break;
      }
      if (isNaN(timeData[i][j][0]) || isNaN(timeData[i][j][1])) {
        errMsgs.push('Only numbers are allowed');
        errFound = true;
        break;
      }
      data.push(timeData[i][j][1]);
      if (
        j !== 0 &&
        timeData[i][j][0] - timeData[i][j - 1][0] !== samplingRate
      ) {
        errMsgs.push('The sampling rate of the dataset is not consistent');
        errFound = true;
        break;
      }
    }
    if (!errFound) {
      errMsgs.push(undefined);
    }
    obj.samplingRate = samplingRate;
    obj.data = data;
    timeSeries.push(obj);
  }
  if (errMsgs.join('') === '') {
    return timeSeries;
  }
  return { err: errMsgs };
};

module.exports.calculateStartEndTimes = timeSeries => {
  var min = timeSeries[0].start;
  var max = timeSeries[0].end;
  return { start: min, end: max };
};

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
          var tarr = [];
          for (var j = 0; j < data.length; j++) {
            tarr.push(parseInt(data[j], 10));
          }
          lines.push(tarr);
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
