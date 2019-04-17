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
      obj.message = `The metadata field ${
        content[0]
      } is defined more than once in the csv.`;
      return obj;
    }

    i++;
  }

  if (!obj.name || !obj.unit || !obj.id) {
    obj.message = 'Name, unit or id metadata missing in the csv.';
    return obj;
  }

  if (lines[i] !== 'time,data') {
    obj.message = 'Must provide both time and data in a data line.';
    return obj;
  } else {
    obj.data = [];
    i++;
  }

  let start = startTime;
  let startLine = i;
  let originalStart;
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

    i++;
  }

  obj.error = false;
  return obj;
};
