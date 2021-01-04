export const parseCSV = (string, startTime, adjustTime) => {
  let obj = { error: true, message: '' };

  let lines = string.split(/\r?\n/);
  if (lines.length < 6) {
    obj.message = 'Must contain at least 1 line of data.';
    return obj;
  }

  let i = 0;
  while (lines[i].startsWith('#')) {
    let line = lines[i].split(/\s+/);
    let content = line[1].split(',');
    if (obj[content[0]] === undefined) {
      obj[content[0]] = content[1];
    } else {
      obj.message = `The metadata field ${content[0]} is defined more than once in the csv.`;
      return obj;
    }

    i++;
  }

  if (!obj.name || !obj.unit || !obj.id) {
    obj.message = 'Name, unit or id metadata missing in the csv.';
    return obj;
  }

  if (lines[i] !== 'time,data' && lines[i] !== 'time,data,labelingId,typeId') {
    obj.message =
      'A data line should contain time, data, labelingId (optional) and typeId (optional).';
    return obj;
  } else {
    obj.data = [];
    obj.labels = [];
    i++;
  }

  let start = startTime;
  let startLine = i;
  let originalStart, currentLabelingId, currentTypeId, labelStart, labelEnd;
  while (i < lines.length - 1) {
    let line = lines[i].split(',');
    if (line.length < 2 || isNaN(line[0]) || isNaN(line[1])) {
      obj.message = 'Must provide valid time and data in a data line.';
      return obj;
    }

    if (i === startLine) {
      originalStart = parseFloat(line[0]);
    }

    if (adjustTime) {
      let time =
        i === startLine ? start : start + (parseFloat(line[0]) - originalStart);
      obj.data.push([time, parseFloat(line[1])]);
    } else {
      obj.data.push([parseFloat(line[0]), parseFloat(line[1])]);
    }

    if (line.length >= 4) {
      let labelingId = line[2];
      let typeId = line[3];

      if (!currentLabelingId || !currentTypeId) {
        if (i === lines.length - 2) {
          obj.message = 'Invalid label provided.';
          return obj;
        }

        currentLabelingId = labelingId;
        currentTypeId = typeId;
        labelStart = obj.data[obj.data.length - 1][0];
      } else if (currentLabelingId !== labelingId || currentTypeId !== typeId) {
        labelEnd = obj.data[obj.data.length - 2][0];

        if (labelStart >= labelEnd) {
          obj.message = 'Invalid label provided.';
          return obj;
        } else {
          obj.labels.push({
            labelingId: currentLabelingId,
            typeId: currentTypeId,
            from: labelStart,
            to: labelEnd
          });

          currentLabelingId = labelingId;
          currentTypeId = typeId;
          labelStart = obj.data[obj.data.length - 1][0];
        }
      } else if (i === lines.length - 2) {
        labelEnd = obj.data[obj.data.length - 1][0];

        if (labelStart >= labelEnd) {
          obj.message = 'Invalid label provided.';
          return obj;
        } else {
          obj.labels.push({
            labelingId: currentLabelingId,
            typeId: currentTypeId,
            from: labelStart,
            to: labelEnd
          });
        }
      }
    } else if (currentLabelingId && currentTypeId && labelStart) {
      labelEnd = obj.data[obj.data.length - 2][0];

      if (labelStart >= labelEnd) {
        obj.message = 'Invalid label provided.';
        return obj;
      } else {
        obj.labels.push({
          labelingId: currentLabelingId,
          typeId: currentTypeId,
          from: labelStart,
          to: labelEnd
        });
      }

      currentLabelingId = currentTypeId = labelStart = labelEnd = undefined;
    }

    i++;
  }

  obj.error = false;
  return obj;
};

export const validateEmail = email => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const getServerTime = () => {
  const ax = require('axios');
  const axios = ax.create();
  return new Promise((resolve, reject) => {
    axios
      .get(window.location.href.toString())
      .then(data => resolve(data.headers.date))
      .catch(err => reject(err));
  });
};
